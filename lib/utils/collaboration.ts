/**
 * Real-time Collaboration System
 * WebSocket-based sync with live cursors and presence
 */

export interface CollaboratorCursor {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  sceneIndex: number;
  lastUpdate: number;
}

export interface CollaboratorPresence {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  status: 'active' | 'idle' | 'away';
  currentScene: number;
  lastActivity: number;
}

export interface CollaborationMessage {
  type: 'cursor' | 'presence' | 'edit' | 'chat' | 'sync' | 'lock' | 'unlock';
  senderId: string;
  timestamp: number;
  payload: any;
}

export interface EditOperation {
  id: string;
  type: 'scene' | 'character' | 'camera' | 'prop' | 'narration';
  action: 'create' | 'update' | 'delete' | 'move';
  targetId: string;
  sceneIndex: number;
  data: any;
  timestamp: number;
}

export interface ResourceLock {
  resourceId: string;
  resourceType: 'scene' | 'character' | 'project';
  lockedBy: string;
  lockedAt: number;
  expiresAt: number;
}

// Collaboration colors for users
const COLLABORATOR_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

/**
 * Collaboration Manager
 */
export class CollaborationManager {
  private ws: WebSocket | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;
  private projectId: string | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private heartbeatInterval: ReturnType<typeof setInterval> | null = null;
  
  // State
  private collaborators: Map<string, CollaboratorPresence> = new Map();
  private cursors: Map<string, CollaboratorCursor> = new Map();
  private locks: Map<string, ResourceLock> = new Map();
  private pendingOperations: EditOperation[] = [];
  
  // Callbacks
  public onCollaboratorJoin: ((collaborator: CollaboratorPresence) => void) | null = null;
  public onCollaboratorLeave: ((collaboratorId: string) => void) | null = null;
  public onCursorMove: ((cursor: CollaboratorCursor) => void) | null = null;
  public onRemoteEdit: ((operation: EditOperation) => void) | null = null;
  public onChatMessage: ((senderId: string, message: string) => void) | null = null;
  public onLockChange: ((lock: ResourceLock, acquired: boolean) => void) | null = null;
  public onConnectionChange: ((connected: boolean) => void) | null = null;
  public onSyncRequired: (() => void) | null = null;

  constructor(userId?: string, userName?: string) {
    this.userId = userId || this.generateUserId();
    this.userName = userName || `User ${this.userId.slice(0, 4)}`;
    this.userColor = COLLABORATOR_COLORS[Math.floor(Math.random() * COLLABORATOR_COLORS.length)];
  }

  /**
   * Connect to collaboration server
   */
  async connect(projectId: string, serverUrl?: string): Promise<boolean> {
    this.projectId = projectId;
    
    const wsUrl = serverUrl || this.getDefaultServerUrl();
    
    return new Promise((resolve) => {
      try {
        this.ws = new WebSocket(`${wsUrl}?projectId=${projectId}&userId=${this.userId}`);
        
        this.ws.onopen = () => {
          console.log('Collaboration connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.sendPresence('active');
          this.onConnectionChange?.(true);
          resolve(true);
        };
        
        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };
        
        this.ws.onclose = () => {
          console.log('Collaboration disconnected');
          this.stopHeartbeat();
          this.onConnectionChange?.(false);
          this.attemptReconnect();
        };
        
        this.ws.onerror = (error) => {
          console.error('Collaboration error:', error);
          resolve(false);
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        resolve(false);
      }
    });
  }

  /**
   * Disconnect from collaboration server
   */
  disconnect(): void {
    this.stopHeartbeat();
    if (this.ws) {
      this.sendPresence('away');
      this.ws.close();
      this.ws = null;
    }
    this.collaborators.clear();
    this.cursors.clear();
    this.locks.clear();
  }

  /**
   * Send cursor position
   */
  sendCursor(x: number, y: number, sceneIndex: number): void {
    this.send({
      type: 'cursor',
      senderId: this.userId,
      timestamp: Date.now(),
      payload: { x, y, sceneIndex },
    });
  }

  /**
   * Send edit operation
   */
  sendEdit(operation: Omit<EditOperation, 'id' | 'timestamp'>): void {
    const fullOperation: EditOperation = {
      ...operation,
      id: `op-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    
    this.pendingOperations.push(fullOperation);
    
    this.send({
      type: 'edit',
      senderId: this.userId,
      timestamp: fullOperation.timestamp,
      payload: fullOperation,
    });
  }

  /**
   * Send chat message
   */
  sendChat(message: string): void {
    this.send({
      type: 'chat',
      senderId: this.userId,
      timestamp: Date.now(),
      payload: { message, userName: this.userName },
    });
  }

  /**
   * Request lock on a resource
   */
  async requestLock(resourceId: string, resourceType: ResourceLock['resourceType']): Promise<boolean> {
    return new Promise((resolve) => {
      const lockRequest = {
        resourceId,
        resourceType,
        lockedBy: this.userId,
        lockedAt: Date.now(),
        expiresAt: Date.now() + 30000, // 30 second lock
      };
      
      this.send({
        type: 'lock',
        senderId: this.userId,
        timestamp: Date.now(),
        payload: lockRequest,
      });
      
      // Wait for response (simplified - in production use proper request/response)
      setTimeout(() => {
        const existingLock = this.locks.get(resourceId);
        resolve(!existingLock || existingLock.lockedBy === this.userId);
      }, 100);
    });
  }

  /**
   * Release lock on a resource
   */
  releaseLock(resourceId: string): void {
    this.send({
      type: 'unlock',
      senderId: this.userId,
      timestamp: Date.now(),
      payload: { resourceId },
    });
    this.locks.delete(resourceId);
  }

  /**
   * Get all collaborators
   */
  getCollaborators(): CollaboratorPresence[] {
    return Array.from(this.collaborators.values());
  }

  /**
   * Get all cursors
   */
  getCursors(): CollaboratorCursor[] {
    return Array.from(this.cursors.values());
  }

  /**
   * Check if resource is locked
   */
  isLocked(resourceId: string): boolean {
    const lock = this.locks.get(resourceId);
    if (!lock) return false;
    if (lock.expiresAt < Date.now()) {
      this.locks.delete(resourceId);
      return false;
    }
    return lock.lockedBy !== this.userId;
  }

  /**
   * Get lock owner
   */
  getLockOwner(resourceId: string): string | null {
    const lock = this.locks.get(resourceId);
    if (!lock || lock.expiresAt < Date.now()) return null;
    return lock.lockedBy;
  }

  // Private methods
  
  private handleMessage(message: CollaborationMessage): void {
    // Ignore own messages
    if (message.senderId === this.userId && message.type !== 'sync') {
      return;
    }

    switch (message.type) {
      case 'cursor':
        this.handleCursorMessage(message);
        break;
      case 'presence':
        this.handlePresenceMessage(message);
        break;
      case 'edit':
        this.handleEditMessage(message);
        break;
      case 'chat':
        this.handleChatMessage(message);
        break;
      case 'lock':
        this.handleLockMessage(message);
        break;
      case 'unlock':
        this.handleUnlockMessage(message);
        break;
      case 'sync':
        this.onSyncRequired?.();
        break;
    }
  }

  private handleCursorMessage(message: CollaborationMessage): void {
    const { x, y, sceneIndex } = message.payload;
    const collaborator = this.collaborators.get(message.senderId);
    
    const cursor: CollaboratorCursor = {
      id: message.senderId,
      name: collaborator?.name || 'Unknown',
      color: collaborator?.color || '#888',
      x,
      y,
      sceneIndex,
      lastUpdate: message.timestamp,
    };
    
    this.cursors.set(message.senderId, cursor);
    this.onCursorMove?.(cursor);
  }

  private handlePresenceMessage(message: CollaborationMessage): void {
    const { name, color, status, currentScene } = message.payload;
    
    const presence: CollaboratorPresence = {
      id: message.senderId,
      name: name || `User ${message.senderId.slice(0, 4)}`,
      color: color || '#888',
      status,
      currentScene: currentScene || 0,
      lastActivity: message.timestamp,
    };
    
    const isNew = !this.collaborators.has(message.senderId);
    this.collaborators.set(message.senderId, presence);
    
    if (isNew && status !== 'away') {
      this.onCollaboratorJoin?.(presence);
    } else if (status === 'away') {
      this.collaborators.delete(message.senderId);
      this.cursors.delete(message.senderId);
      this.onCollaboratorLeave?.(message.senderId);
    }
  }

  private handleEditMessage(message: CollaborationMessage): void {
    const operation = message.payload as EditOperation;
    this.onRemoteEdit?.(operation);
  }

  private handleChatMessage(message: CollaborationMessage): void {
    const { message: text } = message.payload;
    this.onChatMessage?.(message.senderId, text);
  }

  private handleLockMessage(message: CollaborationMessage): void {
    const lock = message.payload as ResourceLock;
    this.locks.set(lock.resourceId, lock);
    this.onLockChange?.(lock, true);
  }

  private handleUnlockMessage(message: CollaborationMessage): void {
    const { resourceId } = message.payload;
    const lock = this.locks.get(resourceId);
    if (lock) {
      this.locks.delete(resourceId);
      this.onLockChange?.(lock, false);
    }
  }

  private send(message: CollaborationMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  private sendPresence(status: CollaboratorPresence['status']): void {
    this.send({
      type: 'presence',
      senderId: this.userId,
      timestamp: Date.now(),
      payload: {
        name: this.userName,
        color: this.userColor,
        status,
        currentScene: 0,
      },
    });
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.sendPresence('active');
    }, 10000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (this.projectId) {
        this.connect(this.projectId);
      }
    }, delay);
  }

  private generateUserId(): string {
    return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDefaultServerUrl(): string {
    const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
    return `${protocol}//${host}/api/collaboration`;
  }
}

// Singleton instance
let collaborationManager: CollaborationManager | null = null;

export function getCollaborationManager(userId?: string, userName?: string): CollaborationManager {
  if (!collaborationManager) {
    collaborationManager = new CollaborationManager(userId, userName);
  }
  return collaborationManager;
}

// React hook for collaboration
import { useState, useEffect, useCallback } from 'react';

export function useCollaboration(projectId: string | null, userName?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [collaborators, setCollaborators] = useState<CollaboratorPresence[]>([]);
  const [cursors, setCursors] = useState<CollaboratorCursor[]>([]);
  
  const manager = getCollaborationManager(undefined, userName);

  useEffect(() => {
    if (!projectId) return;

    manager.onConnectionChange = setIsConnected;
    
    manager.onCollaboratorJoin = (collaborator) => {
      setCollaborators(prev => [...prev.filter(c => c.id !== collaborator.id), collaborator]);
    };
    
    manager.onCollaboratorLeave = (id) => {
      setCollaborators(prev => prev.filter(c => c.id !== id));
      setCursors(prev => prev.filter(c => c.id !== id));
    };
    
    manager.onCursorMove = (cursor) => {
      setCursors(prev => [...prev.filter(c => c.id !== cursor.id), cursor]);
    };

    manager.connect(projectId);

    return () => {
      manager.disconnect();
    };
  }, [projectId]);

  const sendCursor = useCallback((x: number, y: number, sceneIndex: number) => {
    manager.sendCursor(x, y, sceneIndex);
  }, []);

  const sendEdit = useCallback((operation: Omit<EditOperation, 'id' | 'timestamp'>) => {
    manager.sendEdit(operation);
  }, []);

  const sendChat = useCallback((message: string) => {
    manager.sendChat(message);
  }, []);

  return {
    isConnected,
    collaborators,
    cursors,
    sendCursor,
    sendEdit,
    sendChat,
    requestLock: manager.requestLock.bind(manager),
    releaseLock: manager.releaseLock.bind(manager),
    isLocked: manager.isLocked.bind(manager),
  };
}

/**
 * Story Branching System
 * Interactive stories with choices and multiple endings
 */

import { EditableScene } from '@/components/editors/InteractiveSceneEditor';

export interface StoryChoice {
  id: string;
  text: string;
  targetNodeId: string;
  condition?: StoryCondition;
  effects?: StoryEffect[];
}

export interface StoryCondition {
  type: 'variable' | 'visited' | 'choice_made';
  variable?: string;
  operator?: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value?: string | number | boolean;
  nodeId?: string;
  choiceId?: string;
}

export interface StoryEffect {
  type: 'set_variable' | 'increment' | 'decrement' | 'unlock_ending';
  variable?: string;
  value?: string | number | boolean;
  endingId?: string;
}

export interface StoryNode {
  id: string;
  type: 'scene' | 'choice' | 'ending' | 'branch';
  scene?: Partial<EditableScene>;
  choices?: StoryChoice[];
  nextNodeId?: string; // For linear progression
  endingType?: 'good' | 'bad' | 'neutral' | 'secret';
  endingTitle?: string;
  endingDescription?: string;
}

export interface StoryVariable {
  name: string;
  type: 'number' | 'string' | 'boolean';
  defaultValue: number | string | boolean;
  description?: string;
}

export interface BranchingStory {
  id: string;
  title: string;
  description: string;
  startNodeId: string;
  nodes: Map<string, StoryNode>;
  variables: StoryVariable[];
  endings: string[]; // Node IDs of ending nodes
  createdAt: number;
  updatedAt: number;
}

export interface StoryState {
  currentNodeId: string;
  variables: Record<string, number | string | boolean>;
  visitedNodes: Set<string>;
  choicesMade: Map<string, string>; // nodeId -> choiceId
  unlockedEndings: Set<string>;
  history: string[]; // Node IDs in order visited
}

/**
 * Story Branching Engine
 */
export class StoryBranchingEngine {
  private story: BranchingStory | null = null;
  private state: StoryState | null = null;

  // Callbacks
  public onNodeChange: ((node: StoryNode, state: StoryState) => void) | null = null;
  public onChoicePresented: ((choices: StoryChoice[]) => void) | null = null;
  public onEnding: ((node: StoryNode, state: StoryState) => void) | null = null;
  public onVariableChange: ((variable: string, value: any) => void) | null = null;

  /**
   * Load a branching story
   */
  loadStory(story: BranchingStory): void {
    this.story = story;
    this.resetState();
  }

  /**
   * Reset story state to beginning
   */
  resetState(): void {
    if (!this.story) return;

    const variables: Record<string, any> = {};
    for (const v of this.story.variables) {
      variables[v.name] = v.defaultValue;
    }

    this.state = {
      currentNodeId: this.story.startNodeId,
      variables,
      visitedNodes: new Set(),
      choicesMade: new Map(),
      unlockedEndings: new Set(),
      history: [],
    };
  }

  /**
   * Get current node
   */
  getCurrentNode(): StoryNode | null {
    if (!this.story || !this.state) return null;
    return this.story.nodes.get(this.state.currentNodeId) || null;
  }

  /**
   * Get current state
   */
  getState(): StoryState | null {
    return this.state ? { ...this.state } : null;
  }

  /**
   * Advance to next node (for linear progression)
   */
  advance(): StoryNode | null {
    const currentNode = this.getCurrentNode();
    if (!currentNode || !this.state) return null;

    // Mark current node as visited
    this.state.visitedNodes.add(this.state.currentNodeId);
    this.state.history.push(this.state.currentNodeId);

    // Check if this is an ending
    if (currentNode.type === 'ending') {
      this.onEnding?.(currentNode, this.state);
      return currentNode;
    }

    // Check if there are choices
    if (currentNode.type === 'choice' && currentNode.choices) {
      const availableChoices = this.getAvailableChoices(currentNode.choices);
      this.onChoicePresented?.(availableChoices);
      return currentNode;
    }

    // Linear progression
    if (currentNode.nextNodeId) {
      return this.goToNode(currentNode.nextNodeId);
    }

    return null;
  }

  /**
   * Make a choice
   */
  makeChoice(choiceId: string): StoryNode | null {
    const currentNode = this.getCurrentNode();
    if (!currentNode || !this.state || currentNode.type !== 'choice') return null;

    const choice = currentNode.choices?.find(c => c.id === choiceId);
    if (!choice) return null;

    // Check condition
    if (choice.condition && !this.evaluateCondition(choice.condition)) {
      return null;
    }

    // Record choice
    this.state.choicesMade.set(this.state.currentNodeId, choiceId);

    // Apply effects
    if (choice.effects) {
      for (const effect of choice.effects) {
        this.applyEffect(effect);
      }
    }

    // Go to target node
    return this.goToNode(choice.targetNodeId);
  }

  /**
   * Go to a specific node
   */
  goToNode(nodeId: string): StoryNode | null {
    if (!this.story || !this.state) return null;

    const node = this.story.nodes.get(nodeId);
    if (!node) return null;

    this.state.currentNodeId = nodeId;
    this.onNodeChange?.(node, this.state);

    return node;
  }

  /**
   * Go back to previous node
   */
  goBack(): StoryNode | null {
    if (!this.state || this.state.history.length === 0) return null;

    // Remove current from history
    this.state.history.pop();
    
    // Get previous node
    const previousNodeId = this.state.history[this.state.history.length - 1];
    if (!previousNodeId) {
      // Go to start
      return this.goToNode(this.story!.startNodeId);
    }

    return this.goToNode(previousNodeId);
  }

  /**
   * Get variable value
   */
  getVariable(name: string): any {
    return this.state?.variables[name];
  }

  /**
   * Set variable value
   */
  setVariable(name: string, value: any): void {
    if (!this.state) return;
    this.state.variables[name] = value;
    this.onVariableChange?.(name, value);
  }

  /**
   * Check if node has been visited
   */
  hasVisited(nodeId: string): boolean {
    return this.state?.visitedNodes.has(nodeId) || false;
  }

  /**
   * Get available choices (filtered by conditions)
   */
  getAvailableChoices(choices: StoryChoice[]): StoryChoice[] {
    return choices.filter(choice => {
      if (!choice.condition) return true;
      return this.evaluateCondition(choice.condition);
    });
  }

  /**
   * Get all unlocked endings
   */
  getUnlockedEndings(): StoryNode[] {
    if (!this.story || !this.state) return [];
    
    return Array.from(this.state.unlockedEndings)
      .map(id => this.story!.nodes.get(id))
      .filter(Boolean) as StoryNode[];
  }

  /**
   * Get story progress percentage
   */
  getProgress(): number {
    if (!this.story || !this.state) return 0;
    const totalNodes = this.story.nodes.size;
    const visitedNodes = this.state.visitedNodes.size;
    return Math.round((visitedNodes / totalNodes) * 100);
  }

  /**
   * Export state for saving
   */
  exportState(): string | null {
    if (!this.state) return null;
    return JSON.stringify({
      ...this.state,
      visitedNodes: Array.from(this.state.visitedNodes),
      choicesMade: Array.from(this.state.choicesMade.entries()),
      unlockedEndings: Array.from(this.state.unlockedEndings),
    });
  }

  /**
   * Import state from save
   */
  importState(json: string): boolean {
    try {
      const data = JSON.parse(json);
      this.state = {
        ...data,
        visitedNodes: new Set(data.visitedNodes),
        choicesMade: new Map(data.choicesMade),
        unlockedEndings: new Set(data.unlockedEndings),
      };
      return true;
    } catch {
      return false;
    }
  }

  // Private methods

  private evaluateCondition(condition: StoryCondition): boolean {
    if (!this.state) return false;

    switch (condition.type) {
      case 'variable': {
        const value = this.state.variables[condition.variable!];
        const target = condition.value;
        switch (condition.operator) {
          case '==': return value === target;
          case '!=': return value !== target;
          case '>': return (value as number) > (target as number);
          case '<': return (value as number) < (target as number);
          case '>=': return (value as number) >= (target as number);
          case '<=': return (value as number) <= (target as number);
          default: return false;
        }
      }
      case 'visited':
        return this.state.visitedNodes.has(condition.nodeId!);
      case 'choice_made':
        return this.state.choicesMade.get(condition.nodeId!) === condition.choiceId;
      default:
        return false;
    }
  }

  private applyEffect(effect: StoryEffect): void {
    if (!this.state) return;

    switch (effect.type) {
      case 'set_variable':
        this.state.variables[effect.variable!] = effect.value!;
        this.onVariableChange?.(effect.variable!, effect.value);
        break;
      case 'increment':
        this.state.variables[effect.variable!] = 
          (this.state.variables[effect.variable!] as number) + (effect.value as number || 1);
        this.onVariableChange?.(effect.variable!, this.state.variables[effect.variable!]);
        break;
      case 'decrement':
        this.state.variables[effect.variable!] = 
          (this.state.variables[effect.variable!] as number) - (effect.value as number || 1);
        this.onVariableChange?.(effect.variable!, this.state.variables[effect.variable!]);
        break;
      case 'unlock_ending':
        this.state.unlockedEndings.add(effect.endingId!);
        break;
    }
  }
}

/**
 * Create a simple branching story from scenes
 */
export function createBranchingStory(
  title: string,
  scenes: EditableScene[],
  branchPoints: { afterSceneIndex: number; choices: { text: string; goToSceneIndex: number }[] }[]
): BranchingStory {
  const nodes = new Map<string, StoryNode>();
  const endings: string[] = [];

  // Create nodes for each scene
  scenes.forEach((scene, index) => {
    const nodeId = `scene-${index}`;
    const branchPoint = branchPoints.find(bp => bp.afterSceneIndex === index);

    if (branchPoint) {
      // This scene has choices after it
      nodes.set(nodeId, {
        id: nodeId,
        type: 'scene',
        scene,
        nextNodeId: `choice-${index}`,
      });

      // Create choice node
      const choiceNodeId = `choice-${index}`;
      nodes.set(choiceNodeId, {
        id: choiceNodeId,
        type: 'choice',
        choices: branchPoint.choices.map((choice, choiceIndex) => ({
          id: `choice-${index}-${choiceIndex}`,
          text: choice.text,
          targetNodeId: `scene-${choice.goToSceneIndex}`,
        })),
      });
    } else if (index === scenes.length - 1) {
      // Last scene - make it an ending
      const endingId = `ending-${index}`;
      nodes.set(nodeId, {
        id: nodeId,
        type: 'scene',
        scene,
        nextNodeId: endingId,
      });
      nodes.set(endingId, {
        id: endingId,
        type: 'ending',
        endingType: 'good',
        endingTitle: 'The End',
        endingDescription: 'Thanks for watching!',
      });
      endings.push(endingId);
    } else {
      // Regular scene
      nodes.set(nodeId, {
        id: nodeId,
        type: 'scene',
        scene,
        nextNodeId: `scene-${index + 1}`,
      });
    }
  });

  return {
    id: `story-${Date.now()}`,
    title,
    description: '',
    startNodeId: 'scene-0',
    nodes,
    variables: [],
    endings,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Story templates for common branching patterns
 */
export const STORY_BRANCH_TEMPLATES = {
  // Simple A/B choice
  simpleChoice: (
    introScene: Partial<EditableScene>,
    choiceText: string,
    optionA: { text: string; scene: Partial<EditableScene> },
    optionB: { text: string; scene: Partial<EditableScene> }
  ): BranchingStory => {
    const nodes = new Map<string, StoryNode>();
    
    nodes.set('intro', {
      id: 'intro',
      type: 'scene',
      scene: introScene,
      nextNodeId: 'choice',
    });
    
    nodes.set('choice', {
      id: 'choice',
      type: 'choice',
      choices: [
        { id: 'a', text: optionA.text, targetNodeId: 'path-a' },
        { id: 'b', text: optionB.text, targetNodeId: 'path-b' },
      ],
    });
    
    nodes.set('path-a', {
      id: 'path-a',
      type: 'scene',
      scene: optionA.scene,
      nextNodeId: 'ending-a',
    });
    
    nodes.set('path-b', {
      id: 'path-b',
      type: 'scene',
      scene: optionB.scene,
      nextNodeId: 'ending-b',
    });
    
    nodes.set('ending-a', {
      id: 'ending-a',
      type: 'ending',
      endingType: 'good',
      endingTitle: 'Ending A',
    });
    
    nodes.set('ending-b', {
      id: 'ending-b',
      type: 'ending',
      endingType: 'neutral',
      endingTitle: 'Ending B',
    });

    return {
      id: `story-${Date.now()}`,
      title: 'Interactive Story',
      description: 'A story with choices',
      startNodeId: 'intro',
      nodes,
      variables: [],
      endings: ['ending-a', 'ending-b'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },

  // Three-act structure with choices
  threeAct: (): BranchingStory => {
    // Template structure - to be filled with actual scenes
    const nodes = new Map<string, StoryNode>();
    
    // Act 1: Setup
    nodes.set('act1-intro', { id: 'act1-intro', type: 'scene', nextNodeId: 'act1-choice' });
    nodes.set('act1-choice', {
      id: 'act1-choice',
      type: 'choice',
      choices: [
        { id: 'brave', text: 'Be brave', targetNodeId: 'act2-brave' },
        { id: 'careful', text: 'Be careful', targetNodeId: 'act2-careful' },
      ],
    });
    
    // Act 2: Confrontation (two paths)
    nodes.set('act2-brave', { id: 'act2-brave', type: 'scene', nextNodeId: 'act2-brave-choice' });
    nodes.set('act2-careful', { id: 'act2-careful', type: 'scene', nextNodeId: 'act2-careful-choice' });
    
    // Act 3: Resolution
    nodes.set('act3-good', { id: 'act3-good', type: 'scene', nextNodeId: 'ending-good' });
    nodes.set('act3-bad', { id: 'act3-bad', type: 'scene', nextNodeId: 'ending-bad' });
    
    // Endings
    nodes.set('ending-good', { id: 'ending-good', type: 'ending', endingType: 'good', endingTitle: 'Happy Ending' });
    nodes.set('ending-bad', { id: 'ending-bad', type: 'ending', endingType: 'bad', endingTitle: 'Sad Ending' });

    return {
      id: `story-${Date.now()}`,
      title: 'Three Act Story',
      description: 'A story with multiple paths',
      startNodeId: 'act1-intro',
      nodes,
      variables: [
        { name: 'courage', type: 'number', defaultValue: 0, description: 'How brave the character has been' },
      ],
      endings: ['ending-good', 'ending-bad'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  },
};

// Singleton engine
let branchingEngine: StoryBranchingEngine | null = null;

export function getStoryBranchingEngine(): StoryBranchingEngine {
  if (!branchingEngine) {
    branchingEngine = new StoryBranchingEngine();
  }
  return branchingEngine;
}

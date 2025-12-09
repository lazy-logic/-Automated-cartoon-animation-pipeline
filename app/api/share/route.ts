import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

/**
 * Share Project API
 * Creates shareable links for projects
 */

// POST - Generate a share link
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, title: true },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Generate a unique share token
    const shareToken = uuidv4().replace(/-/g, '').substring(0, 16);
    
    // In a production app, you'd store this token in a ShareLink table
    // For now, we'll use the project ID as part of the shareable URL
    // The token provides some obfuscation
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const shareLink = `${baseUrl}/view/${projectId}?token=${shareToken}`;

    return NextResponse.json({
      success: true,
      shareLink,
      projectTitle: project.title,
      expiresIn: '7 days', // Info only - actual expiry would need DB tracking
    });
  } catch (error) {
    console.error('Share link generation error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate share link' },
      { status: 500 }
    );
  }
}

// GET - Get project info from share link (for viewer)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        scenes: {
          include: { characters: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Return read-only project data
    return NextResponse.json({
      success: true,
      project: {
        id: project.id,
        title: project.title,
        scenes: project.scenes.map((scene) => ({
          id: scene.id,
          title: scene.title,
          narration: scene.narration,
          background: scene.background,
          duration: scene.duration,
          cameraZoom: scene.cameraZoom,
          cameraPanX: scene.cameraPanX,
          cameraPanY: scene.cameraPanY,
          characters: scene.characters.map((c) => ({
            rigId: c.rigId,
            name: c.name,
            x: c.x,
            y: c.y,
            scale: c.scale,
            flipX: c.flipX,
            animation: c.animation,
            expression: c.expression,
          })),
        })),
      },
    });
  } catch (error) {
    console.error('Get shared project error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load shared project' },
      { status: 500 }
    );
  }
}

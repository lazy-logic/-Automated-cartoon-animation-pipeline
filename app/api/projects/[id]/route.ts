import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: { id: string };
}

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        scenes: {
          include: { characters: true },
          orderBy: { orderIndex: 'asc' },
        },
        audioTracks: true,
        settings: true,
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error('Load project error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load project' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: RouteParams) {
  try {
    const { id } = params;

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Delete the project (cascade will delete related scenes, characters, audio tracks, settings)
    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete project' }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = params;
    const body = await request.json();

    // Check if project exists
    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      return NextResponse.json({ success: false, error: 'Project not found' }, { status: 404 });
    }

    // Update project metadata only (title, description, cover image)
    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        title: body.title ?? existingProject.title,
        description: body.description ?? existingProject.description,
        coverImage: body.coverImage ?? existingProject.coverImage,
      },
    });

    return NextResponse.json({ success: true, project: updatedProject });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update project' }, { status: 500 });
  }
}

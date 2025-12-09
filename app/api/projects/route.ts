import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

type EditableCharacterPayload = {
  id: string;
  rigId: string;
  name: string;
  x: number;
  y: number;
  scale: number;
  flipX: boolean;
  animation: string;
  expression: string;
  isTalking?: boolean;
  zIndex?: number;
};

type EditableScenePayload = {
  id: string;
  title: string;
  narration: string;
  background: string;
  characters: EditableCharacterPayload[];
  duration: number;
  cameraZoom?: number;
  cameraPanX?: number;
  cameraPanY?: number;
  dialogue?: { speaker: string; text: string }[];
  mood?: string;
};

type SaveProjectPayload = {
  id?: string;
  title: string;
  description?: string;
  coverImage?: string | null;
  storyProvider?: string | null;
  scenes: EditableScenePayload[];
  audioTracks?: {
    id?: string;
    type: 'narration' | 'music' | 'sfx';
    url?: string | null;
    text?: string | null;
    startTime: number;
    duration: number;
    volume: number;
  }[];
  settings?: {
    resolutionWidth: number;
    resolutionHeight: number;
    fps: number;
    defaultSceneDuration: number;
    autoNarration: boolean;
    narratorVoice?: string | null;
  };
};

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        title: true,
        updatedAt: true,
        createdAt: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('List projects error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list projects' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveProjectPayload;

    if (!body.title || !Array.isArray(body.scenes) || body.scenes.length === 0) {
      return NextResponse.json({ success: false, error: 'Project title and scenes are required' }, { status: 400 });
    }

    const scenesData = body.scenes.map((scene, index) => ({
      id: scene.id,
      title: scene.title,
      background: scene.background,
      narration: scene.narration,
      duration: scene.duration,
      cameraZoom: scene.cameraZoom ?? 1,
      cameraPanX: scene.cameraPanX ?? 0,
      cameraPanY: scene.cameraPanY ?? 0,
      orderIndex: index,
      mood: scene.mood,
      dialogueJson: scene.dialogue ? (scene.dialogue as any) : undefined,
      characters: {
        create: scene.characters?.map((char) => ({
          id: char.id,
          rigId: char.rigId,
          name: char.name,
          x: char.x,
          y: char.y,
          scale: char.scale,
          flipX: char.flipX,
          animation: char.animation,
          expression: char.expression,
          isTalking: !!char.isTalking,
          zIndex: char.zIndex ?? 0,
        })) ?? [],
      },
    }));

    const audioTracksData = (body.audioTracks || []).map((track) => ({
      id: track.id,
      type: track.type,
      url: track.url,
      text: track.text,
      startTime: track.startTime,
      duration: track.duration,
      volume: track.volume,
    }));

    const settingsData = body.settings
      ? {
          resolutionWidth: body.settings.resolutionWidth,
          resolutionHeight: body.settings.resolutionHeight,
          fps: body.settings.fps,
          defaultSceneDuration: body.settings.defaultSceneDuration,
          autoNarration: body.settings.autoNarration,
          narratorVoice: body.settings.narratorVoice ?? null,
        }
      : undefined;

    let projectId = body.id;

    if (!projectId) {
      const created = await prisma.project.create({
        data: {
          title: body.title,
          description: body.description,
          coverImage: body.coverImage ?? null,
          storyProvider: body.storyProvider ?? null,
          scenes: { create: scenesData },
          audioTracks: { create: audioTracksData },
          settings: settingsData ? { create: settingsData } : undefined,
        },
        select: { id: true },
      });
      projectId = created.id;
    } else {
      await prisma.$transaction([
        prisma.scene.deleteMany({ where: { projectId } }),
        prisma.audioTrack.deleteMany({ where: { projectId } }),
        prisma.projectSettings.deleteMany({ where: { projectId } }),
        prisma.project.upsert({
          where: { id: projectId },
          update: {
            title: body.title,
            description: body.description,
            coverImage: body.coverImage ?? null,
            storyProvider: body.storyProvider ?? null,
            scenes: { create: scenesData },
            audioTracks: { create: audioTracksData },
            settings: settingsData ? { create: settingsData } : undefined,
          },
          create: {
            id: projectId,
            title: body.title,
            description: body.description,
            coverImage: body.coverImage ?? null,
            storyProvider: body.storyProvider ?? null,
            scenes: { create: scenesData },
            audioTracks: { create: audioTracksData },
            settings: settingsData ? { create: settingsData } : undefined,
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, id: projectId });
  } catch (error) {
    console.error('Save project error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save project' }, { status: 500 });
  }
}

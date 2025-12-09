-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "storyProvider" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scene" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "narration" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "mood" TEXT,
    "cameraZoom" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "cameraPanX" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cameraPanY" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "orderIndex" INTEGER NOT NULL,
    "projectId" TEXT NOT NULL,
    "dialogueJson" JSONB,

    CONSTRAINT "Scene_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL,
    "rigId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "flipX" BOOLEAN NOT NULL DEFAULT false,
    "animation" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "isTalking" BOOLEAN NOT NULL DEFAULT false,
    "zIndex" INTEGER NOT NULL DEFAULT 0,
    "sceneId" TEXT NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AudioTrack" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "text" TEXT,
    "startTime" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "AudioTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectSettings" (
    "id" TEXT NOT NULL,
    "resolutionWidth" INTEGER NOT NULL,
    "resolutionHeight" INTEGER NOT NULL,
    "fps" INTEGER NOT NULL DEFAULT 30,
    "defaultSceneDuration" INTEGER NOT NULL DEFAULT 5000,
    "autoNarration" BOOLEAN NOT NULL DEFAULT false,
    "narratorVoice" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "ProjectSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectSettings_projectId_key" ON "ProjectSettings"("projectId");

-- AddForeignKey
ALTER TABLE "Scene" ADD CONSTRAINT "Scene_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AudioTrack" ADD CONSTRAINT "AudioTrack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectSettings" ADD CONSTRAINT "ProjectSettings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;


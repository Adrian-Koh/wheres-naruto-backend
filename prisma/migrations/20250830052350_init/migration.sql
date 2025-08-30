-- CreateTable
CREATE TABLE "public"."Character" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "x" INTEGER NOT NULL,
    "y" INTEGER NOT NULL,

    CONSTRAINT "Character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."HighScores" (
    "id" SERIAL NOT NULL,
    "playername" TEXT NOT NULL,
    "scoretime" INTEGER NOT NULL,

    CONSTRAINT "HighScores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "public"."Character"("name");

-- CreateIndex
CREATE UNIQUE INDEX "HighScores_playername_key" ON "public"."HighScores"("playername");

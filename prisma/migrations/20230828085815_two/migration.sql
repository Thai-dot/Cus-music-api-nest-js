-- CreateEnum
CREATE TYPE "SONG_TYPE" AS ENUM ('LOFI', 'SYNTHWAVE', 'POP', 'ROCK', 'CLASSIC', 'BOLERO', 'ELECTRIC', 'OTHERS');

-- AlterTable
ALTER TABLE "PlayList" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'user play list name';

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "size" INTEGER,
    "extension" TEXT,
    "type" "SONG_TYPE",
    "playListID" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_playListID_fkey" FOREIGN KEY ("playListID") REFERENCES "PlayList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

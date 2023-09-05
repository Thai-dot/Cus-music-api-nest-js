-- CreateEnum
CREATE TYPE "UserEnum" AS ENUM ('ADMIN', 'NORMAL');

-- CreateEnum
CREATE TYPE "PlayListType" AS ENUM ('CHILL', 'GAMING', 'WORKING', 'SPLEEPING', 'PARTY', 'UNKNOW');

-- CreateEnum
CREATE TYPE "SONG_TYPE" AS ENUM ('LOFI', 'SYNTHWAVE', 'POP', 'ROCK', 'CLASSIC', 'BOLERO', 'ELECTRIC', 'OTHERS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isVerify" BOOLEAN NOT NULL DEFAULT false,
    "firstname" TEXT,
    "lastName" TEXT,
    "role" "UserEnum" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayList" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'user play list name',
    "type" "PlayListType" DEFAULT 'UNKNOW',
    "userID" INTEGER NOT NULL,

    CONSTRAINT "PlayList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,
    "songName" TEXT NOT NULL,
    "songFileName" TEXT NOT NULL,
    "size" DOUBLE PRECISION DEFAULT 0,
    "extension" TEXT,
    "type" "SONG_TYPE" DEFAULT 'OTHERS',
    "imgURL" TEXT DEFAULT '',
    "visibility" BOOLEAN NOT NULL DEFAULT false,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "dislikes" INTEGER NOT NULL DEFAULT 0,
    "listenTimes" INTEGER NOT NULL DEFAULT 0,
    "userID" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayListSong" (
    "playListID" INTEGER NOT NULL,
    "songID" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayListSong_pkey" PRIMARY KEY ("playListID","songID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "PlayList" ADD CONSTRAINT "PlayList_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayListSong" ADD CONSTRAINT "PlayListSong_playListID_fkey" FOREIGN KEY ("playListID") REFERENCES "PlayList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayListSong" ADD CONSTRAINT "PlayListSong_songID_fkey" FOREIGN KEY ("songID") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

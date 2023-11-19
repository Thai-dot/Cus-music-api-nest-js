-- CreateTable
CREATE TABLE "LovedPlayList" (
    "userID" INTEGER NOT NULL,
    "playlistID" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LovedPlayList_pkey" PRIMARY KEY ("userID","playlistID")
);

-- AddForeignKey
ALTER TABLE "LovedPlayList" ADD CONSTRAINT "LovedPlayList_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LovedPlayList" ADD CONSTRAINT "LovedPlayList_playlistID_fkey" FOREIGN KEY ("playlistID") REFERENCES "PlayList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

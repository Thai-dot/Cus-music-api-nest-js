-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_playListID_fkey";

-- AlterTable
ALTER TABLE "PlayList" ALTER COLUMN "type" SET DEFAULT 'UNKNOW';

-- AlterTable
ALTER TABLE "Song" ALTER COLUMN "type" SET DEFAULT 'OTHERS';

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_playListID_fkey" FOREIGN KEY ("playListID") REFERENCES "PlayList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateEnum
CREATE TYPE "UserEnum" AS ENUM ('ADMIN', 'NORMAL');

-- CreateEnum
CREATE TYPE "PlayListType" AS ENUM ('CHILL', 'GMAING', 'WORKING', 'SPLEEPING', 'PARTY', 'UNKNOW');

-- AlterTable
ALTER TABLE "PlayList" ADD COLUMN     "type" "PlayListType";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "UserEnum" NOT NULL DEFAULT 'NORMAL';

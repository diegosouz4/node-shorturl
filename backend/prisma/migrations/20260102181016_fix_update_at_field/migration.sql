/*
  Warnings:

  - You are about to drop the column `updateAp` on the `ShortUrl` table. All the data in the column will be lost.
  - You are about to drop the column `updateAp` on the `ShortUrlLog` table. All the data in the column will be lost.
  - You are about to drop the column `updateAp` on the `User` table. All the data in the column will be lost.
  - Added the required column `updateAt` to the `ShortUrl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `ShortUrlLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updateAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ShortUrl" DROP COLUMN "updateAp",
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ShortUrlLog" DROP COLUMN "updateAp",
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updateAp",
ADD COLUMN     "updateAt" TIMESTAMP(3) NOT NULL;

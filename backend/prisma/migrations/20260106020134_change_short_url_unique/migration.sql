/*
  Warnings:

  - The values [EXPIRATED] on the enum `urlStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `createAt` on the `ShortUrl` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `ShortUrl` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `ShortUrlLog` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `ShortUrlLog` table. All the data in the column will be lost.
  - You are about to drop the column `createAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updateAt` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortUrl]` on the table `ShortUrl` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `ShortUrl` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ShortUrlLog` table without a default value. This is not possible if the table is not empty.
  - Made the column `shortUrlId` on table `ShortUrlLog` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "urlStatus_new" AS ENUM ('ACTIVE', 'UNACTIVE', 'EXPIRED');
ALTER TABLE "public"."ShortUrl" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ShortUrl" ALTER COLUMN "status" TYPE "urlStatus_new" USING ("status"::text::"urlStatus_new");
ALTER TYPE "urlStatus" RENAME TO "urlStatus_old";
ALTER TYPE "urlStatus_new" RENAME TO "urlStatus";
DROP TYPE "public"."urlStatus_old";
ALTER TABLE "ShortUrl" ALTER COLUMN "status" SET DEFAULT 'UNACTIVE';
COMMIT;

-- DropForeignKey
ALTER TABLE "ShortUrlLog" DROP CONSTRAINT "ShortUrlLog_shortUrlId_fkey";

-- AlterTable
ALTER TABLE "ShortUrl" DROP COLUMN "createAt",
DROP COLUMN "updateAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ShortUrlLog" DROP COLUMN "createAt",
DROP COLUMN "updateAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "shortUrlId" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "createAt",
DROP COLUMN "updateAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ShortUrl_shortUrl_key" ON "ShortUrl"("shortUrl");

-- CreateIndex
CREATE INDEX "ShortUrl_userId_createdAt_idx" ON "ShortUrl"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ShortUrlLog_shortUrlId_createdAt_idx" ON "ShortUrlLog"("shortUrlId", "createdAt");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- AddForeignKey
ALTER TABLE "ShortUrlLog" ADD CONSTRAINT "ShortUrlLog_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE CASCADE ON UPDATE CASCADE;

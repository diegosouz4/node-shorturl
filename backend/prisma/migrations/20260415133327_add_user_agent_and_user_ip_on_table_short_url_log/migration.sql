/*
  Warnings:

  - The `status` column on the `ShortUrl` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `ShortUrlLog` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "UrlStatus" AS ENUM ('ACTIVE', 'UNACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'REPLACED', 'FAILED', 'ACCESSED');

-- AlterTable
ALTER TABLE "ShortUrl" DROP COLUMN "status",
ADD COLUMN     "status" "UrlStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "ShortUrlLog" ADD COLUMN     "userAgent" TEXT,
ADD COLUMN     "userIp" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "LogStatus" NOT NULL DEFAULT 'CREATED';

-- DropEnum
DROP TYPE "logsStatus";

-- DropEnum
DROP TYPE "urlStatus";

-- CreateEnum
CREATE TYPE "urlStatus" AS ENUM ('ACTIVE', 'UNACTIVE', 'EXPIRATED');

-- CreateEnum
CREATE TYPE "logsStatus" AS ENUM ('CREATED', 'UPDATED', 'DELETED', 'REPLACED', 'FAILED');

-- CreateTable
CREATE TABLE "ShortUrl" (
    "id" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "shortUrl" TEXT NOT NULL,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "status" "urlStatus" NOT NULL DEFAULT 'UNACTIVE',
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrl_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShortUrlLog" (
    "id" SERIAL NOT NULL,
    "status" "logsStatus" NOT NULL DEFAULT 'CREATED',
    "details" TEXT,
    "shortUrlId" TEXT,
    "createAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updateAp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShortUrlLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ShortUrlLog" ADD CONSTRAINT "ShortUrlLog_shortUrlId_fkey" FOREIGN KEY ("shortUrlId") REFERENCES "ShortUrl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

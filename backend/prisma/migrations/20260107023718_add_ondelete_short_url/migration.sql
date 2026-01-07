-- DropForeignKey
ALTER TABLE "ShortUrl" DROP CONSTRAINT "ShortUrl_userId_fkey";

-- AddForeignKey
ALTER TABLE "ShortUrl" ADD CONSTRAINT "ShortUrl_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

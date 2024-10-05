/*
  Warnings:

  - Added the required column `exp` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iat` to the `refresh_tokens` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TweetType" AS ENUM ('Tweet', 'Retweet', 'Comment', 'QuoteTweet');

-- CreateEnum
CREATE TYPE "TweetAudience" AS ENUM ('Everyone', 'TwitterCircle');

-- DropIndex
DROP INDEX "refresh_tokens_token_key";

-- DropIndex
DROP INDEX "user_id";

-- AlterTable
ALTER TABLE "refresh_tokens" ADD COLUMN     "exp" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "iat" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "tweets" (
    "id" TEXT NOT NULL,
    "type" "TweetType" NOT NULL,
    "audience" "TweetAudience" NOT NULL,
    "content" TEXT NOT NULL,
    "guest_views" INTEGER NOT NULL DEFAULT 0,
    "user_views" INTEGER NOT NULL DEFAULT 0,
    "parent_id" TEXT,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tweets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "refresh_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "email_password_idx" ON "users"("email", "password");

-- CreateIndex
CREATE INDEX "video_status_name_idx" ON "video_statuses"("name");

-- AddForeignKey
ALTER TABLE "tweets" ADD CONSTRAINT "tweets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

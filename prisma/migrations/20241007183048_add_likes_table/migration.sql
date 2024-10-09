/*
  Warnings:

  - A unique constraint covering the columns `[user_id,tweet_id]` on the table `bookmarks` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "likes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tweet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "likes_user_id_tweet_id_key" ON "likes"("user_id", "tweet_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_tweet_id_key" ON "bookmarks"("user_id", "tweet_id");

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "likes" ADD CONSTRAINT "likes_tweet_id_fkey" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

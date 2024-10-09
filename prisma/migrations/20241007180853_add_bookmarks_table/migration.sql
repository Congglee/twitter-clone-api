-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tweet_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_tweet_id_fkey" FOREIGN KEY ("tweet_id") REFERENCES "tweets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

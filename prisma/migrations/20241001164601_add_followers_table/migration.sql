-- CreateTable
CREATE TABLE "followers" (
    "follower_id" TEXT NOT NULL,
    "followed_user_id" TEXT NOT NULL,

    CONSTRAINT "followers_pkey" PRIMARY KEY ("follower_id","followed_user_id")
);

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "followers" ADD CONSTRAINT "followers_followed_user_id_fkey" FOREIGN KEY ("followed_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

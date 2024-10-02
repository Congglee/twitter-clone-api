-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('Image', 'Video', 'HLS');

-- CreateEnum
CREATE TYPE "EncodingStatus" AS ENUM ('Pending', 'Processing', 'Success', 'Failed');

-- CreateTable
CREATE TABLE "video_statuses" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EncodingStatus" NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_statuses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TwitterCircle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "sender_receiver_idx" ON "conversations"("sender_id", "receiver_id");

-- CreateIndex
CREATE UNIQUE INDEX "_TwitterCircle_AB_unique" ON "_TwitterCircle"("A", "B");

-- CreateIndex
CREATE INDEX "_TwitterCircle_B_index" ON "_TwitterCircle"("B");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TwitterCircle" ADD CONSTRAINT "_TwitterCircle_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TwitterCircle" ADD CONSTRAINT "_TwitterCircle_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

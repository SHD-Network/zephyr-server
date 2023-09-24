/*
  Warnings:

  - A unique constraint covering the columns `[keyValue]` on the table `PublicKey` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `keyValue` to the `PublicKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PublicKey" ADD COLUMN     "keyValue" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PublicKey_keyValue_key" ON "PublicKey"("keyValue");

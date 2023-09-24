/*
  Warnings:

  - Changed the type of `keyValue` on the `PublicKey` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PublicKey" DROP COLUMN "keyValue",
ADD COLUMN     "keyValue" BYTEA NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PublicKey_keyValue_key" ON "PublicKey"("keyValue");

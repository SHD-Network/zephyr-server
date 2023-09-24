/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `DefconUpdates` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "DefconUpdates_value_key" ON "DefconUpdates"("value");

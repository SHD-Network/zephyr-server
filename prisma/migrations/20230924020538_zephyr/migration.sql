/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Calendar` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `CalendarEvent` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `CalendarUserPermissions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Wiki" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "contributors" TEXT[],

    CONSTRAINT "Wiki_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Wiki_id_key" ON "Wiki"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Calendar_id_key" ON "Calendar"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarEvent_id_key" ON "CalendarEvent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarUserPermissions_id_key" ON "CalendarUserPermissions"("id");

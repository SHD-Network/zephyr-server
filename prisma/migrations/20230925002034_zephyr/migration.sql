/*
  Warnings:

  - Added the required column `name` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

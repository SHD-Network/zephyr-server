-- CreateTable
CREATE TABLE "DefconLevels" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "DefconLevels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DefconUpdates" (
    "id" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "DefconUpdates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DefconLevels_region_key" ON "DefconLevels"("region");

-- AddForeignKey
ALTER TABLE "DefconUpdates" ADD CONSTRAINT "DefconUpdates_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "DefconLevels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "MaintenanceStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "mode" TEXT NOT NULL DEFAULT 'NORMAL',
    "messageSr" TEXT,
    "messageEn" TEXT,
    "messageRu" TEXT,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "updatedAt" DATETIME NOT NULL,
    "updatedByUser" TEXT
);

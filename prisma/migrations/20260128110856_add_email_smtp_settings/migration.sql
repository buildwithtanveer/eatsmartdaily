/*
  Warnings:

  - Added the required column `updatedAt` to the `sitesettings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ad` MODIFY `location` ENUM('HEADER', 'SIDEBAR', 'IN_ARTICLE', 'FOOTER', 'BELOW_TITLE', 'END_CONTENT') NOT NULL DEFAULT 'SIDEBAR';

-- AlterTable
ALTER TABLE `sitesettings` ADD COLUMN `adsTxt` TEXT NULL,
    ADD COLUMN `googleAdSenseId` VARCHAR(191) NULL,
    ADD COLUMN `smtpSettings` TEXT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

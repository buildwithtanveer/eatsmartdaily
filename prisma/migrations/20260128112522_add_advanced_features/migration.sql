/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `sitesettings` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[previewToken]` on the table `post` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `comment` ADD COLUMN `parentId` INTEGER NULL;

-- AlterTable
ALTER TABLE `post` ADD COLUMN `previewExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `previewToken` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `sitesettings` DROP COLUMN `updatedAt`;

-- CreateTable
CREATE TABLE `postversion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `postId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `excerpt` TEXT NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `changeDescription` TEXT NULL,

    INDEX `PostVersion_postId_idx`(`postId`),
    INDEX `PostVersion_createdAt_idx`(`createdAt`),
    INDEX `PostVersion_createdBy_idx`(`createdBy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `backup` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `filename` VARCHAR(191) NOT NULL,
    `size` BIGINT NOT NULL,
    `type` ENUM('FULL', 'INCREMENTAL', 'POSTS_ONLY', 'DATABASE_ONLY') NOT NULL DEFAULT 'FULL',
    `status` ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `description` TEXT NULL,
    `createdBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `errorMessage` TEXT NULL,

    UNIQUE INDEX `backup_filename_key`(`filename`),
    INDEX `Backup_createdBy_idx`(`createdBy`),
    INDEX `Backup_createdAt_idx`(`createdAt`),
    INDEX `Backup_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Comment_parentId_idx` ON `comment`(`parentId`);

-- CreateIndex
CREATE UNIQUE INDEX `Post_previewToken_key` ON `post`(`previewToken`);

-- CreateIndex
CREATE INDEX `Post_previewToken_idx` ON `post`(`previewToken`);

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `Comment_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postversion` ADD CONSTRAINT `PostVersion_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `postversion` ADD CONSTRAINT `PostVersion_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backup` ADD CONSTRAINT `Backup_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

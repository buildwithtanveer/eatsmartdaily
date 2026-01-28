-- AlterTable
ALTER TABLE `post` ADD COLUMN `excerpt` TEXT NULL,
    ADD COLUMN `faq` JSON NULL,
    ADD COLUMN `featuredImageAlt` VARCHAR(191) NULL,
    ADD COLUMN `shareCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `views` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('DRAFT', 'PUBLISHED', 'SCHEDULED') NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE `sitesettings` ADD COLUMN `ezoicId` VARCHAR(191) NULL,
    ADD COLUMN `footerLogo` VARCHAR(191) NULL,
    ADD COLUMN `googleSearchConsole` VARCHAR(191) NULL,
    ADD COLUMN `headerLogo` VARCHAR(191) NULL,
    ADD COLUMN `logoHeight` INTEGER NOT NULL DEFAULT 40,
    ADD COLUMN `logoSubheading` VARCHAR(191) NULL,
    ADD COLUMN `logoWidth` INTEGER NOT NULL DEFAULT 150,
    ADD COLUMN `useDefaultLogoSize` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('ADMIN', 'EDITOR', 'AUTHOR', 'USER') NOT NULL DEFAULT 'AUTHOR';

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` VARCHAR(191) NOT NULL,
    `resource` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Redirect` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `source` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `type` ENUM('PERMANENT', 'TEMPORARY') NOT NULL DEFAULT 'PERMANENT',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Redirect_source_key`(`source`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_slug_idx` ON `Category`(`slug`);

-- CreateIndex
CREATE INDEX `Comment_status_idx` ON `Comment`(`status`);

-- CreateIndex
CREATE INDEX `Comment_createdAt_idx` ON `Comment`(`createdAt`);

-- CreateIndex
CREATE INDEX `Post_slug_idx` ON `Post`(`slug`);

-- CreateIndex
CREATE INDEX `Post_status_idx` ON `Post`(`status`);

-- CreateIndex
CREATE INDEX `Post_publishedAt_idx` ON `Post`(`publishedAt`);

-- CreateIndex
CREATE INDEX `Post_createdAt_idx` ON `Post`(`createdAt`);

-- CreateIndex
CREATE INDEX `Tag_slug_idx` ON `Tag`(`slug`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);

-- CreateIndex
CREATE INDEX `User_role_idx` ON `User`(`role`);

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `comment` RENAME INDEX `Comment_postId_fkey` TO `Comment_postId_idx`;

-- RenameIndex
ALTER TABLE `post` RENAME INDEX `Post_authorId_fkey` TO `Post_authorId_idx`;

-- RenameIndex
ALTER TABLE `post` RENAME INDEX `Post_categoryId_fkey` TO `Post_categoryId_idx`;

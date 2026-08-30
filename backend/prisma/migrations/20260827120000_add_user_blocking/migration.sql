-- Admin-applied block. Existing rows default to not blocked, so this is safe to
-- run against a live database with users already in it.
ALTER TABLE `users`
    ADD COLUMN `isBlocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `blockedAt` DATETIME(3) NULL;

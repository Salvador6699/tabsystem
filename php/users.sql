-- ─── Tabla de Usuarios (Versión Simplificada) ──────────────────
CREATE TABLE IF NOT EXISTS `users` (
  `id`            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`         VARCHAR(255) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `is_verified`   TINYINT(1) NOT NULL DEFAULT 1,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Modificación de tablas existentes para multi-usuario ──────

ALTER TABLE `brick_types` ADD COLUMN `user_id` INT UNSIGNED DEFAULT NULL;
ALTER TABLE `periods` ADD COLUMN `user_id` INT UNSIGNED DEFAULT NULL;
ALTER TABLE `multipliers` ADD COLUMN `user_id` INT UNSIGNED DEFAULT NULL;
ALTER TABLE `work_entries` ADD COLUMN `user_id` INT UNSIGNED DEFAULT NULL;
ALTER TABLE `global_measurements` ADD COLUMN `user_id` INT UNSIGNED DEFAULT NULL;

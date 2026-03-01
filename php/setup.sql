-- ============================================================
-- TabSystem – Script de creación de la base de datos MySQL
-- Ejecutar una sola vez desde phpMyAdmin o consola MySQL.
-- ============================================================

-- Si no existe, crea la base de datos
CREATE DATABASE IF NOT EXISTS `tabsystem`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `tabsystem`;

-- ─── Tipos de ladrillo ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `brick_types` (
  `id`                   VARCHAR(50)  NOT NULL,
  `name`                 VARCHAR(150) NOT NULL,
  `price_per_square_meter` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `type`                 ENUM('regular','quantity') NOT NULL DEFAULT 'regular',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Períodos ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `periods` (
  `id`         VARCHAR(50)  NOT NULL,
  `name`       VARCHAR(150) NOT NULL,
  `start_date` DATE         NOT NULL,
  `end_date`   DATE         DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Multiplicadores ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `multipliers` (
  `id`          VARCHAR(50)   NOT NULL,
  `name`        VARCHAR(150)  NOT NULL,
  `value`       DECIMAL(10,4) NOT NULL DEFAULT 1,
  `description` TEXT          DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Registros de trabajo ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS `work_entries` (
  `id`                  VARCHAR(50)   NOT NULL,
  `date`                DATE          NOT NULL,
  `brick_type_id`       VARCHAR(50)   NOT NULL,
  `supplement_ids`      TEXT          DEFAULT NULL,   -- JSON array de IDs
  `linear_meters`       DECIMAL(10,4) DEFAULT NULL,
  `height`              DECIMAL(10,4) DEFAULT NULL,
  `square_meters`       DECIMAL(10,4) DEFAULT NULL,
  `quantity`            DECIMAL(10,4) DEFAULT NULL,
  `price_per_unit`      DECIMAL(10,4) DEFAULT NULL,
  `description`         TEXT          DEFAULT NULL,
  `base_earnings`       DECIMAL(10,4) NOT NULL DEFAULT 0,
  `supplement_earnings` DECIMAL(10,4) NOT NULL DEFAULT 0,
  `total_earnings`      DECIMAL(10,4) NOT NULL DEFAULT 0,
  `period_id`           VARCHAR(50)   DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Mediciones globales ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS `global_measurements` (
  `id`          VARCHAR(50) NOT NULL,
  `period_id`   VARCHAR(50) NOT NULL,
  `description` TEXT        DEFAULT NULL,
  `created_at`  DATETIME    NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Registros dentro de mediciones globales ──────────────────
CREATE TABLE IF NOT EXISTS `global_measurement_records` (
  `id`                INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  `measurement_id`    VARCHAR(50)   NOT NULL,
  `brick_type_id`     VARCHAR(50)   NOT NULL,
  `square_meters`     DECIMAL(10,4) NOT NULL DEFAULT 0,
  `earnings`          DECIMAL(10,4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  KEY `idx_measurement_id` (`measurement_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

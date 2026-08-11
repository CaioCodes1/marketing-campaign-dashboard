CREATE DATABASE IF NOT EXISTS marketing_dashboard
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE marketing_dashboard;

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  email         VARCHAR(160) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin', 'manager') NOT NULL DEFAULT 'manager',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(160) NOT NULL,
  contact_email VARCHAR(160),
  contact_phone VARCHAR(30),
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS campaigns (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(160) NOT NULL,
  client_id         INT NOT NULL,
  description       TEXT,
  objective         VARCHAR(160),
  platform          ENUM('instagram','facebook','google_ads','tiktok','linkedin','other') NOT NULL,
  budget            DECIMAL(12,2) NOT NULL DEFAULT 0,
  spent_amount      DECIMAL(12,2) NOT NULL DEFAULT 0,
  start_date        DATE NOT NULL,
  end_date          DATE NOT NULL,
  status            ENUM('planned','active','paused','completed','cancelled') NOT NULL DEFAULT 'planned',
  responsible_id    INT NOT NULL,
  notes             TEXT,
  created_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at        DATETIME NULL,

  CONSTRAINT fk_campaign_client FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_campaign_user   FOREIGN KEY (responsible_id) REFERENCES users(id),
  INDEX idx_campaign_status (status),
  INDEX idx_campaign_dates (start_date, end_date)
);

CREATE TABLE IF NOT EXISTS campaign_history (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id   INT NOT NULL,
  changed_by    INT NOT NULL,
  field_changed VARCHAR(60) NOT NULL,
  old_value     VARCHAR(255),
  new_value     VARCHAR(255),
  changed_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_history_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE,
  CONSTRAINT fk_history_user     FOREIGN KEY (changed_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS campaign_milestones (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  campaign_id    INT NOT NULL,
  label          VARCHAR(160) NOT NULL,
  milestone_date DATE NOT NULL,
  created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_milestone_campaign FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE
);

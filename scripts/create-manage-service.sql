-- manage_service table for services (PostgreSQL)
-- Matches Prisma Service model; run against adsng database
-- Example: psql -h 10.61.230.2 -U ads_infras -d adsng -f scripts/create-manage-service.sql

CREATE TABLE IF NOT EXISTS manage_service (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  disable BOOLEAN NOT NULL DEFAULT false,
  date_create TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  date_last_update TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  project_id INTEGER NOT NULL DEFAULT 1,
  port VARCHAR(100) NOT NULL DEFAULT '7102',
  enable_pressure_test BOOLEAN NOT NULL DEFAULT true,
  docker_label_id INTEGER,
  enable_contrast_test INTEGER NOT NULL DEFAULT 0,
  contrast_test_default_ip VARCHAR(255),
  contrast_test_default_test_ip VARCHAR(255),
  contrast_test_default_docker_name VARCHAR(255),
  contrast_test_default_log_folder VARCHAR(255),
  contrast_test_default_result_port VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS manage_service_project_idx ON manage_service (project_id);
CREATE INDEX IF NOT EXISTS manage_service_disable_idx ON manage_service (disable);

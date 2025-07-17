-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create schemas
CREATE SCHEMA IF NOT EXISTS crm;

-- Set default search path
SET search_path TO crm, public;

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');
CREATE TYPE project_status AS ENUM ('prospect', 'contracted', 'on_site', 'after_service');

-- Initial status code mapping
CREATE TABLE IF NOT EXISTS status_master (
    status_code SMALLINT PRIMARY KEY,
    label_jp VARCHAR(50) NOT NULL,
    label_en VARCHAR(50) NOT NULL,
    category VARCHAR(30) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial status codes
INSERT INTO status_master (status_code, label_jp, label_en, category) VALUES
(10, '発注済', 'Placed', 'order'),
(20, '完了', 'Complete', 'order'),
(30, '確認待ち', 'Awaiting Check', 'order'),
(100, '見込み', 'Prospect', 'project'),
(200, '契約済', 'Contracted', 'project'),
(300, '着工中', 'On Site', 'project'),
(400, 'アフターサービス', 'After Service', 'project')
ON CONFLICT (status_code) DO NOTHING;

-- Grant permissions
GRANT ALL ON SCHEMA crm TO crm_user;
GRANT ALL ON ALL TABLES IN SCHEMA crm TO crm_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA crm TO crm_user;
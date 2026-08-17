-- 1. Table for persistent API Keys & Tiers
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100) NOT NULL,
    key_value VARCHAR(255) UNIQUE NOT NULL,
    rate_limit INT NOT NULL DEFAULT 10,
    window_ms INT NOT NULL DEFAULT 10000,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table for Request Audit Logs & Analytics
CREATE TABLE IF NOT EXISTS request_logs (
    id SERIAL PRIMARY KEY,
    api_key VARCHAR(255) NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index on api_key and timestamp for lightning-fast SQL analytical queries
CREATE INDEX idx_logs_key_time ON request_logs(api_key, timestamp);

-- Insert sample test data
INSERT INTO api_keys (client_name, key_value, rate_limit, window_ms)
VALUES 
    ('Mobile Application', 'dev-key-123', 5, 10000),
    ('Admin Portal', 'admin-key-999', 20, 10000)
ON CONFLICT DO NOTHING;
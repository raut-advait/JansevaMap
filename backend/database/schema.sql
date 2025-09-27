-- JansevaMap - MySQL Database Schema
-- MySQL database structure for citizen complaint management system

-- Create custom ENUM types
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff', 'department_head', 'citizen') DEFAULT 'staff',
    department VARCHAR(50),
    phone VARCHAR(15),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE areas (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    population INTEGER,
    ward_number VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE complaints (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    type ENUM('road', 'water', 'electricity', 'sanitation', 'other') NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    area_id VARCHAR(36),
    contact VARCHAR(15) NOT NULL,
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to VARCHAR(36),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id),
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

CREATE TABLE complaint_updates (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id VARCHAR(36) NOT NULL,
    status ENUM('pending', 'processing', 'resolved', 'rejected') NOT NULL,
    update_text TEXT,
    updated_by VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

CREATE TABLE chatbot_interactions (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(50),
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent VARCHAR(50),
    confidence_score DECIMAL(3, 2),
    response_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feedback (
    id VARCHAR(36) PRIMARY KEY,
    complaint_id VARCHAR(36),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    user_contact VARCHAR(15),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id) REFERENCES complaints(id)
);

CREATE TABLE system_settings (
    id VARCHAR(36) PRIMARY KEY,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_type ON complaints(type);
CREATE INDEX idx_complaints_area ON complaints(area_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_complaint_id ON complaints(complaint_id);

CREATE INDEX idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX idx_complaint_updates_created_at ON complaint_updates(created_at);

CREATE INDEX idx_chatbot_interactions_session_id ON chatbot_interactions(session_id);
CREATE INDEX idx_chatbot_interactions_intent ON chatbot_interactions(intent);
CREATE INDEX idx_chatbot_interactions_created_at ON chatbot_interactions(created_at);

CREATE INDEX idx_areas_name ON areas(name);

-- Insert default admin user (password: admin123)
INSERT INTO users (id, username, email, password_hash, full_name, role, department) VALUES
(UUID(), 'admin', 'admin@jansevamap.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'IT');

-- Insert default system settings
INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES
(UUID(), 'site_name', 'JansevaMap', 'Application name'),
(UUID(), 'site_description', 'Citizen Complaint Management System', 'Application description'),
(UUID(), 'max_complaint_description', '1000', 'Maximum characters for complaint description'),
(UUID(), 'sms_enabled', 'true', 'Enable SMS notifications'),
(UUID(), 'email_enabled', 'true', 'Enable email notifications'),
(UUID(), 'auto_assignment', 'true', 'Enable automatic complaint assignment'),
(UUID(), 'resolution_timeout_hours', '168', 'Default resolution timeout in hours (7 days)');
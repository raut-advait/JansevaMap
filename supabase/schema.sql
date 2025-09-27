-- JansevaMap - MySQL Database Schema
-- Palghar District Citizen Complaint Management System

-- Create database
CREATE DATABASE IF NOT EXISTS jansevamap_palghar;
USE jansevamap_palghar;

-- Set character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Users table for authentication and admin management
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('admin', 'staff', 'department_head', 'citizen') DEFAULT 'citizen',
    department VARCHAR(50) NULL,
    phone VARCHAR(15) NULL,
    district VARCHAR(50) DEFAULT 'Palghar',
    state VARCHAR(50) DEFAULT 'Maharashtra',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Areas table for Palghar District regions
CREATE TABLE areas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    latitude DECIMAL(10, 8) NULL,
    longitude DECIMAL(11, 8) NULL,
    population INT NULL,
    ward_number VARCHAR(20) NULL,
    district VARCHAR(50) DEFAULT 'Palghar',
    state VARCHAR(50) DEFAULT 'Maharashtra',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Complaint categories
CREATE TABLE complaint_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT NULL,
    icon VARCHAR(10) NULL,
    color VARCHAR(7) DEFAULT '#667eea',
    department VARCHAR(100) NULL,
    priority_weight DECIMAL(3,2) DEFAULT 1.0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Main complaints table
CREATE TABLE complaints (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id VARCHAR(20) UNIQUE NOT NULL,
    category_id INT NOT NULL,
    user_id INT NULL,
    type ENUM('road', 'water', 'electricity', 'sanitation', 'drainage', 'street_light', 'traffic', 'other') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    area_id INT NULL,
    contact_number VARCHAR(15) NOT NULL,
    contact_email VARCHAR(100) NULL,
    status ENUM('pending', 'processing', 'resolved', 'rejected') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    assigned_to INT NULL,
    assigned_department VARCHAR(100) NULL,
    resolution_notes TEXT NULL,
    media_files JSON NULL,
    estimated_resolution DATE NULL,
    public_visibility BOOLEAN DEFAULT TRUE,
    upvotes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP NULL,
    
    FOREIGN KEY (category_id) REFERENCES complaint_categories(id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Complaint status history/updates
CREATE TABLE complaint_updates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NOT NULL,
    previous_status ENUM('pending', 'processing', 'resolved', 'rejected') NULL,
    new_status ENUM('pending', 'processing', 'resolved', 'rejected') NOT NULL,
    update_text TEXT NULL,
    updated_by INT NULL,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT NULL,
    head_name VARCHAR(100) NULL,
    contact_email VARCHAR(100) NULL,
    contact_phone VARCHAR(15) NULL,
    office_address TEXT NULL,
    response_time_target INT DEFAULT 24,
    district VARCHAR(50) DEFAULT 'Palghar',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Chatbot interactions for AI support
CREATE TABLE chatbot_interactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    session_id VARCHAR(50) NOT NULL,
    user_message TEXT NOT NULL,
    bot_response TEXT NOT NULL,
    intent VARCHAR(50) NULL,
    confidence_score DECIMAL(3, 2) NULL,
    response_time_ms INT NULL,
    user_ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Feedback and ratings
CREATE TABLE feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    complaint_id INT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NULL,
    user_contact VARCHAR(15) NULL,
    feedback_type ENUM('complaint_resolution', 'service_quality', 'website_experience') DEFAULT 'complaint_resolution',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE SET NULL
);

-- System settings and configuration
CREATE TABLE system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NULL,
    description TEXT NULL,
    data_type ENUM('string', 'integer', 'boolean', 'json') DEFAULT 'string',
    is_public BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Performance metrics and analytics
CREATE TABLE analytics (
    id INT PRIMARY KEY AUTO_INCREMENT,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10, 2) NOT NULL,
    metric_date DATE NOT NULL,
    area_id INT NULL,
    department_id INT NULL,
    additional_data JSON NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    
    UNIQUE KEY unique_metric_date (metric_name, metric_date, area_id, department_id)
);

-- Create indexes for better performance
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_type ON complaints(type);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_area_id ON complaints(area_id);
CREATE INDEX idx_complaints_created_at ON complaints(created_at);
CREATE INDEX idx_complaints_location ON complaints(latitude, longitude);
CREATE INDEX idx_complaints_complaint_id ON complaints(complaint_id);
CREATE INDEX idx_complaints_assigned_to ON complaints(assigned_to);

CREATE INDEX idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX idx_complaint_updates_created_at ON complaint_updates(created_at);

CREATE INDEX idx_chatbot_session_id ON chatbot_interactions(session_id);
CREATE INDEX idx_chatbot_intent ON chatbot_interactions(intent);
CREATE INDEX idx_chatbot_created_at ON chatbot_interactions(created_at);

CREATE INDEX idx_areas_district ON areas(district);
CREATE INDEX idx_areas_location ON areas(latitude, longitude);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_district ON users(district);

-- Create views for common queries
CREATE VIEW complaint_summary AS
SELECT 
    c.id,
    c.complaint_id,
    c.title,
    c.type,
    c.status,
    c.priority,
    c.location,
    c.contact_number,
    a.name as area_name,
    cc.name as category_name,
    cc.department as assigned_department,
    u.full_name as assigned_to_name,
    c.created_at,
    c.resolved_at,
    TIMESTAMPDIFF(HOUR, c.created_at, COALESCE(c.resolved_at, NOW())) as hours_since_created,
    (CASE 
        WHEN c.status = 'resolved' THEN 'Completed'
        WHEN c.status = 'processing' THEN 'In Progress'
        WHEN c.status = 'pending' THEN 'Waiting'
        ELSE 'On Hold'
    END) as status_display
FROM complaints c
LEFT JOIN areas a ON c.area_id = a.id
LEFT JOIN complaint_categories cc ON c.category_id = cc.id
LEFT JOIN users u ON c.assigned_to = u.id;

CREATE VIEW area_performance AS
SELECT 
    a.id,
    a.name as area_name,
    a.population,
    COUNT(c.id) as total_complaints,
    SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints,
    SUM(CASE WHEN c.status = 'pending' THEN 1 ELSE 0 END) as pending_complaints,
    SUM(CASE WHEN c.status = 'processing' THEN 1 ELSE 0 END) as processing_complaints,
    ROUND((SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) as resolution_rate,
    AVG(CASE WHEN c.status = 'resolved' THEN TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at) ELSE NULL END) as avg_resolution_hours
FROM areas a
LEFT JOIN complaints c ON a.id = c.area_id
WHERE a.is_active = TRUE
GROUP BY a.id, a.name, a.population;

CREATE VIEW department_performance AS
SELECT 
    d.name as department_name,
    COUNT(c.id) as total_complaints,
    SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) as resolved_complaints,
    ROUND((SUM(CASE WHEN c.status = 'resolved' THEN 1 ELSE 0 END) / COUNT(c.id)) * 100, 2) as resolution_rate,
    AVG(CASE WHEN c.status = 'resolved' THEN TIMESTAMPDIFF(HOUR, c.created_at, c.resolved_at) ELSE NULL END) as avg_resolution_hours,
    d.response_time_target
FROM departments d
LEFT JOIN complaints c ON d.name = c.assigned_department
WHERE d.is_active = TRUE
GROUP BY d.id, d.name, d.response_time_target;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE GenerateComplaintId(OUT new_id VARCHAR(20))
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE date_part VARCHAR(8);
    DECLARE random_part VARCHAR(4);
    
    SET date_part = DATE_FORMAT(NOW(), '%Y%m%d');
    
    REPEAT
        SET random_part = LPAD(FLOOR(RAND() * 10000), 4, '0');
        SET new_id = CONCAT('PLG', date_part, random_part);
    UNTIL NOT EXISTS (SELECT 1 FROM complaints WHERE complaint_id = new_id)
    END REPEAT;
END //

CREATE PROCEDURE UpdateComplaintStatus(
    IN p_complaint_id VARCHAR(20),
    IN p_new_status ENUM('pending', 'processing', 'resolved', 'rejected'),
    IN p_notes TEXT,
    IN p_user_id INT
)
BEGIN
    DECLARE complaint_internal_id INT;
    DECLARE old_status ENUM('pending', 'processing', 'resolved', 'rejected');
    
    SELECT id, status INTO complaint_internal_id, old_status 
    FROM complaints 
    WHERE complaint_id = p_complaint_id;
    
    IF complaint_internal_id IS NOT NULL THEN
        UPDATE complaints 
        SET status = p_new_status,
            resolution_notes = p_notes,
            updated_at = NOW(),
            resolved_at = CASE WHEN p_new_status = 'resolved' THEN NOW() ELSE resolved_at END
        WHERE id = complaint_internal_id;
        
        INSERT INTO complaint_updates (complaint_id, previous_status, new_status, update_text, updated_by)
        VALUES (complaint_internal_id, old_status, p_new_status, p_notes, p_user_id);
    END IF;
END //

DELIMITER ;

-- Insert default data

-- Insert complaint categories
INSERT INTO complaint_categories (name, description, icon, color, department, priority_weight) VALUES
('Road Issues', 'Potholes, road damage, traffic problems', '🛣️', '#dc2626', 'Public Works Department', 1.5),
('Water Supply', 'Water shortage, pipe leaks, quality issues', '💧', '#2563eb', 'Water Supply Department', 2.0),
('Electricity', 'Power outages, street lighting, electrical issues', '⚡', '#f59e0b', 'Electricity Department', 1.8),
('Sanitation', 'Garbage collection, cleanliness, waste management', '🗑️', '#059669', 'Sanitation Department', 1.3),
('Drainage', 'Waterlogging, drain blockages, sewerage', '🌊', '#7c3aed', 'Public Works Department', 1.7),
('Street Lighting', 'Street lights not working, inadequate lighting', '💡', '#f97316', 'Electricity Department', 1.2),
('Traffic', 'Traffic management, signal issues, congestion', '🚦', '#ef4444', 'Traffic Police', 1.4),
('Other', 'Other civic issues and complaints', '❓', '#6b7280', 'General Administration', 1.0);

-- Insert Palghar District areas
INSERT INTO areas (name, description, latitude, longitude, population, ward_number, district) VALUES
('Palghar City', 'Main city area with railway station and markets', 19.6961, 72.7693, 85000, 'W001', 'Palghar'),
('Vasai East', 'Eastern part of Vasai with residential complexes', 19.4034, 72.8209, 120000, 'W002', 'Palghar'),
('Vasai West', 'Western Vasai area near beaches', 19.3912, 72.8254, 95000, 'W003', 'Palghar'),
('Virar East', 'Eastern Virar with industrial and residential areas', 19.4578, 72.7989, 140000, 'W004', 'Palghar'),
('Virar West', 'Western Virar near station and markets', 19.4559, 72.7971, 160000, 'W005', 'Palghar'),
('Nalasopara East', 'Eastern Nalasopara residential area', 19.4239, 72.7890, 110000, 'W006', 'Palghar'),
('Nalasopara West', 'Western Nalasopara near railway', 19.4156, 72.7823, 100000, 'W007', 'Palghar'),
('Boisar', 'Industrial town in Palghar district', 19.8031, 72.7569, 65000, 'W008', 'Palghar'),
('Dahanu', 'Coastal town known for beaches and agriculture', 19.9703, 72.7344, 75000, 'W009', 'Palghar');

-- Insert departments
INSERT INTO departments (name, description, head_name, contact_email, contact_phone, response_time_target) VALUES
('Public Works Department', 'Roads, drainage, and infrastructure maintenance', 'Rajesh Kumar', 'pwd@palghar.gov.in', '02525-234571', 48),
('Water Supply Department', 'Water distribution and quality management', 'Priya Desai', 'water@palghar.gov.in', '02525-234570', 24),
('Electricity Department', 'Power supply and street lighting', 'Amit Singh', 'electricity@palghar.gov.in', '02525-234568', 12),
('Sanitation Department', 'Waste collection and cleanliness', 'Sunita Patil', 'sanitation@palghar.gov.in', '02525-234569', 24),
('Traffic Police', 'Traffic management and safety', 'Inspector Sharma', 'traffic@palghar.gov.in', '02525-100', 6),
('General Administration', 'Other civic matters and coordination', 'District Collector', 'admin@palghar.gov.in', '02525-234567', 72);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, full_name, role, department, phone) VALUES
('admin', 'admin@palghar.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator', 'admin', 'IT Department', '02525-234567'),
('demo', 'demo@palghar.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Demo User', 'citizen', NULL, '9999999999');

-- Insert system settings
INSERT INTO system_settings (setting_key, setting_value, description, data_type, is_public) VALUES
('site_name', 'JansevaMap Palghar', 'Application name', 'string', TRUE),
('site_description', 'Palghar District Citizen Complaint Management System', 'Application description', 'string', TRUE),
('district_name', 'Palghar', 'District name', 'string', TRUE),
('state_name', 'Maharashtra', 'State name', 'string', TRUE),
('max_complaint_description', '1000', 'Maximum characters for complaint description', 'integer', FALSE),
('sms_enabled', 'true', 'Enable SMS notifications', 'boolean', FALSE),
('email_enabled', 'true', 'Enable email notifications', 'boolean', FALSE),
('auto_assignment', 'true', 'Enable automatic complaint assignment', 'boolean', FALSE),
('resolution_timeout_hours', '168', 'Default resolution timeout in hours (7 days)', 'integer', FALSE),
('public_dashboard', 'true', 'Enable public dashboard visibility', 'boolean', TRUE);

-- Insert sample complaints for Palghar District
CALL GenerateComplaintId(@id1);
INSERT INTO complaints (complaint_id, category_id, type, title, description, location, latitude, longitude, area_id, contact_number, status, priority) VALUES
(@id1, 1, 'road', 'Major Pothole on NH8 Palghar', 'Deep pothole causing vehicle damage near Palghar Railway Station', 'NH8, Near Palghar Railway Station', 19.6961, 72.7693, 1, '9876543210', 'processing', 'high');

CALL GenerateComplaintId(@id2);
INSERT INTO complaints (complaint_id, category_id, type, title, description, location, latitude, longitude, area_id, contact_number, status, priority) VALUES
(@id2, 2, 'water', 'Water Supply Shortage in Vasai East', 'No water supply for 3 days in residential complex', 'Vasai East Residential Complex', 19.4034, 72.8209, 2, '9876543211', 'pending', 'urgent');

CALL GenerateComplaintId(@id3);
INSERT INTO complaints (complaint_id, category_id, type, title, description, location, latitude, longitude, area_id, contact_number, status, priority) VALUES
(@id3, 3, 'electricity', 'Street Light Not Working in Virar', 'Multiple street lights not working affecting safety', 'Virar West Station Road', 19.4559, 72.7971, 5, '9876543212', 'resolved', 'medium');

CALL GenerateComplaintId(@id4);
INSERT INTO complaints (complaint_id, category_id, type, title, description, location, latitude, longitude, area_id, contact_number, status, priority) VALUES
(@id4, 4, 'sanitation', 'Garbage Collection Issue Nalasopara', 'Garbage not collected for a week in residential area', 'Nalasopara East Residential Area', 19.4239, 72.7890, 6, '9876543213', 'processing', 'medium');

CALL GenerateComplaintId(@id5);
INSERT INTO complaints (complaint_id, category_id, type, title, description, location, latitude, longitude, area_id, contact_number, status, priority) VALUES
(@id5, 5, 'drainage', 'Waterlogging in Boisar During Monsoon', 'Severe waterlogging due to blocked drainage', 'Boisar Main Market Area', 19.8031, 72.7569, 8, '9876543214', 'pending', 'high');

-- Add some complaint updates
INSERT INTO complaint_updates (complaint_id, previous_status, new_status, update_text, updated_by) VALUES
(1, 'pending', 'processing', 'Road repair team assigned. Work will begin within 2 days.', 1),
(3, 'pending', 'processing', 'Electrician team dispatched to location.', 1),
(3, 'processing', 'resolved', 'All street lights repaired and tested successfully.', 1),
(4, 'pending', 'processing', 'Sanitation team notified. Additional pickup scheduled.', 1);

-- Create a user for API authentication (if needed)
INSERT INTO users (username, email, password_hash, full_name, role, department) VALUES
('api_user', 'api@palghar.gov.in', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'API Service User', 'staff', 'IT Department');

-- Show database summary
SELECT 'Database Setup Complete!' as message;
SELECT COUNT(*) as total_complaints FROM complaints;
SELECT COUNT(*) as total_areas FROM areas;
SELECT COUNT(*) as total_departments FROM departments;
SELECT COUNT(*) as total_categories FROM complaint_categories;

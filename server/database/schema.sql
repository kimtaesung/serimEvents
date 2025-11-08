-- serimRobo Database Schema
-- MySQL 8.0
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

CREATE DATABASE IF NOT EXISTS serimrobo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE serimrobo;
ALTER DATABASE serimrobo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Sections Table (각 단원 정보)
CREATE TABLE IF NOT EXISTS sections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) DEFAULT '',
    content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    image_url VARCHAR(500),
    images JSON,
    section_order INT NOT NULL DEFAULT 0,
    section_type ENUM('hero', 'featured', 'products', 'content', 'contact') DEFAULT 'content',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (section_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Section Images Table (섹션 이미지들)
CREATE TABLE IF NOT EXISTS section_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_alt VARCHAR(255),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    INDEX idx_section (section_id),
    INDEX idx_order (display_order)
) ENGINE=InnoDB;

-- Contact Links Table (연락처 링크 정보)
CREATE TABLE IF NOT EXISTS contact_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    section_id INT NOT NULL,
    link_type VARCHAR(50) NOT NULL,
    link_url VARCHAR(500) NOT NULL,
    link_text VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE,
    INDEX idx_section (section_id)
) ENGINE=InnoDB;

-- Admin Users Table (관리자 계정)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    last_login TIMESTAMP NULL,
    is_initialized BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB;

-- Site Settings Table (사이트 전역 설정)
CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    setting_type VARCHAR(50) DEFAULT 'text',
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Basic Info Table (기본정보 - 푸터 정보 등)
CREATE TABLE IF NOT EXISTS basic_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    info_key VARCHAR(100) NOT NULL UNIQUE,
    info_value LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    description VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (info_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categories Table (상품 카테고리)
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_index INT NOT NULL UNIQUE,
    category_name VARCHAR(100) NOT NULL,
    description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order (display_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Products Table (상품정보)
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    product_name VARCHAR(255) NOT NULL,
    description LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    price DECIMAL(10, 2) NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_category (category_id),
    INDEX idx_order (display_order),
    INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product Images Table (상품 갤러리 이미지)
CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO admin_users (username, password_hash, email) VALUES 
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin@serimrobo.com')
ON DUPLICATE KEY UPDATE username=username;

-- Insert default site settings
INSERT INTO site_settings (setting_key, setting_value, setting_type, description) VALUES 
('site_title', 'serimRobo', 'text', 'Site title'),
('site_description', 'React + TypeScript Solution', 'text', 'Site description'),
('contact_email', 'storm566@hotmail.com', 'email', 'Contact email'),
('contact_phone', '', 'text', 'Contact phone number'),
('business_hours', 'Monday-Friday: 9:00am - 10:00pm, Saturday: 9:00am - 6:00pm, Sunday: 9:00am - 12:00pm', 'textarea', 'Business hours'),
('location', 'Gwanak-gu 11 KR', 'text', 'Business location')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Insert default basic info (푸터 정보)
-- Note: Use Admin UI to add basic info data with proper UTF-8 encoding
-- INSERT INTO basic_info (info_key, info_value, description) VALUES 
-- ('company-info', 'SERIM ROBO는 최고의 로봇 기술을 제공합니다.', 'Company name and tagline'),
-- ('company-info-description', '최고의 로봇 기술로 미래를 만들어갑니다.', 'Company description'),
-- ('customer-support', '고객 지원', 'Customer support title'),
-- ('customer-support-list', '자주 묻는 질문, 배송 안내, 반품/교환', 'Customer support items'),
-- ('contact', '연락처', 'Contact title'),
-- ('contact-description', '이메일: support@serimrobo.com, 전화: 1588-0000', 'Contact information');

-- Insert sample sections
-- Note: Use API to add sections data with proper UTF-8 encoding
-- INSERT INTO sections (title, content, section_order, section_type, image_url) VALUES 
-- ('React + TypeScript Solution', 'Latest web technology implemented site', 1, 'hero', '/uploads/hero-image.jpg'),
-- ('Best web application', 'We provide solutions based on React and TypeScript.', 2, 'content', '/uploads/service1.jpg');

-- Insert sample contact links
-- Note: Use API to add contact links data
-- INSERT INTO contact_links (section_id, link_type, link_url, link_text, icon, display_order) VALUES 
-- (1, 'email', 'mailto:storm566@hotmail.com', 'Email us', 'email', 1);

-- Inquiries Table (문의 정보)
CREATE TABLE IF NOT EXISTS inquiries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL,
    manager_name VARCHAR(100) NOT NULL,
    manager_address VARCHAR(255),
    table_number INT,
    product_type VARCHAR(100),
    consultation_contents LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    has_agreement BOOLEAN DEFAULT FALSE,
    status ENUM('pending', 'reviewed', 'completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mail Log Table (메일 발송 기록 및 IP 관리)
CREATE TABLE IF NOT EXISTS mail_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_ip VARCHAR(45) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    content LONGTEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_at TIMESTAMP NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_sender_ip (sender_ip),
    INDEX idx_recipient (recipient_email),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create tables if they do not exist
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    refreshTokenHash CHAR(64)
);

CREATE TABLE IF NOT EXISTS vacations (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    paid_days INT DEFAULT 0,
    unpaid_days INT DEFAULT 0,
    compensation NUMERIC DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending'
);

-- Add several users
INSERT INTO users (name, email, role, password)
VALUES 
('Alice', 'alice@example.com', 'employee', 'pass123'),
('Bob', 'bob@example.com', 'manager', 'pass123'),
('Charlie', 'charlie@example.com', 'employee', 'pass123');

-- Add several vacations
INSERT INTO vacations (user_id, start_date, end_date, paid_days, unpaid_days, compensation, status)
VALUES
(1, '2025-06-01', '2025-06-05', 5, 0, 1500, 'approved'),
(1, '2025-07-10', '2025-07-12', 3, 0, 900, 'pending'),
(2, '2025-08-01', '2025-08-03', 3, 0, 900, 'approved');

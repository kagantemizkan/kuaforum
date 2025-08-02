-- Hair Salon Ecosystem Database Initialization
-- This script creates the initial database structure

-- Create database if it doesn't exist
SELECT 'CREATE DATABASE hair_salon_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'hair_salon_db')\gexec

-- Create user if it doesn't exist
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'hair_salon_user') THEN

      CREATE ROLE hair_salon_user LOGIN PASSWORD 'hair_salon_password';
   END IF;
END
$do$;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE hair_salon_db TO hair_salon_user;

-- Connect to the database
\c hair_salon_db;

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO hair_salon_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO hair_salon_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO hair_salon_user;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create initial indexes for better performance
-- Note: Prisma will create the actual tables via migrations
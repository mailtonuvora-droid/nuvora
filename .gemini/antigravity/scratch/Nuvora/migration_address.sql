-- Run this command in your Supabase SQL Editor to add address columns to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pincode text;

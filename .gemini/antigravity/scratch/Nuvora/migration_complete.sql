-- ============================================
-- NUVORA DATABASE MIGRATIONS
-- Run this entire script in Supabase SQL Editor
-- ============================================

-- Migration 1: Add Address Fields to Users Table
-- This allows users to save their shipping address
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS pincode text;

-- Migration 2: Add GST and Platform Fee to Products Table
-- This adds support for product-level GST percentage and platform fee
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN products.gst_percentage IS 'GST tax percentage applied to this product (e.g., 5, 12, 18, 28)';
COMMENT ON COLUMN products.platform_fee IS 'Platform fee in rupees applied per unit of this product';

-- Migration 3: Add GST and Platform Fee Tracking to Orders Table
-- This stores the calculated tax amounts for each order
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(10,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN orders.gst_amount IS 'Total GST amount for this order';
COMMENT ON COLUMN orders.platform_fee_amount IS 'Total platform fee for this order';

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- After running this script:
-- 1. Users can save their address
-- 2. Products can have GST percentage and platform fee
-- 3. Orders will track GST and platform fee amounts
-- ============================================

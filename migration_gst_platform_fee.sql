-- Migration: Add GST and Platform Fee to Products Table
-- This adds support for product-level GST percentage and platform fee

-- Add GST percentage column (stores percentage like 5.00, 12.00, 18.00, 28.00)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5,2) DEFAULT 0;

-- Add platform fee column (stores fixed fee amount in rupees)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS platform_fee DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN products.gst_percentage IS 'GST tax percentage applied to this product (e.g., 5, 12, 18, 28)';
COMMENT ON COLUMN products.platform_fee IS 'Platform fee in rupees applied per unit of this product';

-- Optional: Add GST and platform fee tracking to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS gst_amount DECIMAL(10,2) DEFAULT 0;

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS platform_fee_amount DECIMAL(10,2) DEFAULT 0;

COMMENT ON COLUMN orders.gst_amount IS 'Total GST amount for this order';
COMMENT ON COLUMN orders.platform_fee_amount IS 'Total platform fee for this order';

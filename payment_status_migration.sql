-- Add payment_status column to orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending';

-- Add comment for documentation
COMMENT ON COLUMN orders.payment_status IS 'Payment status of the order (e.g., pending, paid, failed, refunded)';

-- Add discount column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0;

-- Add comment to explain the discount column
COMMENT ON COLUMN products.discount IS 'Discount percentage (0-100)';
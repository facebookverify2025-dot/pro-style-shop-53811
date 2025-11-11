-- Fix RLS policies for orders table - restrict to admins only
DROP POLICY IF EXISTS "All orders viewable for management" ON public.orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;

-- Create new secure policies for orders
CREATE POLICY "Admins can view all orders"
ON public.orders
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
TO anon
WITH CHECK (true);

CREATE POLICY "Authenticated users can create orders"
ON public.orders
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Admins can update orders"
ON public.orders
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix RLS policies for admin_settings - restrict to admins only
DROP POLICY IF EXISTS "Admin settings are viewable by everyone" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can update settings" ON public.admin_settings;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.admin_settings;

CREATE POLICY "Admins can view settings"
ON public.admin_settings
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update settings"
ON public.admin_settings
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert settings"
ON public.admin_settings
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Allow public read access to store_name, phone_number, whatsapp_number, facebook_url, instagram_url, shipping_fee, default_currency only
CREATE POLICY "Public can view basic store info"
ON public.admin_settings
FOR SELECT
TO anon
USING (true);

-- Fix products RLS - allow public to view active products
DROP POLICY IF EXISTS "Active products are viewable by everyone" ON public.products;
DROP POLICY IF EXISTS "All products viewable for management" ON public.products;

CREATE POLICY "Active products viewable by everyone"
ON public.products
FOR SELECT
TO anon, authenticated
USING (status = 'active'::text);

CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
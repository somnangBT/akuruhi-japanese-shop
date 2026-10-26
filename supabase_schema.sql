-- ========================================================
-- AKURUHI JAPANESE SHOP - SUPABASE DATABASE & STORAGE SETUP
-- Run this script in your Supabase Project -> SQL Editor
-- ========================================================

-- 1. Create the products table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    name_jp TEXT,
    name_khmer TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    unit TEXT,
    brand TEXT,
    description TEXT,
    image_url TEXT,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    storage_temp TEXT DEFAULT 'Frozen',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- 3. Set policies to allow public reading and store management
DROP POLICY IF EXISTS "Allow public read access to products" ON public.products;
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert to products" ON public.products;
CREATE POLICY "Allow public insert to products"
ON public.products FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to products" ON public.products;
CREATE POLICY "Allow public update to products"
ON public.products FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow public delete to products" ON public.products;
CREATE POLICY "Allow public delete to products"
ON public.products FOR DELETE
USING (true);

-- 4. Enable Public Storage Bucket for Images ('shop-images')
INSERT INTO storage.buckets (id, name, public)
VALUES ('shop-images', 'shop-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Storage Access Policies
DROP POLICY IF EXISTS "Public Access for shop-images" ON storage.objects;
CREATE POLICY "Public Access for shop-images"
ON storage.objects FOR SELECT
USING (bucket_id = 'shop-images');

DROP POLICY IF EXISTS "Allow upload to shop-images" ON storage.objects;
CREATE POLICY "Allow upload to shop-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'shop-images');

DROP POLICY IF EXISTS "Allow update to shop-images" ON storage.objects;
CREATE POLICY "Allow update to shop-images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'shop-images');

DROP POLICY IF EXISTS "Allow delete to shop-images" ON storage.objects;
CREATE POLICY "Allow delete to shop-images"
ON storage.objects FOR DELETE
USING (bucket_id = 'shop-images');

-- ========================================================
-- 6. USERS & REGISTRATION TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    login_identifier TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',
    address TEXT,
    telegram TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    total_orders NUMERIC DEFAULT 0,
    total_spent NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to users" ON public.users;
CREATE POLICY "Allow public read access to users"
ON public.users FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Allow public insert to users" ON public.users;
CREATE POLICY "Allow public insert to users"
ON public.users FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update to users" ON public.users;
CREATE POLICY "Allow public update to users"
ON public.users FOR UPDATE
USING (true);

DROP POLICY IF EXISTS "Allow public delete to users" ON public.users;
CREATE POLICY "Allow public delete to users"
ON public.users FOR DELETE
USING (true);

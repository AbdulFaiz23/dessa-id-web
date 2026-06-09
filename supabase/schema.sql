-- supabase/schema.sql

-- 1. Create custom ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'seller', 'investor');
CREATE TYPE document_type AS ENUM ('SHM', 'SHGB', 'AJB', 'Girik');
CREATE TYPE listing_status AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'REJECTED', 'SOLD');
CREATE TYPE plan_type AS ENUM ('MONTHLY', 'YEARLY', 'FREE_TRIAL');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- 2. Create tables
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'investor',
    full_name TEXT NOT NULL,
    whatsapp_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    price BIGINT NOT NULL,
    area_sqm INTEGER NOT NULL,
    document document_type NOT NULL,
    lat DOUBLE PRECISION,
    lng DOUBLE PRECISION,
    status listing_status NOT NULL DEFAULT 'DRAFT',
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan plan_type NOT NULL,
    status subscription_status NOT NULL DEFAULT 'ACTIVE',
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Row Level Security (RLS) Policies

-- Users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Listings table
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published listings" ON listings FOR SELECT USING (status = 'PUBLISHED');
CREATE POLICY "Sellers can view their own listings" ON listings FOR SELECT USING (auth.uid() = seller_id);
CREATE POLICY "Sellers can insert their own listings" ON listings FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Sellers can update their own listings" ON listings FOR UPDATE USING (auth.uid() = seller_id);

-- Subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sellers can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = seller_id);

-- 4. Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('lahan-photos', 'lahan-photos', true);

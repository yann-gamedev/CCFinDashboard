-- ============================================================
-- CCFin Dashboard - Supabase Database Setup
-- ============================================================
-- Run this SQL in your Supabase Dashboard -> SQL Editor
-- This creates the user_data table and sets up Row Level Security
-- so each user can only access their own data.
-- ============================================================

-- 1. Drop existing table (and its policies/triggers) then recreate
DROP TABLE IF EXISTS public.user_data CASCADE;

CREATE TABLE public.user_data (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    transactions JSONB DEFAULT '[]'::jsonb,
    budgets JSONB DEFAULT '[]'::jsonb,
    recurring JSONB DEFAULT '[]'::jsonb,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- Each user can only have one row
    CONSTRAINT user_data_user_id_unique UNIQUE (user_id)
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_data ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing policies (safe to run multiple times)
DROP POLICY IF EXISTS "Users can view own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can insert own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can update own data" ON public.user_data;
DROP POLICY IF EXISTS "Users can delete own data" ON public.user_data;

-- 4. Create RLS policies - each user can only access their own data
CREATE POLICY "Users can view own data"
    ON public.user_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own data"
    ON public.user_data FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own data"
    ON public.user_data FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own data"
    ON public.user_data FOR DELETE
    USING (auth.uid() = user_id);

-- 5. Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_data_user_id ON public.user_data(user_id);

-- 6. Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_data_updated ON public.user_data;
CREATE TRIGGER on_user_data_updated
    BEFORE UPDATE ON public.user_data
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Auto-create user_data row when a new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_data (user_id, transactions, budgets, recurring, settings)
    VALUES (
        NEW.id,
        '[]'::jsonb,
        '[]'::jsonb,
        '[]'::jsonb,
        jsonb_build_object(
            'username', COALESCE(NEW.raw_user_meta_data->>'username', ''),
            'currency', 'IDR',
            'language', 'id',
            'defaultCategory', '',
            'accentColor', '#3b82f6'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- DONE! Your database is ready.
-- 
-- IMPORTANT: Also go to Authentication -> Settings and:
--   1. Disable "Enable email confirmations" (for easier dev testing)
--      OR keep it enabled for production
--   2. Set your Site URL to your frontend URL
-- ============================================================

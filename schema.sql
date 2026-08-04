-- ============================================================
-- JobProfit Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  business_name TEXT,
  phone TEXT,
  default_hourly_rate NUMERIC(10,2),
  payment_instructions TEXT,
  logo_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'business_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- JOBS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  job_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT,
  client_email TEXT,
  job_address TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  bid_amount NUMERIC(12,2),
  status TEXT NOT NULL DEFAULT 'in_progress' 
    CHECK (status IN ('in_progress', 'completed', 'invoiced', 'paid')),
  notes TEXT,
  invoice_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own jobs" 
  ON jobs FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jobs" 
  ON jobs FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own jobs" 
  ON jobs FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own jobs" 
  ON jobs FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================
-- MATERIALS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'ea',
  unit_cost NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own materials" 
  ON materials FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own materials" 
  ON materials FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own materials" 
  ON materials FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own materials" 
  ON materials FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================
-- LABOR ENTRIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS labor_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  worker_name TEXT NOT NULL,
  hours NUMERIC(10,2) NOT NULL,
  hourly_rate NUMERIC(10,2) NOT NULL,
  total_cost NUMERIC(12,2) NOT NULL,
  work_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE labor_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own labor entries" 
  ON labor_entries FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own labor entries" 
  ON labor_entries FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own labor entries" 
  ON labor_entries FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own labor entries" 
  ON labor_entries FOR DELETE 
  USING (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKET FOR LOGOS
-- ============================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload own logos" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view own logos" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own logos" 
  ON storage.objects FOR UPDATE 
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete own logos" 
  ON storage.objects FOR DELETE 
  USING (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

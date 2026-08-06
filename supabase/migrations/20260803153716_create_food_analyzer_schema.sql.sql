/*
# Food Label Analyzer — Core Schema

## Overview
Creates the database foundation for an AI-Powered Food Label Analyzer where users scan
food products (barcode or nutrition label), receive AI-powered health analysis, and track
their dietary intake over time.

## New Tables
1. `profiles` — User health preferences and profile info linked to auth.users
   - `id` uuid PK → auth.users(id) ON DELETE CASCADE
   - `full_name` text
   - `health_goals` text[] (e.g. ['diabetic','weight_loss'])
   - `allergies` text[] (e.g. ['milk','peanut'])
   - `is_admin` boolean (controlled server-side, NOT user-editable)
   - `daily_calorie_goal` int default 2000

2. `scans` — Every food scan a user performs
   - `id` uuid PK
   - `user_id` uuid → auth.users(id) ON DELETE CASCADE
   - `barcode` text (nullable — label-only scans have no barcode)
   - `product_name` text
   - `brand` text
   - `category` text
   - `image_url` text (front-of-pack image URL from OFF or upload)
   - `nutrition` jsonb (calories, protein, fat, sugar, fiber, sodium, etc. per serving)
   - `ingredients` text[] (parsed ingredient list)
   - `allergens` text[] (detected allergens)
   - `additives` text[] (detected additives/preservatives)
   - `health_score` int (0-100)
   - `food_grade` text (A+, A, B, C, D, F)
   - `ingredient_analysis` jsonb (per-ingredient safety classification + explanation)
   - `recommendations` jsonb (per-goal suitability)
   - `is_favorite` boolean default false
   - `scanned_at` timestamptz default now()

3. `water_intake` — Daily water consumption tracking
   - `id` uuid PK
   - `user_id` uuid → auth.users(id) ON DELETE CASCADE
   - `amount_ml` int (milliliters consumed in this entry)
   - `logged_at` timestamptz default now()

## Security (RLS)
- `profiles`: each user reads/updates ONLY their own profile. is_admin is never writable by client.
- `scans`: each authenticated user has full CRUD on their own scans only.
- `water_intake`: each authenticated user has full CRUD on their own entries only.
- No anon access — this app requires sign-in.
*/

-- =============================================================
-- profiles
-- =============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  health_goals text[] DEFAULT '{}',
  allergies text[] DEFAULT '{}',
  is_admin boolean NOT NULL DEFAULT false,
  daily_calorie_goal int NOT NULL DEFAULT 2000,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- =============================================================
-- scans
-- =============================================================
CREATE TABLE IF NOT EXISTS scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  barcode text,
  product_name text NOT NULL DEFAULT 'Unknown Product',
  brand text DEFAULT '',
  category text DEFAULT '',
  image_url text DEFAULT '',
  nutrition jsonb NOT NULL DEFAULT '{}'::jsonb,
  ingredients text[] DEFAULT '{}',
  allergens text[] DEFAULT '{}',
  additives text[] DEFAULT '{}',
  health_score int NOT NULL DEFAULT 50,
  food_grade text NOT NULL DEFAULT 'C',
  ingredient_analysis jsonb DEFAULT '[]'::jsonb,
  recommendations jsonb DEFAULT '{}'::jsonb,
  is_favorite boolean NOT NULL DEFAULT false,
  scanned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE scans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_scans" ON scans;
CREATE POLICY "select_own_scans" ON scans FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_scans" ON scans;
CREATE POLICY "insert_own_scans" ON scans FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_scans" ON scans;
CREATE POLICY "update_own_scans" ON scans FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_scans" ON scans;
CREATE POLICY "delete_own_scans" ON scans FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Index for common queries: user's scans ordered by date, and favorites
CREATE INDEX IF NOT EXISTS scans_user_date_idx ON scans (user_id, scanned_at DESC);
CREATE INDEX IF NOT EXISTS scans_user_fav_idx ON scans (user_id) WHERE is_favorite = true;
CREATE INDEX IF NOT EXISTS scans_barcode_idx ON scans (barcode) WHERE barcode IS NOT NULL;

-- =============================================================
-- water_intake
-- =============================================================
CREATE TABLE IF NOT EXISTS water_intake (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_ml int NOT NULL CHECK (amount_ml > 0 AND amount_ml <= 5000),
  logged_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE water_intake ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_water" ON water_intake;
CREATE POLICY "select_own_water" ON water_intake FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_water" ON water_intake;
CREATE POLICY "insert_own_water" ON water_intake FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_water" ON water_intake;
CREATE POLICY "update_own_water" ON water_intake FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_water" ON water_intake;
CREATE POLICY "delete_own_water" ON water_intake FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS water_user_date_idx ON water_intake (user_id, logged_at DESC);

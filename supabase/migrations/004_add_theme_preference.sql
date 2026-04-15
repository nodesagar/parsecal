-- Add theme_preference to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'system';

-- Update existing profiles to have the default value
UPDATE profiles SET theme_preference = 'system' WHERE theme_preference IS NULL;

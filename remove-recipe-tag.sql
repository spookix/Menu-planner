-- Migration: remove deprecated recipe type/tag
-- Run this in Supabase SQL editor

ALTER TABLE recipes DROP COLUMN IF EXISTS tag;
DROP INDEX IF EXISTS idx_recipes_tag;


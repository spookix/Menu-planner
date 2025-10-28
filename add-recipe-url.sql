-- Migration: add recipe_url field to recipes
ALTER TABLE recipes ADD COLUMN IF NOT EXISTS recipe_url TEXT;


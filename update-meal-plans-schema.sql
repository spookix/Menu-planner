-- Script pour mettre Ã  jour la structure de la table meal_plans
-- Ã€ exécuter dans l'éditeur SQL de Supabase

-- Supprimer l'ancienne contrainte unique
ALTER TABLE meal_plans DROP CONSTRAINT IF EXISTS meal_plans_user_id_day_meal_type_key;

-- Supprimer l'ancienne colonne day
ALTER TABLE meal_plans DROP COLUMN IF EXISTS day;

-- Ajouter la nouvelle colonne date
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS date DATE;

-- Ajouter la nouvelle contrainte unique
ALTER TABLE meal_plans ADD CONSTRAINT meal_plans_user_id_date_meal_type_key 
  UNIQUE (user_id, date, meal_type);

-- Mettre Ã  jour les données existantes (si nécessaire)
-- Cette partie dépend de vos données existantes
-- UPDATE meal_plans SET date = CURRENT_DATE WHERE date IS NULL;

-- Ajouter un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_date ON meal_plans(user_id, date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_date ON meal_plans(date);



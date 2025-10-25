-- Script pour corriger l'erreur d'inscription
-- À exécuter dans l'éditeur SQL de Supabase

-- Supprimer les politiques existantes pour user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Recréer les politiques avec les bonnes conditions
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Vérifier que RLS est activé
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

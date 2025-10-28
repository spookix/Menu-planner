-- Script de création des tables pour l'application Menu Planner
-- Ã€ exécuter dans l'éditeur SQL de Supabase

-- 1. Table des recettes
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  img TEXT,
  time INTEGER,
  difficulty TEXT CHECK (difficulty IN ('Facile', 'Moyen', 'Difficile')),
  kcal INTEGER,
  protein INTEGER,
  carb INTEGER,
  fat INTEGER,
  ingredients TEXT[],
  vegetarian BOOLEAN DEFAULT false,
  recipe_url TEXT,
  favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table des plans de repas
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date, meal_type)
);

-- 3. Table des articles de courses
CREATE TABLE grocery_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  section TEXT NOT NULL DEFAULT 'Général',
  done BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Table des utilisateurs (extension du profil auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Table des favoris
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

-- 6. Table des historiques de repas
CREATE TABLE meal_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('lunch', 'dinner')),
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
);

-- Index pour améliorer les performances
-- removed: idx_recipes_tag (type removed)
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_vegetarian ON recipes(vegetarian);
CREATE INDEX idx_recipes_favorite ON recipes(favorite);
CREATE INDEX idx_meal_plans_user_day ON meal_plans(user_id, day);
CREATE INDEX idx_grocery_items_user_section ON grocery_items(user_id, section);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_meal_history_user_date ON meal_history(user_id, consumed_at);

-- Fonction pour mettre Ã  jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Politiques RLS (Row Level Security)
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_history ENABLE ROW LEVEL SECURITY;

-- Politiques pour recipes (lecture publique, écriture pour les utilisateurs connectés)
CREATE POLICY "Recipes are viewable by everyone" ON recipes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert recipes" ON recipes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (auth.role() = 'authenticated');

-- Politiques pour meal_plans (accÃ¨s uniquement Ã  l'utilisateur propriétaire)
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour grocery_items (accÃ¨s uniquement Ã  l'utilisateur propriétaire)
CREATE POLICY "Users can view own grocery items" ON grocery_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grocery items" ON grocery_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grocery items" ON grocery_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grocery items" ON grocery_items
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour user_profiles (accÃ¨s uniquement Ã  l'utilisateur propriétaire)
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politiques pour favorites (accÃ¨s uniquement Ã  l'utilisateur propriétaire)
CREATE POLICY "Users can view own favorites" ON favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Politiques pour meal_history (accÃ¨s uniquement Ã  l'utilisateur propriétaire)
CREATE POLICY "Users can view own meal history" ON meal_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal history" ON meal_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meal history" ON meal_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal history" ON meal_history
  FOR DELETE USING (auth.uid() = user_id);

-- Données d'exemple pour les recettes
INSERT INTO recipes (title, subtitle, difficulty, time, kcal, protein, carb, fat, ingredients, vegetarian) VALUES
('Salade Quinoa Méditerranéenne','Une salade fraîche et nutritive pour l\'été','Facile',30,450,15,50,20,ARRAY['1 tasse quinoa','2 tasses d\'eau','1 concombre','1 poivron rouge','olives Kalamata','feta'],true),
('Toast Avocat aux épices','Un petit-déjeuner sain et savoureux','Facile',15,320,8,25,22,ARRAY['2 tranches pain complet','1 avocat mûr','épices tout bagel','sel','poivre'],true),
('Soupe de Lentilles','Une soupe réconfortante','Facile',45,380,18,45,12,ARRAY['lentilles','oignon','carottes','ail','bouillon de légumes'],true);

-- Commentaires sur les tables
COMMENT ON TABLE recipes IS 'Table des recettes de cuisine';
COMMENT ON TABLE meal_plans IS 'Table des plans de repas des utilisateurs';
COMMENT ON TABLE grocery_items IS 'Table des articles de courses';
COMMENT ON TABLE user_profiles IS 'Profils étendus des utilisateurs';
COMMENT ON TABLE favorites IS 'Table des recettes favorites des utilisateurs';
COMMENT ON TABLE meal_history IS 'Historique des repas consommés';




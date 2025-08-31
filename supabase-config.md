# 🔧 Configuration Supabase

## 📋 **Variables d'environnement**

Créez un fichier `.env` à la racine de votre projet avec ces variables :

```bash
# Variables d'environnement Supabase
SUPABASE_URL=https://efrjpocadsjqxzitnihr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVmcmpwb2NhZHNqcXh6aXRuaWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY1MDA2NDEsImV4cCI6MjA3MjA3NjY0MX0.uSUOa3lFgnE7Ln-mH5FwregaGFLPpfmYo4svhHSJsb8

# Configuration de l'application
APP_NAME="Menu Planner"
APP_DESCRIPTION="Planificateur de repas intelligent et moderne"
APP_VERSION="1.0.0"

# Configuration de l'environnement
NODE_ENV=development
NUXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🚀 **Déploiement rapide**

### 1. Installer les dépendances
```bash
npm install @supabase/supabase-js
npm install
```

### 2. Exécuter le script SQL
- Copiez le contenu de `supabase-schema.sql`
- Exécutez-le dans l'éditeur SQL de Supabase

### 3. Tester l'application
```bash
npm run dev
```

### 4. Déployer
```bash
npm run build
# Suivez les instructions dans DEPLOYMENT.md
```

## 🔒 **Sécurité**

- Toutes les tables ont des politiques RLS activées
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les recettes sont publiques en lecture seule
- L'authentification est gérée par Supabase Auth

## 📊 **Structure de la base de données**

- **recipes** : Recettes de cuisine
- **meal_plans** : Plans de repas des utilisateurs
- **grocery_items** : Articles de courses
- **user_profiles** : Profils utilisateurs étendus
- **favorites** : Recettes favorites
- **meal_history** : Historique des repas

## 🌐 **URLs importantes**

- **Dashboard Supabase** : https://app.supabase.com/project/efrjpocadsjqxzitnihr
- **API Docs** : https://efrjpocadsjqxzitnihr.supabase.co/docs
- **Table Editor** : https://app.supabase.com/project/efrjpocadsjqxzitnihr/editor
- **SQL Editor** : https://app.supabase.com/project/efrjpocadsjqxzitnihr/sql

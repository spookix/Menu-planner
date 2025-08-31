# 🍽️ Menu Planner

Une application moderne de planification de repas construite avec Nuxt.js, Vuetify et Supabase.

## ✨ Fonctionnalités

- 🔐 **Authentification complète** avec Supabase Auth
- 📚 **Gestion des recettes** - Création, édition, recherche et filtrage
- 📅 **Planificateur de repas** - Organisation de la semaine
- 🛒 **Liste de courses** - Génération automatique depuis les plans
- 📊 **Historique** - Suivi des habitudes alimentaires
- 🌍 **Interface en français** - Expérience utilisateur localisée
- 📱 **Design responsive** - Optimisé pour tous les appareils

## 🚀 Technologies

- **Frontend** : Nuxt.js 4, Vue.js 3, Vuetify 3
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **State Management** : Pinia
- **Styling** : CSS moderne avec animations
- **Icons** : Material Design Icons

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## 🛠️ Installation

1. **Cloner le repository**
   ```bash
   git clone https://github.com/marti/Menu-planner.git
   cd Menu-planner
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Supabase**
   - Créer un projet sur [supabase.com](https://supabase.com)
   - Exécuter le script SQL `supabase-schema-fixed.sql` dans l'éditeur SQL
   - Copier l'URL et la clé anonyme

4. **Variables d'environnement**
   Créer un fichier `.env` :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anonyme
   ```

5. **Lancer l'application**
   ```bash
   npm run dev
   ```

## 🗄️ Base de données

Le schéma inclut :
- `recipes` - Recettes de cuisine
- `meal_plans` - Plans de repas
- `grocery_items` - Articles de courses
- `user_profiles` - Profils utilisateurs
- `favorites` - Recettes favorites
- `meal_history` - Historique des repas

## 🔒 Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentification** requise pour les opérations sensibles
- **Politiques d'accès** granulaires par utilisateur

## 📱 Utilisation

1. **Créer un compte** ou se connecter
2. **Parcourir les recettes** existantes
3. **Créer de nouvelles recettes** personnalisées
4. **Planifier les repas** de la semaine
5. **Générer la liste de courses** automatiquement
6. **Suivre l'historique** des repas

## 🚀 Déploiement

### Supabase Edge Functions (Gratuit)
```bash
# Installer Supabase CLI
npm install -g supabase

# Lier le projet
supabase link --project-ref votre_ref_projet

# Déployer
supabase functions deploy
```

### Vercel/Netlify
```bash
npm run build
npm run generate
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Contacter l'équipe de développement

---

**Menu Planner** - Planifiez vos repas avec style ! 🎉

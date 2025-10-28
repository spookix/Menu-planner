# ðŸ½ï¸ Menu Planner

Une application moderne de planification de repas construite avec Nuxt.js, Vuetify et Supabase.

## âœ¨ Fonctionnalités

- ðŸ” **Authentification complÃ¨te** avec Supabase Auth
- ðŸ“š **Gestion des recettes** - Création, édition, recherche et filtrage
- ðŸ“… **Planificateur de repas** - Organisation de la semaine
- ðŸ›’ **Liste de courses** - Génération automatique depuis les plans
- ðŸ“Š **Historique** - Suivi des habitudes alimentaires
- ðŸŒ **Interface en franÃ§ais** - Expérience utilisateur localisée
- ðŸ“± **Design responsive** - Optimisé pour tous les appareils

## ðŸš€ Technologies

- **Frontend** : Nuxt.js 4, Vue.js 3, Vuetify 3
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **State Management** : Pinia
- **Styling** : CSS moderne avec animations
- **Icons** : Material Design Icons

## ðŸ“‹ Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

## ðŸ› ï¸ Installation

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

## ðŸ—„ï¸ Base de données

Le schéma inclut :
- `recipes` - Recettes de cuisine
- `meal_plans` - Plans de repas
- `grocery_items` - Articles de courses
- `user_profiles` - Profils utilisateurs
- `favorites` - Recettes favorites
- `meal_history` - Historique des repas

## ðŸ”’ Sécurité

- **Row Level Security (RLS)** activé sur toutes les tables
- **Authentification** requise pour les opérations sensibles
- **Politiques d'accÃ¨s** granulaires par utilisateur

## ðŸ“± Utilisation

1. **Créer un compte** ou se connecter
2. **Parcourir les recettes** existantes
3. **Créer de nouvelles recettes** personnalisées
4. **Planifier les repas** de la semaine
5. **Générer la liste de courses** automatiquement
6. **Suivre l'historique** des repas

## ðŸš€ Déploiement

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

## ðŸ¤ Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## ðŸ“„ Licence

Ce projet est sous licence. Voir le fichier `LICENSE` pour plus de détails.


---

**Menu Planner** - Planifiez vos repas avec style ! ðŸŽ‰


# 🚀 Guide de Déploiement Gratuit sur Supabase

## 📋 **Prérequis**
- Un compte Supabase (gratuit)
- Node.js et npm installés
- Git installé

## 🔧 **Étape 1 : Configuration de la base de données**

### 1.1 Aller sur Supabase
- Rendez-vous sur [supabase.com](https://supabase.com)
- Connectez-vous ou créez un compte
- Créez un nouveau projet

### 1.2 Exécuter le script SQL
- Dans votre projet Supabase, allez dans **SQL Editor**
- Copiez le contenu du fichier `supabase-schema.sql`
- Exécutez le script complet
- Vérifiez que toutes les tables sont créées dans **Table Editor**

### 1.3 Vérifier les variables d'environnement
- Allez dans **Settings > API**
- Notez votre `Project URL` et `anon public` key
- Vérifiez qu'ils correspondent à ceux dans `lib/supabase.ts`

## 🛠️ **Étape 2 : Installation des dépendances**

```bash
# Installer les dépendances Supabase
npm install @supabase/supabase-js

# Installer toutes les dépendances
npm install
```

## 🚀 **Étape 3 : Déploiement sur Supabase Edge Functions (Gratuit)**

### 3.1 Installer Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Se connecter à Supabase
```bash
supabase login
```

### 3.3 Initialiser le projet
```bash
supabase init
```

### 3.4 Lier le projet
```bash
supabase link --project-ref efrjpocadsjqxzitnihr
```

### 3.5 Déployer
```bash
# Construire l'application
npm run build

# Déployer sur Supabase Edge Functions
supabase functions deploy
```

## 🌐 **Étape 4 : Configuration du domaine personnalisé (Optionnel)**

### 4.1 Dans Supabase Dashboard
- Allez dans **Settings > General**
- Ajoutez votre domaine personnalisé
- Configurez les enregistrements DNS selon les instructions

### 4.2 Configuration DNS
```
Type: CNAME
Nom: www
Valeur: efrjpocadsjqxzitnihr.supabase.co
```

## 📱 **Étape 5 : Déploiement mobile (Optionnel)**

### 5.1 PWA Configuration
- L'application est déjà configurée comme PWA
- Testez sur mobile : l'icône d'installation devrait apparaître

### 5.2 Configuration des métadonnées
- Modifiez `nuxt.config.ts` pour personnaliser le nom et l'icône
- Testez l'installation sur différents appareils

## 🔒 **Étape 6 : Sécurité et authentification**

### 6.1 Vérifier les politiques RLS
- Toutes les tables ont des politiques de sécurité
- Les utilisateurs ne peuvent accéder qu'à leurs propres données
- Les recettes sont publiques en lecture

### 6.2 Configuration de l'authentification
- L'authentification Supabase est automatiquement configurée
- Les utilisateurs peuvent s'inscrire/se connecter
- Les profils sont créés automatiquement

## 📊 **Étape 7 : Monitoring et maintenance**

### 7.1 Dashboard Supabase
- Surveillez l'utilisation dans **Dashboard > Usage**
- Vérifiez les performances dans **Dashboard > Performance**
- Gérez les utilisateurs dans **Authentication > Users**

### 7.2 Logs et erreurs
- Consultez les logs dans **Logs > Edge Functions**
- Surveillez les erreurs dans **Logs > Database**

## 💰 **Coûts et limites du plan gratuit**

### ✅ **Inclus gratuitement :**
- 500 MB de base de données
- 2 GB de bande passante
- 50,000 requêtes API par mois
- 500,000 Edge Function invocations
- 1 GB de stockage de fichiers
- 50,000 utilisateurs authentifiés

### ⚠️ **Limites :**
- 7 jours de rétention des logs
- 2 Edge Functions simultanées
- Pas de sauvegarde automatique

## 🚨 **Dépannage courant**

### Problème : Erreur de connexion à Supabase
```bash
# Vérifier les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Reconnecter le projet
supabase unlink
supabase link --project-ref efrjpocadsjqxzitnihr
```

### Problème : Tables non créées
- Vérifiez que le script SQL s'est exécuté sans erreur
- Consultez les logs dans **Logs > Database**
- Vérifiez les permissions dans **Table Editor**

### Problème : Erreurs RLS
- Vérifiez que les politiques sont activées
- Testez avec un utilisateur authentifié
- Consultez les logs d'authentification

## 📞 **Support et ressources**

### Documentation officielle
- [Supabase Docs](https://supabase.com/docs)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vuetify 3 Docs](https://vuetifyjs.com/en/)

### Communauté
- [Supabase Discord](https://discord.supabase.com)
- [Nuxt Discord](https://discord.gg/nuxt)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## 🎯 **Prochaines étapes**

### Améliorations possibles
1. **Authentification sociale** (Google, Facebook, GitHub)
2. **Notifications push** avec Supabase Realtime
3. **Synchronisation offline** avec PWA
4. **Analytics** avec Supabase Analytics
5. **Backup automatique** (plan payant)

### Évolutivité
- L'application est conçue pour s'adapter au plan Pro de Supabase
- Migration facile vers d'autres fournisseurs si nécessaire
- Architecture modulaire pour faciliter les extensions

---

**🎉 Félicitations ! Votre application Menu Planner est maintenant déployée gratuitement sur Supabase !**

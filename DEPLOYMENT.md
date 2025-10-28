# ðŸš€ Guide de Déploiement Gratuit sur Supabase

## ðŸ“‹ **Prérequis**
- Un compte Supabase (gratuit)
- Node.js et npm installés
- Git installé

## ðŸ”§ **Ã‰tape 1 : Configuration de la base de données**

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
- Vérifiez qu'ils correspondent Ã  ceux dans `lib/supabase.ts`

## ðŸ› ï¸ **Ã‰tape 2 : Installation des dépendances**

```bash
# Installer les dépendances Supabase
npm install @supabase/supabase-js

# Installer toutes les dépendances
npm install
```

## ðŸš€ **Ã‰tape 3 : Déploiement sur Supabase Edge Functions (Gratuit)**

### 3.1 Installer Supabase CLI
```bash
npm install -g supabase
```

### 3.2 Se connecter Ã  Supabase
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

## ðŸŒ **Ã‰tape 4 : Configuration du domaine personnalisé (Optionnel)**

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

## ðŸ“± **Ã‰tape 5 : Déploiement mobile (Optionnel)**

### 5.1 PWA Configuration
- L'application est déjÃ  configurée comme PWA
- Testez sur mobile : l'icÃ´ne d'installation devrait apparaÃ®tre

### 5.2 Configuration des métadonnées
- Modifiez `nuxt.config.ts` pour personnaliser le nom et l'icÃ´ne
- Testez l'installation sur différents appareils

## ðŸ”’ **Ã‰tape 6 : Sécurité et authentification**

### 6.1 Vérifier les politiques RLS
- Toutes les tables ont des politiques de sécurité
- Les utilisateurs ne peuvent accéder qu'Ã  leurs propres données
- Les recettes sont publiques en lecture

### 6.2 Configuration de l'authentification
- L'authentification Supabase est automatiquement configurée
- Les utilisateurs peuvent s'inscrire/se connecter
- Les profils sont créés automatiquement

## ðŸ“Š **Ã‰tape 7 : Monitoring et maintenance**

### 7.1 Dashboard Supabase
- Surveillez l'utilisation dans **Dashboard > Usage**
- Vérifiez les performances dans **Dashboard > Performance**
- Gérez les utilisateurs dans **Authentication > Users**

### 7.2 Logs et erreurs
- Consultez les logs dans **Logs > Edge Functions**
- Surveillez les erreurs dans **Logs > Database**

## ðŸ’° **CoÃ»ts et limites du plan gratuit**

### âœ… **Inclus gratuitement :**
- 500 MB de base de données
- 2 GB de bande passante
- 50,000 requÃªtes API par mois
- 500,000 Edge Function invocations
- 1 GB de stockage de fichiers
- 50,000 utilisateurs authentifiés

### âš ï¸ **Limites :**
- 7 jours de rétention des logs
- 2 Edge Functions simultanées
- Pas de sauvegarde automatique

## ðŸš¨ **Dépannage courant**

### ProblÃ¨me : Erreur de connexion Ã  Supabase
```bash
# Vérifier les variables d'environnement
echo $SUPABASE_URL
echo $SUPABASE_ANON_KEY

# Reconnecter le projet
supabase unlink
supabase link --project-ref efrjpocadsjqxzitnihr
```

### ProblÃ¨me : Tables non créées
- Vérifiez que le script SQL s'est exécuté sans erreur
- Consultez les logs dans **Logs > Database**
- Vérifiez les permissions dans **Table Editor**

### ProblÃ¨me : Erreurs RLS
- Vérifiez que les politiques sont activées
- Testez avec un utilisateur authentifié
- Consultez les logs d'authentification

## ðŸ“ž **Support et ressources**

### Documentation officielle
- [Supabase Docs](https://supabase.com/docs)
- [Nuxt 3 Docs](https://nuxt.com/docs)
- [Vuetify 3 Docs](https://vuetifyjs.com/en/)

### Communauté
- [Supabase Discord](https://discord.supabase.com)
- [Nuxt Discord](https://discord.gg/nuxt)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/supabase)

## ðŸŽ¯ **Prochaines étapes**

### Améliorations possibles
1. **Authentification sociale** (Google, Facebook, GitHub)
2. **Notifications push** avec Supabase Realtime
3. **Synchronisation offline** avec PWA
4. **Analytics** avec Supabase Analytics
5. **Backup automatique** (plan payant)

### Ã‰volutivité
- L'application est conÃ§ue pour s'adapter au plan Pro de Supabase
- Migration facile vers d'autres fournisseurs si nécessaire
- Architecture modulaire pour faciliter les extensions

---

**ðŸŽ‰ Félicitations ! Votre application Menu Planner est maintenant déployée gratuitement sur Supabase !**


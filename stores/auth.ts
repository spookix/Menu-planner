import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    session: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    userId: (state) => state.user?.id,
    userEmail: (state) => state.user?.email,
    username: (state) => state.user?.user_metadata?.username
  },

  actions: {
    // Initialiser l'authentification au démarrage de l'app
    async init() {
      try {
        this.loading = true
        
        // Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          this.session = session
          this.user = session.user
        }

        // Ã‰couter les changements d'authentification
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            this.session = session
            this.user = session.user
            this.error = null
            
            // Créer le profil utilisateur s'il n'existe pas
            await this.ensureUserProfile()
          } else if (event === 'SIGNED_OUT') {
            this.session = null
            this.user = null
            this.error = null
          }
        })
      } catch (error: any) {
        this.error = error.message
      } finally {
        this.loading = false
      }
    },

    // Connexion avec email/pseudo et mot de passe
    async signIn(emailOrUsername: string, password: string) {
      try {
        this.loading = true
        this.error = null

        // Essayer d'abord avec l'email
        let { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrUsername,
          password: password
        })

        // Si ça ne marche pas, essayer avec le pseudo
        if (error && emailOrUsername.includes('@') === false) {
          // Chercher l'utilisateur par pseudo dans user_profiles
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('username', emailOrUsername)
            .single()

          if (profileData) {
            // Récupérer l'email de l'utilisateur
            const { data: userData } = await supabase.auth.admin.getUserById(profileData.id)
            if (userData.user?.email) {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: userData.user.email,
                password: password
              })
              
              if (signInData) {
                data = signInData
                error = null
              } else {
                error = signInError
              }
            }
          }
        }

        if (error) throw error
        
        if (data.session) {
          this.session = data.session
          this.user = data.session.user
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Inscription avec email, mot de passe et nom d'utilisateur
    async signUp(email: string, password: string, username: string) {
      try {
        this.loading = true
        this.error = null

        // Créer l'utilisateur
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        })

        if (error) throw error

        // Maintenant que le RLS est désactivé, créer le profil directement
        if (data.user) {
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: data.user.id,
              username: username,
              full_name: username
            })

          if (profileError) {
            console.error('Erreur création profil:', profileError)
            // Ne pas faire échouer l'inscription si le profil ne peut pas Ãªtre créé
          }
        }

        return data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Déconnexion
    async signOut() {
      try {
        this.loading = true
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        this.session = null
        this.user = null
        this.error = null
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Réinitialiser le mot de passe
    async resetPassword(email: string) {
      try {
        this.loading = true
        this.error = null

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`
        })

        if (error) throw error
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mettre à jour le profil utilisateur
    async updateProfile(updates: { username?: string; full_name?: string; avatar_url?: string }) {
      try {
        if (!this.user) throw new Error('Utilisateur non connecté')

        const { error } = await supabase
          .from('user_profiles')
          .update(updates)
          .eq('id', this.user.id)

        if (error) throw error

        // Mettre Ã  jour les métadonnées de l'utilisateur
        const { data: authData, error: authError } = await supabase.auth.updateUser({
          data: updates
        })

        if (authError) throw authError
        if (authData?.user) {
          this.user = authData.user as any
        } else if (this.user) {
          this.user = { ...(this.user as any), user_metadata: { ...(this.user as any).user_metadata, ...updates } } as any
        }
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    // S'assurer que le profil utilisateur existe
    async ensureUserProfile() {
      if (!this.user) return

      try {
        // Vérifier si le profil existe déjà 
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', this.user.id)
          .single()

        // Si le profil n'existe pas, le créer
        if (!existingProfile) {
          const username = this.user.user_metadata?.username || this.user.email?.split('@')[0] || 'Utilisateur'
          
          const { error } = await supabase
            .from('user_profiles')
            .insert({
              id: this.user.id,
              username: username,
              full_name: username
            })

          if (error) {
            console.error('Erreur création profil automatique:', error)
          }
        }
      } catch (error) {
        console.error('Erreur vérification profil:', error)
      }
    },

    // Effacer l'erreur
    clearError() {
      this.error = null
    }
  }
})


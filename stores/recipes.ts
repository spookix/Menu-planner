import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase'
import type { Recipe } from '~/lib/supabase'

export interface RecipeFilters {
  time: number | null
  difficulty: string | null
}

export interface RecipeState {
  recipes: Recipe[]
  filtered: Recipe[]
  loading: boolean
  error: string | null
  query: string
  filters: RecipeFilters
}

export const useRecipesStore = defineStore('recipes', {
  state: (): RecipeState => ({
    recipes: [],
    filtered: [],
    loading: false,
    error: null,
    query: '',
    filters: {
      time: null,
      difficulty: null
    }
  }),

  getters: {
    // R�cup�rer toutes les recettes
    allRecipes: (state) => state.recipes,
    
    // R�cup�rer les recettes filtr�es
    filteredRecipes: (state) => state.filtered,
    
    // R�cup�rer une recette par ID
    getRecipeById: (state) => (id: string) => 
      state.recipes.find(recipe => recipe.id === id),
    
    
    
    // R�cup�rer les recettes favorites
    getFavoriteRecipes: (state) =>
      state.recipes.filter(recipe => recipe.favorite)
  },

  actions: {
    // Charger toutes les recettes depuis Supabase
    async loadRecipes() {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error

        this.recipes = data || []
        this.applyFilters()
      } catch (error: any) {
        this.error = error.message
        console.error('Erreur chargement recettes:', error)
      } finally {
        this.loading = false
      }
    },

    // Cr�er une nouvelle recette
    async createRecipe(recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('recipes')
          .insert([recipeData])
          .select()
          .single()

        if (error) throw error

        if (data) {
          this.recipes.unshift(data)
          this.applyFilters()
        }

        return data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Mettre à jour une recette existante
    async updateRecipe(id: string, updates: Partial<Recipe>) {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('recipes')
          .update(updates)
          .eq('id', id)
          .select()
          .single()

        if (error) throw error

        if (data) {
          const index = this.recipes.findIndex(r => r.id === id)
          if (index !== -1) {
            this.recipes[index] = data
            this.applyFilters()
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

    // Supprimer une recette
    async deleteRecipe(id: string) {
      try {
        this.loading = true
        this.error = null

        const { error } = await supabase
          .from('recipes')
          .delete()
          .eq('id', id)

        if (error) throw error

        // Retirer de la liste locale
        this.recipes = this.recipes.filter(r => r.id !== id)
        this.applyFilters()
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Rechercher des recettes
    search() {
      this.applyFilters()
    },

    // Appliquer les filtres et la recherche
    applyFilters() {
      let filtered = [...this.recipes]

      // Filtre par recherche textuelle
      if (this.query.trim()) {
        const query = this.query.toLowerCase()
        filtered = filtered.filter(recipe =>
          recipe.title.toLowerCase().includes(query) ||
          recipe.subtitle?.toLowerCase().includes(query) ||
          recipe.ingredients?.some(ingredient => 
            ingredient.toLowerCase().includes(query)
          )
        )
      }

      

      // Filtre par temps de pr�paration
      if (this.filters.time) {
        filtered = filtered.filter(recipe => 
          recipe.time && recipe.time <= this.filters.time!
        )
      }

      // Filtre par difficult�
      if (this.filters.difficulty) {
        filtered = filtered.filter(recipe => recipe.difficulty === this.filters.difficulty)
      }

      this.filtered = filtered
    },

    // Mettre à jour les filtres
    updateFilters(filters: Partial<RecipeFilters>) {
      this.filters = { ...this.filters, ...filters }
      this.applyFilters()
    },

    // R�initialiser les filtres
    resetFilters() {
      this.filters = {
        time: null,
        difficulty: null
      }
      this.query = ''
      this.applyFilters()
    },

    // Basculer le statut favori d'une recette
    async toggleFavorite(id: string) {
      try {
        const recipe = this.recipes.find(r => r.id === id)
        if (!recipe) return

        const newFavoriteStatus = !recipe.favorite
        
        await this.updateRecipe(id, { favorite: newFavoriteStatus })
      } catch (error: any) {
        this.error = error.message
        throw error
      }
    },

    // Charger une recette sp�cifique par ID
    async loadRecipe(id: string) {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await supabase
          .from('recipes')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        return data
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    // Effacer l'erreur
    clearError() {
      this.error = null
    }
  }
})



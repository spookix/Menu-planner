import { defineStore } from 'pinia'
import { supabase } from '~/lib/supabase'
import type { Recipe } from '~/lib/supabase'

export interface RecipeFilters {
  time: number | null
  difficulty: Recipe['difficulty'] | null
}

export interface RecipeState {
  recipes: Recipe[]
  filtered: Recipe[]
  loading: boolean
  error: string | null
  query: string
  filters: RecipeFilters
}

const RECIPE_FIELDS =
  'id, title, subtitle, img, recipe_url, difficulty, time, kcal, protein, carb, fat, ingredients, vegetarian, favorite, created_at, updated_at'

// --- Helpers sûrs ---
function toFiniteOrNull(v: unknown): number | null {
  const n = typeof v === 'string' && v.trim() === '' ? NaN : Number(v as any)
  return Number.isFinite(n) ? n : null
}

function normalizeDifficulty(v: unknown): Recipe['difficulty'] | null {
  if (!v) return null
  const s = String(v).toLowerCase()
  if (s.startsWith('facil')) return 'Facile'
  if (s.startsWith('moy')) return 'Moyen'
  if (s.startsWith('diff')) return 'Difficile'
  return null
}

function normalizeImg(url: unknown): string | null {
  if (!url) return null
  try {
    let s = String(url).trim()
    // Déproxy Next.js: /_next/image?url=...
    if (s.includes('/_next/image') && s.includes('url=')) {
      const u = new URL(s, 'https://dummy.base')
      const raw = u.searchParams.get('url') || ''
      // double decode éventuel
      let decoded = raw
      for (let i = 0; i < 2; i++) {
        try {
          const d = decodeURIComponent(decoded)
          if (d === decoded) break
          decoded = d
        } catch { break }
      }
      if (decoded) s = decoded
    }
    const u2 = new URL(s)
    if (u2.protocol === 'http:' || u2.protocol === 'https:') return u2.toString()
    return s
  } catch {
    return String(url)
  }
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
    allRecipes: (state) => state.recipes,
    filteredRecipes: (state) => state.filtered,
    getRecipeById: (state) => (id: string) =>
      state.recipes.find(recipe => recipe.id === id),
    getFavoriteRecipes: (state) =>
      state.recipes.filter(recipe => recipe.favorite)
  },

  actions: {
    // Timeout générique (par défaut 30s)
    async withTimeout<T>(promise: Promise<T>, ms = 30000): Promise<T> {
      return await Promise.race([
        promise,
        new Promise<T>((_, reject) =>
          setTimeout(() => reject(new Error('Délai dépassé, veuillez réessayer.')), ms)
        )
      ]) as T
    },

    // Nettoyage des payloads avant envoi SQL
    sanitizeRecipePayload(obj: Partial<Recipe>) {
      const payload: any = { ...obj }

      if ('time' in payload) payload.time = toFiniteOrNull(payload.time)
      if ('kcal' in payload) payload.kcal = toFiniteOrNull(payload.kcal)
      if ('protein' in payload) payload.protein = toFiniteOrNull(payload.protein)
      if ('carb' in payload) payload.carb = toFiniteOrNull(payload.carb)
      if ('fat' in payload) payload.fat = toFiniteOrNull(payload.fat)

      if ('difficulty' in payload) {
        const d = normalizeDifficulty(payload.difficulty)
        // Si null, on garde la valeur d'origine (si elle est déjà propre) sinon on met null
        payload.difficulty = (d ?? payload.difficulty) as any
      }

      if ('img' in payload) {
        payload.img = normalizeImg(payload.img)
      }

      // ingredients: garantir un tableau de strings
      if ('ingredients' in payload) {
        if (Array.isArray(payload.ingredients)) {
          payload.ingredients = payload.ingredients
            .map((x: any) => String(x ?? '').trim())
            .filter((x: string) => x.length > 0)
        } else if (typeof payload.ingredients === 'string') {
          payload.ingredients = String(payload.ingredients)
            .split('\n')
            .map(s => s.trim())
            .filter(Boolean)
        } else if (payload.ingredients == null) {
          payload.ingredients = []
        }
      }

      return payload as Partial<Recipe>
    },

    // Charger toutes les recettes
    async loadRecipes() {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await this.withTimeout(
          supabase
            .from('recipes')
            .select(RECIPE_FIELDS)
            .order('updated_at', { ascending: false })
        )

        if (error) throw error

        this.recipes = data || []
        this.applyFilters()
      } catch (err: any) {
        this.error = err.message ?? 'Erreur lors du chargement'
        console.error('Erreur chargement recettes:', err)
      } finally {
        this.loading = false
      }
    },

    // Créer une recette
    async createRecipe(recipeData: Omit<Recipe, 'id' | 'created_at' | 'updated_at'>) {
      try {
        this.loading = true
        this.error = null

        // Retirer les undefined pour éviter les colonnes explicites à NULL non voulues
        const base = Object.fromEntries(
          Object.entries(recipeData).filter(([, v]) => v !== undefined)
        ) as typeof recipeData

        const cleaned = this.sanitizeRecipePayload(base)

        const { data, error } = await this.withTimeout(
          supabase
            .from('recipes')
            .insert([cleaned])
            .select(RECIPE_FIELDS)
            .single()
        )

        if (error) throw error

        if (data) {
          // Ajout en tête + re-filtrage
          this.recipes.unshift(data as Recipe)
          this.applyFilters()
        }

        return data as Recipe
      } catch (err: any) {
        this.error = err.message ?? 'Erreur lors de la création'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Mettre à jour une recette
    async updateRecipe(id: string, updates: Partial<Recipe>) {
      try {
        this.loading = true
        this.error = null

        // Omettre les colonnes immuables/auto
        const { id: _i, created_at: _c, updated_at: _u, ...rest } = updates as any

        const base = Object.fromEntries(
          Object.entries(rest).filter(([, v]) => v !== undefined)
        ) as Partial<Recipe>

        const cleaned = this.sanitizeRecipePayload(base)

        const { data, error } = await this.withTimeout(
          supabase
            .from('recipes')
            .update(cleaned)
            .eq('id', id)
            .select(RECIPE_FIELDS)
            .single()
        )

        if (error) throw error

        if (data) {
          const idx = this.recipes.findIndex(r => r.id === id)
          if (idx !== -1) {
            this.recipes[idx] = data as Recipe
          } else {
            this.recipes.unshift(data as Recipe)
          }
          this.applyFilters()
        }

        return data as Recipe
      } catch (err: any) {
        this.error = err.message ?? 'Erreur lors de la mise à jour'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Supprimer une recette
    async deleteRecipe(id: string) {
      try {
        this.loading = true
        this.error = null

        const { error } = await this.withTimeout(
          supabase.from('recipes').delete().eq('id', id)
        )

        if (error) throw error

        this.recipes = this.recipes.filter(r => r.id !== id)
        this.applyFilters()
      } catch (err: any) {
        this.error = err.message ?? 'Erreur lors de la suppression'
        throw err
      } finally {
        this.loading = false
      }
    },

    // Rechercher
    search() {
      this.applyFilters()
    },

    // Appliquer recherche + filtres
    applyFilters() {
      let list = [...this.recipes]

      // Recherche plein-texte simple
      const q = this.query.trim().toLowerCase()
      if (q) {
        list = list.filter(r => {
          const inTitle = (r.title ?? '').toLowerCase().includes(q)
          const inSub = (r.subtitle ?? '').toLowerCase().includes(q)
          const inIngr = (r.ingredients ?? []).some(x => (x ?? '').toLowerCase().includes(q))
          return inTitle || inSub || inIngr
        })
      }

      // Temps max
      if (this.filters.time != null) {
        list = list.filter(r => (r.time ?? Infinity) <= (this.filters.time as number))
      }

      // Difficulté exacte
      if (this.filters.difficulty) {
        list = list.filter(r => r.difficulty === this.filters.difficulty)
      }

      this.filtered = list
    },

    // Mettre à jour les filtres
    updateFilters(filters: Partial<RecipeFilters>) {
      this.filters = { ...this.filters, ...filters }
      this.applyFilters()
    },

    // Réinitialiser les filtres
    resetFilters() {
      this.filters = { time: null, difficulty: null }
      this.query = ''
      this.applyFilters()
    },

    // Basculer le favori (optimiste)
    async toggleFavorite(id: string) {
      const idx = this.recipes.findIndex(r => r.id === id)
      if (idx === -1) return

      const current = this.recipes[idx]
      const nextFav = !current.favorite

      // Optimiste
      this.recipes[idx] = { ...current, favorite: nextFav }
      this.applyFilters()

      try {
        const { error } = await this.withTimeout(
          supabase.from('recipes').update({ favorite: nextFav }).eq('id', id)
        )
        if (error) throw error
      } catch (err) {
        // rollback si échec
        this.recipes[idx] = current
        this.applyFilters()
        this.error = (err as any).message ?? 'Erreur lors du passage en favori'
        throw err
      }
    },

    // Charger une recette par ID
    async loadRecipe(id: string) {
      try {
        this.loading = true
        this.error = null

        const { data, error } = await this.withTimeout(
          supabase.from('recipes').select(RECIPE_FIELDS).eq('id', id).single()
        )

        if (error) throw error
        return data as Recipe
      } catch (err: any) {
        this.error = err.message ?? 'Erreur lors du chargement'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError() {
      (this as any).error = null
    },

    async ensureSessionFresh() {
      const { data } = await supabase.auth.getSession()
      const exp = data.session?.expires_at ? data.session.expires_at * 1000 : 0
      const soon = Date.now() + 30_000
      if (!data.session || exp < soon) {
        await supabase.auth.refreshSession()
      }
    },

    isTransient(err: any) {
      const m = String(err?.message || err)
      return /timeout|délai|Failed to fetch|NetworkError|TypeError: fetch/i.test(m)
    },

    async withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
      let last: any
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn()
        } catch (e) {
          last = e
          if (!this.isTransient(e) || i === attempts - 1) throw e
          await new Promise(r => setTimeout(r, 500 * (i + 1)))
        }
      }
      throw last
  }

  }
})

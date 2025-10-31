import { defineStore } from 'pinia'
import type { Recipe } from '~/lib/supabase'
import { supabase } from '~/lib/supabase'
import { useAuthStore } from './auth'

export type MealKey = 'lunch' | 'dinner'
export interface DayPlan { lunch: Recipe | null; dinner: Recipe | null }
export type WeekState = { [di: number]: DayPlan }
export interface MealPlanEntry {
  id: string
  date: string // YYYY-MM-DD
  meal_type: MealKey
  recipe: Recipe
}

const emptyDay = (): DayPlan => ({ lunch: null, dinner: null })

// normalize date to Monday of its week, 00:00
const toWeekStart = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  const dow = d.getDay() // 0=Sun,1=Mon
  const offset = dow === 0 ? -6 : 1 - dow
  d.setDate(d.getDate() + offset)
  return d
}

// format local date as YYYY-MM-DD (no UTC shift)
const toLocalDateKey = (d: Date) => {
  const dt = new Date(d)
  dt.setHours(0, 0, 0, 0)
  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1).toString().padStart(2, '0')
  const day = dt.getDate().toString().padStart(2, '0')
  return `${y}-${m}-${day}`
}

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    weekStart: toWeekStart(new Date()),
    plan: Object.fromEntries(Array.from({ length: 7 }, (_, i) => [i, emptyDay()])) as WeekState,
    mealPlans: [] as MealPlanEntry[],
    // Active planning owner context (null = current user)
    activeOwnerId: null as string | null,
    activeOwnerName: null as string | null,
    sharedOwners: [] as Array<{ id: string; username: string }>,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    initOwnerContext() {
      const auth = useAuthStore()
      const saved = typeof localStorage !== 'undefined' ? localStorage.getItem('planner.activeOwnerId') : null
      const savedName = typeof localStorage !== 'undefined' ? localStorage.getItem('planner.activeOwnerName') : null
      if (saved) {
        this.activeOwnerId = saved
        this.activeOwnerName = savedName
      } else {
        this.activeOwnerId = auth.userId || null
        this.activeOwnerName = auth.username || null
      }
    },
    setActiveOwner(ownerId: string | null, ownerName?: string | null) {
      this.activeOwnerId = ownerId
      this.activeOwnerName = ownerName ?? null
      if (typeof localStorage !== 'undefined') {
        if (ownerId) {
          localStorage.setItem('planner.activeOwnerId', ownerId)
          localStorage.setItem('planner.activeOwnerName', ownerName || '')
        } else {
          localStorage.removeItem('planner.activeOwnerId')
          localStorage.removeItem('planner.activeOwnerName')
        }
      }
      this.updateMealPlans()
    },
    async loadSharedOwners() {
      const auth = useAuthStore()
      if (!auth.userId) return
      try {
        // 1) fetch owner ids shared with me
        const { data, error } = await supabase
          .from('meal_plan_shares')
          .select('owner_id')
          .eq('shared_with_id', auth.userId)
        if (error) throw error
        const ownerIds = ((data as any[]) || []).map(r => r.owner_id).filter(Boolean)
        if (!ownerIds.length) { this.sharedOwners = []; return }
        // 2) fetch their usernames
        const { data: profiles, error: pErr } = await supabase
          .from('user_profiles')
          .select('id, username')
          .in('id', ownerIds)
        if (pErr) throw pErr
        this.sharedOwners = (profiles as any[]).map(p => ({ id: p.id, username: p.username }))
      } catch (e: any) {
        this.error = e.message
        console.error('loadSharedOwners error:', e)
      }
    },
    async sharePlanningWith(email: string) {
      const auth = useAuthStore()
      if (!auth.userId) throw new Error('Utilisateur non connecté')
      const trimmed = email.trim()
      if (!trimmed) throw new Error('Email requis')
      try {
        // Resolve target user by email via server-side function
        const { data: found, error: rpcError } = await supabase.rpc('resolve_user_by_email', { p_email: trimmed })
        if (rpcError) throw rpcError
        const target = Array.isArray(found) ? (found[0] as any) : (found as any)
        if (!target?.id) throw new Error("Utilisateur introuvable ou sans compte actif")
        if (target.id === auth.userId) throw new Error("Vous ne pouvez pas vous partager votre propre planning")

        const { error } = await supabase
          .from('meal_plan_shares')
          .insert({ owner_id: auth.userId, shared_with_id: target.id })
        if (error && !String(error.message).includes('duplicate key')) throw error
        return { ok: true, target }
      } catch (e: any) {
        this.error = e.message
        throw e
      }
    },
    setWeekStart(date: Date) {
      this.weekStart = toWeekStart(date)
      // Recompute in-memory week plan for the new week
      this.updateMealPlans()
    },
    clearSlot(di: number, meal: MealKey) {
      if (this.plan[di]) this.plan[di][meal] = null
    },
    assign(di: number, meal: MealKey, recipe: Recipe) {
      if (this.plan[di]) this.plan[di][meal] = recipe
    },
    clearWeek() {
      for (let i = 0; i < 7; i++) this.plan[i] = emptyDay()
    },

    // load meal plans from DB
    async loadMealPlans() {
      try {
        this.loading = true
        this.error = null

        const auth = useAuthStore()
        if (!auth.userId) return

        // Determine which owner's planning to load
        const ownerId = this.activeOwnerId || auth.userId

        const { data, error } = await supabase
          .from('meal_plans')
          .select(`
            id,
            date,
            meal_type,
            recipe_id,
            recipes (*)
          `)
          .eq('user_id', ownerId)

        if (error) throw error

        this.mealPlans = []
        if (data) {
          for (const mealPlan of data as any[]) {
            const recipe = mealPlan.recipes as Recipe
            if (recipe) {
              this.mealPlans.push({
                id: mealPlan.id,
                date: mealPlan.date,
                meal_type: mealPlan.meal_type as MealKey,
                recipe,
              })
            }
          }
        }

        this.updateMealPlans()
      } catch (e: any) {
        this.error = e.message
        console.error('loadMealPlans error:', e)
      } finally {
        this.loading = false
      }
    },

    // recompute weekly plan from dated entries
    updateMealPlans() {
      this.clearWeek()
      const weekStart = new Date(this.weekStart)
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekEnd.getDate() + 6)

      for (const mp of this.mealPlans) {
        const mealDate = new Date(`${mp.date}T00:00:00`)
        if (mealDate >= weekStart && mealDate <= weekEnd) {
          const dow = mealDate.getDay()
          const di = dow === 0 ? 6 : dow - 1
          if (this.plan[di]) this.plan[di][mp.meal_type] = mp.recipe
        }
      }
    },

    // save a meal for a specific date/slot
    async saveMealPlan(date: Date, mealType: MealKey, recipe: Recipe) {
      try {
        const auth = useAuthStore()
        if (!auth.userId) return

        const dateString = toLocalDateKey(date)

        const ownerId = this.activeOwnerId || auth.userId

        await supabase
          .from('meal_plans')
          .delete()
          .eq('user_id', ownerId)
          .eq('date', dateString)
          .eq('meal_type', mealType)

        const { data: inserted, error } = await supabase
          .from('meal_plans')
          .insert({
            user_id: ownerId,
            date: dateString,
            meal_type: mealType,
            recipe_id: recipe.id,
          })
          .select('id, date, meal_type, recipe_id')
          .single()

        if (error) throw error

        // update local list immediately
        this.mealPlans = this.mealPlans.filter(
          (mp) => !(mp.date === dateString && mp.meal_type === mealType)
        )
        this.mealPlans.push({ id: inserted!.id, date: dateString, meal_type: mealType, recipe })
        this.updateMealPlans()
      } catch (e: any) {
        this.error = e.message
        console.error('saveMealPlan error:', e)
        throw e
      }
    },

    // remove a meal for a specific date/slot
    async removeMealPlan(date: Date, mealType: MealKey) {
      try {
        const auth = useAuthStore()
        if (!auth.userId) return

        const dateString = toLocalDateKey(date)

        const ownerId = this.activeOwnerId || auth.userId

        const { error } = await supabase
          .from('meal_plans')
          .delete()
          .eq('user_id', ownerId)
          .eq('date', dateString)
          .eq('meal_type', mealType)

        if (error) throw error

        // update local list
        this.mealPlans = this.mealPlans.filter(
          (mp) => !(mp.date === dateString && mp.meal_type === mealType)
        )
        this.updateMealPlans()
      } catch (e: any) {
        this.error = e.message
        console.error('removeMealPlan error:', e)
        throw e
      }
    },
  },
  getters: {
    isOwnPlan(state): boolean {
      const auth = useAuthStore()
      const owner = state.activeOwnerId || auth.userId
      return !!auth.userId && owner === auth.userId
    },
    allRecipes(state): Recipe[] {
      const arr: Recipe[] = []
      for (let i = 0; i < 7; i++) {
        const day = state.plan[i]
        if (!day) continue
        for (const m of ['lunch', 'dinner'] as MealKey[]) {
          const r = day[m]
          if (r) arr.push(r)
        }
      }
      return arr
    },
    nutritionWeek(state) {
      const sum = { kcal: 0, protein: 0, carb: 0, fat: 0 }
      for (let i = 0; i < 7; i++) {
        const day = state.plan[i]
        if (!day) continue
        for (const m of ['lunch', 'dinner'] as MealKey[]) {
          const r = day[m]
          if (!r) continue
          sum.kcal += r.kcal ?? 0
          sum.protein += r.protein ?? 0
          sum.carb += r.carb ?? 0
          sum.fat += r.fat ?? 0
        }
      }
      return sum
    },
  },
})

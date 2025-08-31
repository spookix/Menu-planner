import { defineStore } from 'pinia'
import type { Recipe } from './recipes'

export type MealKey = 'breakfast'|'lunch'|'dinner'
export interface DayPlan { breakfast: Recipe|null; lunch: Recipe|null; dinner: Recipe|null }
export interface WeekState { [di: number]: DayPlan } // 0..6

const emptyDay = (): DayPlan => ({ breakfast:null, lunch:null, dinner:null })

export const usePlannerStore = defineStore('planner', {
  state: () => ({
    weekStart: new Date(), // Monday of current week
    plan: Object.fromEntries(Array.from({length:7}, (_,i)=>[i, emptyDay()])) as WeekState
  }),
  actions: {
    setWeekStart(date: Date) { this.weekStart = date },
    clearSlot(di: number, meal: MealKey) { this.plan[di][meal] = null },
    assign(di: number, meal: MealKey, recipe: Recipe) { this.plan[di][meal] = recipe },
    clearWeek() { for (let i=0;i<7;i++) this.plan[i]=emptyDay() }
  },
  getters: {
    allRecipes(state): Recipe[] {
      const arr: Recipe[] = []
      for (let i=0;i<7;i++) for (const m of ['breakfast','lunch','dinner'] as MealKey[]) {
        const r = state.plan[i][m]; if (r) arr.push(r)
      }
      return arr
    },
    nutritionWeek(state) {
      const sum = { kcal:0, protein:0, carb:0, fat:0 }
      for (let i=0;i<7;i++) for (const m of ['breakfast','lunch','dinner'] as MealKey[]) {
        const r = state.plan[i][m]; if (!r) continue
        sum.kcal += r.kcal ?? 0; sum.protein += r.protein ?? 0
        sum.carb += r.carb ?? 0; sum.fat += r.fat ?? 0
      }
      return sum
    }
  }
})

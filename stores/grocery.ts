import { defineStore } from 'pinia'
import { usePlannerStore } from './planner'

export interface GroceryItem { label: string; done: boolean }
export interface GrocerySection { title: string; items: GroceryItem[] }

export const useGroceryStore = defineStore('grocery', {
  state: () => ({ sections: [] as GrocerySection[] }),
  actions: {
    generateFromPlan() {
      const planner = usePlannerStore()
      // simplifié : parse par mots-clés catégorie
      const cats: Record<string,string[]> = {
        'Fruits et légumes': ['tomate','salade','oignon','carotte','avocat','épinard','poivron','olive','citron'],
        'Produits laitiers': ['lait','yaourt','fromage','feta','mozzarella'],
        'Épicerie': ['pÃ¢tes','riz','quinoa','pois chiches','lentilles','huile','pesto']
      }
      const bucket: Record<string, Set<string>> = Object.fromEntries(Object.keys(cats).map(c=>[c,new Set<string>()]))
      const push = (label:string) => {
        const lower = label.toLowerCase()
        const cat = Object.entries(cats).find(([, keys]) => keys.some(k => lower.includes(k)))?.[0] ?? 'Épicerie'
        if (bucket[cat]) {
          bucket[cat].add(label)
        } else {
          // Si la catégorie n'existe pas dans le bucket, on la crée
          bucket[cat] = new Set([label])
        }
      }
      planner.allRecipes.forEach(r => (r.ingredients ?? []).forEach(push))
      this.sections = Object.entries(bucket).map(([title, set]) => ({
        title, items: Array.from(set ?? []).map(label => ({ label, done: false }))
      })).filter(sec => sec.items.length>0)
    }
  }
})






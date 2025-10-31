import { defineStore } from 'pinia'
import { usePlannerStore } from './planner'
import { supabase } from '~/lib/supabase'
import { useAuthStore } from './auth'

export interface GroceryItem { label: string; done: boolean }
export interface GrocerySection { title: string; items: GroceryItem[] }

type OverrideMap = Map<string, string> // normalizedLabel -> section

const stripAccents = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
const cleanupSpaces = (s: string) => s.replace(/\s+/g, ' ').trim()

function normalizeLabel(raw: string): string {
  let s = stripAccents(String(raw || '').toLowerCase())
  // remove parentheses content
  s = s.replace(/\((?:[^)(]+|\([^)(]*\))*\)/g, ' ')
  // remove punctuation
  s = s.replace(/[',]/g, ' ')
  s = cleanupSpaces(s)
  // remove leading qty/unit expressions and "cuillère à ..."
  s = s.replace(/^(\d+[\.,]?\d*\s*(x|g|kg|mg|ml|cl|l|t|cs|cc|c\.?s\.?|c\.?c\.?|cuill\.?|tranches?|tasses?|boites?|bo\.?|pz|pincees?)\b\s*)+/g, '')
  s = s.replace(/^(c\.?\s*a\s*cafe|c\.?\s*a\s*soupe|cuillere?\s*a\s*cafe|cuillere?\s*a\s*soupe)\b\s*(de|d')?\s*/g, '')
  // remove leading determiners like de/d'
  s = s.replace(/^(de|d)\s+/g, '')
  s = s.replace(/^d'/, '')
  return cleanupSpaces(s)
}

type UnitKind = 'count' | 'mass' | 'volume' | 'tsp'
interface ParsedIngredient {
  name: string // base product name (normalized for key)
  displayName: string // original label
  qty: number | null
  unit: UnitKind | null
  mass_g?: number
  volume_ml?: number
}

const tspToMl = 5
const tbspToMl = 15

// approximate weights in grams per unit for some produce when counted
const produceWeights: Record<string, number> = {
  poireau: 150,
  poireaux: 150,
  carotte: 100,
  carottes: 100,
  oignon: 110,
  oignons: 110,
  tomate: 120,
  tomates: 120,
  pomme: 180,
  pommes: 180,
  poivron: 150,
  poivrons: 150,
  courgette: 200,
  courgettes: 200
}

function parseIngredient(raw: string): ParsedIngredient {
  const original = String(raw || '').trim()
  const lower = stripAccents(original.toLowerCase())
  const number = (s: string) => parseFloat(s.replace(',', '.'))

  const out: ParsedIngredient = { name: normalizeLabel(original), displayName: original, qty: null, unit: null }

  // mass
  const mass = lower.match(/(\d+[\.,]?\d*)\s*(kg|g|mg)\b/)
  if (mass) {
    const qty = number(mass[1])
    const unit = mass[2]
    out.qty = qty
    out.unit = 'mass'
    out.mass_g = unit === 'kg' ? qty * 1000 : unit === 'mg' ? qty / 1000 : qty
  }

  // volume
  if (!out.unit) {
    const vol = lower.match(/(\d+[\.,]?\d*)\s*(l|cl|ml)\b/)
    if (vol) {
      const qty = number(vol[1])
      const unit = vol[2]
      out.qty = qty
      out.unit = 'volume'
      out.volume_ml = unit === 'l' ? qty * 1000 : unit === 'cl' ? qty * 10 : qty
    }
  }

  // tsp/tbsp (cuillère à café/soupe)
  if (!out.unit) {
    const tsp = lower.match(/(\d+[\.,]?\d*)\s*(c\.?\s*a\s*cafe|cc|tsp)\b/)
    const tbsp = lower.match(/(\d+[\.,]?\d*)\s*(c\.?\s*a\s*soupe|cs|tbsp)\b/)
    if (tsp || tbsp) {
      const m = tsp || tbsp!
      const qty = number(m[1])
      const isTbsp = !!tbsp
      out.qty = qty
      out.unit = 'tsp'
      out.volume_ml = qty * (isTbsp ? tbspToMl : tspToMl)
    }
  }

  // count like "3 poireaux"
  if (!out.unit) {
    const count = lower.match(/^(\d+[\.,]?\d*)\s+[a-z\-éèêàùûîôç]+/)
    if (count) {
      out.qty = number(count[1])
      out.unit = 'count'
    }
  }

  out.name = normalizeLabel(original)
  if (!out.name) out.name = normalizeLabel(original.replace(/\((?:[^)(]+|\([^)(]*\))*\)/g, ''))
  if (!out.name) out.name = lower
  return out
}

export const useGroceryStore = defineStore('grocery', {
  state: () => ({
    sections: [] as GrocerySection[],
    overrides: new Map() as OverrideMap,
    loading: false,
    error: null as string | null
  }),
  actions: {
    async loadOverrides() {
      try {
        const auth = useAuthStore()
        if (!auth.userId) return
        const { data, error } = await supabase
          .from('grocery_items')
          .select('label, section, created_at')
          .eq('user_id', auth.userId)
          .order('created_at', { ascending: false })
        if (error) throw error
        const map: OverrideMap = new Map(this.overrides)
        for (const row of (data || [])) {
          const key = normalizeLabel((row as any).label as string)
          const section = (row as any).section as string | null
          if (!map.has(key) && section) map.set(key, section)
        }
        this.overrides = map
      } catch (e: any) {
        this.error = e.message
        console.error('loadOverrides error:', e)
      }
    },

    async rememberClassification(label: string, section: string) {
      try {
        const auth = useAuthStore()
        if (!auth.userId) return
        const key = normalizeLabel(label)
        this.overrides.set(key, section)
        await supabase.from('grocery_items').insert({
          user_id: auth.userId,
          label,
          section,
          done: false
        })
      } catch (e) {
        console.error('rememberClassification error:', e)
      }
    },

    async moveItem(label: string, fromSection: string, toSection: string) {
      if (fromSection === toSection) return
      const src = this.sections.find(s => s.title === fromSection)
      const dst = this.sections.find(s => s.title === toSection)
      if (!src) return
      const idx = src.items.findIndex(i => i.label === label)
      if (idx === -1) return
      const item = src.items.splice(idx, 1)[0]
      if (!dst) this.sections.push({ title: toSection, items: [] })
      const target = this.sections.find(s => s.title === toSection)!
      target.items.push(item)
      await this.rememberClassification(label, toSection)
    },

    // Generate grocery list with normalization, rules, overrides and aggregation
    async generateFromPlan() {
      this.loading = true
      this.error = null
      try {
        await this.loadOverrides()
        const planner = usePlannerStore()

        const cats: Record<string, string[]> = {
          'Fruits et légumes': [
            'tomate','salade','oignon','carotte','avocat','epinard','poivron','olive','citron','pomme','banane','poire','courgette','concombre','champignon','ail','gingembre','herbes','basilic','persil','coriandre','aneth','laitue','mangue','fraise','myrtille','framboise','radis','chou','brocoli','haricot','petit pois','pomme de terre','patate','betterave','navet','poireau'
          ],
          'Produits laitiers': ['lait','yaourt','fromage','feta','mozzarella','beurre','creme','parmesan','gruyere','chevre','lait ribot','lait ferment'],
          'Boucherie': ['poulet','boeuf','steak','viande hachee','porc','lardon','jambon','dinde','agneau','saucisse','merguez'],
          'Poissonnerie': ['poisson','saumon','thon','cabillaud','colin','crevette','moule','calamar','sardine','truite'],
          'Boulangerie': ['pain','baguette','pita','wrap','tortilla','brioche'],
          'Boissons': ['eau','jus','soda','limonade','vin','biere','the','cafe','lait'],
          'Surgelés': ['surgele','congele','congeles'],
          'Epicerie': ['pates','riz','quinoa','pois chiches','lentilles','semoule','couscous','farine','sucre','sel','poivre','epices','curry','curcuma','paprika','cumin','pesto','huile','vinaigre','moutarde','mayonnaise','concentre','tomate pele','coulis','bouillon','noix','amande','noisette','cacahuete','chocolat','levure','cacao']
        }

        const rules: Array<{ test: (s: string) => boolean; section: string }> = [
          { test: s => s.includes('huile d olive') || s.includes('huile olive'), section: 'Epicerie' },
          // avoid classifying spices as Boissons due to "c. a cafe"
          { test: s => /\bcafe\b/.test(s) && /\b(curry|curcuma|paprika|cumin|poivre|epices?)\b/.test(s), section: 'Epicerie' },
          { test: s => s.includes('eau gazeuse') || s.includes('eau petillante'), section: 'Boissons' }
        ]

        type Agg = { name: string; mass_g?: number; volume_ml?: number; count?: number }
        const aggByName: Record<string, Agg> = {}

        const classify = (productName: string): string => {
          const key = normalizeLabel(productName)
          const ov = this.overrides.get(key)
          if (ov) return ov
          for (const r of rules) if (r.test(key)) return r.section
          for (const [cat, keys] of Object.entries(cats)) {
            if (keys.some(k => key.includes(k))) return cat
          }
          return 'Epicerie'
        }

        const push = (label: string) => {
          const parsed = parseIngredient(label)
          const key = parsed.name
          const target = (aggByName[key] ||= { name: key })
          if (parsed.unit === 'mass' && parsed.mass_g) {
            target.mass_g = (target.mass_g || 0) + parsed.mass_g
          } else if (parsed.unit === 'volume' && parsed.volume_ml) {
            target.volume_ml = (target.volume_ml || 0) + parsed.volume_ml
          } else if (parsed.unit === 'tsp' && parsed.volume_ml) {
            target.volume_ml = (target.volume_ml || 0) + parsed.volume_ml
          } else if (parsed.unit === 'count' && parsed.qty != null) {
            target.count = (target.count || 0) + parsed.qty
          } else {
            target.count = (target.count || 0) + 1
          }
        }

        planner.allRecipes.forEach(r => (r.ingredients ?? []).forEach(push))

        const bucket: Record<string, GroceryItem[]> = {}

        const formatAmount = (a: Agg): string => {
          if (a.mass_g && a.mass_g > 0) {
            const g = a.mass_g
            if (g >= 1000) return `${(g / 1000).toFixed(g % 1000 === 0 ? 0 : 2)} kg`
            return `${Math.round(g)} g`
          }
          if (a.volume_ml && a.volume_ml > 0) {
            const ml = a.volume_ml
            if (ml >= 1000) return `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 2)} L`
            if (ml >= 100) return `${Math.round(ml / 10)} cl`
            return `${Math.round(ml)} ml`
          }
          if (a.count && a.count > 0) return `${a.count}x`
          return ''
        }

        const displayNameFromKey = (key: string) => key

        for (const [key, agg] of Object.entries(aggByName)) {
          const section = classify(key)
          const items = (bucket[section] ||= [])
          const amount = formatAmount(agg)
          let label = displayNameFromKey(key)

          // Counted produce with known weights -> add total weight
          if ((agg.count || 0) > 0 && produceWeights[label]) {
            const totalG = (agg.count || 0) * produceWeights[label]
            const weightStr = totalG >= 1000 ? `${(totalG / 1000).toFixed(1)} kg` : `${totalG} g`
            label = `${agg.count} ${label}${(agg.count || 0) > 1 && !label.endsWith('s') ? 's' : ''} (${weightStr})`
          } else if (amount) {
            label = `${amount} ${label}`
          }

          items.push({ label, done: false })
        }

        this.sections = Object.entries(bucket)
          .map(([title, items]) => ({ title, items }))
          .sort((a, b) => a.title.localeCompare(b.title))
      } catch (e: any) {
        this.error = e.message
        console.error('generateFromPlan error:', e)
      } finally {
        this.loading = false
      }
    }
  }
})


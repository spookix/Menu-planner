import { defineStore } from 'pinia'
import { usePlannerStore } from './planner'
import { supabase } from '~/lib/supabase'
import { useAuthStore } from './auth'

export interface GroceryItem { label: string; done: boolean }
export interface GrocerySection { title: string; items: GroceryItem[] }

type OverrideMap = Map<string, string> // normalizedLabel -> section

function normalizeLabel(raw: string): string {
  let s = String(raw || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/\((?:[^)(]+|\([^)(]*\))*\)/g, ' ') // remove parentheses content
    .replace(/[',]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // remove leading quantity/unit tokens, e.g., "2x", "250 g", "1 tasse", "3 tranches"
  s = s.replace(/^(\d+[\.,]?\d*\s*(x|g|kg|mg|ml|cl|l|t|cs|cc|c\.?s\.?|c\.?c\.?|cuill\.?|tranches?|tasses?|boites?|bo\.?|pz|pincees?)\b\s*)+/g, '')
  // remove leading determiners like "de ", "d'"
  s = s.replace(/^(de|d)\s+/g, '')
  s = s.replace(/^d'|^d’/g, '')
  return s.trim()
}

export const useGroceryStore = defineStore('grocery', {
  state: () => ({
    sections: [] as GrocerySection[],
    overrides: new Map() as OverrideMap,
    loading: false,
    error: null as string | null
  }),
  actions: {
    // Charger les reclassements précédents depuis la base pour l'utilisateur courant
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

    // Enregistrer un reclassement utilisateur (mémoire)
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

    // Déplacer un item vers une autre section (et mémoriser)
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

    // Générer la liste à partir du plan en utilisant normalisation + règles + overrides
    async generateFromPlan() {
      this.loading = true
      this.error = null
      try {
        await this.loadOverrides()
        const planner = usePlannerStore()

        // Dictionnaire de catégories avec mots-clés (normalisés)
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
          'Épicerie': ['pates','riz','quinoa','pois chiches','lentilles','semoule','couscous','farine','sucre','sel','poivre','epices','curry','curcuma','paprika','cumin','pesto','huile','vinaigre','moutarde','mayonnaise','concentre','tomate pele','coulis','bouillon','noix','amande','noisette','cacahuete','chocolat','levure','cacao']
        }

        // Règles spéciales (plus spécifiques que les clés générales)
        const rules: Array<{ test: (s: string) => boolean; section: string }> = [
          { test: s => s.includes('huile d olive') || s.includes('huile olive'), section: 'Épicerie' },
          { test: s => s.includes('eau gazeuse') || s.includes('eau petillante'), section: 'Boissons' },
        ]

        const bucket: Record<string, Set<string>> = {}
        const ensure = (cat: string) => (bucket[cat] ||= new Set<string>())

        const classify = (label: string): string => {
          const key = normalizeLabel(label)
          // 1) override utilisateur
          const ov = this.overrides.get(key)
          if (ov) return ov
          // 2) règles spécifiques
          for (const r of rules) if (r.test(key)) return r.section
          // 3) dico par mots-clés
          for (const [cat, keys] of Object.entries(cats)) {
            if (keys.some(k => key.includes(k))) return cat
          }
          return 'Épicerie'
        }

        const push = (label: string) => {
          const cat = classify(label)
          ensure(cat).add(label)
        }

        planner.allRecipes.forEach(r => (r.ingredients ?? []).forEach(push))

        this.sections = Object.entries(bucket)
          .map(([title, set]) => ({ title, items: Array.from(set).map(label => ({ label, done: false })) }))
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


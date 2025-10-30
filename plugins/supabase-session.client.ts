// plugins/supabase-session.client.ts
import { supabase } from '~/lib/supabase'

export default defineNuxtPlugin(() => {
  const ensure = async () => {
    try {
      // relance l’auto-refresh si besoin
      // (utile si tu l’as désactivé dans createClient)
      // @ts-ignore
      if (supabase.auth.startAutoRefresh) supabase.auth.startAutoRefresh()

      const { data } = await supabase.auth.getSession()
      const exp = data.session?.expires_at ? data.session.expires_at * 1000 : 0
      const soon = Date.now() + 30_000
      // si le jeton expire très bientôt, force un refresh avant d'enregistrer
      if (!data.session || exp < soon) {
        await supabase.auth.refreshSession()
      }
    } catch { /* no-op */ }
  }

  const onFocus = () => ensure()
  const onVisible = () => { if (document.visibilityState === 'visible') ensure() }

  window.addEventListener('focus', onFocus)
  document.addEventListener('visibilitychange', onVisible)
})

import { defineStore } from 'pinia'

export interface NotificationItem {
  id: number
  message: string
  color?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
  subtext?: string
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    notifications: [] as NotificationItem[],
    _nextId: 1
  }),
  actions: {
    notify(message: string, opts: { color?: NotificationItem['color']; timeout?: number; subtext?: string } = {}) {
      const id = this._nextId++
      this.notifications.push({ id, message, color: opts.color ?? 'info', timeout: opts.timeout ?? 5000, subtext: opts.subtext })
      return id
    },
    update(id: number, patch: Partial<NotificationItem>) {
      const idx = this.notifications.findIndex(n => n.id === id)
      if (idx !== -1) {
        this.notifications[idx] = { ...this.notifications[idx], ...patch }
      }
    },
    remove(id: number) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})

import { defineStore } from 'pinia'

export interface NotificationItem {
  id: number
  message: string
  color?: 'success' | 'error' | 'info' | 'warning'
  timeout?: number
}

export const useUiStore = defineStore('ui', {
  state: () => ({
    notifications: [] as NotificationItem[],
    _nextId: 1
  }),
  actions: {
    notify(message: string, opts: { color?: NotificationItem['color']; timeout?: number } = {}) {
      const id = this._nextId++
      this.notifications.push({ id, message, color: opts.color ?? 'info', timeout: opts.timeout ?? 5000 })
      return id
    },
    remove(id: number) {
      this.notifications = this.notifications.filter(n => n.id !== id)
    }
  }
})


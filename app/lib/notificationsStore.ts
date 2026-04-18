export const NOTIFS_KEY = 'batizo_notifications'

export type NotifType = 'mention' | 'attribution' | 'statut' | 'devis' | 'facture'

export interface Notification {
  id: string
  type: NotifType
  lu: boolean
  date: string // ISO
  auteur: string // qui a déclenché
  auteurInitiales: string
  auteurColor: string
  action: string // "vous a mentionné", "vous a attribué", etc.
  contenu?: string // extrait texte
  refLabel?: string // "SCI Les Pins - Rénovation bureau"
  refId?: string
  refType?: 'client' | 'devis'
}

const COLORS = ['#1D9E75','#2563eb','#9333ea','#BA7517','#E24B4A','#0891b2']
export const getColor = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length]

export const getNotifications = (): Notification[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(NOTIFS_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  // Données fictives initiales
  const now = new Date()
  const yesterday = new Date(now.getTime() - 86400000)
  const lastWeek = new Date(now.getTime() - 5 * 86400000)
  const defaults: Notification[] = [
    {
      id: 'n1', type: 'mention', lu: false,
      date: new Date(now.getTime() - 3600000).toISOString(),
      auteur: 'Ysaline Bernard', auteurInitiales: 'YB', auteurColor: '#9333ea',
      action: 'vous a mentionné dans une note',
      contenu: '@Alexandre Delcourt peux-tu vérifier ce devis ?',
      refLabel: 'SCI Les Pins', refId: 'c1', refType: 'client'
    },
    {
      id: 'n2', type: 'attribution', lu: false,
      date: new Date(now.getTime() - 7200000).toISOString(),
      auteur: 'Emma Strano', auteurInitiales: 'ES', auteurColor: '#1D9E75',
      action: 'vous a attribué un client',
      contenu: 'En charge : Alexandre Delcourt',
      refLabel: 'SARL Bâti Pro', refId: 'c2', refType: 'client'
    },
    {
      id: 'n3', type: 'statut', lu: true,
      date: yesterday.toISOString(),
      auteur: 'Système', auteurInitiales: '⚙', auteurColor: '#888',
      action: 'Changement de statut automatique',
      contenu: 'Martin Dupont : Prospect → Actif (premier devis signé)',
      refLabel: 'Martin Dupont', refId: 'c3', refType: 'client'
    },
    {
      id: 'n4', type: 'mention', lu: true,
      date: lastWeek.toISOString(),
      auteur: 'Xavier Concy', auteurInitiales: 'XC', auteurColor: '#2563eb',
      action: 'vous a mentionné dans une note',
      contenu: '@Alexandre Delcourt RDV confirmé pour vendredi',
      refLabel: 'Isabelle Renard', refId: 'c4', refType: 'client'
    },
  ]
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(defaults))
  return defaults
}

export const saveNotifications = (notifs: Notification[]) => {
  localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifs))
  window.dispatchEvent(new Event('batizo_notifs_updated'))
}

export const addNotification = (notif: Omit<Notification, 'id' | 'date' | 'lu'>) => {
  const notifs = getNotifications()
  notifs.unshift({
    ...notif,
    id: 'n-' + Date.now(),
    date: new Date().toISOString(),
    lu: false,
  })
  saveNotifications(notifs)
}

export const markAllRead = () => {
  const notifs = getNotifications().map(n => ({ ...n, lu: true }))
  saveNotifications(notifs)
}

export const toggleRead = (id: string) => {
  const notifs = getNotifications().map(n => n.id === id ? { ...n, lu: !n.lu } : n)
  saveNotifications(notifs)
}

export const deleteNotif = (id: string) => {
  saveNotifications(getNotifications().filter(n => n.id !== id))
}

export const getUnreadCount = (): number => getNotifications().filter(n => !n.lu).length

export const formatDate = (iso: string): string => {
  const d = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const h = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (h < 1) return 'À l\'instant'
  if (h < 24) return `${h}h`
  if (days === 1) return 'Hier'
  if (days < 7) return `${days} jours`
  return d.toLocaleDateString('fr-FR')
}

export const groupByDate = (notifs: Notification[]): Record<string, Notification[]> => {
  const groups: Record<string, Notification[]> = {}
  const now = new Date()
  notifs.forEach(n => {
    const d = new Date(n.date)
    const diff = Math.floor((now.getTime() - d.getTime()) / 86400000)
    const label = diff === 0 ? "Aujourd'hui" : diff === 1 ? 'Hier' : diff < 7 ? 'Cette semaine' : 'Plus ancien'
    if (!groups[label]) groups[label] = []
    groups[label].push(n)
  })
  return groups
}

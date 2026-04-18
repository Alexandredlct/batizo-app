// Store partagé clients — remplacé par Supabase plus tard
export const CLIENTS_KEY = 'batizo_clients'

export const defaultClients = [
  {id:'c1',type:'professionnel',civilite:'',prenom:'SCI',nom:'Les Pins',email:'contact@lespins.fr',tel:'01 23 45 67 89',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'SCI Les Pins',formeJuridique:'SCI',nbDevis:3,caTotal:38400,margeAvg:62,derniereActivite:'05/04/2026',mois:4,annee:2026},
  {id:'c2',type:'professionnel',civilite:'',prenom:'SARL',nom:'Bâti Pro',email:'contact@batipro.fr',tel:'01 34 56 78 90',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'SARL Bâti Pro',formeJuridique:'SARL',nbDevis:2,caTotal:22100,margeAvg:58,derniereActivite:'03/04/2026',mois:3,annee:2026},
  {id:'c3',type:'particulier',civilite:'M.',prenom:'Martin',nom:'Dupont',email:'m.dupont@gmail.com',tel:'06 12 34 56 78',statut:'actif',enCharge:'Alexandre Delcourt',nbDevis:4,caTotal:18750,margeAvg:55,derniereActivite:'28/03/2026',mois:4,annee:2026},
  {id:'c4',type:'particulier',civilite:'Mme',prenom:'Isabelle',nom:'Renard',email:'i.renard@gmail.com',tel:'06 98 76 54 32',statut:'prospect',enCharge:'Alexandre Delcourt',nbDevis:1,caTotal:8550,margeAvg:48,derniereActivite:'15/02/2025',mois:2,annee:2025},
]

export const getClients = (): any[] => {
  if(typeof window === 'undefined') return defaultClients
  try {
    const stored = localStorage.getItem(CLIENTS_KEY)
    return stored ? JSON.parse(stored) : defaultClients
  } catch { return defaultClients }
}

export const saveClients = (clients: any[]) => {
  try {
    localStorage.setItem(CLIENTS_KEY, JSON.stringify(clients))
    window.dispatchEvent(new Event('batizo_clients_updated'))
  } catch(e) { console.error(e) }
}

export const updateClient = (updated: any) => {
  const clients = getClients()
  const idx = clients.findIndex(c => c.id === updated.id)
  if(idx !== -1) clients[idx] = {...clients[idx], ...updated}
  else clients.push(updated)
  saveClients(clients)
}

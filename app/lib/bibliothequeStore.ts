export const BIBLIO_KEY = 'batizo_bibliotheque'

export type LigneOuvrage = {
  id: string; type: 'materiau'|'mo'
  nom: string; description?: string
  qte: number; pu: number; unite: string; tva: string
}

export type BiblioOuvrage = {
  id: string; nom: string; description?: string
  unite: string; tva: string; prixFacture: number
  categorie: string; lignes: LigneOuvrage[]
  tags?: string
}

export type BiblioMat = {
  id: string; nom: string; description?: string
  unite: string; tva: string; prixFacture: number; categorie: string
}

export type BiblioMO = {
  id: string; nom: string; description?: string
  unite: string; tva: string; prixFacture: number; categorie: string
}

const DEFAULT_OUVRAGES: BiblioOuvrage[] = [
  {
    id:'o1', nom:'Pose parquet complet', description:'Fourniture et pose parquet chêne massif',
    unite:'m²', tva:'10%', prixFacture:103, categorie:'Parquet',
    lignes:[
      {id:'l1',type:'materiau',nom:'Parquet chêne massif 12mm',description:'Parquet chêne massif, finition huilée',qte:1,pu:28,unite:'m²',tva:'10%'},
      {id:'l2',type:'mo',nom:'Pose parquet',description:'Main d\'œuvre pose et finitions',qte:1,pu:15,unite:'m²',tva:'10%'},
    ]
  },
  {
    id:'o2', nom:'Installation tableau électrique', description:'Fourniture et pose tableau complet',
    unite:'u', tva:'20%', prixFacture:850, categorie:'Électricité',
    lignes:[
      {id:'l3',type:'materiau',nom:'Tableau 13 disjoncteurs',description:'Coffret complet 13 postes',qte:1,pu:180,unite:'u',tva:'20%'},
      {id:'l4',type:'mo',nom:'Électricien qualifié',description:'Main d\'œuvre installation',qte:4,pu:45,unite:'h',tva:'20%'},
    ]
  },
]

const DEFAULT_MATS: BiblioMat[] = [
  {id:'m1',nom:'Parquet chêne massif 12mm',description:'Parquet chêne massif, finition huilée',unite:'m²',tva:'10%',prixFacture:68,categorie:'Parquet'},
  {id:'m2',nom:'Carrelage 60x60 grès cérame',description:'Carrelage grand format rectifié',unite:'m²',tva:'20%',prixFacture:85,categorie:'Carrelage'},
  {id:'m3',nom:'Peinture murale mate',description:'Peinture murale mate lessivable',unite:'m²',tva:'10%',prixFacture:22,categorie:'Peinture'},
  {id:'m4',nom:'Tableau électrique 13 disjoncteurs',description:'Coffret complet 13 postes',unite:'u',tva:'20%',prixFacture:480,categorie:'Électricité'},
]

const DEFAULT_MO: BiblioMO[] = [
  {id:'mo1',nom:'Pose parquet',description:'Main d\'œuvre pose et finitions',unite:'m²',tva:'10%',prixFacture:45,categorie:'Parquet'},
  {id:'mo2',nom:'Électricien qualifié',description:'Taux horaire électricien',unite:'h',tva:'20%',prixFacture:65,categorie:'Électricité'},
  {id:'mo3',nom:'Plombier qualifié',description:'Taux horaire plombier',unite:'h',tva:'20%',prixFacture:68,categorie:'Plomberie'},
]

export const getBiblioData = () => {
  if (typeof window === 'undefined') return { ouvrages: DEFAULT_OUVRAGES, materiaux: DEFAULT_MATS, mo: DEFAULT_MO }
  try {
    const stored = localStorage.getItem(BIBLIO_KEY)
    if (stored) return JSON.parse(stored)
  } catch {}
  const data = { ouvrages: DEFAULT_OUVRAGES, materiaux: DEFAULT_MATS, mo: DEFAULT_MO }
  localStorage.setItem(BIBLIO_KEY, JSON.stringify(data))
  return data
}

export const saveBiblioData = (data: any) => {
  localStorage.setItem(BIBLIO_KEY, JSON.stringify(data))
  window.dispatchEvent(new Event('batizo_biblio_updated'))
}

export const getBiblioOuvrages = (): BiblioOuvrage[] => getBiblioData().ouvrages
export const getBiblioMats = (): BiblioMat[] => getBiblioData().materiaux
export const getBiblioMO = (): BiblioMO[] => getBiblioData().mo

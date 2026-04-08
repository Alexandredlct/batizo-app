'use client'
import { useState } from 'react'

const G = '#1D9E75', AM = '#BA7517', RD = '#E24B4A', BD = '#e5e7eb'

const statutColors: Record<string, string> = {
  brouillon: '#888', attente: AM, finalise: '#2563eb', signe: G, refuse: RD, payee: G, impayee: RD
}
const statutLabels: Record<string, string> = {
  brouillon: 'Brouillon', attente: 'En attente', finalise: 'Finalisé', signe: 'Signé', refuse: 'Refusé', payee: 'Payée', impayee: 'Impayée'
}

type Doc = { ref: string; type: string; label?: string; montant: number; date: string; statut: string }
type Chantier = { id: string; mois: string; client: string; titre: string; adresse: string; tel: string; vendeur: string; montantDevis: number; statut: string; archive: boolean; docs: Doc[] }

const initData: Chantier[] = [
  { id:'c042', mois:'Avril 2026', client:'Martin Dupont', titre:'Rénovation salle de bain', adresse:'45 av. des Fleurs, Courbevoie 92400', tel:'06 12 34 56 78', vendeur:'Alexandre D.', montantDevis:4200, statut:'attente', archive:false,
    docs:[
      { ref:'DEV-2026-042', type:'devis', montant:4200, date:'05/04/2026', statut:'attente' },
      { ref:'FAC-2026-042-A', type:'facture', label:'Acompte', montant:1260, date:'05/04/2026', statut:'impayee' },
    ]
  },
  { id:'c041', mois:'Avril 2026', client:'SCI Les Pins', titre:'Réfection façade + peinture', adresse:'12 rue Victor Hugo, Paris 75017', tel:'01 45 67 89 10', vendeur:'Emma S.', montantDevis:12800, statut:'signe', archive:false,
    docs:[
      { ref:'DEV-2026-041', type:'devis', montant:12800, date:'03/04/2026', statut:'signe' },
      { ref:'FAC-2026-041-A', type:'facture', label:'Acompte 30%', montant:3840, date:'03/04/2026', statut:'payee' },
      { ref:'FAC-2026-041-B', type:'facture', label:'Inter. 45%', montant:5760, date:'20/04/2026', statut:'finalise' },
    ]
  },
  { id:'c040', mois:'Avril 2026', client:'Isabelle Renard', titre:'Pose parquet 45m²', adresse:'8 rue des Lilas, Levallois 92300', tel:'06 98 76 54 32', vendeur:'Alexandre D.', montantDevis:1950, statut:'attente', archive:false,
    docs:[
      { ref:'DEV-2026-040', type:'devis', montant:1950, date:'01/04/2026', statut:'attente' },
    ]
  },
  { id:'c039', mois:'Mars 2026', client:'SARL Bâti Pro', titre:'Rénovation bureaux 180m²', adresse:'5 rue du Commerce, Boulogne 92100', tel:'01 46 05 12 34', vendeur:'Emma S.', montantDevis:8600, statut:'refuse', archive:false,
    docs:[
      { ref:'DEV-2026-039', type:'devis', montant:8600, date:'28/03/2026', statut:'refuse' },
    ]
  },
  { id:'c038', mois:'Mars 2026', client:'M. Fontaine', titre:'Installation électrique complète', adresse:'22 bd Haussmann, Paris 75009', tel:'06 55 44 33 22', vendeur:'Alexandre D.', montantDevis:12800, statut:'signe', archive:false,
    docs:[
      { ref:'DEV-2026-038', type:'devis', montant:12800, date:'15/03/2026', statut:'signe' },
      { ref:'FAC-2026-038-A', type:'facture', label:'Acompte 30%', montant:3840, date:'15/03/2026', statut:'payee' },
      { ref:'FAC-2026-038-B', type:'facture', label:'Finale', montant:8960, date:'28/03/2026', statut:'payee' },
    ]
  },
]

const tabs = ['tous','brouillon','attente','finalise','signe','refuse','archive']
const tabLabels: Record<string,string> = { tous:'Tous', brouillon:'Brouillon', attente:'En attente', finalise:'Finalisé', signe:'Signé', refuse:'Refusé', archive:'Archivés' }
const docMenuItems = ["Facture vierge","Facture d'acompte","Facture intermédiaire","Facture finale"]
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' €'

const NavIcon = ({id}: {id:string}) => {
  if (id==='dashboard') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  if (id==='devis') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id==='clients') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}

export default function DevisPage() {
  const [activeTab, setActiveTab] = useState('tous')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string,boolean>>({})
  const [showFiltre, setShowFiltre] = useState(false)
  const [chantiers, setChantiers] = useState<Chantier[]>(initData)
  const [toast, setToast] = useState<{visible:boolean, id:string|null}>({visible:false, id:null})
  const [tooltip, setTooltip] = useState<string|null>(null)
  const [docMenu, setDocMenu] = useState<string|null>(null)
  const [actionMenu, setActionMenu] = useState<string|null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const sw = collapsed ? 64 : 230

  const toggle = (id: string) => setExpanded(p => ({...p, [id]: !p[id]}))

  const archiver = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setChantiers(p => p.map(c => c.id === id ? {...c, archive: true} : c))
    setToast({visible: true, id})
    setTimeout(() => setToast({visible: false, id: null}), 5000)
  }

  const annulerArchivage = () => {
    if (toast.id) setChantiers(p => p.map(c => c.id === toast.id ? {...c, archive: false} : c))
    setToast({visible: false, id: null})
  }

  const handleStatutChange = (chantierId: string, docRef: string, newStatut: string, docType: string) => {
    setChantiers(prev => prev.map(c => {
      if (c.id !== chantierId) return c
      const newDocs = c.docs.map(d => d.ref === docRef ? {...d, statut: newStatut} : d)
      let newStatutChantier = c.statut
      if (docType === 'devis') newStatutChantier = newStatut
      return {...c, docs: newDocs, statut: newStatutChantier}
    }))
  }

  const getMontantFacture = (c: Chantier) => c.docs.filter(d => d.type === 'facture' && d.statut === 'payee').reduce((s, d) => s + d.montant, 0)

  const matchSearch = (c: Chantier) => {
    if (!search) return true
    const q = search.toLowerCase()
    const docDetails = c.docs.map(d => `${d.ref} ${d.label||''} ${fmt(d.montant)} ${statutLabels[d.statut]||''}`).join(' ')
    const target = `${c.client} ${c.titre} ${c.adresse} ${c.tel} ${c.vendeur} ${fmt(c.montantDevis)} ${fmt(getMontantFacture(c))} ${docDetails} ${statutLabels[c.statut]} ${c.mois}`.toLowerCase()
    return target.includes(q)
  }

  const filtered = chantiers.filter(c => {
    if (c.archive && activeTab !== 'archive') return false
    if (!c.archive && activeTab === 'archive') return false
    if (activeTab !== 'tous' && activeTab !== 'archive' && c.statut !== activeTab) return false
    return matchSearch(c)
  })

  const getCount = (tab: string) => {
    if (tab === 'tous') return chantiers.filter(c => !c.archive && matchSearch(c)).length
    if (tab === 'archive') return chantiers.filter(c => c.archive).length
    return chantiers.filter(c => !c.archive && c.statut === tab && matchSearch(c)).length
  }

  const moisList = [...new Set(chantiers.map(c => c.mois))]

  const getMoisStats = (mois: string) => {
    const items = filtered.filter(c => c.mois === mois)
    const totalDevis = items.reduce((s, c) => s + c.montantDevis, 0)
    const totalPaye = items.reduce((s, c) => s + getMontantFacture(c), 0)
    return { count: items.length, totalDevis, totalPaye, aEncaisser: totalDevis - totalPaye }
  }

  const navItems = [
    {id:'dashboard', label:'Tableau de bord', href:'/dashboard'},
    {id:'devis', label:'Devis & Factures', href:'/devis', badge:'8'},
    {id:'clients', label:'Clients', href:'/clients'},
    {id:'bibliotheque', label:'Bibliothèque', href:'/bibliotheque'},
  ]

  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={() => { setActionMenu(null); setDocMenu(null) }}>

      {/* SIDEBAR */}
      <div style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
        <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,minHeight:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {!collapsed && <a href="/dashboard" style={{fontSize:'18px',fontWeight:'800',color:'#111',textDecoration:'none'}}>Bati<span style={{color:G}}>zo</span></a>}
          <button onClick={() => setCollapsed(!collapsed)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',padding:4,borderRadius:6,marginLeft:collapsed?'auto':0}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {navItems.map(n => (
            <a key={n.id} href={n.href} title={collapsed ? n.label : undefined}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,background:n.id==='devis'?'#f0fdf4':'none',color:n.id==='devis'?G:'#555',fontWeight:n.id==='devis'?600:400,fontSize:13,textDecoration:'none',justifyContent:collapsed?'center':'flex-start',transition:'background 0.15s'}}
              onMouseEnter={e => { if(n.id!=='devis') (e.currentTarget as HTMLAnchorElement).style.background='#f9fafb' }}
              onMouseLeave={e => { if(n.id!=='devis') (e.currentTarget as HTMLAnchorElement).style.background='none' }}>
              <NavIcon id={n.id}/>
              {!collapsed && <span style={{flex:1}}>{n.label}</span>}
              {!collapsed && n.badge && <span style={{background:G,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{n.badge}</span>}
            </a>
          ))}
        </nav>
        {!collapsed ? (
          <div style={{padding:12,borderTop:`1px solid ${BD}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>A</div>
              <div style={{overflow:'hidden',flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'#111',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Mon compte</div>
                <div style={{fontSize:11,color:'#888'}}>Batizo</div>
              </div>
              <a href="/login" style={{color:'#aaa',textDecoration:'none',flexShrink:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </a>
            </div>
          </div>
        ) : (
          <div style={{padding:12,borderTop:`1px solid ${BD}`}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,margin:'0 auto'}}>A</div>
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Devis & Factures</div>
          <div style={{display:'flex',gap:10}}>
            <button style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exporter
            </button>
            <a href="/devis/nouveau" style={{padding:'8px 16px',background:G,color:'#fff',borderRadius:8,fontSize:13,fontWeight:600,textDecoration:'none',display:'flex',alignItems:'center'}}>+ Nouveau devis</a>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* Onglets */}
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            {tabs.map(t => {
              const count = getCount(t)
              return (
                <button key={t} onClick={() => setActiveTab(t)}
                  style={{padding:'6px 14px',borderRadius:20,border:`1px solid ${activeTab===t?G:BD}`,background:activeTab===t?'#f0fdf4':'#fff',color:activeTab===t?G:'#555',fontSize:13,fontWeight:activeTab===t?600:400,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                  {tabLabels[t]}
                  <span style={{background:activeTab===t?G:'#e5e7eb',color:activeTab===t?'#fff':'#888',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10,minWidth:16,textAlign:'center'}}>{count}</span>
                </button>
              )
            })}
          </div>

          {/* Recherche */}
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <div style={{flex:1,position:'relative'}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Client, numéro, adresse, vendeur, montant, statut…"
                style={{width:'100%',padding:'9px 36px 9px 36px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box'}}/>
              {search && <button onClick={() => setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18,lineHeight:1}}>×</button>}
            </div>
            <button onClick={() => setShowFiltre(!showFiltre)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'9px 16px',border:`1px solid ${showFiltre?G:BD}`,borderRadius:8,background:showFiltre?'#f0fdf4':'#fff',color:showFiltre?G:'#555',fontSize:13,cursor:'pointer'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtrer
            </button>
          </div>

          {/* Filtres avancés */}
          {showFiltre && (
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'1.25rem',marginBottom:16,display:'flex',gap:24,flexWrap:'wrap',alignItems:'flex-end'}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Période</div>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <input type="date" style={{padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
                  <span style={{color:'#aaa'}}>→</span>
                  <input type="date" style={{padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
                </div>
              </div>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:'#888',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.05em'}}>Vendeur</div>
                <select style={{padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff',minWidth:160}}>
                  <option>Tous les vendeurs</option><option>Alexandre D.</option><option>Emma S.</option>
                </select>
              </div>
              <button onClick={() => setShowFiltre(false)} style={{padding:'8px 16px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,background:'#fff',color:'#888',cursor:'pointer'}}>Réinitialiser</button>
            </div>
          )}

          {/* Liste par mois */}
          {moisList.map(mois => {
            const items = filtered.filter(c => c.mois === mois)
            if (items.length === 0) return null
            const stats = getMoisStats(mois)
            return (
              <div key={mois} style={{marginBottom:28}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 0',borderBottom:`2px solid ${BD}`,marginBottom:10,flexWrap:'wrap',gap:8}}>
                  <span style={{fontSize:14,fontWeight:700,color:'#111'}}>{mois}</span>
                  <span style={{fontSize:12,color:'#555'}}>
                    {stats.count} devis &nbsp;·&nbsp; <strong>{fmt(stats.totalDevis)} HT</strong> devisés &nbsp;·&nbsp;
                    <span style={{color:G,fontWeight:600}}>{fmt(stats.totalPaye)} HT payés</span> &nbsp;·&nbsp;
                    <span style={{color:RD,fontWeight:600}}>{fmt(stats.aEncaisser)} HT à encaisser</span>
                  </span>
                </div>

                {items.map(c => {
                  const montantFacture = getMontantFacture(c)
                  return (
                    <div key={c.id} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,marginBottom:8,overflow:'visible',position:'relative',transition:'box-shadow 0.15s'}}
                      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow='0 2px 12px rgba(29,158,117,0.1)'}
                      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow=''}>

                      <div onClick={() => toggle(c.id)} style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',padding:'14px 16px',cursor:'pointer',transition:'background 0.15s',borderRadius:expanded[c.id]?'10px 10px 0 0':'10px'}}
                        onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                        onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background=''}>
                        <div style={{display:'flex',alignItems:'flex-start',gap:12,flex:1,minWidth:0}}>
                          <span style={{color:G,fontSize:11,marginTop:3,flexShrink:0,display:'inline-block',transition:'transform 0.2s',transform:expanded[c.id]?'rotate(90deg)':'rotate(0deg)'}}>▶</span>
                          <div>
                            <div style={{fontSize:14,fontWeight:700,marginBottom:4,color:'#111'}}>{c.client} — {c.titre}</div>
                            <div style={{fontSize:12,color:'#666',marginBottom:2}}>
                              Total devisé : <strong>{fmt(c.montantDevis)} HT</strong> · Total facturé : <strong style={{color:montantFacture===0?'#aaa':G}}>{fmt(montantFacture)} HT</strong>
                            </div>
                            <div style={{fontSize:12,color:'#888'}}>📍 {c.adresse} · 📞 {c.tel}</div>
                            <div style={{fontSize:12,color:'#888'}}>👤 Vendeur : <strong style={{color:'#555'}}>{c.vendeur}</strong></div>
                          </div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}} onClick={e => e.stopPropagation()}>
                          <span style={{background:`${statutColors[c.statut]}18`,color:statutColors[c.statut],padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{statutLabels[c.statut]}</span>
                          <div style={{display:'inline-flex',alignItems:'center',gap:4}}>
                            <button onClick={e => archiver(c.id, e)}
                              style={{display:'flex',alignItems:'center',gap:4,padding:'5px 10px',border:`1px solid ${BD}`,borderRadius:6,background:'#fff',fontSize:11,cursor:'pointer',color:'#666',transition:'all 0.15s'}}
                              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor=AM; b.style.color=AM; b.style.background='#fffbeb' }}
                              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor=BD; b.style.color='#666'; b.style.background='#fff' }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                              Archiver
                            </button>
                            <div style={{position:'relative'}}>
                              <button onMouseEnter={() => setTooltip(c.id)} onMouseLeave={() => setTooltip(null)}
                                style={{width:20,height:20,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',fontSize:11,fontWeight:700,color:'#888',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>?</button>
                              {tooltip === c.id && (
                                <div style={{position:'absolute',right:0,bottom:26,background:'#fff',color:'#333',fontSize:12,padding:'10px 14px',borderRadius:10,zIndex:300,width:250,lineHeight:1.6,boxShadow:'0 4px 20px rgba(0,0,0,0.15)',border:`1px solid ${BD}`}}>
                                  <div style={{position:'absolute',bottom:-6,right:12,width:12,height:12,background:'#fff',border:`1px solid ${BD}`,borderLeft:'none',borderTop:'none',transform:'rotate(45deg)'}}></div>
                                  Pour retrouver un élément archivé, cliquez sur le filtre <strong style={{color:G}}>"Archivés"</strong> dans la barre de filtres.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {expanded[c.id] && (
                        <div style={{borderTop:`1px solid ${BD}`}}>
                          <table style={{width:'100%',borderCollapse:'collapse'}}>
                            <thead><tr style={{background:'#f9fafb'}}>
                              <th style={{padding:'8px 16px',textAlign:'left',fontSize:11,color:'#888',fontWeight:600,width:30}}></th>
                              <th style={{padding:'8px 16px',textAlign:'left',fontSize:11,color:'#888',fontWeight:600}}>Référence</th>
                              <th style={{padding:'8px 16px',textAlign:'right',fontSize:11,color:'#888',fontWeight:600}}>Montant HT</th>
                              <th style={{padding:'8px 16px',textAlign:'center',fontSize:11,color:'#888',fontWeight:600}}>Date</th>
                              <th style={{padding:'8px 16px',textAlign:'center',fontSize:11,color:'#888',fontWeight:600}}>Statut</th>
                              <th style={{padding:'8px 16px',width:40}}></th>
                            </tr></thead>
                            <tbody>
                              {c.docs.map((d, di) => (
                                <tr key={di} style={{borderTop:`1px solid ${BD}`,transition:'background 0.15s'}}
                                  onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='#f0fdf4'}
                                  onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background=''}>
                                  <td style={{padding:'10px 16px'}}>
                                    {d.type==='devis'
                                      ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                                      : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>}
                                  </td>
                                  <td style={{padding:'10px 16px',fontSize:13,fontWeight:500}}>
                                    {d.ref} {d.label && <span style={{fontSize:11,color:'#aaa',marginLeft:4}}>{d.label}</span>}
                                  </td>
                                  <td style={{padding:'10px 16px',textAlign:'right',fontSize:13,fontWeight:600}}>{fmt(d.montant)}</td>
                                  <td style={{padding:'10px 16px',textAlign:'center',fontSize:12,color:'#666'}}>{d.date}</td>
                                  <td style={{padding:'10px 16px',textAlign:'center'}}>
                                    <select value={d.statut} onChange={e => handleStatutChange(c.id, d.ref, e.target.value, d.type)}
                                      style={{padding:'4px 8px',border:`1px solid ${statutColors[d.statut]}`,borderRadius:6,fontSize:12,color:statutColors[d.statut],fontWeight:600,background:`${statutColors[d.statut]}18`,outline:'none',cursor:'pointer'}}>
                                      {d.type==='devis'
                                        ? ['brouillon','attente','finalise','signe','refuse'].map(s => <option key={s} value={s}>{statutLabels[s]}</option>)
                                        : ['brouillon','finalise','impayee','payee'].map(s => <option key={s} value={s}>{statutLabels[s]}</option>)}
                                    </select>
                                  </td>
                                  <td style={{padding:'10px 16px',textAlign:'center',position:'relative'}}>
                                    <button onClick={e => { e.stopPropagation(); setActionMenu(actionMenu===`${c.id}-${di}` ? null : `${c.id}-${di}`) }}
                                      style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18,lineHeight:1,padding:'2px 4px',borderRadius:4,transition:'all 0.15s'}}
                                      onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color='#333'; b.style.background='#f0f0f0' }}
                                      onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.color='#aaa'; b.style.background='none' }}>⋯</button>
                                    {actionMenu === `${c.id}-${di}` && (
                                      <div onClick={e => e.stopPropagation()} style={{position:'absolute',right:8,bottom:36,background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',zIndex:400,minWidth:180,overflow:'hidden'}}>
                                        <div style={{position:'absolute',bottom:-6,right:16,width:12,height:12,background:'#fff',border:`1px solid ${BD}`,borderLeft:'none',borderTop:'none',transform:'rotate(45deg)'}}></div>
                                        {[{icon:'✏️',label:'Modifier'},{icon:'📥',label:'Télécharger PDF'},{icon:'📧',label:'Envoyer par email'}].map(item => (
                                          <div key={item.label} onClick={() => setActionMenu(null)}
                                            style={{padding:'10px 14px',fontSize:13,cursor:'pointer',color:'#333',display:'flex',alignItems:'center',gap:8,transition:'all 0.15s'}}
                                            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background='#f0fdf4'; el.style.color=G }}
                                            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background=''; el.style.color='#333' }}>
                                            <span>{item.icon}</span>{item.label}
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <div style={{position:'relative'}}>
                            <div onClick={e => { e.stopPropagation(); setDocMenu(docMenu===c.id ? null : c.id) }}
                              style={{padding:'10px 16px',borderTop:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:6,fontSize:13,color:G,cursor:'pointer',background:'#f9fafb',transition:'background 0.15s',userSelect:'none' as const}}
                              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                              Créer un document
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" style={{marginLeft:'auto',transform:docMenu===c.id?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
                            </div>
                            {docMenu === c.id && (
                              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:100}}>
                                {docMenuItems.map(item => (
                                  <div key={item} onClick={() => setDocMenu(null)}
                                    style={{padding:'10px 16px',fontSize:13,cursor:'pointer',color:'#333',display:'flex',alignItems:'center',gap:8,transition:'all 0.15s'}}
                                    onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.background='#f0fdf4'; el.style.color=G }}
                                    onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.background=''; el.style.color='#333' }}>
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
                                    {item}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{textAlign:'center',padding:'3rem',color:'#888',fontSize:14}}>Aucun résultat{search ? ` pour "${search}"` : ''}</div>
          )}

          <div style={{textAlign:'center',padding:'1rem 0 2rem'}}>
            <button style={{padding:'10px 24px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,color:'#666',cursor:'pointer',transition:'all 0.15s'}}
              onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor=G; b.style.color=G; b.style.background='#f0fdf4' }}
              onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.borderColor=BD; b.style.color='#666'; b.style.background='#fff' }}>
              ↓ Charger les mois précédents
            </button>
          </div>
        </div>
      </div>

      {toast.visible && (
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:12,padding:'12px 20px',zIndex:9999,display:'flex',alignItems:'center',gap:12,minWidth:320,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span style={{flex:1,fontSize:13}}>Chantier archivé avec succès</span>
          <button onClick={annulerArchivage} style={{background:'none',border:'1px solid rgba(255,255,255,0.3)',borderRadius:6,color:'#fff',fontSize:12,padding:'4px 10px',cursor:'pointer',whiteSpace:'nowrap'}}>Annuler</button>
        </div>
      )}
    </div>
  )
}

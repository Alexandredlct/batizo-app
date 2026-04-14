'use client'
import NouveauDevisModal from '../components/NouveauDevisModal'
import FicheClientPanel from '../components/FicheClientPanel'
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar'
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const G = '#1D9E75', AM = '#BA7517', RD = '#E24B4A', BD = '#e5e7eb'

const NavIcon = ({ id }: { id: string }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    devis: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    clients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    bibliotheque: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  }
  return icons[id] || <span>•</span>
}

export default function DashboardPage() {
  const[showNouveauDevis,setShowNouveauDevis]=useState(false)
  const[ficheClient,setFicheClient]=useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
  }, [])

  const[prenomLocal,setPrenomLocal]=useState<string>(()=>{
    if(typeof window==='undefined') return ''
    return localStorage.getItem('batizo_prenom')||''
  })
  const prenom = prenomLocal||''
  const entreprise = user?.user_metadata?.entreprise || 'votre entreprise'
  const sw = collapsed ? 64 : 230

  const navItems = [
    {id:'dashboard', label:'Tableau de bord', href:'/dashboard'},
    {id:'devis', label:'Devis & Factures', href:'/devis', badge:'8'},
    {id:'clients', label:'Clients', href:'/clients'},
    {id:'bibliotheque', label:'Bibliothèque', href:'/bibliotheque'},
  ]

  const devis = [
    { client:'Martin Dupont', num:'DEV-2026-042', date:'05/04', montant:'4 200 € HT', statut:'Envoyé', sc:'#2563eb', mois:4, annee:2026 },
    { client:'SCI Les Pins', num:'DEV-2026-041', date:'03/04', montant:'12 800 € HT', statut:'Signé', sc:G, mois:4, annee:2026 },
    { client:'Isabelle Renard', num:'DEV-2026-040', date:'01/04', montant:'1 950 € HT', statut:'En attente', sc:AM },
    { client:'SARL Bâti Pro', num:'DEV-2026-039', date:'28/03', montant:'8 600 € HT', statut:'Refusé', sc:RD },
  ]

  const[periodeTop,setPeriodeTop]=useState<'mois'|'mois_prec'|'annee'|'annee_prec'>('annee')
  const[periodeDevis,setPeriodeDevis]=useState<'mois'|'mois_prec'|'annee'|'annee_prec'>('annee')
  const now=new Date()
  const filterByPeriode=(items:any[],periode:string)=>{
    return items.filter(d=>{
      if(!d.mois) return true
      if(periode==='mois') return d.mois===now.getMonth()+1&&d.annee===now.getFullYear()
      if(periode==='mois_prec'){const pm=now.getMonth()===0?12:now.getMonth();const py=now.getMonth()===0?now.getFullYear()-1:now.getFullYear();return d.mois===pm&&d.annee===py}
      if(periode==='annee') return d.annee===now.getFullYear()
      if(periode==='annee_prec') return d.annee===now.getFullYear()-1
      return true
    })
  }
  const clientsData:any[] = [
    {id:'c1',civilite:'',prenom:'SCI',nom:'Les Pins',email:'contact@lespins.fr',tel:'01 23 45 67 89',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'SCI Les Pins',nbDevis:3,caTotal:38400,margeAvg:62,derniereActivite:'05/04/2026'},
    {id:'c2',civilite:'M.',prenom:'SARL',nom:'Bâti Pro',email:'contact@batipro.fr',tel:'01 34 56 78 90',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'SARL Bâti Pro',nbDevis:2,caTotal:22100,margeAvg:58,derniereActivite:'03/04/2026'},
    {id:'c3',civilite:'M.',prenom:'Martin',nom:'Dupont',email:'m.dupont@gmail.com',tel:'06 12 34 56 78',statut:'actif',enCharge:'Alexandre Delcourt',nbDevis:4,caTotal:18750,margeAvg:55,derniereActivite:'28/03/2026'},
    {id:'c4',civilite:'Mme',prenom:'Isabelle',nom:'Renard',email:'i.renard@gmail.com',tel:'06 98 76 54 32',statut:'prospect',enCharge:'Alexandre Delcourt',nbDevis:1,caTotal:8550,margeAvg:48,derniereActivite:'15/02/2025'},
  ]
  const topClientsData:{nom:string,n:number,ca:string,mois:number,annee:number}[] = [
    { nom:'SCI Les Pins', n:3, ca:'38 400 €', mois:4, annee:2026 },
    { nom:'SARL Bâti Pro', n:2, ca:'22 100 €', mois:3, annee:2026 },
    { nom:'Martin Dupont', n:4, ca:'18 750 €', mois:4, annee:2026 },
    { nom:'Isabelle Renard', n:1, ca:'8 550 €', mois:2, annee:2025 },
  ]

  const getStatutColor=(s:string)=>{
    if(s==='Brouillon') return '#888'
    if(s==='En attente') return '#BA7517'
    if(s==='Envoyé') return '#2563eb'
    if(s==='Signé') return '#1D9E75'
    if(s==='Refusé') return '#E24B4A'
    return '#888'
  }
  const devisFiltres=filterByPeriode(devis,periodeDevis)
  const topClientsFiltres=filterByPeriode(topClientsData,periodeTop)

  const actions = [
    {l:'Nouveau devis', e:'📄', href:'/devis', modal:true},
    {l:'Nouvelle facture', e:'🧾', href:'/devis'},
    {l:'Nouveau client', e:'👤', href:'/clients?new=1'},
    {l:'Ajouter matériau', e:'📦', href:'/bibliotheque?new=materiau'},
    {l:'Ajouter ouvrage', e:'🔨', href:'/bibliotheque?new=ouvrage'},
    {l:"Ajouter main d'œuvre", e:'👷', href:'/bibliotheque?new=mo'},
    {l:'Voir les impayés', e:'⚠️'},
  ]

  return (
    <>
    <div onClick={() => setUserMenu(false)} style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>

      <Sidebar activePage="dashboard"/>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Tableau de bord</div><SearchBar/>
          <div style={{display:'flex',gap:10}}>
            <button style={{padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer'}}>+ Nouveau client</button>
            <button onClick={()=>setShowNouveauDevis(true)} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau devis</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#111'}}>{prenomLocal!==null?`Bonjour${prenom?' '+prenom:''} 👋`:''}</h2>
            <p style={{fontSize:14,color:'#111',margin:0}}>Voici un résumé de votre activité</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
            {[
              {label:'CA ce mois',value:'24 850 € HT',change:'↑ +12% vs mars',cc:G},
              {label:'CA cette année',value:'87 400 € HT',change:'↑ +18% vs 2025',cc:G},
              {label:'Devis en attente',value:'8',change:'42 300 € HT en jeu',cc:AM,vc:AM},
              {label:'Factures impayées',value:'3 400 € HT',change:'2 en retard',cc:RD,vc:RD},
              {label:'Marge moyenne',value:'34%',change:'↑ +2pts vs mars',cc:G},
            ].map(m => (
              <div key={m.label} style={{background:'#fff',borderRadius:12,padding:16,border:`1px solid ${BD}`}}>
                <div style={{fontSize:12,color:'#444',fontWeight:500,marginBottom:6}}>{m.label}</div>
                <div style={{fontSize:20,fontWeight:700,color:(m as any).vc||'#111',marginBottom:4}}>{m.value}</div>
                <div style={{fontSize:12,color:m.cc,fontWeight:500}}>{m.change}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:6}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Derniers devis</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{display:'flex',gap:4}}>
                    {([['mois','Ce mois'],['mois_prec','Mois préc.'],['annee','Cette année'],['annee_prec','Année préc.']] as const).map(([v,l])=>(
                      <button key={v} onClick={()=>setPeriodeDevis(v)}
                        style={{padding:'3px 8px',borderRadius:12,border:`1px solid ${periodeDevis===v?G:BD}`,background:periodeDevis===v?'#f0fdf4':'#fff',color:periodeDevis===v?G:'#888',fontSize:11,fontWeight:periodeDevis===v?600:400,cursor:'pointer'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <a href="/devis" style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600,textDecoration:'none',marginLeft:8}}>Voir tout →</a>
                </div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <tbody>
                  {devisFiltres.map((d,i) => (
                    <tr key={i} onClick={()=>window.location.href=`/devis/${d.id||'nouveau'}`} onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background="#f0fdf4"}} onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background=""}} style={{borderTop:i===0?'none':`1px solid ${BD}`,cursor:'pointer'}}>
                      <td style={{padding:'10px 16px'}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.client}</div>
                        <div style={{fontSize:11,color:'#888'}}>{d.num} · {d.date}</div>
                      </td>
                      <td style={{padding:'10px 16px',textAlign:'right' as const,fontSize:13,fontWeight:600,color:'#111'}}>{d.montant}</td>
                      <td style={{padding:'10px 16px',textAlign:'right' as const}}>
                        <span style={{background:`${getStatutColor(d.statut)}22`,color:getStatutColor(d.statut),padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{d.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:6}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Top clients</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{display:'flex',gap:4}}>
                    {([['mois','Ce mois'],['mois_prec','Mois préc.'],['annee','Cette année'],['annee_prec','Année préc.']] as const).map(([v,l])=>(
                      <button key={v} onClick={()=>setPeriodeTop(v)}
                        style={{padding:'3px 8px',borderRadius:12,border:`1px solid ${periodeTop===v?G:BD}`,background:periodeTop===v?'#f0fdf4':'#fff',color:periodeTop===v?G:'#888',fontSize:11,fontWeight:periodeTop===v?600:400,cursor:'pointer'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <a href="/clients" style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600,textDecoration:'none',marginLeft:8}}>Voir tout →</a>
                </div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <tbody>
                {topClientsFiltres.map((cl,i)=>(
                  <tr key={i} style={{borderBottom:i<topClientsData.length-1?`1px solid ${BD}`:'',cursor:'pointer'}}
                    onClick={()=>setFicheClient(clientsData.find(c=>c.nom===cl.nom||c.prenom+' '+c.nom===cl.nom)||clientsData[i])}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f0fdf4'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                    <td style={{padding:'10px 16px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{cl.nom}</div>
                      <div style={{fontSize:11,color:'#888'}}>{cl.n} chantier{cl.n>1?'s':''}</div>
                    </td>
                    <td style={{padding:'10px 16px',textAlign:'right' as const,fontSize:13,fontWeight:600,color:'#111'}}>{cl.ca} HT</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:'#111'}}>Actions rapides</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {actions.map(a => (
                <button key={a.l} onClick={()=>{if((a as any).modal){setShowNouveauDevis(true)}else if((a as any).href) window.location.href=(a as any).href}} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',whiteSpace:'nowrap'}}>
                  {a.e} {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    {showNouveauDevis&&<NouveauDevisModal onClose={()=>setShowNouveauDevis(false)}/>}
    {ficheClient&&<FicheClientPanel client={ficheClient} onClose={()=>setFicheClient(null)}/>}
    </>
  )
}

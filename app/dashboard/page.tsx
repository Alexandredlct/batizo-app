'use client'
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
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
  }, [])

  const prenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'vous'
  const entreprise = user?.user_metadata?.entreprise || 'votre entreprise'
  const sw = collapsed ? 64 : 230

  const navItems = [
    {id:'dashboard', label:'Tableau de bord', href:'/dashboard'},
    {id:'devis', label:'Devis & Factures', href:'/devis', badge:'8'},
    {id:'clients', label:'Clients', href:'/clients'},
    {id:'bibliotheque', label:'Bibliothèque', href:'/bibliotheque'},
  ]

  const devis = [
    { client:'Martin Dupont', num:'DEV-2026-042', date:'05/04', montant:'4 200 € HT', statut:'Envoyé', sc:'#2563eb' },
    { client:'SCI Les Pins', num:'DEV-2026-041', date:'03/04', montant:'12 800 € HT', statut:'Signé', sc:G },
    { client:'Isabelle Renard', num:'DEV-2026-040', date:'01/04', montant:'1 950 € HT', statut:'En attente', sc:AM },
    { client:'SARL Bâti Pro', num:'DEV-2026-039', date:'28/03', montant:'8 600 € HT', statut:'Refusé', sc:RD },
  ]

  const topClients = [
    { i:'SL', nom:'SCI Les Pins', n:3, ca:'38 400 €', bg:'#dcfce7', c:'#166534' },
    { i:'SB', nom:'SARL Bâti Pro', n:2, ca:'22 100 €', bg:'#dbeafe', c:'#1d4ed8' },
    { i:'MD', nom:'Martin Dupont', n:4, ca:'18 750 €', bg:'#fce7f3', c:'#9d174d' },
    { i:'IR', nom:'Isabelle Renard', n:1, ca:'8 550 €', bg:'#fef3c7', c:'#92400e' },
  ]

  const actions = [
    {l:'Nouveau devis', e:'📄', href:'/devis'},
    {l:'Nouvelle facture', e:'🧾', href:'/devis'},
    {l:'Nouveau client', e:'👤', href:'/clients?new=1'},
    {l:'Ajouter matériau', e:'📦', href:'/bibliotheque'},
    {l:'Ajouter ouvrage', e:'🔨'},
    {l:"Ajouter main d'œuvre", e:'👷'},
    {l:'Voir les impayés', e:'⚠️'},
  ]

  return (
    <div onClick={() => setUserMenu(false)} style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>

      <Sidebar activePage="dashboard"/>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Tableau de bord</div>
          <div style={{display:'flex',gap:10}}>
            <button style={{padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer'}}>+ Nouveau client</button>
            <button style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau devis</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#111'}}>Bonjour {prenom} 👋</h2>
            <p style={{fontSize:14,color:'#111',margin:0}}>Voici un résumé de votre activité — Avril 2026</p>
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
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Derniers devis</span>
                <span style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600}}>Voir tout →</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  <th style={{padding:'8px 16px',textAlign:'left',fontSize:12,color:'#555',fontWeight:600}}>Client</th>
                  <th style={{padding:'8px 16px',textAlign:'right',fontSize:12,color:'#555',fontWeight:600}}>Montant HT</th>
                  <th style={{padding:'8px 16px',textAlign:'right',fontSize:12,color:'#555',fontWeight:600}}>Statut</th>
                </tr></thead>
                <tbody>
                  {devis.map((d,i) => (
                    <tr key={i} onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4"}} onMouseLeave={e=>{e.currentTarget.style.background=""}} style={{borderTop:`1px solid ${BD}`}}>
                      <td style={{padding:'10px 16px'}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.client}</div>
                        <div style={{fontSize:12,color:'#555'}}>{d.num} · {d.date}</div>
                      </td>
                      <td style={{padding:'10px 16px',textAlign:'right',fontSize:13,fontWeight:600,color:'#111'}}>{d.montant}</td>
                      <td style={{padding:'10px 16px',textAlign:'right'}}>
                        <span style={{background:`${d.sc}22`,color:d.sc,padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{d.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Top clients 2026</span>
                <span style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600}}>Voir tout →</span>
              </div>
              <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:12}}>
                {topClients.map((c,i) => (
                  <div key={i} className="client-row" style={{display:"flex",alignItems:"center",gap:12,padding:"8px 12px",borderTop:i>0?`1px solid ${BD}`:"none",transition:"background 0.15s"}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:c.c}}>{c.i}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{c.nom}</div>
                      <div style={{fontSize:12,color:'#555'}}>{c.n} chantier{c.n>1?'s':''}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{c.ca}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:'#111'}}>Actions rapides</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {actions.map(a => (
                <button key={a.l} onClick={()=>{if((a as any).href) window.location.href=(a as any).href}} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',whiteSpace:'nowrap'}}>
                  {a.e} {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

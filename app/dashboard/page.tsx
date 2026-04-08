'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const G = '#1D9E75', AM = '#BA7517', RD = '#E24B4A', BD = '#e5e7eb'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
  }, [])

  const prenom = user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'vous'
  const entreprise = user?.user_metadata?.entreprise || 'votre entreprise'
  const sw = collapsed ? 64 : 230

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
    {l:'Nouveau devis', e:'📄'},
    {l:'Nouvelle facture', e:'🧾'},
    {l:'Nouveau client', e:'👤'},
    {l:'Ajouter matériau', e:'📦'},
    {l:'Ajouter ouvrage', e:'🔨'},
    {l:"Ajouter main d'œuvre", e:'👷'},
    {l:'Voir les impayés', e:'⚠️'},
  ]

  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>
      <div style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
        <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',minHeight:60}}>
          {!collapsed && <span style={{fontSize:'18px',fontWeight:'800',color:'#111'}}>Bati<span style={{color:G}}>zo</span></span>}
          <button onClick={() => setCollapsed(!collapsed)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',marginLeft:collapsed?'auto':0,padding:4,borderRadius:6}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
        </div>
        <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {[
            {id:'dashboard',label:'Tableau de bord',href:'/dashboard'},
            {id:'devis',label:'Devis & Factures',href:'/devis',badge:'8'},
            {id:'clients',label:'Clients',href:'/clients'},
            {id:'materiaux',label:'Matériaux',href:'/materiaux'},
          ].map(n => (
            <a key={n.id} href={n.href} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,background:n.id==='dashboard'?'#f0fdf4':'none',color:n.id==='dashboard'?G:'#555',fontWeight:n.id==='dashboard'?600:400,fontSize:13,textDecoration:'none',justifyContent:collapsed?'center':'flex-start'}}>
              <span style={{width:17,height:17,flexShrink:0}}>•</span>
              {!collapsed && <span style={{flex:1}}>{n.label}</span>}
              {!collapsed && n.badge && <span style={{background:G,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{n.badge}</span>}
            </a>
          ))}
        </nav>
        {!collapsed && (
          <div style={{padding:12,borderTop:`1px solid ${BD}`}}>
            <div style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb'}}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>{prenom[0]?.toUpperCase()}</div>
              <div style={{overflow:'hidden',flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'#111',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{prenom}</div>
                <div style={{fontSize:11,color:'#888',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{entreprise}</div>
              </div>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login' }} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',padding:2,flexShrink:0}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </div>
        )}
      </div>

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
            <p style={{fontSize:14,color:'#666',margin:0}}>Voici un résumé de votre activité — Avril 2026</p>
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
                <div style={{fontSize:12,color:'#888',marginBottom:6}}>{m.label}</div>
                <div style={{fontSize:20,fontWeight:700,color:m.vc||'#111',marginBottom:4}}>{m.value}</div>
                <div style={{fontSize:11,color:m.cc,fontWeight:500}}>{m.change}</div>
              </div>
            ))}
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between'}}>
                <span style={{fontSize:14,fontWeight:700}}>Derniers devis</span>
                <span style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600}}>Voir tout →</span>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  <th style={{padding:'8px 16px',textAlign:'left',fontSize:11,color:'#888',fontWeight:600}}>Client</th>
                  <th style={{padding:'8px 16px',textAlign:'right',fontSize:11,color:'#888',fontWeight:600}}>Montant HT</th>
                  <th style={{padding:'8px 16px',textAlign:'right',fontSize:11,color:'#888',fontWeight:600}}>Statut</th>
                </tr></thead>
                <tbody>
                  {devis.map((d,i) => (
                    <tr key={i} style={{borderTop:`1px solid ${BD}`}}>
                      <td style={{padding:'10px 16px'}}>
                        <div style={{fontSize:13,fontWeight:600}}>{d.client}</div>
                        <div style={{fontSize:11,color:'#888'}}>{d.num} · {d.date}</div>
                      </td>
                      <td style={{padding:'10px 16px',textAlign:'right',fontSize:13,fontWeight:600}}>{d.montant}</td>
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
                <span style={{fontSize:14,fontWeight:700}}>Top clients 2026</span>
                <span style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600}}>Voir tout →</span>
              </div>
              <div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:12}}>
                {topClients.map((c,i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:12}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:c.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:c.c}}>{c.i}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600}}>{c.nom}</div>
                      <div style={{fontSize:11,color:'#888'}}>{c.n} chantier{c.n>1?'s':''}</div>
                    </div>
                    <div style={{fontSize:13,fontWeight:700,color:G}}>{c.ca}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12}}>Actions rapides</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {actions.map(a => (
                <button key={a.l} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',whiteSpace:'nowrap'}}>
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

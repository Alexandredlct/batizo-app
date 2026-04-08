'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const G = '#1D9E75', RD = '#E24B4A', BD = '#e5e7eb'

const NavIcon = ({ id }: { id: string }) => {
  if (id==='dashboard') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
  if (id==='devis') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  if (id==='clients') return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:17,height:17,flexShrink:0}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', href: '/dashboard' },
  { id: 'devis', label: 'Devis & Factures', href: '/devis', badge: '8' },
  { id: 'clients', label: 'Clients', href: '/clients' },
  { id: 'bibliotheque', label: 'Bibliothèque', href: '/bibliotheque' },
]

const menuItems = [
  { icon: '⚙️', label: 'Paramètres', href: '/parametres' },
  { icon: '💳', label: 'Abonnement', href: '/abonnement', badge: 'Pro', badgeColor: '#1D9E75' },
  { icon: '👥', label: 'Utilisateurs', href: '/utilisateurs' },
  { icon: '🎁', label: 'Parrainage', href: '/parrainage', badge: 'Nouveau', badgeColor: '#BA7517' },
  { icon: '👤', label: 'Mes informations', href: '/mes-informations' },
]

export default function Sidebar({ activePage }: { activePage: string }) {
  const [collapsed, setCollapsed] = useState(false)
  const [userMenu, setUserMenu] = useState(false)
  const [prenom, setPrenom] = useState('')
  const [photo, setPhoto] = useState<string|null>(null)
  
  useEffect(() => {
    const stored = localStorage.getItem('batizo_photo')
    if (stored) setPhoto(stored)
    // Écouter les changements de photo
    const onStorage = () => setPhoto(localStorage.getItem('batizo_photo'))
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])
  const [entreprise, setEntreprise] = useState('Batizo')
  const sw = collapsed ? 64 : 230

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const meta = data.user.user_metadata
        setPrenom(meta?.prenom || meta?.first_name || data.user.email?.split('@')[0] || 'Mon compte')
        setEntreprise(meta?.entreprise || 'Batizo')
      }
    })
  }, [])

  const initiales = prenom ? prenom[0].toUpperCase() : 'A'

  return (
    <div onClick={() => setUserMenu(false)} style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
      <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,minHeight:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        {!collapsed && <a href="/dashboard" style={{fontSize:'18px',fontWeight:'800',color:'#111',textDecoration:'none'}}>Bati<span style={{color:G}}>zo</span></a>}
        <button onClick={() => setCollapsed(!collapsed)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',padding:4,borderRadius:6,marginLeft:collapsed?'auto':0}}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:18,height:18}}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>

      <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
        {navItems.map(n => (
          <a key={n.id} href={n.href} title={collapsed ? n.label : undefined}
            style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,background:n.id===activePage?'#f0fdf4':'none',color:n.id===activePage?G:'#555',fontWeight:n.id===activePage?600:400,fontSize:13,textDecoration:'none',justifyContent:collapsed?'center':'flex-start',transition:'background 0.15s'}}
            onMouseEnter={e => { if(n.id!==activePage) (e.currentTarget as HTMLAnchorElement).style.background='#f9fafb' }}
            onMouseLeave={e => { if(n.id!==activePage) (e.currentTarget as HTMLAnchorElement).style.background='none' }}>
            <NavIcon id={n.id}/>
            {!collapsed && <span style={{flex:1}}>{n.label}</span>}
            {!collapsed && n.badge && <span style={{background:G,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{n.badge}</span>}
          </a>
        ))}
      </nav>

      {!collapsed ? (
        <div style={{padding:12,borderTop:`1px solid ${BD}`,position:'relative'}}>
          <div onClick={e => { e.stopPropagation(); setUserMenu(!userMenu) }}
            style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb',cursor:'pointer',transition:'background 0.15s'}}
            onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
            onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
            <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,flexShrink:0,overflow:'hidden'}}>
            {photo?<img src={photo} alt="profil" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initiales}
          </div>
            <div style={{overflow:'hidden',flex:1}}>
              <div style={{fontSize:12,fontWeight:600,color:'#111',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{prenom || 'Mon compte'}</div>
              <div style={{fontSize:11,color:'#888'}}>{entreprise}</div>
            </div>
            <svg viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{width:14,height:14,flexShrink:0,transform:userMenu?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
          </div>

          {userMenu && (
            <div onClick={e => e.stopPropagation()}
              style={{position:'absolute',bottom:70,left:8,right:8,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 -4px 20px rgba(0,0,0,0.12)',overflow:'hidden',zIndex:500}}>
              {menuItems.map(item => (
                <a key={item.label} href={item.href}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:item.href===`/${activePage}`?G:'#333',fontWeight:item.href===`/${activePage}`?600:400,textDecoration:'none',background:item.href===`/${activePage}`?'#f0fdf4':'none',transition:'background 0.15s'}}
                  onMouseEnter={e => { if(item.href!==`/${activePage}`) (e.currentTarget as HTMLAnchorElement).style.background='#f9fafb' }}
                  onMouseLeave={e => { if(item.href!==`/${activePage}`) (e.currentTarget as HTMLAnchorElement).style.background='none' }}>
                  <span>{item.icon}</span><span style={{flex:1}}>{item.label}</span>{(item as any).badge && <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,background:`${(item as any).badgeColor}18`,color:(item as any).badgeColor,whiteSpace:'nowrap'}}>{(item as any).badge}</span>}
                </a>
              ))}
              <div style={{borderTop:`1px solid ${BD}`}}>
                <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/login' }}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:RD,background:'none',border:'none',cursor:'pointer',width:'100%',textAlign:'left',transition:'background 0.15s'}}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='none'}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{width:14,height:14}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Déconnexion
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{padding:12,borderTop:`1px solid ${BD}`}}>
          <div onClick={e => { e.stopPropagation(); setUserMenu(!userMenu) }}
            style={{width:40,height:40,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,margin:'0 auto',cursor:'pointer',overflow:'hidden'}}>
            {photo?<img src={photo} alt="profil" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:initiales}
          </div>
        </div>
      )}
    </div>
  )
}

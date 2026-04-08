'use client'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const NavIcon=({id}:{id:string})=>{
  if(id==='dashboard')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><rect x="3"y="3"width="7"height="7"/><rect x="14"y="3"width="7"height="7"/><rect x="3"y="14"width="7"height="7"/><rect x="14"y="14"width="7"height="7"/></svg>
  if(id==='devis')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16"y1="13"x2="8"y2="13"/><line x1="16"y1="17"x2="8"y2="17"/></svg>
  if(id==='clients')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9"cy="7"r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}
export default function ParrainagePage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[copied,setCopied]=useState(false)
  const sw=collapsed?64:230
  const navItems=[
    {id:'dashboard',label:'Tableau de bord',href:'/dashboard'},
    {id:'devis',label:'Devis & Factures',href:'/devis',badge:'8'},
    {id:'clients',label:'Clients',href:'/clients'},
    {id:'bibliotheque',label:'Bibliothèque',href:'/bibliotheque'},
  ]
  const menuItems=[
    {icon:'⚙️',label:'Paramètres',href:'/parametres'},
    {icon:'💳',label:'Abonnement',href:'/abonnement'},
    {icon:'👥',label:'Utilisateurs',href:'/utilisateurs'},
    {icon:'🎁',label:'Parrainage',href:'/parrainage'},
    {icon:'👤',label:'Mes informations',href:'/mes-informations'},
  ]
  const copier=()=>{
    navigator.clipboard.writeText('https://batizo.fr/invite/ALEX2026')
    setCopied(true)
    setTimeout(()=>setCopied(false),2000)
  }
  const filleuls=[
    {nom:'Pierre Leblanc',email:'p.leblanc@batiment.fr',date:'12/01/2026',statut:'abonne'},
    {nom:'Karim Mansouri',email:'k.mansouri@elec.fr',date:'28/01/2026',statut:'abonne'},
    {nom:'Sophie Moreau',email:'s.moreau@deco.fr',date:'15/02/2026',statut:'abonne'},
    {nom:'Marc Fontaine',email:'m.fontaine@plomberie.fr',date:'01/03/2026',statut:'inscrit'},
    {nom:'Julie Renard',email:'j.renard@peinture.fr',date:'20/03/2026',statut:'invite'},
  ]
  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setUserMenu(false)}>
      <div style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
        <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,minHeight:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {!collapsed&&<a href="/dashboard"style={{fontSize:'18px',fontWeight:'800',color:'#111',textDecoration:'none'}}>Bati<span style={{color:G}}>zo</span></a>}
          <button onClick={()=>setCollapsed(!collapsed)}style={{background:'none',border:'none',cursor:'pointer',color:'#888',padding:4,borderRadius:6,marginLeft:collapsed?'auto':0}}>
            <svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{width:18,height:18}}><line x1="3"y1="12"x2="21"y2="12"/><line x1="3"y1="6"x2="21"y2="6"/><line x1="3"y1="18"x2="21"y2="18"/></svg>
          </button>
        </div>
        <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {navItems.map(n=>(
            <a key={n.id}href={n.href}title={collapsed?n.label:undefined}
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,background:'none',color:'#555',fontSize:13,textDecoration:'none',justifyContent:collapsed?'center':'flex-start',transition:'background 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='none'}>
              <NavIcon id={n.id}/>{!collapsed&&<span style={{flex:1}}>{n.label}</span>}
              {!collapsed&&n.badge&&<span style={{background:G,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{n.badge}</span>}
            </a>
          ))}
        </nav>
        {!collapsed?(
          <div style={{padding:12,borderTop:`1px solid ${BD}`,position:'relative'}}>
            <div onClick={e=>{e.stopPropagation();setUserMenu(!userMenu)}} style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb',cursor:'pointer'}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>A</div>
              <div style={{overflow:'hidden',flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#111'}}>Mon compte</div><div style={{fontSize:12,color:'#555'}}>Batizo</div></div>
              <svg viewBox="0 0 24 24"fill="none"stroke="#aaa"strokeWidth="2"style={{width:14,height:14,transform:userMenu?'rotate(180deg)':'',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {userMenu&&(
              <div onClick={e=>e.stopPropagation()}style={{position:'absolute',bottom:70,left:8,right:8,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 -4px 20px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:200}}>
                {menuItems.map(item=>(
                  <a key={item.label}href={item.href}style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:item.href==='/parrainage'?G:'#333',fontWeight:item.href==='/parrainage'?600:400,textDecoration:'none',background:item.href==='/parrainage'?'#f0fdf4':'none',transition:'background 0.15s'}}
                    onMouseEnter={e=>{if(item.href!=='/parrainage')(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}}
                    onMouseLeave={e=>{if(item.href!=='/parrainage')(e.currentTarget as HTMLAnchorElement).style.background='none'}}>
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
                <div style={{borderTop:`1px solid ${BD}`}}>
                  <a href="/login"style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:RD,textDecoration:'none'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#fef2f2'}
                    onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='none'}>
                    <svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{width:14,height:14}}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21"y1="12"x2="9"y2="12"/></svg>
                    Déconnexion
                  </a>
                </div>
              </div>
            )}
          </div>
        ):(
          <div style={{padding:12,borderTop:`1px solid ${BD}`}}>
            <div style={{width:40,height:40,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,margin:'0 auto'}}>A</div>
          </div>
        )}
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Parrainage</div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24,maxWidth:900}}>

          {/* Hero */}
          <div style={{background:`linear-gradient(135deg,#085041,${G})`,borderRadius:16,padding:'24px 28px',marginBottom:24,color:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:20}}>
            <div>
              <div style={{fontSize:22,fontWeight:700,marginBottom:6}}>Invitez vos collègues artisans 🎁</div>
              <div style={{fontSize:14,opacity:0.85,lineHeight:1.6,maxWidth:420}}>Pour chaque ami qui s'abonne à Batizo, vous gagnez <strong>1 mois offert</strong>. Votre filleul bénéficie également d'<strong>1 mois offert</strong>.</div>
            </div>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:36,fontWeight:700}}>3</div>
              <div style={{fontSize:13,opacity:0.8}}>filleuls actifs</div>
              <div style={{fontSize:13,fontWeight:600,marginTop:4,background:'rgba(255,255,255,0.2)',padding:'4px 14px',borderRadius:20}}>= 3 mois offerts</div>
            </div>
          </div>

          {/* Comment ça marche */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Comment ça marche</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:24}}>
              <div style={{display:'flex',gap:0,alignItems:'flex-start',flexWrap:'wrap' as const,justifyContent:'center'}}>
                {[
                  {num:1,icon:'📤',title:'Partagez votre lien',desc:'Envoyez votre lien unique à vos collègues artisans.'},
                  {num:2,icon:'✍️',title:'Votre filleul s\'inscrit',desc:'Il crée son compte via votre lien et bénéficie d\'1 mois offert.'},
                  {num:3,icon:'🎉',title:'Vous gagnez 1 mois',desc:'Dès que votre filleul souscrit un abonnement payant, 1 mois est crédité.'},
                ].map((step,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:0}}>
                    <div style={{textAlign:'center' as const,minWidth:160,padding:'0 16px'}}>
                      <div style={{width:28,height:28,borderRadius:'50%',background:G,color:'#fff',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px'}}>
                        {step.num}
                      </div>
                      <div style={{fontSize:24,marginBottom:6}}>{step.icon}</div>
                      <div style={{fontSize:13,fontWeight:600,marginBottom:4,color:'#111'}}>{step.title}</div>
                      <div style={{fontSize:12,color:'#444',lineHeight:1.5}}>{step.desc}</div>
                    </div>
                    {i<2&&<div style={{fontSize:20,color:'#777',flexShrink:0}}>→</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Lien parrainage */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Mon lien de parrainage</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:24}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16,flexWrap:'wrap' as const}}>
                <div style={{flex:1,minWidth:200,background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 14px',fontSize:13,fontFamily:'monospace',color:'#333'}}>
                  https://batizo.fr/invite/ALEX2026
                </div>
                <button onClick={copier} style={{padding:'10px 18px',background:copied?'#059669':G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',transition:'background 0.2s',whiteSpace:'nowrap' as const}}>
                  {copied?'✓ Copié !':'📋 Copier le lien'}
                </button>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' as const}}>
                <span style={{fontSize:13,color:'#444'}}>Partager via :</span>
                {[
                  {label:'📧 Email',bg:'#eff6ff',color:'#2563eb',href:`mailto:?subject=Essayez Batizo&body=Créez votre compte : https://batizo.fr/invite/ALEX2026`},
                  {label:'💬 WhatsApp',bg:'#f0fdf4',color:G,href:`https://wa.me/?text=Essayez Batizo : https://batizo.fr/invite/ALEX2026`},
                  {label:'📱 SMS',bg:'#f9fafb',color:'#555',href:`sms:?body=Essayez Batizo : https://batizo.fr/invite/ALEX2026`},
                ].map(btn=>(
                  <a key={btn.label}href={btn.href}target="_blank"rel="noopener noreferrer"
                    style={{padding:'7px 14px',background:btn.bg,color:btn.color,border:`1px solid ${btn.color}22`,borderRadius:7,fontSize:13,fontWeight:500,textDecoration:'none',transition:'opacity 0.15s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.opacity='0.8'}
                    onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.opacity='1'}>
                    {btn.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Récompenses */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Mes récompenses</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:12}}>
              {[
                {val:'3',label:'Filleuls actifs',color:G},
                {val:'3',label:'Mois offerts gagnés',color:G},
                {val:'57 €',label:'Économisés au total',color:G},
                {val:'2',label:'Invitations en attente',color:AM},
              ].map(item=>(
                <div key={item.label}style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 16px',textAlign:'center' as const}}>
                  <div style={{fontSize:28,fontWeight:700,color:item.color}}>{item.val}</div>
                  <div style={{fontSize:13,color:'#555',marginTop:4}}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Table filleuls */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Mes filleuls</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  {['Nom','Email','Invité le','Statut','Récompense'].map(h=>(
                    <th key={h}style={{padding:'10px 16px',textAlign:'left',fontSize:12,color:'#444',fontWeight:600,borderBottom:`1px solid ${BD}`,textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filleuls.map((f,i)=>(
                    <tr key={i}style={{borderBottom:i<filleuls.length-1?`1px solid ${BD}`:'none'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                      onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                      <td style={{padding:'12px 16px',fontSize:14,fontWeight:500,color:'#111'}}>{f.nom}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{f.email}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{f.date}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{
                          background:f.statut==='abonne'?'#f0fdf4':f.statut==='inscrit'?'#eff6ff':'#fffbeb',
                          color:f.statut==='abonne'?G:f.statut==='inscrit'?'#2563eb':AM,
                          fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20
                        }}>
                          {f.statut==='abonne'?'Abonné':f.statut==='inscrit'?'Inscrit':'Invité'}
                        </span>
                      </td>
                      <td style={{padding:'12px 16px',fontSize:13}}>
                        {f.statut==='abonne'
                          ?<span style={{color:G,fontWeight:600}}>+1 mois offert ✓</span>
                          :f.statut==='inscrit'
                          ?<span style={{color:'#888'}}>En attente d'abonnement</span>
                          :<span style={{color:'#666'}}>Lien non encore utilisé</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

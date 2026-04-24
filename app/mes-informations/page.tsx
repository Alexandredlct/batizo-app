'use client'
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar'
import React, { useState, useEffect } from 'react'
import { usePhoto } from '../context/PhotoContext'
const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const NavIcon=({id}:{id:string})=>{
  if(id==='dashboard')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><rect x="3"y="3"width="7"height="7"/><rect x="14"y="3"width="7"height="7"/><rect x="3"y="14"width="7"height="7"/><rect x="14"y="14"width="7"height="7"/></svg>
  if(id==='devis')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16"y1="13"x2="8"y2="13"/><line x1="16"y1="17"x2="8"y2="17"/></svg>
  if(id==='clients')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9"cy="7"r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}
export default function MesInfosPage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[showMdp,setShowMdp]=useState(false)
  const[toast,setToast]=useState(false)
  const[hasChanges,setHasChanges]=useState(false)
  const[prenom,setPrenom]=useState(()=>{
    if(typeof window==='undefined') return 'Alexandre'
    const stored=localStorage.getItem('batizo_prenom')
    if(!stored){localStorage.setItem('batizo_prenom','Alexandre');return 'Alexandre'}
    return stored
  })
  const { photo, setPhoto } = usePhoto()
  const handlePhoto=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file)return
    const reader=new FileReader()
    reader.onload=ev=>{
      const result=ev.target?.result as string
      setPhoto(result)
      setHasChanges(true)
    }
    reader.readAsDataURL(file)
  }

  const[twoFA,setTwoFA]=useState(false)
  const[notifs,setNotifs]=useState({devisSigne:true,facturePaye:true,relance:false,impaye:true})
  const[showDeleteModal,setShowDeleteModal]=useState(false)
  const[deleteConfirm,setDeleteConfirm]=useState('')

  // Historique connexions simulé depuis localStorage
  const[sessions,setSessions]=React.useState<any[]>(()=>{if(typeof window==="undefined")return []
    try{
      const raw=localStorage.getItem('batizo_sessions')
      if(raw) return JSON.parse(raw)
    }catch(e){}
    // Créer une session courante par défaut
    const ua=typeof navigator!=='undefined'?navigator.userAgent:''
    const device=ua.includes('iPhone')?'iPhone - Safari':ua.includes('Mac')?'MacBook - Chrome':'PC - Chrome'
    const session={id:'s1',date:new Date().toLocaleDateString('fr-FR')+' '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}),device,location:'—',current:true}
    localStorage.setItem('batizo_sessions',JSON.stringify([session]))
    return [session]
  })

  const sw=collapsed?64:230
  // Enregistrer session courante
  useEffect(()=>{
    try{
      const raw=localStorage.getItem('batizo_sessions')
      const list=raw?JSON.parse(raw):[]
      const ua=navigator.userAgent
      const device=ua.includes('iPhone')?'iPhone - Safari':ua.includes('iPad')?'iPad - Safari':ua.includes('Mac')?'MacBook - Chrome':ua.includes('Windows')?'PC - Chrome':'Appareil inconnu'
      const now=new Date()
      const date=now.toLocaleDateString('fr-FR')+' '+now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
      // Marquer toutes les autres sessions comme terminées
      const updated=list.map((s:any)=>({...s,current:false}))
      // Ajouter session courante si pas déjà là
      const already=updated.find((s:any)=>s.current)
      if(!already){
        updated.unshift({id:'s'+Date.now(),date,device,location:'—',current:true})
      }
      const trimmed=updated.slice(0,10)
      localStorage.setItem('batizo_sessions',JSON.stringify(trimmed))
      setSessions(trimmed)
    }catch(e){}
  },[])

  const save=()=>{setHasChanges(false);setToast(true);setTimeout(()=>setToast(false),3000)}
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
  const Field=({label,defaultVal,type='text',full=false}:{label:string,defaultVal:string,type?:string,full?:boolean})=>(
    <div style={{gridColumn:full?'1/-1':'auto'}}>
      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>{label}</label>
      <input type={type} defaultValue={defaultVal} style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const,transition:'border-color 0.15s'}}
        onChange={()=>setHasChanges(true)} onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
    </div>
  )
  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setUserMenu(false)}>
      <div style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
        <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,minHeight:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {!collapsed&&<a href="/dashboard"style={{fontSize:'18px',fontWeight:'800',color:'#111',textDecoration:'none'}}>Bati<span style={{color:G}}>zo</span></a>}
          <button onClick={()=>setCollapsed(!collapsed)}style={{background:'none',border:'none',cursor:'pointer',color:'#333',padding:4,borderRadius:6,marginLeft:collapsed?'auto':0}}>
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
            <div onClick={e=>{e.stopPropagation();setUserMenu(!userMenu)}}style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb',cursor:'pointer'}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>A</div>
              <div style={{overflow:'hidden',flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#111'}}>Mon compte</div><div style={{fontSize:12,color:'#333'}}>Batizo</div></div>
              <svg viewBox="0 0 24 24"fill="none"stroke="#aaa"strokeWidth="2"style={{width:14,height:14,transform:userMenu?'rotate(180deg)':'',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {userMenu&&(
              <div onClick={e=>e.stopPropagation()}style={{position:'absolute',bottom:70,left:8,right:8,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 -4px 20px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:200}}>
                {menuItems.map(item=>(
                  <a key={item.label}href={item.href}style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:item.href==='/mes-informations'?G:'#333',fontWeight:item.href==='/mes-informations'?600:400,textDecoration:'none',background:item.href==='/mes-informations'?'#f0fdf4':'none',transition:'background 0.15s'}}
                    onMouseEnter={e=>{if(item.href!=='/mes-informations')(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}}
                    onMouseLeave={e=>{if(item.href!=='/mes-informations')(e.currentTarget as HTMLAnchorElement).style.background='none'}}>
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
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Mes informations</div><SearchBar/>
          <button onClick={save}style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>{hasChanges && <span style={{position:'absolute',top:-4,right:-4,width:10,height:10,background:'#BA7517',borderRadius:'50%',border:'2px solid #fff'}}></span>}Enregistrer les modifications</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* Infos personnelles */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#333',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Informations personnelles</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20,flexWrap:'wrap' as const}}>
                <div style={{position:'relative'}}>
                  <div style={{width:72,height:72,borderRadius:'50%',background:`${G}22`,color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700,overflow:'hidden',flexShrink:0}}>
                    {photo?<img src={photo} alt="profil" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span>AD</span>}
                  </div>
                  <div style={{position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:G,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    <svg width="11"height="11"viewBox="0 0 24 24"fill="none"stroke="#fff"strokeWidth="3"strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:600,color:'#111'}}>{prenom} Delcourt</div>
                  <div style={{fontSize:13,color:'#444'}}>Administrateur · Plan Pro</div>
                  <label htmlFor="photo-upload" style={{fontSize:12,color:G,cursor:'pointer',marginTop:4,display:'inline-block'}}>
                    Modifier la photo
                  </label>
                  <input type="file" id="photo-upload" accept="image/*" onChange={handlePhoto} style={{display:'none'}}/>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Prénom *</label>
                <input type="text" value={prenom} onChange={e=>{setPrenom(e.target.value);setHasChanges(true);localStorage.setItem('batizo_prenom',e.target.value)}}
                  style={{width:'100%',padding:'9px 12px',border:'1px solid #e5e7eb',borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const}}/>
              </div>
                <Field label="Nom *" defaultVal="Delcourt"/>
                <Field label="Adresse email *" defaultVal="a.delcourt@batizo.fr" type="email"/>
                <Field label="Téléphone" defaultVal="06 12 34 56 78" type="tel"/>
              </div>
            </div>
          </div>

          {/* Sécurité */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#333',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Sécurité</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:16,borderBottom:`1px solid ${BD}`,marginBottom:16,flexWrap:'wrap' as const,gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:3}}>Mot de passe</div>
                  <div style={{fontSize:13,color:'#444'}}>Dernière modification il y a 3 mois</div>
                </div>
                <button onClick={()=>setShowMdp(!showMdp)}style={{padding:'7px 14px',background:'#fff',border:'1px solid #333',borderRadius:7,fontSize:13,cursor:'pointer',color:'#111',fontWeight:500}}>Modifier le mot de passe</button>
              </div>
              {showMdp&&(
                <div style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${BD}`}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Mot de passe actuel *</label>
                      <input type="password"placeholder="••••••••"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Nouveau mot de passe *</label>
                      <input type="password"placeholder="8 caractères minimum"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Confirmer le mot de passe *</label>
                      <input type="password"placeholder="••••••••"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>Enregistrer</button>
                    <button onClick={()=>setShowMdp(false)} style={{padding:'8px 14px',background:'#fff',border:'1px solid #333',borderRadius:7,fontSize:13,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
                  </div>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap' as const,gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:3}}>Double authentification (2FA)</div>
                  <div style={{fontSize:13,color:'#444'}}>Sécurisez votre compte avec une vérification en deux étapes</div>
                </div>
                <div onClick={()=>{setTwoFA(!twoFA);setHasChanges(true)}}style={{width:44,height:24,borderRadius:12,background:twoFA?G:'#d1d5db',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                  <div style={{position:'absolute',top:2,left:twoFA?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique connexions */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Historique des connexions</div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  {['Date','Appareil','Localisation','Statut'].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb'}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {sessions.map((conn,i)=>(
                    <tr key={i} style={{borderBottom:i<4?'1px solid #e5e7eb':'none'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                      onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{conn.date}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{conn.device||conn.appareil||'—'}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{conn.location||conn.lieu||'—'}</td>
                      <td style={{padding:'12px 16px'}}>
                        {conn.current||conn.actuel
                          ? <span style={{background:'#f0fdf4',color:'#1D9E75',fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>Session actuelle</span>
                          : <span style={{background:'#f9fafb',color:'#888',fontSize:11,fontWeight:600,padding:'3px 10px',borderRadius:20}}>Terminee</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notifications */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Preferences notifications</div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'20px 24px'}}>
              {[
                {key:'devisSigne',label:'Devis signe',desc:'Email quand un devis est signe'},
                {key:'facturePaye',label:'Facture payee',desc:'Email a chaque paiement recu'},
                {key:'impaye',label:'Facture impayee',desc:'Rappel apres 30 jours'},
                {key:'relance',label:'Relances auto',desc:'Emails de relance clients'},
              ].map(notif=>(
                <div key={notif.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid #f3f4f6'}}>
                  <div>
                    <div style={{fontSize:14,fontWeight:500,color:'#111',marginBottom:2}}>{notif.label}</div>
                    <div style={{fontSize:12,color:'#888'}}>{notif.desc}</div>
                  </div>
                  <div onClick={()=>{setNotifs(p=>({...p,[notif.key]:!p[notif.key as keyof typeof p]}));setHasChanges(true)}}
                    style={{width:44,height:24,borderRadius:12,background:notifs[notif.key as keyof typeof notifs]?'#1D9E75':'#d1d5db',cursor:'pointer',position:'relative' as const,transition:'background 0.2s',flexShrink:0}}>
                    <div style={{position:'absolute',top:2,left:notifs[notif.key as keyof typeof notifs]?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RGPD */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Mes donnees RGPD</div>
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap' as const,gap:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:4}}>Telecharger mes donnees</div>
                <div style={{fontSize:13,color:'#555'}}>Export JSON conforme RGPD.</div>
              </div>
              <button onClick={()=>{const d={date:new Date().toISOString(),notifs,twoFA};const b=new Blob([JSON.stringify(d,null,2)],{type:'application/json'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='batizo.json';a.click();URL.revokeObjectURL(u)}}
                style={{padding:'10px 20px',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,fontWeight:600,color:'#333',cursor:'pointer'}}
                onMouseEnter={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background='#f0fdf4';b.style.color='#1D9E75'}}
                onMouseLeave={e=>{const b=e.currentTarget as HTMLButtonElement;b.style.background='#f9fafb';b.style.color='#333'}}>
                Telecharger
              </button>
            </div>
          </div>

          {/* Danger */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Zone de danger</div>
            <div style={{background:'#fff',border:'1px solid #fca5a5',borderRadius:12,padding:'20px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap' as const,gap:16}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:4}}>Supprimer mon compte</div>
                <div style={{fontSize:13,color:'#555'}}>Action irreversible.</div>
              </div>
              <button onClick={()=>setShowDeleteModal(true)}
                style={{padding:'10px 20px',background:'#fff',border:'1px solid #E24B4A',borderRadius:8,fontSize:13,fontWeight:600,color:'#E24B4A',cursor:'pointer'}}
                onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}
                onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
                Supprimer mon compte
              </button>
            </div>
          </div>

        </div>
      </div>

      {showDeleteModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDeleteModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:'2rem',maxWidth:420,width:'90%'}}>
            <h3 style={{fontSize:18,fontWeight:700,color:'#111',marginBottom:8,textAlign:'center' as const}}>Supprimer mon compte ?</h3>
            <p style={{fontSize:14,color:'#555',marginBottom:20,lineHeight:1.6,textAlign:'center' as const}}>Tous vos devis, factures et clients seront supprimes.</p>
            <p style={{fontSize:13,color:'#555',marginBottom:8}}>Tapez SUPPRIMER pour confirmer :</p>
            <input value={deleteConfirm} onChange={e=>setDeleteConfirm(e.target.value)} placeholder="SUPPRIMER"
              style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',marginBottom:16,boxSizing:'border-box' as const,color:'#111'}}/>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{setShowDeleteModal(false);setDeleteConfirm('')}} style={{flex:1,padding:11,border:'1px solid #333',borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
              <button disabled={deleteConfirm!=='SUPPRIMER'} onClick={()=>setShowDeleteModal(false)}
                style={{flex:1,padding:11,background:deleteConfirm==='SUPPRIMER'?'#E24B4A':'#f3f4f6',color:deleteConfirm==='SUPPRIMER'?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:deleteConfirm==='SUPPRIMER'?'pointer':'not-allowed'}}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {toast&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span>
          <span style={{fontSize:13}}>Modifications enregistrées avec succès</span>
        </div>
      )}
    </div>
  )
}

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
export default function MesInfosPage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[showMdp,setShowMdp]=useState(false)
  const[toast,setToast]=useState(false)
  const[twoFA,setTwoFA]=useState(false)
  const sw=collapsed?64:230
  const save=()=>{setToast(true);setTimeout(()=>setToast(false),3000)}
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
      <input type={type} defaultValue={defaultVal} style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,transition:'border-color 0.15s'}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
    </div>
  )
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
            <div onClick={e=>{e.stopPropagation();setUserMenu(!userMenu)}}style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb',cursor:'pointer'}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>A</div>
              <div style={{overflow:'hidden',flex:1}}><div style={{fontSize:12,fontWeight:600,color:'#111'}}>Mon compte</div><div style={{fontSize:12,color:'#555'}}>Batizo</div></div>
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
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Mes informations</div>
          <button onClick={save}style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Enregistrer les modifications</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24,maxWidth:900}}>

          {/* Infos personnelles */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Informations personnelles</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:20,flexWrap:'wrap' as const}}>
                <div style={{position:'relative'}}>
                  <div style={{width:72,height:72,borderRadius:'50%',background:`${G}22`,color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:700}}>AD</div>
                  <div style={{position:'absolute',bottom:0,right:0,width:24,height:24,borderRadius:'50%',background:G,border:'2px solid #fff',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}>
                    <svg width="11"height="11"viewBox="0 0 24 24"fill="none"stroke="#fff"strokeWidth="3"strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:600}}>Alexandre Delcourt</div>
                  <div style={{fontSize:13,color:'#444'}}>Administrateur · Plan Pro</div>
                  <div style={{fontSize:12,color:G,cursor:'pointer',marginTop:4}}>Modifier la photo</div>
                </div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <Field label="Prénom *" defaultVal="Alexandre"/>
                <Field label="Nom *" defaultVal="Delcourt"/>
                <Field label="Adresse email *" defaultVal="a.delcourt@batizo.fr" type="email"/>
                <Field label="Téléphone" defaultVal="06 12 34 56 78" type="tel"/>
              </div>
            </div>
          </div>

          {/* Infos entreprise */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Informations entreprise</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                <Field label="Nom de l'entreprise *" defaultVal="Batizo SAS"/>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Forme juridique</label>
                  <select defaultValue="SAS"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}>
                    <option>SAS</option><option>SARL</option><option>EURL</option><option>Auto-entrepreneur</option>
                  </select>
                </div>
                <Field label="SIRET" defaultVal="853 572 014"/>
                <Field label="Numéro TVA intracommunautaire" defaultVal="FR XX XXX XXX XXX"/>
                <Field label="Téléphone entreprise" defaultVal="01 84 78 24 50" type="tel"/>
                <Field label="Email entreprise" defaultVal="contact@batizo.fr" type="email"/>
                <Field label="Site web" defaultVal="https://www.batizo.fr" type="url" full/>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Adresse de l'entreprise</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
                <Field label="Adresse (numéro et voie) *" defaultVal="130 rue de Normandie" full/>
                <Field label="Code postal *" defaultVal="92400"/>
                <Field label="Ville *" defaultVal="Courbevoie"/>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Pays</label>
                  <select defaultValue="France"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}>
                    <option>France</option><option>Belgique</option><option>Suisse</option>
                  </select>
                </div>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,cursor:'pointer',color:'#555'}}>
                <input type="checkbox"defaultChecked/>Utiliser cette adresse comme adresse de facturation
              </label>
            </div>
          </div>

          {/* Sécurité */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Sécurité</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:16,borderBottom:`1px solid ${BD}`,marginBottom:16,flexWrap:'wrap' as const,gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Mot de passe</div>
                  <div style={{fontSize:13,color:'#444'}}>Dernière modification il y a 3 mois</div>
                </div>
                <button onClick={()=>setShowMdp(!showMdp)}style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Modifier le mot de passe</button>
              </div>
              {showMdp&&(
                <div style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${BD}`}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                    <div style={{gridColumn:'1/-1'}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Mot de passe actuel *</label>
                      <input type="password"placeholder="••••••••"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Nouveau mot de passe *</label>
                      <input type="password"placeholder="8 caractères minimum"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Confirmer le mot de passe *</label>
                      <input type="password"placeholder="••••••••"style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>Enregistrer</button>
                    <button onClick={()=>setShowMdp(false)}style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Annuler</button>
                  </div>
                </div>
              )}
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap' as const,gap:12}}>
                <div>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:3}}>Double authentification (2FA)</div>
                  <div style={{fontSize:13,color:'#444'}}>Sécurisez votre compte avec une vérification en deux étapes</div>
                </div>
                <div onClick={()=>setTwoFA(!twoFA)}style={{width:44,height:24,borderRadius:12,background:twoFA?G:'#d1d5db',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                  <div style={{position:'absolute',top:2,left:twoFA?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span>
          <span style={{fontSize:13}}>Modifications enregistrées avec succès</span>
        </div>
      )}
    </div>
  )
}

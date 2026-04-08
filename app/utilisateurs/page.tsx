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
const initUsers=[
  {nom:'Alexandre Delcourt',email:'a.delcourt@batizo.fr',depuis:'01/03/2024',role:'proprietaire',vous:true},
  {nom:'Emma Strano',email:'e.strano@batizo.fr',depuis:'04/09/2024',role:'modification',vous:false},
  {nom:'Ysaline Bernard',email:'y.bernard@batizo.fr',depuis:'15/01/2025',role:'modification',vous:false},
  {nom:'Xavier Concy',email:'x.concy@batizo.fr',depuis:'03/03/2025',role:'lecture',vous:false},
  {nom:'Thomas Giraud',email:'t.giraud@batizo.fr',depuis:'10/01/2026',role:'modification',vous:false},
]
const roleLabels:Record<string,string>={proprietaire:'Propriétaire du compte',modification:'Lecture et modification',lecture:'Lecture seule',revoque:"Révoquer l'accès"}
const roleColors:Record<string,string>={proprietaire:G,modification:'#2563eb',lecture:AM,revoque:RD}
export default function UtilisateursPage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[showForm,setShowForm]=useState(false)
  const[users,setUsers]=useState(initUsers)
  const[newName,setNewName]=useState('')
  const[newEmail,setNewEmail]=useState('')
  const[newRole,setNewRole]=useState('modification')
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
  const inviter=()=>{
    if(!newName||!newEmail)return
    setUsers(p=>[...p,{nom:newName,email:newEmail,depuis:new Date().toLocaleDateString('fr-FR'),role:newRole,vous:false}])
    setNewName('');setNewEmail('');setNewRole('modification');setShowForm(false)
  }
  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setUserMenu(false)}>
      <div style={{width:sw,minWidth:sw,height:'100vh',background:'#fff',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',transition:'width 0.2s',overflow:'hidden',flexShrink:0}}>
        <div style={{padding:'16px 14px',borderBottom:`1px solid ${BD}`,minHeight:60,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          {!collapsed&&<a href="/dashboard" style={{fontSize:'18px',fontWeight:'800',color:'#111',textDecoration:'none'}}>Bati<span style={{color:G}}>zo</span></a>}
          <button onClick={()=>setCollapsed(!collapsed)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',padding:4,borderRadius:6,marginLeft:collapsed?'auto':0}}>
            <svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"style={{width:18,height:18}}><line x1="3"y1="12"x2="21"y2="12"/><line x1="3"y1="6"x2="21"y2="6"/><line x1="3"y1="18"x2="21"y2="18"/></svg>
          </button>
        </div>
        <nav style={{flex:1,padding:'12px 8px',display:'flex',flexDirection:'column',gap:2}}>
          {navItems.map(n=>(
            <a key={n.id} href={n.href} title={collapsed?n.label:undefined}
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
              <div onClick={e=>e.stopPropagation()} style={{position:'absolute',bottom:70,left:8,right:8,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 -4px 20px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:200}}>
                {menuItems.map(item=>(
                  <a key={item.label} href={item.href} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:item.href==='/utilisateurs'?G:'#333',fontWeight:item.href==='/utilisateurs'?600:400,textDecoration:'none',background:item.href==='/utilisateurs'?'#f0fdf4':'none',transition:'background 0.15s'}}
                    onMouseEnter={e=>{if(item.href!=='/utilisateurs')(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}}
                    onMouseLeave={e=>{if(item.href!=='/utilisateurs')(e.currentTarget as HTMLAnchorElement).style.background='none'}}>
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
                <div style={{borderTop:`1px solid ${BD}`}}>
                  <a href="/login" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:RD,textDecoration:'none'}}
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
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Utilisateurs</div>
          <button onClick={()=>setShowForm(!showForm)} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Ajouter un utilisateur</button>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24,maxWidth:900}}>
          <p style={{fontSize:14,color:'#555',marginBottom:20}}>Les personnes suivantes ont accès à l'entreprise <strong>« Batizo »</strong> :</p>

          {showForm&&(
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:20,marginBottom:20}}>
              <div style={{fontSize:14,fontWeight:600,marginBottom:14,color:'#111'}}>Inviter un nouvel utilisateur</div>
              <div style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'flex-end'}}>
                <div style={{flex:1,minWidth:200}}>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Prénom Nom *</label>
                  <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Ex : Emma Strano" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
                <div style={{flex:1,minWidth:200}}>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Adresse email *</label>
                  <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="email@batizo.fr" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
                <div style={{minWidth:180}}>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Permission</label>
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
                    <option value="lecture">Lecture seule</option>
                    <option value="modification">Lecture et modification</option>
                    <option value="proprietaire">Propriétaire du compte</option>
                  </select>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={inviter} style={{padding:'9px 18px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>Inviter</button>
                  <button onClick={()=>setShowForm(false)} style={{padding:'9px 14px',background:'#fff',border:'1px solid #333',borderRadius:7,fontSize:13,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
                </div>
              </div>
            </div>
          )}

          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{background:'#f9fafb'}}>
                {['Nom','Adresse email','Depuis','Permission'].map(h=>(
                  <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:12,color:'#444',fontWeight:600,borderBottom:`1px solid ${BD}`,textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {users.map((u,i)=>(
                  <tr key={i} style={{borderBottom:i<users.length-1?`1px solid ${BD}`:'none'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                    <td style={{padding:'14px 16px',fontSize:14,fontWeight:500,color:'#111'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:32,height:32,borderRadius:'50%',background:`${G}22`,color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>
                          {u.nom.split(' ').map(n=>n[0]).join('').slice(0,2)}
                        </div>
                        {u.nom}
                        {u.vous&&<span style={{background:'#f0fdf4',color:G,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10}}>Vous</span>}
                      </div>
                    </td>
                    <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{u.email}</td>
                    <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{u.depuis}</td>
                    <td style={{padding:'14px 16px'}}>
                      {u.vous?(
                        <span style={{fontSize:13,color:'#444',fontStyle:'italic'}}>Propriétaire du compte</span>
                      ):(
                        <select defaultValue={u.role}
                          onChange={e=>{
                            const newRole=e.target.value
                            setUsers(p=>p.map((usr,idx)=>idx===i?{...usr,role:newRole}:usr))
                          }}
                          style={{padding:'5px 10px',border:`1px solid ${roleColors[u.role]||BD}`,borderRadius:6,fontSize:12,color:roleColors[u.role]||'#333',fontWeight:600,background:`${roleColors[u.role] || '#e5e7eb'}18`,outline:'none',cursor:'pointer'}}>
                          <option value="revoque">Révoquer l'accès</option>
                          <option value="lecture">Lecture seule</option>
                          <option value="modification">Lecture et modification</option>
                          <option value="proprietaire">Propriétaire du compte</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:13,color:'#444',marginTop:12}}>{users.length} utilisateurs · Plan Pro — jusqu'à <strong>10 utilisateurs</strong></p>
        </div>
      </div>
    </div>
  )
}

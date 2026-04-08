'use client'
import React from 'react'
import Sidebar from '../components/Sidebar'
import { useState } from 'react'
const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const NavIcon=({id}:{id:string})=>{
  if(id==='dashboard')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><rect x="3"y="3"width="7"height="7"/><rect x="14"y="3"width="7"height="7"/><rect x="3"y="14"width="7"height="7"/><rect x="14"y="14"width="7"height="7"/></svg>
  if(id==='devis')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16"y1="13"x2="8"y2="13"/><line x1="16"y1="17"x2="8"y2="17"/></svg>
  if(id==='clients')return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9"cy="7"r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
  return<svg viewBox="0 0 24 24"fill="none"stroke="currentColor"strokeWidth="2"strokeLinecap="round"style={{width:17,height:17,flexShrink:0}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
}
const initUsers:any[]=[
  {nom:'Alexandre Delcourt',email:'a.delcourt@batizo.fr',depuis:'01/03/2024',role:'proprietaire',vous:true,statut:'actif'},
  {nom:'Emma Strano',email:'e.strano@batizo.fr',depuis:'04/09/2024',role:'utilisateur',vous:false,statut:'actif'},
  {nom:'Ysaline Bernard',email:'y.bernard@batizo.fr',depuis:'15/01/2025',role:'utilisateur',vous:false,statut:'actif'},
  {nom:'Xavier Concy',email:'x.concy@batizo.fr',depuis:'03/03/2025',role:'observateur',vous:false,statut:'actif'},
  {nom:'Thomas Giraud',email:'t.giraud@batizo.fr',depuis:'10/01/2026',role:'utilisateur',vous:false,statut:'actif'},
]
const roleLabels:Record<string,string>={proprietaire:'Propriétaire',admin:'Admin',utilisateur:'Utilisateur',observateur:'Observateur',revoque:"Révoquer l'accès"}
const roleColors:Record<string,string>={proprietaire:'#7c3aed',admin:G,utilisateur:'#2563eb',observateur:AM,revoque:RD}
export default function UtilisateursPage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[showForm,setShowForm]=useState(false)
  const[users,setUsers]=useState(initUsers)
  const[newName,setNewName]=useState('')
  const[newEmail,setNewEmail]=useState('')
  const[newRole,setNewRole]=useState('utilisateur')
  const[editPerms,setEditPerms]=useState(false)
  const[showTransfert,setShowTransfert]=useState(false)
  const[transfertCible,setTransfertCible]=useState<{nom:string,idx:number}|null>(null)
  const estProprietaire = true // À connecter à Supabase plus tard
  const[perms,setPerms]=useState<Record<string,Record<string,boolean>>>({
    proprietaire:{voir_devis:true,creer_devis:true,modifier_devis:true,dupliquer:true,envoyer_devis:true,creer_facture:true,modifier_facture:true,envoyer_facture:true,archiver:true,pdf:true,voir_clients:true,ajouter_client:true,modifier_client:true,supprimer_client:true,voir_biblio:true,ajouter_biblio:true,modifier_biblio:true,supprimer_biblio:true,gerer_users:true,inviter:true,parametres:true,infos_entreprise:true,abonnement:true,transfert:true,stats:true},
    admin:{voir_devis:true,creer_devis:true,modifier_devis:true,dupliquer:true,envoyer_devis:true,creer_facture:true,modifier_facture:true,envoyer_facture:true,archiver:true,pdf:true,voir_clients:true,ajouter_client:true,modifier_client:true,supprimer_client:true,voir_biblio:true,ajouter_biblio:true,modifier_biblio:true,supprimer_biblio:true,gerer_users:true,inviter:true,parametres:true,infos_entreprise:false,abonnement:false,transfert:false,stats:true},
    utilisateur:{voir_devis:true,creer_devis:true,modifier_devis:true,dupliquer:true,envoyer_devis:true,creer_facture:true,modifier_facture:true,envoyer_facture:true,archiver:true,pdf:true,voir_clients:true,ajouter_client:true,modifier_client:true,supprimer_client:false,voir_biblio:true,ajouter_biblio:true,modifier_biblio:true,supprimer_biblio:false,gerer_users:false,inviter:false,parametres:false,infos_entreprise:false,abonnement:false,transfert:false,stats:true},
    observateur:{voir_devis:true,creer_devis:false,modifier_devis:false,dupliquer:false,envoyer_devis:false,creer_facture:false,modifier_facture:false,envoyer_facture:false,archiver:false,pdf:true,voir_clients:true,ajouter_client:false,modifier_client:false,supprimer_client:false,voir_biblio:true,ajouter_biblio:false,modifier_biblio:false,supprimer_biblio:false,gerer_users:false,inviter:false,parametres:false,infos_entreprise:false,abonnement:false,transfert:false,stats:true},
  })
  const transfererPropriete=(idx:number,nom:string)=>{
    setTransfertCible({nom,idx})
    setShowTransfert(true)
  }
  const confirmerTransfert=()=>{
    if(!transfertCible) return
    setUsers(p=>p.map((u,i)=>{
      if(u.vous) return {...u,role:'admin',vous:false}
      if(i===transfertCible.idx) return {...u,role:'admin',vous:true,statut:'actif'}
      return u
    }))
    setShowTransfert(false)
    setTransfertCible(null)
  }
  const togglePerm=(role:string,perm:string)=>{
    if(!estProprietaire||!editPerms) return
    setPerms(p=>({...p,[role]:{...p[role],[perm]:!p[role][perm]}}))
  }
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
  const inviter=async()=>{
    if(!newName||!newEmail)return
    setUsers(p=>[...p,{nom:newName,email:newEmail,depuis:new Date().toLocaleDateString('fr-FR'),role:newRole,vous:false,statut:'en_attente'}])
    try {
      const res = await fetch('/api/invite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:newEmail,nom:newName,role:newRole})})
      const data = await res.json()
      if(data.error) console.error('Erreur invitation:',data.error)
    } catch(e) { console.error(e) }
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
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Rôle</label>
                  <select value={newRole} onChange={e=>setNewRole(e.target.value)} style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
                    <option value="observateur">Observateur</option>
                    <option value="utilisateur" selected>Utilisateur</option>
                    <option value="admin">Admin</option>
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
                {['Nom','Adresse email','Inscrit le','Statut','Rôle'].map(h=>(
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
                          {u.nom.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                        </div>
                        {u.nom}
                        {u.vous&&<span style={{background:'#f0fdf4',color:G,fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10}}>Vous</span>}
                      </div>
                    </td>
                    <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{u.email}</td>
                    <td style={{padding:'14px 16px',fontSize:13,color:'#555'}}>{u.depuis}</td>
                    <td style={{padding:'14px 16px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:u.statut==='actif'?'#f0fdf4':u.statut==='en_attente'?'#fffbeb':u.statut==='desactive'?'#fef2f2':'#f9fafb',color:u.statut==='actif'?'#1D9E75':u.statut==='en_attente'?'#BA7517':u.statut==='desactive'?'#E24B4A':'#888'}}>
                        {u.statut==='actif'?'Actif':u.statut==='en_attente'?'En attente':u.statut==='desactive'?'Désactivé':'—'}
                      </span>
                    </td>
                    <td style={{padding:'14px 16px'}}>
                      {u.vous?(
                        <span style={{fontSize:13,color:'#444',fontStyle:'italic'}}>Propriétaire du compte</span>
                      ):(
                        <select defaultValue={u.role}
                          onChange={e=>{
                            const newRole=e.target.value
                            setUsers(p=>p.map((usr,idx)=>idx===i?{...usr,role:newRole,statut:newRole==='revoque'?'desactive':usr.statut==='desactive'?'actif':usr.statut}:usr))
                          }}
                          style={{padding:'5px 10px',border:`1px solid ${roleColors[u.role]||BD}`,borderRadius:6,fontSize:12,color:roleColors[u.role]||'#333',fontWeight:600,background:`${roleColors[u.role] || '#e5e7eb'}18`,outline:'none',cursor:'pointer'}}>
                          <option value="revoque">Révoquer l'accès</option>
                          <option value="observateur">Observateur</option>
                          <option value="utilisateur">Utilisateur</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{fontSize:13,color:'#444',marginTop:12}}>{users.length} utilisateurs · Plan Pro — jusqu'à <strong>10 utilisateurs</strong></p>
        
          
          {/* Transfert propriété */}
          {estProprietaire && (
            <div style={{marginTop:16,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,padding:'18px 20px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap' as const,gap:16}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:4}}>🔑 Transférer la propriété du compte</div>
                  <div style={{fontSize:13,color:'#555',lineHeight:1.6,maxWidth:400}}>
                    Transmettez les droits de propriétaire à un autre membre actif de votre équipe. Vous deviendrez Admin et perdrez l'accès aux fonctions réservées au propriétaire.
                  </div>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
                  <select
                    onChange={e=>{const idx=parseInt(e.target.value);if(idx>=0)setTransfertCible({nom:users[idx].nom,idx});else setTransfertCible(null)}}
                    style={{padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111',minWidth:180}}>
                    <option value="-1">Choisir un membre…</option>
                    {users.filter(u=>!u.vous&&u.statut==='actif').map((u,i)=>(
                      <option key={i} value={users.indexOf(u)}>{u.nom} — {roleLabels[u.role]||u.role}</option>
                    ))}
                  </select>
                  <button
                    onClick={()=>{if(transfertCible)setShowTransfert(true)}}
                    disabled={!transfertCible}
                    style={{padding:'8px 16px',background:transfertCible?'#E24B4A':'#f3f4f6',color:transfertCible?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:transfertCible?'pointer':'not-allowed',transition:'all 0.15s'}}>
                    Transférer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tableau des permissions */}
          <div style={{marginTop:32}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:4,flexWrap:'wrap' as const,gap:8}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:4}}>Autorisations par rôle</div>
                <div style={{fontSize:13,color:'#555'}}>Définit ce que chaque membre peut faire sur Batizo.</div>
              </div>
              {estProprietaire && (
                <button onClick={()=>setEditPerms(!editPerms)}
                  style={{padding:'8px 16px',background:editPerms?'#1D9E75':'#fff',color:editPerms?'#fff':'#333',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.15s'}}>
                  {editPerms ? '✓ Enregistrer' : '✏️ Modifier les autorisations'}
                </button>
              )}
            </div>
            {editPerms && (
              <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:13,color:'#92400e'}}>
                🔒 Vous êtes le propriétaire du compte — vous seul pouvez modifier ces autorisations.
              </div>
            )}
            <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{background:'#f9fafb'}}>
                    <th style={{padding:'12px 16px',textAlign:'left' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb',width:'40%'}}>ACTION</th>
                    <th style={{padding:'12px 16px',textAlign:'center' as const,fontSize:12,color:'#7c3aed',fontWeight:700,borderBottom:'1px solid #e5e7eb'}}>Propriétaire</th>
                    <th style={{padding:'12px 16px',textAlign:'center' as const,fontSize:12,color:'#1D9E75',fontWeight:700,borderBottom:'1px solid #e5e7eb'}}>Admin</th>
                    <th style={{padding:'12px 16px',textAlign:'center' as const,fontSize:12,color:'#2563eb',fontWeight:700,borderBottom:'1px solid #e5e7eb'}}>Utilisateur</th>
                    <th style={{padding:'12px 16px',textAlign:'center' as const,fontSize:12,color:'#BA7517',fontWeight:700,borderBottom:'1px solid #e5e7eb'}}>Observateur</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {section:'DEVIS & FACTURES',items:[
                      {label:'Voir les devis & factures',key:'voir_devis'},
                      {label:'Créer un devis',key:'creer_devis'},
                      {label:'Modifier un devis',key:'modifier_devis'},
                      {label:'Dupliquer un devis',key:'dupliquer'},
                      {label:'Envoyer un devis par email',key:'envoyer_devis'},
                      {label:'Créer une facture',key:'creer_facture'},
                      {label:'Modifier une facture',key:'modifier_facture'},
                      {label:'Envoyer une facture par email',key:'envoyer_facture'},
                      {label:'Archiver un chantier',key:'archiver'},
                      {label:'Télécharger PDF',key:'pdf'},
                    ]},
                    {section:'CLIENTS',items:[
                      {label:'Voir les clients',key:'voir_clients'},
                      {label:'Ajouter un client',key:'ajouter_client'},
                      {label:'Modifier un client',key:'modifier_client'},
                      {label:'Supprimer un client',key:'supprimer_client'},
                    ]},
                    {section:'BIBLIOTHÈQUE',items:[
                      {label:'Voir la bibliothèque',key:'voir_biblio'},
                      {label:'Ajouter un ouvrage / matériau',key:'ajouter_biblio'},
                      {label:'Modifier un ouvrage / matériau',key:'modifier_biblio'},
                      {label:'Supprimer un ouvrage / matériau',key:'supprimer_biblio'},
                    ]},
                    {section:'ADMINISTRATION',items:[
                      {label:'Gérer les utilisateurs',key:'gerer_users'},
                      {label:'Inviter des utilisateurs',key:'inviter'},
                      {label:'Accéder aux paramètres',key:'parametres'},
                      {label:"Modifier les infos entreprise",key:'infos_entreprise'},
                      {label:"Voir l'abonnement",key:'abonnement'},
                      {label:'Transférer la propriété',key:'transfert'},
                      {label:'Voir les statistiques',key:'stats'},
                    ]},
                  ].map((group,gi)=>(
                    <React.Fragment key={'g'+gi}>
                      <tr style={{background:'#f0fdf4'}}>
                        <td colSpan={4} style={{padding:'8px 16px',fontSize:11,fontWeight:700,color:'#1D9E75',letterSpacing:'0.06em'}}>{group.section}</td>
                      </tr>
                      {group.items.map((item,ii)=>(
                        <tr key={'i'+ii} style={{borderTop:'1px solid #e5e7eb'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                          <td style={{padding:'10px 16px',fontSize:13,color:'#333'}}>{item.label}</td>
                          {['proprietaire','admin','utilisateur','observateur'].map(role=>(
                            <td key={role} style={{padding:'10px 16px',textAlign:'center' as const}}>
                              <span
                                onClick={()=>role!=='proprietaire'&&togglePerm(role,item.key)}
                                style={{
                                  fontSize:18,
                                  cursor:editPerms&&estProprietaire?'pointer':'default',
                                  color:perms[role][item.key]?(role==='proprietaire'?'#7c3aed':role==='admin'?'#1D9E75':role==='utilisateur'?'#2563eb':'#BA7517'):'#d1d5db',
                                  transition:'color 0.15s',
                                  display:'inline-block',
                                  transform:editPerms?'scale(1.2)':'scale(1)',
                                }}>
                                {perms[role][item.key] ? '✓' : '✕'}
                              </span>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {/* Modal transfert propriété */}
      {showTransfert && transfertCible && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:16,padding:'2rem',maxWidth:420,width:'90%',textAlign:'center' as const}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E24B4A" strokeWidth="2" strokeLinecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <h3 style={{fontSize:18,fontWeight:700,color:'#111',marginBottom:8}}>Transférer la propriété ?</h3>
            <p style={{fontSize:14,color:'#555',lineHeight:1.6,marginBottom:8}}>
              Vous allez transférer la propriété du compte à <strong style={{color:'#111'}}>{transfertCible.nom}</strong>.
            </p>
            <p style={{fontSize:13,color:'#888',lineHeight:1.6,marginBottom:24}}>
              Vous deviendrez <strong>Admin</strong> et perdrez l'accès à certaines fonctions réservées au propriétaire. Cette action est irréversible sauf si le nouveau propriétaire vous retransfère les droits.
            </p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{setShowTransfert(false);setTransfertCible(null)}}
                style={{flex:1,padding:11,border:'1px solid #e5e7eb',borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer',color:'#333',fontWeight:500}}>
                Annuler
              </button>
              <button onClick={confirmerTransfert}
                style={{flex:1,padding:11,background:'#E24B4A',color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>
                Confirmer le transfert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
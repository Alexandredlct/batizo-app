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
export default function AbonnementPage(){
  const[collapsed,setCollapsed]=useState(false)
  const[userMenu,setUserMenu]=useState(false)
  const[changerPlan,setChangerPlan]=useState(false)
  const[modifierCarte,setModifierCarte]=useState(false)
  const[editFacturation,setEditFacturation]=useState(false)
  const[showModal,setShowModal]=useState(false)
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
              style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',borderRadius:8,background:'none',color:'#555',fontWeight:400,fontSize:13,textDecoration:'none',justifyContent:collapsed?'center':'flex-start',transition:'background 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}
              onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background='none'}>
              <NavIcon id={n.id}/>
              {!collapsed&&<span style={{flex:1}}>{n.label}</span>}
              {!collapsed&&n.badge&&<span style={{background:G,color:'#fff',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{n.badge}</span>}
            </a>
          ))}
        </nav>
        {!collapsed?(
          <div style={{padding:12,borderTop:`1px solid ${BD}`,position:'relative'}}>
            <div onClick={e=>{e.stopPropagation();setUserMenu(!userMenu)}} style={{display:'flex',alignItems:'center',gap:8,padding:8,borderRadius:8,background:'#f9fafb',cursor:'pointer',transition:'background 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
              <div style={{width:32,height:32,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>A</div>
              <div style={{overflow:'hidden',flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'#111',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>Mon compte</div>
                <div style={{fontSize:11,color:'#888'}}>Batizo</div>
              </div>
              <svg viewBox="0 0 24 24"fill="none"stroke="#aaa"strokeWidth="2"style={{width:14,height:14,flexShrink:0,transform:userMenu?'rotate(180deg)':'rotate(0deg)',transition:'transform 0.2s'}}><polyline points="6 9 12 15 18 9"/></svg>
            </div>
            {userMenu&&(
              <div onClick={e=>e.stopPropagation()} style={{position:'absolute',bottom:70,left:8,right:8,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 -4px 20px rgba(0,0,0,0.1)',overflow:'hidden',zIndex:200}}>
                {menuItems.map(item=>(
                  <a key={item.label} href={item.href}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:item.href==='/abonnement'?G:'#333',fontWeight:item.href==='/abonnement'?600:400,textDecoration:'none',background:item.href==='/abonnement'?'#f0fdf4':'none',transition:'background 0.15s'}}
                    onMouseEnter={e=>{if(item.href!=='/abonnement')(e.currentTarget as HTMLAnchorElement).style.background='#f9fafb'}}
                    onMouseLeave={e=>{if(item.href!=='/abonnement')(e.currentTarget as HTMLAnchorElement).style.background='none'}}>
                    <span>{item.icon}</span>{item.label}
                  </a>
                ))}
                <div style={{borderTop:`1px solid ${BD}`}}>
                  <a href="/login" style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',fontSize:13,color:RD,textDecoration:'none',transition:'background 0.15s'}}
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
            <div style={{width:40,height:40,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:700,margin:'0 auto',cursor:'pointer'}}>A</div>
          </div>
        )}
      </div>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Abonnement</div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:24,maxWidth:900}}>

          {/* Plan actuel */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:10}}>Type d'abonnement</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16,marginBottom:changerPlan?20:0}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                    <span style={{fontSize:22,fontWeight:700}}>Plan Pro</span>
                    <span style={{background:'#f0fdf4',color:G,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>Actif</span>
                  </div>
                  <div style={{fontSize:14,color:'#555',marginBottom:6}}>19 € HT / mois · Renouvellement le <strong>7 mai 2026</strong></div>
                  <div style={{fontSize:13,color:'#555',display:'flex',alignItems:'center',gap:10}}>
                    Utilisateurs : <strong>5 / 10</strong>
                    <div style={{width:100,height:6,background:'#e5e7eb',borderRadius:10,position:'relative',display:'inline-block'}}>
                      <div style={{position:'absolute',left:0,top:0,height:6,width:'50%',background:G,borderRadius:10}}></div>
                    </div>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:8,alignItems:'flex-end'}}>
                  <button onClick={()=>setChangerPlan(!changerPlan)} style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    {changerPlan?'Fermer':'Changer de plan'}
                  </button>
                  <button onClick={()=>setShowModal(true)} style={{background:'none',border:'none',fontSize:12,color:RD,cursor:'pointer',padding:0}}>Annuler l'abonnement</button>
                </div>
              </div>
              {changerPlan&&(
                <div style={{borderTop:`1px solid ${BD}`,paddingTop:20}}>
                  <div style={{fontSize:14,fontWeight:600,marginBottom:14}}>Choisir un plan</div>
                  <div style={{display:'flex',gap:14,flexWrap:'wrap'}}>
                    {[
                      {name:'Starter',price:'Gratuit',sub:'/ 30 jours',feats:['Devis & factures','Gestion clients','Support chat'],current:false},
                      {name:'Pro',price:'19 €',sub:'HT / mois',feats:['Photos dans les devis','IA génération de posts','Documents complets','10 utilisateurs'],current:true},
                      {name:'Business',price:'49 €',sub:'HT / mois',feats:['Tout le Pro','Utilisateurs illimités','Suivi chantier avancé','Onboarding dédié'],current:false},
                    ].map(plan=>(
                      <div key={plan.name} style={{flex:1,minWidth:180,border:`2px solid ${plan.current?G:BD}`,borderRadius:10,padding:'16px',background:plan.current?'#f0fdf4':'#fff'}}>
                        {plan.current&&<div style={{fontSize:11,color:G,fontWeight:700,marginBottom:6}}>Plan actuel</div>}
                        <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{plan.name}</div>
                        <div style={{fontSize:18,fontWeight:700,color:G,marginBottom:10}}>{plan.price} <span style={{fontSize:12,fontWeight:400,color:'#888'}}>{plan.sub}</span></div>
                        <ul style={{listStyle:'none',padding:0,margin:'0 0 14px',fontSize:13,color:'#555',display:'flex',flexDirection:'column',gap:4}}>
                          {plan.feats.map(f=><li key={f}>✓ {f}</li>)}
                        </ul>
                        <button disabled={plan.current} style={{width:'100%',padding:'8px',background:plan.current?'#e5e7eb':G,color:plan.current?'#888':'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:plan.current?'not-allowed':'pointer'}}>
                          {plan.current?'Plan actuel':`Passer à ${plan.name}`}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Moyen de paiement */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:10}}>Moyen de paiement</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
                <div style={{display:'flex',alignItems:'center',gap:14}}>
                  <div style={{width:52,height:34,background:'#1a1a6e',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg width="30"height="18"viewBox="0 0 50 30"fill="none"><rect width="50"height="30"rx="4"fill="#1a1a6e"/><circle cx="20"cy="15"r="9"fill="#EB001B"opacity="0.9"/><circle cx="30"cy="15"r="9"fill="#F79E1B"opacity="0.9"/></svg>
                  </div>
                  <div>
                    <div style={{fontSize:14,fontWeight:600}}>•••• •••• •••• 4242</div>
                    <div style={{fontSize:12,color:'#888'}}>Expire le 09/2027 · Mastercard</div>
                  </div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <button onClick={()=>setModifierCarte(!modifierCarte)} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Modifier</button>
                  <button style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>+ Ajouter une carte</button>
                </div>
              </div>
              {modifierCarte&&(
                <div style={{marginTop:20,paddingTop:20,borderTop:`1px solid ${BD}`}}>
                  <div style={{display:'flex',gap:12,flexWrap:'wrap',marginBottom:12}}>
                    <div style={{flex:1,minWidth:180}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Numéro de carte</label>
                      <input placeholder="1234 5678 9012 3456" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
                    </div>
                    <div style={{width:100}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Expiration</label>
                      <input placeholder="MM/AA" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
                    </div>
                    <div style={{width:80}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>CVV</label>
                      <input placeholder="•••" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>Enregistrer</button>
                    <button onClick={()=>setModifierCarte(false)} style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Adresse de facturation */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:10}}>Adresse de facturation</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'20px 24px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:16}}>
                {!editFacturation?(
                  <>
                    <div>
                      <div style={{fontSize:14,fontWeight:600,marginBottom:4}}>Batizo SAS</div>
                      <div style={{fontSize:13,color:'#555',lineHeight:1.8}}>130 rue de Normandie<br/>92400 Courbevoie, France<br/>SIRET : 853 572 014<br/>N° TVA : FR XX XXX XXX XXX</div>
                    </div>
                    <button onClick={()=>setEditFacturation(true)} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Modifier</button>
                  </>
                ):(
                  <div style={{width:'100%'}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
                      {[['Nom entreprise','Batizo SAS'],['SIRET','853 572 014'],['Adresse','130 rue de Normandie'],['N° TVA','FR XX XXX XXX XXX']].map(([label,val])=>(
                        <div key={label}>
                          <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>{label}</label>
                          <input defaultValue={val} style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:'grid',gridTemplateColumns:'120px 1fr',gap:12,marginBottom:12}}>
                      <div><label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Code postal</label><input defaultValue="92400" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/></div>
                      <div><label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Ville</label><input defaultValue="Courbevoie" style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/></div>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button onClick={()=>setEditFacturation(false)} style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>Enregistrer</button>
                      <button onClick={()=>setEditFacturation(false)} style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer'}}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historique paiements */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:13,fontWeight:600,color:'#888',textTransform:'uppercase',letterSpacing:'0.04em',marginBottom:10}}>Historique des paiements</div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  {['Date','Description','Montant','Statut','Facture'].map(h=>(
                    <th key={h} style={{padding:'10px 16px',textAlign:'left',fontSize:12,color:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[
                    ['07/04/2026','Plan Pro — Avril 2026','22,61 € TTC','payé'],
                    ['07/03/2026','Plan Pro — Mars 2026','22,61 € TTC','payé'],
                    ['07/02/2026','Plan Pro — Février 2026','22,61 € TTC','payé'],
                    ['07/01/2026','Plan Pro — Janvier 2026','22,61 € TTC','payé'],
                    ['07/12/2025','Plan Pro — Décembre 2025','22,61 € TTC','échoué'],
                    ['07/11/2025','Plan Pro — Novembre 2025','22,61 € TTC','payé'],
                  ].map(([date,desc,montant,statut],i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${BD}`}} onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'} onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#555'}}>{date}</td>
                      <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{desc}</td>
                      <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:'#111'}}>{montant}</td>
                      <td style={{padding:'12px 16px'}}>
                        <span style={{background:statut==='payé'?'#f0fdf4':'#fef2f2',color:statut==='payé'?G:RD,fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20}}>{statut==='payé'?'Payé':'Échoué'}</span>
                      </td>
                      <td style={{padding:'12px 16px'}}>
                        {statut==='payé'?<button style={{background:'none',border:`1px solid ${BD}`,borderRadius:6,padding:'4px 10px',fontSize:12,cursor:'pointer',color:'#555'}}>⬇ PDF</button>:<span style={{fontSize:12,color:'#aaa'}}>—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Modal annulation */}
      {showModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:999,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:'2rem',maxWidth:400,width:'90%',textAlign:'center'}}>
            <div style={{width:52,height:52,borderRadius:'50%',background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 1rem'}}>
              <svg width="24"height="24"viewBox="0 0 24 24"fill="none"stroke={RD}strokeWidth="2"strokeLinecap="round"><circle cx="12"cy="12"r="10"/><line x1="12"y1="8"x2="12"y2="12"/><line x1="12"y1="16"x2="12.01"y2="16"/></svg>
            </div>
            <h3 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Annuler l'abonnement ?</h3>
            <p style={{fontSize:14,color:'#555',marginBottom:24,lineHeight:1.6}}>Votre accès restera actif jusqu'au <strong>7 mai 2026</strong>. Après cette date, votre compte passera en mode lecture seule.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowModal(false)} style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer'}}>Garder mon abonnement</button>
              <button onClick={()=>setShowModal(false)} style={{flex:1,padding:11,background:RD,color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>Confirmer l'annulation</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

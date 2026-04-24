'use client'
import { useState, useEffect, useRef } from 'react'

const G='#1D9E75', BD='#e5e7eb', RD='#E24B4A', AM='#BA7517'

interface Client {
  id:string; type:'particulier'|'professionnel'; nom:string; prenom?:string
  nomFamille?:string; raisonSociale?:string; email?:string; tel?:string
  civilite?:string; adresseFactLine1?:string; adresseFactCp?:string; adresseFactVille?:string
}

function getDisplayName(c:Client):string {
  if(c.type==='professionnel') return c.raisonSociale||c.nom
  const prenom=c.prenom||''; const nom=c.nomFamille||c.nom||''
  if(prenom&&nom) return prenom+' '+nom
  return nom||prenom||c.nom
}

interface Props { onClose:()=>void }

export default function NouveauDevisModal({ onClose }:Props) {
  const[search,setSearch]=useState('')
  const[clients,setClients]=useState<Client[]>([])
  const[filtered,setFiltered]=useState<Client[]>([])
  const[showDropdown,setShowDropdown]=useState(false)
  const[selectedClient,setSelectedClient]=useState<Client|null>(null)
  const[titre,setTitre]=useState('')
  const[showCreateClient,setShowCreateClient]=useState(false)
  const searchRef=useRef<HTMLInputElement>(null)

  // Champs mini-form création client
  const[newType,setNewType]=useState<'particulier'|'pro'>('particulier')
  const[newCivilite,setNewCivilite]=useState('')
  const[newPrenom,setNewPrenom]=useState('')
  const[newNom,setNewNom]=useState('')
  const[newRaison,setNewRaison]=useState('')
  const[newTel,setNewTel]=useState('')
  const[newEmail,setNewEmail]=useState('')
  const[newAdresse,setNewAdresse]=useState('')
  const[newCp,setNewCp]=useState('')
  const[newVille,setNewVille]=useState('')

  useEffect(()=>{
    try{
      const raw=localStorage.getItem('batizo_clients')
      if(raw) setClients(JSON.parse(raw))
    }catch(e){}
  },[])

  useEffect(()=>{
    if(search.length<2){setFiltered([]);setShowDropdown(false);return}
    const q=search.toLowerCase()
    const results=clients.filter(c=>{
      const name=getDisplayName(c).toLowerCase()
      return name.includes(q)||(c.email||'').toLowerCase().includes(q)||(c.raisonSociale||'').toLowerCase().includes(q)
    }).slice(0,6)
    setFiltered(results)
    setShowDropdown(true)
  },[search,clients])

  const selectClient=(c:Client)=>{
    setSelectedClient(c)
    setSearch('')
    setShowDropdown(false)
  }

  const createClient=()=>{
    const isPro=newType==='pro'
    const id='cli-'+Date.now()
    const nomComplet=isPro?newRaison:`${newCivilite?newCivilite+' ':''}${newPrenom} ${newNom}`.trim()
    const newClient:Client={
      id,type:isPro?'professionnel':'particulier',
      nom:nomComplet,prenom:newPrenom,nomFamille:newNom,
      raisonSociale:isPro?newRaison:'',civilite:newCivilite,
      email:newEmail,tel:newTel,
      adresseFactLine1:newAdresse,adresseFactCp:newCp,adresseFactVille:newVille,
    }
    const full={...newClient,statut:'actif',enCharge:'',nbDevis:0,caTotal:0,margeAvg:0,
      derniereActivite:new Date().toLocaleDateString('fr-FR'),
      dateCreation:new Date().toISOString()}
    try{
      const raw=localStorage.getItem('batizo_clients')
      const list=raw?JSON.parse(raw):[]
      list.unshift(full)
      localStorage.setItem('batizo_clients',JSON.stringify(list))
      setClients(list)
    }catch(e){}
    selectClient(newClient)
    setShowCreateClient(false)
  }

  const valider=()=>{
    if(!selectedClient||!titre.trim()) return
    const ref='DEV-'+new Date().getFullYear()+'-'+String(Math.floor(Math.random()*900)+100)
    const newDevis={
      id:'dev-'+Date.now(),ref,
      nom:getDisplayName(selectedClient)+' — '+titre.trim(),
      titreProjet:titre.trim(),
      clientId:selectedClient.id,
      clientNom:getDisplayName(selectedClient),
      clientSnapshot:{...selectedClient},
      statut:'brouillon',
      date:new Date().toLocaleDateString('fr-FR'),
      dateDevis:new Date().toISOString(),
      montant:0,lignes:[],tva:20,
      createdAt:new Date().toISOString(),
    }
    try{
      const raw=localStorage.getItem('batizo_devis')
      const list=raw?JSON.parse(raw):[]
      list.unshift(newDevis)
      localStorage.setItem('batizo_devis',JSON.stringify(list))
      localStorage.setItem('batizo_devis_current',JSON.stringify(newDevis))
      // Mettre à jour le client (nbDevis)
      const rawC=localStorage.getItem('batizo_clients')
      if(rawC){
        const clist=JSON.parse(rawC)
        const updated=clist.map((c:any)=>c.id===selectedClient.id?{...c,nbDevis:(c.nbDevis||0)+1,derniereActivite:new Date().toLocaleDateString('fr-FR')}:c)
        localStorage.setItem('batizo_clients',JSON.stringify(updated))
      }
    }catch(e){}
    window.location.href='/devis/nouveau'
  }

  const typeBadge=(type:'particulier'|'professionnel'|'pro')=>{
    const isPro=type==='professionnel'||type==='pro'
    return <span style={{fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10,background:isPro?'#eff6ff':'#fff7ed',color:isPro?'#2563eb':AM}}>{isPro?'Pro':'Particulier'}</span>
  }

  return(
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui'}}
      onClick={onClose}>

      {/* Modal principal */}
      {!showCreateClient&&(
        <div onClick={e=>e.stopPropagation()}
          style={{background:'#fff',borderRadius:14,padding:28,maxWidth:480,width:'92%',boxShadow:'0 8px 40px rgba(0,0,0,0.18)'}}>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
            <div style={{fontSize:17,fontWeight:700,color:'#111'}}>Nouveau devis</div>
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#888',lineHeight:1,padding:0}}>×</button>
          </div>

          {/* Champ 1 — Client */}
          <div style={{marginBottom:18}}>
            <label style={{fontSize:13,fontWeight:600,color:'#333',display:'block',marginBottom:6}}>
              Client <span style={{color:RD}}>*</span>
            </label>

            {selectedClient?(
              <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#f0fdf4',border:`1px solid ${G}`,borderRadius:8}}>
                <span style={{flex:1,fontSize:13,fontWeight:600,color:'#111'}}>{getDisplayName(selectedClient)}</span>
                {typeBadge(selectedClient.type)}
                <button onClick={()=>setSelectedClient(null)} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:16,lineHeight:1,padding:0}}>×</button>
              </div>
            ):(
              <div style={{position:'relative'}}>
                <input ref={searchRef} autoFocus value={search} onChange={e=>setSearch(e.target.value)}
                  placeholder="Rechercher ou créer un client..."
                  style={{width:'100%',padding:'10px 14px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                  onFocus={e=>{(e.currentTarget as HTMLInputElement).style.borderColor=G;if(search.length>=2)setShowDropdown(true)}}
                  onBlur={e=>{(e.currentTarget as HTMLInputElement).style.borderColor=BD;setTimeout(()=>setShowDropdown(false),150)}}/>
                {showDropdown&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,overflow:'hidden',marginTop:4}}>
                    {filtered.map(c=>(
                      <div key={c.id} onMouseDown={()=>selectClient(c)}
                        style={{padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,borderBottom:`1px solid #f9fafb`}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        <span style={{flex:1,fontSize:13,color:'#111',fontWeight:500}}>{getDisplayName(c)}</span>
                        {typeBadge(c.type)}
                      </div>
                    ))}
                    <div onMouseDown={()=>{setShowDropdown(false);setNewPrenom(search);setShowCreateClient(true)}}
                      style={{padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,color:G,fontWeight:600,fontSize:13,background:'#f9fafb'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}>
                      <span style={{fontSize:16,fontWeight:700}}>+</span>
                      Créer "{search}" comme nouveau client
                    </div>
                  </div>
                )}
                {search.length>0&&search.length<2&&(
                  <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,marginTop:4}}>
                    <div onMouseDown={()=>{setShowDropdown(false);setNewPrenom(search);setShowCreateClient(true)}}
                      style={{padding:'10px 14px',cursor:'pointer',display:'flex',alignItems:'center',gap:8,color:G,fontWeight:600,fontSize:13}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                      <span style={{fontSize:16,fontWeight:700}}>+</span>
                      Créer "{search}" comme nouveau client
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Champ 2 — Titre projet */}
          <div style={{marginBottom:24}}>
            <label style={{fontSize:13,fontWeight:600,color:'#333',display:'block',marginBottom:6}}>
              Titre du projet <span style={{color:RD}}>*</span>
            </label>
            <input value={titre} onChange={e=>setTitre(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&selectedClient&&titre.trim()&&valider()}
              placeholder="ex : Rénovation salle de bain"
              style={{width:'100%',padding:'10px 14px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
              onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
              onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
            <div style={{fontSize:11,color:'#888',marginTop:5}}>Le nom du client sera ajouté automatiquement</div>
          </div>

          {/* Preview */}
          {selectedClient&&titre.trim()&&(
            <div style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 14px',marginBottom:18,fontSize:12,color:'#555'}}>
              Aperçu : <strong style={{color:'#111'}}>{getDisplayName(selectedClient)} — {titre.trim()}</strong>
            </div>
          )}

          {/* Boutons */}
          <div style={{display:'flex',gap:10}}>
            <button onClick={onClose}
              style={{flex:1,padding:'11px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555',fontWeight:500}}>
              Annuler
            </button>
            <button onClick={valider} disabled={!selectedClient||!titre.trim()}
              style={{flex:2,padding:'11px',background:selectedClient&&titre.trim()?G:'#e5e7eb',color:selectedClient&&titre.trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:selectedClient&&titre.trim()?'pointer':'not-allowed'}}>
              Valider →
            </button>
          </div>
        </div>
      )}

      {/* Mini-popup création client */}
      {showCreateClient&&(
        <div onClick={e=>e.stopPropagation()}
          style={{background:'#fff',borderRadius:14,padding:24,maxWidth:420,width:'92%',boxShadow:'0 8px 40px rgba(0,0,0,0.18)',maxHeight:'90vh',overflowY:'auto' as const}}>

          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Créer un client</div>
            <button onClick={()=>setShowCreateClient(false)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#888'}}>×</button>
          </div>

          {/* Type */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {(['particulier','pro'] as const).map(v=>(
              <button key={v} onClick={()=>setNewType(v)}
                style={{flex:1,padding:'8px',border:`1px solid ${newType===v?G:BD}`,borderRadius:8,background:newType===v?`${G}10`:'#fff',fontSize:13,fontWeight:newType===v?600:400,color:newType===v?G:'#555',cursor:'pointer'}}>
                {v==='particulier'?'Particulier':'Professionnel'}
              </button>
            ))}
          </div>

          {newType==='pro'?(
            <>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Raison sociale *</label>
                <input value={newRaison} onChange={e=>setNewRaison(e.target.value)} placeholder="Ex: Dupont Immobilier SAS"
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Prénom contact</label>
                  <input value={newPrenom} onChange={e=>setNewPrenom(e.target.value)}
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Nom contact</label>
                  <input value={newNom} onChange={e=>setNewNom(e.target.value)}
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
              </div>
            </>
          ):(
            <>
              <div style={{display:'flex',gap:6,marginBottom:12}}>
                {[['','—'],['M.','M.'],['Mme','Mme']].map(([v,l])=>(
                  <button key={v} onClick={()=>setNewCivilite(v)}
                    style={{padding:'6px 12px',border:`1px solid ${newCivilite===v?G:BD}`,borderRadius:6,background:newCivilite===v?`${G}10`:'#fff',fontSize:12,fontWeight:newCivilite===v?600:400,color:newCivilite===v?G:'#555',cursor:'pointer'}}>{l}</button>
                ))}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Prénom</label>
                  <input value={newPrenom} onChange={e=>setNewPrenom(e.target.value)}
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Nom *</label>
                  <input value={newNom} onChange={e=>setNewNom(e.target.value)}
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                </div>
              </div>
            </>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Téléphone</label>
              <input value={newTel} onChange={e=>setNewTel(e.target.value)} placeholder="06 XX XX XX XX"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Email</label>
              <input value={newEmail} onChange={e=>setNewEmail(e.target.value)} placeholder="email@exemple.fr"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
          </div>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Adresse</label>
            <input value={newAdresse} onChange={e=>setNewAdresse(e.target.value)} placeholder="Rue, avenue..."
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10,marginBottom:20}}>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>CP</label>
              <input value={newCp} onChange={e=>setNewCp(e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Ville</label>
              <input value={newVille} onChange={e=>setNewVille(e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
          </div>

          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>setShowCreateClient(false)}
              style={{flex:1,padding:'10px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>
              Retour
            </button>
            <button onClick={createClient}
              disabled={newType==='pro'?!newRaison.trim():!newNom.trim()}
              style={{flex:2,padding:'10px',background:((newType==='pro'&&newRaison.trim())||(newType==='particulier'&&newNom.trim()))?G:'#e5e7eb',color:((newType==='pro'&&newRaison.trim())||(newType==='particulier'&&newNom.trim()))?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              Créer et continuer →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

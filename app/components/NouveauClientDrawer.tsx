'use client'
import { useState, useEffect } from 'react'
const G='#1D9E75', BD='#e5e7eb'

export default function NouveauClientDrawer({onClose,onSave}:{onClose:()=>void,onSave:(client:any)=>void}){
  const[type,setType]=useState<'particulier'|'pro'>('particulier')
  const[civilite,setCivilite]=useState('')
  const[nom,setNom]=useState('')
  const[prenom,setPrenom]=useState('')
  const[raisonSociale,setRaisonSociale]=useState('')
  const[formeJuridique,setFormeJuridique]=useState('')
  const[paysImmat,setPaysImmat]=useState('France')
  const[siren,setSiren]=useState('')
  const[siret,setSiret]=useState('')
  const[tvaIntra,setTvaIntra]=useState('')
  const[email,setEmail]=useState('')
  const[tel,setTel]=useState('')
  const[adresse,setAdresse]=useState('')
  const[cp,setCp]=useState('')
  const[ville,setVille]=useState('')
  const[enCharge,setEnCharge]=useState('')
  const[notes,setNotes]=useState('')
  const[errors,setErrors]=useState<Record<string,string>>({})
  const[saved,setSaved]=useState(false)
  const[utilisateurs,setUtilisateurs]=useState<{id:string,nom:string}[]>([])

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // Charger utilisateurs depuis localStorage (page /utilisateurs)
  useEffect(()=>{
    try {
      const raw = localStorage.getItem('batizo_utilisateurs')
      if(raw) {
        const list = JSON.parse(raw)
        setUtilisateurs(list.filter((u:any)=>u.statut!=='revoque'&&u.statut!=='inactif'))
      } else {
        // Fallback si pas encore de table utilisateurs
        const params = JSON.parse(localStorage.getItem('batizo_params')||'{}')
        const nomEntreprise = params.nomEntreprise||''
        setUtilisateurs([{id:'1',nom:nomEntreprise?`Propriétaire (${nomEntreprise})`:'Propriétaire'}])
      }
    } catch(e){}
  },[])

  const Field=({label,value,onChange,placeholder,required=false,type:t='text',onBlurValidate}:{label:string,value:string,onChange:(v:string)=>void,placeholder?:string,required?:boolean,type?:string,onBlurValidate?:()=>void})=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>{label}{required&&<span style={{color:'#DC2626'}}> *</span>}</label>
      <input type={t} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        onBlur={onBlurValidate}
        style={{width:'100%',padding:'9px 12px',border:`1px solid ${errors[label]?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}/>
      {errors[label]&&<div style={{fontSize:11,color:'#DC2626',marginTop:3}}>{errors[label]}</div>}
    </div>
  )

  const validateEmail=()=>{
    if(email&&!emailRegex.test(email)){
      setErrors(p=>({...p,'Email':'Email invalide'}))
    } else {
      setErrors(p=>{const n={...p};delete n['Email'];return n})
    }
  }

  const handleSave=()=>{
    const errs:Record<string,string>={}
    if(type==='particulier'&&!nom.trim()) errs['Nom']='Champ obligatoire'
    if(type==='pro'&&!raisonSociale.trim()) errs['Raison sociale']='Champ obligatoire'
    if(!email.trim()&&!tel.trim()) errs['Email']='Email ou téléphone obligatoire'
    if(email&&!emailRegex.test(email)) errs['Email']='Email invalide'
    setErrors(errs)
    if(Object.keys(errs).length>0) return

    const nomComplet = type==='pro'
      ? raisonSociale+(nom?` — ${civilite?civilite+' ':''}${prenom} ${nom}`.trim():'')
      : `${civilite?civilite+' ':''}${prenom} ${nom}`.trim()

    const client = {
      id: Date.now().toString(),
      nom: nomComplet,
      email, tel,
      adresse:`${adresse}${cp?' '+cp:''}${ville?' '+ville:''}`.trim(),
      siret, siren, tvaIntra, formeJuridique, paysImmat,
      notes, type, civilite, prenom, nomFamille:nom,
      raisonSociale, enCharge, statut:'actif',
      dateCreation: new Date().toISOString()
    }

    // Persister en localStorage (batizo_clients)
    try {
      const existing = JSON.parse(localStorage.getItem('batizo_clients')||'[]')
      localStorage.setItem('batizo_clients', JSON.stringify([...existing, client]))
    } catch(e){}

    onSave(client)
    setSaved(true)
    setTimeout(()=>onClose(), 800)
  }

  return(
    <>
      <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:500}} onClick={onClose}/>
      <div style={{position:'fixed',top:0,right:0,width:480,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:501,display:'flex',flexDirection:'column' as const}}>

        <div style={{padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Nouveau client</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onClose} style={{padding:'7px 14px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
            <button onClick={handleSave} style={{padding:'7px 16px',background:saved?'#059669':G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              {saved?'✓ Enregistré':'Enregistrer'}
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto' as const,padding:'20px 24px'}}>

          {/* Type */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Type de client</label>
            <div style={{display:'flex',gap:8}}>
              {(['particulier','pro'] as const).map(v=>(
                <button key={v} onClick={()=>setType(v)}
                  style={{flex:1,padding:'8px',border:`1px solid ${type===v?G:BD}`,borderRadius:8,background:type===v?`${G}10`:'#fff',fontSize:13,fontWeight:type===v?600:400,color:type===v?G:'#555',cursor:'pointer'}}>
                  {v==='particulier'?'👤 Particulier':'🏢 Pro'}
                </button>
              ))}
            </div>
          </div>

          {/* PRO */}
          {type==='pro'&&(<>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations entreprise</div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Raison sociale <span style={{color:'#DC2626'}}>*</span></label>
              <input value={raisonSociale} onChange={e=>setRaisonSociale(e.target.value)} placeholder="Ex: Dupont Immobilier SAS"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${errors['Raison sociale']?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              {errors['Raison sociale']&&<div style={{fontSize:11,color:'#DC2626',marginTop:3}}>{errors['Raison sociale']}</div>}
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Forme juridique</label>
              <select value={formeJuridique} onChange={e=>setFormeJuridique(e.target.value)}
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',background:'#fff'}}>
                <option value="">Choisir...</option>
                {['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre'].map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Pays immatriculation</label>
              <input value={paysImmat} onChange={e=>setPaysImmat(e.target.value)} placeholder="France"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>SIREN</label>
                <input value={siren} onChange={e=>setSiren(e.target.value)} placeholder="123456789"
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <div style={{marginBottom:14}}>
                <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>SIRET</label>
                <input value={siret} onChange={e=>setSiret(e.target.value)} placeholder="12345678900001"
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>N° TVA intracommunautaire</label>
              <input value={tvaIntra} onChange={e=>setTvaIntra(e.target.value)} placeholder="FR12345678901"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
            </div>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Contact principal</div>
          </>)}

          {/* Infos perso */}
          {type==='particulier'&&<div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations personnelles</div>}

          {/* Civilité : Non renseigné / M. / Mme */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Civilité</label>
            <div style={{display:'flex',gap:6}}>
              {[['','—'],['M.','M.'],['Mme','Mme']].map(([v,l])=>(
                <button key={v} onClick={()=>setCivilite(v)}
                  style={{padding:'6px 14px',border:`1px solid ${civilite===v?G:BD}`,borderRadius:6,background:civilite===v?`${G}10`:'#fff',fontSize:12,fontWeight:civilite===v?600:400,color:civilite===v?G:'#555',cursor:'pointer'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Prénom" value={prenom} onChange={setPrenom}/>
            <Field label="Nom" value={nom} onChange={setNom} required={type==='particulier'}/>
          </div>

          <Field label="Email" value={email} onChange={setEmail} placeholder="email@exemple.fr" type="email" onBlurValidate={validateEmail}/>
          <Field label="Téléphone" value={tel} onChange={setTel} placeholder="06 XX XX XX XX"/>

          {/* Adresse */}
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Adresse</div>
          <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Rue, avenue..."/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12}}>
            <Field label="Code postal" value={cp} onChange={setCp}/>
            <Field label="Ville" value={ville} onChange={setVille}/>
          </div>

          {/* En charge */}
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Suivi</div>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>En charge</label>
            <select value={enCharge} onChange={e=>setEnCharge(e.target.value)}
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',background:'#fff'}}>
              <option value="">Choisir...</option>
              {utilisateurs.map(u=><option key={u.id} value={u.nom}>{u.nom}</option>)}
            </select>
          </div>

          {/* Notes */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Notes internes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Informations complémentaires..."
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',resize:'vertical' as const,fontFamily:'system-ui,sans-serif',boxSizing:'border-box' as const}}/>
          </div>

        </div>
      </div>
    </>
  )
}

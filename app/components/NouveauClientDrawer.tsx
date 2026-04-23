'use client'
import { useState, useEffect } from 'react'
const G='#1D9E75', BD='#e5e7eb'
const placeholderStyle = `input::placeholder, textarea::placeholder { color: #9ca3af !important; opacity: 1 !important; }`

// Composants extraits hors du parent pour éviter la perte de focus
function Field({label,value,onChange,placeholder,required=false,type:t='text',error,onBlurValidate}:{
  label:string,value:string,onChange:(v:string)=>void,placeholder?:string,
  required?:boolean,type?:string,error?:string,onBlurValidate?:()=>void
}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>
        {label}{required&&<span style={{color:'#DC2626'}}> *</span>}
      </label>
      <input type={t} value={value} onChange={e=>onChange(e.target.value)}
        placeholder={placeholder} onBlur={onBlurValidate}
        style={{width:'100%',padding:'9px 12px',border:`1px solid ${error?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}/>
      {error&&<div style={{fontSize:11,color:'#DC2626',marginTop:3}}>{error}</div>}
    </div>
  )
}

function SelectField({label,value,onChange,options,required=false,error}:{
  label:string,value:string,onChange:(v:string)=>void,
  options:{value:string,label:string}[],required?:boolean,error?:string
}){
  return(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>
        {label}{required&&<span style={{color:'#DC2626'}}> *</span>}
      </label>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{width:'100%',padding:'9px 12px',border:`1px solid ${error?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
        <option value="">Choisir...</option>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error&&<div style={{fontSize:11,color:'#DC2626',marginTop:3}}>{error}</div>}
    </div>
  )
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NouveauClientDrawer({onClose,onSave,mode='create',clientInitial}:{
  onClose:()=>void,onSave:(client:any)=>void,mode?:'add'|'edit'|'create',clientInitial?:any
}){
  const[type,setType]=useState<'particulier'|'pro'>(clientInitial?.type||clientInitial?.typeClient||'particulier')
  const[civilite,setCivilite]=useState(clientInitial?.civilite||'')
  const[nom,setNom]=useState(clientInitial?.nomFamille||clientInitial?.nom?.split(' ').pop()||'')
  const[prenom,setPrenom]=useState(clientInitial?.prenom||'')
  const[raisonSociale,setRaisonSociale]=useState(clientInitial?.raisonSociale||'')
  const[formeJuridique,setFormeJuridique]=useState(clientInitial?.formeJuridique||'')
  const[paysImmat,setPaysImmat]=useState('France')
  const[siren,setSiren]=useState(clientInitial?.siren||'')
  const[siret,setSiret]=useState(clientInitial?.siret||'')
  const[tvaIntra,setTvaIntra]=useState(clientInitial?.tvaIntra||'')
  const[email,setEmail]=useState(clientInitial?.email||'')
  const[tel,setTel]=useState(clientInitial?.tel||'')
  const[adresse,setAdresse]=useState(clientInitial?.adresseFactLine1||clientInitial?.adresse?.split(',')[0]||'')
  const[cp,setCp]=useState(clientInitial?.adresseFactCp||'')
  const[ville,setVille]=useState(clientInitial?.adresseFactVille||'')
  const[enCharge,setEnCharge]=useState(clientInitial?.enCharge||'')
  const[notes,setNotes]=useState(clientInitial?.notes||'')
  const[errors,setErrors]=useState<Record<string,string>>({})
  const[saved,setSaved]=useState(false)
  const[utilisateurs,setUtilisateurs]=useState<{id:string,nom:string}[]>([])

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('batizo_utilisateurs')
      if(raw) {
        const list = JSON.parse(raw)
        setUtilisateurs(list.filter((u:any)=>u.statut!=='revoque'&&u.statut!=='inactif'))
      } else {
        const params = JSON.parse(localStorage.getItem('batizo_params')||'{}')
        setUtilisateurs([{id:'1',nom:params.nomEntreprise?`Propriétaire (${params.nomEntreprise})`:'Propriétaire'}])
      }
    } catch(e){}
  },[])

  const validateField=(field:string,val:string)=>{
    if(!val.trim()){
      setErrors(p=>({...p,[field]:'Ce champ est obligatoire'}))
    } else {
      setErrors(p=>{const n={...p};delete n[field];return n})
    }
  }

  const validateEmail=()=>{
    if(email&&!emailRegex.test(email)){
      setErrors(p=>({...p,'Email':'Email invalide'}))
    } else {
      setErrors(p=>{const n={...p};delete n['Email'];return n})
    }
  }

  const handleSave=()=>{
    const errs:Record<string,string>={}
    if(type==='particulier'&&!nom.trim()) errs['Nom']='Ce champ est obligatoire'
    if(type==='pro'&&!raisonSociale.trim()) errs['Raison sociale']='Ce champ est obligatoire'
    if(!adresse.trim()) errs['Adresse']='Ce champ est obligatoire'
    if(!cp.trim()) errs['Code postal']='Ce champ est obligatoire'
    if(!ville.trim()) errs['Ville']='Ce champ est obligatoire'
    if(!enCharge.trim()) errs['En charge']='Ce champ est obligatoire'
    if(email&&!emailRegex.test(email)) errs['Email']='Email invalide'
    setErrors(errs)
    if(Object.keys(errs).length>0) return

    const nomComplet = type==='pro'
      ? raisonSociale+(nom?` — ${civilite?civilite+' ':''}${prenom} ${nom}`.trim():'')
      : `${civilite?civilite+' ':''}${prenom} ${nom}`.trim()

    const client = {
      id:Date.now().toString(), nom:nomComplet, email, tel,
      adresse:`${adresse}${cp?' '+cp:''}${ville?' '+ville:''}`.trim(),
      siret, siren, tvaIntra, formeJuridique, paysImmat,
      notes, type, civilite, prenom, nomFamille:nom,
      raisonSociale, enCharge, statut:'actif',
      dateCreation:new Date().toISOString()
    }

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
      <style>{placeholderStyle}</style>
      <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:500}} onClick={onClose}/>
      <div style={{position:'fixed',top:0,right:0,width:480,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:501,display:'flex',flexDirection:'column' as const}}>

        <div style={{padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{mode==='edit'?'Modifier le client':'Nouveau client'}</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={onClose} style={{padding:'7px 14px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
            <button onClick={handleSave} style={{padding:'7px 16px',background:saved?'#059669':G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              {saved?'✓ Enregistré':'Enregistrer'}
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto' as const,padding:'20px 24px'}}>

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

          {type==='pro'&&(<>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations entreprise</div>
            <Field label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} placeholder="Ex: Dupont Immobilier SAS" required error={errors['Raison sociale']} onBlurValidate={()=>validateField('Raison sociale',raisonSociale)}/>
            <SelectField label="Forme juridique" value={formeJuridique} onChange={setFormeJuridique}
              options={['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre'].map(v=>({value:v,label:v}))}/>
            <Field label="Pays immatriculation" value={paysImmat} onChange={setPaysImmat} placeholder="France"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <Field label="SIREN" value={siren} onChange={setSiren} placeholder="123456789"/>
              <Field label="SIRET" value={siret} onChange={setSiret} placeholder="12345678900001"/>
            </div>
            <Field label="N° TVA intracommunautaire" value={tvaIntra} onChange={setTvaIntra} placeholder="FR12345678901"/>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Contact principal</div>
          </>)}

          {type==='particulier'&&<div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations personnelles</div>}

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
            <Field label="Nom" value={nom} onChange={setNom} required={type==='particulier'} error={errors['Nom']} onBlurValidate={()=>{if(type==='particulier')validateField('Nom',nom)}}/>
          </div>
          <Field label="Email" value={email} onChange={setEmail} placeholder="email@exemple.fr" type="email" error={errors['Email']} onBlurValidate={validateEmail}/>
          <Field label="Téléphone" value={tel} onChange={setTel} placeholder="06 XX XX XX XX"/>

          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Adresse</div>
          <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Rue, avenue..." required error={errors['Adresse']} onBlurValidate={()=>validateField('Adresse',adresse)}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12}}>
            <Field label="Code postal" value={cp} onChange={setCp} required error={errors['Code postal']} onBlurValidate={()=>validateField('Code postal',cp)}/>
            <Field label="Ville" value={ville} onChange={setVille} required error={errors['Ville']} onBlurValidate={()=>validateField('Ville',ville)}/>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Suivi</div>
          <SelectField label="En charge" value={enCharge} onChange={setEnCharge} required error={errors['En charge']}
            options={utilisateurs.map(u=>({value:u.nom,label:u.nom}))}/>

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

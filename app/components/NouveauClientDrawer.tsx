'use client'
import { useState } from 'react'
const G='#1D9E75', BD='#e5e7eb'

export default function NouveauClientDrawer({onClose,onSave}:{onClose:()=>void,onSave:(client:any)=>void}){
  const[type,setType]=useState<'particulier'|'pro'>('particulier')
  const[nom,setNom]=useState('')
  const[prenom,setPrenom]=useState('')
  const[raisonSociale,setRaisonSociale]=useState('')
  const[email,setEmail]=useState('')
  const[tel,setTel]=useState('')
  const[adresse,setAdresse]=useState('')
  const[cp,setCp]=useState('')
  const[ville,setVille]=useState('')
  const[siret,setSiret]=useState('')
  const[notes,setNotes]=useState('')
  const[errors,setErrors]=useState<Record<string,string>>({})
  const[saved,setSaved]=useState(false)

  const Field=({label,value,onChange,placeholder,required=false,type:t='text'}:{label:string,value:string,onChange:(v:string)=>void,placeholder?:string,required?:boolean,type?:string})=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>{label}{required&&<span style={{color:'#DC2626'}}> *</span>}</label>
      <input type={t} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'9px 12px',border:`1px solid ${errors[label]?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=errors[label]?'#DC2626':BD}/>
      {errors[label]&&<div style={{fontSize:11,color:'#DC2626',marginTop:3}}>{errors[label]}</div>}
    </div>
  )

  const handleSave=()=>{
    const errs:Record<string,string>={}
    if(type==='particulier'&&!nom.trim()) errs['Nom']='Champ obligatoire'
    if(type==='pro'&&!raisonSociale.trim()) errs['Raison sociale']='Champ obligatoire'
    if(!email.trim()&&!tel.trim()) errs['Email']='Email ou téléphone obligatoire'
    setErrors(errs)
    if(Object.keys(errs).length>0) return

    const nomComplet = type==='pro'
      ? raisonSociale+(nom?` — ${prenom} ${nom}`.trim():'')
      : `${prenom} ${nom}`.trim()

    onSave({nom:nomComplet,email,tel,adresse:`${adresse}${cp?' '+cp:''}${ville?' '+ville:''}`.trim(),siret,notes,type})
    setSaved(true)
    setTimeout(()=>onClose(),800)
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

          {type==='pro'&&(
            <>
              <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations entreprise</div>
              <Field label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} placeholder="Ex: Dupont Immobilier SAS" required/>
              <Field label="SIRET" value={siret} onChange={setSiret} placeholder="Ex: 12345678900001"/>
            </>
          )}

          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>
            {type==='pro'?'Contact principal':'Informations personnelles'}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <Field label="Prénom" value={prenom} onChange={setPrenom}/>
            <Field label="Nom" value={nom} onChange={setNom} required={type==='particulier'}/>
          </div>
          <Field label="Email" value={email} onChange={setEmail} placeholder="email@exemple.fr" type="email"/>
          <Field label="Téléphone" value={tel} onChange={setTel} placeholder="06 XX XX XX XX"/>

          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Adresse</div>
          <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Rue, avenue..."/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12}}>
            <Field label="Code postal" value={cp} onChange={setCp}/>
            <Field label="Ville" value={ville} onChange={setVille}/>
          </div>

          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Notes</div>
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

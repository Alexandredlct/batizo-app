'use client'
import { useState, useEffect } from 'react'
const G='#1D9E75', BD='#e5e7eb'

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
        style={{width:'100%',padding:'9px 12px',border:`1px solid ${error?'#DC2626':BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const,caretColor:'#111'}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>{(e.currentTarget as HTMLInputElement).style.borderColor=error?'#DC2626':BD;onBlurValidate?.()}}/>
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

function SecTitle({title}:{title:string}){
  return <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>{title}</div>
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function NouveauClientDrawer({onClose,onSave,mode='create',clientInitial}:{
  onClose:()=>void,onSave:(client:any)=>void,mode?:'add'|'edit'|'create',clientInitial?:any
}){
  const initType:'particulier'|'pro' = clientInitial?.type==='professionnel'?'pro':(clientInitial?.type||'particulier')

  // Champs particulier
  const[civilite,setCivilite]=useState(initType==='particulier'?clientInitial?.civilite||'':'')
  const[nom,setNom]=useState(initType==='particulier'?clientInitial?.nomFamille||clientInitial?.nom||'':'')
  const[prenom,setPrenom]=useState(initType==='particulier'?clientInitial?.prenom||'':'')
  const[emailPart,setEmailPart]=useState(initType==='particulier'?clientInitial?.email||'':'')
  const[telPart,setTelPart]=useState(initType==='particulier'?clientInitial?.tel||'':'')

  // Champs pro
  const[raisonSociale,setRaisonSociale]=useState(initType==='pro'?clientInitial?.raisonSociale||'':'')
  const[formeJuridique,setFormeJuridique]=useState(initType==='pro'?clientInitial?.formeJuridique||'':'')
  const[paysImmat,setPaysImmat]=useState(initType==='pro'?clientInitial?.paysImmat||'France':'France')
  const[siren,setSiren]=useState(initType==='pro'?clientInitial?.siren||'':'')
  const[siret,setSiret]=useState(initType==='pro'?clientInitial?.siret||'':'')
  const[tvaIntra,setTvaIntra]=useState(initType==='pro'?clientInitial?.tvaIntra||'':'')
  const[civiliteContact,setCiviliteContact]=useState(initType==='pro'?clientInitial?.civilite||'':'')
  const[prenomContact,setPrenomContact]=useState(initType==='pro'?clientInitial?.prenom||'':'')
  const[nomContact,setNomContact]=useState(initType==='pro'?clientInitial?.nomFamille||clientInitial?.nom||'':'')
  const[emailPro,setEmailPro]=useState(initType==='pro'?clientInitial?.email||'':'')
  const[telPro,setTelPro]=useState(initType==='pro'?clientInitial?.tel||'':'')

  // Champs communs
  const[adresse,setAdresse]=useState(clientInitial?.adresseFactLine1||clientInitial?.adresse?.split(',')[0]||'')
  const[cp,setCp]=useState(clientInitial?.adresseFactCp||'')
  const[ville,setVille]=useState(clientInitial?.adresseFactVille||'')
  const[enCharge,setEnCharge]=useState(clientInitial?.enCharge||'')
  const[notes,setNotes]=useState(clientInitial?.notes||'')

  const[type,setType]=useState<'particulier'|'pro'>(initType)
  const[confirmChange,setConfirmChange]=useState<'particulier'|'pro'|null>(null)
  const[errors,setErrors]=useState<Record<string,string>>({})
  const[saved,setSaved]=useState(false)
  const[utilisateurs,setUtilisateurs]=useState<{id:string,nom:string}[]>([])

  useEffect(()=>{
    try {
      const raw = localStorage.getItem('batizo_utilisateurs')
      if(raw){const list=JSON.parse(raw);setUtilisateurs(list.filter((u:any)=>u.statut!=='revoque'&&u.statut!=='inactif'))}
      else{const params=JSON.parse(localStorage.getItem('batizo_params')||'{}');setUtilisateurs([{id:'1',nom:params.nomEntreprise?`Propriétaire (${params.nomEntreprise})`:'Propriétaire'}])}
    }catch(e){}
  },[])

  const hasParticulierData=()=>nom||prenom||emailPart||telPart||civilite
  const hasProData=()=>raisonSociale||siren||siret||tvaIntra||prenomContact||nomContact

  const handleTypeChange=(newType:'particulier'|'pro')=>{
    if(newType===type) return
    const hasData=newType==='pro'?hasParticulierData():hasProData()
    if(hasData){setConfirmChange(newType)}
    else{setType(newType)}
  }

  const confirmTypeChange=()=>{
    if(!confirmChange)return
    if(confirmChange==='pro'){setCivilite('');setNom('');setPrenom('');setEmailPart('');setTelPart('')}
    else{setRaisonSociale('');setFormeJuridique('');setSiren('');setSiret('');setTvaIntra('');setCiviliteContact('');setPrenomContact('');setNomContact('');setEmailPro('');setTelPro('')}
    setType(confirmChange)
    setConfirmChange(null)
  }

  const validateEmail=(val:string,field:string)=>{
    if(val&&!emailRegex.test(val))setErrors(p=>({...p,[field]:'Email invalide'}))
    else setErrors(p=>{const n={...p};delete n[field];return n})
  }

  const handleSave=()=>{
    const errs:Record<string,string>={}
    if(type==='particulier'&&!nom.trim()) errs['Nom']='Ce champ est obligatoire'
    if(type==='pro'&&!raisonSociale.trim()) errs['Raison sociale']='Ce champ est obligatoire'
    if(!adresse.trim()) errs['Adresse']='Ce champ est obligatoire'
    if(!cp.trim()) errs['Code postal']='Ce champ est obligatoire'
    if(!ville.trim()) errs['Ville']='Ce champ est obligatoire'
    if(!enCharge.trim()) errs['En charge']='Ce champ est obligatoire'
    const emailVal=type==='particulier'?emailPart:emailPro
    if(emailVal&&!emailRegex.test(emailVal)) errs['Email']='Email invalide'
    setErrors(errs)
    if(Object.keys(errs).length>0) return

    let client:any
    if(type==='particulier'){
      const nomComplet=`${civilite?civilite+' ':''}${prenom?prenom+' ':''}${nom}`.trim()
      client={id:clientInitial?.id||Date.now().toString(),type:'particulier',nom:nomComplet,
        civilite,prenom,nomFamille:nom,email:emailPart,tel:telPart,
        adresseFactLine1:adresse,adresseFactCp:cp,adresseFactVille:ville,
        adresse:`${adresse} ${cp} ${ville}`.trim(),
        enCharge,notes,statut:'actif',dateCreation:clientInitial?.dateCreation||new Date().toISOString(),
        nbDevis:clientInitial?.nbDevis||0,caTotal:clientInitial?.caTotal||0,margeAvg:clientInitial?.margeAvg||0,
        derniereActivite:clientInitial?.derniereActivite||new Date().toLocaleDateString('fr-FR')}
    } else {
      client={id:clientInitial?.id||Date.now().toString(),type:'professionnel',
        nom:raisonSociale,raisonSociale,formeJuridique,paysImmat,siren,siret,tvaIntra,
        civilite:civiliteContact,prenom:prenomContact,nomFamille:nomContact,nom:raisonSociale,
        email:emailPro,tel:telPro,
        adresseFactLine1:adresse,adresseFactCp:cp,adresseFactVille:ville,
        adresse:`${adresse} ${cp} ${ville}`.trim(),
        enCharge,notes,statut:'actif',dateCreation:clientInitial?.dateCreation||new Date().toISOString(),
        nbDevis:clientInitial?.nbDevis||0,caTotal:clientInitial?.caTotal||0,margeAvg:clientInitial?.margeAvg||0,
        derniereActivite:clientInitial?.derniereActivite||new Date().toLocaleDateString('fr-FR')}
    }

    if(!clientInitial?.id){
      try{const ex=JSON.parse(localStorage.getItem('batizo_clients')||'[]');localStorage.setItem('batizo_clients',JSON.stringify([...ex,client]))}catch(e){}
    }

    onSave(client)
    setSaved(true)
    setTimeout(()=>onClose(),800)
  }

  return(
    <>
      <style>{`input,textarea{color:#111!important} input::placeholder,textarea::placeholder{color:#9ca3af!important}`}</style>
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

          {/* Type */}
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Type de client</label>
            <div style={{display:'flex',gap:8}}>
              {(['particulier','pro'] as const).map(v=>(
                <button key={v} onClick={()=>handleTypeChange(v)}
                  style={{flex:1,padding:'8px',border:`1px solid ${type===v?G:BD}`,borderRadius:8,background:type===v?`${G}10`:'#fff',fontSize:13,fontWeight:type===v?600:400,color:type===v?G:'#555',cursor:'pointer'}}>
                  {v==='particulier'?'👤 Particulier':'🏢 Pro'}
                </button>
              ))}
            </div>
          </div>

          {/* PRO */}
          {type==='pro'&&(<>
            <SecTitle title="Informations entreprise"/>
            <Field label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} placeholder="Ex: Dupont Immobilier SAS" required error={errors['Raison sociale']}/>
            <SelectField label="Forme juridique" value={formeJuridique} onChange={setFormeJuridique}
              options={['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre'].map(v=>({value:v,label:v}))}/>
            <Field label="Pays immatriculation" value={paysImmat} onChange={setPaysImmat} placeholder="France"/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <Field label="SIREN" value={siren} onChange={setSiren} placeholder="123456789"/>
              <Field label="SIRET" value={siret} onChange={setSiret} placeholder="12345678900001"/>
            </div>
            <Field label="N° TVA intracommunautaire" value={tvaIntra} onChange={setTvaIntra} placeholder="FR12345678901"/>
            <SecTitle title="Contact principal"/>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Civilité</label>
              <div style={{display:'flex',gap:6}}>
                {[['','—'],['M.','M.'],['Mme','Mme']].map(([v,l])=>(
                  <button key={v} onClick={()=>setCiviliteContact(v)}
                    style={{padding:'6px 14px',border:`1px solid ${civiliteContact===v?G:BD}`,borderRadius:6,background:civiliteContact===v?`${G}10`:'#fff',fontSize:12,fontWeight:civiliteContact===v?600:400,color:civiliteContact===v?G:'#555',cursor:'pointer'}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Prénom" value={prenomContact} onChange={setPrenomContact}/>
              <Field label="Nom" value={nomContact} onChange={setNomContact}/>
            </div>
            <Field label="Email" value={emailPro} onChange={setEmailPro} placeholder="email@exemple.fr" type="email" error={errors['Email']} onBlurValidate={()=>validateEmail(emailPro,'Email')}/>
            <Field label="Téléphone" value={telPro} onChange={setTelPro} placeholder="06 XX XX XX XX"/>
          </>)}

          {/* PARTICULIER */}
          {type==='particulier'&&(<>
            <SecTitle title="Informations personnelles"/>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Civilité</label>
              <div style={{display:'flex',gap:6}}>
                {[['','—'],['M.','M.'],['Mme','Mme']].map(([v,l])=>(
                  <button key={v} onClick={()=>setCivilite(v)}
                    style={{padding:'6px 14px',border:`1px solid ${civilite===v?G:BD}`,borderRadius:6,background:civilite===v?`${G}10`:'#fff',fontSize:12,fontWeight:civilite===v?600:400,color:civilite===v?G:'#555',cursor:'pointer'}}>{l}</button>
                ))}
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <Field label="Prénom" value={prenom} onChange={setPrenom}/>
              <Field label="Nom" value={nom} onChange={setNom} required error={errors['Nom']}/>
            </div>
            <Field label="Email" value={emailPart} onChange={setEmailPart} placeholder="email@exemple.fr" type="email" error={errors['Email']} onBlurValidate={()=>validateEmail(emailPart,'Email')}/>
            <Field label="Téléphone" value={telPart} onChange={setTelPart} placeholder="06 XX XX XX XX"/>
          </>)}

          {/* COMMUN */}
          <SecTitle title="Adresse"/>
          <Field label="Adresse" value={adresse} onChange={setAdresse} placeholder="Rue, avenue..." required error={errors['Adresse']}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12}}>
            <Field label="Code postal" value={cp} onChange={setCp} required error={errors['Code postal']}/>
            <Field label="Ville" value={ville} onChange={setVille} required error={errors['Ville']}/>
          </div>

          <SecTitle title="Suivi"/>
          <SelectField label="En charge" value={enCharge} onChange={setEnCharge} required error={errors['En charge']}
            options={utilisateurs.map(u=>({value:u.nom,label:u.nom}))}/>
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Notes internes</label>
            <textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={3} placeholder="Informations complémentaires..."
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,color:'#111',outline:'none',resize:'vertical' as const,fontFamily:'system-ui,sans-serif',boxSizing:'border-box' as const}}/>
          </div>
        </div>
      </div>

      {/* Modal confirmation changement type */}
      {confirmChange&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.5)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <div style={{background:'#fff',borderRadius:14,padding:24,maxWidth:380,width:'90%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:8}}>⚠️ Changer le type de client</div>
            <div style={{fontSize:13,color:'#555',marginBottom:20,lineHeight:1.6}}>
              Vous allez perdre les informations du mode <strong>{confirmChange==='pro'?'Particulier':'Pro'}</strong> déjà saisies. Cette action est irréversible.
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setConfirmChange(null)} style={{flex:1,padding:'10px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',fontWeight:500}}>Annuler</button>
              <button onClick={confirmTypeChange} style={{flex:1,padding:'10px',background:'#DC2626',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'
import { useState, useEffect, useCallback } from 'react'

const G='#1D9E75', AM='#BA7517', RD='#E24B4A', BD='#e5e7eb'
const fmt=(n:number)=>n.toLocaleString('fr-FR')+' €'
const fmtSize=(b:number)=>b>1024*1024?(b/1024/1024).toFixed(1)+' Mo':(b/1024).toFixed(0)+' Ko'

const isNouveau=(dateStr:string)=>{
  const [d,m,y]=dateStr.split('/').map(Number)
  return (Date.now()-new Date(y,m-1,d).getTime())<30*24*3600*1000
}

const MEMBRES=['Alexandre Delcourt','Emma Strano','Ysaline Bernard','Xavier Concy','Thomas Giraud']
const FORMES=['SAS','SARL','SA','EURL','SASU','SCI','Auto-entrepreneur','Autre']

const historiqueDevis=[
  {clientId:'c1',num:'DEV-2024-089',titre:'Rénovation bureau 3ème étage',date:'05/04/2026',statut:'Signé',montant:42000,marge:64},
  {clientId:'c1',num:'DEV-2024-076',titre:'Installation électrique complète',date:'12/02/2026',statut:'Signé',montant:28500,marge:61},
  {clientId:'c2',num:'DEV-2024-091',titre:'Rénovation salle de bain',date:'08/04/2026',statut:'En attente',montant:12400,marge:58},
  {clientId:'c2',num:'DEV-2024-083',titre:'Peinture salon/séjour',date:'15/03/2026',statut:'Signé',montant:8200,marge:57},
  {clientId:'c3',num:'DEV-2024-085',titre:'Rénovation immeuble 12 lots',date:'02/04/2026',statut:'En cours',montant:95000,marge:66},
  {clientId:'c3',num:'DEV-2024-072',titre:'Aménagement parties communes',date:'20/02/2026',statut:'Signé',montant:34000,marge:63},
]

const historiqueCommunications:Record<string,{date:string,type:string,sujet:string,statut:string}[]>={
  'c1':[
    {date:'05/04/2026 09:15',type:'devis',sujet:'DEV-2024-089 - Rénovation bureau',statut:'Envoyé'},
    {date:'12/02/2026 14:30',type:'facture',sujet:'FAC-2024-076 - Installation électrique',statut:'Payée'},
  ],
  'c2':[{date:'08/04/2026 16:45',type:'devis',sujet:'DEV-2024-091 - Rénovation SDB',statut:'Envoyé'}],
  'c3':[
    {date:'02/04/2026 08:30',type:'devis',sujet:'DEV-2024-085 - Rénovation immeuble',statut:'Envoyé'},
    {date:'20/02/2026 15:00',type:'facture',sujet:'FAC-2024-072 - Parties communes',statut:'Payée'},
  ],
}

const statutColors:Record<string,{background:string,color:string}>={
  'Signé':{background:'#f0fdf4',color:G},
  'En attente':{background:'#fffbeb',color:AM},
  'En cours':{background:'#eff6ff',color:'#2563eb'},
  'Refusé':{background:'#fef2f2',color:RD},
  'Brouillon':{background:'#f9fafb',color:'#888'},
  'Finalisé':{background:'#eff6ff',color:'#2563eb'},
}

interface Props {
  client?: any
  mode?: 'view'|'edit'|'new'
  allClients?: any[]
  onClose: () => void
  onSave?: (client:any) => void
}

export default function FicheClientPanel({ client, mode:initialMode='view', allClients=[], onClose, onSave }: Props) {
  const [mode, setMode] = useState<'view'|'edit'>(initialMode==='new'?'edit':'view')
  const [note, setNote] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [pj, setPj] = useState<{name:string,size:number,date:string,url:string,type:string}[]>(()=>{
    if(typeof window==='undefined') return []
    try{
      const stored=localStorage.getItem(`batizo_pj_${client?.id||'new'}`)
      return stored?JSON.parse(stored):[]
    }catch{return []}
  })
  const [notes, setNotes] = useState<{text:string,date:string,auteur:string,mentions:string[]}[]>(()=>{
    if(typeof window==='undefined') return []
    try{
      const stored=localStorage.getItem(`batizo_notes_${client?.id||'new'}`)
      return stored?JSON.parse(stored):[]
    }catch{return []}
  })
  const [dirty, setDirty] = useState(false)
  const [showWarn, setShowWarn] = useState(false)
  const [errors, setErrors] = useState<Record<string,string>>({})

  // Form state
  const emptyForm = {
    type:'particulier', statut:'prospect', civilite:'M.', prenom:'', nom:'',
    email:'', tel:'', raisonSociale:'', formeJuridique:'SAS', paysImmat:'France',
    siren:'', siret:'', tvaIntra:'', contactNom:'', contactPoste:'',
    adresse:'', codePostal:'', ville:'', pays:'France',
    enCharge:MEMBRES[0], tags:'', notes:'',
  }
  const [form, setForm] = useState<any>(
    initialMode==='new' ? emptyForm : {...emptyForm,...client}
  )

  const setF=(k:string,v:any)=>{setForm((p:any)=>({...p,[k]:v}));setDirty(true)}
  const auteur=typeof window!=='undefined'?localStorage.getItem('batizo_prenom')||'Alexandre Delcourt':'Alexandre Delcourt'

  const saveNotes=(newNotes:any[])=>{
    try{localStorage.setItem(`batizo_notes_${client?.id||'new'}`,JSON.stringify(newNotes))}catch(e){}
  }

  const handleNoteChange=(val:string)=>{
    setNote(val)
    const lastAt=val.lastIndexOf('@')
    if(lastAt!==-1&&lastAt===val.length-1||(lastAt!==-1&&!val.slice(lastAt+1).includes(' ')&&val.slice(lastAt).length>0)){
      setMentionQuery(val.slice(lastAt+1))
      setShowMentions(true)
    } else {
      setShowMentions(false)
    }
  }

  const insertMention=(membre:string)=>{
    const lastAt=note.lastIndexOf('@')
    const newNote=note.slice(0,lastAt)+'@'+membre+' '
    setNote(newNote)
    setShowMentions(false)
  }

  const addNote=()=>{
    if(!note.trim()) return
    const mentions=MEMBRES.filter(m=>note.includes('@'+m))
    const newNotes=[{text:note,date:new Date().toLocaleString('fr-FR'),auteur,mentions},...notes]
    setNotes(newNotes)
    saveNotes(newNotes)
    setNote('')
    setShowMentions(false)
  }

  // Sauvegarder PJ dans localStorage
  const savePj=(newPj:any[])=>{
    try{localStorage.setItem(`batizo_pj_${client?.id||'new'}`,JSON.stringify(newPj))}catch(e){console.error('PJ storage error',e)}
  }

  const addFiles=(files:FileList|null)=>{
    if(!files) return
    Array.from(files).forEach(file=>{
      if(file.size>25*1024*1024){alert(`${file.name} dépasse 25 Mo`);return}
      const reader=new FileReader()
      reader.onload=(ev)=>{
        const url=ev.target?.result as string
        setPj(p=>{
          const newPj=[...p,{name:file.name,size:file.size,date:new Date().toLocaleString('fr-FR'),url,type:file.type}]
          savePj(newPj)
          return newPj
        })
      }
      reader.readAsDataURL(file)
    })
  }

  // Raccourcis clavier
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){
        if(dirty&&mode==='edit') setShowWarn(true)
        else onClose()
      }
      if((e.metaKey||e.ctrlKey)&&e.key==='s'&&mode==='edit'){
        e.preventDefault()
        handleSave()
      }
    }
    window.addEventListener('keydown',handler)
    return ()=>window.removeEventListener('keydown',handler)
  },[dirty,mode,form])

  const tryClose=()=>{
    if(dirty&&mode==='edit') setShowWarn(true)
    else onClose()
  }

  // Validation
  const validate=()=>{
    const errs:Record<string,string>={}
    if(form.type==='particulier'&&!form.prenom&&!form.nom) errs.nom='Prénom ou Nom obligatoire'
    if(form.type==='pro'&&!form.raisonSociale) errs.raisonSociale='Raison sociale obligatoire'
    if(form.email&&!/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) errs.email='Format email invalide'
    if(form.tel&&!/^(\+?[\d\s]{8,15})$/.test(form.tel.replace(/\s/g,''))) errs.tel='Format téléphone invalide'
    if(form.siret&&form.siret.replace(/\s/g,'').length!==14) errs.siret='Le SIRET doit contenir 14 chiffres'
    if(form.siren&&form.siren.replace(/\s/g,'').length!==9) errs.siren='Le SIREN doit contenir 9 chiffres'
    // Anti-doublon
    const others=allClients.filter((c:any)=>c.id!==client?.id)
    if(form.email){
      const dup=others.find((c:any)=>c.email===form.email)
      if(dup) errs.email=`Email déjà associé à ${dup.prenom} ${dup.nom}`
    }
    if(form.tel){
      const dup=others.find((c:any)=>c.tel===form.tel)
      if(dup) errs.tel=`Téléphone déjà associé à ${dup.prenom} ${dup.nom}`
    }
    return errs
  }

  const canSave=form.type==='particulier'?(form.prenom||form.nom):form.raisonSociale

  const handleSave=()=>{
    const errs=validate()
    setErrors(errs)
    if(Object.keys(errs).length>0) return
    if(onSave) onSave({...form, id:client?.id||'c-'+Date.now()})
    setDirty(false)
    setMode('view')
  }

  // Vérifier SIRET via API INSEE
  const verifSIRET=async()=>{
    if(!form.siret||form.siret.length<14) return
    try{
      const res=await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret/${form.siret.replace(/\s/g,'')}`)
      if(res.ok){
        const data=await res.json()
        const e=data.etablissement
        setF('raisonSociale',e.uniteLegale?.denominationUniteLegale||form.raisonSociale)
      }
    }catch{
      // API indisponible — saisie manuelle
    }
  }

  const isPro=form.type==='pro'
  const titre=isPro?(form.raisonSociale||'Nouveau client'):`${form.civilite} ${form.prenom} ${form.nom}`.trim()||'Nouveau client'
  const sousTitre=isPro?form.contactNom:''

  const Field=({label,k,placeholder,type='text',req=false}:{label:string,k:string,placeholder?:string,type?:string,req?:boolean})=>(
    <div style={{marginBottom:12}}>
      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>
        {label}{req&&<span style={{color:RD}}> *</span>}
      </label>
      <input type={type} value={form[k]||''} onChange={e=>setF(k,e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'8px 10px',border:`1px solid ${errors[k]?RD:BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=errors[k]?RD:G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=errors[k]?RD:BD}/>
      {errors[k]&&<div style={{fontSize:11,color:RD,marginTop:3}}>{errors[k]}</div>}
    </div>
  )

  const Select=({label,k,options}:{label:string,k:string,options:string[]})=>(
    <div style={{marginBottom:12}}>
      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>{label}</label>
      <select value={form[k]||''} onChange={e=>setF(k,e.target.value)}
        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',background:'#fff',boxSizing:'border-box' as const}}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  )

  const SectionTitle=({t}:{t:string})=>(
    <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10,marginTop:4}}>{t}</div>
  )

  return (
    <>
      {/* Overlay */}
      <div onClick={tryClose} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399,transition:'opacity 0.3s'}}/>

      {/* Warning non sauvegardé */}
      {showWarn&&(
        <div style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#fff',borderRadius:12,padding:24,zIndex:500,boxShadow:'0 8px 40px rgba(0,0,0,0.2)',maxWidth:380,width:'90%',textAlign:'center' as const}}>
          <div style={{fontSize:20,marginBottom:8}}>⚠️</div>
          <div style={{fontSize:14,fontWeight:600,color:'#111',marginBottom:8}}>Modifications non sauvegardées</div>
          <div style={{fontSize:13,color:'#555',marginBottom:20}}>Des modifications n'ont pas été enregistrées. Voulez-vous vraiment fermer ?</div>
          <div style={{display:'flex',gap:8,justifyContent:'center'}}>
            <button onClick={()=>setShowWarn(false)} style={{padding:'8px 20px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',fontWeight:500}}>Annuler</button>
            <button onClick={()=>{setShowWarn(false);setDirty(false);onClose()}} style={{padding:'8px 20px',border:'none',borderRadius:8,background:RD,color:'#fff',fontSize:13,cursor:'pointer',fontWeight:600}}>Fermer sans enregistrer</button>
          </div>
        </div>
      )}

      {/* Drawer */}
      <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:580,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column' as const,overflow:'hidden',animation:'slideIn 0.3s ease-out'}}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{flex:1,minWidth:0}}>
            {mode==='view'?(
              <>
                <div style={{fontSize:15,fontWeight:700,color:'#111',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' as const}}>
                  {titre}
                  <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:8,
                    background:(client?.statut||form.statut)==='actif'?'#f0fdf4':(client?.statut||form.statut)==='prospect'?'#fffbeb':'#f9fafb',
                    color:(client?.statut||form.statut)==='actif'?G:(client?.statut||form.statut)==='prospect'?AM:'#888'}}>
                    {(client?.statut||form.statut)==='actif'?'Actif':(client?.statut||form.statut)==='prospect'?'Prospect':'Inactif'}
                  </span>
                  {client?.derniereActivite&&isNouveau(client.derniereActivite)&&(
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:6,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>
                  )}
                </div>
                {sousTitre&&<div style={{fontSize:12,color:'#888',marginTop:2}}>{sousTitre}</div>}
              </>
            ):(
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{initialMode==='new'?'Nouveau client':'Modifier le client'}</div>
            )}
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0,marginLeft:12}}>
            {mode==='view'?(
              <>
                <a href="/devis/nouveau" style={{padding:'7px 14px',background:G,color:'#fff',borderRadius:7,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>+ Devis</a>
                <button onClick={()=>setMode('edit')} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Modifier</button>
              </>
            ):(
              <button onClick={handleSave} disabled={!canSave}
                style={{padding:'7px 18px',background:canSave?G:'#e5e7eb',color:canSave?'#fff':'#aaa',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:canSave?'pointer':'not-allowed'}}>
                Enregistrer
              </button>
            )}
            <button onClick={tryClose} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column' as const,gap:16}}>

          {mode==='view' ? (
            <>
              {/* KPIs */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  {label:'Devis',val:client?.nbDevis||0,color:'#111'},
                  {label:'CA total HT',val:fmt(client?.caTotal||0),color:G},
                  {label:'Marge moy.',val:(client?.margeAvg||0)+'%',color:(client?.margeAvg||0)>=60?G:(client?.margeAvg||0)>=40?AM:RD},
                ].map(s=>(
                  <div key={s.label} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'10px 14px',textAlign:'center' as const}}>
                    <div style={{fontSize:10,color:'#888',fontWeight:600,textTransform:'uppercase' as const,marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:17,fontWeight:700,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Coordonnées */}
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <SectionTitle t="Coordonnées"/>
                <div style={{display:'flex',flexDirection:'column' as const,gap:7}}>
                  {[
                    {label:'Email',val:client?.email?<a href={`mailto:${client.email}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.email}</a>:null},
                    {label:'Téléphone',val:client?.tel?<a href={`tel:${(client.tel||'').replace(/\s/g,'')}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.tel}</a>:null},
                    {label:'Adresse',val:[client?.adresseFactLine1,client?.adresseFactCp,client?.adresseFactVille].filter(Boolean).join(' ')||null},
                    isPro&&client?.siret?{label:'SIRET',val:client.siret}:null,
                    isPro&&client?.tvaIntra?{label:'TVA intra',val:client.tvaIntra}:null,
                    client?.enCharge?{label:'En charge',val:client.enCharge}:null,
                    client?.source?{label:'Source',val:client.source}:null,
                  ].filter(Boolean).filter((i:any)=>i.val).map((item:any,i)=>(
                    <div key={i} style={{display:'flex',gap:8,fontSize:13}}>
                      <span style={{color:'#888',minWidth:90,flexShrink:0}}>{item.label}</span>
                      <span style={{color:'#111',fontWeight:500}}>{item.val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Historique devis */}
              <div>
                <SectionTitle t="Historique devis"/>
                {historiqueDevis.filter(d=>d.clientId===client?.id).length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucun devis</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                    {historiqueDevis.filter(d=>d.clientId===client?.id).map((d,i)=>(
                      <div key={i} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#fff'}
                        onClick={()=>window.location.href=`/devis/${d.num}`}>
                        <div>
                          <div style={{fontSize:11,color:'#888',marginBottom:1}}>{d.num} · {d.date}</div>
                          <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.titre}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,...(statutColors[d.statut]||{background:'#f9fafb',color:'#888'})}}>{d.statut}</span>
                          <div style={{textAlign:'right' as const}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(d.montant)}</div>
                            <div style={{fontSize:11,color:d.marge>=60?G:AM}}>{d.marge}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Communications */}
              <div>
                <SectionTitle t="Communications"/>
                {(historiqueCommunications[client?.id]||[]).length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune communication</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
                    {(historiqueCommunications[client?.id]||[]).map((comm,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:7}}>
                        <span>{comm.type==='devis'?'📄':comm.type==='facture'?'🧾':'🔔'}</span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:500,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{comm.sujet}</div>
                          <div style={{fontSize:11,color:'#888'}}>{comm.date}</div>
                        </div>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:8,background:comm.statut==='Payée'?'#f0fdf4':'#eff6ff',color:comm.statut==='Payée'?G:'#2563eb'}}>{comm.statut}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <SectionTitle t="Notes internes"/>
                <div style={{position:'relative' as const,marginBottom:8}}>
                  <div style={{display:'flex',gap:8}}>
                    <input value={note} onChange={e=>handleNoteChange(e.target.value)}
                      placeholder="Ajouter une note... (tapez @ pour mentionner)"
                      style={{flex:1,padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}
                      onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();addNote()}}}/>
                    <button onClick={addNote}
                      style={{width:36,height:36,borderRadius:7,background:G,color:'#fff',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>+</button>
                  </div>
                  {showMentions&&(
                    <div style={{position:'absolute' as const,bottom:'calc(100% + 4px)',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:10,minWidth:220}}>
                      {MEMBRES.filter(m=>m.toLowerCase().includes(mentionQuery.toLowerCase())).map(m=>(
                        <div key={m} onClick={()=>insertMention(m)}
                          style={{padding:'8px 12px',fontSize:13,cursor:'pointer',color:'#111',display:'flex',alignItems:'center',gap:8}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                          <span style={{width:24,height:24,borderRadius:'50%',background:G+'20',color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700}}>
                            {m.charAt(0)}
                          </span>
                          {m}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {notes.length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune note</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                    {notes.map((n,i)=>(
                      <div key={i} style={{padding:'12px 14px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,position:'relative' as const}}>
                        <div style={{fontSize:13,color:'#333',lineHeight:1.6,marginBottom:6}}>
                          {n.text.split(/(@w[ws]*)/g).map((part,j)=>
                            part.startsWith('@')
                              ? <strong key={j} style={{color:G}}>{part}</strong>
                              : part
                          )}
                        </div>
                        <div style={{fontSize:11,color:'#92400e',fontWeight:500}}>{n.auteur||auteur} — {n.date}</div>
                        {n.mentions?.length>0&&(
                          <div style={{fontSize:10,color:'#888',marginTop:3}}>Mentionné : {n.mentions.join(', ')}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Pièces jointes */}
              <div>
                <SectionTitle t="Pièces jointes"/>
                <input type="file" id="pj-upload" multiple style={{display:'none'}} onChange={e=>addFiles(e.target.files)}/>
                <label htmlFor="pj-upload">
                  <div
                    style={{border:`2px dashed ${BD}`,borderRadius:10,padding:'20px',textAlign:'center' as const,color:'#888',fontSize:13,cursor:'pointer',background:'#fafafa',transition:'all 0.15s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=BD}
                    onDragOver={e=>{e.preventDefault();(e.currentTarget as HTMLDivElement).style.borderColor=G;(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}}
                    onDragLeave={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=BD;(e.currentTarget as HTMLDivElement).style.background='#fafafa'}}
                    onDrop={e=>{e.preventDefault();(e.currentTarget as HTMLDivElement).style.borderColor=BD;(e.currentTarget as HTMLDivElement).style.background='#fafafa';addFiles(e.dataTransfer.files)}}>
                    <div style={{fontSize:22,marginBottom:6}}>📎</div>
                    Glissez vos fichiers ici ou <span style={{color:G,fontWeight:600}}>cliquez pour ajouter</span>
                    <div style={{fontSize:11,color:'#aaa',marginTop:4}}>Tous types de fichiers — max 25 Mo par fichier</div>
                  </div>
                </label>
                {pj.length>0&&(
                  <div style={{display:'flex',flexDirection:'column' as const,gap:6,marginTop:8}}>
                    {pj.map((f,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8}}>
                        <span style={{fontSize:20,flexShrink:0}}>
                          {f.type.startsWith('image/')
                            ? <img src={f.url} alt={f.name} style={{width:32,height:32,objectFit:'cover',borderRadius:4}}/>
                            : f.type==='application/pdf'?'📄':'📎'}
                        </span>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:13,fontWeight:500,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{f.name}</div>
                          <div style={{fontSize:11,color:'#888'}}>{fmtSize(f.size)} · {f.date}</div>
                        </div>
                        <div style={{display:'flex',gap:6,flexShrink:0}}>
                          <a href={f.url} target="_blank" rel="noreferrer"
                            style={{padding:'4px 8px',background:'#fff',border:`1px solid ${BD}`,borderRadius:6,fontSize:11,textDecoration:'none',color:'#555',cursor:'pointer'}}>Aperçu</a>
                          <a href={f.url} download={f.name}
                            style={{padding:'4px 8px',background:'#fff',border:`1px solid ${BD}`,borderRadius:6,fontSize:11,textDecoration:'none',color:'#555',cursor:'pointer'}}>↓</a>
                          <button onClick={()=>setPj(p=>{const newPj=p.filter((_,j)=>j!==i);savePj(newPj);return newPj})}
                            style={{padding:'4px 8px',background:'#fff',border:`1px solid #fca5a5`,borderRadius:6,fontSize:11,color:RD,cursor:'pointer'}}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Métadonnées */}
              {client&&(
                <div style={{fontSize:11,color:'#aaa',borderTop:`1px solid ${BD}`,paddingTop:12,lineHeight:1.8}}>
                  <div>Créé le {client.derniereActivite||'—'}</div>
                  <div>Dernière activité : {client.derniereActivite||'—'}</div>
                </div>
              )}
            </>
          ) : (
            /* ===== VUE ÉDITION ===== */
            <>
              {/* Type de client */}
              <div>
                <SectionTitle t="Type de client"/>
                <div style={{display:'flex',gap:8}}>
                  {[['particulier','👤 Particulier'],['pro','🏢 Pro']].map(([v,l])=>(
                    <button key={v} onClick={()=>setF('type',v)}
                      style={{flex:1,padding:'10px',border:`2px solid ${form.type===v?G:BD}`,borderRadius:8,background:form.type===v?'#f0fdf4':'#fff',color:form.type===v?G:'#555',fontSize:13,fontWeight:form.type===v?600:400,cursor:'pointer'}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statut */}
              <div>
                <SectionTitle t="Statut"/>
                <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                  {[['prospect','Prospect','#2563eb'],['actif','Actif',G],['inactif','Inactif','#888'],['archive','Archivé','#444']].map(([v,l,c])=>(
                    <button key={v} onClick={()=>setF('statut',v)}
                      style={{padding:'6px 14px',border:`2px solid ${form.statut===v?c:BD}`,borderRadius:20,background:form.statut===v?c+'18':'#fff',color:form.statut===v?c:'#555',fontSize:12,fontWeight:form.statut===v?700:400,cursor:'pointer'}}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Infos entreprise (Pro) */}
              {isPro&&(
                <div style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',border:`1px solid ${BD}`}}>
                  <SectionTitle t="Informations entreprise"/>
                  <Field label="Raison sociale" k="raisonSociale" req placeholder="SCI Les Pins"/>
                  <Select label="Forme juridique" k="formeJuridique" options={FORMES}/>
                  <Select label="Pays d'immatriculation" k="paysImmat" options={['France','Belgique','Suisse','Luxembourg','Autre']}/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Field label="SIREN" k="siren" placeholder="123 456 789"/>
                    <div>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>SIRET</label>
                      <div style={{display:'flex',gap:6}}>
                        <input value={form.siret||''} onChange={e=>setF('siret',e.target.value)} placeholder="123 456 789 00012"
                          style={{flex:1,padding:'8px 10px',border:`1px solid ${errors.siret?RD:BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
                        <button onClick={verifSIRET} style={{padding:'8px 10px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:11,cursor:'pointer',color:'#555',whiteSpace:'nowrap' as const,flexShrink:0}}>Vérifier</button>
                      </div>
                      {errors.siret&&<div style={{fontSize:11,color:RD,marginTop:3}}>{errors.siret}</div>}
                    </div>
                  </div>
                  <Field label="N° TVA intracommunautaire" k="tvaIntra" placeholder="FR12123456789"/>
                </div>
              )}

              {/* Contact principal (Pro) */}
              {isPro&&(
                <div style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',border:`1px solid ${BD}`}}>
                  <SectionTitle t="Contact principal"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <Field label="Nom du contact" k="contactNom" placeholder="Jean Dupont"/>
                    <Field label="Poste" k="contactPoste" placeholder="Directeur"/>
                  </div>
                </div>
              )}

              {/* Infos personnelles */}
              <div style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',border:`1px solid ${BD}`}}>
                <SectionTitle t="Informations personnelles"/>
                <div style={{display:'grid',gridTemplateColumns:'120px 1fr 1fr',gap:10,marginBottom:12}}>
                  <Select label="Civilité" k="civilite" options={['M.','Mme','Autre']}/>
                  <Field label="Prénom" k="prenom" placeholder="Jean" req={form.type==='particulier'}/>
                  <Field label="Nom" k="nom" placeholder="Dupont" req={form.type==='particulier'}/>
                </div>
                <Field label="Email" k="email" type="email" placeholder="jean@dupont.fr"/>
                <Field label="Téléphone" k="tel" placeholder="06 12 34 56 78"/>
              </div>

              {/* Adresse */}
              <div style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',border:`1px solid ${BD}`}}>
                <SectionTitle t="Adresse"/>
                <Field label="Adresse" k="adresse" placeholder="45 avenue des Champs"/>
                <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:10}}>
                  <Field label="Code postal" k="codePostal" placeholder="75008"/>
                  <Field label="Ville" k="ville" placeholder="Paris"/>
                </div>
                <Select label="Pays" k="pays" options={['France','Belgique','Suisse','Luxembourg','Autre']}/>
              </div>

              {/* Autres */}
              <div style={{background:'#f9fafb',borderRadius:10,padding:'14px 16px',border:`1px solid ${BD}`}}>
                <SectionTitle t="Autres"/>
                <Select label="En charge" k="enCharge" options={MEMBRES}/>
                <Field label="Tags (séparés par virgules)" k="tags" placeholder="VIP, gros chantier, zone parisienne"/>
                <div style={{marginBottom:12}}>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Notes</label>
                  <textarea value={form.notes||''} onChange={e=>setF('notes',e.target.value)} rows={3} placeholder="Notes internes..."
                    style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',resize:'none' as const,fontFamily:'system-ui',boxSizing:'border-box' as const}}/>
                </div>
              </div>

              {/* Suppression */}
              {client&&(
                <div style={{borderTop:`1px solid ${BD}`,paddingTop:16}}>
                  <button
                    disabled={client.nbDevis>0}
                    title={client.nbDevis>0?'Impossible de supprimer : ce client a des devis ou factures associés':''}
                    style={{padding:'8px 16px',background:client.nbDevis>0?'#f9fafb':'#fff',color:client.nbDevis>0?'#aaa':RD,border:`1px solid ${client.nbDevis>0?BD:RD}`,borderRadius:7,fontSize:13,cursor:client.nbDevis>0?'not-allowed':'pointer',fontWeight:500}}>
                    Supprimer le client
                  </button>
                  {client.nbDevis>0&&<div style={{fontSize:11,color:'#aaa',marginTop:4}}>Ce client a {client.nbDevis} devis associés — suppression impossible</div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

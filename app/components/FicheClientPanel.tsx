'use client'
import { useState } from 'react'

const G='#1D9E75', AM='#BA7517', RD='#E24B4A', BD='#e5e7eb'
const fmt=(n:number)=>n.toLocaleString('fr-FR')+' €'

const isNouveau=(dateStr:string)=>{
  const [d,m,y]=dateStr.split('/').map(Number)
  const date=new Date(y,m-1,d)
  return (Date.now()-date.getTime())<30*24*3600*1000
}

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
  'c2':[{date:'08/04/2026 16:45',type:'devis',sujet:'DEV-2024-091 - Rénovation salle de bain',statut:'Envoyé'}],
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
}

interface Props {
  client: any
  onClose: () => void
}

export default function FicheClientPanel({ client, onClose }: Props) {
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<string[]>(client.notes?[client.notes]:[])

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:580,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Header */}
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#111',display:'flex',alignItems:'center',gap:8,flexWrap:'wrap' as const}}>
              {client.civilite} {client.prenom} {client.nom}
              <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:8,
                background:client.statut==='actif'?'#f0fdf4':client.statut==='prospect'?'#fffbeb':'#f9fafb',
                color:client.statut==='actif'?G:client.statut==='prospect'?AM:'#888'}}>
                {client.statut==='actif'?'Actif':client.statut==='prospect'?'Prospect':'Inactif'}
              </span>
              {client.derniereActivite&&isNouveau(client.derniereActivite)&&(
                <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:6,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>
              )}
            </div>
            {client.raisonSociale&&<div style={{fontSize:12,color:'#888',marginTop:2}}>{client.raisonSociale}</div>}
          </div>
          <div style={{display:'flex',gap:8,flexShrink:0}}>
            <a href="/devis/nouveau" style={{padding:'7px 14px',background:G,color:'#fff',borderRadius:7,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>+ Devis</a>
            <button style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Modifier</button>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {[
              {label:'Devis',val:client.nbDevis,color:'#111'},
              {label:'CA total HT',val:fmt(client.caTotal),color:G},
              {label:'Marge moy.',val:client.margeAvg+'%',color:client.margeAvg>=60?G:client.margeAvg>=40?AM:RD},
            ].map(s=>(
              <div key={s.label} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'10px 14px',textAlign:'center' as const}}>
                <div style={{fontSize:10,color:'#888',fontWeight:600,textTransform:'uppercase' as const,marginBottom:3}}>{s.label}</div>
                <div style={{fontSize:17,fontWeight:700,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Coordonnées */}
          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Coordonnées</div>
            <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
              {[
                {label:'Email',val:<a href={`mailto:${client.email}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.email}</a>},
                {label:'Téléphone',val:<a href={`tel:${(client.tel||'').replace(/\s/g,'')}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.tel}</a>},
                {label:'Adresse fact.',val:`${client.adresseFactLine1||''} ${client.adresseFactCp||''} ${client.adresseFactVille||''}`},
                {label:'Chantier',val:(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span>{client.adresseChantierLine1||''} {client.adresseChantierCp||''} {client.adresseChantierVille||''}</span>
                    {client.adresseChantierVille&&(
                      <a href={`https://maps.google.com/?q=${encodeURIComponent((client.adresseChantierLine1||'')+' '+(client.adresseChantierCp||'')+' '+(client.adresseChantierVille||''))}`}
                        target="_blank" rel="noreferrer" style={{fontSize:11,color:'#2563eb',textDecoration:'none'}}>📍 Maps</a>
                    )}
                  </div>
                )},
                client.siret?{label:'SIRET',val:client.siret}:null,
                client.tvaIntra?{label:'TVA intra',val:client.tvaIntra}:null,
                client.enCharge?{label:'En charge',val:client.enCharge}:null,
                client.source?{label:'Source',val:client.source}:null,
              ].filter(Boolean).map((item:any,i)=>(
                <div key={i} style={{display:'flex',gap:8,fontSize:13}}>
                  <span style={{color:'#888',minWidth:90,flexShrink:0}}>{item.label}</span>
                  <span style={{color:'#111',fontWeight:500}}>{item.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historique devis */}
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Historique devis</div>
            {historiqueDevis.filter(d=>d.clientId===client.id).length===0?(
              <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucun devis</div>
            ):(
              <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                {historiqueDevis.filter(d=>d.clientId===client.id).map((d,i)=>(
                  <div key={i} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
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
            <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Communications</div>
            {(historiqueCommunications[client.id]||[]).length===0?(
              <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune communication</div>
            ):(
              <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
                {(historiqueCommunications[client.id]||[]).map((comm,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:7}}>
                    <span style={{fontSize:14}}>{comm.type==='devis'?'📄':comm.type==='facture'?'🧾':'🔔'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:500,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{comm.sujet}</div>
                      <div style={{fontSize:11,color:'#888'}}>{comm.date}</div>
                    </div>
                    <span style={{fontSize:10,fontWeight:700,padding:'2px 6px',borderRadius:8,background:comm.statut==='Payée'?'#f0fdf4':'#eff6ff',color:comm.statut==='Payée'?G:'#2563eb',flexShrink:0}}>{comm.statut}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Notes internes</div>
            <div style={{display:'flex',gap:8,marginBottom:8}}>
              <input value={note} onChange={e=>setNote(e.target.value)}
                placeholder="Ajouter une note..."
                style={{flex:1,padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}
                onKeyDown={e=>e.key==='Enter'&&note.trim()&&(setNotes(p=>[note,...p]),setNote(''))}/>
              <button onClick={()=>{if(note.trim()){setNotes(p=>[note,...p]);setNote('')}}}
                style={{width:36,height:36,borderRadius:7,background:G,color:'#fff',border:'none',cursor:'pointer',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>+</button>
            </div>
            {notes.length===0?(
              <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune note</div>
            ):(
              <div style={{display:'flex',flexDirection:'column' as const,gap:5}}>
                {notes.map((n,i)=>(
                  <div key={i} style={{padding:'8px 12px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#333',lineHeight:1.5}}>{n}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

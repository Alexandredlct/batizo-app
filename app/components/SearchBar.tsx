'use client'
import { useState } from 'react'

const G = '#1D9E75'

const searchData = [
  {cat:'Clients',icon:'👤',label:'Jean Dupont',sub:'Dupont Immobilier SAS · Paris',href:'/clients'},
  {cat:'Clients',icon:'👤',label:'Sophie Martin',sub:'Particulier · Courbevoie',href:'/clients'},
  {cat:'Clients',icon:'👤',label:'Karim Mansouri',sub:'Mansouri Promotion SARL · Paris',href:'/clients'},
  {cat:'Devis',icon:'📄',label:'DEV-2024-089',sub:'Rénovation bureau · 42 000 €',href:'/devis'},
  {cat:'Devis',icon:'📄',label:'DEV-2024-085',sub:'Rénovation immeuble · 95 000 €',href:'/devis'},
  {cat:'Matériaux',icon:'🧱',label:'Parquet chêne massif 12mm',sub:'28 €/m² · Marge 59%',href:'/bibliotheque'},
  {cat:'Matériaux',icon:'🧱',label:'Carrelage 60x60',sub:'32 €/m² · Marge 62%',href:'/bibliotheque'},
  {cat:'Ouvrages',icon:'🔨',label:'Pose parquet complet',sub:'103 €/m² · Marge 58%',href:'/bibliotheque'},
  {cat:'Ouvrages',icon:'🔨',label:'Installation tableau électrique',sub:'850 €/u · Marge 62%',href:'/bibliotheque'},
  {cat:'Main d\'oeuvre',icon:'👷',label:'Électricien qualifié',sub:'65 €/h',href:'/bibliotheque'},
  {cat:'Main d\'oeuvre',icon:'👷',label:'Plombier qualifié',sub:'70 €/h',href:'/bibliotheque'},
  {cat:'Pages',icon:'⚙️',label:'Paramètres',sub:'Configuration',href:'/parametres'},
  {cat:'Pages',icon:'💳',label:'Abonnement',sub:'Gérer votre plan',href:'/abonnement'},
  {cat:'Pages',icon:'👥',label:'Utilisateurs',sub:'Gérer votre équipe',href:'/utilisateurs'},
  {cat:'Pages',icon:'🎁',label:'Parrainage',sub:'Inviter des amis',href:'/parrainage'},
]

export default function SearchBar() {
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)

  const results = q.length >= 2
    ? searchData.filter(i =>
        i.label.toLowerCase().includes(q.toLowerCase()) ||
        i.sub.toLowerCase().includes(q.toLowerCase()) ||
        i.cat.toLowerCase().includes(q.toLowerCase())
      ).slice(0, 10)
    : []

  const grouped = results.reduce((acc: any, item) => {
    if (!acc[item.cat]) acc[item.cat] = []
    acc[item.cat].push(item)
    return acc
  }, {})

  return (
    <div style={{position:'relative', flex:1, maxWidth:440, margin:'0 16px'}} onClick={e=>e.stopPropagation()}>
      {open && <div onClick={()=>{setOpen(false);setQ('')}} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:98}}/>}
      <div style={{position:'relative',zIndex:99}}>
        <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',pointerEvents:'none'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input value={q}
          onChange={e=>{setQ(e.target.value);setOpen(true)}}
          onFocus={e=>{setOpen(true);(e.currentTarget as HTMLInputElement).style.borderColor=G;(e.currentTarget as HTMLInputElement).style.background='#fff'}}
          onBlur={e=>{(e.currentTarget as HTMLInputElement).style.borderColor='#d1d5db';(e.currentTarget as HTMLInputElement).style.background='#f9fafb'}}
          placeholder="Rechercher un client, devis, matériau…"
          style={{width:'100%',padding:'8px 30px 8px 32px',border:'1px solid #d1d5db',borderRadius:8,fontSize:13,outline:'none',color:'#111',background:'#f9fafb',boxSizing:'border-box' as const,transition:'all 0.15s'}}/>
        {q&&<button onClick={()=>{setQ('');setOpen(false)}} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16,lineHeight:1}}>×</button>}
      </div>
      {open&&q.length>=2&&(
        <div style={{position:'absolute',top:'110%',left:0,right:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',maxHeight:400,overflowY:'auto',zIndex:99}}>
          {results.length===0?(
            <div style={{padding:'20px',textAlign:'center' as const,fontSize:13,color:'#888'}}>Aucun résultat pour "{q}"</div>
          ):Object.entries(grouped).map(([cat,items]:any)=>(
            <div key={cat}>
              <div style={{padding:'8px 14px 4px',fontSize:10,fontWeight:700,color:'#aaa',textTransform:'uppercase' as const,letterSpacing:'0.06em',background:'#f9fafb'}}>{cat}</div>
              {items.map((item:any,i:number)=>(
                <a key={i} href={item.href} onClick={()=>{setOpen(false);setQ('')}}
                  style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',textDecoration:'none',transition:'background 0.1s',borderBottom:'1px solid #f9fafb'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.background='#f0fdf4'}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.background=''}>
                  <span style={{fontSize:15,flexShrink:0}}>{item.icon}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{item.label}</div>
                    <div style={{fontSize:11,color:'#888'}}>{item.sub}</div>
                  </div>
                </a>
              ))}
            </div>
          ))}
          <div style={{padding:'8px 14px',fontSize:11,color:'#aaa',textAlign:'center' as const,borderTop:'1px solid #f3f4f6'}}>{results.length} résultat{results.length>1?'s':''}</div>
        </div>
      )}
    </div>
  )
}

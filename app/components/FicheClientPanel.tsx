'use client'

const G='#1D9E75', AM='#BA7517', RD='#E24B4A', BD='#e5e7eb'
const fmt=(n:number)=>n.toLocaleString('fr-FR')+' €'

interface Props {
  client: any
  onClose: () => void
}

export default function FicheClientPanel({ client, onClose }: Props) {
  return (
    <>
      <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
      <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:580,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{padding:'14px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div>
            <div style={{fontSize:15,fontWeight:700,color:'#111',display:'flex',alignItems:'center',gap:8}}>
              {client.civilite} {client.prenom} {client.nom}
              <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:8,
                background:client.statut==='actif'?'#f0fdf4':client.statut==='prospect'?'#fffbeb':'#f9fafb',
                color:client.statut==='actif'?G:client.statut==='prospect'?AM:'#888'}}>
                {client.statut==='actif'?'Actif':client.statut==='prospect'?'Prospect':'Inactif'}
              </span>
            </div>
            {client.raisonSociale&&<div style={{fontSize:12,color:'#888',marginTop:2}}>{client.raisonSociale}</div>}
          </div>
          <div style={{display:'flex',gap:8}}>
            <a href="/devis/nouveau" style={{padding:'7px 14px',background:G,color:'#fff',borderRadius:7,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>+ Devis</a>
            <button onClick={onClose} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>
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
          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Coordonnées</div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              {[
                {label:'Email',val:<a href={`mailto:${client.email}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.email}</a>},
                {label:'Téléphone',val:<a href={`tel:${(client.tel||'').replace(/\s/g,'')}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.tel}</a>},
                client.adresseFactLine1?{label:'Adresse fact.',val:`${client.adresseFactLine1||''} ${client.adresseFactCp||''} ${client.adresseFactVille||''}`}:null,
                client.adresseChantierLine1?{label:'Chantier',val:(
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span>{client.adresseChantierLine1} {client.adresseChantierCp} {client.adresseChantierVille}</span>
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(client.adresseChantierLine1+' '+client.adresseChantierCp+' '+client.adresseChantierVille)}`}
                      target="_blank" rel="noreferrer" style={{fontSize:11,color:'#2563eb',textDecoration:'none'}}>📍 Maps</a>
                  </div>
                )}:null,
                client.siret?{label:'SIRET',val:client.siret}:null,
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
          {client.notes&&(
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Notes internes</div>
              <div style={{fontSize:13,color:'#555',lineHeight:1.6}}>{client.notes}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

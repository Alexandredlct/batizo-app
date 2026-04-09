'use client'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const fmt=(n:number)=>n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0})+' €'

type TypeClient='particulier'|'professionnel'
type Client={
  id:string; type:TypeClient; civilite:string
  prenom:string; nom:string; email:string; tel:string
  // Professionnel
  raisonSociale?:string; formeJuridique?:string
  siret?:string; siren?:string; tvaIntra?:string; paysImmat?:string
  contactNom?:string; contactPoste?:string
  // Adresses
  adresseFactLine1?:string; adresseFactVille?:string; adresseFactCp?:string; adresseFactPays?:string
  adresseChantierLine1?:string; adresseChantierVille?:string; adresseChantierCp?:string
  // Autres
  source?:string; langue?:string; tags?:string; notes?:string
  // Stats fictives
  nbDevis:number; caTotal:number; margeAvg:number; derniereActivite:string
}

const FORMES=['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre']
const SOURCES=['Bouche à oreille','Google','Recommandation','Réseaux sociaux','Chantier voisin','Autre']
const LANGUES=['Français','Anglais','Espagnol','Arabe','Autre']

const initClients:Client[]=[
  {id:'c1',type:'professionnel',civilite:'M.',prenom:'Jean',nom:'Dupont',email:'j.dupont@immobilier.fr',tel:'06 12 34 56 78',raisonSociale:'Dupont Immobilier SAS',formeJuridique:'SAS',siret:'85357201400012',siren:'853572014',tvaIntra:'FR12853572014',paysImmat:'France',contactNom:'Jean Dupont',contactPoste:'Directeur',adresseFactLine1:'45 avenue des Champs',adresseFactVille:'Paris',adresseFactCp:'75008',adresseFactPays:'France',adresseChantierLine1:'12 rue de la Paix',adresseChantierVille:'Paris',adresseChantierCp:'75001',source:'Recommandation',langue:'Français',tags:'VIP, gros chantier',notes:'',nbDevis:8,caTotal:124500,margeAvg:62,derniereActivite:'05/04/2026'},
  {id:'c2',type:'particulier',civilite:'Mme',prenom:'Sophie',nom:'Martin',email:'s.martin@gmail.com',tel:'07 23 45 67 89',adresseFactLine1:'8 rue des Lilas',adresseFactVille:'Courbevoie',adresseFactCp:'92400',adresseFactPays:'France',adresseChantierLine1:'8 rue des Lilas',adresseChantierVille:'Courbevoie',adresseChantierCp:'92400',source:'Google',langue:'Français',tags:'',notes:'Rénovation complète appartement 80m²',nbDevis:3,caTotal:28400,margeAvg:58,derniereActivite:'08/04/2026'},
  {id:'c3',type:'professionnel',civilite:'M.',prenom:'Karim',nom:'Mansouri',email:'k.mansouri@promoteur.fr',tel:'06 34 56 78 90',raisonSociale:'Mansouri Promotion SARL',formeJuridique:'SARL',siret:'72345678900034',siren:'723456789',tvaIntra:'FR34723456789',paysImmat:'France',contactNom:'Karim Mansouri',contactPoste:'Gérant',adresseFactLine1:'22 boulevard Haussmann',adresseFactVille:'Paris',adresseFactCp:'75009',adresseFactPays:'France',adresseChantierLine1:'5 rue Voltaire',adresseChantierVille:'Levallois-Perret',adresseChantierCp:'92300',source:'Bouche à oreille',langue:'Français',tags:'Promoteur, récurrent',notes:'',nbDevis:12,caTotal:287000,margeAvg:65,derniereActivite:'02/04/2026'},
  {id:'c4',type:'particulier',civilite:'M.',prenom:'Pierre',nom:'Leblanc',email:'p.leblanc@outlook.fr',tel:'06 45 67 89 01',adresseFactLine1:'3 allée des Roses',adresseFactVille:'Neuilly-sur-Seine',adresseFactCp:'92200',adresseFactPays:'France',adresseChantierLine1:'3 allée des Roses',adresseChantierVille:'Neuilly-sur-Seine',adresseChantierCp:'92200',source:'Chantier voisin',langue:'Français',tags:'',notes:'',nbDevis:1,caTotal:8900,margeAvg:54,derniereActivite:'01/03/2026'},
  {id:'c5',type:'professionnel',civilite:'Mme',prenom:'Alice',nom:'Bernard',email:'a.bernard@sci-famille.fr',tel:'06 56 78 90 12',raisonSociale:'SCI Famille Bernard',formeJuridique:'SCI',siret:'65432198700089',siren:'654321987',tvaIntra:'',paysImmat:'France',contactNom:'Alice Bernard',contactPoste:'Gérante',adresseFactLine1:'17 rue de la République',adresseFactVille:'Levallois-Perret',adresseFactCp:'92300',adresseFactPays:'France',adresseChantierLine1:'Résidence Les Pins, Bât A',adresseChantierVille:'Clichy',adresseChantierCp:'92110',source:'Recommandation',langue:'Français',tags:'SCI, immeuble',notes:'Gère plusieurs lots',nbDevis:5,caTotal:67200,margeAvg:60,derniereActivite:'28/03/2026'},
]

const emptyClient=():Omit<Client,'id'|'nbDevis'|'caTotal'|'margeAvg'|'derniereActivite'>=>({
  type:'particulier',civilite:'M.',prenom:'',nom:'',email:'',tel:'',
  adresseFactLine1:'',adresseFactVille:'',adresseFactCp:'',adresseFactPays:'France',
  adresseChantierLine1:'',adresseChantierVille:'',adresseChantierCp:'',
  source:'',langue:'Français',tags:'',notes:''
})

const historiqueDevis=[
  {clientId:'c1',num:'DEV-2024-089',titre:'Rénovation bureau 3ème étage',date:'05/04/2026',statut:'Signé',montant:42000,marge:64},
  {clientId:'c1',num:'DEV-2024-076',titre:'Installation électrique complète',date:'12/02/2026',statut:'Signé',montant:28500,marge:61},
  {clientId:'c1',num:'DEV-2024-061',titre:'Pose parquet direction',date:'08/01/2026',statut:'Signé',montant:18000,marge:60},
  {clientId:'c2',num:'DEV-2024-091',titre:'Rénovation salle de bain',date:'08/04/2026',statut:'En attente',montant:12400,marge:58},
  {clientId:'c2',num:'DEV-2024-083',titre:'Peinture salon/séjour',date:'15/03/2026',statut:'Signé',montant:8200,marge:57},
  {clientId:'c3',num:'DEV-2024-085',titre:'Rénovation immeuble 12 lots',date:'02/04/2026',statut:'En cours',montant:95000,marge:66},
  {clientId:'c3',num:'DEV-2024-072',titre:'Aménagement parties communes',date:'20/02/2026',statut:'Signé',montant:34000,marge:63},
]

const statutColors:Record<string,{bg:string,color:string}>={
  'Signé':{bg:'#f0fdf4',color:G},
  'En attente':{bg:'#fffbeb',color:AM},
  'En cours':{bg:'#eff6ff',color:'#2563eb'},
  'Refusé':{bg:'#fef2f2',color:RD},
  'Brouillon':{bg:'#f9fafb',color:'#888'},
}

export default function ClientsPage(){
  const[clients,setClients]=useState<Client[]>(initClients)
  const[filtre,setFiltre]=useState<'tous'|'particulier'|'professionnel'>('tous')
  const[search,setSearch]=useState('')
  const[panel,setPanel]=useState<'add'|'edit'|'view'|null>(null)
  const[selectedId,setSelectedId]=useState<string|null>(null)
  const[form,setForm]=useState<any>({})
  const[adresseSame,setAdresseSame]=useState(true)
  const[noteText,setNoteText]=useState('')
  const[notes,setNotes]=useState<Record<string,{text:string,date:string}[]>>({})
  const[toast,setToast]=useState('')
  const[deleteConfirm,setDeleteConfirm]=useState<string|null>(null)
  const[importErrors,setImportErrors]=useState<string[]>([])
  const[showImport,setShowImport]=useState(false)
  const[importPreview,setImportPreview]=useState<any[]>([])

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}
  const genId=()=>'c'+Math.random().toString(36).slice(2,8)

  const filtered=clients.filter(c=>{
    const q=search.toLowerCase()
    const matchSearch=!search||c.nom.toLowerCase().includes(q)||c.prenom.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||c.tel.includes(q)||(c.raisonSociale||'').toLowerCase().includes(q)||(c.adresseFactVille||'').toLowerCase().includes(q)||(c.tags||'').toLowerCase().includes(q)
    const matchFiltre=filtre==='tous'||c.type===filtre
    return matchSearch&&matchFiltre
  })

  const openAdd=()=>{
    setForm(emptyClient())
    setAdresseSame(true)
    setSelectedId(null)
    setPanel('add')
  }
  const openEdit=(client:Client)=>{
    setForm({...client})
    setAdresseSame(client.adresseChantierLine1===client.adresseFactLine1)
    setSelectedId(client.id)
    setPanel('edit')
  }
  const openView=(client:Client)=>{
    setSelectedId(client.id)
    setPanel('view')
  }
  const closePanel=()=>{setPanel(null);setSelectedId(null);setForm({})}

  const save=()=>{
    if(!form.nom?.trim()||!form.prenom?.trim()){showToast('Nom et prénom obligatoires');return}
    if(adresseSame){
      form.adresseChantierLine1=form.adresseFactLine1
      form.adresseChantierVille=form.adresseFactVille
      form.adresseChantierCp=form.adresseFactCp
    }
    if(panel==='edit'&&selectedId){
      setClients(p=>p.map(c=>c.id===selectedId?{...form,id:selectedId}:c))
      showToast('Client modifié')
    } else {
      setClients(p=>[...p,{...form,id:genId(),nbDevis:0,caTotal:0,margeAvg:0,derniereActivite:new Date().toLocaleDateString('fr-FR')}])
      showToast('Client ajouté')
    }
    closePanel()
  }

  const supprimer=(id:string)=>{
    setClients(p=>p.filter(c=>c.id!==id))
    setDeleteConfirm(null)
    if(panel==='view'&&selectedId===id) closePanel()
    showToast('Client supprimé')
  }

  const ajouterNote=(clientId:string)=>{
    if(!noteText.trim())return
    setNotes(p=>({...p,[clientId]:[...(p[clientId]||[]),{text:noteText,date:new Date().toLocaleString('fr-FR')}]}))
    setNoteText('')
  }

  const exportCSV=()=>{
    const headers=['Type','Civilite','Prenom','Nom','Email','Tel','Raison Sociale','Forme Juridique','Siret','TVA Intra','Ville Fact','CP Fact','Ville Chantier','Tags','Source']
    const rows=filtered.map(c=>[c.type,c.civilite,c.prenom,c.nom,c.email,c.tel,c.raisonSociale||'',c.formeJuridique||'',c.siret||'',c.tvaIntra||'',c.adresseFactVille||'',c.adresseFactCp||'',c.adresseChantierVille||'',c.tags||'',c.source||''])
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,"'")}"`).join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url;a.download=`batizo-clients-${new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')}.csv`;a.click()
    URL.revokeObjectURL(url)
    showToast(`${filtered.length} clients exportés`)
  }

  const parseImport=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file)return
    const reader=new FileReader()
    reader.onload=ev=>{
      const text=ev.target?.result as string
      const lines=text.split('\n').filter(l=>l.trim())
      const items:any[]=[]; const errors:string[]=[]
      for(let i=1;i<lines.length;i++){
        const vals=lines[i].split(',').map(v=>v.replace(/"/g,'').trim())
        if(!vals[2]||!vals[3]){errors.push(`Ligne ${i+1}: nom/prénom manquant`);continue}
        items.push({id:genId(),type:vals[0]||'particulier',civilite:vals[1]||'M.',prenom:vals[2],nom:vals[3],email:vals[4]||'',tel:vals[5]||'',raisonSociale:vals[6]||'',formeJuridique:vals[7]||'',siret:vals[8]||'',tvaIntra:vals[9]||'',adresseFactVille:vals[10]||'',adresseFactCp:vals[11]||'',adresseChantierVille:vals[12]||'',tags:vals[13]||'',source:vals[14]||'',nbDevis:0,caTotal:0,margeAvg:0,derniereActivite:new Date().toLocaleDateString('fr-FR')})
      }
      setImportPreview(items); setImportErrors(errors)
    }
    reader.readAsText(file,'UTF-8'); e.target.value=''
  }

  const confirmerImport=()=>{
    setClients(p=>[...p,...importPreview])
    setShowImport(false); setImportPreview([]); setImportErrors([])
    showToast(`${importPreview.length} clients importés`)
  }

  const selectedClient=clients.find(c=>c.id===selectedId)
  const clientDevis=historiqueDevis.filter(d=>d.clientId===selectedId)
  const clientNotes=notes[selectedId||'']||[]

  // Champ form helper
  const F=({label,field,placeholder,required=false,type='text'}:{label:string,field:string,placeholder?:string,required?:boolean,type?:string})=>(
    <div>
      <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>{label}{required&&<span style={{color:RD}}> *</span>}</label>
      <input type={type} value={form[field]||''} onChange={e=>setForm((p:any)=>({...p,[field]:e.target.value}))}
        placeholder={placeholder}
        style={{width:'100%',padding:'8px 11px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
    </div>
  )

  const S=({label,field,options}:{label:string,field:string,options:string[]})=>(
    <div>
      <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>{label}</label>
      <select value={form[field]||''} onChange={e=>setForm((p:any)=>({...p,[field]:e.target.value}))}
        style={{width:'100%',padding:'8px 11px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',background:'#fff'}}>
        <option value="">Choisir...</option>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
    </div>
  )

  const Section=({title}:{title:string})=>(
    <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.05em',margin:'16px 0 10px',paddingBottom:6,borderBottom:`1px solid ${BD}`}}>{title}</div>
  )

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>
      <Sidebar activePage="clients"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Clients</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Exporter
            </button>
            <label style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Importer
              <input type="file" accept=".csv" onChange={parseImport} style={{display:'none'}}/>
            </label>
            <button onClick={openAdd} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              + Nouveau client
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[
              {label:'Total clients',val:clients.length,color:'#111'},
              {label:'Professionnels',val:clients.filter(c=>c.type==='professionnel').length,color:'#2563eb'},
              {label:'Particuliers',val:clients.filter(c=>c.type==='particulier').length,color:AM},
              {label:'CA total',val:clients.reduce((s,c)=>s+c.caTotal,0).toLocaleString('fr-FR')+' €',color:G},
            ].map(s=>(
              <div key={s.label} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Filtres + Recherche */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' as const}}>
            {(['tous','particulier','professionnel'] as const).map(f=>(
              <button key={f} onClick={()=>setFiltre(f)}
                style={{padding:'7px 16px',borderRadius:20,border:`1px solid ${filtre===f?G:BD}`,background:filtre===f?'#f0fdf4':'#fff',color:filtre===f?G:'#555',fontSize:13,fontWeight:filtre===f?600:400,cursor:'pointer'}}>
                {f==='tous'?`Tous (${clients.length})`:f==='particulier'?`Particuliers (${clients.filter(c=>c.type==='particulier').length})`:`Professionnels (${clients.filter(c=>c.type==='professionnel').length})`}
              </button>
            ))}
            <div style={{flex:1,position:'relative',minWidth:200}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom, email, ville, tags..."
                style={{width:'100%',padding:'8px 12px 8px 36px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
              {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18}}>×</button>}
            </div>
          </div>

          {/* Tableau */}
          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9fafb'}}>
                  {['Client','Type','Email','Téléphone','Ville','Devis','CA total','Dernière activité',''].map(h=>(
                    <th key={h} style={{padding:'11px 16px',textAlign:'left' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0?(
                  <tr><td colSpan={9} style={{padding:'3rem',textAlign:'center' as const,color:'#888',fontSize:13}}>Aucun client{search?' pour cette recherche':''}</td></tr>
                ):filtered.map(client=>(
                  <tr key={client.id} style={{borderBottom:`1px solid ${BD}`,cursor:'pointer',transition:'background 0.1s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}
                    onClick={()=>openView(client)}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        <div style={{width:34,height:34,borderRadius:'50%',background:client.type==='professionnel'?'#eff6ff':'#f0fdf4',color:client.type==='professionnel'?'#2563eb':G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>
                          {client.prenom[0]}{client.nom[0]}
                        </div>
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{client.civilite} {client.prenom} {client.nom}</div>
                          {client.raisonSociale&&<div style={{fontSize:11,color:'#888'}}>{client.raisonSociale}</div>}
                          {client.tags&&<div style={{display:'flex',gap:4,marginTop:2,flexWrap:'wrap' as const}}>
                            {client.tags.split(',').filter(t=>t.trim()).map((t,i)=>(
                              <span key={i} style={{fontSize:10,padding:'1px 5px',background:'#f0fdf4',color:G,borderRadius:8,fontWeight:600}}>{t.trim()}</span>
                            ))}
                          </div>}
                        </div>
                      </div>
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:12,
                        background:client.type==='professionnel'?'#eff6ff':'#f0fdf4',
                        color:client.type==='professionnel'?'#2563eb':G}}>
                        {client.type==='professionnel'?'Pro':'Particulier'}
                      </span>
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{client.email}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{client.tel}</td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'#555'}}>{client.adresseFactVille}</td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:'#111',textAlign:'center' as const}}>{client.nbDevis}</td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:G}}>{fmt(client.caTotal)}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#888'}}>{client.derniereActivite}</td>
                    <td style={{padding:'12px 16px'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>openEdit(client)} title="Modifier"
                          style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:4,color:'#aaa',borderRadius:4}}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=G}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>✏️</button>
                        <button onClick={()=>setDeleteConfirm(client.id)} title="Supprimer"
                          style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:4,color:'#aaa',borderRadius:4}}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{marginTop:10,fontSize:12,color:'#888'}}>{filtered.length} client{filtered.length>1?'s':''} affiché{filtered.length>1?'s':''}</div>
        </div>
      </div>

      {/* Panneau latéral Add/Edit */}
      {(panel==='add'||panel==='edit')&&(
        <>
          <div onClick={closePanel} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:540,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{panel==='edit'?'Modifier le client':'Nouveau client'}</div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={save} style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  {panel==='edit'?'Enregistrer':'Ajouter'}
                </button>
                <button onClick={closePanel} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
              </div>
            </div>
            <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:12}}>

              {/* Type */}
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:6}}>Type de client</label>
                <div style={{display:'flex',gap:8}}>
                  {(['particulier','professionnel'] as const).map(t=>(
                    <button key={t} onClick={()=>setForm((p:any)=>({...p,type:t}))}
                      style={{flex:1,padding:'9px',border:`2px solid ${form.type===t?G:BD}`,borderRadius:8,background:form.type===t?'#f0fdf4':'#fff',color:form.type===t?G:'#555',fontSize:13,fontWeight:form.type===t?600:400,cursor:'pointer',transition:'all 0.15s'}}>
                      {t==='particulier'?'👤 Particulier':'🏢 Professionnel'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Professionnel */}
              {form.type==='professionnel'&&(
                <>
                  <Section title="Informations entreprise"/>
                  <F label="Raison sociale" field="raisonSociale" placeholder="Ex: Dupont Immobilier SAS" required/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <S label="Forme juridique" field="formeJuridique" options={FORMES}/>
                    <F label="Pays d'immatriculation" field="paysImmat" placeholder="France"/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <F label="SIREN" field="siren" placeholder="123456789"/>
                    <F label="SIRET" field="siret" placeholder="12345678900012"/>
                  </div>
                  <F label="N° TVA intracommunautaire" field="tvaIntra" placeholder="FR12123456789"/>
                  <Section title="Contact principal"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <F label="Nom du contact" field="contactNom" placeholder="Jean Dupont"/>
                    <F label="Poste / Fonction" field="contactPoste" placeholder="Directeur"/>
                  </div>
                </>
              )}

              {/* Infos personnelles */}
              <Section title="Informations personnelles"/>
              <div style={{display:'grid',gridTemplateColumns:'auto 1fr 1fr',gap:10,alignItems:'end'}}>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>Civilité</label>
                  <select value={form.civilite||'M.'} onChange={e=>setForm((p:any)=>({...p,civilite:e.target.value}))}
                    style={{padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',background:'#fff'}}>
                    {['M.','Mme','Dr','Me','Autre'].map(o=><option key={o}>{o}</option>)}
                  </select>
                </div>
                <F label="Prénom" field="prenom" placeholder="Jean" required/>
                <F label="Nom" field="nom" placeholder="Dupont" required/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <F label="Email" field="email" placeholder="jean@exemple.fr" type="email"/>
                <F label="Téléphone" field="tel" placeholder="06 12 34 56 78" type="tel"/>
              </div>

              {/* Adresse facturation */}
              <Section title="Adresse de facturation"/>
              <F label="Adresse" field="adresseFactLine1" placeholder="12 rue de la Paix"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
                <F label="Code postal" field="adresseFactCp" placeholder="75001"/>
                <F label="Ville" field="adresseFactVille" placeholder="Paris"/>
                <F label="Pays" field="adresseFactPays" placeholder="France"/>
              </div>

              {/* Adresse chantier */}
              <Section title="Adresse chantier"/>
              <label style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#555',cursor:'pointer'}}>
                <input type="checkbox" checked={adresseSame} onChange={e=>setAdresseSame(e.target.checked)} style={{accentColor:G}}/>
                Identique à l'adresse de facturation
              </label>
              {!adresseSame&&(
                <>
                  <F label="Adresse chantier" field="adresseChantierLine1" placeholder="5 rue Voltaire"/>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <F label="Code postal" field="adresseChantierCp" placeholder="92300"/>
                    <F label="Ville chantier" field="adresseChantierVille" placeholder="Levallois-Perret"/>
                  </div>
                </>
              )}

              {/* Autres */}
              <Section title="Autres informations"/>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                <S label="Source d'acquisition" field="source" options={SOURCES}/>
                <S label="Langue préférée" field="langue" options={LANGUES}/>
              </div>
              <F label="Tags (séparés par virgules)" field="tags" placeholder="VIP, gros chantier, récurrent"/>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>Notes</label>
                <textarea value={form.notes||''} onChange={e=>setForm((p:any)=>({...p,notes:e.target.value}))}
                  rows={3} placeholder="Informations complémentaires..."
                  style={{width:'100%',padding:'8px 11px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',resize:'vertical' as const,fontFamily:'system-ui,sans-serif',color:'#111',boxSizing:'border-box' as const}}/>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Panneau vue fiche client */}
      {panel==='view'&&selectedClient&&(
        <>
          <div onClick={closePanel} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:580,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>

            {/* Header fiche */}
            <div style={{padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,borderRadius:'50%',background:selectedClient.type==='professionnel'?'#eff6ff':'#f0fdf4',color:selectedClient.type==='professionnel'?'#2563eb':G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:14,fontWeight:700}}>
                  {selectedClient.prenom[0]}{selectedClient.nom[0]}
                </div>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{selectedClient.civilite} {selectedClient.prenom} {selectedClient.nom}</div>
                  {selectedClient.raisonSociale&&<div style={{fontSize:12,color:'#888'}}>{selectedClient.raisonSociale}</div>}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>openEdit(selectedClient)} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Modifier</button>
                <button onClick={closePanel} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
              </div>
            </div>

            <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:16}}>

              {/* Stats client */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  {label:'Devis',val:selectedClient.nbDevis,color:'#111'},
                  {label:'CA total',val:fmt(selectedClient.caTotal),color:G},
                  {label:'Marge moy.',val:selectedClient.margeAvg+'%',color:selectedClient.margeAvg>=60?G:selectedClient.margeAvg>=40?AM:RD},
                ].map(s=>(
                  <div key={s.label} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'12px 14px',textAlign:'center' as const}}>
                    <div style={{fontSize:10,color:'#888',fontWeight:600,textTransform:'uppercase' as const,marginBottom:4}}>{s.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Infos */}
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:12,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Coordonnées</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {[
                    {label:'Email',val:selectedClient.email},
                    {label:'Téléphone',val:selectedClient.tel},
                    {label:'Adresse fact.',val:`${selectedClient.adresseFactLine1||''} ${selectedClient.adresseFactCp||''} ${selectedClient.adresseFactVille||''}`},
                    {label:'Chantier',val:`${selectedClient.adresseChantierLine1||''} ${selectedClient.adresseChantierCp||''} ${selectedClient.adresseChantierVille||''}`},
                    selectedClient.siret?{label:'SIRET',val:selectedClient.siret}:null,
                    selectedClient.tvaIntra?{label:'TVA intra',val:selectedClient.tvaIntra}:null,
                    selectedClient.source?{label:'Source',val:selectedClient.source}:null,
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
                <div style={{fontSize:12,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Historique devis</div>
                {clientDevis.length===0?(
                  <div style={{textAlign:'center' as const,padding:'1.5rem',color:'#888',fontSize:13,background:'#f9fafb',borderRadius:10,border:`1px solid ${BD}`}}>Aucun devis pour ce client</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:8}}>
                    {clientDevis.map((d,i)=>(
                      <div key={i} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'12px 14px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontSize:12,color:'#888',marginBottom:2}}>{d.num} · {d.date}</div>
                          <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.titre}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:10}}>
                          <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:12,...(statutColors[d.statut]||{bg:'#f9fafb',color:'#888'})}}>{d.statut}</span>
                          <div style={{textAlign:'right' as const}}>
                            <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(d.montant)}</div>
                            <div style={{fontSize:11,color:d.marge>=60?G:d.marge>=40?AM:RD}}>{d.marge}% marge</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notes internes */}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Notes internes</div>
                <div style={{display:'flex',gap:8,marginBottom:10}}>
                  <input value={noteText} onChange={e=>setNoteText(e.target.value)}
                    placeholder="Ajouter une note..."
                    onKeyDown={e=>e.key==='Enter'&&ajouterNote(selectedClient.id)}
                    style={{flex:1,padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111'}}
                    onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                    onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                  <button onClick={()=>ajouterNote(selectedClient.id)}
                    style={{padding:'8px 14px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                    Ajouter
                  </button>
                </div>
                {clientNotes.length===0&&!selectedClient.notes?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune note</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {selectedClient.notes&&(
                      <div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,padding:'10px 12px'}}>
                        <div style={{fontSize:11,color:'#888',marginBottom:3}}>Note initiale</div>
                        <div style={{fontSize:13,color:'#333'}}>{selectedClient.notes}</div>
                      </div>
                    )}
                    {[...clientNotes].reverse().map((n,i)=>(
                      <div key={i} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px'}}>
                        <div style={{fontSize:11,color:'#888',marginBottom:3}}>{n.date}</div>
                        <div style={{fontSize:13,color:'#333'}}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal import */}
      {showImport&&importPreview.length>0&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowImport(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:520,width:'90%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:14}}>{importPreview.length} clients à importer</div>
            {importErrors.length>0&&<div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px',marginBottom:12,fontSize:12,color:RD}}>{importErrors.length} erreur(s) détectée(s)</div>}
            <button onClick={confirmerImport} style={{width:'100%',padding:'12px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>
              Confirmer l'import
            </button>
          </div>
        </div>
      )}

      {/* Modal delete */}
      {deleteConfirm&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDeleteConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:380,width:'90%',textAlign:'center' as const}}>
            <div style={{width:48,height:48,borderRadius:'50%',background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>Supprimer ce client ?</div>
            <div style={{fontSize:13,color:'#555',marginBottom:20}}>Cette action est irréversible.</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:11,border:'1px solid #333',borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
              <button onClick={()=>supprimer(deleteConfirm)} style={{flex:1,padding:11,background:RD,color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span>
          <span style={{fontSize:13}}>{toast}</span>
        </div>
      )}
    </div>
  )
}

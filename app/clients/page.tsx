'use client'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const isNouveau=(dateStr:string)=>{
  const parts=dateStr.split('/')
  if(parts.length!==3)return false
  const date=new Date(parseInt(parts[2]),parseInt(parts[1])-1,parseInt(parts[0]))
  const diff=(Date.now()-date.getTime())/(1000*60*60*24)
  return diff<=30
}
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
  statut?:'actif'|'inactif'|'prospect'
  enCharge?:string
  // Stats fictives
  nbDevis:number; caTotal:number; margeAvg:number; derniereActivite:string
}

const MEMBRES_EQUIPE=['Alexandre Delcourt','Emma Strano','Ysaline Bernard','Xavier Concy','Thomas Giraud']

const FORMES=['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre']
const SOURCES=['Bouche à oreille','Google','Recommandation','Réseaux sociaux','Chantier voisin','Autre']
const LANGUES=['Français','Anglais','Espagnol','Arabe','Autre']

const initClients:Client[]=[
  {id:'c1',type:'professionnel',civilite:'M.',prenom:'Jean',nom:'Dupont',email:'j.dupont@immobilier.fr',tel:'06 12 34 56 78',raisonSociale:'Dupont Immobilier SAS',formeJuridique:'SAS',siret:'85357201400012',siren:'853572014',tvaIntra:'FR12853572014',paysImmat:'France',contactNom:'Jean Dupont',contactPoste:'Directeur',adresseFactLine1:'45 avenue des Champs',adresseFactVille:'Paris',adresseFactCp:'75008',adresseFactPays:'France',adresseChantierLine1:'12 rue de la Paix',adresseChantierVille:'Paris',adresseChantierCp:'75001',source:'Recommandation',langue:'Français',tags:'VIP, gros chantier',notes:'',statut:'actif',enCharge:'Alexandre Delcourt',nbDevis:8,caTotal:124500,margeAvg:62,derniereActivite:'05/04/2026'},
  {id:'c2',type:'particulier',civilite:'Mme',prenom:'Sophie',nom:'Martin',email:'s.martin@gmail.com',tel:'07 23 45 67 89',adresseFactLine1:'8 rue des Lilas',adresseFactVille:'Courbevoie',adresseFactCp:'92400',adresseFactPays:'France',adresseChantierLine1:'8 rue des Lilas',adresseChantierVille:'Courbevoie',adresseChantierCp:'92400',source:'Google',langue:'Français',tags:'',notes:'Rénovation complète appartement 80m²',statut:'actif',enCharge:'Emma Strano',nbDevis:3,caTotal:28400,margeAvg:58,derniereActivite:'08/04/2026'},
  {id:'c3',type:'professionnel',civilite:'M.',prenom:'Karim',nom:'Mansouri',email:'k.mansouri@promoteur.fr',tel:'06 34 56 78 90',raisonSociale:'Mansouri Promotion SARL',formeJuridique:'SARL',siret:'72345678900034',siren:'723456789',tvaIntra:'FR34723456789',paysImmat:'France',contactNom:'Karim Mansouri',contactPoste:'Gérant',adresseFactLine1:'22 boulevard Haussmann',adresseFactVille:'Paris',adresseFactCp:'75009',adresseFactPays:'France',adresseChantierLine1:'5 rue Voltaire',adresseChantierVille:'Levallois-Perret',adresseChantierCp:'92300',source:'Bouche à oreille',langue:'Français',tags:'Promoteur, récurrent',notes:'',statut:'actif',enCharge:'Alexandre Delcourt',nbDevis:12,caTotal:287000,margeAvg:65,derniereActivite:'02/04/2026'},
  {id:'c4',type:'particulier',civilite:'M.',prenom:'Pierre',nom:'Leblanc',email:'p.leblanc@outlook.fr',tel:'06 45 67 89 01',adresseFactLine1:'3 allée des Roses',adresseFactVille:'Neuilly-sur-Seine',adresseFactCp:'92200',adresseFactPays:'France',adresseChantierLine1:'3 allée des Roses',adresseChantierVille:'Neuilly-sur-Seine',adresseChantierCp:'92200',source:'Chantier voisin',langue:'Français',tags:'',notes:'',statut:'prospect',enCharge:'Emma Strano',nbDevis:1,caTotal:8900,margeAvg:54,derniereActivite:'01/03/2026'},
  {id:'c5',type:'professionnel',civilite:'Mme',prenom:'Alice',nom:'Bernard',email:'a.bernard@sci-famille.fr',tel:'06 56 78 90 12',raisonSociale:'SCI Famille Bernard',formeJuridique:'SCI',siret:'65432198700089',siren:'654321987',tvaIntra:'',paysImmat:'France',contactNom:'Alice Bernard',contactPoste:'Gérante',adresseFactLine1:'17 rue de la République',adresseFactVille:'Levallois-Perret',adresseFactCp:'92300',adresseFactPays:'France',adresseChantierLine1:'Résidence Les Pins, Bât A',adresseChantierVille:'Clichy',adresseChantierCp:'92110',source:'Recommandation',langue:'Français',tags:'SCI, immeuble',notes:'Gère plusieurs lots',statut:'actif',enCharge:'Ysaline Bernard',nbDevis:5,caTotal:67200,margeAvg:60,derniereActivite:'28/03/2026'},
]

const emptyClient=():Omit<Client,'id'|'nbDevis'|'caTotal'|'margeAvg'|'derniereActivite'>=>({
  type:'particulier',civilite:'M.',prenom:'',nom:'',email:'',tel:'',
  adresseFactLine1:'',adresseFactVille:'',adresseFactCp:'',adresseFactPays:'France',
  adresseChantierLine1:'',adresseChantierVille:'',adresseChantierCp:'',
  source:'',langue:'Français',tags:'',notes:'',statut:'prospect',enCharge:''
})

const historiqueCommunications:Record<string,{date:string,type:string,sujet:string,statut:string}[]>={
  'c1':[
    {date:'05/04/2026 09:15',type:'devis',sujet:'DEV-2024-089 - Rénovation bureau 3ème étage',statut:'Envoyé'},
    {date:'12/02/2026 14:30',type:'facture',sujet:'FAC-2024-076 - Installation électrique',statut:'Payée'},
    {date:'10/02/2026 11:00',type:'devis',sujet:'DEV-2024-076 - Installation électrique',statut:'Envoyé'},
    {date:'08/01/2026 10:20',type:'relance',sujet:'Relance devis DEV-2024-061',statut:'Envoyé'},
  ],
  'c2':[
    {date:'08/04/2026 16:45',type:'devis',sujet:'DEV-2024-091 - Rénovation salle de bain',statut:'Envoyé'},
    {date:'15/03/2026 09:00',type:'facture',sujet:'FAC-2024-083 - Peinture salon',statut:'Payée'},
  ],
  'c3':[
    {date:'02/04/2026 08:30',type:'devis',sujet:'DEV-2024-085 - Rénovation immeuble',statut:'Envoyé'},
    {date:'20/02/2026 15:00',type:'facture',sujet:'FAC-2024-072 - Parties communes',statut:'Payée'},
    {date:'18/02/2026 10:00',type:'relance',sujet:'Relance paiement FAC-2024-065',statut:'Envoyé'},
  ],
}

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
  const[enChargeMenu,setEnChargeMenu]=useState<string|null>(null)
  const[deletedClient,setDeletedClient]=useState<Client|null>(null)
  const[showUndoToast,setShowUndoToast]=useState(false)
  const[undoTimer,setUndoTimer]=useState<any>(null)
  const[importErrors,setImportErrors]=useState<string[]>([])
  const[showImport,setShowImport]=useState(false)
  const[tri,setTri]=useState<'nom'|'caTotal'|'nbDevis'|'derniereActivite'>('nom')
  const[triDir,setTriDir]=useState<'asc'|'desc'>('asc')
  const toggleTri=(t:typeof tri)=>{if(tri===t)setTriDir(d=>d==='asc'?'desc':'asc');else{setTri(t);setTriDir('asc')}}
  const[importPreview,setImportPreview]=useState<any[]>([])

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}
  const genId=()=>'c'+Math.random().toString(36).slice(2,8)

  const sorted=(items:Client[])=>[...items].sort((a,b)=>{
    if(tri==='nom') return triDir==='asc'?a.nom.localeCompare(b.nom):b.nom.localeCompare(a.nom)
    if(tri==='caTotal') return triDir==='asc'?a.caTotal-b.caTotal:b.caTotal-a.caTotal
    if(tri==='nbDevis') return triDir==='asc'?a.nbDevis-b.nbDevis:b.nbDevis-a.nbDevis
    if(tri==='derniereActivite'){
      const toDate=(s:string)=>{const p=s.split('/');return new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0])).getTime()}
      return triDir==='asc'?toDate(a.derniereActivite)-toDate(b.derniereActivite):toDate(b.derniereActivite)-toDate(a.derniereActivite)
    }
    return 0
  })

  const[filtreStatut,setFiltreStatut]=useState<'tous'|'actif'|'inactif'|'prospect'>('tous')

  const filtered=clients.filter(c=>{
    const q=search.toLowerCase()
    const matchSearch=!search||c.nom.toLowerCase().includes(q)||c.prenom.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||c.tel.includes(q)||(c.raisonSociale||'').toLowerCase().includes(q)||(c.adresseFactVille||'').toLowerCase().includes(q)||(c.tags||'').toLowerCase().includes(q)
    const matchFiltre=filtre==='tous'||c.type===filtre
    const matchStatut=filtreStatut==='tous'||c.statut===filtreStatut
    return matchSearch&&matchFiltre&&matchStatut
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
    const client=clients.find(c=>c.id===id)
    if(!client)return
    setClients(p=>p.filter(c=>c.id!==id))
    setDeleteConfirm(null)
    if(panel==='view'&&selectedId===id) closePanel()
    setDeletedClient(client)
    setShowUndoToast(true)
    if(undoTimer)clearTimeout(undoTimer)
    const t=setTimeout(()=>{setShowUndoToast(false);setDeletedClient(null)},5000)
    setUndoTimer(t)
  }
  const annulerSuppression=()=>{
    if(!deletedClient)return
    setClients(p=>[...p,deletedClient])
    setShowUndoToast(false)
    setDeletedClient(null)
    clearTimeout(undoTimer)
    showToast('Client restauré')
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
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setEnChargeMenu(null)}>
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
            {(()=>{
              const caAnnee=clients.reduce((s,c)=>s+c.caTotal,0)
              const caAnneePrecedente=Math.round(caAnnee*0.82)
              const variation=Math.round((caAnnee-caAnneePrecedente)/caAnneePrecedente*100)
              return [
                {label:'Total clients',val:clients.length,color:'#111',sub:null},
                {label:'Professionnels',val:clients.filter(c=>c.type==='professionnel').length,color:'#2563eb',sub:null},
                {label:'Particuliers',val:clients.filter(c=>c.type==='particulier').length,color:AM,sub:null},
                {label:'CA cette année HT',val:caAnnee.toLocaleString('fr-FR')+' €',color:G,sub:{variation,precedent:caAnneePrecedente}},
              ]
            })().map(s=>(
              <div key={s.label} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:s.color}}>{s.val}</div>
                {s.sub&&(
                  <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}>
                    <span style={{fontSize:11,fontWeight:700,color:s.sub.variation>=0?G:RD}}>
                      {s.sub.variation>=0?'+':''}{s.sub.variation}% vs 2025
                    </span>
                    <span style={{fontSize:11,color:'#888'}}>{s.sub.precedent.toLocaleString('fr-FR')} € en 2025</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Filtres + Recherche */}
          <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap' as const}}>
            <div style={{display:'flex',gap:6}}>
            {([['tous','Tous'],['actif','Actif'],['prospect','Prospect'],['inactif','Inactif']] as const).map(([f,label])=>(
              <button key={f} onClick={()=>setFiltreStatut(f)}
                style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${filtreStatut===f?(f==='actif'?G:f==='prospect'?AM:f==='inactif'?'#888':G):BD}`,background:filtreStatut===f?(f==='actif'?'#f0fdf4':f==='prospect'?'#fffbeb':f==='inactif'?'#f9fafb':'#f0fdf4'):'#fff',color:filtreStatut===f?(f==='actif'?G:f==='prospect'?AM:f==='inactif'?'#888':G):'#555',fontSize:12,fontWeight:filtreStatut===f?600:400,cursor:'pointer'}}>
                {label}
              </button>
            ))}
          </div>
          
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
                  {[
                    {label:'Client',key:'nom'},
                    {label:'Type',key:''},
                    {label:'Statut',key:''},
                    {label:'Statut',key:''},
                    {label:'Email',key:''},
                    {label:'Téléphone',key:''},
                    {label:'Ville',key:''},
                    {label:'Devis',key:'nbDevis'},
                    {label:'CA total HT',key:'caTotal'},
                    {label:'Dernière activité',key:'derniereActivite'},
                    {label:'En charge',key:''},
                    {label:'Communications',key:''},
                    {label:'',key:''},
                  ].map(({label,key})=>(
                    <th key={label} onClick={()=>key&&toggleTri(key as typeof tri)}
                      style={{padding:'11px 16px',textAlign:'left' as const,fontSize:12,color:tri===key&&key?G:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`,cursor:key?'pointer':'default',userSelect:'none' as const,whiteSpace:'nowrap' as const}}>
                      {label}{tri===key&&key?(triDir==='asc'?' ↑':' ↓'):''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0?(
                  <tr><td colSpan={9} style={{padding:'3rem',textAlign:'center' as const,color:'#888',fontSize:13}}>Aucun client{search?' pour cette recherche':''}</td></tr>
                ):sorted(filtered).map(client=>(
                  <tr key={client.id} style={{borderBottom:`1px solid ${BD}`,cursor:'pointer',transition:'background 0.1s'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}
                    onClick={()=>openView(client)}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:10}}>
                        
                        <div>
                          <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{client.civilite} {client.prenom} {client.nom}</div>
                          {client.raisonSociale&&<div style={{fontSize:11,color:'#888'}}>{client.raisonSociale}</div>}
                          {isNouveau(client.derniereActivite)&&(
                            <span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:8,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>
                          )}
                          {client.tags&&<div style={{display:'flex',gap:4,marginTop:2,flexWrap:'wrap' as const}}>
                            {client.tags.split(',').filter(t=>t.trim()).map((t,i)=>(
                              <span key={i} style={{fontSize:10,padding:'1px 5px',background:'#f3f4f6',color:'#555',borderRadius:8,fontWeight:600}}>{t.trim()}</span>
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
                    <td style={{padding:'12px 16px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'3px 9px',borderRadius:12,
                        background:client.statut==='actif'?'#f0fdf4':client.statut==='prospect'?'#fffbeb':'#f9fafb',
                        color:client.statut==='actif'?G:client.statut==='prospect'?AM:'#888'}}>
                        {client.statut==='actif'?'Actif':client.statut==='prospect'?'Prospect':'Inactif'}
                      </span>
                    </td>
                    
                    <td style={{padding:'12px 16px',fontSize:13,color:'#333'}}>{client.email}</td>
                    <td style={{padding:'12px 16px'}}>
                      {client.tel?(
                        <a href={`tel:${client.tel.replace(/\s/g,'')}`}
                          style={{fontSize:13,color:'#2563eb',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}
                          onClick={e=>e.stopPropagation()}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .94h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 8.5a16 16 0 006.39 6.39l1.02-1.14a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                          {client.tel}
                        </a>
                      ):<span style={{fontSize:13,color:'#888'}}>—</span>}
                    </td>
                    <td style={{padding:'12px 16px',fontSize:13,color:'#555'}}>{client.adresseFactVille}</td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:'#111',textAlign:'center' as const}}>{client.nbDevis}</td>
                    <td style={{padding:'12px 16px',fontSize:13,fontWeight:600,color:'#111'}}>{fmt(client.caTotal)}</td>
                    <td style={{padding:'12px 16px',fontSize:12,color:'#888'}}>{client.derniereActivite}</td>
                    <td style={{padding:'12px 16px',overflow:'visible'}} onClick={e=>e.stopPropagation()}>
                      <div style={{position:'relative'}}>
                        <div onClick={()=>setEnChargeMenu(enChargeMenu===client.id?null:client.id)}
                          style={{display:'inline-flex',alignItems:'center',gap:6,cursor:'pointer',padding:'4px 8px',borderRadius:8,transition:'background 0.15s'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f3f4f6'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                          <div style={{width:26,height:26,borderRadius:'50%',background:'#f0f4ff',color:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0}}>
                            {client.enCharge?client.enCharge.split(' ').map((n:string)=>n[0]).join('').slice(0,2):'?'}
                          </div>
                          <span style={{fontSize:12,color:'#333'}}>{client.enCharge?client.enCharge.split(' ')[0]:'Assigner'}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        {enChargeMenu===client.id&&(
                          <div style={{position:'absolute',top:'110%',left:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.12)',zIndex:200,minWidth:180,overflow:'hidden'}}>
                            <div style={{padding:'8px 12px',fontSize:11,color:'#888',fontWeight:600,borderBottom:'1px solid #f3f4f6'}}>ASSIGNER À</div>
                            {['',  ...MEMBRES_EQUIPE].map(m=>(
                              <div key={m||'none'} onClick={()=>{setClients(p=>p.map(cl=>cl.id===client.id?{...cl,enCharge:m}:cl));setEnChargeMenu(null)}}
                                style={{padding:'9px 14px',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:8,color:client.enCharge===m?G:'#333',background:client.enCharge===m?'#f0fdf4':'',fontWeight:client.enCharge===m?600:400,transition:'background 0.1s'}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=client.enCharge===m?'#f0fdf4':''}>
                                {m?(
                                  <>
                                    <div style={{width:22,height:22,borderRadius:'50%',background:'#f0f4ff',color:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700}}>
                                      {m.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                                    </div>
                                    {m}
                                  </>
                                ):<><span style={{color:'#aaa'}}>— </span>Non assigné</>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{padding:'12px 16px'}}>
                      {(historiqueCommunications[client.id]||[]).length>0?(
                        <span style={{fontSize:11,color:'#2563eb',fontWeight:600}}>
                          {(historiqueCommunications[client.id]||[]).length} email{(historiqueCommunications[client.id]||[]).length>1?'s':''}
                        </span>
                      ):<span style={{fontSize:11,color:'#888'}}>—</span>}
                    </td>
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
                  <div style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:6}}>Statut</label>
                <div style={{display:'flex',gap:8}}>
                  {([['actif','✅ Actif',G],['prospect','🔍 Prospect',AM],['inactif','⏸ Inactif','#888']] as const).map(([s,label,col])=>(
                    <button key={s} onClick={()=>setForm((p:any)=>({...p,statut:s}))}
                      style={{flex:1,padding:'8px',border:`2px solid ${form.statut===s?col:BD}`,borderRadius:8,background:form.statut===s?col+'18':'#fff',color:form.statut===s?col:'#555',fontSize:12,fontWeight:form.statut===s?600:400,cursor:'pointer'}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              
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
                <div>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>En charge</label>
                <select value={form.enCharge||''} onChange={e=>setForm((p:any)=>({...p,enCharge:e.target.value}))}
                  style={{width:'100%',padding:'8px 11px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',background:'#fff'}}>
                  <option value="">Non assigné</option>
                  {MEMBRES_EQUIPE.map(m=><option key={m}>{m}</option>)}
                </select>
              </div>
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
                
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:'#111'}}>{selectedClient.civilite} {selectedClient.prenom} {selectedClient.nom}</div>
                  {selectedClient.raisonSociale&&<div style={{fontSize:12,color:'#888'}}>{selectedClient.raisonSociale}</div>}
                <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,
                  background:selectedClient.statut==='actif'?'#f0fdf4':selectedClient.statut==='prospect'?'#fffbeb':'#f9fafb',
                  color:selectedClient.statut==='actif'?G:selectedClient.statut==='prospect'?AM:'#888'}}>
                  {selectedClient.statut==='actif'?'Actif':selectedClient.statut==='prospect'?'Prospect':'Inactif'}
                </span>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:8,
                  background:selectedClient.statut==='actif'?'#f0fdf4':selectedClient.statut==='prospect'?'#fffbeb':'#f9fafb',
                  color:selectedClient.statut==='actif'?G:selectedClient.statut==='prospect'?AM:'#888'}}>
                  {selectedClient.statut==='actif'?'Actif':selectedClient.statut==='prospect'?'Prospect':'Inactif'}
                </span>
                {isNouveau(selectedClient.derniereActivite)&&(
                  <span style={{fontSize:10,fontWeight:700,padding:'2px 8px',borderRadius:8,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>
                )}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <a href="/devis/nouveau" style={{padding:'7px 14px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,cursor:'pointer',fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:5}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Créer un devis
                </a>
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
                    {label:'Téléphone',val:selectedClient.tel?(
                      <a href={`tel:${selectedClient.tel.replace(/\s/g,'')}`}
                        style={{color:'#2563eb',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .94h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.11 8.5a16 16 0 006.39 6.39l1.02-1.14a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
                        {selectedClient.tel}
                      </a>
                    ):null},
                    {label:'Adresse fact.',val:`${selectedClient.adresseFactLine1||''} ${selectedClient.adresseFactCp||''} ${selectedClient.adresseFactVille||''}`},
                    {label:'Chantier',val:(
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span>{selectedClient.adresseChantierLine1||''} {selectedClient.adresseChantierCp||''} {selectedClient.adresseChantierVille||''}</span>
                        {selectedClient.adresseChantierVille&&(
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((selectedClient.adresseChantierLine1||'')+' '+(selectedClient.adresseChantierCp||'')+' '+(selectedClient.adresseChantierVille||''))}`}
                            target="_blank" rel="noreferrer"
                            style={{fontSize:11,color:'#2563eb',textDecoration:'none',display:'inline-flex',alignItems:'center',gap:3,flexShrink:0}}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                            Maps
                          </a>
                        )}
                      </div>
                    )},
                    selectedClient.siret?{label:'SIRET',val:selectedClient.siret}:null,
                    selectedClient.tvaIntra?{label:'TVA intra',val:selectedClient.tvaIntra}:null,
                    selectedClient.enCharge?{label:'En charge',val:(
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:24,height:24,borderRadius:'50%',background:G+'22',color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700}}>
                          {selectedClient.enCharge.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                        </div>
                        <span>{selectedClient.enCharge}</span>
                      </div>
                    )}:null,
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

              {/* Historique communications */}
              <div>
                <div style={{fontSize:12,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Historique des communications</div>
                {(historiqueCommunications[selectedClient.id]||[]).length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune communication</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {(historiqueCommunications[selectedClient.id]||[]).map((comm,i)=>(
                      <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8}}>
                        <div style={{width:30,height:30,borderRadius:'50%',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
                          background:comm.type==='devis'?'#eff6ff':comm.type==='facture'?'#f0fdf4':'#fffbeb',
                          color:comm.type==='devis'?'#2563eb':comm.type==='facture'?G:AM,fontSize:14}}>
                          {comm.type==='devis'?'📄':comm.type==='facture'?'🧾':'🔔'}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:12,fontWeight:500,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{comm.sujet}</div>
                          <div style={{fontSize:11,color:'#888'}}>{comm.date}</div>
                        </div>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,flexShrink:0,
                          background:comm.statut==='Payée'?'#f0fdf4':comm.statut==='Envoyé'?'#eff6ff':'#f9fafb',
                          color:comm.statut==='Payée'?G:comm.statut==='Envoyé'?'#2563eb':'#888'}}>
                          {comm.statut}
                        </span>
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

      {/* Toast annuler suppression */}
      {showUndoToast&&(
        <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 20px',zIndex:9999,display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{fontSize:13}}>Client supprimé</span>
          <button onClick={annulerSuppression} style={{padding:'5px 14px',background:G,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer'}}>Annuler</button>
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

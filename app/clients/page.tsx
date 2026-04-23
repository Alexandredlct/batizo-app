'use client'
import NotifBell from '../components/NotifBell'
import NouveauClientDrawer from '../components/NouveauClientDrawer'
import SearchBar from '../components/SearchBar'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const fmt=(n:number)=>n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:0})+' €'

const isNouveau=(dateStr:string)=>{
  const p=dateStr.split('/');if(p.length!==3)return false
  const d=new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0]))
  return (Date.now()-d.getTime())/(1000*60*60*24)<=30
}

type TypeClient='particulier'|'professionnel'
type Statut='actif'|'inactif'|'prospect'
type Client={
  id:string;type:TypeClient;civilite:string;prenom:string;nom:string
  email:string;tel:string;statut:Statut;enCharge:string
  raisonSociale?:string;formeJuridique?:string;siret?:string;siren?:string
  tvaIntra?:string;paysImmat?:string;contactNom?:string;contactPoste?:string
  adresseFactLine1?:string;adresseFactVille?:string;adresseFactCp?:string;adresseFactPays?:string
  adresseChantierLine1?:string;adresseChantierVille?:string;adresseChantierCp?:string
  source?:string;langue?:string;tags?:string;notes?:string
  nbDevis:number;caTotal:number;margeAvg:number;derniereActivite:string
}

const FORMES=['SAS','SARL','SCI','SASU','EURL','SA','Auto-entrepreneur','EI','Autre']
const SOURCES=['Bouche à oreille','Google','Recommandation','Réseaux sociaux','Chantier voisin','Autre']
const LANGUES=['Français','Anglais','Espagnol','Arabe','Autre']
const MEMBRES=['Alexandre Delcourt','Emma Strano','Ysaline Bernard','Xavier Concy','Thomas Giraud']

const initClients:Client[]=[
  {id:'c1',type:'professionnel',civilite:'M.',prenom:'Jean',nom:'Dupont',email:'j.dupont@immobilier.fr',tel:'06 12 34 56 78',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'Dupont Immobilier SAS',formeJuridique:'SAS',siret:'85357201400012',siren:'853572014',tvaIntra:'FR12853572014',paysImmat:'France',contactNom:'Jean Dupont',contactPoste:'Directeur',adresseFactLine1:'45 avenue des Champs',adresseFactVille:'Paris',adresseFactCp:'75008',adresseFactPays:'France',adresseChantierLine1:'12 rue de la Paix',adresseChantierVille:'Paris',adresseChantierCp:'75001',source:'Recommandation',langue:'Français',tags:'VIP, gros chantier',notes:'',nbDevis:8,caTotal:124500,margeAvg:62,derniereActivite:'05/04/2026'},
  {id:'c2',type:'particulier',civilite:'Mme',prenom:'Sophie',nom:'Martin',email:'s.martin@gmail.com',tel:'07 23 45 67 89',statut:'actif',enCharge:'Emma Strano',adresseFactLine1:'8 rue des Lilas',adresseFactVille:'Courbevoie',adresseFactCp:'92400',adresseFactPays:'France',adresseChantierLine1:'8 rue des Lilas',adresseChantierVille:'Courbevoie',adresseChantierCp:'92400',source:'Google',langue:'Français',tags:'',notes:'Rénovation complète appartement 80m²',nbDevis:3,caTotal:28400,margeAvg:58,derniereActivite:'08/04/2026'},
  {id:'c3',type:'professionnel',civilite:'M.',prenom:'Karim',nom:'Mansouri',email:'k.mansouri@promoteur.fr',tel:'06 34 56 78 90',statut:'actif',enCharge:'Alexandre Delcourt',raisonSociale:'Mansouri Promotion SARL',formeJuridique:'SARL',siret:'72345678900034',siren:'723456789',tvaIntra:'FR34723456789',paysImmat:'France',contactNom:'Karim Mansouri',contactPoste:'Gérant',adresseFactLine1:'22 boulevard Haussmann',adresseFactVille:'Paris',adresseFactCp:'75009',adresseFactPays:'France',adresseChantierLine1:'5 rue Voltaire',adresseChantierVille:'Levallois-Perret',adresseChantierCp:'92300',source:'Bouche à oreille',langue:'Français',tags:'Promoteur, récurrent',notes:'',nbDevis:12,caTotal:287000,margeAvg:65,derniereActivite:'02/04/2026'},
  {id:'c4',type:'particulier',civilite:'M.',prenom:'Pierre',nom:'Leblanc',email:'p.leblanc@outlook.fr',tel:'06 45 67 89 01',statut:'prospect',enCharge:'Emma Strano',adresseFactLine1:'3 allée des Roses',adresseFactVille:'Neuilly-sur-Seine',adresseFactCp:'92200',adresseFactPays:'France',adresseChantierLine1:'3 allée des Roses',adresseChantierVille:'Neuilly-sur-Seine',adresseChantierCp:'92200',source:'Chantier voisin',langue:'Français',tags:'',notes:'',nbDevis:1,caTotal:8900,margeAvg:54,derniereActivite:'01/03/2026'},
  {id:'c5',type:'professionnel',civilite:'Mme',prenom:'Alice',nom:'Bernard',email:'a.bernard@sci-famille.fr',tel:'06 56 78 90 12',statut:'actif',enCharge:'Ysaline Bernard',raisonSociale:'SCI Famille Bernard',formeJuridique:'SCI',siret:'65432198700089',siren:'654321987',tvaIntra:'',paysImmat:'France',contactNom:'Alice Bernard',contactPoste:'Gérante',adresseFactLine1:'17 rue de la République',adresseFactVille:'Levallois-Perret',adresseFactCp:'92300',adresseFactPays:'France',adresseChantierLine1:'Résidence Les Pins, Bât A',adresseChantierVille:'Clichy',adresseChantierCp:'92110',source:'Recommandation',langue:'Français',tags:'SCI, immeuble',notes:'Gère plusieurs lots',nbDevis:5,caTotal:67200,margeAvg:60,derniereActivite:'28/03/2026'},
]

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
  'c2':[
    {date:'08/04/2026 16:45',type:'devis',sujet:'DEV-2024-091 - Rénovation salle de bain',statut:'Envoyé'},
  ],
  'c3':[
    {date:'02/04/2026 08:30',type:'devis',sujet:'DEV-2024-085 - Rénovation immeuble',statut:'Envoyé'},
    {date:'20/02/2026 15:00',type:'facture',sujet:'FAC-2024-072 - Parties communes',statut:'Payée'},
  ],
}

const statutColors:Record<string,{bg:string,color:string}>={
  'Signé':{bg:'#f0fdf4',color:G},'En attente':{bg:'#fffbeb',color:AM},
  'En cours':{bg:'#eff6ff',color:'#2563eb'},'Refusé':{bg:'#fef2f2',color:RD},
}

const emptyClient=():Omit<Client,'id'|'nbDevis'|'caTotal'|'margeAvg'|'derniereActivite'>=>({
  type:'particulier',civilite:'M.',prenom:'',nom:'',email:'',tel:'',
  statut:'prospect',enCharge:'',
  adresseFactLine1:'',adresseFactVille:'',adresseFactCp:'',adresseFactPays:'France',
  adresseChantierLine1:'',adresseChantierVille:'',adresseChantierCp:'',
  source:'',langue:'Français',tags:'',notes:''
})


function FicheRow({label,val}:{label:string,val:any}){
  if(!val&&val!==0)return null
  return(
    <div style={{display:'flex',gap:8,fontSize:13,marginBottom:4}}>
      <span style={{color:'#888',minWidth:120,flexShrink:0}}>{label}</span>
      <span style={{color:'#111',fontWeight:500}}>{val}</span>
    </div>
  )
}

function FicheSection({title,children}:{title:string,children:any}){
  const kids=Array.isArray(children)?children.filter(Boolean):[children].filter(Boolean)
  if(kids.length===0)return null
  return(
    <div style={{marginBottom:14}}>
      <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>{title}</div>
      {children}
    </div>
  )
}

function FicheInfos({client,BD,G}:{client:any,BD:string,G:string}){
  const isPro=client.type==='professionnel'
  return(
    <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
      {isPro&&(
        <FicheSection title="Informations entreprise">
          <FicheRow label="Raison sociale" val={client.raisonSociale}/>
          <FicheRow label="Forme juridique" val={client.formeJuridique}/>
          <FicheRow label="Pays immat." val={client.paysImmat&&client.paysImmat!=='France'?client.paysImmat:null}/>
          <FicheRow label="SIREN" val={client.siren}/>
          <FicheRow label="SIRET" val={client.siret}/>
          <FicheRow label="N° TVA intra" val={client.tvaIntra}/>
        </FicheSection>
      )}
      <FicheSection title={isPro?'Contact principal':'Informations personnelles'}>
        <FicheRow label="Civilité" val={client.civilite}/>
        <FicheRow label="Prénom" val={client.prenom}/>
        <FicheRow label="Nom" val={client.nomFamille||(!isPro?client.nom:null)}/>
        <FicheRow label="Email" val={client.email?<a href={`mailto:${client.email}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.email}</a>:null}/>
        <FicheRow label="Téléphone" val={client.tel?<a href={`tel:${client.tel.replace(/\s/g,'')}`} style={{color:'#2563eb',textDecoration:'none'}}>{client.tel}</a>:null}/>
      </FicheSection>
      <FicheSection title="Adresse">
        <FicheRow label="Adresse" val={client.adresseFactLine1}/>
        <FicheRow label="Code postal" val={client.adresseFactCp}/>
        <FicheRow label="Ville" val={client.adresseFactVille}/>
      </FicheSection>
      {client.enCharge&&(
        <FicheSection title="Suivi">
          <FicheRow label="En charge" val={client.enCharge}/>
        </FicheSection>
      )}
    </div>
  )
}

export default function ClientsPage(){
  const[clients,setClients]=useState<Client[]>(initClients)
  const[filtre,setFiltre]=useState<'tous'|'particulier'|'professionnel'>('tous')
  const[filtreStatut,setFiltreStatut]=useState<'tous'|'actif'|'inactif'|'prospect'>('tous')
  const[search,setSearch]=useState('')
  const[tri,setTri]=useState<'nom'|'caTotal'|'nbDevis'|'derniereActivite'|'adresseFactVille'>('nom')
  const[triDir,setTriDir]=useState<'asc'|'desc'>('asc')
  const[panel,setPanel]=useState<'add'|'edit'|'view'|null>(null)
  const[selectedId,setSelectedId]=useState<string|null>(null)
  const[form,setForm]=useState<any>({})
  const[adresseSame,setAdresseSame]=useState(true)
  const[noteText,setNoteText]=useState('')
  const[notes,setNotes]=useState<Record<string,{text:string,date:string}[]>>({})
  const[toast,setToast]=useState('')
  const[showImportModal,setShowImportModal]=useState(false)
  const[importErrors,setImportErrors]=useState<string[]>([])
  const[importStats,setImportStats]=useState<{imported:number,dupes:number,errors:number}|null>(null)
  const[deleteConfirm,setDeleteConfirm]=useState<string|null>(null)
  const[enChargeMenu,setEnChargeMenu]=useState<string|null>(null)
  const[deletedClient,setDeletedClient]=useState<Client|null>(null)
  const[showUndoToast,setShowUndoToast]=useState(false)
  const[importPreview,setImportPreview]=useState<any[]>([])
  const[filtreEnCharge,setFiltreEnCharge]=useState<string>('tous')

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    if(params.get('new')==='1') openAdd()
    const editId=params.get('edit')
    if(editId){
      const cl=clients.find(c=>c.id===editId)
      if(cl) openEdit(cl)
    }
  },[])
  const genId=()=>'c'+Math.random().toString(36).slice(2,8)
  const toggleTri=(t:typeof tri)=>{if(tri===t)setTriDir(d=>d==='asc'?'desc':'asc');else{setTri(t);setTriDir('asc')}}

  const sorted=(items:Client[])=>[...items].sort((a,b)=>{
    if(tri==='nom') return triDir==='asc'?a.nom.localeCompare(b.nom):b.nom.localeCompare(a.nom)
    if(tri==='adresseFactVille') return triDir==='asc'?(a.adresseFactVille||'').localeCompare(b.adresseFactVille||''):(b.adresseFactVille||'').localeCompare(a.adresseFactVille||'')
    if(tri==='caTotal') return triDir==='asc'?a.caTotal-b.caTotal:b.caTotal-a.caTotal
    if(tri==='nbDevis') return triDir==='asc'?a.nbDevis-b.nbDevis:b.nbDevis-a.nbDevis
    if(tri==='derniereActivite'){
      const toDate=(s:string)=>{const p=s.split('/');return new Date(parseInt(p[2]),parseInt(p[1])-1,parseInt(p[0])).getTime()}
      return triDir==='asc'?toDate(a.derniereActivite)-toDate(b.derniereActivite):toDate(b.derniereActivite)-toDate(a.derniereActivite)
    }
    return 0
  })

  const filtered=clients.filter(c=>{
    const q=search.toLowerCase()
    const ms=!search||c.nom.toLowerCase().includes(q)||c.prenom.toLowerCase().includes(q)||c.email.toLowerCase().includes(q)||c.tel.includes(q)||(c.raisonSociale||'').toLowerCase().includes(q)||(c.adresseFactVille||'').toLowerCase().includes(q)||(c.tags||'').toLowerCase().includes(q)
    return ms&&(filtre==='tous'||c.type===filtre)&&(filtreStatut==='tous'||c.statut===filtreStatut)&&(filtreEnCharge==='tous'||c.enCharge===filtreEnCharge)
  })

  const openAdd=()=>{setForm(emptyClient());setAdresseSame(true);setSelectedId(null);setPanel('add')}
  const openEdit=(client:Client)=>{setForm({...client});setAdresseSame(client.adresseChantierLine1===client.adresseFactLine1);setSelectedId(client.id);setPanel('edit')}
  const openView=(client:Client)=>{setSelectedId(client.id);setPanel('view')}
  const closePanel=()=>{setPanel(null);setSelectedId(null);setForm({})}

  const save=()=>{
    // Détection doublons email/tel
    const doublonEmail=form.email&&clients.find(cl=>cl.email===form.email&&cl.id!==selectedId)
    const doublonTel=form.tel&&clients.find(cl=>cl.tel===form.tel&&cl.id!==selectedId)
    if(doublonEmail){
      if(!confirm(`⚠️ Un client avec cet email existe déjà : ${doublonEmail.prenom} ${doublonEmail.nom}\nVoulez-vous quand même continuer ?`)) return
    }
    if(doublonTel&&!doublonEmail){
      if(!confirm(`⚠️ Un client avec ce téléphone existe déjà : ${doublonTel.prenom} ${doublonTel.nom}\nVoulez-vous quand même continuer ?`)) return
    }
    // Validation champs obligatoires
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(form.type==='professionnel'&&!form.raisonSociale?.trim()){showToast('Raison sociale obligatoire');return}
    if(form.type!=='professionnel'&&!form.nom?.trim()){showToast('Nom obligatoire');return}
    if(!form.adresseFactLine1?.trim()){showToast('Adresse obligatoire');return}
    if(!form.adresseFactCp?.trim()){showToast('Code postal obligatoire');return}
    if(!form.adresseFactVille?.trim()){showToast('Ville obligatoire');return}
    if(!form.enCharge?.trim()){showToast('Champ « En charge » obligatoire');return}
    if(form.email&&!emailRegex.test(form.email)){showToast('Format email invalide');return}
    const f={...form}
    if(adresseSame){f.adresseChantierLine1=f.adresseFactLine1;f.adresseChantierVille=f.adresseFactVille;f.adresseChantierCp=f.adresseFactCp}
    // Persister dans localStorage
    const saveToStorage=(list:any[])=>{try{localStorage.setItem('batizo_clients',JSON.stringify(list))}catch(e){}}
    if(panel==='edit'&&selectedId){
      setClients(p=>{const updated=p.map(c=>c.id===selectedId?{...f,id:selectedId}:c);saveToStorage(updated);return updated})
      showToast('Client modifié')
    } else {
      setClients(p=>{const updated=[...p,{...f,id:genId(),nbDevis:0,caTotal:0,margeAvg:0,derniereActivite:new Date().toLocaleDateString('fr-FR')}];saveToStorage(updated);return updated})
      showToast('Client ajouté')
    }
    closePanel()
  }

  const supprimer=(id:string)=>{
    const cl=clients.find(c=>c.id===id); if(!cl)return
    setClients(p=>p.filter(c=>c.id!==id))
    setDeleteConfirm(null)
    if(panel!==null&&selectedId===id) closePanel()
    setDeletedClient(cl); setShowUndoToast(true)
    setTimeout(()=>{setShowUndoToast(false);setDeletedClient(null)},5000)
  }
  const annulerSuppression=()=>{
    if(!deletedClient)return
    setClients(p=>[...p,deletedClient])
    setShowUndoToast(false); setDeletedClient(null)
    showToast('Client restauré')
  }
  const ajouterNote=(clientId:string)=>{
    if(!noteText.trim())return
    setNotes(p=>({...p,[clientId]:[...(p[clientId]||[]),{text:noteText,date:new Date().toLocaleString('fr-FR')}]}))
    setNoteText('')
  }

  const telechargerModeleClients=()=>{
    const headers=['Type','Civilite','Prenom','Nom','Raison sociale','Forme juridique','Pays immatriculation','SIREN','SIRET','TVA intracommunautaire','Email','Telephone','Adresse','Code postal','Ville','En charge','Notes internes']
    const ex=['Particulier','M.','Jean','Dupont','','','','','','','jean@exemple.fr','06 12 34 56 78','12 rue de la Paix','75001','Paris','Alexandre','']
    const ex2=['Pro','','','','Dupont Immobilier SAS','SAS','France','123456789','12345678900012','FR12123456789','contact@dupont.fr','01 23 45 67 89','45 avenue des Champs','75008','Paris','Emma','Client VIP']
    const csv=[headers,ex,ex2].map(r=>r.map(v=>'"'+v+'"').join(',')).join('\n')
    const a=document.createElement('a');a.href='data:text/csv;charset=utf-8,'+encodeURIComponent(csv);a.download='modele_clients.csv';a.click()
  }

  const parseImportClients=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];if(!file)return
    const reader=new FileReader()
    reader.onload=ev=>{
      const text=ev.target?.result as string
      const lines=text.split('\n').filter(l=>l.trim())
      const headers=lines[0].split(',').map(h=>h.replace(/"/g,'').trim().toLowerCase())
      const get=(vals:string[],k:string)=>vals[headers.indexOf(k)]?.replace(/"/g,'').trim()||''
      const errors:string[]=[]
      let imported=0,dupes=0
      const newClients:any[]=[]
      const existingEmails=new Set(clients.map(c=>c.email).filter(Boolean))
      const existingSirets=new Set(clients.map(c=>c.siret).filter(Boolean))
      lines.slice(1).forEach((line,idx)=>{
        if(!line.trim())return
        const vals=line.split(',')
        const type=get(vals,'type').toLowerCase()
        const nom=get(vals,'nom')
        const raison=get(vals,'raison sociale')
        const email=get(vals,'email')
        const siret=get(vals,'siret')
        const adresse=get(vals,'adresse')
        const cp=get(vals,'code postal')
        const ville=get(vals,'ville')
        const enCharge=get(vals,'en charge')
        if(type==='pro'&&!raison){errors.push('Ligne '+(idx+2)+': Raison sociale obligatoire pour un Pro');return}
        if(type!=='pro'&&!nom){errors.push('Ligne '+(idx+2)+': Nom obligatoire pour un Particulier');return}
        if(!adresse||!cp||!ville){errors.push('Ligne '+(idx+2)+': Adresse, code postal et ville obligatoires');return}
        if(email&&existingEmails.has(email)){dupes++;return}
        if(siret&&existingSirets.has(siret)){dupes++;return}
        const civilite=get(vals,'civilite')
        const prenom=get(vals,'prenom')
        const nomComplet=type==='pro'?raison+(nom?(' — '+(civilite?civilite+' ':'')+prenom+' '+nom).trim():''):((civilite?civilite+' ':'')+prenom+' '+nom).trim()
        newClients.push({
          id:'import_'+Date.now()+'_'+idx,type:type==='pro'?'professionnel':'particulier',
          civilite,prenom,nom,raisonSociale:raison,
          formeJuridique:get(vals,'forme juridique'),paysImmat:get(vals,'pays immatriculation')||'France',
          siren:get(vals,'siren'),siret,tvaIntra:get(vals,'tva intracommunautaire'),
          email,tel:get(vals,'telephone'),
          adresseFactLine1:adresse,adresseFactCp:cp,adresseFactVille:ville,adresseFactPays:'France',
          enCharge,notes:get(vals,'notes internes'),
          statut:'actif' as const,nbDevis:0,caTotal:0,margeAvg:0,
          derniereActivite:new Date().toLocaleDateString('fr-FR')
        })
        imported++
        if(email)existingEmails.add(email)
        if(siret)existingSirets.add(siret)
      })
      if(newClients.length>0){
        setClients(p=>{const updated=[...p,...newClients];try{localStorage.setItem('batizo_clients',JSON.stringify(updated))}catch(e){}return updated})
      }
      setImportErrors(errors)
      setImportStats({imported,dupes,errors:errors.length})
      if(errors.length===0)setShowImportModal(false)
      showToast(imported>0?imported+' client(s) importé(s)':'Aucun client importé')
    }
    reader.readAsText(file)
    e.target.value=''
  }

  const exportCSV=()=>{
    const rows=filtered.map(c=>[c.type,c.civilite,c.prenom,c.nom,c.email,c.tel,c.statut,c.enCharge,c.raisonSociale||'',c.adresseFactVille||'',c.tags||''])
    const csv=[['Type','Civilite','Prenom','Nom','Email','Tel','Statut','En charge','Raison sociale','Ville','Tags'],...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob);const a=document.createElement('a')
    a.href=url;a.download=`clients.csv`;a.click();URL.revokeObjectURL(url)
    showToast(`${filtered.length} clients exportés`)
  }

  const selectedClient=clients.find(c=>c.id===selectedId)

  // Helpers form
  const F=({label,field,placeholder,required=false,type='text'}:{label:string,field:string,placeholder?:string,required?:boolean,type?:string})=>(
    <div>
      <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>{label}{required&&<span style={{color:RD}}> *</span>}</label>
      <input type={type} value={form[field]||''} onChange={e=>setForm((p:any)=>({...p,[field]:e.target.value}))} placeholder={placeholder}
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
  const Sep=({title}:{title:string})=>(
    <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.05em',margin:'14px 0 8px',paddingBottom:5,borderBottom:`1px solid ${BD}`}}>{title}</div>
  )

  const caAnnee=clients.reduce((s,c)=>s+c.caTotal,0)
  const caPrec=Math.round(caAnnee*0.82)
  const variation=Math.round((caAnnee-caPrec)/caPrec*100)

  return(<>
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setEnChargeMenu(null)}>
      <Sidebar activePage="clients"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Clients</div><SearchBar/>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Exporter CSV
            </button>
            <button onClick={()=>{setShowImportModal(true);setImportErrors([]);setImportStats(null)}}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Importer CSV
            </button>
            <button onClick={openAdd} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau client</button>
            <NotifBell/>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>Total clients</div>
              <div style={{fontSize:22,fontWeight:700,color:'#111'}}>{clients.length}</div>
            </div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>Professionnels</div>
              <div style={{fontSize:22,fontWeight:700,color:'#2563eb'}}>{clients.filter(c=>c.type==='professionnel').length}</div>
            </div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>Particuliers</div>
              <div style={{fontSize:22,fontWeight:700,color:AM}}>{clients.filter(c=>c.type==='particulier').length}</div>
            </div>
            <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>CA cette année HT</div>
              <div style={{fontSize:22,fontWeight:700,color:G}}>{caAnnee.toLocaleString('fr-FR')} €</div>
              <div style={{display:'flex',alignItems:'center',gap:4,marginTop:3}}>
                <span style={{fontSize:11,fontWeight:700,color:variation>=0?G:RD}}>{variation>=0?'+':''}{variation}% vs 2025</span>
                <span style={{fontSize:11,color:'#888'}}>{caPrec.toLocaleString('fr-FR')} € en 2025</span>
              </div>
            </div>
          </div>

          {/* Onglets pilules */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {([
              ['tous','Tous',clients.length],
              ['particulier','Particuliers',clients.filter(c=>c.type==='particulier').length],
              ['professionnel','Professionnels',clients.filter(c=>c.type==='professionnel').length],
            ] as const).map(([val,label,count])=>(
              <button key={val} onClick={()=>setFiltre(val as typeof filtre)}
                style={{padding:'7px 16px',borderRadius:20,border:`1px solid ${filtre===val?G:BD}`,background:filtre===val?'#f0fdf4':'#fff',color:filtre===val?G:'#555',fontSize:13,fontWeight:filtre===val?600:400,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                {label}
                <span style={{background:filtre===val?G:'#e5e7eb',color:filtre===val?'#fff':'#888',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{count}</span>
              </button>
            ))}
          </div>

          {/* Barre recherche + filtre en charge */}
          <div style={{display:'flex',gap:8,marginBottom:20,alignItems:'center'}}>
            <div style={{flex:'1 1 auto',position:'relative'}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)}
                placeholder="Rechercher par nom, email, téléphone, ville..."
                style={{width:'100%',padding:'9px 12px 9px 36px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor='#999'}/>
              {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18}}>×</button>}
            </div>
            <select value={filtreEnCharge} onChange={e=>setFiltreEnCharge(e.target.value)}
              style={{padding:'9px 18px 9px 12px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111',width:'auto',height:40,flexShrink:0,appearance:'none' as const,WebkitAppearance:'none' as const,backgroundImage:'url(%22data:image/svg+xml;charset=UTF-8,%3csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2212%22%20height=%2212%22%20viewBox=%220%200%2012%2012%22%3e%3cpath%20d=%22M3%204.5L6%207.5L9%204.5%22%20stroke=%22%236B7280%22%20stroke-width=%221.5%22%20fill=%22none%22/%3e%3c/svg%3e%22)',backgroundRepeat:'no-repeat',backgroundPosition:'right 10px center',backgroundSize:'12px',backgroundColor:'#fff'}}>
              <option value="tous">En charge : Tous</option>
              {MEMBRES.map(m=><option key={m} value={m}>{m}</option>)}
              <option value="">Non assigné</option>
            </select>
          </div>

          {/* Tableau */}
          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9fafb'}}>
                  {[
                    {label:'Client',key:'nom'},
                    {label:'Type',key:''},
                    {label:'Email',key:''},
                    {label:'Téléphone',key:''},
                    {label:'Ville',key:'adresseFactVille'},
                    {label:'Devis',key:'nbDevis'},
                    {label:'CA total HT',key:'caTotal'},
                    {label:'En charge',key:''},
                    {label:'Dernière activité',key:'derniereActivite'},
                  ].map(({label,key})=>(
                    <th key={label} onClick={()=>key&&toggleTri(key as typeof tri)}
                      style={{padding:'10px 14px',textAlign:'left' as const,fontSize:12,color:tri===key&&key?G:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`,cursor:key?'pointer':'default',userSelect:'none' as const,whiteSpace:'nowrap' as const}}>
                      {label}{tri===key&&key?(triDir==='asc'?' ↑':' ↓'):''}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0?(
                  <tr><td colSpan={7} style={{padding:'3rem',textAlign:'center' as const,color:'#888',fontSize:13}}>Aucun client{search?' pour cette recherche':''}</td></tr>
                ):sorted(filtered).map(client=>(
                  <tr key={client.id} style={{borderBottom:`1px solid ${BD}`,cursor:'pointer'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}
                    onClick={()=>openView(client)}>

                    {/* 1. Client */}
                    <td style={{padding:'11px 14px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>
                        {(()=>{
  const isPro=client.type==='professionnel'
  const prenom=(client as any).prenom||''
  const nomF=(client as any).nomFamille||''
  const civ=(client as any).civilite||''
  if(isPro){
    return client.raisonSociale||client.nom
  }
  if(prenom&&nomF) return prenom+' '+nomF
  if(!prenom&&nomF) return civ?(civ+' '+nomF):nomF
  if(prenom&&!nomF) return civ?(civ+' '+prenom):prenom
  return client.nom
})()}
                      </div>
                      {(()=>{
  const isPro=client.type==='professionnel'
  const prenom=(client as any).prenom||''
  const nomF=(client as any).nomFamille||''
  const civ=(client as any).civilite||''
  if(!isPro) return null
  let contact=''
  if(prenom&&nomF) contact=prenom+' '+nomF
  else if(prenom) contact=civ?(civ+' '+prenom):prenom
  else if(nomF) contact=civ?(civ+' '+nomF):nomF
  return contact?<div style={{fontSize:11,color:'#888',marginTop:1}}>{contact}</div>:null
})()}

                    </td>

                    {/* 2. Type */}
                    <td style={{padding:'11px 14px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,
                        background:client.type==='professionnel'?'#eff6ff':'#fff7ed',
                        color:client.type==='professionnel'?'#2563eb':'#ea580c'}}>
                        {client.type==='professionnel'?'Pro':'Particulier'}
                      </span>
                    </td>



                    {/* 4. Email */}
                    <td style={{padding:'11px 14px',fontSize:13,color:'#333'}} onClick={e=>e.stopPropagation()}>
                      {client.email?<a href={`mailto:${client.email}`} style={{color:'#333',textDecoration:'none'}} onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#2563eb'} onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#333'}>{client.email}</a>:'—'}
                    </td>

                    {/* 5. Téléphone */}
                    <td style={{padding:'11px 14px'}} onClick={e=>e.stopPropagation()}>
                      {client.tel?(
                        <a href={`tel:${client.tel.replace(/\s/g,'')}`} style={{fontSize:13,color:'#333',textDecoration:'none',display:'flex',alignItems:'center',gap:4}}
                          onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#2563eb'}
                          onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#333'}>
                          {client.tel}
                        </a>
                      ):'—'}
                    </td>

                    {/* 6. Ville */}
                    <td style={{padding:'11px 14px',fontSize:13,color:'#555'}}>{client.adresseFactVille||'—'}</td>

                    {/* 7. Devis */}
                    <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:'#111',textAlign:'center' as const}}>{client.nbDevis}</td>

                    {/* 8. CA total HT */}
                    <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:'#111'}}>{fmt(client.caTotal)}</td>

                    {/* 10. En charge */}
                    <td style={{padding:'11px 14px',overflow:'visible'}} onClick={e=>e.stopPropagation()}>
                      <div style={{position:'relative'}}>
                        <div onClick={()=>setEnChargeMenu(enChargeMenu===client.id?null:client.id)}
                          style={{display:'inline-flex',alignItems:'center',gap:5,cursor:'pointer',padding:'3px 7px',borderRadius:7,transition:'background 0.1s'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f3f4f6'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                          <div style={{width:24,height:24,borderRadius:'50%',background:'#f0f4ff',color:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>
                            {client.enCharge?client.enCharge.split(' ').map((n:string)=>n[0]).join('').slice(0,2):'?'}
                          </div>
                          <span style={{fontSize:12,color:'#333',maxWidth:80,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>
                            {client.enCharge?client.enCharge.split(' ')[0]:'—'}
                          </span>
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                        {enChargeMenu===client.id&&(
                          <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'110%',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:500,minWidth:190,overflow:'hidden'}}>
                            <div style={{padding:'8px 12px',fontSize:11,color:'#888',fontWeight:600,borderBottom:`1px solid #f3f4f6`}}>ASSIGNER À</div>
                            {['', ...MEMBRES].map(m=>(
                              <div key={m||'none'} onClick={()=>{setClients(p=>p.map(cl=>cl.id===client.id?{...cl,enCharge:m}:cl));setEnChargeMenu(null)}}
                                style={{padding:'9px 14px',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:8,
                                  background:client.enCharge===m?'#f0fdf4':'',color:client.enCharge===m?G:'#333',fontWeight:client.enCharge===m?600:400}}
                                onMouseEnter={e=>{if(client.enCharge!==m)(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}}
                                onMouseLeave={e=>{if(client.enCharge!==m)(e.currentTarget as HTMLDivElement).style.background=''}}>
                                {m?(
                                  <>
                                    <div style={{width:22,height:22,borderRadius:'50%',background:'#f0f4ff',color:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>
                                      {m.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                                    </div>
                                    {m}
                                  </>
                                ):<span style={{color:'#aaa'}}>Non assigné</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* 9. Dernière activité */}
                    <td style={{padding:'11px 14px',fontSize:12,color:'#888',whiteSpace:'nowrap' as const}}>{client.derniereActivite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{marginTop:8,fontSize:12,color:'#888'}}>{filtered.length} client{filtered.length>1?'s':''} affiché{filtered.length>1?'s':''}</div>
        </div>
      </div>
      {/* Panneau Add/Edit */}
      {(panel==='add'||panel==='edit')&&(
        <NouveauClientDrawer
          mode={panel}
          clientInitial={panel==='edit'?form:undefined}
          onClose={closePanel}
          onSave={(client:any)=>{
            if(panel==='edit'&&selectedId){
              setClients(p=>{const updated=p.map(c=>c.id===selectedId?{...client,id:selectedId}:c);try{localStorage.setItem('batizo_clients',JSON.stringify(updated))}catch(e){}return updated})
              showToast('Client modifié')
            } else {
              setClients(p=>{const updated=[...p,{...client,nbDevis:0,caTotal:0,margeAvg:0,derniereActivite:new Date().toLocaleDateString('fr-FR')}];try{localStorage.setItem('batizo_clients',JSON.stringify(updated))}catch(e){}return updated})
              showToast('Client ajouté')
            }
            closePanel()
          }}
        />
      )}
      {/* Panneau vue fiche */}
      {panel==='view'&&selectedClient&&(
        <>
          <div onClick={closePanel} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
          <div onClick={e=>e.stopPropagation()} style={{position:'fixed',top:0,right:0,width:580,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>
            <div style={{padding:'14px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111'}}>
                  {selectedClient.civilite} {selectedClient.prenom} {selectedClient.nom}
                </div>
                {selectedClient.raisonSociale&&<div style={{fontSize:12,color:'#888',marginTop:2}}>{selectedClient.raisonSociale}</div>}
              </div>
              <div style={{display:'flex',gap:8}}>
                <a href="/devis/nouveau" style={{padding:'7px 14px',background:G,color:'#fff',borderRadius:7,fontSize:13,fontWeight:600,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:4}}>
                  + Devis
                </a>
                <button onClick={()=>openEdit(selectedClient)} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Modifier</button>
                <button onClick={closePanel} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
              </div>
            </div>

            <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>
              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[
                  {label:'Devis',val:selectedClient.nbDevis,color:'#111'},
                  {label:'CA total HT',val:fmt(selectedClient.caTotal),color:G},
                  {label:'Marge moy.',val:selectedClient.margeAvg+'%',color:selectedClient.margeAvg>=60?G:selectedClient.margeAvg>=40?AM:RD},
                ].map(s=>(
                  <div key={s.label} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'10px 14px',textAlign:'center' as const}}>
                    <div style={{fontSize:10,color:'#888',fontWeight:600,textTransform:'uppercase' as const,marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:17,fontWeight:700,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>

              {/* Informations */}
              <FicheInfos client={selectedClient} BD={BD} G={G}/>

              {/* Historique devis */}
              <div>
                <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Historique devis</div>
                {historiqueDevis.filter(d=>d.clientId===selectedClient.id).length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucun devis</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    {historiqueDevis.filter(d=>d.clientId===selectedClient.id).map((d,i)=>(
                      <div key={i} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <div>
                          <div style={{fontSize:11,color:'#888',marginBottom:1}}>{d.num} · {d.date}</div>
                          <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.titre}</div>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,...(statutColors[d.statut]||{bg:'#f9fafb',color:'#888'})}}>{d.statut}</span>
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
                {(historiqueCommunications[selectedClient.id]||[]).length===0?(
                  <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>Aucune communication</div>
                ):(
                  <div style={{display:'flex',flexDirection:'column',gap:5}}>
                    {(historiqueCommunications[selectedClient.id]||[]).map((comm,i)=>(
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
                  <input value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Ajouter une note..."
                    onKeyDown={e=>e.key==='Enter'&&ajouterNote(selectedClient.id)}
                    style={{flex:1,padding:'7px 11px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111'}}
                    onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                    onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                  <button onClick={()=>ajouterNote(selectedClient.id)} style={{padding:'7px 14px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>+</button>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:5}}>
                  {selectedClient.notes&&<div style={{background:'#fffbeb',border:'1px solid #fde68a',borderRadius:7,padding:'8px 10px',fontSize:13,color:'#333'}}>{selectedClient.notes}</div>}
                  {[...(notes[selectedClient.id]||[])].reverse().map((n,i)=>(
                    <div key={i} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:7,padding:'8px 10px'}}>
                      <div style={{fontSize:10,color:'#888',marginBottom:2}}>{n.date}</div>
                      <div style={{fontSize:13,color:'#333'}}>{n.text}</div>
                    </div>
                  ))}
                  {!selectedClient.notes&&(notes[selectedClient.id]||[]).length===0&&(
                    <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:12,background:'#f9fafb',borderRadius:7,border:`1px solid ${BD}`}}>Aucune note</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modal delete */}
      {deleteConfirm&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setDeleteConfirm(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:360,width:'90%',textAlign:'center' as const}}>
            <div style={{width:46,height:46,borderRadius:'50%',background:'#fef2f2',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={RD} strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:6}}>Supprimer ce client ?</div>
            <div style={{fontSize:13,color:'#555',marginBottom:18}}>Cette action peut être annulée.</div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{flex:1,padding:10,border:'1px solid #333',borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
              <button onClick={()=>supprimer(deleteConfirm)} style={{flex:1,padding:10,background:RD,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast undo */}
      {showUndoToast&&(
        <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 20px',zIndex:9999,display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{fontSize:13}}>Client supprimé</span>
          <button onClick={annulerSuppression} style={{padding:'5px 14px',background:G,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer'}}>Annuler</button>
        </div>
      )}

      {/* Modal Import CSV */}
      {showImportModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowImportModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:560,width:'92%',display:'flex',flexDirection:'column' as const,gap:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Importer depuis CSV</div>
              <button onClick={()=>setShowImportModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:8}}>Étape 1 — Télécharger le modèle</div>
              <p style={{fontSize:12,color:'#555',marginBottom:10}}>Téléchargez le modèle CSV, remplissez-le et réimportez-le.</p>
              <button onClick={telechargerModeleClients}
                style={{padding:'6px 14px',background:'#fff',border:'1px solid #bbf7d0',borderRadius:7,fontSize:12,fontWeight:600,color:G,cursor:'pointer'}}>
                ⬇ Modèle Clients
              </button>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:10}}>Étape 2 — Importer votre fichier</div>
              <label style={{display:'inline-flex',alignItems:'center',gap:6,padding:'8px 16px',background:G,color:'#fff',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Choisir un fichier CSV
                <input type="file" accept=".csv,.txt" onChange={parseImportClients} style={{display:'none'}}/>
              </label>
            </div>
            {importErrors.length>0&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 14px',maxHeight:160,overflowY:'auto' as const}}>
                <div style={{fontSize:12,fontWeight:600,color:RD,marginBottom:4}}>⚠️ {importErrors.length} erreur(s)</div>
                {importErrors.map((e,i)=><div key={i} style={{fontSize:11,color:'#555'}}>{e}</div>)}
              </div>
            )}
            {importStats&&(
              <div style={{background:'#f0fdf4',borderRadius:8,padding:'10px 14px',fontSize:13}}>
                ✅ <strong>{importStats.imported}</strong> importé(s) · 
                {importStats.dupes>0&&<span> 🔁 <strong>{importStats.dupes}</strong> doublon(s) ignoré(s) ·</span>}
                {importStats.errors>0&&<span> ❌ <strong>{importStats.errors}</strong> erreur(s)</span>}
              </div>
            )}
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
  </>)
}

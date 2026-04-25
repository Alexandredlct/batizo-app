'use client'
import { createPortal } from 'react-dom'
import NouveauDevisModal from '../components/NouveauDevisModal'
import NotifBell from '../components/NotifBell'
import PageHeader from '../components/PageHeader'
import NouveauClientDrawer from '../components/NouveauClientDrawer'
import SearchBar from '../components/SearchBar'
import React, { useState, useEffect } from 'react'
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


const initClients:Client[]=[]



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

function KpiWithPeriod({id,label,kpiStats,kpiPeriode,setKpiPeriode,kpiDD,setKpiDD,BD,G}:{id:string,label:string,kpiStats:any,kpiPeriode:any,setKpiPeriode:any,kpiDD:string|null,setKpiDD:(v:string|null)=>void,BD:string,G:string}){
  const stat=kpiStats[id]||{val:'—',change:'',changeColor:G}
  const p=kpiPeriode[id]||'mois'
  const pLabel=(v:string)=>v==='mois'?'Ce mois-ci':v==='mois_prec'?'Mois dernier':v==='trimestre'?'Ce trimestre':v==='annee'?'Cette année':'Personnalisé'
  return(
    <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px',position:'relative' as const}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4}}>
        <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em'}}>{label}</div>
        <div style={{position:'relative' as const}}>
          <button onClick={()=>setKpiDD(kpiDD===id?null:id)}
            style={{fontSize:10,color:'#555',background:'#f3f4f6',border:'none',borderRadius:4,padding:'2px 6px',cursor:'pointer'}}>
            {pLabel(p)} ▾
          </button>
          {kpiDD===id&&(
            <div style={{position:'absolute' as const,right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:200,minWidth:150,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
              {[['mois','Ce mois-ci'],['mois_prec','Mois dernier'],['trimestre','Ce trimestre'],['annee','Cette année']].map(([v,l])=>(
                <div key={v} onClick={()=>{setKpiPeriode((p:Record<string,string>)=>({...p,[id]:v}));setKpiDD(null)}}
                  style={{padding:'8px 12px',fontSize:12,cursor:'pointer',background:p===v?'#f0fdf4':'',color:p===v?G:'#333'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=p===v?'#f0fdf4':''}>
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{fontSize:22,fontWeight:700,color:'#111',marginBottom:3}}>{stat.val}</div>
      {stat.change&&<div style={{fontSize:11,color:stat.changeColor,fontWeight:500}}>{stat.change}</div>}
    </div>
  )
}

export default function ClientsPage(){
  const[clients,setClients]=useState<Client[]>([])
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
  const[historiqueDevis,setHistoriqueDevis]=useState<{clientId:string,num:string,titre:string,date:string,statut:string,montant:number,marge:number}[]>([])
  const[showImportModal,setShowImportModal]=useState(false)
  const[MEMBRES,setMEMBRES]=useState<string[]>(()=>{
    try{
      const raw=localStorage.getItem('batizo_utilisateurs')
      if(raw){
        const list=JSON.parse(raw)
        return list.filter((u:any)=>u.statut!=='revoque'&&u.statut!=='inactif').map((u:any)=>u.nom)
      }
    }catch(e){}
    return []
  })
  const[showNouveauDevisModal,setShowNouveauDevisModal]=useState(false)
  const[devisClientPreselect,setDevisClientPreselect]=useState<any>(null)
  const[importErrors,setImportErrors]=useState<string[]>([])
  const[importStats,setImportStats]=useState<{imported:number,dupes:number,errors:number}|null>(null)
  const[deleteConfirm,setDeleteConfirm]=useState<string|null>(null)
  const[enChargeMenu,setEnChargeMenu]=useState<string|null>(null)
  const[enChargePos,setEnChargePos]=useState({top:0,left:0})
  const[deletedClient,setDeletedClient]=useState<Client|null>(null)
  const[showUndoToast,setShowUndoToast]=useState(false)
  const[importPreview,setImportPreview]=useState<any[]>([])
  const[filtreEnCharge,setFiltreEnCharge]=useState<string>('tous')

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}

  useEffect(()=>{
    // Charger clients depuis localStorage
    try{
      const raw=localStorage.getItem('batizo_clients')
      if(raw){const parsed=JSON.parse(raw);if(parsed.length>0)setClients(parsed)}
    }catch(e){}
    // Charger historique devis
    try{
      const rawD=localStorage.getItem('batizo_devis')
      if(rawD){
        const devisList=JSON.parse(rawD)
        const statMap:Record<string,string>={brouillon:'Brouillon',attente:'En attente',finalise:'Finalisé',signe:'Signé',refuse:'Refusé'}
        setHistoriqueDevis(devisList.filter((d:any)=>d.clientId).map((d:any)=>({
          clientId:d.clientId,num:d.ref||'DEV-???',
          titre:d.titreProjet||d.nom||'',
          date:new Date(d.dateDevis||d.createdAt||Date.now()).toLocaleDateString('fr-FR'),
          statut:statMap[d.statut]||d.statut||'Brouillon',
          montant:d.montant||0,marge:d.marge||0,
        })))
      }
    }catch(e){}
    // Charger membres depuis utilisateurs
    try{
      const raw=localStorage.getItem('batizo_utilisateurs')
      if(raw){
        const list=JSON.parse(raw)
        setMEMBRES(list.filter((u:any)=>u.statut!=='revoque'&&u.statut!=='inactif').map((u:any)=>u.nom))
      }
    }catch(e){}
    // Gérer query params
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

  const[kpiPeriode,setKpiPeriode]=useState<Record<string,string>>({nouveaux:'mois',panier:'mois',ca:'mois'})
  const[kpiDD,setKpiDD]=useState<string|null>(null)
  const[kpiDebut,setKpiDebut]=useState<Record<string,string>>({})
  const[kipFin,setKipFin]=useState<Record<string,string>>({})

  const getRange=(p:string,id:string):{start:Date,end:Date,prevStart:Date,prevEnd:Date}=>{
    const now=new Date()
    let start=new Date(),end=new Date(),prevStart=new Date(),prevEnd=new Date()
    if(p==='mois'){
      start=new Date(now.getFullYear(),now.getMonth(),1)
      end=new Date(now)
      prevStart=new Date(now.getFullYear(),now.getMonth()-1,1)
      prevEnd=new Date(now.getFullYear(),now.getMonth()-1,now.getDate())
    } else if(p==='mois_prec'){
      start=new Date(now.getFullYear(),now.getMonth()-1,1)
      end=new Date(now.getFullYear(),now.getMonth(),0)
      prevStart=new Date(now.getFullYear(),now.getMonth()-2,1)
      prevEnd=new Date(now.getFullYear(),now.getMonth()-1,0)
    } else if(p==='trimestre'){
      const q=Math.floor(now.getMonth()/3)
      start=new Date(now.getFullYear(),q*3,1)
      end=new Date(now)
      const dayOfQ=Math.floor((now.getTime()-start.getTime())/(1000*60*60*24))
      prevStart=new Date(now.getFullYear(),(q-1)*3,1)
      prevEnd=new Date(prevStart.getTime()+dayOfQ*1000*60*60*24)
    } else if(p==='annee'){
      start=new Date(now.getFullYear(),0,1)
      end=new Date(now)
      const dayOfY=Math.floor((now.getTime()-start.getTime())/(1000*60*60*24))
      prevStart=new Date(now.getFullYear()-1,0,1)
      prevEnd=new Date(prevStart.getTime()+dayOfY*1000*60*60*24)
    }
    return{start,end,prevStart,prevEnd}
  }

  const vsLabel=(p:string)=>p==='mois'?'vs mois dernier':p==='mois_prec'?'vs mois précédent':p==='trimestre'?'vs trimestre précédent':p==='annee'?'vs année dernière':'vs période précédente'

  const kpiStats=React.useMemo(()=>{
    try{
      const devisRaw=localStorage.getItem('batizo_devis')
      const devisList:any[]=devisRaw?JSON.parse(devisRaw):[]
      const signed=devisList.filter((d:any)=>['signe','facture','finalise'].includes(d.statut||''))
      
      const calcCA=(list:any[],start:Date,end:Date)=>list.filter((d:any)=>{
        const date=new Date(d.dateDevis||d.date||'')
        return !isNaN(date.getTime())&&date>=start&&date<=end
      }).reduce((s:number,d:any)=>{
        return s+(d.lignes||[]).reduce((ls:number,l:any)=>{
          if(!['materiau','mo','ouvrage'].includes(l.type))return ls
          return ls+(l.qte||0)*(l.pu||0)
        },0)
      },0)

      const calcNouveaux=(start:Date,end:Date)=>clients.filter(cl=>{
        const date=new Date((cl as any).dateCreation||cl.derniereActivite||'')
        return !isNaN(date.getTime())&&date>=start&&date<=end
      }).length

      const res:Record<string,{val:string,change:string,changeColor:string}>={}
      for(const id of['nouveaux','panier','ca']){
        const p=kpiPeriode[id]||'mois'
        const{start,end,prevStart,prevEnd}=getRange(p,id)
        
        if(id==='nouveaux'){
          const cur=calcNouveaux(start,end)
          const prev=calcNouveaux(prevStart,prevEnd)
          const diff=cur-prev
          const pct=prev>0?Math.round(diff/prev*100):null
          res[id]={
            val:String(cur),
            change:prev===0&&cur===0?'':(pct!==null?(pct>=0?'+':'')+pct+'% '+vsLabel(p):diff>0?'+'+diff+' vs 0':''),
            changeColor:diff>=0?G:'#6b7280'
          }
        } else if(id==='ca'){
          const cur=calcCA(signed,start,end)
          const prev=calcCA(signed,prevStart,prevEnd)
          const pct=prev>0?Math.round((cur-prev)/prev*100):null
          res[id]={
            val:Math.round(cur).toLocaleString('fr-FR')+' €',
            change:prev===0&&cur===0?'':(pct!==null?(pct>=0?'+':'')+pct+'% '+vsLabel(p):''),
            changeColor:(cur-prev)>=0?G:'#6b7280'
          }
        } else if(id==='panier'){
          const devisPeriode=signed.filter((d:any)=>{const date=new Date(d.dateDevis||d.date||'');return !isNaN(date.getTime())&&date>=start&&date<=end})
          const devisPrev=signed.filter((d:any)=>{const date=new Date(d.dateDevis||d.date||'');return !isNaN(date.getTime())&&date>=prevStart&&date<=prevEnd})
          const caP=devisPeriode.reduce((s:number,d:any)=>s+(d.lignes||[]).reduce((ls:number,l:any)=>ls+(l.qte||0)*(l.pu||0),0),0)
          const caPrev=devisPrev.reduce((s:number,d:any)=>s+(d.lignes||[]).reduce((ls:number,l:any)=>ls+(l.qte||0)*(l.pu||0),0),0)
          const clientsP=new Set(devisPeriode.map((d:any)=>d.clientId).filter(Boolean)).size||devisPeriode.length
          const clientsPrev=new Set(devisPrev.map((d:any)=>d.clientId).filter(Boolean)).size||devisPrev.length
          const panier=clientsP>0?Math.round(caP/clientsP):0
          const panierPrev=clientsPrev>0?Math.round(caPrev/clientsPrev):0
          const pct=panierPrev>0?Math.round((panier-panierPrev)/panierPrev*100):null
          res[id]={
            val:panier.toLocaleString('fr-FR')+' €',
            change:panierPrev===0&&panier===0?'':(pct!==null?(pct>=0?'+':'')+pct+'% '+vsLabel(p):''),
            changeColor:(panier-panierPrev)>=0?G:'#6b7280'
          }
        }
      }
      return res
    }catch(e){return{}}
  },[clients,kpiPeriode])



  return(<>
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setEnChargeMenu(null)}>
      <Sidebar activePage="clients"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <PageHeader title="Clients" actions={[
            {label:'⬆ Exporter CSV',onClick:exportCSV,variant:'secondary'},
            {label:'⬇ Importer CSV',onClick:()=>{setShowImportModal(true);setImportErrors([]);setImportStats(null)},variant:'secondary'},
            {label:'+ Nouveau client',onClick:openAdd,variant:'primary'},
          ]}/>

'use client'
import { createPortal } from 'react-dom'
import NumeroDevisDisplay from '../components/NumeroDevisDisplay'
import NouveauDevisModal from '../components/NouveauDevisModal'
import NotifBell from '../components/NotifBell'
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
          clientId:d.clientId,num:(d.ref&&!d.ref.startsWith('dev-'))?d.ref:null,
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
            <KpiWithPeriod id="nouveaux" label="Nouveaux clients" kpiStats={kpiStats} kpiPeriode={kpiPeriode} setKpiPeriode={setKpiPeriode} kpiDD={kpiDD} setKpiDD={setKpiDD} BD={BD} G={G}/>
            <KpiWithPeriod id="panier" label="Panier moyen HT" kpiStats={kpiStats} kpiPeriode={kpiPeriode} setKpiPeriode={setKpiPeriode} kpiDD={kpiDD} setKpiDD={setKpiDD} BD={BD} G={G}/>
            <KpiWithPeriod id="ca" label="CA HT" kpiStats={kpiStats} kpiPeriode={kpiPeriode} setKpiPeriode={setKpiPeriode} kpiDD={kpiDD} setKpiDD={setKpiDD} BD={BD} G={G}/>
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
  const nom=(client as any).nomFamille||(client as any).nom||''
  const civ=(client as any).civilite||''
  if(isPro) return client.raisonSociale||client.nom
  if(prenom&&nom) return prenom+' '+nom
  if(!prenom&&nom) return civ?(civ+' '+nom):nom
  if(prenom&&!nom) return civ?(civ+' '+prenom):prenom
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
                        {client.type==='professionnel'?'Professionnel':'Particulier'}
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
                        <div data-encharge={client.id} onClick={e=>{const r=(e.currentTarget as HTMLDivElement).getBoundingClientRect();setEnChargePos({top:r.bottom+4,left:r.left});setEnChargeMenu(enChargeMenu===client.id?null:client.id)}}
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
                        {enChargeMenu===client.id&&typeof window!=='undefined'&&createPortal(
                          <div onClick={e=>e.stopPropagation()} style={{position:'fixed',background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 8px 24px rgba(0,0,0,0.15)',zIndex:9999,minWidth:200,overflow:'hidden',top:enChargePos.top,left:enChargePos.left}}>
                            <div style={{padding:'8px 12px',fontSize:11,color:'#888',fontWeight:600,borderBottom:`1px solid #f3f4f6`}}>ASSIGNER À</div>
                            {['', ...MEMBRES].map(m=>(
                              <div key={m||'none'} onClick={()=>{setClients(p=>p.map(cl=>cl.id===client.id?{...cl,enCharge:m}:cl));setEnChargeMenu(null)}}
                                style={{padding:'9px 14px',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:8,
                                  background:client.enCharge===m?'#f0fdf4':'',color:client.enCharge===m?G:'#333',fontWeight:client.enCharge===m?600:400}}
                                onMouseEnter={e=>{if(client.enCharge!==m)(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}}
                                onMouseLeave={e=>{if(client.enCharge!==m)(e.currentTarget as HTMLDivElement).style.background=''}}>
                                <div style={{display:'flex',alignItems:'center',gap:8,flex:1}}>
                                  {m?(<>
                                    <div style={{width:22,height:22,borderRadius:'50%',background:'#f0f4ff',color:'#2563eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0}}>
                                      {m.split(' ').map((n:string)=>n[0]).join('').slice(0,2)}
                                    </div>
                                    {m}
                                  </>):<span style={{color:'#aaa'}}>Non assigné</span>}
                                </div>
                                {client.enCharge===m&&<span style={{color:G,fontSize:12}}>✓</span>}
                              </div>
                            ))}
                          </div>,
                          document.body
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
                  {selectedClient.type==='professionnel'
                    ? selectedClient.raisonSociale||selectedClient.nom
                    : [selectedClient.civilite, selectedClient.prenom, (selectedClient as any).nomFamille||selectedClient.nom].filter(Boolean).join(' ')
                  }
                </div>
                {selectedClient.type==='professionnel'&&(selectedClient.prenom||(selectedClient as any).nomFamille)&&(
                  <div style={{fontSize:12,color:'#888',marginTop:2}}>
                    {[selectedClient.prenom, (selectedClient as any).nomFamille||selectedClient.nom].filter(Boolean).join(' ')}
                  </div>
                )}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{setDevisClientPreselect(selectedClient);setShowNouveauDevisModal(true)}}
                  style={{padding:'7px 14px',background:G,color:'#fff',borderRadius:7,fontSize:13,fontWeight:600,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:4}}>
                  + Nouveau devis
                </button>
                <button onClick={()=>openEdit(selectedClient)} style={{padding:'7px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Modifier</button>
                <button onClick={closePanel} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
              </div>
            </div>

            <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>
              {/* Stats */}
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {(()=>{
                  const devisClient=historiqueDevis.filter(d=>d.clientId===selectedClient.id)
                  const nbDevis=devisClient.length
                  const signes=devisClient.filter(d=>d.statut==='Signé')
                  const caTotal=signes.reduce((s,d)=>s+d.montant,0)
                  const margeAvg=signes.length>0?Math.round(signes.reduce((s,d)=>s+d.marge,0)/signes.length):0
                  return[
                    {label:'Devis',val:nbDevis,color:'#111'},
                    {label:'CA total HT',val:fmt(caTotal),color:G},
                    {label:'Marge moy.',val:margeAvg>0?margeAvg+'%':'—',color:margeAvg>=60?G:margeAvg>=40?AM:RD},
                  ]
                })().map(s=>(
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
                      <div key={i} onClick={()=>{
                          // Trouver l'id du devis depuis localStorage
                          try{
                            const raw=localStorage.getItem('batizo_devis')
                            if(raw){
                              const list=JSON.parse(raw)
                              const devis=list.find((dv:any)=>dv.clientId===selectedClient.id&&(dv.ref===d.num||dv.titreProjet===d.titre))
                              if(devis){closePanel();window.location.href='/devis/'+devis.id;return}
                            }
                          }catch(e){}
                        }}
                        style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px',display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#fff'}>
                        <div>
                          <div style={{fontSize:11,color:'#888',marginBottom:1}}><NumeroDevisDisplay devis={{ref:d.num||undefined}} showBadge={true} size="small"/> · {d.date}</div>
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

      {/* Modal Nouveau devis depuis fiche client */}
      {showNouveauDevisModal&&devisClientPreselect&&(
        <NouveauDevisModal
          onClose={()=>{setShowNouveauDevisModal(false);setDevisClientPreselect(null)}}
          clientPreselect={devisClientPreselect}
        />
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

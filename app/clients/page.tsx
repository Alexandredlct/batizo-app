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

export default function ClientsPage(){
  const[clients,setClients]=useState<Client[]>(initClients)
  const[filtre,setFiltre]=useState<'tous'|'particulier'|'professionnel'>('tous')
  const[filtreStatut,setFiltreStatut]=useState<'tous'|'actif'|'inactif'|'prospect'>('tous')
  const[search,setSearch]=useState('')
  const[tri,setTri]=useState<'nom'|'caTotal'|'nbDevis'|'derniereActivite'>('nom')
  const[triDir,setTriDir]=useState<'asc'|'desc'>('asc')
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

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>setEnChargeMenu(null)}>
      <Sidebar activePage="clients"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Clients</div><SearchBar/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={exportCSV} style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>Exporter CSV</button>
            <div style={{display:'flex',alignItems:'center',gap:8}}><NotifBell/><button onClick={openAdd} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau client</button></div>
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

          {/* Filtres */}
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap' as const,alignItems:'center'}}>
            <div style={{display:'flex',gap:6}}>
              {(['tous','actif','prospect','inactif'] as const).map(f=>(
                <button key={f} onClick={()=>setFiltreStatut(f)}
                  style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${filtreStatut===f?(f==='actif'?G:f==='prospect'?AM:'#888'):BD}`,background:filtreStatut===f?(f==='actif'?'#f0fdf4':f==='prospect'?'#fffbeb':'#f9fafb'):'#fff',color:filtreStatut===f?(f==='actif'?G:f==='prospect'?AM:'#555'):'#555',fontSize:12,fontWeight:filtreStatut===f?600:400,cursor:'pointer'}}>
                  {f==='tous'?'Tous':f==='actif'?'Actif':f==='prospect'?'Prospect':'Inactif'}
                </button>
              ))}
            </div>
            <div style={{width:1,height:20,background:BD}}/>
            {(['tous','particulier','professionnel'] as const).map(f=>(
              <button key={f} onClick={()=>setFiltre(f)}
                style={{padding:'5px 12px',borderRadius:20,border:`1px solid ${filtre===f?'#2563eb':BD}`,background:filtre===f?'#eff6ff':'#fff',color:filtre===f?'#2563eb':'#555',fontSize:12,fontWeight:filtre===f?600:400,cursor:'pointer'}}>
                {f==='tous'?`Tous (${clients.length})`:f==='particulier'?`Particuliers (${clients.filter(c=>c.type==='particulier').length})`:`Pros (${clients.filter(c=>c.type==='professionnel').length})`}
              </button>
            ))}
            <select value={filtreEnCharge} onChange={e=>setFiltreEnCharge(e.target.value)}
              style={{padding:'6px 10px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
              <option value="tous">Tous les responsables</option>
              {MEMBRES.map(m=><option key={m}>{m}</option>)}
              <option value="">Non assigné</option>
            </select>
            <div style={{flex:1,position:'relative',minWidth:200}}>
              <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
                style={{width:'100%',padding:'7px 12px 7px 32px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
              {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}>×</button>}
            </div>
          </div>

          {/* Tableau */}
          <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'visible'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f9fafb'}}>
                  {[
                    {label:'Client',key:'nom'},
                    {label:'Type',key:''},
                    {label:'Statut',key:''},
                    {label:'Email',key:''},
                    {label:'Téléphone',key:''},
                    {label:'Ville',key:''},
                    {label:'Devis',key:'nbDevis'},
                    {label:'CA total HT',key:'caTotal'},
                    {label:'Dernière activité',key:'derniereActivite'},
                    {label:'En charge',key:''},
                    {label:'Comms',key:''},
                    {label:'',key:''},
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
                  <tr><td colSpan={12} style={{padding:'3rem',textAlign:'center' as const,color:'#888',fontSize:13}}>Aucun client{search?' pour cette recherche':''}</td></tr>
                ):sorted(filtered).map(client=>(
                  <tr key={client.id} style={{borderBottom:`1px solid ${BD}`,cursor:'pointer'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}
                    onClick={()=>openView(client)}>

                    {/* 1. Client */}
                    <td style={{padding:'11px 14px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>
                        {client.civilite} {client.prenom} {client.nom}
                        {isNouveau(client.derniereActivite)&&<span style={{marginLeft:6,fontSize:9,fontWeight:700,padding:'1px 5px',borderRadius:6,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>}
                      </div>
                      {client.raisonSociale&&<div style={{fontSize:11,color:'#888'}}>{client.raisonSociale}</div>}
                      {client.tags&&<div style={{display:'flex',gap:3,marginTop:2,flexWrap:'wrap' as const}}>
                        {client.tags.split(',').filter(t=>t.trim()).map((t,i)=>(
                          <span key={i} style={{fontSize:9,padding:'1px 5px',background:'#f3f4f6',color:'#555',borderRadius:6,fontWeight:600}}>{t.trim()}</span>
                        ))}
                      </div>}
                    </td>

                    {/* 2. Type */}
                    <td style={{padding:'11px 14px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,
                        background:client.type==='professionnel'?'#eff6ff':'#fff7ed',
                        color:client.type==='professionnel'?'#2563eb':'#ea580c'}}>
                        {client.type==='professionnel'?'Pro':'Particulier'}
                      </span>
                    </td>

                    {/* 3. Statut */}
                    <td style={{padding:'11px 14px'}}>
                      <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:10,
                        background:client.statut==='actif'?'#f0fdf4':client.statut==='prospect'?'#fffbeb':'#f9fafb',
                        color:client.statut==='actif'?G:client.statut==='prospect'?AM:'#888'}}>
                        {client.statut==='actif'?'Actif':client.statut==='prospect'?'Prospect':'Inactif'}
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
                          📞 {client.tel}
                        </a>
                      ):'—'}
                    </td>

                    {/* 6. Ville */}
                    <td style={{padding:'11px 14px',fontSize:13,color:'#555'}}>{client.adresseFactVille||'—'}</td>

                    {/* 7. Devis */}
                    <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:'#111',textAlign:'center' as const}}>{client.nbDevis}</td>

                    {/* 8. CA total HT */}
                    <td style={{padding:'11px 14px',fontSize:13,fontWeight:600,color:'#111'}}>{fmt(client.caTotal)}</td>

                    {/* 9. Dernière activité */}
                    <td style={{padding:'11px 14px',fontSize:12,color:'#888',whiteSpace:'nowrap' as const}}>{client.derniereActivite}</td>

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

                    {/* 11. Communications */}
                    <td style={{padding:'11px 14px'}}>
                      {(historiqueCommunications[client.id]||[]).length>0?(
                        <span style={{fontSize:11,color:'#2563eb',fontWeight:600}}>{(historiqueCommunications[client.id]||[]).length} email{(historiqueCommunications[client.id]||[]).length>1?'s':''}</span>
                      ):<span style={{fontSize:11,color:'#888'}}>—</span>}
                    </td>

                    {/* 12. Actions */}
                    <td style={{padding:'11px 14px'}} onClick={e=>e.stopPropagation()}>
                      <div style={{display:'flex',gap:4}}>
                        <button onClick={()=>openEdit(client)} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:3,color:'#aaa'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=G}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>✏️</button>
                        <button onClick={()=>setDeleteConfirm(client.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,padding:3,color:'#aaa'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
                          onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>🗑</button>
                      </div>
                    </td>
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
                <div style={{fontSize:15,fontWeight:700,color:'#111',display:'flex',alignItems:'center',gap:8}}>
                  {selectedClient.civilite} {selectedClient.prenom} {selectedClient.nom}
                  <span style={{fontSize:11,fontWeight:700,padding:'2px 7px',borderRadius:8,
                    background:selectedClient.statut==='actif'?'#f0fdf4':selectedClient.statut==='prospect'?'#fffbeb':'#f9fafb',
                    color:selectedClient.statut==='actif'?G:selectedClient.statut==='prospect'?AM:'#888'}}>
                    {selectedClient.statut==='actif'?'Actif':selectedClient.statut==='prospect'?'Prospect':'Inactif'}
                  </span>
                  {isNouveau(selectedClient.derniereActivite)&&<span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:6,background:'#eff6ff',color:'#2563eb',border:'1px solid #bfdbfe'}}>NOUVEAU</span>}
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

              {/* Coordonnées */}
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:10}}>Coordonnées</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {[
                    {label:'Email',val:<a href={`mailto:${selectedClient.email}`} style={{color:'#2563eb',textDecoration:'none'}}>{selectedClient.email}</a>},
                    {label:'Téléphone',val:<a href={`tel:${(selectedClient.tel||'').replace(/\s/g,'')}`} style={{color:'#2563eb',textDecoration:'none'}}>{selectedClient.tel}</a>},
                    {label:'Adresse fact.',val:`${selectedClient.adresseFactLine1||''} ${selectedClient.adresseFactCp||''} ${selectedClient.adresseFactVille||''}`},
                    {label:'Chantier',val:(
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <span>{selectedClient.adresseChantierLine1||''} {selectedClient.adresseChantierCp||''} {selectedClient.adresseChantierVille||''}</span>
                        {selectedClient.adresseChantierVille&&(
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((selectedClient.adresseChantierLine1||'')+' '+(selectedClient.adresseChantierCp||'')+' '+(selectedClient.adresseChantierVille||''))}`}
                            target="_blank" rel="noreferrer" style={{fontSize:11,color:'#2563eb',textDecoration:'none'}}>📍 Maps</a>
                        )}
                      </div>
                    )},
                    selectedClient.siret?{label:'SIRET',val:selectedClient.siret}:null,
                    selectedClient.tvaIntra?{label:'TVA intra',val:selectedClient.tvaIntra}:null,
                    selectedClient.enCharge?{label:'En charge',val:selectedClient.enCharge}:null,
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

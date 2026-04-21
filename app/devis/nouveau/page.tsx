'use client'
import { useState, useEffect } from 'react'
import RichTextEditor from '../../components/RichTextEditor'
import { getBiblioOuvrages, getBiblioMats, getBiblioMO } from '../../lib/bibliothequeStore'
import Sidebar from '../../components/Sidebar'
import SearchBar from '../../components/SearchBar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const fmt=(n:number)=>{
  const hasDecimals=Math.abs(n)%1>0.001
  return n.toLocaleString('fr-FR',{minimumFractionDigits:hasDecimals?2:0,maximumFractionDigits:hasDecimals?2:0,useGrouping:true})+' €'
}
const fmtNum=(n:number)=>{
  const hasDecimals=Math.abs(n)%1>0.001
  return n.toLocaleString('fr-FR',{minimumFractionDigits:hasDecimals?2:0,maximumFractionDigits:hasDecimals?2:0,useGrouping:true})
}
const TVA_OPTIONS=['0%','5.5%','10%','20%']
const UNITES=['u','ens','m²','ml','m³','h','Fft','Forf','Mois','kg','L']

type LigneType='materiau'|'mo'|'ouvrage'|'categorie'|'sous-categorie'|'note'|'saut-page'
type LigneOuvrage={id:string;nom:string;qte:number;pu:number;unite:string;tva:string}
type Ligne={
  id:string;type:LigneType
  designation?:string;description?:string;unite?:string;qte?:number;pu?:number;tva?:string
  lignesInternes?:LigneOuvrage[];prixManuel?:boolean;prixForce?:number
  titre?:string;collapsed?:boolean;texte?:string
}
type Client={nom:string;adresse:string;email:string;tel:string;siret?:string}

const clientsExistants:Client[]=[
  {nom:'Jean Dupont — Dupont Immobilier SAS',adresse:'45 avenue des Champs, 75008 Paris',email:'j.dupont@immobilier.fr',tel:'06 12 34 56 78',siret:'85357201400012'},
  {nom:'Sophie Martin',adresse:'8 rue des Lilas, 92400 Courbevoie',email:'s.martin@gmail.com',tel:'07 23 45 67 89'},
  {nom:'Karim Mansouri — Mansouri Promotion SARL',adresse:'22 boulevard Haussmann, 75009 Paris',email:'k.mansouri@promoteur.fr',tel:'06 34 56 78 90'},
]
const biblioMats=[
  {id:'m1',nom:'Parquet chêne massif 12mm',unite:'m²',pu:28,tva:'10%'},
  {id:'m2',nom:'Carrelage 60x60 grès cérame',unite:'m²',pu:32,tva:'20%'},
  {id:'m3',nom:'Peinture murale mate',unite:'m²',pu:4,tva:'10%'},
  {id:'m4',nom:'Tableau électrique 13 disjoncteurs',unite:'u',pu:180,tva:'20%'},
]
const biblioMO=[
  {id:'mo1',nom:'Pose parquet',unite:'m²',pu:15,tva:'10%'},
  {id:'mo2',nom:'Électricien qualifié',unite:'h',pu:45,tva:'20%'},
  {id:'mo3',nom:'Plombier qualifié',unite:'h',pu:48,tva:'20%'},
]
const biblioOuvrages=[
  {id:'o1',nom:'Pose parquet complet',pu:103,unite:'m²',tva:'10%',lignesInternes:[{id:'l1',nom:'Parquet chêne massif 12mm',qte:1,pu:28,unite:'m²',tva:'10%'},{id:'l2',nom:'Pose parquet',qte:1,pu:15,unite:'m²',tva:'10%'}]},
  {id:'o2',nom:'Installation tableau électrique',pu:850,unite:'u',tva:'20%',lignesInternes:[{id:'l3',nom:'Tableau 13 disjoncteurs',qte:1,pu:180,unite:'u',tva:'20%'},{id:'l4',nom:'Électricien qualifié',qte:4,pu:45,unite:'h',tva:'20%'}]},
]
const genId=()=>Math.random().toString(36).slice(2,8)


// Composant modal édition client
function EditClientModal({client,onSave,onClose,G,BD}:{client:any,onSave:(c:any)=>void,onClose:()=>void,G:string,BD:string}){
  const isPro = client.nom.includes('—') || client.raisonSociale
  const[type,setType]=useState<'particulier'|'pro'>(isPro?'pro':'particulier')
  const[statut,setStatut]=useState<string>(client.statut||'actif')
  const[civilite,setCivilite]=useState<string>(client.civilite||'M.')
  const[prenom,setPrenom]=useState<string>(client.prenom||client.nom.split(' ')[0]||'')
  const[nom,setNom]=useState<string>(client.nomFamille||client.nom.split(' ').slice(1).join(' ')||client.nom.split('—')[0].trim()||'')
  const[email,setEmail]=useState(client.email||'')
  const[tel,setTel]=useState(client.tel||'')
  const[adresse,setAdresse]=useState(client.adresse||'')
  const[cp,setCp]=useState(client.cp||'')
  const[ville,setVille]=useState(client.ville||'')
  const[pays,setPays]=useState(client.pays||'France')
  const[adresseChantier,setAdresseChantier]=useState(client.adresseChantier||'')
  const[cpChantier,setCpChantier]=useState(client.cpChantier||'')
  const[villeChantier,setVilleChantier]=useState(client.villeChantier||'')
  const[raisonSociale,setRaisonSociale]=useState(client.raisonSociale||client.nom.split('—')[1]?.trim()||'')
  const[formeJuridique,setFormeJuridique]=useState(client.formeJuridique||'')
  const[siren,setSiren]=useState(client.siren||'')
  const[siret,setSiret]=useState(client.siret||'')
  const[tvaIntra,setTvaIntra]=useState(client.tvaIntra||'')
  const[nomContact,setNomContact]=useState(client.nomContact||'')
  const[poste,setPoste]=useState(client.poste||'')
  const[adresseIdentique,setAdresseIdentique]=useState(client.adresseIdentique!==false)

  const Field=({label,value,onChange,placeholder,type:ftype='text',required=false}:{label:string,value:string,onChange:(v:string)=>void,placeholder?:string,type?:string,required?:boolean})=>(
    <div style={{marginBottom:12}}>
      <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>{label}{required&&' *'}</label>
      <input type={ftype} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
    </div>
  )

  const handleSave=()=>{
    const nomComplet = type==='pro'
      ? (nomContact?nomContact+' — ':'')+raisonSociale
      : civilite+' '+prenom+' '+nom
    onSave({
      ...client,
      nom:nomComplet.trim(),
      email,tel,
      adresse:[adresse,cp,ville].filter(Boolean).join(', '),
      siret,raisonSociale,formeJuridique,siren,tvaIntra,nomContact,poste,
      cp,ville,pays,adresseChantier,cpChantier,villeChantier,
      statut,civilite,prenom,nomFamille:nom,type,adresseIdentique
    })
    onClose()
  }

  return(
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,maxWidth:540,width:'94%',maxHeight:'88vh',display:'flex',flexDirection:'column' as const}}>
        <div style={{padding:'20px 24px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Modifier le client</div>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
        </div>
        <div style={{padding:'20px 24px',overflowY:'auto' as const,flex:1}}>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Type de client</label>
            <div style={{display:'flex',gap:8}}>
              {(['particulier','pro'] as const).map(v=>(
                <button key={v} onClick={()=>setType(v)}
                  style={{flex:1,padding:'8px',border:`1px solid ${type===v?G:BD}`,borderRadius:8,background:type===v?`${G}10`:'#fff',fontSize:13,fontWeight:type===v?600:400,color:type===v?G:'#555',cursor:'pointer'}}>
                  {v==='particulier'?'👤 Particulier':'🏢 Pro'}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Statut</label>
            <div style={{display:'flex',gap:8}}>
              {[['actif','✅ Actif'],['prospect','🔍 Prospect'],['inactif','⏸ Inactif']].map(([v,l])=>(
                <button key={v} onClick={()=>setStatut(v)}
                  style={{flex:1,padding:'7px',border:`1px solid ${statut===v?G:BD}`,borderRadius:8,background:statut===v?`${G}10`:'#fff',fontSize:12,fontWeight:statut===v?600:400,color:statut===v?G:'#555',cursor:'pointer'}}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          {type==='pro'&&(<>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations entreprise</div>
            <Field label="Raison sociale" value={raisonSociale} onChange={setRaisonSociale} required/>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:4}}>Forme juridique</label>
              <select value={formeJuridique} onChange={e=>setFormeJuridique(e.target.value)}
                style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff'}}>
                <option value="">Choisir...</option>
                {['SAS','SARL','SCI','SAS','SASU','EURL','SA','Auto-entrepreneur','EI','Autre'].map(f=><option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <Field label="SIREN" value={siren} onChange={setSiren}/>
              <Field label="SIRET" value={siret} onChange={setSiret}/>
            </div>
            <Field label="N° TVA intracommunautaire" value={tvaIntra} onChange={setTvaIntra}/>
            <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Contact principal</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
              <Field label="Nom du contact" value={nomContact} onChange={setNomContact}/>
              <Field label="Poste" value={poste} onChange={setPoste}/>
            </div>
          </>)}
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Informations personnelles</div>
          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,fontWeight:600,color:'#555',display:'block',marginBottom:6}}>Civilité</label>
            <div style={{display:'flex',gap:6}}>
              {['M.','Mme','Dr','Me'].map(cv=>(
                <button key={cv} onClick={()=>setCivilite(cv)}
                  style={{padding:'6px 12px',border:`1px solid ${civilite===cv?G:BD}`,borderRadius:6,background:civilite===cv?`${G}10`:'#fff',fontSize:12,fontWeight:civilite===cv?600:400,color:civilite===cv?G:'#555',cursor:'pointer'}}>
                  {cv}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:0}}>
            <Field label="Prénom" value={prenom} onChange={setPrenom} required/>
            <Field label="Nom" value={nom} onChange={setNom} required/>
          </div>
          <Field label="Email" value={email} onChange={setEmail} type="email"/>
          <Field label="Téléphone" value={tel} onChange={setTel}/>
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Adresse de facturation</div>
          <Field label="Adresse" value={adresse} onChange={setAdresse}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12,marginBottom:0}}>
            <Field label="Code postal" value={cp} onChange={setCp}/>
            <Field label="Ville" value={ville} onChange={setVille}/>
          </div>
          <Field label="Pays" value={pays} onChange={setPays}/>
          <div style={{fontSize:13,fontWeight:700,color:'#333',marginBottom:12,paddingBottom:6,borderBottom:`1px solid ${BD}`}}>Adresse chantier</div>
          {type==='pro'&&(
            <label style={{display:'flex',alignItems:'center',gap:8,marginBottom:12,cursor:'pointer',fontSize:13,color:'#555'}}>
              <input type="checkbox" checked={adresseIdentique} onChange={e=>setAdresseIdentique(e.target.checked)} style={{accentColor:G}}/>
              Identique à l'adresse de facturation
            </label>
          )}
          {(!adresseIdentique||type==='particulier')&&(<>
            <Field label="Adresse chantier" value={adresseChantier} onChange={setAdresseChantier}/>
            <div style={{display:'grid',gridTemplateColumns:'1fr 2fr',gap:12,marginBottom:0}}>
              <Field label="Code postal" value={cpChantier} onChange={setCpChantier}/>
              <Field label="Ville chantier" value={villeChantier} onChange={setVilleChantier}/>
            </div>
          </>)}
        </div>
        <div style={{padding:'16px 24px',borderTop:`1px solid ${BD}`,display:'flex',gap:10,flexShrink:0}}>
          <button onClick={onClose} style={{flex:1,padding:'10px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555',fontWeight:500}}>Annuler</button>
          <button onClick={handleSave} style={{flex:2,padding:'10px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>✔ Enregistrer</button>
        </div>
      </div>
    </div>
  )
}

export default function NouveauDevisPage(){
  const[params,setParams]=useState<any>({})
  const[logoPreview,setLogoPreview]=useState<string|null>(null)
  useEffect(()=>{
    const loadBiblio=()=>{
      setBiblioOuvrages(getBiblioOuvrages())
      setBiblioMats(getBiblioMats())
      setBiblioMO(getBiblioMO())
    }
    loadBiblio()
    window.addEventListener('batizo_biblio_updated',loadBiblio)
    try{
      const p=localStorage.getItem('batizo_params')
      if(p){
        const parsed=JSON.parse(p)
        setParams(parsed)
        if(parsed.validiteDevis) setValidite(parsed.validiteDevis+' jours')
        if(parsed.condPaiement) setCondPaiement(parsed.condPaiement)
        if(parsed.noteDevis) setNotes(parsed.noteDevis)
        if(parsed.introDevis) setIntroTexte(parsed.introDevis)
      }
      const logo=localStorage.getItem('batizo_logo')
      if(logo) setLogoPreview(logo)
    }catch(e){}
    return()=>window.removeEventListener('batizo_biblio_updated',loadBiblio)
  },[])
  const[lignes,setLignes]=useState<Ligne[]>([])
  const[client,setClient]=useState<Client|null>(null)
  const[clientSearch,setClientSearch]=useState('')
  const[showClientDD,setShowClientDD]=useState(false)
  const[titre,setTitre]=useState('')
  const[adresseProjet,setAdresseProjet]=useState('')
  const[dateDevis,setDateDevis]=useState(new Date().toISOString().split('T')[0])
  const[validite,setValidite]=useState('')
  const[remise,setRemise]=useState(0)
  const[remisePct,setRemisePct]=useState(false)
  const[acompte,setAcompte]=useState(0)
  const[acomptePct,setAcomptePct]=useState(true)
  const[primeCEE,setPrimeCEE]=useState(0)
  const[primeCEELabel,setPrimeCEELabel]=useState('')
  const[condPaiement,setCondPaiement]=useState('Paiement par chèque ou virement bancaire')
  const[notes,setNotes]=useState('')
  const[introTexte,setIntroTexte]=useState('')
  const[statut,setStatut]=useState<'brouillon'|'en_attente'|'finalise'|'signe'|'refuse'>('brouillon')
  const[showBiblio,setShowBiblio]=useState<'materiau'|'mo'|'ouvrage'|null>(null)
  const[insertAtIdx,setInsertAtIdx]=useState<number|null>(null)
  // Bas du devis
  const[moyens,setMoyens]=useState({especes:false,cheque:true,virement:true,carte:false})
  const[showMoyensPopover,setShowMoyensPopover]=useState(false)
  const[acomptes,setAcomptes]=useState<{id:string,type:string,pct:number}[]>([])
  const[showAcompteMenu,setShowAcompteMenu]=useState(false)
  const[activeAcompte,setActiveAcompte]=useState<string|null>(null)
  const[mentionsLegales,setMentionsLegales]=useState(false)
  const[remises,setRemises]=useState<{id:string,label:string,val:number,isPct:boolean}[]>([])
  const[showRemisePopover,setShowRemisePopover]=useState<string|null>(null)
  const[prime,setPrime]=useState<{label:string,val:number}|null>(null)
  const[showPrimePopover,setShowPrimePopover]=useState(false)
  const[showAcomptePopover,setShowAcomptePopover]=useState<string|null>(null)
  const[showClientMenu,setShowClientMenu]=useState(false)
  const[showClientModal,setShowClientModal]=useState(false)
  const[showEditClientModal,setShowEditClientModal]=useState(false)
  const[editingMeta,setEditingMeta]=useState<string|null>(null)
  const[showValiditePopover,setShowValiditePopover]=useState(false)
  const[showDatePopover,setShowDatePopover]=useState(false)
  const[biblioSearch,setBiblioSearch]=useState('')
  const[biblioOuvrages,setBiblioOuvrages]=useState<any[]>([])
  const[biblioMats,setBiblioMats]=useState<any[]>([])
  const[biblioMO,setBiblioMO]=useState<any[]>([])
  const[showFactureMenu,setShowFactureMenu]=useState(false)
  const[showFactureModal,setShowFactureModal]=useState<'acompte'|'intermediaire'|'solde'|null>(null)
  const[factureAmount,setFactureAmount]=useState('')
  const[facturePct,setFacturePct]=useState(true)
  const[showSaved,setShowSaved]=useState(false)
  const[generatingPdf,setGeneratingPdf]=useState(false)
  const[showHeaderInfo,setShowHeaderInfo]=useState(false)
  const[ouvrageExpanded,setOuvrageExpanded]=useState<Record<string,boolean>>({})
  const[editingCell,setEditingCell]=useState<{id:string,field:string}|null>(null)
  const[selectedLigne,setSelectedLigne]=useState<string|null>(null)
  const[hoverLigne,setHoverLigne]=useState<string|null>(null)
  const[showContextMenu,setShowContextMenu]=useState<string|null>(null)
  const[showEditOuvrage,setShowEditOuvrage]=useState<Ligne|null>(null)
  const[showInsertMenu,setShowInsertMenu]=useState<string|null>(null)
  const[showDeleteConfirm,setShowDeleteConfirm]=useState<string|null>(null)
  const[editOuvrageForm,setEditOuvrageForm]=useState<any>({})
  const isEditing=(id:string,field:string)=>editingCell?.id===id&&editingCell?.field===field
  const[editMode,setEditMode]=useState(false)
  const[snapshot,setSnapshot]=useState<any>(null)
  const[adresseMode,setAdresseMode]=useState<'hidden'|'client'|'manuel'|null>(null)
  const[showAdresseMenu,setShowAdresseMenu]=useState(false)
  const[numeroDevis,setNumeroDevis]=useState<string|null>(null)
  const[showNumeroModal,setShowNumeroModal]=useState(false)

  const annulerModifications=()=>{
    if(!snapshot)return
    setLignes(snapshot.lignes);setClient(snapshot.client);setTitre(snapshot.titre)
    setAdresseProjet(snapshot.adresseProjet);setAdresseMode(snapshot.adresseMode)
    setDateDevis(snapshot.dateDevis);setValidite(snapshot.validite)
    setRemise(snapshot.remise);setRemisePct(snapshot.remisePct)
    setAcompte(snapshot.acompte);setAcomptePct(snapshot.acomptePct)
    setPrimeCEE(snapshot.primeCEE);setPrimeCEELabel(snapshot.primeCEELabel)
    setCondPaiement(snapshot.condPaiement);setNotes(snapshot.notes)
    setStatut(snapshot.statut)
    setEditMode(false);setSnapshot(null)
  }

  const calcLigneHT=(l:Ligne)=>{
    if(l.type==='ouvrage'){
      if(l.prixManuel&&l.prixForce!=null) return (l.qte||1)*l.prixForce
      return (l.lignesInternes||[]).reduce((s,li)=>s+li.qte*li.pu,0)*(l.qte||1)
    }
    if(['materiau','mo'].includes(l.type)) return (l.qte||0)*(l.pu||0)
    return 0
  }
  const calcLigneTVA=(l:Ligne)=>{
    const taux=parseFloat((l.tva||'0%').replace('%',''))/100
    return calcLigneHT(l)*taux
  }
  const totalHT=lignes.reduce((s,l)=>s+calcLigneHT(l),0)
  const totalTVA=lignes.reduce((s,l)=>s+calcLigneTVA(l),0)
  const totalTTC=totalHT+totalTVA
  const remiseMt=remisePct?(totalHT*remise/100):remise
  const acompteMt=acomptePct?(totalTTC*acompte/100):acompte
  const netAPayer=totalTTC-remiseMt-primeCEE
  
  // Calculs bas de devis
  const totalRemises=remises.reduce((s,r)=>s+(r.isPct?totalHT*r.val/100:r.val),0)
  const totalHTapresRemises=totalHT-totalRemises
  const totalPrime=prime?prime.val:0
  // TVA ventilée par taux
  const tvaVentilee=lignes.reduce((acc,l)=>{
    const ht=calcLigneHT(l)
    if(ht===0) return acc
    const taux=parseFloat((l.tva||'0%').replace('%',''))
    if(taux===0) return acc
    const tauxKey=taux.toString()
    const remisePct=totalHT>0?totalRemises/totalHT:0
    const htNet=ht*(1-remisePct)
    const tvaAmt=htNet*taux/100
    acc[tauxKey]=(acc[tauxKey]||0)+tvaAmt
    return acc
  },{} as Record<string,number>)
  const totalTVAVentilee=Object.values(tvaVentilee).reduce((s,v)=>s+v,0)
  const totalTTCFinal=totalHTapresRemises+totalTVAVentilee
  const resteAPayer=totalTTCFinal-totalPrime
  
  // Moyens de paiement texte
  const getMoyensTexte=()=>{
    const m=[]
    if(moyens.especes) m.push('espèces')
    if(moyens.cheque) m.push('chèque')
    if(moyens.virement) m.push('virement bancaire')
    if(moyens.carte) m.push('carte bleue')
    if(m.length===0) return ''
    if(m.length===1) return `Paiement par ${m[0]}.`
    const last=m.pop()
    return `Paiement par ${m.join(', ')} ou par ${last}.`
  }
  
  const ACOMPTE_TYPES=[
    {id:'signature',label:'Acompte à la signature de'},
    {id:'intermediaire',label:'Versement intermédiaire de'},
    {id:'solde',label:'Solde à réception de chantier'},
  ]

  const addLigne=(type:LigneType,data?:any,atIdx?:number)=>{
    const base:Ligne={id:genId(),type}
    const insertAt=(lines:Ligne[])=>atIdx!=null?[...lines.slice(0,atIdx),...[base],...lines.slice(atIdx)]:lines
    if(type==='materiau'){
      setEditMode(true)
      const mat:Ligne={...base,designation:data?.nom||'',description:data?.description||'',unite:data?.unite||'u',qte:1,pu:data?.prixFacture||data?.pu||0,tva:data?.tva||'20%'}
      setLignes(p=>atIdx!=null?[...p.slice(0,atIdx),mat,...p.slice(atIdx)]:[...p,mat])
    } else if(type==='mo'){
      setEditMode(true)
      const mo:Ligne={...base,designation:data?.nom||'',description:data?.description||'',unite:data?.unite||'h',qte:1,pu:data?.prixFacture||data?.pu||0,tva:data?.tva||'20%'}
      setLignes(p=>atIdx!=null?[...p.slice(0,atIdx),mo,...p.slice(atIdx)]:[...p,mo])
    } else if(type==='ouvrage'&&data?.lignes?.length>0){
      // Aplatir : ouvrage + ses composants comme lignes individuelles
      const ouvrLigne:Ligne={...base,type:'ouvrage',designation:data.nom,description:data.description||'',unite:data.unite||'u',qte:1,pu:data.prixFacture||0,tva:data.tva||'20%',lignesInternes:[],prixManuel:true,prixForce:data.prixFacture||0}
      const composants:Ligne[]=data.lignes.map((li:any)=>({
        id:genId(),
        type:li.type==='mo'?'mo' as LigneType:'materiau' as LigneType,
        designation:li.nom,
        description:li.description||'',
        unite:li.unite||'u',
        qte:li.qte||1,
        pu:li.pu||0,
        tva:li.tva||'20%',
      }))
      setLignes(p=>atIdx!=null?[...p.slice(0,atIdx),ouvrLigne,...composants,...p.slice(atIdx)]:[...p,ouvrLigne,...composants])
    } else if(type==='ouvrage'){
      // Ouvrage vide (création directe sur le devis)
      setLignes(p=>atIdx!=null?[...p.slice(0,atIdx),{...base,designation:'Nouvel ouvrage',description:'',unite:'',qte:1,pu:0,tva:'20%',lignesInternes:[],prixManuel:false},...p.slice(atIdx)]:[...p,{...base,designation:'Nouvel ouvrage',description:'',unite:'',qte:1,pu:0,tva:'20%',lignesInternes:[],prixManuel:false}])
    } else if(type==='categorie'||type==='sous-categorie'){
      setLignes(p=>[...p,{...base,titre:'Nouvelle catégorie'}])
    } else if(type==='note'){
      setLignes(p=>[...p,{...base,texte:''}])
    } else {
      setLignes(p=>[...p,{...base}])
    }
    setShowBiblio(null)
    setBiblioSearch('')
  }

  const updateLigne=(id:string,field:string,val:any)=>{if(!editMode)return;setLignes(p=>p.map(l=>l.id===id?{...l,[field]:val}:l))}
  const deleteLigne=(id:string)=>{if(!editMode)return;setLignes(p=>p.filter(l=>l.id!==id))}
  const getBloc=(arr:Ligne[],idx:number):number[]=>{
    // Retourne les indices du bloc (ligne + ses enfants pour cat/sous-cat)
    const l=arr[idx]
    const indices=[idx]
    if(l.type==='categorie'||l.type==='sous-categorie'){
      const isCat=l.type==='categorie'
      for(let i=idx+1;i<arr.length;i++){
        if(arr[i].type==='categorie') break
        if(isCat&&arr[i].type==='sous-categorie'){indices.push(i);continue}
        if(!isCat&&arr[i].type==='sous-categorie') break
        indices.push(i)
      }
    }
    return indices
  }

  const moveLigne=(id:string,dir:'up'|'down')=>{
    setLignes(p=>{
      const idx=p.findIndex(l=>l.id===id)
      if(idx===-1) return p
      const arr=[...p]
      const bloc=getBloc(arr,idx)
      const blocSize=bloc.length
      
      if(dir==='up'){
        if(idx===0) return p
        // Trouver le début du bloc précédent
        const prevIdx=idx-1
        const prevBlocStart=getBloc(arr,prevIdx)[0]
        // Déplacer le bloc avant le bloc précédent
        const extracted=arr.splice(idx,blocSize)
        arr.splice(prevBlocStart,0,...extracted)
      } else {
        if(idx+blocSize>=arr.length) return p
        // Trouver la fin du bloc suivant
        const nextIdx=idx+blocSize
        const nextBloc=getBloc(arr,nextIdx)
        const nextBlocEnd=nextIdx+nextBloc.length
        // Déplacer le bloc après le bloc suivant
        const extracted=arr.splice(idx,blocSize)
        arr.splice(nextBlocEnd-blocSize,0,...extracted)
      }
      return arr
    })
  }

  const duplicateLigne=(id:string)=>{
    setLignes(p=>{
      const idx=p.findIndex(l=>l.id===id)
      if(idx===-1) return p
      const l=p[idx]
      // Dupliquer uniquement la ligne, sans ses enfants
      const copy:Ligne={...l,id:genId()}
      const arr=[...p]
      arr.splice(idx+1,0,copy)
      return arr
    })
  }

  const deleteBlocLigne=(id:string)=>{
    setLignes(p=>{
      const idx=p.findIndex(l=>l.id===id)
      if(idx===-1) return p
      const arr=[...p]
      const bloc=getBloc(arr,idx)
      arr.splice(idx,bloc.length)
      return arr
    })
  }

  const getSousTotal=(catIdx:number)=>{
    let total=0
    const isCat=lignes[catIdx]?.type==='categorie'
    for(let i=catIdx+1;i<lignes.length;i++){
      const t=lignes[i].type
      // Arrêter à la prochaine catégorie du même niveau ou supérieur
      if(t==='categorie') break
      // Pour une sous-catégorie, arrêter à la prochaine sous-catégorie (pas à la catégorie)
      if(!isCat&&t==='sous-categorie') break
      // Additionner uniquement les lignes avec un montant
      total+=calcLigneHT(lignes[i])
    }
    return total
  }

  const statutColors:Record<string,{bg:string,color:string}>={
    brouillon:{bg:'#f9fafb',color:'#888'},en_attente:{bg:'#fffbeb',color:AM},
    finalise:{bg:'#eff6ff',color:'#2563eb'},signe:{bg:'#f0fdf4',color:G},refuse:{bg:'#fef2f2',color:'#D32F2F'}
  }
  const statutLabels:Record<string,string>={brouillon:'Brouillon',en_attente:'En attente',finalise:'Finalisé',signe:'Signé',refuse:'Refusé'}

  // Calcul numérotation hiérarchique
  const getNumero=(lignes:Ligne[],idx:number)=>{
    let cat=0,sub=0,line=0,lastCat=0,lastSub=0
    for(let i=0;i<=idx;i++){
      const l=lignes[i]
      if(l.type==='categorie'){
        cat++;sub=0;line=0;lastCat=cat;lastSub=0
      } else if(l.type==='sous-categorie'){
        sub++;line=0;lastSub=sub
      } else if(['materiau','mo','ouvrage'].includes(l.type)){
        line++
      }
    }
    const l=lignes[idx]
    if(l.type==='categorie') return `${cat}`
    if(l.type==='sous-categorie') return `${lastCat}.${sub}`
    if(['materiau','mo','ouvrage'].includes(l.type)){
      if(lastSub>0) return `${lastCat}.${lastSub}.${line}`
      if(lastCat>0) return `${lastCat}.${line}`
      return `${line}`
    }
    return ''
  }

  const renderLigne=(l:Ligne,idx:number):any=>{
    const ht=calcLigneHT(l)
    const isOuvrage=l.type==='ouvrage'
    const expanded=ouvrageExpanded[l.id]!==false

    if(l.type==='saut-page') return(
      <tr key={l.id}>
        <td colSpan={8} style={{padding:'4px 0'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,padding:'6px 10px',border:'1px dashed #d1d5db',borderRadius:6,background:'#fafafa'}}>
            <span style={{fontSize:11,color:'#aaa',fontWeight:600,letterSpacing:'0.05em'}}>— SAUT DE PAGE —</span>
            <button onClick={()=>deleteLigne(l.id)} style={{marginLeft:'auto',background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:16}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>
          </div>
        </td>
      </tr>
    )

    if(l.type==='note') return(
      <tr key={l.id} style={{background:'#fff'}}>
        <td colSpan={8} style={{padding:'6px 8px'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
            <RichTextEditor value={l.texte||''} onChange={v=>updateLigne(l.id,'texte',v)} readOnly={!editMode}
              placeholder="Note ou commentaire..."
              defaultFont={params.police||'system-ui'}
              style={{padding:'4px 8px',fontSize:13,color:'#555',fontStyle:'italic',flex:1}}/>

          </div>
        </td>
      </tr>
    )

    if(l.type==='categorie'||l.type==='sous-categorie'){
      const st=getSousTotal(idx)
      const isSub=l.type==='sous-categorie'
      const col=params.couleurPrincipale||G
      return(
        <>
        {idx>0&&(
          <tr style={{background:'#fff'}}>
            <td style={{height:isSub?12:32,width:60,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:90,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:85,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:65,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:95,padding:0}}></td>
            <td style={{width:40,padding:0}}></td>
          </tr>
        )}
        <tr key={l.id} style={{background:selectedLigne===l.id&&editMode?'#fff3e0':isSub?col+'22':col+'44',cursor:editMode?'pointer':'default'}}
          onClick={()=>editMode&&setSelectedLigne(selectedLigne===l.id?null:l.id)}>
          <td style={{padding:'6px 16px',width:60,background:'transparent',verticalAlign:'top' as const}}>
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              {editMode&&<button onClick={()=>updateLigne(l.id,'collapsed',!l.collapsed)} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#888',padding:0}}>{l.collapsed?'▶':'▼'}</button>}
              <span style={{fontSize:14,fontWeight:400,color:'#333',fontFamily:'system-ui'}}>{getNumero(lignes,idx)}</span>
            </div>
          </td>
          <td colSpan={3} style={{padding:'6px 16px',background:'transparent'}}>
            <input value={l.titre||''} onChange={e=>updateLigne(l.id,'titre',e.target.value)}
              readOnly={!editMode}
              style={{width:'100%',border:'none',background:'transparent',fontSize:18,fontWeight:400,color:'#333',outline:'none',fontFamily:'system-ui'}}
              placeholder={isSub?'Sous-catégorie':'Catégorie'}/>
          </td>
          <td style={{padding:'6px 16px',background:'transparent'}}></td>
          <td style={{padding:'6px 16px',textAlign:'left' as const,background:'transparent'}}>
            <span style={{fontSize:14,fontWeight:500,color:'#333'}}>{fmt(st)}</span>

          </td>
          <td style={{background:'transparent',width:40,padding:'4px 4px',position:'relative' as const}} onClick={e=>e.stopPropagation()}>
            {selectedLigne===l.id&&editMode&&(
              <div style={{display:'flex',alignItems:'center',gap:2}}>
                <div style={{display:'flex',flexDirection:'column' as const,gap:0}}>
                  <button onClick={e=>{e.stopPropagation();moveLigne(l.id,'up')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:11,padding:'1px 3px',lineHeight:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#333'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>↑</button>
                  <button onClick={e=>{e.stopPropagation();moveLigne(l.id,'down')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:11,padding:'1px 3px',lineHeight:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#333'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>↓</button>
                </div>
                <div style={{position:'relative' as const}}>
                  <button onClick={e=>{e.stopPropagation();setShowContextMenu(showContextMenu===l.id?null:l.id)}}
                    style={{background:'#f3f4f6',border:'1px solid #e5e7eb',cursor:'pointer',fontSize:16,color:'#555',padding:'4px 8px',borderRadius:6,lineHeight:1,fontWeight:700}}>≡</button>
                  {showContextMenu===l.id&&(
                    <div style={{position:'fixed' as const,right:40,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.18)',zIndex:1000,minWidth:220}}>
                      <div onClick={()=>{duplicateLigne(l.id);setShowContextMenu(null)}}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>📋 Dupliquer la ligne</div>
                      <div style={{position:'relative' as const,borderTop:'1px solid #f3f4f6'}}>
                        <div onClick={()=>setShowInsertMenu(showInsertMenu===l.id?null:l.id)}
                          style={{padding:'9px 14px',fontSize:13,cursor:'pointer',display:'flex',justifyContent:'space-between',color:'#333'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                          ➕ Insérer une ligne au-dessus <span style={{fontSize:10}}>›</span>
                        </div>
                        {showInsertMenu===l.id&&(
                          <div style={{position:'absolute' as const,right:'100%',top:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',minWidth:190,zIndex:1001}}>
                            {[{label:'Nouvelle catégorie',type:'categorie' as const,icon:'📁'},{label:'Matériau...',type:'materiau' as const,icon:'🧱'},{label:"Main d'œuvre...",type:'mo' as const,icon:'👷'},{label:'Ouvrage...',type:'ouvrage' as const,icon:'🔨'},{label:'Nouvelle note',type:'note' as const,icon:'📝'}].map(item=>(
                              <div key={item.type} onClick={()=>{
                                const insertIdx=lignes.findIndex(x=>x.id===l.id)
                                setShowContextMenu(null);setShowInsertMenu(null)
                                if(item.type==='materiau'||item.type==='mo'||item.type==='ouvrage'){
                                  // Stocker l'index d'insertion et ouvrir la biblio
                                  setInsertAtIdx(insertIdx)
                                  setShowBiblio(item.type)
                                } else {
                                  const newL:Ligne={id:genId(),type:item.type,...(item.type==='categorie'?{titre:''}:{designation:'',description:'',unite:'u',qte:1,pu:0,tva:'20%'})}
                                  setLignes(p=>[...p.slice(0,insertIdx),newL,...p.slice(insertIdx)])
                                }
                              }}
                                style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333',display:'flex',gap:8}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                <span>{item.icon}</span>{item.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div onClick={()=>{const idx=lignes.findIndex(x=>x.id===l.id);setLignes(p=>[...p.slice(0,idx),{id:genId(),type:'saut-page' as const},...p.slice(idx)]);setShowContextMenu(null)}}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333',borderTop:'1px solid #f3f4f6'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>📄 Insérer un saut de page</div>
                      <div onClick={()=>{setShowDeleteConfirm(l.id);setShowContextMenu(null)}}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:RD,borderTop:'1px solid #f3f4f6'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#fef2f2'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>🗑 Retirer cette ligne</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
        </>
      )
    }

    return(
      <>
        {idx>0&&(
          <tr style={{background:'#fff'}}>
            <td style={{height:16,width:60,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:90,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:85,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:65,borderRight:'1px solid #d0d0d0',padding:0}}></td>
            <td style={{width:95,padding:0}}></td>
            <td style={{width:40,padding:0}}></td>
          </tr>
        )}
        <tr key={l.id}
          style={{background:selectedLigne===l.id&&editMode?'#fff3e0':'#fff',transition:'background 0.1s'}}
          onMouseEnter={()=>editMode&&setHoverLigne(l.id)}
          onMouseLeave={()=>setHoverLigne(null)}>
          <td style={{padding:'8px 12px',width:60,textAlign:'left' as const,borderRight:'1px solid #d0d0d0',verticalAlign:'top' as const}}><span style={{fontSize:13,color:'#666',fontWeight:400,fontFamily:'system-ui'}}>{getNumero(lignes,idx)}</span></td>
          <td style={{padding:'8px 12px',borderRight:'1px solid #d0d0d0',verticalAlign:'top' as const}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>

                  <RichTextEditor value={l.designation||''} onChange={v=>updateLigne(l.id,'designation',v)} readOnly={!editMode}
                    placeholder="Désignation..." singleLine
                    defaultFont={params.police||'system-ui'}
                    style={{fontSize:14,fontWeight:500,color:'#333'}}/>
                </div>
                <div style={{marginTop:2}}>
                  <RichTextEditor value={l.description||''} onChange={v=>updateLigne(l.id,'description',v)} readOnly={!editMode}
                    placeholder="Description optionnelle..." singleLine
                    defaultFont={params.police||'system-ui'}
                    style={{fontSize:12,color:'#555'}}/>
                </div>
                {selectedLigne===l.id&&editMode&&(
                  <div style={{marginTop:4}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setShowEditOuvrage(l)}
                      style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#2563eb',padding:0,textDecoration:'underline'}}>
                      ✏ éditer le contenu de l'ouvrage...
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
          {/* QTÉ + UNITÉ */}
          <td style={{padding:'8px 12px',width:70,borderRight:'1px solid #d0d0d0',background:editMode&&hoverLigne===l.id&&selectedLigne!==l.id?'#fffbeb':selectedLigne===l.id&&editMode?'#fff3e0':'transparent',cursor:editMode?'pointer':'default',verticalAlign:'top' as const}}
            onClick={e=>{e.stopPropagation();editMode&&setEditingCell({id:l.id,field:'qte'})}}>
            {editMode&&isEditing(l.id,'qte')?(
              <div style={{display:'flex',alignItems:'center',gap:3}}>
                <input type="number" autoFocus value={l.qte||0} min={0} step={0.5}
                  onChange={e=>updateLigne(l.id,'qte',parseFloat(e.target.value)||0)}
                  onBlur={()=>setEditingCell(null)}
                  style={{width:42,border:'none',background:'transparent',fontSize:13,padding:'2px 0',outline:'none',textAlign:'right' as const,color:'#111',fontWeight:500}}/>
                <select value={l.unite||''} onChange={e=>updateLigne(l.id,'unite',e.target.value)}
                  style={{border:'none',background:'transparent',fontSize:11,outline:'none',color:'#666',cursor:'pointer',padding:0}}>
                  <option value="">-</option>
                  {UNITES.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            ):(
              <div style={{fontSize:14,color:'#333',textAlign:'left' as const,fontWeight:400}}>
                {l.qte||0} <span style={{fontSize:14,color:'#666'}}>{l.unite||''}</span>
              </div>
            )}
          </td>
          {/* PU HT */}
          <td style={{padding:'8px 12px',width:90,borderRight:'1px solid #d0d0d0',background:editMode&&hoverLigne===l.id&&selectedLigne!==l.id?'#fffbeb':selectedLigne===l.id&&editMode?'#fff3e0':'transparent',cursor:editMode?'pointer':'default',verticalAlign:'top' as const}}
            onClick={e=>{e.stopPropagation();editMode&&setEditingCell({id:l.id,field:'pu'})}}>
            {editMode&&isEditing(l.id,'pu')?(
              <div style={{display:'flex',alignItems:'center',gap:2,justifyContent:'flex-end'}}>
                <input type="number" autoFocus value={l.pu||0} min={0}
                  onChange={e=>updateLigne(l.id,'pu',parseFloat(e.target.value)||0)}
                  onBlur={()=>setEditingCell(null)}
                  style={{width:50,border:'none',background:'transparent',fontSize:13,padding:'2px 0',outline:'none',textAlign:'right' as const,color:'#111',fontWeight:500}}/>
                <span style={{fontSize:11,color:'#888'}}>€</span>
              </div>
            ):(
              <div style={{fontSize:14,color:'#333',fontWeight:400,textAlign:'left' as const}}>
                {fmt(l.pu||0)}
              </div>
            )}
          </td>
          {/* TVA */}
          <td style={{padding:'8px 12px',width:70,borderRight:'1px solid #d0d0d0',background:editMode&&hoverLigne===l.id&&selectedLigne!==l.id?'#fffbeb':selectedLigne===l.id&&editMode?'#fff3e0':'transparent',cursor:editMode?'pointer':'default',verticalAlign:'top' as const}}
            onClick={e=>{e.stopPropagation();editMode&&setEditingCell({id:l.id,field:'tva'})}}>
            {editMode&&isEditing(l.id,'tva')?(
              <select autoFocus value={(l.tva||'20%').replace('%',' %')} onChange={e=>{updateLigne(l.id,'tva',e.target.value);setEditingCell(null)}}
                onBlur={()=>setEditingCell(null)}
                style={{border:'none',background:'transparent',fontSize:13,outline:'none',color:'#111',cursor:'pointer',textAlign:'center' as const,width:'100%'}}>
                {TVA_OPTIONS.map(t=><option key={t}>{t}</option>)}
              </select>
            ):(
              <div style={{fontSize:14,color:'#333',fontWeight:400,textAlign:'left' as const}}>
                {l.tva||'20%'}
              </div>
            )}
          </td>
          <td style={{padding:'8px 12px',width:100,textAlign:'left' as const,verticalAlign:'top' as const}}>
            <div style={{fontSize:14,fontWeight:400,color:'#333'}}>{fmt(ht)}</div>
            
          </td>
          <td style={{padding:'4px 4px',width:40,position:'relative' as const,verticalAlign:'top' as const}} onClick={e=>e.stopPropagation()}>
            {selectedLigne===l.id&&editMode&&(
              <div style={{display:'flex',alignItems:'center',gap:2}}>
                <div style={{display:'flex',flexDirection:'column' as const,gap:0}}>
                  <button onClick={e=>{e.stopPropagation();moveLigne(l.id,'up')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:11,padding:'1px 3px',lineHeight:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#333'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>↑</button>
                  <button onClick={e=>{e.stopPropagation();moveLigne(l.id,'down')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:11,padding:'1px 3px',lineHeight:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#333'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>↓</button>
                </div>
                <div style={{position:'relative' as const}}>
                  <button onClick={e=>{e.stopPropagation();setShowContextMenu(showContextMenu===l.id?null:l.id)}}
                    style={{background:'#f3f4f6',border:'1px solid #e5e7eb',cursor:'pointer',fontSize:16,color:'#555',padding:'4px 8px',borderRadius:6,lineHeight:1,fontWeight:700}}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='none'}>≡</button>
                  {showContextMenu===l.id&&(
                    <div style={{position:'fixed' as const,right:40,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.18)',zIndex:1000,minWidth:220,overflow:'visible'}}>
                        {/* 1. Dupliquer */}
                      <div onClick={()=>{duplicateLigne(l.id);setShowContextMenu(null)}}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        📋 Dupliquer la ligne
                      </div>
                      {/* 2. Insérer au-dessus */}
                      <div style={{position:'relative' as const,borderTop:'1px solid #f3f4f6'}}>
                        <div onClick={()=>setShowInsertMenu(showInsertMenu===l.id?null:l.id)}
                          style={{padding:'9px 14px',fontSize:13,cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',color:'#333'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                          ➕ Insérer une ligne au-dessus <span style={{fontSize:10}}>›</span>
                        </div>
                        {showInsertMenu===l.id&&(
                          <div style={{position:'absolute' as const,right:'100%',top:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',minWidth:190,overflow:'hidden'}}>
                            {[
                              {label:'Nouvelle catégorie',type:'categorie' as const,icon:'📁'},
                              {label:'Matériau...',type:'materiau' as const,icon:'🧱'},
                              {label:"Main d'œuvre...",type:'mo' as const,icon:'👷'},
                              {label:'Ouvrage...',type:'ouvrage' as const,icon:'🔨'},
                              {label:'Nouvelle note',type:'note' as const,icon:'📝'},
                            ].map(item=>(
                              <div key={item.type} onClick={()=>{
                                const insertIdx=lignes.findIndex(x=>x.id===l.id)
                                setShowContextMenu(null);setShowInsertMenu(null)
                                if(item.type==='materiau'||item.type==='mo'||item.type==='ouvrage'){
                                  setInsertAtIdx(insertIdx)
                                  setShowBiblio(item.type)
                                } else {
                                  const newL:Ligne={id:genId(),type:item.type,...(item.type==='categorie'?{titre:''}:{designation:'',description:'',unite:'u',qte:1,pu:0,tva:'20%'})}
                                  setLignes(p=>[...p.slice(0,insertIdx),newL,...p.slice(insertIdx)])
                                }
                              }}
                                style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333',display:'flex',gap:8,alignItems:'center'}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                <span>{item.icon}</span>{item.label}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      {/* 3. Saut de page */}
                      <div onClick={()=>{
                        const idx=lignes.findIndex(x=>x.id===l.id)
                        setLignes(p=>[...p.slice(0,idx),{id:genId(),type:'saut-page' as const},...p.slice(idx)])
                        setShowContextMenu(null)
                      }}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333',borderTop:'1px solid #f3f4f6'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        📄 Insérer un saut de page au-dessus
                      </div>
                      {/* 4. Supprimer */}
                      <div onClick={()=>{setShowDeleteConfirm(l.id);setShowContextMenu(null)}}
                        style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:RD,borderTop:'1px solid #f3f4f6'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#fef2f2'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        🗑 Retirer cette ligne
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </td>
        </tr>
        {isOuvrage&&editMode&&(l.lignesInternes||[]).map((li,j)=>(
          <tr key={li.id} style={{background:'#fafafa',borderBottom:`1px solid ${BD}`}}>
            <td style={{padding:'5px 6px',textAlign:'center' as const}}><span style={{fontSize:10,color:'#ccc'}}>{idx+1}.{j+1}</span></td>
            <td style={{padding:'5px 8px',paddingLeft:40}}>
              <input value={li.nom} onChange={e=>updateLigne(l.id,'lignesInternes',(l.lignesInternes||[]).map((x,i)=>i===j?{...x,nom:e.target.value}:x))}
                style={{border:'none',background:'transparent',fontSize:12,color:'#555',outline:'none',width:'100%',fontFamily:'system-ui'}}/>
            </td>
            <td style={{padding:'5px 4px'}}><span style={{fontSize:11,color:'#888'}}>{li.unite}</span></td>
            <td style={{padding:'5px 4px'}}>
              <input type="number" value={li.qte} min={0} step={0.5} onChange={e=>updateLigne(l.id,'lignesInternes',(l.lignesInternes||[]).map((x,i)=>i===j?{...x,qte:parseFloat(e.target.value)||0}:x))}
                style={{width:60,border:`1px solid ${BD}`,borderRadius:4,fontSize:11,padding:'3px 4px',outline:'none',textAlign:'right' as const,color:'#111'}}/>
            </td>
            <td style={{padding:'5px 4px'}}>
              <input type="number" value={li.pu} min={0} onChange={e=>updateLigne(l.id,'lignesInternes',(l.lignesInternes||[]).map((x,i)=>i===j?{...x,pu:parseFloat(e.target.value)||0}:x))}
                style={{width:70,border:`1px solid ${BD}`,borderRadius:4,fontSize:11,padding:'3px 4px',outline:'none',textAlign:'right' as const,color:'#111'}}/>
            </td>
            <td style={{padding:'5px 4px'}}><span style={{fontSize:11,color:'#888'}}>{li.tva}</span></td>
            <td style={{padding:'5px 8px',textAlign:'right' as const}}><span style={{fontSize:11,color:'#555'}}>{fmt(li.qte*li.pu)}</span></td>
            <td style={{padding:'5px 4px'}}>
              <button onClick={()=>updateLigne(l.id,'lignesInternes',(l.lignesInternes||[]).filter((_,i)=>i!==j))}
                style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:14}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>
            </td>
          </tr>
        ))}
      </>
    )
  }

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:params.police||'system-ui,sans-serif',background:'#f0f2f5',overflow:'hidden'}}>
      <Sidebar activePage="devis"/>
      
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 20px',flexShrink:0,gap:12}}>
          <div style={{display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
            <a href="/devis" style={{color:'#888',textDecoration:'none',fontSize:13}} onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#111'} onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#888'}>← Retour</a>
            <span style={{color:BD}}>|</span>
            <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Nouveau devis</div>
            <select value={statut} onChange={e=>setStatut(e.target.value as any)}
              style={{padding:'4px 10px',borderRadius:20,border:`1px solid ${statutColors[statut].color}40`,background:statutColors[statut].bg,color:statutColors[statut].color,fontSize:12,fontWeight:600,outline:'none',cursor:'pointer'}}>
              {Object.entries(statutLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <SearchBar/>
          <div style={{display:'flex',gap:8,alignItems:'center',flexShrink:0}}>
            <div style={{position:'relative'}}>
              <button onClick={()=>setShowFactureMenu(!showFactureMenu)}
                style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500,display:'flex',alignItems:'center',gap:6}}>
                Générer <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {showFactureMenu&&(
                <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'110%',right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',minWidth:220,zIndex:200,overflow:'hidden'}}>
                  <div style={{padding:'8px 12px',fontSize:11,color:'#888',fontWeight:600,borderBottom:'1px solid #f3f4f6',textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>Générer depuis ce devis</div>
                  {[{label:"Facture d'acompte",type:'acompte' as const,icon:'💰'},{label:'Facture intermédiaire',type:'intermediaire' as const,icon:'📋'},{label:'Facture de solde',type:'solde' as const,icon:'✅'},{label:'Devis sans prix',type:null,icon:'👁'}].map((item,i)=>(
                    <div key={i} onClick={()=>{setShowFactureMenu(false);if(item.type)setShowFactureModal(item.type)}}
                      style={{padding:'10px 14px',fontSize:13,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                      <span>{item.icon}</span><span style={{color:'#333'}}>{item.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={async()=>{
                setGeneratingPdf(true)
                try{
                  const devisData={
                    params,lignes,client,titre,introTexte,dateDevis,validite,
                    numeroDevis,adresseProjet,adresseMode,moyens,acomptes,
                    mentionsLegales,notes,remises,prime,logoPreview
                  }
                  const res=await fetch('/api/generate-pdf',{
                    method:'POST',
                    headers:{'Content-Type':'application/json'},
                    body:JSON.stringify(devisData)
                  })
                  if(!res.ok){const err=await res.json();throw new Error(err.error||'Erreur serveur')}
                  const blob=await res.blob()
                  const url=URL.createObjectURL(blob)
                  const a=document.createElement('a')
                  a.href=url
                  const date=new Date().toISOString().split('T')[0]
                  a.download=`Devis_${numeroDevis||date}.pdf`
                  a.click()
                  URL.revokeObjectURL(url)
                }catch(e:any){console.error(e);alert('Erreur PDF: '+e.message)}
                finally{setGeneratingPdf(false)}
              }}
              disabled={generatingPdf}
              style={{padding:'8px 14px',background:generatingPdf?'#f3f4f6':'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:generatingPdf?'not-allowed':'pointer',color:'#333',fontWeight:500,display:'flex',alignItems:'center',gap:6,opacity:generatingPdf?0.7:1}}>
              {generatingPdf?<>⏳ Génération...</>:<>⬇ Télécharger PDF</>}
            </button>
            {editMode&&snapshot&&(
              <button onClick={annulerModifications} style={{padding:'8px 14px',background:'#fff',border:`1px solid ${RD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#D32F2F',fontWeight:500}}>Annuler</button>
            )}
            <button onClick={()=>{
                if(editMode){setShowSaved(true);setEditMode(false);setSnapshot(null);setTimeout(()=>setShowSaved(false),3000)}
                else{
                  setSnapshot({lignes:[...lignes],client,titre,adresseProjet,adresseMode,dateDevis,validite,remise,remisePct,acompte,acomptePct,primeCEE,primeCEELabel,condPaiement,notes,statut})
                  setEditMode(true)
                }
              }}
              style={{padding:'8px 18px',background:editMode?G:'#f3f4f6',color:editMode?'#fff':'#555',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',transition:'all 0.2s'}}>{editMode?'Enregistrer':'Modifier'}</button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
          <div style={{maxWidth:1100,margin:'0 auto'}}>
            <div id="devis-content" style={{background:'#fff',borderRadius:0,border:'none',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',overflow:'hidden'}}>

              {/* EN-TÊTE */}
              <div style={{padding:'28px 28px 0 28px',position:'relative' as const}}>
                {/* Bouton Paramètres discret — editMode seulement */}
                {editMode&&<a href="/parametres" style={{position:'absolute',top:12,right:12,fontSize:10,color:'#bbb',background:'#f3f4f6',padding:'2px 8px',borderRadius:4,textDecoration:'none'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#555'}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#bbb'}>⚙ Modifier dans Paramètres</a>}

                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:32,alignItems:'flex-start'}}>
                  {/* Bloc entreprise */}
                  <div>
                    {logoPreview&&<img src={logoPreview} alt="logo" style={{height:40,maxWidth:140,objectFit:'contain' as const,display:'block',marginBottom:12}}/>}
                    <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:16}}>
                      {params.nomEntreprise||'Mon entreprise'}
                      {params.showFormeJuridique&&params.formeJuridique?' — '+params.formeJuridique:''}
                    </div>
                    <div style={{fontSize:13,color:'#555',lineHeight:1.6}}>
                      {params.showAdresse&&params.adresseLigne1&&<div>{params.adresseLigne1}{params.codePostal?' '+params.codePostal:''}{params.ville?' '+params.ville:''}</div>}
                      {params.showTel&&params.tel&&<div>{params.tel}</div>}
                      {params.showEmail&&params.email&&<div>{params.email}</div>}
                      {params.showSiteWeb&&params.siteWeb&&<div>{params.siteWeb}</div>}
                    </div>
                  </div>

                  {/* Bloc client */}
                  <div>
                    {client?(
                      <div style={{position:'relative' as const}}>
                        <div
                          style={{background:editMode&&showClientMenu?'#FBE5D5':'#F5F5F5',borderRadius:8,padding:'20px 24px',cursor:editMode?'pointer':'default',transition:'background 0.15s',position:'relative' as const}}
                          onClick={()=>editMode&&setShowClientMenu(!showClientMenu)}
                          onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                          onMouseLeave={e=>{if(!showClientMenu)(e.currentTarget as HTMLDivElement).style.background='#F5F5F5'}}>
                          {editMode&&<span style={{position:'absolute',top:10,right:12,fontSize:13,color:'#aaa'}}>✏</span>}
                          <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:12}}>
                            {client.nom.includes('—')?client.nom.split('—')[0].trim():client.nom}
                            {client.nom.includes('—')&&<div style={{fontSize:13,fontWeight:400,color:'#555',marginTop:2}}>{client.nom.split('—')[1].trim()}</div>}
                          </div>
                          <div style={{fontSize:13,color:'#555',lineHeight:1.5}}>
                            {client.adresse&&<div>{client.adresse}</div>}
                            {client.email&&<div>{client.email}</div>}
                            {client.tel&&<div>{client.tel}</div>}
                            {client.siret&&<div style={{color:'#888',fontSize:12,marginTop:4}}>SIRET : {client.siret}</div>}
                          </div>
                        </div>
                        {showClientMenu&&(
                          <div style={{position:'absolute',top:'calc(100% + 4px)',right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,minWidth:220,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                            <div onClick={()=>{setShowClientMenu(false);setShowEditClientModal(true)}}
                              style={{padding:'10px 14px',fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}
                              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                              ✏ Modifier {client.nom.split('—')[0].trim()}
                            </div>
                            <div onClick={()=>{setShowClientMenu(false);setShowClientModal(true)}}
                              style={{padding:'10px 14px',fontSize:13,cursor:'pointer',color:'#333',borderTop:`1px solid #f3f4f6`}}
                              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                              🔄 Créer ou choisir un autre client...
                            </div>
                          </div>
                        )}
                      </div>
                    ):(
                      <div>
                        {editMode&&<div style={{background:'#F5F5F5',borderRadius:8,padding:'16px',marginBottom:10,fontSize:12,color:'#bbb',fontStyle:'italic',minHeight:60,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}}
                          onClick={()=>setShowClientModal(true)}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#F5F5F5'}>
                          Aucun client sélectionné — cliquez pour choisir
                        </div>}
                        <div style={{position:'relative'}}>
                          <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                          <input value={clientSearch} onChange={e=>{setClientSearch(e.target.value);setShowClientDD(true)}}
                            onFocus={e=>{setShowClientDD(true);(e.currentTarget as HTMLInputElement).style.borderColor=G}}
                            placeholder="Chercher ou créer un client..."
                            style={{width:'100%',padding:'10px 12px 10px 32px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                          {showClientDD&&(
                            <div style={{position:'absolute',top:'110%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:100,overflow:'hidden'}}>
                              {clientsExistants.filter(c=>c.nom.toLowerCase().includes(clientSearch.toLowerCase())).map((c,i)=>(
                                <div key={i} onClick={()=>{setClient(c);setShowClientDD(false);setClientSearch('')}}
                                  style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f3f4f6'}}
                                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                  <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{c.nom}</div>
                                  <div style={{fontSize:11,color:'#888'}}>{c.adresse}</div>
                                </div>
                              ))}
                              {clientSearch&&(
                                <div onClick={()=>{setClient({nom:clientSearch,adresse:'',email:'',tel:''});setShowClientDD(false);setClientSearch('')}}
                                  style={{padding:'10px 14px',cursor:'pointer',background:'#f0fdf4',display:'flex',alignItems:'center',gap:8}}
                                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#dcfce7'}
                                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}>
                                  <span style={{color:G,fontWeight:700}}>+</span>
                                  <span style={{fontSize:13,color:G,fontWeight:600}}>Créer "{clientSearch}"</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* MÉTADONNÉES */}
                <div style={{marginTop:20,paddingBottom:20}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
                    {/* Gauche : Devis n° + Valable */}
                    <div>
                      <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                        {editingMeta==='numero'?(
                          <input autoFocus value={numeroDevis||''} onChange={e=>setNumeroDevis(e.target.value)}
                            onBlur={()=>setEditingMeta(null)} onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape')setEditingMeta(null)}}
                            style={{fontSize:20,fontWeight:700,color:'#111',border:'none',outline:'none',background:'transparent',minWidth:200}}/>
                        ):(
                          <span style={{fontSize:20,fontWeight:700,color:'#111',cursor:editMode?'text':'default',padding:'2px 4px',borderRadius:4,transition:'background 0.1s'}}
                            onClick={()=>editMode&&setEditingMeta('numero')}
                            onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLSpanElement).style.background='#FBE5D5'}}
                            onMouseLeave={e=>(e.currentTarget as HTMLSpanElement).style.background='transparent'}>
                            Devis n° {numeroDevis||'—'}
                          </span>
                        )}
                        {editMode&&!numeroDevis&&<button onClick={()=>setShowNumeroModal(true)}
                          style={{fontSize:11,color:G,background:'none',border:`1px solid ${G}40`,borderRadius:4,padding:'2px 7px',cursor:'pointer'}}>Attribuer</button>}
                      </div>
                      {(validite||editMode)&&(
                        <div style={{fontSize:14,color:'#555',position:'relative' as const}}>
                          {editingMeta==='validite'?(
                            <div style={{position:'absolute',top:'100%',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',padding:'12px 16px',zIndex:200,minWidth:200}} onClick={e=>e.stopPropagation()}>
                              <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:8}}>Durée de validité</div>
                              <input autoFocus value={validite} onChange={e=>setValidite(e.target.value)}
                                onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape')setEditingMeta(null)}}
                                style={{width:'100%',padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none'}}
                                placeholder="ex: 30 jours, 2 mois..."/>
                              <button onClick={()=>setEditingMeta(null)} style={{marginTop:8,padding:'5px 12px',background:G,color:'#fff',border:'none',borderRadius:6,fontSize:12,cursor:'pointer',width:'100%'}}>OK</button>
                            </div>
                          ):null}
                          <span style={{cursor:editMode?'text':'default',padding:'2px 4px',borderRadius:4,transition:'background 0.1s'}}
                            onClick={()=>editMode&&setEditingMeta('validite')}
                            onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLSpanElement).style.background='#FBE5D5'}}
                            onMouseLeave={e=>(e.currentTarget as HTMLSpanElement).style.background='transparent'}>
                            {validite?'Valable '+validite:<span style={{color:'#bbb',fontStyle:'italic'}}>{editMode?'Ajouter une validité':''}</span>}
                          </span>
                        </div>
                      )}
                    </div>
                    {/* Droite : Date */}
                    <div style={{fontSize:14,color:'#555',textAlign:'right' as const,position:'relative' as const}}>
                      {editingMeta==='date'&&(
                        <div style={{position:'absolute',right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',padding:'12px 16px',zIndex:200}} onClick={e=>e.stopPropagation()}>
                          <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:8}}>Date du devis</div>
                          <input autoFocus type="date" value={dateDevis} onChange={e=>setDateDevis(e.target.value)}
                            onKeyDown={e=>{if(e.key==='Enter'||e.key==='Escape')setEditingMeta(null)}}
                            style={{padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none'}}/>
                          <button onClick={()=>setEditingMeta(null)} style={{marginTop:8,padding:'5px 12px',background:G,color:'#fff',border:'none',borderRadius:6,fontSize:12,cursor:'pointer',width:'100%'}}>OK</button>
                        </div>
                      )}
                      <span style={{cursor:editMode?'text':'default',padding:'2px 4px',borderRadius:4,transition:'background 0.1s'}}
                        onClick={()=>editMode&&setEditingMeta('date')}
                        onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLSpanElement).style.background='#FBE5D5'}}
                        onMouseLeave={e=>(e.currentTarget as HTMLSpanElement).style.background='transparent'}>
                        {dateDevis?'En date du '+new Date(dateDevis).toLocaleDateString('fr-FR'):''}
                      </span>
                    </div>
                  </div>

                  {/* Adresse projet */}
                  {(adresseMode&&adresseMode!=='hidden'||editMode)&&(
                    <div style={{marginTop:12}}>
                      {(adresseMode&&adresseMode!=='hidden')||editMode?(
                        <div style={{fontSize:12,color:'#666',fontStyle:'italic',marginBottom:6}}>Adresse du projet :</div>
                      ):null}
                      {adresseMode===null&&editMode&&(
                        <div style={{position:'relative' as const}}>
                          <div onClick={()=>setShowAdresseMenu(!showAdresseMenu)}
                            style={{background:'#F5F5F5',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#bbb',fontStyle:'italic',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                            <span>Optionnel — cliquez pour définir</span>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                          </div>
                          {showAdresseMenu&&(
                            <div style={{position:'absolute',top:'110%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:200,overflow:'hidden'}}>
                              <div onClick={()=>{setAdresseMode('client');setAdresseProjet(client?.adresse||'');setShowAdresseMenu(false)}}
                                style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f3f4f6',fontSize:13}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                <div style={{fontWeight:600,color:'#111'}}>📍 Utiliser l'adresse du client</div>
                                <div style={{fontSize:11,color:'#888',marginTop:1}}>{client?.adresse||"Sélectionnez d'abord un client"}</div>
                              </div>
                              <div onClick={()=>{setAdresseMode('manuel');setShowAdresseMenu(false)}}
                                style={{padding:'10px 14px',cursor:'pointer',borderBottom:'1px solid #f3f4f6',fontSize:13}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                <div style={{fontWeight:600,color:'#111'}}>✏️ Saisir une autre adresse</div>
                              </div>
                              <div onClick={()=>{setAdresseMode('hidden');setShowAdresseMenu(false)}}
                                style={{padding:'10px 14px',cursor:'pointer',fontSize:13}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                <div style={{fontWeight:600,color:'#888'}}>🚫 Ne pas indiquer d'adresse</div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      {adresseMode==='client'&&(
                        <div style={{background:'#F5F5F5',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#333',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                          <span>{client?.adresse||'Adresse client non renseignée'}</span>
                          {editMode&&<button onClick={()=>{setAdresseMode(null);setAdresseProjet('')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14}}>×</button>}
                        </div>
                      )}
                      {adresseMode==='manuel'&&(
                        editMode?(
                          <div style={{display:'flex',gap:6}}>
                            <input value={adresseProjet} onChange={e=>setAdresseProjet(e.target.value)} placeholder="Saisir l'adresse du projet..."
                              style={{flex:1,padding:'10px 14px',background:'#F5F5F5',border:'none',borderRadius:8,fontSize:13,outline:'none',color:'#111'}}/>
                            <button onClick={()=>{setAdresseMode(null);setAdresseProjet('')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}>×</button>
                          </div>
                        ):(
                          adresseProjet&&<div style={{background:'#F5F5F5',borderRadius:8,padding:'10px 14px',fontSize:13,color:'#333'}}>{adresseProjet}</div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* TITRE */}
              {(titre||editMode)&&<div style={{padding:'12px 24px',textAlign:'center' as const}}>
                <RichTextEditor value={titre} onChange={setTitre} readOnly={!editMode}
                  placeholder="Titre du devis (optionnel)"
                  defaultFont={params.police||'Georgia,serif'}
                  style={{textAlign:'center' as const,fontSize:15,fontStyle:'italic',color:'#555',minHeight:28}}/>
              </div>}

              {/* INTRO */}
              {(introTexte||editMode)&&(
                <div style={{padding:'8px 24px'}}>
                  <RichTextEditor value={introTexte} onChange={setIntroTexte} readOnly={!editMode}
                    placeholder={editMode?"Texte d'introduction (optionnel)...":''}
                    defaultFont={params.police||'system-ui'}
                    style={{fontSize:13,color:'#555',fontStyle:'italic'}}/>
                </div>
              )}

              {/* TABLEAU */}
              <div style={{overflowX:'auto',padding:'0 24px'}}>
                <table style={{width:'100%',borderCollapse:'collapse',minWidth:700}}>
                  <thead>
                    <tr style={{background:'#fff',borderBottom:'none'}}>
                      <th style={{padding:'10px 10px',fontSize:14,color:'#111',fontWeight:700,textAlign:'left' as const,width:60,borderRight:'1px solid #d0d0d0'}}>N°</th>
                      <th style={{padding:'10px 8px',fontSize:14,color:'#111',fontWeight:700,textAlign:'left' as const,borderRight:'1px solid #d0d0d0'}}>Désignation</th>
                      <th style={{padding:'10px 4px',fontSize:14,color:'#111',fontWeight:700,textAlign:'right' as const,width:70,borderRight:'1px solid #d0d0d0'}}>Qté</th>
                      <th style={{padding:'10px 4px',fontSize:14,color:'#111',fontWeight:700,textAlign:'right' as const,width:90,borderRight:'1px solid #d0d0d0'}}>PU HT</th>
                      <th style={{padding:'10px 4px',fontSize:14,color:'#111',fontWeight:700,textAlign:'center' as const,width:70,borderRight:'1px solid #d0d0d0'}}>TVA</th>
                      <th style={{padding:'10px 8px',fontSize:14,color:'#111',fontWeight:700,textAlign:'right' as const,width:110}}>Total HT</th>
                      <th style={{width:50}}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lignes.length===0?(
                      <tr><td colSpan={8} style={{padding:'48px 24px',textAlign:'center' as const,color:'#aaa'}}>
                        <div style={{fontSize:32,marginBottom:10}}>📄</div>
                        <div style={{fontSize:14,fontWeight:600,color:'#888',marginBottom:4}}>Le devis est vide</div>
                        <div style={{fontSize:13,color:'#aaa'}}>Utilisez les boutons ci-dessous pour ajouter des lignes</div>
                      </td></tr>
                    ):(() => {
                      // Calculer les lignes visibles selon collapsed
                      const visibles: number[] = []
                      let collapsedCatIdx: number | null = null
                      let collapsedSubIdx: number | null = null

                      lignes.forEach((l, i) => {
                        if (l.type === 'categorie') {
                          collapsedCatIdx = l.collapsed ? i : null
                          collapsedSubIdx = null
                          visibles.push(i) // catégorie toujours visible
                        } else if (l.type === 'sous-categorie') {
                          if (collapsedCatIdx !== null) return // masqué par catégorie
                          collapsedSubIdx = l.collapsed ? i : null
                          visibles.push(i) // sous-catégorie toujours visible si catégorie ouverte
                        } else {
                          if (collapsedCatIdx !== null) return // masqué par catégorie
                          if (collapsedSubIdx !== null) return // masqué par sous-catégorie
                          visibles.push(i)
                        }
                      })

                      return visibles.map(i => renderLigne(lignes[i], i))
                    })()}
                  </tbody>
                </table>
              </div>

              {/* BOUTONS AJOUT — mode édition uniquement */}
              {editMode&&(
                <div style={{padding:'10px 24px',background:'#fafafa'}}>
                  <div style={{display:'flex',gap:8,flexWrap:'wrap' as const,alignItems:'center'}}>
                    <span style={{fontSize:11,color:'#555',fontWeight:700,letterSpacing:'0.06em',marginRight:2}}>STRUCTURE</span>
                    {[
                      {label:'+ Catégorie',type:'categorie' as const,bg:'#fce7f3',color:'#9d174d',border:'#fbcfe8'},
                      {label:'+ Sous-catégorie',type:'sous-categorie' as const,bg:'#fdf2f8',color:'#be185d',border:'#f9a8d4'},
                      {label:'+ Note',type:'note' as const,bg:'#fffbeb',color:'#92400e',border:'#fde68a'},
                      {label:'+ Saut de page',type:'saut-page' as const,bg:'#f9fafb',color:'#6b7280',border:'#e5e7eb'},
                    ].map(btn=>(
                      <button key={btn.type} onClick={()=>addLigne(btn.type)}
                        style={{padding:'5px 12px',cursor:'pointer',background:btn.bg,color:btn.color,border:`1px solid ${btn.border}`,borderRadius:20,fontSize:12,fontWeight:600}}>
                        {btn.label}
                      </button>
                    ))}
                    <div style={{width:1,height:18,background:BD,margin:'0 4px'}}/>
                    <span style={{fontSize:11,color:'#555',fontWeight:700,letterSpacing:'0.06em',marginRight:2}}>LIGNE</span>
                    {[
                      {label:'+ Matériau',type:'materiau' as const,bg:'#f3f4f6',color:'#374151',border:'#d1d5db'},
                      {label:"+ Main d'œuvre",type:'mo' as const,bg:'#eff6ff',color:'#2563eb',border:'#bfdbfe'},
                      {label:'+ Ouvrage',type:'ouvrage' as const,bg:'#f0fdf4',color:G,border:'#bbf7d0'},
                    ].map(btn=>(
                      <button key={btn.type} onClick={()=>setShowBiblio(btn.type)}
                        style={{padding:'5px 12px',cursor:'pointer',background:btn.bg,color:btn.color,border:`1px solid ${btn.border}`,borderRadius:20,fontSize:12,fontWeight:600}}>
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PIED DE PAGE */}
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',borderTop:`1px solid ${BD}`}}>

                {/* COLONNE GAUCHE */}
                <div style={{padding:'20px 24px',borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column' as const,gap:14}}>

                  {/* 1.1 Moyens de paiement */}
                  <div style={{position:'relative' as const}}>
                    <div
                      onClick={()=>editMode&&setShowMoyensPopover(!showMoyensPopover)}
                      style={{padding:'6px 8px',borderRadius:6,background:editMode&&showMoyensPopover?'#FBE5D5':'transparent',cursor:editMode?'pointer':'default',display:'flex',alignItems:'center',gap:8,transition:'background 0.15s'}}
                      onMouseEnter={e=>{if(editMode&&!showMoyensPopover)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                      onMouseLeave={e=>{if(!showMoyensPopover)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>
                      <span style={{fontSize:13,color:'#333',flex:1}}>{getMoyensTexte()||<span style={{color:'#aaa',fontStyle:'italic'}}>Aucun moyen de paiement sélectionné</span>}</span>
                      {editMode&&<span style={{fontSize:12,color:'#aaa'}}>✏</span>}
                    </div>
                    {showMoyensPopover&&(
                      <div style={{position:'absolute' as const,top:'100%',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,padding:'14px 16px',minWidth:240}} onClick={e=>e.stopPropagation()}>
                        <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:10}}>Moyens de paiement acceptés :</div>
                        {[['especes','Espèces'],['cheque','Chèque'],['virement','Virement bancaire'],['carte','Carte bleue']].map(([k,l])=>(
                          <label key={k} style={{display:'flex',alignItems:'center',gap:8,marginBottom:8,cursor:'pointer',fontSize:13,color:'#333'}}>
                            <input type="checkbox" checked={(moyens as any)[k]} onChange={e=>setMoyens(p=>({...p,[k]:e.target.checked}))} style={{accentColor:G}}/>
                            {l}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 1.2 Acomptes */}
                  <div style={{display:'flex',flexDirection:'column' as const,gap:6}}>
                    {acomptes.map(a=>(
                      <div key={a.id} style={{position:'relative' as const}}>
                        <div onClick={()=>editMode&&setShowAcomptePopover(showAcomptePopover===a.id?null:a.id)}
                          style={{padding:'6px 8px',borderRadius:6,background:editMode&&showAcomptePopover===a.id?'#FBE5D5':'transparent',cursor:editMode?'pointer':'default',fontSize:13,color:'#333',display:'flex',alignItems:'center',gap:8}}
                          onMouseEnter={e=>{if(editMode&&showAcomptePopover!==a.id)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                          onMouseLeave={e=>{if(showAcomptePopover!==a.id)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>
                          <span style={{flex:1}}>
                            {ACOMPTE_TYPES.find(t=>t.id===a.type)?.label} {a.pct} %, soit {fmt(resteAPayer*a.pct/100)} €.
                          </span>
                          {editMode&&<span style={{fontSize:12,color:'#aaa'}}>✏</span>}
                        </div>
                        {showAcomptePopover===a.id&&(
                          <div style={{position:'absolute' as const,top:'100%',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,padding:'14px 16px',minWidth:260}} onClick={e=>e.stopPropagation()}>
                            <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:10}}>{ACOMPTE_TYPES.find(t=>t.id===a.type)?.label}</div>
                            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
                              <input type="number" value={a.pct} min={0} max={100}
                                onChange={e=>setAcomptes(p=>p.map(x=>x.id===a.id?{...x,pct:parseFloat(e.target.value)||0}:x))}
                                style={{width:60,padding:'6px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',textAlign:'right' as const}}/>
                              <span style={{fontSize:13,color:'#555'}}>% = {fmt(resteAPayer*a.pct/100)} € TTC</span>
                            </div>
                            <button onClick={()=>setAcomptes(p=>p.filter(x=>x.id!==a.id))}
                              style={{fontSize:12,color:RD,background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                              Supprimer cette échéance
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                    {editMode&&(
                      <div style={{position:'relative' as const,display:'inline-block'}}>
                        <button onClick={()=>setShowAcompteMenu(!showAcompteMenu)}
                          style={{padding:'5px 12px',background:'#f3f4f6',border:`1px solid ${BD}`,borderRadius:20,fontSize:12,cursor:'pointer',color:'#555',display:'flex',alignItems:'center',gap:6}}>
                          📅 Ajouter un acompte
                        </button>
                        {showAcompteMenu&&(
                          <div style={{position:'absolute' as const,top:'100%',left:0,marginTop:4,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,overflow:'hidden',minWidth:240}} onClick={e=>e.stopPropagation()}>
                            {ACOMPTE_TYPES.map(t=>(
                              <div key={t.id} onClick={()=>{setAcomptes(p=>[...p,{id:genId(),type:t.id,pct:30}]);setShowAcompteMenu(false)}}
                                style={{padding:'10px 14px',fontSize:13,cursor:'pointer',color:'#333'}}
                                onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                                onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                                {t.label}...
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {acomptes.length>0&&editMode&&(
                      <button onClick={()=>{}} style={{fontSize:11,color:'#2563eb',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline',textAlign:'left' as const}}>
                        Enregistrer ces échéances pour mes prochains devis
                      </button>
                    )}
                  </div>

                  {/* 1.3 Mentions légales */}
                  {mentionsLegales?(
                    <div style={{position:'relative' as const}}>
                      <div style={{padding:'6px 8px',borderRadius:6,fontSize:12,color:'#555',fontStyle:'italic',lineHeight:1.6,background:'transparent',cursor:editMode?'pointer':'default'}}
                        onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                        Je certifie que les travaux réalisés sont éligibles au taux de TVA réduit de 5,5 % ou 10 % et respectent les conditions prévues par les articles 279-0 bis et 278-0 bis A du Code Général des Impôts.
                        {editMode&&<div style={{marginTop:4}}><button onClick={()=>setMentionsLegales(false)} style={{fontSize:11,color:RD,background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>Retirer les mentions légales</button></div>}
                      </div>
                    </div>
                  ):editMode&&(
                    <button onClick={()=>setMentionsLegales(true)}
                      style={{padding:'5px 12px',background:'#fff8f0',border:'1px solid #fde8c8',borderRadius:20,fontSize:12,cursor:'pointer',color:'#BA7517',display:'inline-flex',alignItems:'center',gap:6,alignSelf:'flex-start' as const}}>
                      🪓 Ajouter les mentions légales
                    </button>
                  )}

                  {/* 1.4 Note de fin */}
                  <div style={{padding:'6px 8px',borderRadius:6,cursor:editMode?'text':'default',background:'transparent',transition:'background 0.15s'}}
                    onMouseEnter={e=>{if(editMode)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                    <RichTextEditor value={notes} onChange={setNotes} readOnly={!editMode}
                      placeholder={editMode?"Note de fin spécifique à ce document...":''}
                      defaultFont={params.police||'system-ui'}
                      style={{fontSize:13,color:'#555',fontStyle:'italic'}}/>
                  </div>
                </div>

                {/* COLONNE DROITE — récap */}
                <div style={{padding:'20px 24px'}}>
                  <div style={{display:'flex',flexDirection:'column' as const,gap:4}}>

                    {/* Récap financier — ordre strict */}

                    {/* Sous-total HT (seulement si remises) */}
                    {totalRemises>0&&(
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#333',padding:'2px 0'}}>
                        <span>Sous-total HT</span>
                        <span>{fmt(totalHT)}</span>
                      </div>
                    )}

                    {/* Remises */}
                    {remises.map(r=>(
                      <div key={r.id} style={{position:'relative' as const}}>
                        <div onClick={()=>editMode&&setShowRemisePopover(showRemisePopover===r.id?null:r.id)}
                          style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#333',padding:'4px 6px',borderRadius:5,cursor:editMode?'pointer':'default',background:showRemisePopover===r.id?'#FBE5D5':'transparent'}}
                          onMouseEnter={e=>{if(editMode&&showRemisePopover!==r.id)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                          onMouseLeave={e=>{if(showRemisePopover!==r.id)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>
                          <span>{r.label||'Remise'}</span>
                          <span style={{color:'#D32F2F'}}>− {fmt(r.isPct?totalHT*r.val/100:r.val)}</span>
                        </div>
                        {showRemisePopover===r.id&&(
                          <div style={{position:'absolute' as const,right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,padding:'14px 16px',minWidth:240}} onClick={e=>e.stopPropagation()}>
                            <input value={r.label} onChange={e=>setRemises(p=>p.map(x=>x.id===r.id?{...x,label:e.target.value}:x))}
                              placeholder="Libellé (ex: Remise commerciale)"
                              style={{width:'100%',padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',marginBottom:8,boxSizing:'border-box' as const}}/>
                            <div style={{display:'flex',gap:6,marginBottom:10}}>
                              <input type="number" value={r.val} min={0}
                                onChange={e=>setRemises(p=>p.map(x=>x.id===r.id?{...x,val:parseFloat(e.target.value)||0}:x))}
                                style={{flex:1,padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',textAlign:'right' as const}}/>
                              <select value={r.isPct?'%':'€'} onChange={e=>setRemises(p=>p.map(x=>x.id===r.id?{...x,isPct:e.target.value==='%'}:x))}
                                style={{padding:'7px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',background:'#fff'}}>
                                <option>%</option><option>€</option>
                              </select>
                            </div>
                            <button onClick={()=>{setRemises(p=>p.filter(x=>x.id!==r.id));setShowRemisePopover(null)}}
                              style={{fontSize:12,color:RD,background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Bouton ajouter remise */}
                    {editMode&&(
                      <div onClick={()=>setRemises(p=>[...p,{id:genId(),label:'Remise',val:0,isPct:true}])}
                        style={{padding:'5px 8px',borderRadius:6,cursor:'pointer',fontSize:12,color:'#888',display:'flex',alignItems:'center',gap:6}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                        🏷️ {remises.length>0?'Ajouter une autre remise...':'Remise ou montant à déduire...'}
                      </div>
                    )}

                    {/* Total HT */}
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#333',padding:'2px 0',fontWeight:600}}>
                      <span>Total HT</span>
                      <span>{fmt(totalHTapresRemises)}</span>
                    </div>

                    {/* TVA ventilée */}
                    {Object.entries(tvaVentilee).sort((a,b)=>parseFloat(a[0])-parseFloat(b[0])).map(([taux,mt])=>(
                      <div key={taux} style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#555',padding:'2px 0'}}>
                        <span>TVA à {taux} %</span>
                        <span>{fmt(mt)}</span>
                      </div>
                    ))}

                    {/* Total TTC */}
                    <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#333',padding:'4px 0',fontWeight:600,borderTop:`1px solid ${BD}`,marginTop:4}}>
                      <span>Total TTC</span>
                      <span>{fmt(totalTTCFinal)}</span>
                    </div>

                    {/* Prime(s) */}
                    {prime&&(
                      <div style={{position:'relative' as const}}>
                        <div onClick={()=>editMode&&setShowPrimePopover(!showPrimePopover)}
                          style={{display:'flex',justifyContent:'space-between',fontSize:13,color:'#333',padding:'4px 6px',borderRadius:5,cursor:editMode?'pointer':'default',background:showPrimePopover?'#FBE5D5':'transparent'}}
                          onMouseEnter={e=>{if(editMode&&!showPrimePopover)(e.currentTarget as HTMLDivElement).style.background='#FBE5D5'}}
                          onMouseLeave={e=>{if(!showPrimePopover)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>
                          <span>{prime.label||'Prime à déduire'}</span>
                          <span style={{color:'#D32F2F',fontWeight:400}}>- {fmt(prime.val)}</span>
                        </div>
                        {showPrimePopover&&(
                          <div style={{position:'absolute' as const,right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,padding:'14px 16px',minWidth:240}} onClick={e=>e.stopPropagation()}>
                            <input value={prime.label} onChange={e=>setPrime(p=>p?{...p,label:e.target.value}:p)}
                              placeholder="Ex: Prime MaPrimeRénov'"
                              style={{width:'100%',padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',marginBottom:8,boxSizing:'border-box' as const}}/>
                            <div style={{display:'flex',gap:6,marginBottom:10}}>
                              <input type="number" value={prime.val} min={0}
                                onChange={e=>setPrime(p=>p?{...p,val:parseFloat(e.target.value)||0}:p)}
                                style={{flex:1,padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:13,outline:'none',textAlign:'right' as const}}/>
                              <span style={{padding:'7px 8px',fontSize:13,color:'#555'}}>€</span>
                            </div>
                            <button onClick={()=>{setPrime(null);setShowPrimePopover(false)}}
                              style={{fontSize:12,color:'#D32F2F',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>Supprimer</button>
                          </div>
                        )}
                      </div>
                    )}
                    {editMode&&!prime&&(
                      <div onClick={()=>setPrime({label:"Prime MaPrimeRénov'",val:0})}
                        style={{padding:'5px 8px',borderRadius:6,cursor:'pointer',fontSize:12,color:'#888',display:'flex',alignItems:'center',gap:6}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}>
                        <span>🏷️ Prime non soumise à TVA à déduire...</span>
                        <span title="Ex: prime MaPrimeRénov', CEE... à déduire directement du TTC" style={{cursor:'help',fontSize:11,background:'#f3f4f6',borderRadius:'50%',padding:'0 5px',color:'#888'}}>?</span>
                      </div>
                    )}

                    {/* Reste à payer (seulement si prime) */}
                    {prime&&prime.val>0&&(
                      <div style={{display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:700,color:'#111',padding:'6px 0',marginTop:4,borderTop:`1px solid ${BD}`}}>
                        <span>Reste à payer</span>
                        <span>{fmt(resteAPayer)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

                            {/* SIGNATURES */}
              <div style={{padding:'24px',borderTop:`1px solid ${BD}`,display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                {/* Colonne gauche — client */}
                <div style={{display:'grid',gridTemplateRows:'auto auto 1fr',gap:8,alignItems:'start'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111',textAlign:'center' as const}}>{params.texteClient||'Le client'}</div>
                  <div style={{fontSize:12,color:'#555',textAlign:'center' as const,lineHeight:1.5,minHeight:36}}>
                    {params.mentionClient||"Devis reçu avant l'exécution des travaux. Bon pour travaux."}
                  </div>
                  <div style={{border:`1px solid ${BD}`,borderRadius:8,width:'100%',height:params.tailleSignature==='petit'?60:params.tailleSignature==='grand'?120:90}}/>
                </div>
                {/* Colonne droite — entreprise */}
                <div style={{display:'grid',gridTemplateRows:'auto auto 1fr',gap:8,alignItems:'start'}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111',textAlign:'center' as const}}>{params.nomSignataireEntreprise||params.nomEntreprise||"L'entreprise"}</div>
                  <div style={{fontSize:12,color:'#555',textAlign:'center' as const,lineHeight:1.5,minHeight:36}}>
                    {params.mentionEntreprise||''}
                  </div>
                  <div style={{position:'relative' as const,border:`1px solid ${BD}`,borderRadius:8,width:'100%',height:params.tailleSignature==='petit'?60:params.tailleSignature==='grand'?120:90}}>
                    {params.cachet&&<img src={params.cachet} alt="cachet" style={{position:'absolute' as const,top:'50%',left:'50%',transform:'translate(-50%,-50%)',maxHeight:'80%',maxWidth:'80%',opacity:0.35,objectFit:'contain' as const}}/>}
                  </div>
                </div>
              </div>

                            {/* PIED DE PAGE LÉGAL */}
              {(()=>{
                const p=params as any
                const parts:string[]=[p.nomEntreprise||''].filter(Boolean)
                const formeCapital=[
                  p.showFormeJuridiquePied&&p.formeJuridique?p.formeJuridique:'',
                  p.showCapital&&p.capitalSocial?'au capital de '+p.capitalSocial:''
                ].filter(Boolean).join(' ')
                if(formeCapital) parts.push(formeCapital)
                if(p.showRCS&&p.rcs) parts.push('Immatriculée au RCS de '+(p.ville||'')+' sous le numéro '+p.rcs)
                if(p.showSiretPied&&p.siret) parts.push('SIRET : '+p.siret)
                if(p.showTvaIntraP&&p.tvaIntra) parts.push('TVA Intracommunautaire : '+p.tvaIntra)
                if(p.showDecennalePied&&p.decennale) parts.push('Assurance Décennale : N° '+p.decennale)
                if(p.showIBANPied&&p.iban) parts.push('IBAN : '+p.iban)
                return parts.length>1?(
                  <div style={{padding:'10px 24px',borderTop:`1px solid ${BD}`,fontSize:9,color:'#888',textAlign:'center' as const,lineHeight:1.8}}>
                    {parts.join(' — ')}
                  </div>
                ):null
              })()}

            </div>
          </div>
        </div>
      </div>

      {/* Modal numéro devis */}
      {showNumeroModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowNumeroModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:28,maxWidth:380,width:'90%'}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:12,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20}}>🔢</div>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Attribuer un numéro</div>
                <div style={{fontSize:12,color:'#888',marginTop:2}}>Cette action est non réversible</div>
              </div>
            </div>
            <div style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px',marginBottom:16}}>
              <div style={{fontSize:12,color:'#888',marginBottom:4}}>Prochain numéro disponible</div>
              <div style={{fontSize:22,fontWeight:800,color:'#111',letterSpacing:'0.02em'}}>DEV-2026-001</div>
            </div>
            <p style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:20}}>
              Une fois attribué, ce numéro ne peut plus être modifié. Les numéros se suivent automatiquement.
            </p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowNumeroModal(false)} style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555',fontWeight:500}}>Annuler</button>
              <button onClick={()=>{setNumeroDevis('DEV-2026-001');setShowNumeroModal(false);setEditMode(true)}}
                style={{flex:1,padding:11,background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                ✔ Attribuer ce numéro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal bibliothèque */}
      {showBiblio&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowBiblio(null);setBiblioSearch('');setInsertAtIdx(null)}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:560,width:'92%',maxHeight:'75vh',display:'flex',flexDirection:'column',gap:12}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>
                {showBiblio==='materiau'?'Choisir un matériau':showBiblio==='mo'?"Choisir une main d'œuvre":'Choisir un ouvrage'}
              </div>
              <button onClick={()=>{setShowBiblio(null);setBiblioSearch('')}} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>

            {/* Recherche */}
            <div style={{position:'relative',flexShrink:0}}>
              <svg style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)'}} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={biblioSearch} onChange={e=>setBiblioSearch(e.target.value)} placeholder="Rechercher..."
                style={{width:'100%',padding:'8px 12px 8px 32px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const}}
                onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
            </div>

            {/* Créer vide */}
            <button onClick={()=>addLigne(showBiblio==='ouvrage'?'ouvrage':showBiblio,undefined,insertAtIdx??undefined)}
              style={{padding:'9px 14px',background:'#f0fdf4',border:`1px solid ${G}40`,borderRadius:8,fontSize:13,fontWeight:600,color:G,cursor:'pointer',textAlign:'left' as const,flexShrink:0}}>
              + {showBiblio==='materiau'?'Nouveau matériau (vide)':showBiblio==='mo'?"Nouvelle main d'œuvre (vide)":'Nouvel ouvrage vide (sur ce devis uniquement)'}
            </button>

            {/* Liste */}
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:6}}>
              {(showBiblio==='materiau'?biblioMats:showBiblio==='mo'?biblioMO:biblioOuvrages)
                .filter((item:any)=>!biblioSearch||item.nom.toLowerCase().includes(biblioSearch.toLowerCase()))
                .map((item:any,i)=>(
                <div key={i} onClick={()=>addLigne(showBiblio==='ouvrage'?'ouvrage':showBiblio,item,insertAtIdx??undefined)}
                  style={{padding:'12px 14px',border:`1px solid ${BD}`,borderRadius:8,cursor:'pointer',transition:'all 0.1s'}}
                  onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=G;d.style.background='#f0fdf4'}}
                  onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=BD;d.style.background=''}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{item.nom}</div>
                      {item.description&&<div style={{fontSize:11,color:'#888',marginTop:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{item.description}</div>}
                      <div style={{fontSize:11,color:'#aaa',marginTop:3}}>
                        {item.unite} · TVA {item.tva}
                        {showBiblio==='ouvrage'&&item.lignes?.length>0&&(
                          <span style={{marginLeft:8,color:'#888'}}>· {item.lignes.length} composant{item.lignes.length>1?'s':''}</span>
                        )}
                      </div>
                    </div>
                    <div style={{textAlign:'right' as const,flexShrink:0}}>
                      <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{item.prixFacture||item.pu||0} €</div>
                      <div style={{fontSize:10,color:'#aaa'}}>/ {item.unite}</div>
                    </div>
                  </div>
                  {showBiblio==='ouvrage'&&item.lignes?.length>0&&(
                    <div style={{marginTop:8,paddingTop:8,borderTop:'1px solid #f3f4f6',display:'flex',flexDirection:'column' as const,gap:3}}>
                      {item.lignes.map((li:any,j:number)=>(
                        <div key={j} style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#888'}}>
                          <span>{li.type==='mo'?'MO':'MAT'} — {li.nom}</span>
                          <span>{li.qte} {li.unite} × {li.pu} €</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {(showBiblio==='materiau'?biblioMats:showBiblio==='mo'?biblioMO:biblioOuvrages)
                .filter((item:any)=>!biblioSearch||item.nom.toLowerCase().includes(biblioSearch.toLowerCase())).length===0&&(
                <div style={{textAlign:'center' as const,padding:'20px',color:'#888',fontSize:13}}>Aucun résultat pour « {biblioSearch} »</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal facture */}
      {showFactureModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowFactureModal(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:28,maxWidth:400,width:'90%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>{showFactureModal==='acompte'?"Facture d'acompte":showFactureModal==='intermediaire'?'Facture intermédiaire':'Facture de solde'}</div>
            <div style={{fontSize:13,color:'#888',marginBottom:18}}>Total TTC du devis : <strong style={{color:'#111'}}>{fmt(totalTTC)}</strong></div>
            <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:6}}>Montant</label>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}>
              <input type="number" value={factureAmount} onChange={e=>setFactureAmount(e.target.value)} placeholder={facturePct?'Ex: 30':'Ex: 5000'}
                style={{flex:1,padding:'10px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:14,outline:'none',color:'#111'}}
                onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
              <select value={facturePct?'%':'€'} onChange={e=>setFacturePct(e.target.value==='%')}
                style={{padding:'10px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:14,outline:'none',background:'#fff',color:'#111',fontWeight:600}}>
                <option>%</option><option>€</option>
              </select>
            </div>
            {factureAmount&&<div style={{fontSize:12,color:G,marginBottom:14}}>= {fmt(facturePct?totalTTC*parseFloat(factureAmount)/100:parseFloat(factureAmount))} € TTC</div>}
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowFactureModal(null)} style={{flex:1,padding:11,border:'1px solid #333',borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer',color:'#111',fontWeight:500}}>Annuler</button>
              <button onClick={()=>{setShowFactureModal(null);setFactureAmount('')}} style={{flex:1,padding:11,background:G,color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>Générer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal header info */}
      {showHeaderInfo&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowHeaderInfo(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:360,width:'90%',textAlign:'center' as const}}>
            <div style={{fontSize:24,marginBottom:10}}>⚙️</div>
       {showEditClientModal&&client&&<EditClientModal client={client} onSave={setClient as any} onClose={()=>setShowEditClientModal(false)} G={G} BD={BD}/>}

      {showSaved&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span><span style={{fontSize:13}}>Devis enregistré</span>
        </div>
      )}
    </div>
  )
}

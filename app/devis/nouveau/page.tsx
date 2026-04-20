'use client'
import { useState, useEffect } from 'react'
import RichTextEditor from '../../components/RichTextEditor'
import { getBiblioOuvrages, getBiblioMats, getBiblioMO } from '../../lib/bibliothequeStore'
import Sidebar from '../../components/Sidebar'
import SearchBar from '../../components/SearchBar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'
const fmt=(n:number)=>{
  const hasDecimals=n%1!==0
  return n.toLocaleString('fr-FR',{minimumFractionDigits:hasDecimals?2:0,maximumFractionDigits:hasDecimals?2:0})
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
  const[biblioSearch,setBiblioSearch]=useState('')
  const[biblioOuvrages,setBiblioOuvrages]=useState<any[]>([])
  const[biblioMats,setBiblioMats]=useState<any[]>([])
  const[biblioMO,setBiblioMO]=useState<any[]>([])
  const[showFactureMenu,setShowFactureMenu]=useState(false)
  const[showFactureModal,setShowFactureModal]=useState<'acompte'|'intermediaire'|'solde'|null>(null)
  const[factureAmount,setFactureAmount]=useState('')
  const[facturePct,setFacturePct]=useState(true)
  const[showSaved,setShowSaved]=useState(false)
  const[showHeaderInfo,setShowHeaderInfo]=useState(false)
  const[ouvrageExpanded,setOuvrageExpanded]=useState<Record<string,boolean>>({})
  const[editingCell,setEditingCell]=useState<{id:string,field:string}|null>(null)
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

  const addLigne=(type:LigneType,data?:any)=>{
    const base:Ligne={id:genId(),type}
    if(type==='materiau'){
      setEditMode(true)
      const mat:Ligne={...base,designation:data?.nom||'',description:data?.description||'',unite:data?.unite||'u',qte:1,pu:data?.prixFacture||data?.pu||0,tva:data?.tva||'20%'}
      setLignes(p=>[...p,mat])
    } else if(type==='mo'){
      setEditMode(true)
      const mo:Ligne={...base,designation:data?.nom||'',description:data?.description||'',unite:data?.unite||'h',qte:1,pu:data?.prixFacture||data?.pu||0,tva:data?.tva||'20%'}
      setLignes(p=>[...p,mo])
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
      setLignes(p=>[...p,ouvrLigne,...composants])
    } else if(type==='ouvrage'){
      // Ouvrage vide (création directe sur le devis)
      setLignes(p=>[...p,{...base,designation:'Nouvel ouvrage',description:'',unite:'',qte:1,pu:0,tva:'20%',lignesInternes:[],prixManuel:false}])
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
  const moveLigne=(id:string,dir:'up'|'down')=>{
    setLignes(p=>{
      const idx=p.findIndex(l=>l.id===id)
      if(dir==='up'&&idx===0||dir==='down'&&idx===p.length-1) return p
      const arr=[...p];const swap=dir==='up'?idx-1:idx+1
      ;[arr[idx],arr[swap]]=[arr[swap],arr[idx]];return arr
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
    finalise:{bg:'#eff6ff',color:'#2563eb'},signe:{bg:'#f0fdf4',color:G},refuse:{bg:'#fef2f2',color:RD}
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
            {editMode&&<button onClick={()=>deleteLigne(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:16,marginTop:4}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>}
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
        {idx>0&&<tr><td colSpan={7} style={{height:6,background:'#fff',padding:0}}></td></tr>}
        <tr key={l.id} style={{background:isSub?col+'18':col+'30'}}>
          <td style={{padding:'8px 6px',paddingLeft:10,width:60}}>
            <div style={{display:'flex',alignItems:'center',gap:4}}>
              {editMode&&<button onClick={()=>updateLigne(l.id,'collapsed',!l.collapsed)} style={{background:'none',border:'none',cursor:'pointer',fontSize:11,color:'#888',padding:0}}>{l.collapsed?'▶':'▼'}</button>}
              <span style={{fontSize:12,fontWeight:400,color:'#555',fontFamily:'system-ui'}}>{getNumero(lignes,idx)}</span>
            </div>
          </td>
          <td colSpan={3} style={{padding:'8px 8px'}}>
            <input value={l.titre||''} onChange={e=>updateLigne(l.id,'titre',e.target.value)}
              readOnly={!editMode}
              style={{width:'100%',border:'none',background:'transparent',fontSize:isSub?13:14,fontWeight:700,color:'#111',outline:'none',fontFamily:'system-ui'}}
              placeholder={isSub?'Sous-catégorie':'Catégorie'}/>
          </td>
          <td style={{padding:'8px 12px'}}></td>
            <td style={{padding:'8px 12px',textAlign:'right' as const}}>
            <span style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(st)} €</span>
            {editMode&&<div className="row-actions" style={{display:'flex',justifyContent:'flex-end',gap:4,marginTop:2,opacity:0,transition:'opacity 0.15s'}}>
              <button onClick={()=>moveLigne(l.id,'up')} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#555'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>↑</button>
              <button onClick={()=>moveLigne(l.id,'down')} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:11}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#555'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>↓</button>
              <button onClick={()=>deleteLigne(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:16}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>×</button>
            </div>}
          </td>
        </tr>
        </>
      )
    }

    return(
      <>
        <tr key={l.id} style={{background:'#fff'}}
          onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
          onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background='#fff'}>
          <td style={{padding:'8px 6px',width:60,textAlign:'left' as const,paddingLeft:10,borderRight:'1px solid #d0d0d0'}}><span style={{fontSize:11,color:'#333',fontWeight:400,fontFamily:'system-ui'}}>{getNumero(lignes,idx)}</span></td>
          <td style={{padding:'8px 8px',minWidth:240,borderRight:'1px solid #d0d0d0'}}>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:2}}>
                  {editMode&&<span style={{fontSize:8,fontWeight:700,padding:'1px 4px',borderRadius:4,background:l.type==='mo'?'#eff6ff':isOuvrage?'#f0fdf4':'#f3f4f6',color:l.type==='mo'?'#2563eb':isOuvrage?G:'#888',flexShrink:0,opacity:0.7}}>{l.type==='mo'?'MO':isOuvrage?'OUV':'MAT'}</span>}
                  <RichTextEditor value={l.designation||''} onChange={v=>updateLigne(l.id,'designation',v)} readOnly={!editMode}
                    placeholder="Désignation..." singleLine
                    defaultFont={params.police||'system-ui'}
                    style={{fontSize:13,fontWeight:600,color:'#111'}}/>
                </div>
                <div style={{marginTop:2}}>
                  <RichTextEditor value={l.description||''} onChange={v=>updateLigne(l.id,'description',v)} readOnly={!editMode}
                    placeholder="Description optionnelle..." singleLine
                    defaultFont={params.police||'system-ui'}
                    style={{fontSize:11,color:'#888'}}/>
                </div>
              </div>
            </div>
          </td>
          {/* QTÉ + UNITÉ */}
          <td style={{padding:'6px 8px',width:120,borderRight:'1px solid #d0d0d0'}}>
            {editMode?(
              <div style={{display:'flex',alignItems:'center',gap:4}}>
                <input type="number" value={l.qte||0} min={0} step={0.5}
                  onChange={e=>updateLigne(l.id,'qte',parseFloat(e.target.value)||0)}
                  style={{width:50,border:`1px solid ${BD}`,borderRadius:5,fontSize:12,padding:'4px 6px',outline:'none',textAlign:'right' as const,color:'#111'}}
                  onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                  onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                <select value={l.unite||''} onChange={e=>updateLigne(l.id,'unite',e.target.value)}
                  style={{border:`1px solid ${BD}`,borderRadius:5,fontSize:12,padding:'4px 4px',outline:'none',background:'#fff',color:'#111',cursor:'pointer'}}>
                  <option value="">-</option>
                  {UNITES.map(u=><option key={u} value={u}>{u}</option>)}
                </select>
              </div>
            ):(
              <div style={{fontSize:13,color:'#333',textAlign:'right' as const,padding:'4px 6px'}}>
                {l.qte||0} <span style={{fontSize:11,color:'#888'}}>{l.unite||''}</span>
              </div>
            )}
          </td>
          {/* PU HT */}
          <td style={{padding:'6px 4px',width:90,borderRight:'1px solid #d0d0d0'}}>
            {editMode?(
              <div style={{display:'flex',alignItems:'center',gap:3}}>
                <input type="number" value={l.pu||0} min={0}
                  onChange={e=>updateLigne(l.id,'pu',parseFloat(e.target.value)||0)}
                  style={{width:'60px',border:`1px solid ${BD}`,borderRadius:5,fontSize:12,padding:'4px 5px',outline:'none',textAlign:'right' as const,color:'#111'}}
                  onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                  onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                <span style={{fontSize:11,color:'#888',flexShrink:0}}>€</span>
              </div>
            ):(
              <div style={{fontSize:13,color:'#333',textAlign:'right' as const,padding:'4px 5px',cursor:'default'}}>
                {fmt(l.pu||0)} €
              </div>
            )}
          </td>
          {/* TVA */}
          <td style={{padding:'6px 4px',width:70,borderRight:'1px solid #d0d0d0'}}>
            {editMode?(
              <select value={l.tva||'20%'} onChange={e=>updateLigne(l.id,'tva',e.target.value)}
                style={{width:'60px',border:`1px solid ${BD}`,borderRadius:5,fontSize:12,padding:'4px',outline:'none',background:'#fff',color:'#111',cursor:'pointer'}}
                onFocus={e=>(e.currentTarget as HTMLSelectElement).style.borderColor=G}
                onBlur={e=>(e.currentTarget as HTMLSelectElement).style.borderColor=BD}>
                {TVA_OPTIONS.map(t=><option key={t}>{t}</option>)}
              </select>
            ):(
              <div style={{fontSize:13,color:'#333',textAlign:'center' as const,padding:'4px 5px',cursor:'default'}}>
                {l.tva||'20%'}
              </div>
            )}
          </td>
          <td style={{padding:'6px 4px',width:90,textAlign:'right' as const}}>
            <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(ht)} €</div>
            {editMode&&<div style={{fontSize:9,color:'#bbb'}}>TTC: {fmt(ht*(1+parseFloat((l.tva||'0%').replace('%',''))/100))} €</div>}
          </td>
          <td style={{padding:'8px 4px',width:40}}>
            {editMode&&<div className="row-actions" style={{display:'flex',flexDirection:'column' as const,gap:2,alignItems:'center',opacity:0,transition:'opacity 0.15s'}}>
              <button onClick={()=>moveLigne(l.id,'up')} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:12,padding:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#555'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>↑</button>
              <button onClick={()=>moveLigne(l.id,'down')} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:12,padding:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#555'} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>↓</button>
              <button onClick={()=>deleteLigne(l.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:16,padding:1}} onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD} onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>×</button>
            </div>}
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
            <td style={{padding:'5px 8px',textAlign:'right' as const}}><span style={{fontSize:11,color:'#555'}}>{fmt(li.qte*li.pu)} €</span></td>
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
      <style>{'tr:hover .row-actions { opacity: 1 !important; }'}</style>
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
            <button style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',fontWeight:500}}>Aperçu PDF</button>
            {editMode&&snapshot&&(
              <button onClick={annulerModifications} style={{padding:'8px 14px',background:'#fff',border:`1px solid ${RD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:RD,fontWeight:500}}>Annuler</button>
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
            <div style={{background:'#fff',borderRadius:0,border:'none',boxShadow:'0 2px 12px rgba(0,0,0,0.08)',overflow:'hidden'}}>

              {/* EN-TÊTE */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',borderBottom:`1px solid ${BD}`}}>
                <div style={{padding:'24px',borderRight:`1px solid ${BD}`,cursor:'pointer',position:'relative'}}
                  onClick={()=>setShowHeaderInfo(true)}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                  {/* Logo depuis Paramètres */}
                  {logoPreview&&(
                    <img src={logoPreview} alt="logo" style={{height:48,maxWidth:160,objectFit:'contain',display:'block',marginBottom:12}}/>
                  )}
                  <div style={{fontSize:15,fontWeight:800,color:'#111',marginBottom:6}}>
                    {params.nomEntreprise||'Mon entreprise'}
                    {params.showFormeJuridique&&params.formeJuridique?' — '+params.formeJuridique:''}
                  </div>
                  <div style={{fontSize:12,color:'#555',lineHeight:1.9}}>
                    {params.showAdresse&&params.adresseLigne1&&<div>{params.adresseLigne1}{params.codePostal?' '+params.codePostal:''}{params.ville?' '+params.ville:''}</div>}
                    {params.showTel&&params.tel&&<div>{params.tel}</div>}
                    {params.showEmail&&params.email&&<div>{params.email}</div>}
                    {params.showSiteWeb&&params.siteWeb&&<div>{params.siteWeb}</div>}
                  </div>
                  <div style={{position:'absolute',top:8,right:8,fontSize:10,color:'#bbb',background:'#f3f4f6',padding:'2px 7px',borderRadius:4}}>Modifier dans Paramètres</div>
                </div>
                <div style={{padding:'24px'}}>

                  {client?(
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:4}}>{client.nom}</div>
                      <div style={{fontSize:12,color:'#555',lineHeight:1.8}}>
                        <div>{client.adresse}</div>
                        <div>{client.email}</div>
                        <div>{client.tel}</div>
                        {client.siret&&<div style={{color:'#888',fontSize:11}}>SIRET: {client.siret}</div>}
                      </div>
                      {editMode&&<button onClick={()=>{setClientSearch(client?.nom||'');setShowClientDD(true);setClient(null)}}
                        style={{position:'absolute',top:8,right:8,background:'none',border:'none',cursor:'pointer',color:'#ccc',fontSize:14,lineHeight:1,padding:2}}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#555'}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ccc'}>✏</button>}
                    </div>
                  ):(
                    <div>
                    <div style={{background:'#f3f4f6',borderRadius:8,padding:'12px 14px',marginBottom:10,fontSize:12,color:'#aaa',fontStyle:'italic',minHeight:60,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      Aucun client sélectionné
                    </div>
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
              <div style={{padding:'14px 24px',borderBottom:`1px solid ${BD}`,background:'#fafafa',display:'flex',gap:20,flexWrap:'wrap' as const,alignItems:'flex-end'}}>
                <div>
                  <label style={{fontSize:11,color:'#444',fontWeight:500,display:'block',marginBottom:3}}>Devis n°</label>
                  {numeroDevis?(
                    <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{numeroDevis}</div>
                  ):(
                    <div onClick={()=>setShowNumeroModal(true)}
                      style={{fontSize:13,fontWeight:600,color:'#aaa',fontStyle:'italic',cursor:'pointer',padding:'3px 8px',borderRadius:6,border:'1px dashed #d1d5db',display:'inline-block',transition:'all 0.15s'}}
                      onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=G;d.style.color=G}}
                      onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#d1d5db';d.style.color='#aaa'}}>
                      Sans numéro
                    </div>
                  )}
                </div>
                <div><label style={{fontSize:11,color:'#444',fontWeight:500,display:'block',marginBottom:3}}>Date</label>
                  <input type="date" value={dateDevis} onChange={e=>setDateDevis(e.target.value)} disabled={!editMode} style={{padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,outline:'none',color:'#111'}}/></div>
                <div><label style={{fontSize:11,color:'#444',fontWeight:500,display:'block',marginBottom:3}}>Validité</label>
                  <input value={validite} onChange={e=>setValidite(e.target.value)} disabled={!editMode} style={{width:80,padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,outline:'none',color:'#111'}}/></div>
                <div style={{flex:1,position:'relative'}}>
                  <label style={{fontSize:11,color:'#444',fontWeight:500,display:'block',marginBottom:3}}>Adresse du projet</label>
                  {adresseMode===null&&(
                    <div onClick={()=>setShowAdresseMenu(!showAdresseMenu)}
                      style={{padding:'5px 10px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,color:'#aaa',cursor:'pointer',background:'#fff',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span>Optionnel — cliquez pour définir</span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  )}
                  {adresseMode==='client'&&(
                    <div style={{padding:'5px 10px',border:`1px solid ${G}`,borderRadius:6,fontSize:12,color:'#555',background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                      <span>{client?.adresse||'Adresse client non renseignée'}</span>
                      <button onClick={()=>{setAdresseMode(null);setAdresseProjet('')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14}}>×</button>
                    </div>
                  )}
                  {adresseMode==='manuel'&&(
                    <div style={{display:'flex',gap:6}}>
                      <input value={adresseProjet} onChange={e=>setAdresseProjet(e.target.value)} placeholder="Saisir l'adresse du projet..."
                        style={{flex:1,padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,outline:'none',color:'#111'}}/>
                      <button onClick={()=>{setAdresseMode(null);setAdresseProjet('')}} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}>×</button>
                    </div>
                  )}
                  {showAdresseMenu&&adresseMode===null&&(
                    <div style={{position:'absolute',top:'110%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:200,overflow:'hidden'}}>
                      <div onClick={()=>{setAdresseMode('client');setAdresseProjet(client?.adresse||'');setShowAdresseMenu(false)}}
                        style={{padding:'10px 14px',cursor:'pointer',borderBottom:`1px solid #f3f4f6`,fontSize:13}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        <div style={{fontWeight:600,color:'#111'}}>📍 Utiliser l\'adresse du client</div>
                        <div style={{fontSize:11,color:'#888',marginTop:1}}>{client?.adresse||'Sélectionnez d\'abord un client'}</div>
                      </div>
                      <div onClick={()=>{setAdresseMode('manuel');setShowAdresseMenu(false)}}
                        style={{padding:'10px 14px',cursor:'pointer',borderBottom:`1px solid #f3f4f6`,fontSize:13}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f0fdf4'}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                        <div style={{fontWeight:600,color:'#111'}}>✏️ Saisir une autre adresse</div>
                        <div style={{fontSize:11,color:'#888',marginTop:1}}>Adresse de chantier différente</div>
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
              </div>

              {/* TITRE */}
              <div style={{padding:'12px 24px',textAlign:'center' as const}}>
                <RichTextEditor value={titre} onChange={setTitre} readOnly={!editMode}
                  placeholder="Titre du devis (optionnel)"
                  defaultFont={params.police||'Georgia,serif'}
                  style={{textAlign:'center' as const,fontSize:15,fontStyle:'italic',color:'#555',minHeight:28}}/>
              </div>

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
                      <th style={{padding:'10px 10px',fontSize:12,color:'#111',fontWeight:700,textAlign:'left' as const,width:60,borderRight:'1px solid #d0d0d0'}}>N°</th>
                      <th style={{padding:'10px 8px',fontSize:12,color:'#111',fontWeight:700,textAlign:'left' as const,borderRight:'1px solid #d0d0d0'}}>Désignation</th>
                      <th style={{padding:'10px 4px',fontSize:12,color:'#111',fontWeight:700,textAlign:'right' as const,width:70,borderRight:'1px solid #d0d0d0'}}>Qté</th>
                      <th style={{padding:'10px 4px',fontSize:12,color:'#111',fontWeight:700,textAlign:'right' as const,width:90,borderRight:'1px solid #d0d0d0'}}>PU HT</th>
                      <th style={{padding:'10px 4px',fontSize:12,color:'#111',fontWeight:700,textAlign:'center' as const,width:70,borderRight:'1px solid #d0d0d0'}}>TVA</th>
                      <th style={{padding:'10px 8px',fontSize:12,color:'#111',fontWeight:700,textAlign:'right' as const,width:110}}>Total HT</th>
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

              {/* BOUTONS AJOUT */}
              <div style={{padding:'12px 24px',borderTop:`1px solid ${BD}`,borderBottom:`1px solid ${BD}`,background:'#fafafa'}}>
                <div style={{display:'flex',gap:8,flexWrap:'wrap' as const,alignItems:'center'}}>
                  <span style={{fontSize:10,color:'#aaa',fontWeight:700,letterSpacing:'0.06em'}}>LIGNE</span>
                  {[{label:'+ Matériau',type:'materiau' as const,bg:'#f3f4f6',color:'#555'},{label:"+ Main d'oeuvre",type:'mo' as const,bg:'#eff6ff',color:'#2563eb'},{label:'+ Ouvrage',type:'ouvrage' as const,bg:'#f0fdf4',color:G}].map(btn=>(
                    <button key={btn.type} onClick={()=>editMode&&setShowBiblio(btn.type)}
                      style={{padding:'6px 14px',opacity:editMode?1:0.4,cursor:editMode?'pointer':'not-allowed',background:btn.bg,color:btn.color,border:`1px solid ${btn.color}30`,borderRadius:20,fontSize:12,fontWeight:600}}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.opacity='0.8'}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.opacity='1'}>
                      {btn.label}
                    </button>
                  ))}
                  <div style={{width:1,height:18,background:BD,margin:'0 4px'}}/>
                  <span style={{fontSize:10,color:'#aaa',fontWeight:700,letterSpacing:'0.06em'}}>STRUCTURE</span>
                  {[{label:'Catégorie',type:'categorie' as const},{label:'Sous-catégorie',type:'sous-categorie' as const},{label:'Note',type:'note' as const},{label:'Saut de page',type:'saut-page' as const}].map(btn=>(
                    <button key={btn.type} onClick={()=>editMode&&addLigne(btn.type)}
                      style={{padding:'6px 12px',opacity:editMode?1:0.4,cursor:editMode?'pointer':'not-allowed',background:'#fff',color:'#555',border:`1px solid ${BD}`,borderRadius:20,fontSize:12}}
                      onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor='#888'}
                      onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=BD}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* PIED DE PAGE */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 320px'}}>
                <div style={{padding:'20px 24px',borderRight:`1px solid ${BD}`}}>
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',display:'block',marginBottom:5}}>Conditions de paiement</label>
                    <textarea value={condPaiement} onChange={e=>setCondPaiement(e.target.value)} disabled={!editMode} rows={2}
                      style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,color:'#555',outline:'none',resize:'none' as const,fontFamily:'system-ui',boxSizing:'border-box' as const}}/>
                  </div>
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',display:'block',marginBottom:5}}>Acompte</label>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <input type="number" value={acompte} min={0} onChange={e=>setAcompte(parseFloat(e.target.value)||0)} disabled={!editMode}
                        style={{width:80,padding:'6px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,outline:'none',color:'#111',textAlign:'right' as const}}/>
                      <select value={acomptePct?'%':'€'} onChange={e=>setAcomptePct(e.target.value==='%')}
                        style={{padding:'6px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,outline:'none',background:'#fff',color:'#111'}}>
                        <option>%</option><option>€</option>
                      </select>
                      {acompte>0&&<span style={{fontSize:12,color:'#555'}}>{fmt(acompteMt)} €</span>}
                    </div>
                  </div>
                  <div>
                    <label style={{fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',display:'block',marginBottom:5}}>Notes & mentions</label>
                    <textarea value={notes} onChange={e=>setNotes(e.target.value)} disabled={!editMode} rows={3} placeholder="Conditions particulières, délais, garanties..."
                      style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,color:'#555',outline:'none',resize:'none' as const,fontFamily:'system-ui',boxSizing:'border-box' as const}}/>
                  </div>
                </div>
                <div style={{padding:'20px 24px'}}>
                  <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                    {[
                      remise>0?{label:'Sous-total HT',val:fmt(totalHT)+' €',bold:true}:null,
                      remise>0?{label:params.libelleRemise||'Remise exceptionnelle',val:'− '+fmt(remiseMt)+' €',bold:false,red:true}:null,
                      {label:'Total HT',val:fmt(totalHT-remiseMt)+' €',bold:true},
                      {label:'TVA',val:fmt(totalTVA)+' €',bold:false},
                      {label:'Total TTC',val:fmt(totalTTC-remiseMt)+' €',bold:true},
                      primeCEE>0?{label:params.libellePrime||primeCEELabel||'Prime Maprimerénov',val:'− '+fmt(primeCEE)+' €',bold:false,red:true}:null,
                    ].filter(Boolean).map((row:any)=>(
                      <div key={row.label} style={{display:'flex',justifyContent:'space-between',fontSize:13,paddingBottom:4,paddingTop:4,borderBottom:`1px solid #f3f4f6`}}>
                        <span style={{color:row.bold?'#111':'#555',fontWeight:row.bold?700:400}}>{row.label}</span>
                        <span style={{fontWeight:row.bold?700:400,color:row.red?RD:'#111'}}>{row.val}</span>
                      </div>
                    ))}
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,fontSize:13}}>
                      <span style={{color:'#555',flexShrink:0}}>Remise</span>
                      <div style={{display:'flex',gap:4,alignItems:'center'}}>
                        <input type="number" value={remise} min={0} onChange={e=>setRemise(parseFloat(e.target.value)||0)} disabled={!editMode}
                          style={{width:55,padding:'4px 6px',border:`1px solid ${BD}`,borderRadius:5,fontSize:12,outline:'none',textAlign:'right' as const,color:'#111'}}/>
                        <select value={remisePct?'%':'€'} onChange={e=>setRemisePct(e.target.value==='%')}
                          style={{padding:'4px 5px',border:`1px solid ${BD}`,borderRadius:5,fontSize:11,outline:'none',background:'#fff',color:'#111'}}>
                          <option>%</option><option>€</option>
                        </select>
                        {remise>0&&<span style={{fontSize:11,color:RD}}>−{fmt(remiseMt)} €</span>}
                      </div>
                    </div>
                    <div style={{background:'#fff8f0',border:'1px solid #fde8c8',borderRadius:8,padding:'10px 12px'}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:6}}>
                          <input value={primeCEELabel||'Prime non soumise à TVA à déduire…'} onChange={e=>setPrimeCEELabel(e.target.value)}
                            style={{border:'none',background:'transparent',fontSize:12,color:'#555',outline:'none',fontStyle:'italic',minWidth:200,fontFamily:'system-ui'}}/>
                          <div style={{position:'relative',display:'inline-block'}}>
                            <span style={{width:16,height:16,borderRadius:'50%',background:'#f59e0b',color:'#fff',fontSize:10,fontWeight:700,display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'help'}}>?</span>
                            <div style={{position:'absolute',bottom:'120%',left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',fontSize:11,padding:'8px 12px',borderRadius:8,whiteSpace:'nowrap' as const,zIndex:300,width:260,textAlign:'center' as const,lineHeight:1.5,pointerEvents:'none',opacity:0,transition:'opacity 0.2s'}}
                              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'}
                              className="tooltip-content">
                              Déduisez vos primes non assujetties à la TVA (ex. CEE, MaPrimeRénov'…)
                            </div>
                          </div>
                        </div>
                        <div style={{display:'flex',gap:4,alignItems:'center'}}>
                          <input type="number" value={primeCEE} min={0} onChange={e=>setPrimeCEE(parseFloat(e.target.value)||0)} disabled={!editMode}
                            style={{width:65,padding:'4px 6px',border:'1px solid #fde8c8',borderRadius:5,fontSize:12,outline:'none',textAlign:'right' as const,color:'#111',background:'#fff'}}/>
                          <span style={{fontSize:11,color:'#888'}}>€</span>
                          {primeCEE>0&&<span style={{fontSize:11,color:RD,fontWeight:600}}>−{fmt(primeCEE)} €</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{background:'#f0fdf4',borderRadius:8,padding:'12px',display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:4}}>
                      <span style={{fontSize:15,fontWeight:700,color:'#111'}}>'Reste à payer'</span>
                      <span style={{fontSize:18,fontWeight:800,color:G}}>{fmt(netAPayer)} €</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SIGNATURES */}
              <div style={{padding:'20px 24px',borderTop:`1px solid ${BD}`,display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
                {/* Client */}
                <div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',gap:6}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111',textAlign:'center' as const}}>{params.texteClient||'Le client'}</div>
                  {params.mentionClient&&<div style={{fontSize:11,color:'#555',fontStyle:'italic',textAlign:'center' as const,lineHeight:1.5}}>{params.mentionClient}</div>}
                  <div style={{width:'100%',height:params.tailleSignature==='petit'?40:params.tailleSignature==='grand'?80:60,border:`1px solid ${BD}`,borderRadius:8,marginTop:4}}/>
                </div>
                {/* Entreprise */}
                <div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',gap:6}}>
                  <div style={{fontSize:13,fontWeight:700,color:'#111',textAlign:'center' as const}}>{params.nomSignataireEntreprise||"L'entreprise"}</div>
                  <div style={{width:'100%',height:params.tailleSignature==='petit'?40:params.tailleSignature==='grand'?80:60,border:`1px solid ${BD}`,borderRadius:8,marginTop:4}}/>
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
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowBiblio(null);setBiblioSearch('')}}>
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
            <button onClick={()=>addLigne(showBiblio==='ouvrage'?'ouvrage':showBiblio)}
              style={{padding:'9px 14px',background:'#f0fdf4',border:`1px solid ${G}40`,borderRadius:8,fontSize:13,fontWeight:600,color:G,cursor:'pointer',textAlign:'left' as const,flexShrink:0}}>
              + {showBiblio==='materiau'?'Nouveau matériau (vide)':showBiblio==='mo'?"Nouvelle main d'œuvre (vide)":'Nouvel ouvrage vide (sur ce devis uniquement)'}
            </button>

            {/* Liste */}
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:6}}>
              {(showBiblio==='materiau'?biblioMats:showBiblio==='mo'?biblioMO:biblioOuvrages)
                .filter((item:any)=>!biblioSearch||item.nom.toLowerCase().includes(biblioSearch.toLowerCase()))
                .map((item:any,i)=>(
                <div key={i} onClick={()=>addLigne(showBiblio==='ouvrage'?'ouvrage':showBiblio,item)}
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
            <div style={{fontSize:13,color:'#888',marginBottom:18}}>Total TTC du devis : <strong style={{color:'#111'}}>{fmt(totalTTC)} €</strong></div>
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
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:8}}>Modifier mon en-tête</div>
            <p style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:16}}>L'apparence de vos documents est paramétrable depuis la page Paramètres.</p>
            <a href="/parametres" style={{display:'inline-block',padding:'10px 20px',background:G,color:'#fff',borderRadius:8,textDecoration:'none',fontSize:13,fontWeight:600}}>Aller aux Paramètres →</a>
          </div>
        </div>
      )}

      {(showClientDD||showFactureMenu)&&<div onClick={()=>{setShowClientDD(false);setShowFactureMenu(false)}} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',zIndex:50}}/>}

      {showSaved&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span><span style={{fontSize:13}}>Devis enregistré</span>
        </div>
      )}
    </div>
  )
}

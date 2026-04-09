'use client'
import React from 'react'
import { useState } from 'react'
import Sidebar from '../components/Sidebar'

const G='#1D9E75', AM='#BA7517', RD='#E24B4A', BD='#e5e7eb'

const UNITES_MAT = ['u','ens','m²','ml','m³','Mois','Fft','Forf','Personnalisé']
const UNITES_MO = ['h','u','ens','m²','ml','m³','Mois','Fft','Forf','Personnalisé']
const TVA_OPTIONS = ['20%','10%','5.5%','0%']
const DEFAULT_CATEGORIES = [
  {nom:'Électricité',couleur:'#2563eb'},
  {nom:'Plomberie',couleur:'#0891b2'},
  {nom:'Carrelage',couleur:'#7c3aed'},
  {nom:'Peinture',couleur:'#dc2626'},
  {nom:'Parquet',couleur:'#92400e'},
  {nom:'Menuiserie',couleur:'#065f46'},
  {nom:'Maçonnerie',couleur:'#374151'},
  {nom:'Plâtrerie',couleur:'#6b7280'},
  {nom:'Couverture',couleur:'#1D9E75'},
  {nom:'Autre',couleur:'#888888'},
]
type Categorie = {nom:string; couleur:string}

type Unite = string
type Tva = string

type Materiau = {
  id:string; nom:string; description:string; unite:Unite; tva:Tva
  debourse:number; prixFacture:number; categorie:string
  notes?:string; tags?:string; uniteCustom?:string
  prixFournisseur?:number; coeffMarge?:number; fournisseur?:string
  photo?:string; lienFournisseur?:string
}
type MainOeuvre = {
  id:string; nom:string; description:string; unite:Unite; tva:Tva
  debourse:number; prixFacture:number; categorie:string
  notes?:string; tags?:string; uniteCustom?:string
  prixFournisseur?:number; coeffMarge?:number; fournisseur?:string
  photo?:string; lienFournisseur?:string
}
type LigneOuvrage = { type:'materiau'|'mo'; id:string; nom:string; qte:number; pu:number }
type Ouvrage = {
  id:string; nom:string; description:string; unite:Unite; tva:Tva
  debourse:number; prixFacture:number; categorie:string
  lignes:LigneOuvrage[]
  notes?:string; tags?:string; uniteCustom?:string
  prixFournisseur?:number; coeffMarge?:number; fournisseur?:string
  photo?:string; lienFournisseur?:string
}

const initMateriaux:Materiau[] = [
  {id:'m1',nom:'Parquet chêne massif 12mm',description:'Parquet chêne massif, finition huilée, format 12mm',unite:'m²',tva:'20%',debourse:28,prixFacture:68,categorie:'Parquet'},
  {id:'m2',nom:'Carrelage 60x60 grès cérame',description:'Carrelage grand format, rectifié, imitation béton',unite:'m²',tva:'20%',debourse:32,prixFacture:85,categorie:'Carrelage'},
  {id:'m3',nom:'Peinture murale mate',description:'Peinture murale mate lessivable, 2 couches',unite:'m²',tva:'20%',debourse:4,prixFacture:22,categorie:'Peinture'},
  {id:'m4',nom:'Tableau électrique 13 disjoncteurs',description:'Coffret complet 13 postes avec protection différentielle',unite:'u',tva:'20%',debourse:180,prixFacture:480,categorie:'Électricité'},
  {id:'m5',nom:'Robinetterie mitigeur thermostatique',description:'Mitigeur thermostatique bain/douche, chromé',unite:'u',tva:'20%',debourse:120,prixFacture:280,categorie:'Plomberie'},
]
const initMO:MainOeuvre[] = [
  {id:'mo1',nom:'Pose parquet',description:'Pose parquet collé ou flottant, préparation support',unite:'m²',tva:'10%',debourse:15,prixFacture:35,categorie:'Parquet'},
  {id:'mo2',nom:'Électricien qualifié',description:'Intervention électricien, taux horaire chargé',unite:'h',tva:'20%',debourse:45,prixFacture:65,categorie:'Électricité'},
  {id:'mo3',nom:'Plombier qualifié',description:'Intervention plombier, taux horaire chargé',unite:'h',tva:'20%',debourse:48,prixFacture:70,categorie:'Plomberie'},
  {id:'mo4',nom:'Peintre qualifié',description:'Peintre en bâtiment, taux horaire chargé',unite:'h',tva:'10%',debourse:35,prixFacture:55,categorie:'Peinture'},
]
const initOuvrages:Ouvrage[] = [
  {id:'o1',nom:'Pose parquet complet 45m²',description:'Fourniture et pose parquet chêne massif 12mm, préparation support',unite:'m²',tva:'10%',debourse:43,prixFacture:103,categorie:'Parquet',
    lignes:[{type:'materiau',id:'m1',nom:'Parquet chêne massif 12mm',qte:1,pu:28},{type:'mo',id:'mo1',nom:'Pose parquet',qte:1,pu:15}]},
  {id:'o2',nom:'Installation tableau électrique',description:'Fourniture et pose tableau électrique 13 disjoncteurs, raccordement',unite:'u',tva:'20%',debourse:360,prixFacture:850,categorie:'Électricité',
    lignes:[{type:'materiau',id:'m4',nom:'Tableau électrique 13 disjoncteurs',qte:1,pu:180},{type:'mo',id:'mo2',nom:'Électricien qualifié',qte:4,pu:45}]},
]

const fmt = (n:number) => n.toLocaleString('fr-FR',{minimumFractionDigits:0,maximumFractionDigits:2}) + ' €'
const marge = (d:number, p:number) => p>0 ? Math.round((p-d)/p*100) : 0
const margeColor = (m:number) => m>=60?G:m>=40?AM:RD

type Tab = 'ouvrages'|'materiaux'|'mo'
type PanelMode = 'add'|'edit'|null
type PanelType = 'ouvrage'|'materiau'|'mo'

const emptyMat = ():Omit<Materiau,'id'> => ({nom:'',description:'',unite:'u',tva:'20%',debourse:0,prixFacture:0,categorie:'Autre',notes:'',tags:'',uniteCustom:''})
const emptyMO = ():Omit<MainOeuvre,'id'> => ({nom:'',description:'',unite:'h',tva:'20%',debourse:0,prixFacture:0,categorie:'Autre',notes:'',tags:'',uniteCustom:''})
const emptyOuvrage = ():Omit<Ouvrage,'id'> => ({nom:'',description:'',unite:'u',tva:'20%',debourse:0,prixFacture:0,categorie:'Autre',lignes:[],notes:'',tags:'',uniteCustom:''})


// Mini éditeur de texte riche
const RichEditor=({value,onChange,placeholder}:{value:string,onChange:(v:string)=>void,placeholder?:string})=>{
  const ref = React.useRef<HTMLDivElement>(null)
  const[showColorPicker,setShowColorPicker]=React.useState(false)
  const[fontSize,setFontSize]=React.useState('14')
  const colors=['#111111','#E24B4A','#1D9E75','#2563eb','#BA7517','#7c3aed','#888888']

  const exec=(cmd:string,val?:string)=>{
    document.execCommand(cmd,false,val)
    if(ref.current) onChange(ref.current.innerHTML)
    ref.current?.focus()
  }

  const BtnTool=({onClick,active,title,children}:{onClick:()=>void,active?:boolean,title:string,children:any})=>(
    <button type="button" onClick={onClick} title={title}
      style={{padding:'4px 7px',border:`1px solid ${active?'#1D9E75':'#e5e7eb'}`,borderRadius:5,background:active?'#f0fdf4':'#fff',cursor:'pointer',fontSize:12,fontWeight:600,color:active?'#1D9E75':'#444',transition:'all 0.1s',minWidth:26,display:'flex',alignItems:'center',justifyContent:'center'}}>
      {children}
    </button>
  )

  return(
    <div style={{border:'1px solid #e5e7eb',borderRadius:8,overflow:'visible',background:'#fff'}}
      onFocus={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#1D9E75'}
      onBlur={e=>(e.currentTarget as HTMLDivElement).style.borderColor='#e5e7eb'}>
      {/* Barre outils */}
      <div style={{display:'flex',gap:4,padding:'6px 8px',borderBottom:'1px solid #f3f4f6',flexWrap:'wrap' as const,alignItems:'center',background:'#f9fafb',borderRadius:'8px 8px 0 0'}}>
        <BtnTool onClick={()=>exec('bold')} title="Gras"><strong>G</strong></BtnTool>
        <BtnTool onClick={()=>exec('italic')} title="Italique"><em>I</em></BtnTool>
        <BtnTool onClick={()=>exec('underline')} title="Souligné"><u>S</u></BtnTool>
        <div style={{width:1,height:18,background:'#e5e7eb',margin:'0 2px'}}/>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <button type="button" onClick={()=>exec('fontSize','2')} title="Petit" style={{padding:'3px 6px',border:'1px solid #e5e7eb',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:10,color:'#444'}}>A</button>
          <button type="button" onClick={()=>exec('fontSize','3')} title="Normal" style={{padding:'3px 6px',border:'1px solid #e5e7eb',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:13,color:'#444'}}>A</button>
          <button type="button" onClick={()=>exec('fontSize','5')} title="Grand" style={{padding:'3px 6px',border:'1px solid #e5e7eb',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:16,color:'#444',fontWeight:600}}>A</button>
        </div>
        <div style={{width:1,height:18,background:'#e5e7eb',margin:'0 2px'}}/>
        <div style={{position:'relative'}}>
          <button type="button" onClick={()=>setShowColorPicker(!showColorPicker)} title="Couleur du texte"
            style={{padding:'4px 8px',border:'1px solid #e5e7eb',borderRadius:5,background:'#fff',cursor:'pointer',fontSize:12,display:'flex',alignItems:'center',gap:4}}>
            A <span style={{width:10,height:4,background:'#E24B4A',borderRadius:2,display:'inline-block'}}/>
          </button>
          {showColorPicker&&(
            <div style={{position:'absolute',top:'110%',left:0,background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,padding:8,display:'flex',gap:6,zIndex:999,boxShadow:'0 4px 12px rgba(0,0,0,0.1)'}}>
              {colors.map(col=>(
                <button key={col} type="button" onClick={()=>{exec('foreColor',col);setShowColorPicker(false)}}
                  style={{width:20,height:20,borderRadius:'50%',background:col,border:'2px solid #fff',cursor:'pointer',boxShadow:'0 0 0 1px #e5e7eb'}}/>
              ))}
            </div>
          )}
        </div>
        <div style={{width:1,height:18,background:'#e5e7eb',margin:'0 2px'}}/>
        <BtnTool onClick={()=>exec('justifyLeft')} title="Gauche">⬅</BtnTool>
        <BtnTool onClick={()=>exec('justifyCenter')} title="Centrer">⬛</BtnTool>
        <BtnTool onClick={()=>exec('justifyRight')} title="Droite">➡</BtnTool>
        <div style={{width:1,height:18,background:'#e5e7eb',margin:'0 2px'}}/>
        <BtnTool onClick={()=>exec('insertUnorderedList')} title="Liste">• —</BtnTool>
      </div>
      {/* Zone de texte */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={()=>{if(ref.current)onChange(ref.current.innerHTML)}}
        dangerouslySetInnerHTML={{__html:value||''}}
        data-placeholder={placeholder||'Rédigez votre description...'}
        style={{minHeight:100,padding:'10px 12px',fontSize:13,color:'#111',outline:'none',lineHeight:1.6,fontFamily:'system-ui,sans-serif'}}/>
    </div>
  )
}

export default function BibliothequePage() {
  const[tab,setTab]=useState<Tab>('ouvrages')
  const[search,setSearch]=useState('')
  const[catFiltre,setCatFiltre]=useState('')
  const[materiaux,setMateriaux]=useState<Materiau[]>(initMateriaux)
  const[mo,setMO]=useState<MainOeuvre[]>(initMO)
  const[ouvrages,setOuvrages]=useState<Ouvrage[]>(initOuvrages)
  const[panel,setPanel]=useState<PanelMode>(null)
  const[panelType,setPanelType]=useState<PanelType>('ouvrage')
  const[editId,setEditId]=useState<string|null>(null)
  const[form,setForm]=useState<any>({})
  const[deleteConfirm,setDeleteConfirm]=useState<string|null>(null)
  const[showBiblioMat,setShowBiblioMat]=useState(false)
  const[showBiblioMO,setShowBiblioMO]=useState(false)
  const[toast,setToast]=useState('')
  const[categories,setCategories]=useState<Categorie[]>(DEFAULT_CATEGORIES)
  const[showCatModal,setShowCatModal]=useState(false)
  const[newCatNom,setNewCatNom]=useState('')
  const[newCatCouleur,setNewCatCouleur]=useState('#1D9E75')
  const handlePhotoItem=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file)return
    const reader=new FileReader()
    reader.onload=ev=>setForm((p:any)=>({...p,photo:ev.target?.result as string}))
    reader.readAsDataURL(file)
  }
  const ajouterCategorie=()=>{
    if(!newCatNom.trim())return
    if(categories.find(c=>c.nom===newCatNom.trim()))return
    setCategories(p=>[...p,{nom:newCatNom.trim(),couleur:newCatCouleur}])
    setNewCatNom('');setNewCatCouleur('#1D9E75')
  }
  const supprimerCategorie=(nom:string)=>{
    if(['Autre'].includes(nom))return
    setCategories(p=>p.filter(c=>c.nom!==nom))
  }
  const catColor=(nom:string)=>categories.find(c=>c.nom===nom)?.couleur||'#888'

  const showToast=(msg:string)=>{setToast(msg);setTimeout(()=>setToast(''),3000)}

  const openAdd=(type:PanelType)=>{
    setPanelType(type)
    setForm(type==='ouvrage'?emptyOuvrage():type==='materiau'?emptyMat():emptyMO())
    setEditId(null)
    setPanel('add')
  }
  const openEdit=(type:PanelType,item:any)=>{
    setPanelType(type)
    setForm({...item})
    setEditId(item.id)
    setPanel('edit')
  }
  const closePanel=()=>{setPanel(null);setEditId(null);setForm({})}

  const genId=()=>Math.random().toString(36).slice(2,8)

  const save=()=>{
    if(!form.nom?.trim()){showToast('Le nom est obligatoire');return}
    if(panelType==='materiau'){
      if(panel==='edit') setMateriaux(p=>p.map(m=>m.id===editId?{...form,id:editId}:m))
      else setMateriaux(p=>[...p,{...form,id:genId()}])
    } else if(panelType==='mo'){
      if(panel==='edit') setMO(p=>p.map(m=>m.id===editId?{...form,id:editId}:m))
      else setMO(p=>[...p,{...form,id:genId()}])
    } else {
      // recalculer debourse depuis les lignes
      const debAuto = form.lignes?.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)||form.debourse
      const f={...form,debourse:debAuto}
      if(panel==='edit') setOuvrages(p=>p.map(o=>o.id===editId?{...f,id:editId}:o))
      else setOuvrages(p=>[...p,{...f,id:genId()}])
    }
    showToast(panel==='edit'?'Modifié avec succès':'Ajouté avec succès')
    closePanel()
  }

  const dupliquer=(type:PanelType,item:any)=>{
    const newItem={...item,id:genId(),nom:item.nom+' (copie)'}
    if(type==='materiau') setMateriaux(p=>[...p,newItem])
    else if(type==='mo') setMO(p=>[...p,newItem])
    else setOuvrages(p=>[...p,newItem])
    showToast('Dupliqué avec succès')
  }

  const supprimer=(type:PanelType,id:string)=>{
    if(type==='materiau') setMateriaux(p=>p.filter(m=>m.id!==id))
    else if(type==='mo') setMO(p=>p.filter(m=>m.id!==id))
    else setOuvrages(p=>p.filter(o=>o.id!==id))
    setDeleteConfirm(null)
    showToast('Supprimé')
  }

  const ajouterLigne=(type:'materiau'|'mo',item:any)=>{
    const ligne:LigneOuvrage={type,id:item.id,nom:item.nom,qte:1,pu:item.debourse}
    const newLignes=[...(form.lignes||[]),ligne]
    const debAuto=newLignes.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)
    setForm((p:any)=>({...p,lignes:newLignes,debourse:debAuto,description:p.description+(p.description?'\n':'')+item.nom+' - '+item.description}))
    setShowBiblioMat(false);setShowBiblioMO(false)
  }

  const updateLigne=(idx:number,field:string,val:any)=>{
    const newLignes=form.lignes.map((l:LigneOuvrage,i:number)=>i===idx?{...l,[field]:val}:l)
    const debAuto=newLignes.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)
    setForm((p:any)=>({...p,lignes:newLignes,debourse:debAuto}))
  }
  const removeLigne=(idx:number)=>{
    const newLignes=form.lignes.filter((_:any,i:number)=>i!==idx)
    const debAuto=newLignes.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)
    setForm((p:any)=>({...p,lignes:newLignes,debourse:debAuto}))
  }

  const filtered=(items:any[])=>items.filter(i=>{
    const q=search.toLowerCase()
    const matchSearch=!search||i.nom.toLowerCase().includes(q)||i.description?.toLowerCase().includes(q)||i.categorie?.toLowerCase().includes(q)
    const matchCat=!catFiltre||i.categorie===catFiltre
    return matchSearch&&matchCat
  })

  const fOuvrages=filtered(ouvrages)
  const fMats=filtered(materiaux)
  const fMO=filtered(mo)

  const margeMoyenne=(items:any[])=>items.length?Math.round(items.reduce((s,i)=>s+marge(i.debourse,i.prixFacture),0)/items.length):0

  // Composant carte
  const Carte=({type,item}:{type:PanelType,item:any})=>{
    const m=marge(item.debourse,item.prixFacture)
    return(
      <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,padding:'16px',position:'relative',transition:'box-shadow 0.15s'}}
        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.boxShadow='0 2px 12px rgba(0,0,0,0.08)'}
        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.boxShadow=''}>
        {item.photo&&(
          <div style={{height:100,margin:'-16px -16px 12px',overflow:'hidden',borderRadius:'12px 12px 0 0'}}>
            <img src={item.photo} alt={item.nom} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
          <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:`${catColor(item.categorie)}18`,color:catColor(item.categorie)}}>{item.categorie}</span>
          <div style={{display:'flex',gap:4}}>
            <button onClick={()=>dupliquer(type,item)} title="Dupliquer"
              style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14,padding:3,borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#2563eb'}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>📋</button>
            <button onClick={()=>openEdit(type,item)} title="Modifier"
              style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14,padding:3,borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=G}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>✏️</button>
            <button onClick={()=>setDeleteConfirm(item.id)} title="Supprimer"
              style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14,padding:3,borderRadius:4,transition:'color 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>🗑</button>
          </div>
        </div>
        <div style={{fontSize:14,fontWeight:700,color:'#111',marginBottom:4,lineHeight:1.3}}>{item.nom}</div>
        {item.description&&<div style={{fontSize:12,color:'#777',marginBottom:8,lineHeight:1.4}}>{item.description}</div>}
        <div style={{fontSize:12,color:'#888',marginBottom:10}}>{item.unite} · TVA {item.tva}</div>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:8}}>
          <div>
            <div style={{fontSize:11,color:'#888'}}>Déboursé</div>
            <div style={{fontSize:14,fontWeight:600,color:'#555'}}>{fmt(item.debourse)}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'#888'}}>Prix facturé</div>
            <div style={{fontSize:16,fontWeight:700,color:'#111'}}>{fmt(item.prixFacture)}</div>
          </div>
        </div>
        {/* Barre marge */}
        <div style={{marginTop:4}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:3}}>
            <span style={{fontSize:11,color:'#888'}}>Marge</span>
            <span style={{fontSize:12,fontWeight:700,color:margeColor(m)}}>{m}%</span>
          </div>
          <div style={{height:4,background:'#f3f4f6',borderRadius:4,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${Math.min(m,100)}%`,background:margeColor(m),borderRadius:4,transition:'width 0.3s'}}></div>
          </div>
        </div>
        {/* Lien fournisseur */}
        {item.lienFournisseur&&(
          <a href={item.lienFournisseur} target="_blank" rel="noreferrer"
            style={{fontSize:11,color:'#2563eb',display:'inline-flex',alignItems:'center',gap:4,marginTop:6,textDecoration:'none'}}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            Voir fiche fournisseur
          </a>
        )}
        {/* Prix fournisseur */}
        {item.prixFournisseur&&(
          <div style={{fontSize:11,color:'#888',marginTop:4}}>
            Prix fournisseur : <strong style={{color:'#555'}}>{fmt(item.prixFournisseur)}</strong>
            {item.coeffMarge&&<span style={{marginLeft:6,color:G,fontWeight:600}}>× {item.coeffMarge} (coeff)</span>}
          </div>
        )}
        {/* Tags */}
        {item.tags&&(
          <div style={{display:'flex',gap:4,flexWrap:'wrap' as const,marginTop:6}}>
            {item.tags.split(',').filter((t:string)=>t.trim()).map((tag:string,i:number)=>(
              <span key={i} style={{fontSize:10,padding:'1px 6px',background:'#f0fdf4',color:'#1D9E75',borderRadius:10,fontWeight:600}}>{tag.trim()}</span>
            ))}
          </div>
        )}
        {/* Lignes ouvrage */}
        {type==='ouvrage'&&item.lignes?.length>0&&(
          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${BD}`}}>
            <div style={{fontSize:11,color:'#888',marginBottom:4}}>Composition :</div>
            {item.lignes.map((l:LigneOuvrage,i:number)=>(
              <div key={i} style={{fontSize:11,color:'#555',display:'flex',justifyContent:'space-between'}}>
                <span>{l.nom}</span>
                <span style={{color:'#888'}}>{l.qte} × {fmt(l.pu)}</span>
              </div>
            ))}
          </div>
        )}
        {/* Modal delete confirm */}
        {deleteConfirm===item.id&&(
          <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:0,left:0,right:0,bottom:0,background:'rgba(255,255,255,0.95)',borderRadius:12,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:16,zIndex:10}}>
            <div style={{fontSize:13,fontWeight:600,color:'#111',textAlign:'center'}}>Supprimer cet élément ?</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={()=>setDeleteConfirm(null)} style={{padding:'6px 14px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,cursor:'pointer',background:'#fff',color:'#333'}}>Annuler</button>
              <button onClick={()=>supprimer(type,item.id)} style={{padding:'6px 14px',background:RD,color:'#fff',border:'none',borderRadius:7,fontSize:12,fontWeight:600,cursor:'pointer'}}>Supprimer</button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Formulaire panneau latéral
  const PanelForm=()=>{
    const debourseAuto=form.lignes?.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)||form.debourse||0
    const margeVal=marge(debourseAuto,form.prixFacture||0)
    const unites=panelType==='mo'?UNITES_MO:UNITES_MAT
    return(
      <div style={{position:'fixed',top:0,right:0,width:520,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Header */}
        <div style={{padding:'16px 20px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <div style={{fontSize:15,fontWeight:700,color:'#111'}}>
            {panel==='edit'?'Modifier':'Ajouter'} {panelType==='ouvrage'?'un ouvrage':panelType==='materiau'?'un matériau':'une main d\'oeuvre'}
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={save} style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              {panel==='edit'?'Enregistrer':'Ajouter'}
            </button>
            <button onClick={closePanel} style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:16,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
          </div>
        </div>
        {/* Contenu scrollable */}
        <div style={{flex:1,overflowY:'auto',padding:20,display:'flex',flexDirection:'column',gap:14}}>

          {/* Nom */}
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Nom *</label>
            <input value={form.nom||''} onChange={e=>setForm((p:any)=>({...p,nom:e.target.value}))}
              placeholder={panelType==='ouvrage'?'Ex: Pose parquet chêne massif':panelType==='materiau'?'Ex: Parquet chêne 12mm':'Ex: Électricien qualifié'}
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}
              onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
              onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
          </div>

          {/* Photo + Lien fournisseur */}
          <div style={{display:'grid',gridTemplateColumns:'auto 1fr',gap:14,alignItems:'start'}}>
            {/* Photo */}
            <div>
              <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Photo</label>
              <label style={{display:'block',width:72,height:72,borderRadius:10,border:`2px dashed ${BD}`,cursor:'pointer',overflow:'hidden',background:'#f9fafb',position:'relative'}}>
                {form.photo
                  ?<img src={form.photo} alt="photo" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                  :<div style={{display:'flex',flexDirection:'column' as const,alignItems:'center',justifyContent:'center',height:'100%',gap:4}}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{fontSize:9,color:'#aaa',textAlign:'center' as const}}>Ajouter</span>
                  </div>}
                <input type="file" accept="image/*" onChange={handlePhotoItem} style={{display:'none'}}/>
              </label>
              {form.photo&&(
                <button onClick={()=>setForm((p:any)=>({...p,photo:''}))}
                  style={{fontSize:11,color:RD,background:'none',border:'none',cursor:'pointer',marginTop:4,padding:0}}>
                  Supprimer
                </button>
              )}
            </div>
            {/* Lien fournisseur */}
            <div>
              <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Lien fournisseur</label>
              <input value={form.lienFournisseur||''} onChange={e=>setForm((p:any)=>({...p,lienFournisseur:e.target.value}))}
                placeholder="https://www.leroymerlin.fr/..."
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
              {form.lienFournisseur&&(
                <a href={form.lienFournisseur} target="_blank" rel="noreferrer"
                  style={{fontSize:11,color:'#2563eb',display:'inline-flex',alignItems:'center',gap:4,marginTop:4,textDecoration:'none'}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Ouvrir le lien
                </a>
              )}
            </div>
          </div>

          {/* Catégorie + Unité + TVA */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10}}>
            <div>
              <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Catégorie</label>
              <select value={form.categorie||'Autre'} onChange={e=>setForm((p:any)=>({...p,categorie:e.target.value}))}
                style={{width:'100%',padding:'9px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',background:'#fff',color:'#111'}}>
                {categories.map(c=><option key={c.nom}>{c.nom}</option>)}
              </select>
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Unité</label>
              <select value={form.unite||'u'} onChange={e=>setForm((p:any)=>({...p,unite:e.target.value}))}
                style={{width:'100%',padding:'9px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',background:'#fff',color:'#111'}}>
                {unites.map(u=><option key={u}>{u}</option>)}
              </select>
              {form.unite==='Personnalisé'&&(
                <input value={form.uniteCustom||''} onChange={e=>setForm((p:any)=>({...p,uniteCustom:e.target.value}))}
                  placeholder="Ex: kg, palette, jour..."
                  style={{width:'100%',marginTop:6,padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
              )}
            </div>
            <div>
              <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>TVA</label>
              <select value={form.tva||'20%'} onChange={e=>setForm((p:any)=>({...p,tva:e.target.value}))}
                style={{width:'100%',padding:'9px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',background:'#fff',color:'#111'}}>
                {TVA_OPTIONS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Description</label>
            <RichEditor value={form.description||''} onChange={v=>setForm((p:any)=>({...p,description:v}))} placeholder="Détail de l'élément..."/>
          </div>

          {/* Notes internes */}
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>
              🔒 Notes internes <span style={{fontSize:11,color:'#888',fontWeight:400}}>(jamais visible sur le devis)</span>
            </label>
            <textarea value={form.notes||''} onChange={e=>setForm((p:any)=>({...p,notes:e.target.value}))}
              rows={2} placeholder="Ex: Fournisseur Leroy Merlin, délai 3 jours, réf LM-2847..."
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',resize:'vertical' as const,fontFamily:'system-ui,sans-serif',color:'#555',background:'#fffbeb',boxSizing:'border-box' as const}}/>
          </div>

          {/* Tags */}
          <div>
            <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>
              🏷 Tags <span style={{fontSize:11,color:'#888',fontWeight:400}}>(séparés par des virgules)</span>
            </label>
            <input value={form.tags||''} onChange={e=>setForm((p:any)=>({...p,tags:e.target.value}))}
              placeholder="Ex: urgent, stock, nouveau fournisseur"
              style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:12,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            {form.tags&&(
              <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,marginTop:6}}>
                {form.tags.split(',').filter((t:string)=>t.trim()).map((tag:string,i:number)=>(
                  <span key={i} style={{fontSize:11,padding:'2px 8px',background:'#f0fdf4',color:'#1D9E75',borderRadius:12,fontWeight:600}}>{tag.trim()}</span>
                ))}
              </div>
            )}
          </div>

          {/* Composition ouvrage */}
          {panelType==='ouvrage'&&(
            <div style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:14}}>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:10}}>Composition de l'ouvrage</div>
              {(form.lignes||[]).length>0&&(
                <table style={{width:'100%',borderCollapse:'collapse',marginBottom:10}}>
                  <thead><tr style={{background:'#f3f4f6'}}>
                    <th style={{padding:'6px 10px',textAlign:'left' as const,fontSize:11,color:'#888',fontWeight:600}}>Élément</th>
                    <th style={{padding:'6px 10px',textAlign:'center' as const,fontSize:11,color:'#888',fontWeight:600}}>Qté</th>
                    <th style={{padding:'6px 10px',textAlign:'right' as const,fontSize:11,color:'#888',fontWeight:600}}>P.U.</th>
                    <th style={{padding:'6px 10px',textAlign:'right' as const,fontSize:11,color:'#888',fontWeight:600}}>Total</th>
                    <th style={{width:30}}></th>
                  </tr></thead>
                  <tbody>
                    {(form.lignes||[]).map((l:LigneOuvrage,i:number)=>(
                      <tr key={i} style={{borderTop:`1px solid ${BD}`}}>
                        <td style={{padding:'8px 10px',fontSize:12,color:'#333'}}>
                          <span style={{fontSize:10,color:l.type==='materiau'?'#2563eb':AM,fontWeight:600,marginRight:4}}>{l.type==='materiau'?'MAT':'MO'}</span>
                          {l.nom}
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'center' as const}}>
                          <input type="number" value={l.qte} min={0.1} step={0.5}
                            onChange={e=>updateLigne(i,'qte',parseFloat(e.target.value)||0)}
                            style={{width:50,padding:'3px 6px',border:`1px solid ${BD}`,borderRadius:5,fontSize:12,textAlign:'center' as const,outline:'none',color:'#111'}}/>
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'right' as const}}>
                          <input type="number" value={l.pu} min={0}
                            onChange={e=>updateLigne(i,'pu',parseFloat(e.target.value)||0)}
                            style={{width:70,padding:'3px 6px',border:`1px solid ${BD}`,borderRadius:5,fontSize:12,textAlign:'right' as const,outline:'none',color:'#111'}}/>
                        </td>
                        <td style={{padding:'8px 10px',textAlign:'right' as const,fontSize:12,fontWeight:600,color:'#111'}}>{fmt(l.qte*l.pu)}</td>
                        <td style={{padding:'8px 10px',textAlign:'center' as const}}>
                          <button onClick={()=>removeLigne(i)} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:14}}
                            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color=RD}
                            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setShowBiblioMat(true)}
                  style={{flex:1,padding:'7px 10px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:7,fontSize:12,fontWeight:600,color:'#2563eb',cursor:'pointer'}}>
                  + Matériau
                </button>
                <button onClick={()=>setShowBiblioMO(true)}
                  style={{flex:1,padding:'7px 10px',background:'#fffbeb',border:`1px solid #fde68a`,borderRadius:7,fontSize:12,fontWeight:600,color:AM,cursor:'pointer'}}>
                  + Main d\'oeuvre
                </button>
              </div>
            </div>
          )}

          {/* Prix */}
          <div style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:12}}>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>
                  Déboursé sec HT {panelType==='ouvrage'&&(form.lignes||[]).length>0?'(calculé)':''}
                </label>
                <input type="number" value={panelType==='ouvrage'&&(form.lignes||[]).length>0?debourseAuto:(form.debourse||0)}
                  readOnly={panelType==='ouvrage'&&(form.lignes||[]).length>0}
                  onChange={e=>setForm((p:any)=>({...p,debourse:parseFloat(e.target.value)||0}))}
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',background:panelType==='ouvrage'&&(form.lignes||[]).length>0?'#f3f4f6':'#fff',boxSizing:'border-box' as const}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Prix facturé HT</label>
                <input type="number" value={form.prixFacture||0}
                  onChange={e=>setForm((p:any)=>({...p,prixFacture:parseFloat(e.target.value)||0}))}
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                  onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                  onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
              </div>
            </div>

            {/* Prix fournisseur + coeff */}
            <div style={{borderTop:`1px solid ${BD}`,paddingTop:12,marginTop:4}}>
              <div style={{fontSize:12,fontWeight:600,color:'#555',marginBottom:10}}>Prix fournisseur & coefficient</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>Prix fournisseur HT</label>
                  <input type="number" value={form.prixFournisseur||''} min={0}
                    onChange={e=>{
                      const pf=parseFloat(e.target.value)||0
                      const coeff=form.coeffMarge||1
                      setForm((p:any)=>({...p,prixFournisseur:pf,debourse:pf,prixFacture:Math.round(pf*coeff*100)/100}))
                    }}
                    placeholder="Ex: 28"
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                    onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor='#2563eb'}
                    onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:5}}>
                    Coefficient de marge
                    {form.coeffMarge&&<span style={{fontSize:11,color:G,marginLeft:6,fontWeight:600}}>= {Math.round((1-1/form.coeffMarge)*100)}% marge</span>}
                  </label>
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    <input type="number" value={form.coeffMarge||''} min={1} step={0.05}
                      onChange={e=>{
                        const coeff=parseFloat(e.target.value)||1
                        const pf=form.prixFournisseur||form.debourse||0
                        setForm((p:any)=>({...p,coeffMarge:coeff,prixFacture:Math.round(pf*coeff*100)/100}))
                      }}
                      placeholder="Ex: 1.40"
                      style={{flex:1,padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}
                      onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
                      onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
                  </div>
                  {/* Raccourcis coefficients */}
                  <div style={{display:'flex',gap:4,marginTop:6,flexWrap:'wrap' as const}}>
                    {[[1.25,'25%'],[1.40,'40%'],[1.50,'50%'],[1.67,'60%'],[2,'100%']].map(([coeff,label])=>(
                      <button key={String(label)} type="button"
                        onClick={()=>{
                          const pf=form.prixFournisseur||form.debourse||0
                          setForm((p:any)=>({...p,coeffMarge:coeff,prixFacture:Math.round(Number(pf)*Number(coeff)*100)/100}))
                        }}
                        style={{padding:'3px 8px',fontSize:11,border:`1px solid ${form.coeffMarge===coeff?G:BD}`,borderRadius:12,background:form.coeffMarge===coeff?'#f0fdf4':'#fff',color:form.coeffMarge===coeff?G:'#555',cursor:'pointer',fontWeight:600}}>
                        ×{coeff} ({label})
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calcul marge */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8}}>
              <span style={{fontSize:13,color:'#555'}}>Marge calculée</span>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:14,fontWeight:700,color:margeColor(margeVal)}}>{fmt((form.prixFacture||0)-(panelType==='ouvrage'&&(form.lignes||[]).length>0?debourseAuto:(form.debourse||0)))}</span>
                <span style={{fontSize:12,fontWeight:700,padding:'3px 10px',borderRadius:20,background:`${margeColor(margeVal)}18`,color:margeColor(margeVal)}}>{margeVal}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}} onClick={()=>{if(panel)setPanel(null)}}>
      <Sidebar activePage="bibliotheque"/>

      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {/* Topbar */}
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111'}}>Bibliothèque</div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowCatModal(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              🏷 Catégories
            </button>
            <label style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Importer Excel
              <input type="file" accept=".xlsx,.xls,.csv" style={{display:'none'}} onChange={()=>showToast('Import Excel disponible avec Supabase')}/>
            </label>
            <button onClick={()=>openAdd(tab==='ouvrages'?'ouvrage':tab==='materiaux'?'materiau':'mo')}
              style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
              + Ajouter
            </button>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[
              {label:'Ouvrages',val:ouvrages.length,color:'#111'},
              {label:'Matériaux',val:materiaux.length,color:'#111'},
              {label:'Main d\'oeuvre',val:mo.length,color:'#111'},
              {label:'Marge moyenne',val:margeMoyenne([...ouvrages,...materiaux,...mo])+'%',color:G},
            ].map(s=>(
              <div key={s.label} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:10,padding:'14px 16px'}}>
                <div style={{fontSize:11,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>{s.label}</div>
                <div style={{fontSize:24,fontWeight:700,color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Onglets */}
          <div style={{display:'flex',gap:8,marginBottom:16}}>
            {([['ouvrages','Ouvrages',ouvrages.length],['materiaux','Matériaux',materiaux.length],['mo','Main d\'oeuvre',mo.length]] as const).map(([t,label,count])=>(
              <button key={t} onClick={()=>setTab(t as Tab)}
                style={{padding:'7px 16px',borderRadius:20,border:`1px solid ${tab===t?G:BD}`,background:tab===t?'#f0fdf4':'#fff',color:tab===t?G:'#555',fontSize:13,fontWeight:tab===t?600:400,cursor:'pointer',display:'flex',alignItems:'center',gap:6}}>
                {label}
                <span style={{background:tab===t?G:'#e5e7eb',color:tab===t?'#fff':'#888',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>{count}</span>
              </button>
            ))}
          </div>

          {/* Recherche + filtre */}
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <div style={{flex:1,position:'relative'}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom, description, catégorie..."
                style={{width:'100%',padding:'9px 12px 9px 36px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
              {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18}}>×</button>}
            </div>
            <select value={catFiltre} onChange={e=>setCatFiltre(e.target.value)}
              style={{padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111',minWidth:160}}>
              <option value="">Toutes catégories</option>
              {categories.map(c=><option key={c.nom}>{c.nom}</option>)}
            </select>
          </div>

          {/* Grille */}
          {tab==='ouvrages'&&(
            fOuvrages.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucun ouvrage{search?' pour cette recherche':''}</div>
              :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {fOuvrages.map(o=><Carte key={o.id} type="ouvrage" item={o}/>)}
              </div>
          )}
          {tab==='materiaux'&&(
            fMats.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucun matériau{search?' pour cette recherche':''}</div>
              :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {fMats.map(m=><Carte key={m.id} type="materiau" item={m}/>)}
              </div>
          )}
          {tab==='mo'&&(
            fMO.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucune main d\'oeuvre{search?' pour cette recherche':''}</div>
              :<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                {fMO.map(m=><Carte key={m.id} type="mo" item={m}/>)}
              </div>
          )}
        </div>
      </div>

      {/* Panneau latéral */}
      {panel&&(
        <>
          <div onClick={closePanel} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
          <div onClick={e=>e.stopPropagation()}>
            <PanelForm/>
          </div>
        </>
      )}

      {/* Sélecteur matériaux */}
      {showBiblioMat&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowBiblioMat(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:480,width:'90%',maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:14}}>Choisir un matériau</div>
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:8}}>
              {materiaux.map(m=>(
                <div key={m.id} onClick={()=>ajouterLigne('materiau',m)}
                  style={{padding:'10px 14px',border:`1px solid ${BD}`,borderRadius:8,cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=G;d.style.background='#f0fdf4'}}
                  onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=BD;d.style.background=''}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{m.nom}</div>
                      <div style={{fontSize:11,color:'#888'}}>{m.categorie} · {m.unite}</div>
                    </div>
                    <div style={{textAlign:'right' as const}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(m.debourse)}</div>
                      <div style={{fontSize:11,color:'#888'}}>déboursé</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sélecteur MO */}
      {showBiblioMO&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowBiblioMO(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:480,width:'90%',maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:14}}>Choisir une main d'oeuvre</div>
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:8}}>
              {mo.map(m=>(
                <div key={m.id} onClick={()=>ajouterLigne('mo',m)}
                  style={{padding:'10px 14px',border:`1px solid ${BD}`,borderRadius:8,cursor:'pointer',transition:'all 0.15s'}}
                  onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=AM;d.style.background='#fffbeb'}}
                  onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=BD;d.style.background=''}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{m.nom}</div>
                      <div style={{fontSize:11,color:'#888'}}>{m.categorie} · {m.unite}</div>
                    </div>
                    <div style={{textAlign:'right' as const}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{fmt(m.debourse)}</div>
                      <div style={{fontSize:11,color:'#888'}}>déboursé</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal catégories */}
      {showCatModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowCatModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:480,width:'90%',maxHeight:'80vh',display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Gérer les catégories</div>
              <button onClick={()=>setShowCatModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            {/* Liste catégories existantes */}
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:6}}>
              {categories.map((cat,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:8,background:'#f9fafb'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:14,height:14,borderRadius:'50%',background:cat.couleur,flexShrink:0}}/>
                    <span style={{fontSize:13,color:'#111',fontWeight:500}}>{cat.nom}</span>
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <input type="color" value={cat.couleur}
                      onChange={e=>setCategories(p=>p.map((c,j)=>j===i?{...c,couleur:e.target.value}:c))}
                      style={{width:24,height:24,border:'none',cursor:'pointer',background:'none',padding:0}}/>
                    {cat.nom!=='Autre'&&(
                      <button onClick={()=>supprimerCategorie(cat.nom)}
                        style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16}}
                        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#E24B4A'}
                        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#aaa'}>×</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Ajouter nouvelle catégorie */}
            <div style={{borderTop:'1px solid #e5e7eb',paddingTop:14}}>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:10}}>Nouvelle catégorie</div>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <input value={newCatNom} onChange={e=>setNewCatNom(e.target.value)}
                  placeholder="Nom de la catégorie..."
                  onKeyDown={e=>e.key==='Enter'&&ajouterCategorie()}
                  style={{flex:1,padding:'8px 12px',border:'1px solid #e5e7eb',borderRadius:7,fontSize:13,outline:'none',color:'#111'}}/>
                <input type="color" value={newCatCouleur} onChange={e=>setNewCatCouleur(e.target.value)}
                  title="Choisir une couleur"
                  style={{width:36,height:36,border:'1px solid #e5e7eb',borderRadius:7,cursor:'pointer',padding:2}}/>
                <button onClick={ajouterCategorie}
                  style={{padding:'8px 16px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  Ajouter
                </button>
              </div>
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

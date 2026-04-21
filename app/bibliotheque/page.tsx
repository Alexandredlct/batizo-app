'use client'
import SearchBar from '../components/SearchBar'
import React from 'react'
import { useState, useEffect } from 'react'
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
  historiquePrix?:{date:string;prix:number;note?:string}[]
}
type MainOeuvre = {
  id:string; nom:string; description:string; unite:Unite; tva:Tva
  debourse:number; prixFacture:number; categorie:string
  notes?:string; tags?:string; uniteCustom?:string
  prixFournisseur?:number; coeffMarge?:number; fournisseur?:string
  photo?:string; lienFournisseur?:string
  historiquePrix?:{date:string;prix:number;note?:string}[]
}
type LigneOuvrage = { type:'materiau'|'mo'; id:string; nom:string; qte:number; pu:number }
type Ouvrage = {
  id:string; nom:string; description:string; unite:Unite; tva:Tva
  debourse:number; prixFacture:number; categorie:string
  lignes:LigneOuvrage[]
  notes?:string; tags?:string; uniteCustom?:string
  prixFournisseur?:number; coeffMarge?:number; fournisseur?:string
  photo?:string; lienFournisseur?:string
  historiquePrix?:{date:string;prix:number;note?:string}[]
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


function ActionMenu({itemId,onModifier,onDupliquer,onHistorique,onSupprimer,kebabMenu,setKebabMenu}:{
  itemId:string,onModifier:()=>void,onDupliquer:()=>void,onHistorique:()=>void,onSupprimer:()=>void,
  kebabMenu:string|null,setKebabMenu:(id:string|null)=>void
}){
  return(
    <div style={{position:'relative' as const}} onClick={e=>e.stopPropagation()}>
      <button onClick={()=>setKebabMenu(kebabMenu===itemId?null:itemId)}
        style={{width:30,height:30,border:'none',borderRadius:6,background:'transparent',cursor:'pointer',fontSize:16,color:'#aaa',display:'flex',alignItems:'center',justifyContent:'center'}}
        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#F5F5F5'}
        onMouseLeave={e=>{if(kebabMenu!==itemId)(e.currentTarget as HTMLButtonElement).style.background='transparent'}}>
        ⋮
      </button>
      {kebabMenu===itemId&&(
        <div style={{position:'absolute' as const,top:'100%',right:0,background:'#fff',border:'0.5px solid #e5e7eb',borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.12)',zIndex:200,minWidth:180,overflow:'hidden'}}>
          {[
            {label:'Modifier',icon:'✏️',action:()=>{onModifier();setKebabMenu(null)}},
            {label:'Dupliquer',icon:'📋',action:()=>{onDupliquer();setKebabMenu(null)}},
            {label:'Historique',icon:'📈',action:()=>{onHistorique();setKebabMenu(null)}},
          ].map(it=>(
            <div key={it.label} onClick={it.action}
              style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#333',display:'flex',alignItems:'center',gap:8}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
              <span>{it.icon}</span>{it.label}
            </div>
          ))}
          <div style={{borderTop:'1px solid #f3f4f6'}}>
            <div onClick={()=>{onSupprimer();setKebabMenu(null)}}
              style={{padding:'9px 14px',fontSize:13,cursor:'pointer',color:'#D32F2F',display:'flex',alignItems:'center',gap:8}}
              onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#fef2f2'}
              onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
              <span>🗑</span>Supprimer
            </div>
          </div>
        </div>
      )}
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
  const[searchBiblioMat,setSearchBiblioMat]=useState('')
  const[searchBiblioMO,setSearchBiblioMO]=useState('')
  const[showBiblioMO,setShowBiblioMO]=useState(false)
  const[toast,setToast]=useState('')
  const[categories,setCategories]=useState<Categorie[]>(DEFAULT_CATEGORIES)
  const[showCatModal,setShowCatModal]=useState(false)
  const[newCatNom,setNewCatNom]=useState('')
  const[newCatCouleur,setNewCatCouleur]=useState('#1D9E75')
  const exporterCSV=(type:Tab)=>{
    const items=type==='materiaux'?materiaux:type==='mo'?mo:ouvrages
    const headers=['Nom','Description','Categorie','Unite','TVA','Debourse HT','Prix Facture HT','Fournisseur','Lien Fournisseur','Tags','Notes']
    const rows=items.map(i=>[
      i.nom,
      (i.description||'').replace(/<[^>]+>/g,''),
      i.categorie,i.unite,i.tva,
      i.debourse,i.prixFacture,
      (i as any).fournisseur||'',
      (i as any).lienFournisseur||'',
      (i as any).tags||'',
      (i as any).notes||''
    ])
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,"'")}"`).join(',')).join('\n')
    const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url;a.download=`batizo-export-${type}-${new Date().toLocaleDateString('fr-FR').replace(/\//g,'-')}.csv`;a.click()
    URL.revokeObjectURL(url)
    showToast(`${items.length} éléments exportés`)
  }

  const telechargerModele=(type:string)=>{
    const headers=['Nom','Description','Categorie','Unite','TVA','Debourse HT','Prix Facture HT','Fournisseur','Lien Fournisseur']
    const exemples={
      materiaux:[
        ['Parquet chene massif 12mm','Parquet chene massif finition huilee','Parquet','m2','20%','28','68','Point P','https://www.pointp.fr'],
        ['Carrelage 60x60','Carrelage grand format rectifie','Carrelage','m2','20%','32','85','Leroy Merlin',''],
      ],
      mo:[
        ['Electricien qualifie','Taux horaire charge electricien','Electricite','h','20%','45','65','',''],
        ['Plombier qualifie','Taux horaire charge plombier','Plomberie','h','20%','48','70','',''],
      ],
      ouvrages:[
        ['Pose parquet complet','Fourniture et pose parquet chene','Parquet','m2','10%','43','103','',''],
        ['Installation tableau electrique','Fourniture et pose tableau 13 disj','Electricite','u','20%','360','850','',''],
      ],
    }
    const rows=[headers,...(exemples[type as keyof typeof exemples]||exemples.materiaux)]
    const csv=rows.map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8;'})
    const url=URL.createObjectURL(blob)
    const a=document.createElement('a')
    a.href=url;a.download=`batizo-modele-${type}.csv`;a.click()
    URL.revokeObjectURL(url)
  }

  const parseImport=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file)return
    const reader=new FileReader()
    reader.onload=ev=>{
      const text=ev.target?.result as string
      const lines=text.split('\n').filter(l=>l.trim())
      const errors:string[]=[]
      const items:any[]=[]
      const headers=lines[0].split(',').map(h=>h.replace(/"/g,'').trim().toLowerCase())
      
      for(let i=1;i<lines.length;i++){
        const vals=lines[i].split(',').map(v=>v.replace(/"/g,'').trim())
        if(vals.length<6){errors.push(`Ligne ${i+1}: colonnes manquantes`);continue}
        
        const nom=vals[headers.indexOf('nom')]||vals[0]
        const description=vals[headers.indexOf('description')]||vals[1]||''
        const categorie=vals[headers.indexOf('categorie')]||vals[2]||'Autre'
        const unite=vals[headers.indexOf('unite')]||vals[3]||'u'
        const tva=vals[headers.indexOf('tva')]||vals[4]||'20%'
        const debourse=parseFloat(vals[headers.indexOf('debourse ht')]||vals[headers.indexOf('debourse')]||vals[5])||0
        const prixFacture=parseFloat(vals[headers.indexOf('prix facture ht')]||vals[headers.indexOf('prix facture')]||vals[6])||0
        const fournisseur=vals[headers.indexOf('fournisseur')]||vals[7]||''
        const lienFournisseur=vals[headers.indexOf('lien fournisseur')]||vals[8]||''
        
        if(!nom){errors.push(`Ligne ${i+1}: nom manquant`);continue}
        
        items.push({nom,description,categorie,unite,tva,debourse,prixFacture,fournisseur,lienFournisseur,
          id:Math.random().toString(36).slice(2,8),
          lignes:[],historiquePrix:[{date:new Date().toLocaleDateString('fr-FR'),prix:debourse,note:'Import'}]
        })
      }
      
      setImportPreview(items)
      setImportErrors(errors)
    }
    reader.readAsText(file,'UTF-8')
    e.target.value=''
  }

  const confirmerImport=()=>{
    if(importType==='materiaux') setMateriaux(p=>[...p,...importPreview])
    else if(importType==='mo') setMO(p=>[...p,...importPreview])
    else setOuvrages(p=>[...p,...importPreview])
    setShowImport(false)
    setImportPreview([])
    setImportErrors([])
    showToast(`${importPreview.length} éléments importés avec succès`)
  }

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

  useEffect(()=>{
    const params=new URLSearchParams(window.location.search)
    const newType=params.get('new')
    if(newType==='materiau'){setTab('materiaux');openAdd('materiau')}
    else if(newType==='ouvrage'){setTab('ouvrages');openAdd('ouvrage')}
    else if(newType==='mo'){setTab('mo');openAdd('mo')}
  },[])

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

  const[showHistorique,setShowHistorique]=useState<{item:any,type:PanelType}|null>(null)
  const[kebabMenu,setKebabMenu]=useState<string|null>(null)
  const[showImport,setShowImport]=useState(false)
  const[showStats,setShowStats]=useState(false)
  const[deletedItems,setDeletedItems]=useState<{item:any,type:PanelType}[]>([])
  const[showUndoToast,setShowUndoToast]=useState(false)
  const[undoTimer,setUndoTimer]=useState<any>(null)
  const[vue,setVue]=useState<'grille'|'liste'>('grille')
  const[tri,setTri]=useState<'nom'|'marge'|'prix'|'debourse'>('nom')
  const[triDir,setTriDir]=useState<'asc'|'desc'>('asc')
  const toggleTri=(t:typeof tri)=>{if(tri===t)setTriDir(d=>d==='asc'?'desc':'asc');else{setTri(t);setTriDir('asc')}}
  const statsUtilisation = [
    {nom:'Pose parquet complet 45m²',type:'ouvrage',categorie:'Parquet',utilisations:24,caGenere:12480,margeAvg:58},
    {nom:'Installation tableau électrique',type:'ouvrage',categorie:'Électricité',utilisations:18,caGenere:15300,margeAvg:62},
    {nom:'Parquet chêne massif 12mm',type:'materiau',categorie:'Parquet',utilisations:31,caGenere:9520,margeAvg:59},
    {nom:'Électricien qualifié',type:'mo',categorie:'Électricité',utilisations:42,caGenere:8190,margeAvg:54},
    {nom:'Peinture murale mate',type:'materiau',categorie:'Peinture',utilisations:28,caGenere:4620,margeAvg:82},
    {nom:'Carrelage 60x60 grès cérame',type:'materiau',categorie:'Carrelage',utilisations:15,caGenere:7225,margeAvg:62},
    {nom:'Plombier qualifié',type:'mo',categorie:'Plomberie',utilisations:19,caGenere:4760,margeAvg:46},
    {nom:'Robinetterie mitigeur',type:'materiau',categorie:'Plomberie',utilisations:11,caGenere:3080,margeAvg:57},
  ]
  const[importPreview,setImportPreview]=useState<any[]>([])
  const[importType,setImportType]=useState<Tab>('materiaux')
  const[importErrors,setImportErrors]=useState<string[]>([])

  const save=()=>{
    if(!form.nom?.trim()){showToast('Le nom est obligatoire');return}
    const today=new Date().toLocaleDateString('fr-FR')
    if(panelType==='materiau'){
      if(panel==='edit'){
        const ancien=materiaux.find(m=>m.id===editId)
        const histo=ancien?.debourse!==form.debourse
          ?[...(form.historiquePrix||[]),{date:today,prix:ancien?.debourse||0,note:'Mise à jour prix'}]
          :(form.historiquePrix||[])
        setMateriaux(p=>p.map(m=>m.id===editId?{...form,id:editId,historiquePrix:histo}:m))
      } else setMateriaux(p=>[...p,{...form,id:genId(),historiquePrix:[{date:today,prix:form.debourse,note:'Création'}]}])
    } else if(panelType==='mo'){
      if(panel==='edit'){
        const ancien=mo.find(m=>m.id===editId)
        const histo=ancien?.debourse!==form.debourse
          ?[...(form.historiquePrix||[]),{date:today,prix:ancien?.debourse||0,note:'Mise à jour prix'}]
          :(form.historiquePrix||[])
        setMO(p=>p.map(m=>m.id===editId?{...form,id:editId,historiquePrix:histo}:m))
      } else setMO(p=>[...p,{...form,id:genId(),historiquePrix:[{date:today,prix:form.debourse,note:'Création'}]}])
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
    const item=type==='materiau'?materiaux.find(m=>m.id===id):type==='mo'?mo.find(m=>m.id===id):ouvrages.find(o=>o.id===id)
    if(!item)return
    if(type==='materiau') setMateriaux(p=>p.filter(m=>m.id!==id))
    else if(type==='mo') setMO(p=>p.filter(m=>m.id!==id))
    else setOuvrages(p=>p.filter(o=>o.id!==id))
    setDeleteConfirm(null)
    setDeletedItems(p=>[...p,{item,type}])
    setShowUndoToast(true)
    if(undoTimer)clearTimeout(undoTimer)
    const t=setTimeout(()=>{setShowUndoToast(false);setDeletedItems([])},5000)
    setUndoTimer(t)
  }
  const annulerSuppression=()=>{
    const last=deletedItems[deletedItems.length-1]
    if(!last)return
    if(last.type==='materiau') setMateriaux(p=>[...p,last.item])
    else if(last.type==='mo') setMO(p=>[...p,last.item])
    else setOuvrages(p=>[...p,last.item])
    setDeletedItems(p=>p.slice(0,-1))
    setShowUndoToast(false)
    clearTimeout(undoTimer)
    showToast('Restauré avec succès')
  }

  const ajouterLigne=(type:'materiau'|'mo',item:any)=>{
    const ligne:LigneOuvrage={type,id:item.id,nom:item.nom,qte:1,pu:item.debourse}
    const newLignes=[...(form.lignes||[]),ligne]
    const debAuto=newLignes.reduce((s:number,l:LigneOuvrage)=>s+l.qte*l.pu,0)
    setForm((p:any)=>({...p,lignes:newLignes,debourse:debAuto,description:p.description+(p.description?'\n':'')+item.nom+' - '+item.description}))
    setShowBiblioMat(false);setShowBiblioMO(false);setSearchBiblioMat('');setSearchBiblioMO('')
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

  const trier=(items:any[])=>[...items].sort((a,b)=>{
    let va=0,vb=0
    if(tri==='nom') return triDir==='asc'?a.nom.localeCompare(b.nom):b.nom.localeCompare(a.nom)
    if(tri==='marge'){va=marge(a.debourse,a.prixFacture);vb=marge(b.debourse,b.prixFacture)}
    if(tri==='prix'){va=a.prixFacture;vb=b.prixFacture}
    if(tri==='debourse'){va=a.debourse;vb=b.debourse}
    return triDir==='asc'?va-vb:vb-va
  })

  const filtered=(items:any[])=>items.filter(i=>{
    const q=search.toLowerCase()
    const matchSearch=!search||i.nom.toLowerCase().includes(q)||i.description?.toLowerCase().includes(q)||i.categorie?.toLowerCase().includes(q)||i.tags?.toLowerCase().includes(q)||i.notes?.toLowerCase().includes(q)
    const matchCat=!catFiltre||i.categorie===catFiltre
    return matchSearch&&matchCat
  })

  const fOuvrages=trier(filtered(ouvrages))
  const fMats=trier(filtered(materiaux))
  const fMO=trier(filtered(mo))

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
          <ActionMenu itemId={item.id} kebabMenu={kebabMenu} setKebabMenu={setKebabMenu}
            onModifier={()=>openEdit(type,item)}
            onDupliquer={()=>dupliquer(type,item)}
            onHistorique={()=>setShowHistorique({item,type})}
            onSupprimer={()=>setDeleteConfirm(item.id)}/>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4,flexWrap:'wrap' as const}}>
          <div style={{fontSize:14,fontWeight:700,color:'#111',lineHeight:1.3}}>{item.nom}</div>
          {!statsUtilisation.find(s=>s.nom===item.nom)&&(
            <span style={{fontSize:9,fontWeight:700,padding:'2px 6px',borderRadius:8,background:'#fef2f2',color:'#E24B4A',border:'1px solid #fca5a5',flexShrink:0}}>
              Non utilisé
            </span>
          )}
        </div>
        {item.description&&<div style={{fontSize:12,color:'#777',marginBottom:8,lineHeight:1.4}} dangerouslySetInnerHTML={{__html:item.description}}/>}
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
        {/* Badge non utilisé — inline sous le titre */}
        {/* Utilisation */}
        {(()=>{const stat=statsUtilisation.find(s=>s.nom===item.nom);return stat?(
          <div style={{fontSize:11,color:'#888',marginTop:4,display:'flex',alignItems:'center',gap:4}}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            Utilisé <strong style={{color:G}}>{stat.utilisations}x</strong> · CA généré : <strong style={{color:'#111'}}>{stat.caGenere.toLocaleString('fr-FR')} €</strong>
          </div>
        ):null})()}
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
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Bibliothèque</div><SearchBar/>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowStats(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              📊 Statistiques
            </button>
            <button onClick={()=>setShowCatModal(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              🏷 Catégories
            </button>
            <button onClick={()=>exporterCSV(tab)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Exporter CSV
            </button>
            <button onClick={()=>setShowImport(true)}
              style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',fontWeight:500}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Importer CSV
            </button>
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
          <div style={{display:'flex',gap:8,marginBottom:20,alignItems:'center'}}>
            <div style={{flex:1,position:'relative'}}>
              <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher par nom, description, catégorie..."
                style={{width:'100%',padding:'9px 12px 9px 36px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
              {search&&<button onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:18}}>×</button>}
            </div>
<select value={catFiltre} onChange={e=>setCatFiltre(e.target.value)}
              style={{padding:'9px 12px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111',minWidth:160,height:40}}>
              <option value="">Toutes catégories</option>
              {categories.map(cat=><option key={cat.nom}>{cat.nom}</option>)}
            </select>
            {/* Tri */}
            <select value={tri} onChange={e=>{setTri(e.target.value as typeof tri);setTriDir('asc')}}
              style={{padding:'9px 12px',border:'1px solid #999',borderRadius:8,fontSize:13,outline:'none',background:'#fff',color:'#111',height:40}}>
              <option value="nom">Trier : Nom</option>
              <option value="marge">Trier : Marge</option>
              <option value="prix">Trier : Prix facturé</option>
              <option value="debourse">Trier : Déboursé</option>
            </select>
            <button onClick={()=>setTriDir(d=>d==='asc'?'desc':'asc')}
              title={triDir==='asc'?'Croissant':'Décroissant'}
              style={{padding:'9px 12px',border:'1px solid #999',borderRadius:8,background:'#fff',cursor:'pointer',fontSize:14,color:'#555',height:40,display:'flex',alignItems:'center'}}>
              {triDir==='asc'?'↑':'↓'}
            </button>
            {/* Vue */}
            <div style={{display:'flex',border:'1px solid #999',borderRadius:8,overflow:'hidden',height:40}}>
              <button onClick={()=>setVue('grille')} title="Grille"
                style={{padding:'0 12px',background:vue==='grille'?'#f0fdf4':'#fff',border:'none',cursor:'pointer',color:vue==='grille'?G:'#555',borderRight:'1px solid #999',height:'100%',display:'flex',alignItems:'center'}}>
                ⊞
              </button>
              <button onClick={()=>setVue('liste')} title="Liste"
                style={{padding:'0 12px',background:vue==='liste'?'#f0fdf4':'#fff',border:'none',cursor:'pointer',color:vue==='liste'?G:'#555',height:'100%',display:'flex',alignItems:'center'}}>
                ☰
              </button>
            </div>
          </div>

          {/* Grille */}
          {tab==='ouvrages'&&(
            fOuvrages.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucun ouvrage{search?' pour cette recherche':''}</div>
              :vue==='grille'
                ?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {fOuvrages.map(o=><Carte key={o.id} type="ouvrage" item={o}/>)}
                </div>
                :<div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{background:'#f9fafb'}}>
                      {[['nom','Nom'],['','Catégorie'],['','Unité'],['debourse','Déboursé'],['prix','Prix facturé'],['marge','Marge'],['','Actions']].map(([k,h])=>(
                        <th key={h} onClick={()=>k&&toggleTri(k as typeof tri)}
                          style={{padding:'10px 16px',textAlign:'left' as const,fontSize:12,color:tri===k?G:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`,cursor:k?'pointer':'default',userSelect:'none' as const}}>
                          {h}{tri===k?(triDir==='asc'?' ↑':' ↓'):''}
                        </th>
                      ))}
                    </tr></thead>
                    <tbody>{fOuvrages.map(o=>{const m=marge(o.debourse,o.prixFacture);return(
                      <tr key={o.id} style={{borderBottom:`1px solid ${BD}`}}
                        onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                        <td style={{padding:'10px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}>{o.photo&&<img src={o.photo} alt="" style={{width:32,height:32,borderRadius:6,objectFit:'cover'}}/>}<div><div style={{fontSize:13,fontWeight:600,color:'#111'}}>{o.nom}</div>{o.tags&&<div style={{fontSize:11,color:'#888'}}>{o.tags}</div>}</div></div></td>
                        <td style={{padding:'10px 16px'}}><span style={{padding:'2px 8px',borderRadius:12,background:`${catColor(o.categorie)}18`,color:catColor(o.categorie),fontSize:11,fontWeight:600}}>{o.categorie}</span></td>
                        <td style={{padding:'10px 16px',fontSize:12,color:'#555'}}>{o.unite}</td>
                        <td style={{padding:'10px 16px',fontSize:13,color:'#555'}}>{fmt(o.debourse)}</td>
                        <td style={{padding:'10px 16px',fontSize:13,fontWeight:700,color:'#111'}}>{fmt(o.prixFacture)}</td>
                        <td style={{padding:'10px 16px'}}><span style={{fontSize:12,fontWeight:700,color:margeColor(m)}}>{m}%</span></td>
                        <td style={{padding:'10px 16px'}}><div style={{display:'flex',gap:4}}>
                          <ActionMenu itemId={o.id} kebabMenu={kebabMenu} setKebabMenu={setKebabMenu}
                            onModifier={()=>openEdit('ouvrage',o)}
                            onDupliquer={()=>dupliquer('ouvrage',o)}
                            onHistorique={()=>setShowHistorique({item:o,type:'ouvrage'})}
                            onSupprimer={()=>setDeleteConfirm(o.id)}/>
                        </div></td>
                      </tr>
                    )})}</tbody>
                  </table>
                </div>
          )}
          {tab==='materiaux'&&(
            fMats.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucun matériau{search?' pour cette recherche':''}</div>
              :vue==='grille'
                ?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {fMats.map(m=><Carte key={m.id} type="materiau" item={m}/>)}
                </div>
                :<div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{background:'#f9fafb'}}>
                      {[['nom','Nom'],['','Catégorie'],['','Unité'],['debourse','Déboursé'],['prix','Prix facturé'],['marge','Marge'],['','Actions']].map(([k,h])=>(
                        <th key={h} onClick={()=>k&&toggleTri(k as typeof tri)}
                          style={{padding:'10px 16px',textAlign:'left' as const,fontSize:12,color:tri===k?G:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`,cursor:k?'pointer':'default',userSelect:'none' as const}}>
                          {h}{tri===k?(triDir==='asc'?' ↑':' ↓'):''}
                        </th>
                      ))}
                    </tr></thead>
                    <tbody>{fMats.map(mat=>{const m=marge(mat.debourse,mat.prixFacture);return(
                      <tr key={mat.id} style={{borderBottom:`1px solid ${BD}`}}
                        onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                        <td style={{padding:'10px 16px'}}><div style={{display:'flex',alignItems:'center',gap:8}}>{mat.photo&&<img src={mat.photo} alt="" style={{width:32,height:32,borderRadius:6,objectFit:'cover'}}/>}<div><div style={{fontSize:13,fontWeight:600,color:'#111'}}>{mat.nom}</div>{mat.tags&&<div style={{fontSize:11,color:'#888'}}>{mat.tags}</div>}</div></div></td>
                        <td style={{padding:'10px 16px'}}><span style={{padding:'2px 8px',borderRadius:12,background:`${catColor(mat.categorie)}18`,color:catColor(mat.categorie),fontSize:11,fontWeight:600}}>{mat.categorie}</span></td>
                        <td style={{padding:'10px 16px',fontSize:12,color:'#555'}}>{mat.unite}</td>
                        <td style={{padding:'10px 16px',fontSize:13,color:'#555'}}>{fmt(mat.debourse)}</td>
                        <td style={{padding:'10px 16px',fontSize:13,fontWeight:700,color:'#111'}}>{fmt(mat.prixFacture)}</td>
                        <td style={{padding:'10px 16px'}}><span style={{fontSize:12,fontWeight:700,color:margeColor(m)}}>{m}%</span></td>
                        <td style={{padding:'10px 16px'}}><div style={{display:'flex',gap:4}}>
                          <ActionMenu itemId={mat.id} kebabMenu={kebabMenu} setKebabMenu={setKebabMenu}
                            onModifier={()=>openEdit('materiau',mat)}
                            onDupliquer={()=>dupliquer('materiau',mat)}
                            onHistorique={()=>setShowHistorique({item:mat,type:'materiau'})}
                            onSupprimer={()=>setDeleteConfirm(mat.id)}/>
                        </div></td>
                      </tr>
                    )})}</tbody>
                  </table>
                </div>
          )}
          {tab==='mo'&&(
            fMO.length===0
              ?<div style={{textAlign:'center',padding:'3rem',color:'#888'}}>Aucune main d\'oeuvre{search?' pour cette recherche':''}</div>
              :vue==='grille'
                ?<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
                  {fMO.map(m=><Carte key={m.id} type="mo" item={m}/>)}
                </div>
                :<div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>
                  <table style={{width:'100%',borderCollapse:'collapse'}}>
                    <thead><tr style={{background:'#f9fafb'}}>
                      {[['nom','Nom'],['','Catégorie'],['','Unité'],['debourse','Déboursé'],['prix','Prix facturé'],['marge','Marge'],['','Actions']].map(([k,h])=>(
                        <th key={h} onClick={()=>k&&toggleTri(k as typeof tri)}
                          style={{padding:'10px 16px',textAlign:'left' as const,fontSize:12,color:tri===k?G:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`,cursor:k?'pointer':'default',userSelect:'none' as const}}>
                          {h}{tri===k?(triDir==='asc'?' ↑':' ↓'):''}
                        </th>
                      ))}
                    </tr></thead>
                    <tbody>{fMO.map(moItem=>{const m=marge(moItem.debourse,moItem.prixFacture);return(
                      <tr key={moItem.id} style={{borderBottom:`1px solid ${BD}`}}
                        onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                        onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                        <td style={{padding:'10px 16px'}}><div><div style={{fontSize:13,fontWeight:600,color:'#111'}}>{moItem.nom}</div>{moItem.tags&&<div style={{fontSize:11,color:'#888'}}>{moItem.tags}</div>}</div></td>
                        <td style={{padding:'10px 16px'}}><span style={{padding:'2px 8px',borderRadius:12,background:`${catColor(moItem.categorie)}18`,color:catColor(moItem.categorie),fontSize:11,fontWeight:600}}>{moItem.categorie}</span></td>
                        <td style={{padding:'10px 16px',fontSize:12,color:'#555'}}>{moItem.unite}</td>
                        <td style={{padding:'10px 16px',fontSize:13,color:'#555'}}>{fmt(moItem.debourse)}</td>
                        <td style={{padding:'10px 16px',fontSize:13,fontWeight:700,color:'#111'}}>{fmt(moItem.prixFacture)}</td>
                        <td style={{padding:'10px 16px'}}><span style={{fontSize:12,fontWeight:700,color:margeColor(m)}}>{m}%</span></td>
                        <td style={{padding:'10px 16px'}}><div style={{display:'flex',gap:4}}>
                          <ActionMenu itemId={moItem.id} kebabMenu={kebabMenu} setKebabMenu={setKebabMenu}
                            onModifier={()=>openEdit('mo',moItem)}
                            onDupliquer={()=>dupliquer('mo',moItem)}
                            onHistorique={()=>setShowHistorique({item:moItem,type:'mo'})}
                            onSupprimer={()=>setDeleteConfirm(moItem.id)}/>
                        </div></td>
                      </tr>
                    )})}</tbody>
                  </table>
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
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowBiblioMat(false);setSearchBiblioMat('')}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:480,width:'90%',maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:14}}>Choisir un matériau</div>
            <div style={{marginBottom:10}}>
              <input value={searchBiblioMat} onChange={e=>setSearchBiblioMat(e.target.value)}
                placeholder="Rechercher un matériau..."
                autoFocus
                style={{width:'100%',padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:8}}>
              {materiaux.filter(m=>!searchBiblioMat||m.nom.toLowerCase().includes(searchBiblioMat.toLowerCase())||m.categorie.toLowerCase().includes(searchBiblioMat.toLowerCase())).map(m=>(
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
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowBiblioMO(false);setSearchBiblioMO('')}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:480,width:'90%',maxHeight:'70vh',overflow:'hidden',display:'flex',flexDirection:'column'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:14}}>Choisir une main d'oeuvre</div>
            <div style={{marginBottom:10}}>
              <input value={searchBiblioMO} onChange={e=>setSearchBiblioMO(e.target.value)}
                placeholder="Rechercher une main d'oeuvre..."
                autoFocus
                style={{width:'100%',padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>
            <div style={{overflowY:'auto',flex:1,display:'flex',flexDirection:'column',gap:8}}>
              {mo.filter(m=>!searchBiblioMO||m.nom.toLowerCase().includes(searchBiblioMO.toLowerCase())||m.categorie.toLowerCase().includes(searchBiblioMO.toLowerCase())).map(m=>(
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

      {/* Modal statistiques */}
      {showStats&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowStats(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:680,width:'90%',maxHeight:'85vh',display:'flex',flexDirection:'column',gap:16,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Statistiques d'utilisation</div>
                <div style={{fontSize:12,color:'#888',marginTop:2}}>Basé sur les 3 derniers mois · Données indicatives</div>
              </div>
              <button onClick={()=>setShowStats(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>

            {/* KPIs */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
              {[
                {label:'Total utilisations',val:statsUtilisation.reduce((s,i)=>s+i.utilisations,0),color:'#111'},
                {label:'CA total généré',val:statsUtilisation.reduce((s,i)=>s+i.caGenere,0).toLocaleString('fr-FR')+' €',color:G},
                {label:'Marge moyenne',val:Math.round(statsUtilisation.reduce((s,i)=>s+i.margeAvg,0)/statsUtilisation.length)+'%',color:G},
                {label:'Éléments actifs',val:statsUtilisation.length,color:'#2563eb'},
              ].map(k=>(
                <div key={k.label} style={{background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:10,padding:'12px 14px'}}>
                  <div style={{fontSize:10,color:'#888',fontWeight:600,textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:4}}>{k.label}</div>
                  <div style={{fontSize:18,fontWeight:700,color:k.color}}>{k.val}</div>
                </div>
              ))}
            </div>

            {/* Top utilisations */}
            <div style={{flex:1,overflowY:'auto'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:10}}>Classement par utilisation</div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{background:'#f9fafb'}}>
                  {['#','Élément','Type','Catégorie','Utilisations','CA généré','Marge moy.'].map(h=>(
                    <th key={h} style={{padding:'8px 12px',textAlign:'left' as const,fontSize:11,color:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {[...statsUtilisation].sort((a,b)=>b.utilisations-a.utilisations).map((s,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${BD}`}}
                      onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f9fafb'}
                      onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                      <td style={{padding:'10px 12px',fontSize:13,fontWeight:700,color:i<3?G:'#888'}}>
                        {i===0?'🥇':i===1?'🥈':i===2?'🥉':`#${i+1}`}
                      </td>
                      <td style={{padding:'10px 12px',fontSize:13,fontWeight:500,color:'#111'}}>{s.nom}</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:10,
                          background:s.type==='ouvrage'?'#f0fdf4':s.type==='materiau'?'#eff6ff':'#fffbeb',
                          color:s.type==='ouvrage'?G:s.type==='materiau'?'#2563eb':AM}}>
                          {s.type==='ouvrage'?'Ouvrage':s.type==='materiau'?'Matériau':'MO'}
                        </span>
                      </td>
                      <td style={{padding:'10px 12px',fontSize:12,color:'#555'}}>{s.categorie}</td>
                      <td style={{padding:'10px 12px'}}>
                        <div style={{display:'flex',alignItems:'center',gap:8}}>
                          <div style={{flex:1,height:4,background:'#f3f4f6',borderRadius:4,overflow:'hidden',minWidth:60}}>
                            <div style={{height:'100%',width:`${s.utilisations/statsUtilisation[0].utilisations*100}%`,background:G,borderRadius:4}}/>
                          </div>
                          <span style={{fontSize:12,fontWeight:700,color:'#111',minWidth:20}}>{s.utilisations}</span>
                        </div>
                      </td>
                      <td style={{padding:'10px 12px',fontSize:12,fontWeight:600,color:'#111'}}>{s.caGenere.toLocaleString('fr-FR')} €</td>
                      <td style={{padding:'10px 12px'}}>
                        <span style={{fontSize:12,fontWeight:700,color:margeColor(s.margeAvg)}}>{s.margeAvg}%</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{marginTop:12,padding:'10px 14px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,fontSize:12,color:'#92400e'}}>
                💡 Ces statistiques seront calculées automatiquement depuis vos vrais devis une fois Supabase connecté.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal import CSV */}
      {showImport&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>{setShowImport(false);setImportPreview([]);setImportErrors([])}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:600,width:'90%',maxHeight:'85vh',display:'flex',flexDirection:'column',gap:16,overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Importer depuis CSV</div>
              <button onClick={()=>{setShowImport(false);setImportPreview([]);setImportErrors([])}} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>

            {/* Étape 1 — Télécharger modèle */}
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'14px 16px'}}>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:8}}>Étape 1 — Télécharger le modèle</div>
              <p style={{fontSize:12,color:'#555',marginBottom:10}}>Téléchargez le modèle CSV correspondant, remplissez-le et réimportez-le.</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                {[['materiaux','Matériaux'],['mo','Main d\'oeuvre'],['ouvrages','Ouvrages']].map(([t,label])=>(
                  <button key={t} onClick={()=>telechargerModele(t)}
                    style={{padding:'6px 14px',background:'#fff',border:'1px solid #bbf7d0',borderRadius:7,fontSize:12,fontWeight:600,color:G,cursor:'pointer'}}>
                    ⬇ Modèle {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Étape 2 — Choisir type + fichier */}
            <div>
              <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:10}}>Étape 2 — Importer votre fichier</div>
              <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:10}}>
                <select value={importType} onChange={e=>setImportType(e.target.value as Tab)}
                  style={{padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
                  <option value="materiaux">Matériaux</option>
                  <option value="mo">Main d'oeuvre</option>
                  <option value="ouvrages">Ouvrages</option>
                </select>
                <label style={{display:'flex',alignItems:'center',gap:6,padding:'8px 14px',background:G,color:'#fff',border:'none',borderRadius:7,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  Choisir un fichier CSV
                  <input type="file" accept=".csv,.txt" onChange={parseImport} style={{display:'none'}}/>
                </label>
              </div>
            </div>

            {/* Erreurs */}
            {importErrors.length>0&&(
              <div style={{background:'#fef2f2',border:'1px solid #fca5a5',borderRadius:8,padding:'10px 14px'}}>
                <div style={{fontSize:12,fontWeight:600,color:RD,marginBottom:4}}>⚠️ {importErrors.length} erreur(s) détectée(s)</div>
                {importErrors.slice(0,3).map((e,i)=><div key={i} style={{fontSize:11,color:'#555'}}>{e}</div>)}
              </div>
            )}

            {/* Aperçu */}
            {importPreview.length>0&&(
              <div style={{flex:1,overflowY:'auto'}}>
                <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:8}}>
                  Aperçu — {importPreview.length} élément(s) à importer
                </div>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#f9fafb'}}>
                    {['Nom','Catégorie','Unité','Déboursé','Prix facturé','Marge'].map(h=>(
                      <th key={h} style={{padding:'8px 10px',textAlign:'left' as const,fontSize:11,color:'#888',fontWeight:600,borderBottom:`1px solid ${BD}`}}>{h}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {importPreview.slice(0,10).map((item,i)=>{
                      const m=item.prixFacture>0?Math.round((item.prixFacture-item.debourse)/item.prixFacture*100):0
                      return(
                        <tr key={i} style={{borderBottom:`1px solid ${BD}`}}>
                          <td style={{padding:'8px 10px',fontSize:12,color:'#111',fontWeight:500}}>{item.nom}</td>
                          <td style={{padding:'8px 10px',fontSize:12,color:'#555'}}>{item.categorie}</td>
                          <td style={{padding:'8px 10px',fontSize:12,color:'#555'}}>{item.unite}</td>
                          <td style={{padding:'8px 10px',fontSize:12,color:'#555'}}>{item.debourse} €</td>
                          <td style={{padding:'8px 10px',fontSize:12,fontWeight:600,color:'#111'}}>{item.prixFacture} €</td>
                          <td style={{padding:'8px 10px'}}>
                            <span style={{fontSize:11,fontWeight:700,color:margeColor(m)}}>{m}%</span>
                          </td>
                        </tr>
                      )
                    })}
                    {importPreview.length>10&&(
                      <tr><td colSpan={6} style={{padding:'8px 10px',fontSize:12,color:'#888',textAlign:'center' as const}}>...et {importPreview.length-10} autres</td></tr>
                    )}
                  </tbody>
                </table>
                <button onClick={confirmerImport}
                  style={{width:'100%',marginTop:14,padding:'12px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:'pointer'}}>
                  ✓ Confirmer l'import ({importPreview.length} éléments)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal historique prix */}
      {showHistorique&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowHistorique(null)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:480,width:'90%',maxHeight:'80vh',display:'flex',flexDirection:'column',gap:16}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Historique des prix</div>
                <div style={{fontSize:12,color:'#888',marginTop:2}}>{showHistorique.item.nom}</div>
              </div>
              <button onClick={()=>setShowHistorique(null)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            {/* Prix actuel */}
            <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:10,padding:'12px 16px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <div style={{fontSize:11,color:'#888',marginBottom:2}}>Prix actuel (déboursé)</div>
                <div style={{fontSize:20,fontWeight:700,color:'#111'}}>{fmt(showHistorique.item.debourse)}</div>
              </div>
              <div style={{textAlign:'right' as const}}>
                <div style={{fontSize:11,color:'#888',marginBottom:2}}>Prix facturé</div>
                <div style={{fontSize:16,fontWeight:600,color:G}}>{fmt(showHistorique.item.prixFacture)}</div>
              </div>
            </div>
            {/* Tableau historique */}
            {(showHistorique.item.historiquePrix||[]).length>0?(
              <div style={{overflowY:'auto',flex:1}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{background:'#f9fafb'}}>
                    <th style={{padding:'8px 12px',textAlign:'left' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb'}}>Date</th>
                    <th style={{padding:'8px 12px',textAlign:'right' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb'}}>Prix</th>
                    <th style={{padding:'8px 12px',textAlign:'left' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb'}}>Note</th>
                    <th style={{padding:'8px 12px',textAlign:'right' as const,fontSize:12,color:'#888',fontWeight:600,borderBottom:'1px solid #e5e7eb'}}>Évolution</th>
                  </tr></thead>
                  <tbody>
                    {[...(showHistorique.item.historiquePrix||[])].reverse().map((h:{date:string;prix:number;note?:string},i:number,arr:{date:string;prix:number;note?:string}[])=>{
                      const prev=arr[i+1]
                      const evolution=prev?((h.prix-prev.prix)/prev.prix*100):0
                      return(
                        <tr key={i} style={{borderBottom:'1px solid #f3f4f6'}}>
                          <td style={{padding:'10px 12px',fontSize:13,color:'#555'}}>{h.date}</td>
                          <td style={{padding:'10px 12px',fontSize:13,fontWeight:600,color:'#111',textAlign:'right' as const}}>{fmt(h.prix)}</td>
                          <td style={{padding:'10px 12px',fontSize:12,color:'#888'}}>{h.note||'—'}</td>
                          <td style={{padding:'10px 12px',textAlign:'right' as const}}>
                            {prev?(
                              <span style={{fontSize:12,fontWeight:600,color:evolution>0?RD:evolution<0?G:'#888'}}>
                                {evolution>0?'+':''}{evolution.toFixed(1)}%
                              </span>
                            ):<span style={{fontSize:12,color:'#888'}}>—</span>}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ):(
              <div style={{textAlign:'center' as const,padding:'2rem',color:'#888',fontSize:13}}>
                Aucun historique disponible.<br/>
                <span style={{fontSize:12}}>Les modifications de prix seront enregistrées ici.</span>
              </div>
            )}
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

      {/* Toast annuler suppression */}
      {showUndoToast&&(
        <div style={{position:'fixed',bottom:80,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 20px',zIndex:9999,display:'flex',alignItems:'center',gap:12,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{fontSize:13}}>Élément supprimé</span>
          <button onClick={annulerSuppression}
            style={{padding:'5px 14px',background:G,color:'#fff',border:'none',borderRadius:6,fontSize:12,fontWeight:700,cursor:'pointer'}}>
            Annuler
          </button>
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

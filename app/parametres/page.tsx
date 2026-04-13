'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'

const TABS=[
  {id:'entete',label:'En-tête'},
  {id:'pied',label:'Pied de page'},
  {id:'style',label:'Style'},
  {id:'devis',label:'Devis & Factures'},
  {id:'complementaires',label:'Pages complémentaires'},
  {id:'signature',label:'Signature'},
]

const DEFAULT_PARAMS={
  // Entreprise
  nomEntreprise:'Batizo SAS',
  adresse:'130 rue de Normandie, 92400 Courbevoie',
  tel:'01 23 45 67 89',
  email:'contact@batizo.fr',
  siteWeb:'www.batizo.fr',
  siret:'123 456 789 00012',
  rcs:'RCS Nanterre B 123 456 789',
  tvaIntra:'FR12123456789',
  formeJuridique:'SAS',
  codeAPE:'4339Z',
  decennale:'Allianz — Police n° 12345678',
  slogan:'',
  iban:'',
  adresseLigne1:'130 rue de Normandie',
  codePostal:'92400',
  ville:'Courbevoie',
  pays:'France',
  // En-tête affichage
  showNom:true,showAdresse:true,showTel:true,showEmail:false,
  showSiteWeb:false,showSiret:true,showSlogan:false,showDecennale:true,
  logoPosition:'gauche',
  // Pied de page
  showSiegeSocial:true,showFormeJuridique:true,showRCS:true,showSiretPied:true,
  showTvaIntra:true,showCodeAPE:false,showRM:false,
  showDecennalePied:true,showEmailPied:false,showTelPied:false,showSiteWebPied:false,
  showFormeJuridiquePied:true,showTvaIntraP:true,showSloganPied:false,
  showSiren:false,showCapital:false,showIBANPied:false,showCodeAPEPied:false,
  siren:'',rm:'',capitalSocial:'',
  showNumPage:true,showMerci:true,
  texteRemerciement:'Merci pour votre confiance. N\'hésitez pas à nous contacter pour toute question.',
  // Style
  couleurPrincipale:'#1D9E75',
  police:'Inter',
  miseEnPage:'aere',
  afficherPhotos:true,
  // Devis & Factures
  formatDevis:'DEV-{YYYY}-{NUM}',
  formatFacture:'FAC-{YYYY}-{NUM}',
  tvaDef:'10%',
  acompteDef:30,
  nomSignataire:'Alexandre Delcourt',
  moyensCheque:true,moyensVirement:true,moyensCarte:false,moyensEspeces:false,
  validiteDevis:60,
  introDevis:'Suite à notre rencontre, nous avons le plaisir de vous soumettre notre devis.',
  noteDevis:'',
  delaiReglement:'30 jours',
  penalitesRetard:'Taux légal × 3',
  indemniteForfaitaire:'40',
  noteFacture:'',
  // Page de garde
  gardeActive:false,
  gardeFond:'couleur',
  gardeColor:'#1D9E75',
  gardeTitre:'DEVIS DE TRAVAUX',
  gardeSousTitre:'Rénovation complète — Paris & Île-de-France',
  // Signature
  texteClient:'Le client',
  mentionClient:'Mention datée et signée : « Devis reçu avant l\'exécution des travaux. Bon pour travaux. »',
  tailleSignature:'moyen',
  nomSignataireEntreprise:'Alexandre Delcourt',
  titreSignataire:'Gérant — Batizo SAS',
  // CGV
  cgvActive:false,
  cgvTexte:'',
  pagesComp:[],
  gardePdf:'',gardePdfNom:'',
  cachet:'',
}


// ===== COMPOSANTS EXTERNES (évite re-render) =====
const Toggle=({k,params,set}:{k:string,params:any,set:(k:string,v:any)=>void})=>(
  <div onClick={()=>set(k,!params[k])}
    style={{width:42,height:24,borderRadius:12,background:params[k]?'#1D9E75':'#d1d5db',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
    <div style={{position:'absolute',top:2,left:params[k]?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
  </div>
)
const CheckRow=({label,k,params,set,children}:{label:string,k:string,params:any,set:(k:string,v:any)=>void,children?:any})=>(
  <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
    <input type="checkbox" checked={params[k]||false} onChange={e=>set(k,e.target.checked)} style={{accentColor:'#1D9E75',width:15,height:15,flexShrink:0}}/>
    <span style={{fontSize:13,color:'#333',minWidth:160}}>{label}</span>
    {children}
  </div>
)
const Field=({label,k,placeholder,type='text',rows,params,set}:{label:string,k:string,placeholder?:string,type?:string,rows?:number,params:any,set:(k:string,v:any)=>void})=>(
  <div style={{marginBottom:14}}>
    <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>{label}</label>
    {rows?(
      <textarea value={params[k]||''} onChange={e=>set(k,e.target.value)} rows={rows} placeholder={placeholder}
        style={{width:'100%',padding:'8px 10px',border:'1px solid #e5e7eb',borderRadius:7,fontSize:13,color:'#111',outline:'none',resize:'none' as const,fontFamily:'system-ui',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLTextAreaElement).style.borderColor='#1D9E75'}
        onBlur={e=>(e.currentTarget as HTMLTextAreaElement).style.borderColor='#e5e7eb'}/>
    ):(
      <input type={type} value={params[k]||''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
        style={{width:'100%',padding:'8px 10px',border:'1px solid #e5e7eb',borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const}}
        onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor='#1D9E75'}
        onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor='#e5e7eb'}/>
    )}
  </div>
)
const Section=({title,children}:{title:string,children:any})=>(
  <div style={{marginBottom:24}}>
    <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:12,paddingBottom:8,borderBottom:'1px solid #e5e7eb'}}>{title}</div>
    {children}
  </div>
)

export default function ParametresPage(){
  const[tab,setTab]=useState('entete')
  const[params,setParams]=useState({...DEFAULT_PARAMS})
const[saved,setSaved]=useState(false)
  const[hasChanges,setHasChanges]=useState(false)
  const[gardePdfThumb,setGardePdfThumb]=useState<string|null>(null)
  const[gardePdfThumbs,setGardePdfThumbs]=useState<string[]>([])
  const[compThumbs,setCompThumbs]=useState<Record<string,string[]>>({})
  
  const renderPdfThumb=useCallback(async(data:string,id:string,isGarde=false)=>{
    try{
      const pdfjsLib=(window as any).pdfjsLib
      if(!pdfjsLib){setTimeout(()=>renderPdfThumb(data,id,isGarde),1000);return}
      const base64=data.split(',')[1]
      const binary=atob(base64)
      const bytes=new Uint8Array(binary.length)
      for(let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i)
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise
      const numPages=pdf.numPages
      const thumbs:string[]=[]
      for(let pageNum=1;pageNum<=numPages;pageNum++){
        const page=await pdf.getPage(pageNum)
        const scale=2.5 // haute résolution
        const viewport=page.getViewport({scale})
        const canvas=document.createElement('canvas')
        canvas.width=viewport.width
        canvas.height=viewport.height
        const ctx=canvas.getContext('2d')
        await page.render({canvasContext:ctx,viewport}).promise
        thumbs.push(canvas.toDataURL('image/jpeg',0.92))
      }
      if(isGarde){setGardePdfThumb(thumbs[0]);setGardePdfThumbs(thumbs)}
      else setCompThumbs(p=>({...p,[id]:thumbs}))
    }catch(e){console.error('PDF render error',e)}
  },[])
  const[logoPreview,setLogoPreview]=useState<string|null>(null)

  const handleLogo=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(!file)return
    if(file.size>2*1024*1024){alert('Fichier trop lourd — max 2 Mo');return}
    const reader=new FileReader()
    reader.onload=(ev)=>{
      const result=ev.target?.result as string
      setLogoPreview(result)
      set('logo',result)
      localStorage.setItem('batizo_logo',result)
    }
    reader.readAsDataURL(file)
  }

  useEffect(()=>{
    const stored=localStorage.getItem('batizo_logo')
    if(stored){setLogoPreview(stored);set('logo',stored)}
  },[])
  const[showReset,setShowReset]=useState(false)

  useEffect(()=>{
    const stored=localStorage.getItem('batizo_params')
    if(stored){
      const p=JSON.parse(stored)
      setParams(p)
      // Recharger les thumbnails PDF après chargement de PDF.js
      const reloadThumbs=()=>{
        if(p.gardePdf) renderPdfThumb(p.gardePdf,'garde',true)
        if(p.pagesComp?.length>0){
          p.pagesComp.forEach((page:any)=>{
            if(page.data) renderPdfThumb(page.data,page.id,false)
          })
        }
      }
      // Attendre que PDF.js soit chargé
      const waitForPdfjs=setInterval(()=>{
        if((window as any).pdfjsLib){
          clearInterval(waitForPdfjs)
          reloadThumbs()
        }
      },500)
      setTimeout(()=>clearInterval(waitForPdfjs),10000)
    }
    // Charger PDF.js
    if(!(window as any).pdfjsLib){
      const script=document.createElement('script')
      script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js'
      script.onload=()=>{
        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
      }
      document.head.appendChild(script)
    }
  },[])

  const set=(key:string,val:any)=>{setParams(p=>({...p,[key]:val}));setHasChanges(true)}

  const enregistrer=()=>{
    if(!hasChanges)return
    localStorage.setItem('batizo_params',JSON.stringify(params))
    setSaved(true)
    setHasChanges(false)
    setTimeout(()=>setSaved(false),3000)
  }

  const reinitialiser=()=>{
    setParams({...DEFAULT_PARAMS})
    localStorage.removeItem('batizo_params')
    setShowReset(false)
    setHasChanges(false)
  }

  // Helpers UI
  const formatEx=(fmt:string)=>fmt.replace('{YYYY}',new Date().getFullYear().toString()).replace('{NUM}','001')

  return(
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>
      <Sidebar activePage="parametres"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

        {/* Topbar */}
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Paramètres</div>
          <SearchBar/>
          <div style={{display:'flex',gap:8,flexShrink:0}}>
            <button onClick={()=>setShowReset(true)}
              style={{padding:'8px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#555',fontWeight:500}}>
              Réinitialiser
            </button>
            <button onClick={enregistrer} disabled={!hasChanges}
              style={{padding:'8px 18px',background:hasChanges?G:'#e5e7eb',color:hasChanges?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:hasChanges?'pointer':'not-allowed',transition:'all 0.2s'}}>
              Enregistrer
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{background:'#fff',borderBottom:`1px solid ${BD}`,padding:'0 24px',display:'flex',gap:4,flexShrink:0,overflowX:'auto'}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:'12px 16px',border:'none',background:'transparent',fontSize:13,fontWeight:tab===t.id?700:400,
                color:tab===t.id?G:'#555',cursor:'pointer',borderBottom:`2px solid ${tab===t.id?G:'transparent'}`,
                whiteSpace:'nowrap' as const,transition:'all 0.15s'}}>
              {t.label}
            </button>
          ))}
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>
          <div style={{maxWidth:1200,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 480px',gap:24}}>

            {/* COLONNE GAUCHE — Formulaire */}
            <div>

              {/* ===== MODÈLES ===== */}
              {tab==='entete'&&(
                <div>
                  <Section title="Logo">
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" id="logo-upload" style={{display:'none'}} onChange={handleLogo}/>
                    <label htmlFor="logo-upload">
                      <div style={{border:`2px dashed ${logoPreview?G:BD}`,borderRadius:10,padding:'16px',textAlign:'center' as const,cursor:'pointer',marginBottom:10,background:logoPreview?'#f0fdf4':'#fafafa',transition:'all 0.2s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=logoPreview?G:BD}>
                        {logoPreview?(
                          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:12}}>
                            <img src={logoPreview} alt="logo" style={{maxHeight:60,maxWidth:200,objectFit:'contain'}}/>
                            <div style={{textAlign:'left' as const}}>
                              <div style={{fontSize:12,fontWeight:600,color:G}}>✓ Logo importé</div>
                              <div style={{fontSize:11,color:'#888',marginTop:2}}>Cliquez pour changer</div>
                            </div>
                          </div>
                        ):(
                          <>
                                                        <div style={{fontSize:13,color:'#555',fontWeight:600}}>Cliquez pour importer votre logo</div>
                            <div style={{fontSize:11,color:'#888',marginTop:4}}>PNG, JPG ou SVG — max 2 Mo</div>
                          </>
                        )}
                      </div>
                    </label>
                    <div style={{background:'#f0fdf4',border:`1px solid ${G}40`,borderRadius:8,padding:'10px 14px',marginBottom:12,fontSize:12,color:'#555',lineHeight:1.7}}>
                      <div style={{fontWeight:600,color:G,marginBottom:4}}>📐 Format recommandé</div>
                      <div>• <strong>Taille :</strong> 300 × 100 px minimum (ratio 3:1 idéal)</div>
                      <div>• <strong>Format :</strong> PNG avec fond transparent (recommandé) ou JPG</div>
                      <div>• <strong>Poids :</strong> 2 Mo maximum</div>
                      <div>• <strong>Résolution :</strong> 150 DPI minimum pour l'impression</div>
                    </div>
                    {logoPreview&&(
                      <button onClick={()=>{setLogoPreview(null);set('logo','');localStorage.removeItem('batizo_logo')}}
                        style={{padding:'6px 12px',background:'#fff',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,cursor:'pointer',color:'#888',display:'flex',alignItems:'center',gap:6}}>
                        🗑 Supprimer le logo
                      </button>
                    )}

                  </Section>

                  <Section title="Informations entreprise">
                    <div style={{fontSize:11,color:'#888',marginBottom:12,display:'flex',alignItems:'center',gap:4}}>
                      Choisissez les informations à afficher dans l'en-tête de vos documents.
                    </div>
                    <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                      {[
                        {label:"Nom de l'entreprise",k:'nomEntreprise',showK:'showNom',placeholder:'Batizo SAS'},
                        {label:'Adresse',k:'adresseLigne1',showK:'showAdresse',placeholder:'130 rue de Normandie'},
                        {label:'Téléphone',k:'tel',showK:'showTel',placeholder:'01 23 45 67 89'},
                        {label:'Email',k:'email',showK:'showEmail',placeholder:'contact@batizo.fr'},
                        {label:'Site internet',k:'siteWeb',showK:'showSiteWeb',placeholder:'www.batizo.fr'},
                      ].map(({label,k,showK,placeholder,select}:any)=>(
                        <div key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:8,background:(params as any)[showK]?'#f9fafb':'#fff'}}>
                          <input type="checkbox" checked={(params as any)[showK]||false} onChange={e=>set(showK,e.target.checked)} style={{accentColor:G,width:15,height:15,flexShrink:0}}/>
                          <span style={{fontSize:12,color:'#555',minWidth:160,flexShrink:0}}>{label}</span>
                          {select?(
                            <select value={(params as any)[k]||''} onChange={e=>set(k,e.target.value)}
                              style={{flex:1,padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,color:'#111',outline:'none',background:'#fff'}}>
                              {select.map((o:string)=><option key={o}>{o}</option>)}
                            </select>
                          ):(
                            <input value={(params as any)[k]||''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
                              style={{flex:1,padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,color:'#111',outline:'none'}}/>
                          )}
                        </div>
                      ))}
                    </div>
                  </Section>


                </div>
              )}

                            {tab==='pied'&&(
                <div>
                  <Section title="Informations légales">
                    <div style={{fontSize:11,color:'#888',marginBottom:12,display:'flex',alignItems:'center',gap:4}}>
                      Choisissez les informations à afficher dans le pied de page de vos documents.
                    </div>
                    <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                      {[
                        {label:'Forme juridique',k:'formeJuridique',showK:'showFormeJuridiquePied',placeholder:'SAS'},
                        {label:'Capital social',k:'capitalSocial',showK:'showCapital',placeholder:'Ex : au capital de 10 000 €'},
                        {label:'RCS',k:'rcs',showK:'showRCS',placeholder:'RCS Nanterre B 123 456 789'},
                        {label:'SIREN',k:'siren',showK:'showSiren',placeholder:'123 456 789'},
                        {label:'SIRET',k:'siret',showK:'showSiretPied',placeholder:'123 456 789 00012'},
                        {label:'RM (Répertoire des Métiers)',k:'rm',showK:'showRM',placeholder:'Ex : RM 123 456 789'},
                        {label:'N° TVA intracommunautaire',k:'tvaIntra',showK:'showTvaIntraP',placeholder:'FR12123456789'},
                        {label:'Code APE',k:'codeAPE',showK:'showCodeAPEPied',placeholder:'4339Z'},
                        {label:'Assurance décennale',k:'decennale',showK:'showDecennalePied',placeholder:'Allianz — Police n° 12345'},
                        {label:'IBAN',k:'iban',showK:'showIBANPied',placeholder:'FR76 3000...'},
                      ].map(({label,k,showK,placeholder}:any)=>(
                        <div key={k} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:8,background:(params as any)[showK]?'#f9fafb':'#fff'}}>
                          <input type="checkbox" checked={(params as any)[showK]||false} onChange={e=>set(showK,e.target.checked)} style={{accentColor:G,width:15,height:15,flexShrink:0}}/>
                          <span style={{fontSize:12,color:'#555',minWidth:200,flexShrink:0}}>{label}</span>
                          <input value={(params as any)[k]||''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
                            style={{flex:1,padding:'5px 8px',border:`1px solid ${BD}`,borderRadius:6,fontSize:12,color:'#111',outline:'none'}}/>
                        </div>
                      ))}
                    </div>
                  </Section>
                </div>
              )}

                            {tab==='style'&&(
                <div>
                  <Section title="Couleur principale">
                    <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
                      <input type="color" value={params.couleurPrincipale} onChange={e=>set('couleurPrincipale',e.target.value)}
                        style={{width:44,height:44,borderRadius:8,border:`1px solid ${BD}`,cursor:'pointer',padding:2}}/>
                      <input value={params.couleurPrincipale} onChange={e=>set('couleurPrincipale',e.target.value)}
                        style={{width:100,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',fontFamily:'monospace'}}/>
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      {['#1D9E75','#2563eb','#9333ea','#e11d48','#1a1a1a'].map(col=>(
                        <div key={col} onClick={()=>set('couleurPrincipale',col)}
                          style={{width:32,height:32,borderRadius:'50%',background:col,cursor:'pointer',border:`3px solid ${params.couleurPrincipale===col?'#111':'transparent'}`,transition:'border 0.15s'}}/>
                      ))}
                    </div>
                  </Section>

                  <Section title="Typographie">
                    <div style={{marginBottom:12}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Police</label>
                      <select value={params.police} onChange={e=>set('police',e.target.value)}
                        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',background:'#fff'}}>
                        {['Inter','Système par défaut','Arial','Helvetica','Georgia','Times New Roman','Roboto','Open Sans'].map(p=>(
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{padding:'12px 14px',background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`,fontFamily:params.police}}>
                      <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:4}}>Titre du devis</div>
                      <div style={{fontSize:13,color:'#555'}}>Corps du texte — Désignation des travaux et descriptions</div>
                      <div style={{fontSize:11,color:'#888',marginTop:2}}>Note et mentions légales</div>
                    </div>
                  </Section>



                </div>
              )}

              {/* ===== DEVIS & FACTURES ===== */}
              {tab==='devis'&&(
                <div>
                  <Section title="Paramètres généraux">
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Format numérotation devis</label>
                      <input value={params.formatDevis} onChange={e=>set('formatDevis',e.target.value)}
                        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const,fontFamily:'monospace'}}/>
                      <div style={{fontSize:11,color:'#888',marginTop:4}}>Exemple : <strong>{formatEx(params.formatDevis)}</strong></div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Format numérotation factures</label>
                      <input value={params.formatFacture} onChange={e=>set('formatFacture',e.target.value)}
                        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const,fontFamily:'monospace'}}/>
                      <div style={{fontSize:11,color:'#888',marginTop:4}}>Exemple : <strong>{formatEx(params.formatFacture)}</strong></div>
                    </div>

                    <Field params={params} set={set} label="Nom affiché dans la signature" k="nomSignataireEntreprise" placeholder="Ex : Alexandre Delcourt"/>
                    <div style={{fontSize:11,color:'#888',marginTop:-10,marginBottom:14}}>Apparaît en bas du devis signé</div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Moyens de règlement par défaut</label>
                      {[['moyensVirement','Virement bancaire'],['moyensCheque','Chèque'],['moyensCarte','Carte bancaire'],['moyensEspeces','Espèces']].map(([k,l])=>(
                        <CheckRow key={k} params={params} set={set} label={l} k={k}/>
                      ))}
                    </div>
                  </Section>

                  <Section title="Spécifique aux devis">
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Validité des devis (jours)</label>
                      <input type="number" value={params.validiteDevis} onChange={e=>set('validiteDevis',parseInt(e.target.value)||0)}
                        style={{width:100,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none'}}/>
                    </div>
                    <Field params={params} set={set} label="Texte d'introduction" k="introDevis" rows={3} placeholder="Suite à notre rencontre..."/>
                    <Field params={params} set={set} label="Note de fin de devis" k="noteDevis" rows={3} placeholder="Ce texte apparaît en bas du devis, avant la zone de signature."/>
                  </Section>

                  <Section title="Spécifique aux factures">
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Délai de règlement</label>
                      <select value={params.delaiReglement} onChange={e=>set('delaiReglement',e.target.value)}
                        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',background:'#fff'}}>
                        {['Paiement à réception','8 jours','15 jours','30 jours','45 jours','60 jours'].map(d=><option key={d}>{d}</option>)}
                      </select>
                      <div style={{fontSize:11,color:AM,marginTop:4}}>⚠ Mention obligatoire sur les factures B2B (loi LME)</div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Pénalités de retard</label>
                      <select value={params.penalitesRetard} onChange={e=>set('penalitesRetard',e.target.value)}
                        style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',background:'#fff'}}>
                        {['Taux légal × 3','Taux légal × 1','3%','5%','Taux directeur BCE + 10%'].map(d=><option key={d}>{d}</option>)}
                      </select>
                      <div style={{fontSize:11,color:AM,marginTop:4}}>⚠ Obligatoire sur factures B2B</div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Indemnité forfaitaire de recouvrement</label>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <input type="number" value={params.indemniteForfaitaire} onChange={e=>set('indemniteForfaitaire',e.target.value)}
                          style={{width:80,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none'}}/>
                        <span style={{fontSize:13,color:'#555'}}>€</span>
                      </div>
                      <div style={{fontSize:11,color:'#888',marginTop:4}}>Obligatoire pour les professionnels (décret 2012)</div>
                    </div>
                    <Field params={params} set={set} label="Note de fin de facture" k="noteFacture" rows={3}/>
                  </Section>
                </div>
              )}

              {/* ===== PAGE DE GARDE ===== */}
              {tab==='complementaires'&&(
                <div>
                  <Section title="Page de garde">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12,padding:'12px 14px',background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:600,color:'#111'}}>Activer la page de garde</div>
                
                      </div>
                      <Toggle params={params} set={set} k="gardeActive"/>
                    </div>
                    {params.gardeActive&&(
                      <div style={{marginTop:4}}>
                        <input type="file" accept="application/pdf" id="garde-upload" style={{display:'none'}}
                          onChange={e=>{
                            const file=e.target.files?.[0]
                            if(!file)return
                            if(file.size>5*1024*1024){alert('Fichier trop lourd — max 5 Mo');return}
                            const reader=new FileReader()
                            reader.onload=(ev)=>{
                            const result=ev.target?.result as string
                            set('gardePdf',result);set('gardePdfNom',file.name)
                            renderPdfThumb(result,'garde',true)
                          }
                            reader.readAsDataURL(file)
                          }}/>
                        <label htmlFor="garde-upload">
                          <div style={{border:`2px dashed ${(params as any).gardePdf?G:BD}`,borderRadius:10,padding:'20px',textAlign:'center' as const,cursor:'pointer',background:(params as any).gardePdf?'#f0fdf4':'#fafafa',transition:'all 0.2s'}}
                            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=(params as any).gardePdf?G:BD}>
                            {(params as any).gardePdf?(
                              <div style={{display:'flex',alignItems:'center',justifyContent:'center' as const,gap:10}}>
                                <span style={{fontSize:24}}>📄</span>
                                <div style={{textAlign:'left' as const}}>
                                  <div style={{fontSize:13,fontWeight:600,color:G}}>✓ {(params as any).gardePdfNom||'page-de-garde.pdf'}</div>
                                  <div style={{fontSize:11,color:'#888',marginTop:2}}>Cliquez pour remplacer</div>
                                </div>
                              </div>
                            ):(
                              <>
                                <div style={{fontSize:28,marginBottom:8}}>📄</div>
                                <div style={{fontSize:13,color:'#555',fontWeight:600}}>Importer votre page de garde (PDF)</div>
                                <div style={{fontSize:11,color:'#888',marginTop:4}}>PDF uniquement — max 5 Mo</div>
                              </>
                            )}
                          </div>
                        </label>
                        {(params as any).gardePdf&&(
                          <button onClick={()=>{set('gardePdf','');set('gardePdfNom','')}}
                            style={{marginTop:8,padding:'5px 12px',background:'#fff',border:`1px solid ${BD}`,borderRadius:6,fontSize:11,cursor:'pointer',color:'#888',display:'flex',alignItems:'center',gap:4}}>
                            🗑 Supprimer
                          </button>
                        )}
                      </div>
                    )}
                  </Section>
                  {/* Structure document */}
                  <Section title="Structure du document PDF">
                    <div style={{display:'flex',flexDirection:'column' as const,gap:8}}>
                      {/* Page de garde — fixe */}
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8}}>
                        <span style={{fontSize:14}}>🔒</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600,color:'#2563eb'}}>Page de garde</div>
                          <div style={{fontSize:11,color:'#888'}}>Toujours en première position</div>
                        </div>
                        <span style={{fontSize:11,color:'#2563eb',fontWeight:600}}>Position fixe</span>
                      </div>
                      {/* Devis/Facture — fixe */}
                      <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#f0fdf4',border:`1px solid ${G}40`,borderRadius:8}}>
                        <span style={{fontSize:14}}>📄</span>
                        <div style={{flex:1}}>
                          <div style={{fontSize:13,fontWeight:600,color:G}}>Devis / Facture</div>
                          <div style={{fontSize:11,color:'#888'}}>Le document principal</div>
                        </div>
                        <span style={{fontSize:11,color:G,fontWeight:600}}>Position fixe</span>
                      </div>
                      {/* Pages complémentaires — réordonnables */}
                      {((params as any).pagesComp||[]).map((page:any,i:number)=>(
                        <div key={page.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8}}>
                          <div style={{display:'flex',flexDirection:'column' as const,gap:2}}>
                            <button onClick={()=>{
                              const arr=[...(params as any).pagesComp]
                              if(i===0)return
                              ;[arr[i],arr[i-1]]=[arr[i-1],arr[i]]
                              set('pagesComp',arr)
                            }} style={{background:'none',border:'none',cursor:i===0?'not-allowed':'pointer',color:i===0?'#ddd':'#888',fontSize:11,padding:0}}>↑</button>
                            <button onClick={()=>{
                              const arr=[...(params as any).pagesComp]
                              if(i===arr.length-1)return
                              ;[arr[i],arr[i+1]]=[arr[i+1],arr[i]]
                              set('pagesComp',arr)
                            }} style={{background:'none',border:'none',cursor:i===(params as any).pagesComp.length-1?'not-allowed':'pointer',color:i===(params as any).pagesComp.length-1?'#ddd':'#888',fontSize:11,padding:0}}>↓</button>
                          </div>
                          <input type="checkbox" checked={page.active} onChange={()=>{
                            const arr=[...(params as any).pagesComp]
                            arr[i]={...arr[i],active:!arr[i].active}
                            set('pagesComp',arr)
                          }} style={{accentColor:G,width:15,height:15}}/>
                          <span style={{fontSize:14}}>📎</span>
                          <div style={{flex:1}}>
                            <div style={{fontSize:13,fontWeight:500,color:'#111'}}>{page.nom}</div>
                            <div style={{fontSize:11,color:'#888',display:'flex',gap:8,marginTop:2}}>
                              {['devis','facture'].map(type=>(
                                <label key={type} style={{display:'flex',alignItems:'center',gap:4,cursor:'pointer'}}>
                                  <input type="checkbox" checked={page[type]} onChange={()=>{
                                    const arr=[...(params as any).pagesComp]
                                    arr[i]={...arr[i],[type]:!arr[i][type]}
                                    set('pagesComp',arr)
                                  }} style={{accentColor:G,width:12,height:12}}/>
                                  <span style={{fontSize:11,color:'#555',textTransform:'capitalize' as const}}>{type}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                          <button onClick={()=>{
                            const arr=(params as any).pagesComp.filter((_:any,j:number)=>j!==i)
                            set('pagesComp',arr)
                          }} style={{background:'none',border:'none',cursor:'pointer',color:'#ddd',fontSize:18}}
                            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.color='#E24B4A'}
                            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.color='#ddd'}>×</button>
                        </div>
                      ))}
                    </div>
                  </Section>

                  {/* Bouton ajouter */}
                  <div>
                    <input type="file" accept="application/pdf" id="comp-upload" style={{display:'none'}}
                      onChange={e=>{
                        const file=e.target.files?.[0]
                        if(!file)return
                        if(file.size>5*1024*1024){alert('Fichier trop lourd — max 5 Mo');return}
                        const reader=new FileReader()
                        reader.onload=(ev)=>{
                          const result=ev.target?.result as string
                          const id=Math.random().toString(36).slice(2,8)
                          const arr=[...((params as any).pagesComp||[]),{
                            id,nom:file.name.replace('.pdf',''),
                            active:true,devis:true,facture:true,data:result
                          }]
                          set('pagesComp',arr)
                          renderPdfThumb(result,id,false)
                        }
                        reader.readAsDataURL(file)
                      }}/>
                    <label htmlFor="comp-upload">
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center' as const,gap:8,padding:'12px 16px',border:`2px dashed ${BD}`,borderRadius:10,background:'#fff',color:'#555',fontSize:13,cursor:'pointer',transition:'all 0.15s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=BD}>
                        <span style={{fontSize:18}}>+</span> Importer un PDF complémentaire
                      </div>
                    </label>
                    <div style={{fontSize:11,color:'#888',marginTop:6,textAlign:'center' as const}}>PDF uniquement — max 5 Mo par fichier</div>
                    <div style={{fontSize:12,color:'#888',marginTop:12,padding:'10px 14px',background:'#f9fafb',borderRadius:8,border:`1px solid ${BD}`,lineHeight:1.6}}>
                      Ces pages seront ajoutées à la fin de chaque document, après le devis ou la facture. Seuls les PDF importés sont acceptés.
                    </div>
                  </div>
                </div>
              )}

                            {tab==='signature'&&(
                <div>
                  <Section title="Zone de signature client">
                    <Field params={params} set={set} label="Texte au-dessus de la signature" k="texteClient" placeholder="Le client"/>
                    <Field params={params} set={set} label="Mention obligatoire" k="mentionClient" rows={3}/>
                    <div style={{padding:'10px 12px',background:'#fffbeb',border:'1px solid #fde68a',borderRadius:8,fontSize:12,color:AM,marginBottom:14}}>
                      ⚠ Mention recommandée pour la valeur juridique du devis
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Taille de la zone de signature</label>
                      <div style={{display:'flex',gap:8}}>
                        {[['petit','Petit'],['moyen','Moyen'],['grand','Grand']].map(([v,l])=>(
                          <button key={v} onClick={()=>set('tailleSignature',v)}
                            style={{flex:1,padding:'8px',border:`2px solid ${params.tailleSignature===v?G:BD}`,borderRadius:8,background:params.tailleSignature===v?'#f0fdf4':'#fff',color:params.tailleSignature===v?G:'#555',fontSize:12,fontWeight:params.tailleSignature===v?600:400,cursor:'pointer'}}>
                            {l} {params.tailleSignature===v?'✓':''}
                          </button>
                        ))}
                      </div>
                    </div>
                  </Section>

                  <Section title="Zone de signature entreprise">
                    <Field params={params} set={set} label="Texte au-dessus de la signature" k="nomSignataireEntreprise" placeholder="Ex : Alexandre Delcourt — Gérant"/>
                  </Section>

                  <Section title="Cachet / Tampon">
                    <input type="file" accept="image/png" id="cachet-upload" style={{display:'none'}}
                      onChange={e=>{
                        const file=e.target.files?.[0]
                        if(!file)return
                        if(file.size>2*1024*1024){alert('Fichier trop lourd — max 2 Mo');return}
                        const reader=new FileReader()
                        reader.onload=(ev)=>set('cachet',ev.target?.result)
                        reader.readAsDataURL(file)
                      }}/>
                    <label htmlFor="cachet-upload">
                      <div style={{display:'flex',alignItems:'center',justifyContent:'center' as const,gap:8,padding:'12px 16px',border:`2px dashed ${BD}`,borderRadius:10,background:'#fff',color:'#555',fontSize:13,cursor:'pointer',transition:'all 0.15s'}}
                        onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                        onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=BD}>
                        {(params as any).cachet?(
                          <div style={{display:'flex',alignItems:'center',gap:10}}>
                            <img src={(params as any).cachet} alt="cachet" style={{width:40,height:40,objectFit:'contain'}}/>
                            <div>
                              <div style={{fontSize:12,fontWeight:600,color:G}}>✓ Cachet importé</div>
                              <div style={{fontSize:11,color:'#888'}}>Cliquez pour changer</div>
                            </div>
                          </div>
                        ):(
                          <span>Importer un tampon/cachet — PNG fond transparent — max 2 Mo</span>
                        )}
                      </div>
                    </label>
                    {(params as any).cachet&&(
                      <button onClick={()=>set('cachet','')} style={{marginTop:8,padding:'5px 12px',background:'#fff',border:`1px solid ${BD}`,borderRadius:6,fontSize:11,cursor:'pointer',color:'#888',display:'flex',alignItems:'center',gap:4}}>
                        🗑 Supprimer
                      </button>
                    )}
                  </Section>
                </div>
              )}
            </div>

            {/* COLONNE DROITE — Aperçu live */}
            <div style={{position:'sticky' as const,top:0,alignSelf:'flex-start' as const}}>
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)',padding:'0'}}>
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${BD}`,fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>
                  Aperçu live
                </div>

                {/* Mini aperçu document — scroll vertical */}
                <div style={{padding:14,background:'#f8f9fa',maxHeight:700,overflowY:'auto'}}>
                  {/* PAGE DE GARDE */}
                  {params.gardeActive&&(
                    <div style={{marginBottom:12}}>
                      <div style={{fontSize:9,color:'#888',fontWeight:600,marginBottom:4,textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>Page de garde</div>
                      <div style={{background:'#fff',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',overflow:'hidden',minHeight:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {gardePdfThumbs.length>0?(
                          <div>{gardePdfThumbs.map((thumb,i)=>(
                            <img key={i} src={thumb} alt={`page ${i+1}`} style={{width:'100%',display:'block',marginBottom:i<gardePdfThumbs.length-1?4:0}}/>
                          ))}</div>
                        ):(
                          <div style={{padding:20,textAlign:'center' as const,color:'#aaa',fontSize:11}}>
                            <div style={{fontSize:20,marginBottom:4}}>📄</div>
                            PDF importé — aperçu disponible après import
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* DEVIS */}
                  <div style={{marginBottom:12}}>
                    <div style={{fontSize:9,color:'#888',fontWeight:600,marginBottom:4,textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>Devis / Facture</div>
                  <div style={{background:'#fff',borderRadius:0,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',overflow:'hidden',fontFamily:params.police||'system-ui',fontSize:'0.72em',border:'1px solid #e5e7eb'}}>

                    {/* 1. EN-TÊTE — fond blanc, 2 colonnes */}
                    <div style={{padding:'12px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      {/* Colonne gauche — Infos entreprise */}
                      <div>
                        {logoPreview&&<img src={logoPreview} alt="logo" style={{height:24,maxWidth:80,objectFit:'contain',marginBottom:5,display:'block'}}/>}
                        {params.showNom&&<div style={{fontWeight:700,fontSize:12,color:'#111',marginBottom:2}}>{params.nomEntreprise}{params.showFormeJuridique&&params.formeJuridique?' — '+params.formeJuridique:''}</div>}
                        {params.showAdresse&&<div style={{fontSize:9,color:'#555'}}>{params.adresseLigne1||params.adresse}{params.codePostal?' '+params.codePostal:''}{params.ville?' '+params.ville:''}</div>}
                        {params.showTel&&<div style={{fontSize:9,color:'#555'}}>{params.tel}</div>}
                        {params.showEmail&&<div style={{fontSize:9,color:'#555'}}>{params.email}</div>}
                        {params.showSiteWeb&&<div style={{fontSize:9,color:'#555'}}>{params.siteWeb}</div>}
                      </div>
                      {/* Colonne droite — Destinataire */}
                      <div>
<div style={{background:'#f3f4f6',borderRadius:6,padding:'8px 10px'}}>
                          <div style={{fontSize:10,fontWeight:700,color:'#111'}}>Jean Dupont</div>
                          <div style={{fontSize:8,color:'#555',marginTop:2}}>Dupont Immobilier SAS</div>
                          <div style={{fontSize:8,color:'#555'}}>45 avenue des Champs</div>
                          <div style={{fontSize:8,color:'#555'}}>75008 Paris</div>
                        </div>
                      </div>
                    </div>

                    {/* 2. BLOC INFOS DEVIS */}
                    <div style={{padding:'8px 14px',display:'flex',justifyContent:'space-between',alignItems:'flex-start',background:'#fff'}}>
                      <div>
                        <div style={{fontSize:11,fontWeight:700,color:'#111'}}>Devis n° {(params.formatDevis||'DEV-{YYYY}-{NUM}').replace('{YYYY}',new Date().getFullYear().toString()).replace('{NUM}','001')}</div>
                        <div style={{fontSize:8,color:'#888',marginTop:2}}>Valable {params.validiteDevis||60} jours</div>
                        <div style={{fontSize:8,color:'#888',fontStyle:'italic',marginTop:4}}>Adresse du projet :</div>
                        <div style={{fontSize:8,color:'#555',marginTop:2}}>12 rue de la Paix, 75001 Paris</div>
                      </div>
                      <div style={{textAlign:'right' as const}}>
                        <div style={{fontSize:8,color:'#555'}}>En date du {new Date().toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>

                    {/* 3. OBJET / INTRO */}
                    {params.introDevis&&(
                      <div style={{padding:'6px 14px'}}>
                        <div style={{fontSize:8,color:'#555',fontStyle:'italic',lineHeight:1.5}}>{params.introDevis}</div>
                      </div>
                    )}

                    {/* 4. TABLEAU */}
                    <div style={{padding:'0 14px'}}>
                      <table style={{width:'100%',borderCollapse:'collapse',fontSize:8}}>
                        <thead>
                          <tr style={{background:'#f9fafb'}}>
                            {['N°','Désignation','Qté','PU HT','TVA','Total HT'].map(h=>(
                              <th key={h} style={{padding:'5px 4px',textAlign:h==='N°'||h==='Qté'||h==='PU HT'||h==='TVA'||h==='Total HT'?'right' as const:'left' as const,fontSize:7,color:'#888',fontWeight:600}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {/* Catégorie */}
                          <tr style={{background:params.couleurPrincipale+'18',borderBottom:'1px solid #e5e7eb'}}>
                            <td style={{padding:'4px',fontWeight:700,color:'#111',fontSize:8}}>1.</td>
                            <td colSpan={4} style={{padding:'4px',fontWeight:700,color:'#111',fontSize:8}}>Entrée</td>
                            <td style={{padding:'4px',textAlign:'right' as const,fontWeight:700,color:'#111',fontSize:8}}>6 235 €</td>
                          </tr>
                          {/* Sous-catégorie */}
                          <tr style={{background:params.couleurPrincipale+'0D',borderBottom:'1px solid #e5e7eb'}}>
                            <td style={{padding:'4px',fontWeight:600,color:'#111',fontSize:8}}>1.1</td>
                            <td colSpan={4} style={{padding:'4px',fontWeight:600,color:'#111',fontSize:8}}>Peinture</td>
                            <td style={{padding:'4px',textAlign:'right' as const,fontWeight:600,color:'#111',fontSize:8}}>1 600 €</td>
                          </tr>
                          {/* Ouvrage */}
                          <tr style={{background:'#fff',borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'4px',color:'#888',fontSize:7}}>1.1.1</td>
                            <td style={{padding:'4px'}}>
                              <div style={{fontSize:8,fontWeight:500,color:'#111'}}>Peinture entrée</div>
                              <div style={{fontSize:7,color:'#888',fontStyle:'italic'}}>Préparation + 2 couches mat</div>
                            </td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>2 forf.</td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>800 €</td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>10%</td>
                            <td style={{padding:'4px',textAlign:'right' as const,fontWeight:600,color:'#111',fontSize:8}}>1 600 €</td>
                          </tr>
                          {/* Sous-catégorie 2 */}
                          <tr style={{background:params.couleurPrincipale+'0D',borderBottom:'1px solid #e5e7eb'}}>
                            <td style={{padding:'4px',fontWeight:600,color:'#111',fontSize:8}}>1.2</td>
                            <td colSpan={4} style={{padding:'4px',fontWeight:600,color:'#111',fontSize:8}}>Parquet</td>
                            <td style={{padding:'4px',textAlign:'right' as const,fontWeight:600,color:'#111',fontSize:8}}>4 635 €</td>
                          </tr>
                          <tr style={{background:'#fff',borderBottom:'1px solid #f3f4f6'}}>
                            <td style={{padding:'4px',color:'#888',fontSize:7}}>1.2.1</td>
                            <td style={{padding:'4px'}}>
                              <div style={{fontSize:8,fontWeight:500,color:'#111'}}>Pose parquet chêne</div>
                              <div style={{fontSize:7,color:'#888',fontStyle:'italic'}}>Parquet chêne massif 12mm</div>
                            </td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>45 m²</td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>103 €</td>
                            <td style={{padding:'4px',textAlign:'right' as const,color:'#333',fontSize:8}}>10%</td>
                            <td style={{padding:'4px',textAlign:'right' as const,fontWeight:600,color:'#111',fontSize:8}}>4 635 €</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* 5. RÉCAPITULATIF */}
                    <div style={{padding:'8px 14px',display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
                      {/* Moyens de paiement — gauche */}
                      <div style={{flex:1,paddingTop:2}}>
                        {(params.moyensVirement||params.moyensCheque||params.moyensCarte||params.moyensEspeces)&&(
                          <div style={{fontSize:7,color:'#555',lineHeight:1.5}}>
                            <span style={{fontWeight:600}}>Paiement : </span>
                            {(()=>{
                              const moyens=[params.moyensVirement?'virement bancaire':null,params.moyensCheque?'chèque':null,params.moyensCarte?'carte bancaire':null,params.moyensEspeces?'espèces':null].filter(Boolean) as string[]
                              if(moyens.length===0) return ''
                              const first=moyens[0].charAt(0).toUpperCase()+moyens[0].slice(1)
                              if(moyens.length===1) return first+'.'
                              return first+moyens.slice(1).map((m:string,i:number)=>i===moyens.length-2?' ou '+m:' / '+m).join('')+'.'
                            })()}
                          </div>
                        )}
                      </div>
                      {/* Montants — droite */}
                      <div style={{minWidth:160}}>
                        {[
                          {label:'Sous-total HT',val:'6 235,00 €',bold:false},
                          {label:'Total HT',val:'6 235,00 €',bold:true},
                          {label:'TVA (10%)',val:'623,50 €',bold:false},
                          {label:'Total TTC',val:'6 858,50 €',bold:true},
                        ].map(row=>(
                          <div key={row.label} style={{display:'flex',justifyContent:'space-between',gap:16,marginBottom:2}}>
                            <span style={{fontSize:8,color:row.bold?'#111':'#888',fontWeight:row.bold?700:400}}>{row.label}</span>
                            <span style={{fontSize:8,color:'#111',fontWeight:row.bold?700:400}}>{row.val}</span>
                          </div>
                        ))}
                        <div style={{borderTop:'2px solid #111',paddingTop:4,marginTop:4,display:'flex',justifyContent:'space-between',gap:16}}>
                          <span style={{fontSize:9,fontWeight:800,color:'#111'}}>Net à payer</span>
                          <span style={{fontSize:10,fontWeight:800,color:'#111'}}>6 858,50 €</span>
                        </div>
                      </div>
                      </div>
                    </div>

                    {/* 6. TEXTE PIED DE DEVIS */}
                    {params.noteDevis&&(
                      <div style={{padding:'6px 14px',background:'#fff'}}>
                        <div style={{fontSize:7,color:'#555',fontStyle:'italic',lineHeight:1.5}}>{params.noteDevis}</div>
                      </div>
                    )}

                    {/* 7. SIGNATURES */}
                    <div style={{padding:'10px 14px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,background:'#fff'}}>
                      <div style={{border:'1px solid #e5e7eb',padding:'7px 10px'}}>
                        <div style={{fontSize:9,fontWeight:700,color:'#111',marginBottom:4}}>{params.texteClient||'Le client'}</div>
                        <div style={{fontSize:7,color:'#555',fontStyle:'italic',marginBottom:6,lineHeight:1.5}}>{params.mentionClient}</div>
                        <div style={{height:params.tailleSignature==='petit'?16:params.tailleSignature==='grand'?44:28,transition:'height 0.2s'}}/>
                      </div>
                      <div style={{border:'1px solid #e5e7eb',padding:'7px 10px'}}>
                        <div style={{fontSize:9,fontWeight:700,color:'#111',marginBottom:4}}>{params.nomSignataireEntreprise||"L'entreprise"}</div>
                        {(params as any).cachet?(
                          <img src={(params as any).cachet} alt="cachet" style={{height:params.tailleSignature==='petit'?16:params.tailleSignature==='grand'?44:28,maxWidth:'100%',objectFit:'contain',display:'block',transition:'height 0.2s'}}/>
                        ):(
                          <div style={{height:params.tailleSignature==='petit'?16:params.tailleSignature==='grand'?44:28,transition:'height 0.2s'}}/>
                        )}
                      </div>
                    </div>

                    {/* 8. PIED DE PAGE LÉGAL */}
                    <div style={{padding:'8px 14px',background:'#fff',borderTop:'1px solid #e5e7eb'}}>
                      <div style={{fontSize:6.5,color:'#888',textAlign:'center' as const,lineHeight:1.8,fontFamily:params.police||'system-ui'}}>
                        {(()=>{
                          const p=params as any
                          const parts:string[]=[p.nomEntreprise]
                          const formeCapital=[
                            p.showFormeJuridiquePied&&p.formeJuridique?p.formeJuridique:'',
                            p.showCapital&&p.capitalSocial?'au capital de '+p.capitalSocial:''
                          ].filter(Boolean).join(' ')
                          if(formeCapital) parts.push(formeCapital)
                          if(p.showSiegeSocial) parts.push(p.adresseLigne1+' '+p.codePostal+' '+p.ville)
                          if(p.showRCS&&p.rcs) parts.push('Immatriculée au RCS de '+(p.ville||'')+' sous le numéro '+p.rcs)
                          if(p.showSiren&&p.siren) parts.push('SIREN : '+p.siren)
                          if(p.showSiretPied&&p.siret) parts.push('SIRET : '+p.siret)
                          if(p.showTvaIntraP&&p.tvaIntra) parts.push('TVA Intracommunautaire : '+p.tvaIntra)
                          if(p.showDecennalePied&&p.decennale) parts.push('Assurance Décennale : N° '+p.decennale)
                          if(p.showIBANPied&&p.iban) parts.push('IBAN : '+p.iban)
                          return parts.join(' — ')
                        })()}
                      </div>
                    </div>
                  </div>
                  </div>

                  {/* PAGES COMPLÉMENTAIRES */}
                  {((params as any).pagesComp||[]).filter((p:any)=>p.active&&p.devis).map((page:any)=>(
                    <div key={page.id} style={{marginBottom:12}}>
                      <div style={{fontSize:9,color:'#888',fontWeight:600,marginBottom:4,textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>
                        📎 {page.nom}
                      </div>
                      <div style={{background:'#fff',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',overflow:'hidden',minHeight:80,display:'flex',alignItems:'center',justifyContent:'center'}}>
                        {compThumbs[page.id]?.length>0?(
                          <div>{(compThumbs[page.id]||[]).map((thumb:string,i:number)=>(
                            <img key={i} src={thumb} alt={`page ${i+1}`} style={{width:'100%',display:'block',marginBottom:i<(compThumbs[page.id]||[]).length-1?4:0}}/>
                          ))}</div>
                        ):(
                          <div style={{padding:20,textAlign:'center' as const,color:'#aaa',fontSize:11}}>
                            <div style={{fontSize:20,marginBottom:4}}>📄</div>
                            {page.nom}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal reset */}
      {showReset&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowReset(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:14,padding:24,maxWidth:360,width:'90%',textAlign:'center' as const}}>
            <div style={{fontSize:28,marginBottom:10}}>⚠️</div>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:8}}>Réinitialiser les paramètres ?</div>
            <p style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:20}}>Toutes vos personnalisations seront perdues et remplacées par les valeurs par défaut.</p>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowReset(false)} style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555',fontWeight:500}}>Annuler</button>
              <button onClick={reinitialiser} style={{flex:1,padding:11,background:RD,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Réinitialiser</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {saved&&(
        <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',borderRadius:10,padding:'12px 24px',zIndex:9999,display:'flex',alignItems:'center',gap:10,boxShadow:'0 4px 20px rgba(0,0,0,0.3)'}}>
          <span style={{color:G,fontSize:16}}>✓</span>
          <span style={{fontSize:13}}>Paramètres enregistrés</span>
        </div>
      )}
    </div>
  )
}

function fmt2(n:number){return n.toLocaleString('fr-FR',{minimumFractionDigits:2})}

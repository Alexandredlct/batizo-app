'use client'
import { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar'
import SearchBar from '../components/SearchBar'

const G='#1D9E75',AM='#BA7517',RD='#E24B4A',BD='#e5e7eb'

const TABS=[
  {id:'modeles',label:'Modèles'},
  {id:'entete',label:'En-tête'},
  {id:'pied',label:'Pied de page'},
  {id:'style',label:'Style'},
  {id:'devis',label:'Devis & Factures'},
  {id:'garde',label:'Page de garde'},
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
}

export default function ParametresPage(){
  const[tab,setTab]=useState('modeles')
  const[params,setParams]=useState({...DEFAULT_PARAMS})
  const[saved,setSaved]=useState(false)
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
    if(stored) setParams(JSON.parse(stored))
  },[])

  const set=(key:string,val:any)=>setParams(p=>({...p,[key]:val}))

  const enregistrer=()=>{
    localStorage.setItem('batizo_params',JSON.stringify(params))
    setSaved(true)
    setTimeout(()=>setSaved(false),3000)
  }

  const reinitialiser=()=>{
    setParams({...DEFAULT_PARAMS})
    localStorage.removeItem('batizo_params')
    setShowReset(false)
  }

  // Helpers UI
  const Toggle=({k}:{k:string})=>(
    <div onClick={()=>set(k,!(params as any)[k])}
      style={{width:42,height:24,borderRadius:12,background:(params as any)[k]?G:'#d1d5db',cursor:'pointer',position:'relative',transition:'background 0.2s',flexShrink:0}}>
      <div style={{position:'absolute',top:2,left:(params as any)[k]?20:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 3px rgba(0,0,0,0.2)'}}/>
    </div>
  )
  const CheckRow=({label,k,children}:{label:string,k:string,children?:any})=>(
    <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
      <input type="checkbox" checked={(params as any)[k]} onChange={e=>set(k,e.target.checked)} style={{accentColor:G,width:15,height:15,flexShrink:0}}/>
      <span style={{fontSize:13,color:'#333',minWidth:160}}>{label}</span>
      {children}
    </div>
  )
  const Field=({label,k,placeholder,type='text',rows}:{label:string,k:string,placeholder?:string,type?:string,rows?:number})=>(
    <div style={{marginBottom:14}}>
      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>{label}</label>
      {rows?(
        <textarea value={(params as any)[k]||''} onChange={e=>set(k,e.target.value)} rows={rows} placeholder={placeholder}
          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',resize:'none' as const,fontFamily:'system-ui',boxSizing:'border-box' as const}}
          onFocus={e=>(e.currentTarget as HTMLTextAreaElement).style.borderColor=G}
          onBlur={e=>(e.currentTarget as HTMLTextAreaElement).style.borderColor=BD}/>
      ):(
        <input type={type} value={(params as any)[k]||''} onChange={e=>set(k,e.target.value)} placeholder={placeholder}
          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const}}
          onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
          onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}/>
      )}
    </div>
  )
  const Section=({title,children}:{title:string,children:any})=>(
    <div style={{marginBottom:24}}>
      <div style={{fontSize:13,fontWeight:700,color:'#111',marginBottom:12,paddingBottom:8,borderBottom:`1px solid ${BD}`}}>{title}</div>
      {children}
    </div>
  )

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
            <button onClick={enregistrer}
              style={{padding:'8px 18px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
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
              {tab==='modeles'&&(
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:4}}>Choisir un modèle prédéfini</div>
                  <div style={{fontSize:13,color:'#888',marginBottom:20}}>Sélectionnez un thème de base, puis personnalisez-le dans les autres onglets.</div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                    {[
                      {id:'classique',label:'Classique',desc:'Sobre et professionnel',color:'#111'},
                      {id:'moderne',label:'Moderne',desc:'Coloré et dynamique',color:G},
                      {id:'minimaliste',label:'Minimaliste',desc:'Épuré et élégant',color:'#555'},
                      {id:'pro-dark',label:'Pro Dark',desc:'Sombre et premium',color:'#1a1a1a'},
                    ].map(m=>(
                      <div key={m.id} onClick={()=>set('modele',m.id)}
                        style={{border:`2px solid ${(params as any).modele===m.id?G:BD}`,borderRadius:12,overflow:'hidden',cursor:'pointer',transition:'all 0.2s',boxShadow:(params as any).modele===m.id?`0 0 0 3px ${G}20`:''}}>
                        {/* Mini aperçu */}
                        <div style={{height:120,background:m.id==='pro-dark'?'#1a1a1a':'#f8f9fa',position:'relative',padding:12}}>
                          <div style={{background:m.color,height:8,borderRadius:4,marginBottom:6,width:'60%'}}/>
                          <div style={{background:'#e5e7eb',height:4,borderRadius:2,marginBottom:3,width:'80%'}}/>
                          <div style={{background:'#e5e7eb',height:4,borderRadius:2,marginBottom:3,width:'65%'}}/>
                          <div style={{background:'#e5e7eb',height:4,borderRadius:2,width:'45%'}}/>
                          <div style={{position:'absolute',bottom:8,right:10,background:m.color,color:'#fff',fontSize:9,padding:'2px 8px',borderRadius:4,fontWeight:700}}>
                            {fmt2(12400)} €
                          </div>
                          {(params as any).modele===m.id&&(
                            <div style={{position:'absolute',top:8,right:8,width:20,height:20,borderRadius:'50%',background:G,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700}}>✓</div>
                          )}
                        </div>
                        <div style={{padding:'10px 12px',background:'#fff'}}>
                          <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{m.label}</div>
                          <div style={{fontSize:11,color:'#888'}}>{m.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ===== EN-TÊTE ===== */}
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
                            <div style={{fontSize:28,marginBottom:6}}>🖼</div>
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
                  <div style={{fontSize:13,color:'#888',marginBottom:16}}>Ces informations apparaîtront dans le pied de page de tous vos documents.</div>

                  <Section title="Informations légales">
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

                  <Section title="Mise en page">
                    <div style={{display:'flex',gap:10}}>
                      {[{id:'aere',label:'Aérée',desc:'Plus d\'espacement'},{id:'compacte',label:'Compacte',desc:'Plus dense'}].map(m=>(
                        <div key={m.id} onClick={()=>set('miseEnPage',m.id)}
                          style={{flex:1,padding:'12px',border:`2px solid ${params.miseEnPage===m.id?G:BD}`,borderRadius:10,cursor:'pointer',background:params.miseEnPage===m.id?'#f0fdf4':'#fff',textAlign:'center' as const}}>
                          <div style={{fontSize:13,fontWeight:700,color:params.miseEnPage===m.id?G:'#111'}}>{m.label} {params.miseEnPage===m.id?'✓':''}</div>
                          <div style={{fontSize:11,color:'#888',marginTop:2}}>{m.desc}</div>
                        </div>
                      ))}
                    </div>
                  </Section>

                  <Section title="Options">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:'#111'}}>Afficher les photos dans le devis</div>
                        <div style={{fontSize:11,color:'#888'}}>Photos des matériaux et ouvrages</div>
                      </div>
                      <Toggle k="afficherPhotos"/>
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
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
                      <div>
                        <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>TVA par défaut</label>
                        <select value={params.tvaDef} onChange={e=>set('tvaDef',e.target.value)}
                          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',background:'#fff'}}>
                          {['0%','5.5%','10%','20%'].map(t=><option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Acompte par défaut (%)</label>
                        <input type="number" value={params.acompteDef} onChange={e=>set('acompteDef',parseInt(e.target.value)||0)}
                          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none',boxSizing:'border-box' as const}}/>
                      </div>
                    </div>
                    <Field label="Nom affiché dans la signature" k="nomSignataire" placeholder="Ex : Alexandre Delcourt"/>
                    <div style={{fontSize:11,color:'#888',marginTop:-10,marginBottom:14}}>Apparaît en bas du devis signé</div>
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Moyens de règlement par défaut</label>
                      {[['moyensVirement','Virement bancaire'],['moyensCheque','Chèque'],['moyensCarte','Carte bancaire'],['moyensEspeces','Espèces']].map(([k,l])=>(
                        <CheckRow key={k} label={l} k={k}/>
                      ))}
                    </div>
                  </Section>

                  <Section title="Spécifique aux devis">
                    <div style={{marginBottom:14}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Validité des devis (jours)</label>
                      <input type="number" value={params.validiteDevis} onChange={e=>set('validiteDevis',parseInt(e.target.value)||0)}
                        style={{width:100,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,color:'#111',outline:'none'}}/>
                    </div>
                    <Field label="Texte d'introduction" k="introDevis" rows={3} placeholder="Suite à notre rencontre..."/>
                    <Field label="Note de fin de devis" k="noteDevis" rows={3} placeholder="Ce texte apparaît en bas du devis, avant la zone de signature."/>
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
                    <Field label="Note de fin de facture" k="noteFacture" rows={3}/>
                  </Section>
                </div>
              )}

              {/* ===== PAGE DE GARDE ===== */}
              {tab==='garde'&&(
                <div>
                  <Section title="Page de garde">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
                      <div>
                        <div style={{fontSize:13,fontWeight:500,color:'#111'}}>Activer la page de garde</div>
                        <div style={{fontSize:11,color:'#888'}}>Une page de garde sera ajoutée avant le devis</div>
                      </div>
                      <Toggle k="gardeActive"/>
                    </div>
                    {params.gardeActive&&(
                      <>
                        <div style={{marginBottom:14}}>
                          <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Fond de la page de garde</label>
                          <div style={{display:'flex',gap:8}}>
                            {[['couleur','🎨 Couleur'],['image','🖼 Image'],['pdf','📄 PDF']].map(([v,l])=>(
                              <button key={v} onClick={()=>set('gardeFond',v)}
                                style={{flex:1,padding:'8px',border:`2px solid ${params.gardeFond===v?G:BD}`,borderRadius:8,background:params.gardeFond===v?'#f0fdf4':'#fff',color:params.gardeFond===v?G:'#555',fontSize:12,fontWeight:params.gardeFond===v?600:400,cursor:'pointer'}}>
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                        {params.gardeFond==='couleur'&&(
                          <div style={{display:'flex',gap:10,alignItems:'center',marginBottom:14}}>
                            <input type="color" value={params.gardeColor} onChange={e=>set('gardeColor',e.target.value)}
                              style={{width:44,height:44,borderRadius:8,border:`1px solid ${BD}`,cursor:'pointer',padding:2}}/>
                            {['#1D9E75','#2563eb','#111','#9333ea'].map(col=>(
                              <div key={col} onClick={()=>set('gardeColor',col)}
                                style={{width:32,height:32,borderRadius:'50%',background:col,cursor:'pointer',border:`3px solid ${params.gardeColor===col?'#111':'transparent'}`}}/>
                            ))}
                          </div>
                        )}
                        <Field label="Titre sur la page de garde" k="gardeTitre" placeholder="DEVIS DE TRAVAUX"/>
                        <Field label="Sous-titre" k="gardeSousTitre" placeholder="Rénovation complète — Paris & Île-de-France"/>
                      </>
                    )}
                  </Section>
                </div>
              )}

              {/* ===== PAGES COMPLÉMENTAIRES ===== */}
              {tab==='complementaires'&&(
                <div>
                  <div style={{fontSize:13,color:'#888',marginBottom:16}}>Ces pages seront ajoutées à la fin de chaque devis ou facture.</div>
                  <Section title="Conditions Générales de Vente (CGV)">
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{fontSize:13,fontWeight:500,color:'#111'}}>Activer les CGV</div>
                      <Toggle k="cgvActive"/>
                    </div>
                    {params.cgvActive&&(
                      <>
                        <div style={{display:'flex',gap:8,marginBottom:12}}>
                          {[['texte','📝 Texte'],['pdf','📄 PDF importé']].map(([v,l])=>(
                            <button key={v} onClick={()=>set('cgvSource',v)}
                              style={{padding:'7px 14px',border:`2px solid ${(params as any).cgvSource===v?G:BD}`,borderRadius:8,background:(params as any).cgvSource===v?'#f0fdf4':'#fff',color:(params as any).cgvSource===v?G:'#555',fontSize:12,fontWeight:(params as any).cgvSource===v?600:400,cursor:'pointer'}}>
                              {l}
                            </button>
                          ))}
                        </div>
                        <Field label="Texte des CGV" k="cgvTexte" rows={8} placeholder="Conditions générales de vente..."/>
                      </>
                    )}
                  </Section>
                  <button style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',border:`2px dashed ${BD}`,borderRadius:10,background:'#fff',color:'#555',fontSize:13,cursor:'pointer',width:'100%',justifyContent:'center' as const}}
                    onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=G}
                    onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=BD}>
                    <span style={{fontSize:18}}>+</span> Ajouter une page complémentaire
                  </button>
                </div>
              )}

              {/* ===== SIGNATURE ===== */}
              {tab==='signature'&&(
                <div>
                  <Section title="Zone de signature client">
                    <Field label="Texte au-dessus de la signature" k="texteClient" placeholder="Le client"/>
                    <Field label="Mention obligatoire" k="mentionClient" rows={3}/>
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
                    <Field label="Nom affiché (signataire)" k="nomSignataireEntreprise" placeholder="Alexandre Delcourt"/>
                    <Field label="Titre / Fonction" k="titreSignataire" placeholder="Gérant — Batizo SAS"/>
                  </Section>

                  <Section title="Cachet / Tampon">
                    <div style={{border:`2px dashed ${BD}`,borderRadius:10,padding:'20px',textAlign:'center' as const,cursor:'pointer',background:'#fafafa'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.borderColor=G}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.borderColor=BD}>
                      <div style={{fontSize:28,marginBottom:6}}>🔵</div>
                      <div style={{fontSize:13,color:'#555',fontWeight:500}}>Importer un tampon/cachet</div>
                      <div style={{fontSize:11,color:'#888',marginTop:2}}>PNG fond transparent — max 2 Mo — format carré idéal</div>
                    </div>
                  </Section>
                </div>
              )}
            </div>

            {/* COLONNE DROITE — Aperçu live */}
            <div style={{position:'sticky' as const,top:0,alignSelf:'flex-start' as const}}>
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden',boxShadow:'0 2px 8px rgba(0,0,0,0.06)'}}>
                <div style={{padding:'10px 14px',borderBottom:`1px solid ${BD}`,fontSize:11,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.05em'}}>
                  Aperçu live
                </div>

                {/* Mini aperçu document */}
                <div style={{padding:16,background:'#f8f9fa'}}>
                  <div style={{background:'#fff',borderRadius:8,boxShadow:'0 2px 8px rgba(0,0,0,0.1)',overflow:'hidden',fontSize:'0.85em'}}>

                    {/* En-tête aperçu */}
                    <div style={{background:params.couleurPrincipale,padding:'16px 18px',display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                      <div style={{color:'#fff',display:'flex',alignItems:'flex-start',gap:10}}>
                        <div>
                        {logoPreview&&(
                          <img src={logoPreview} alt="logo" style={{height:36,maxWidth:120,objectFit:'contain',marginBottom:6,display:'block',filter:'brightness(0) invert(1)',opacity:0.95}}/>
                        )}
                        {params.showNom&&<div style={{fontWeight:700,fontSize:14}}>{params.nomEntreprise}</div>}
                        {params.showAdresse&&<div style={{fontSize:10,opacity:0.9,marginTop:1}}>{params.adresseLigne1||params.adresse}{params.codePostal?` ${params.codePostal}`:''}{params.ville?` ${params.ville}`:''}</div>}
                        {params.showTel&&<div style={{fontSize:10,opacity:0.9}}>{params.tel}</div>}
                        {params.showEmail&&<div style={{fontSize:10,opacity:0.9}}>{params.email}</div>}
                        {params.showSiteWeb&&<div style={{fontSize:10,opacity:0.9}}>{params.siteWeb}</div>}
                        {params.showSlogan&&params.slogan&&<div style={{fontSize:9,opacity:0.8,fontStyle:'italic'}}>{params.slogan}</div>}
                        </div>
                      </div>
                      <div style={{color:'#fff',textAlign:'right' as const}}>
                        <div style={{fontSize:12,fontWeight:700}}>DEVIS</div>
                        <div style={{fontSize:9,opacity:0.8}}>DEV-2026-001</div>
                        <div style={{fontSize:9,opacity:0.8}}>12/04/2026</div>
                      </div>
                    </div>

                    {/* Client */}
                    <div style={{padding:'12px 16px',borderBottom:`1px solid ${BD}`}}>
                      <div style={{fontSize:9,color:'#888',marginBottom:2}}>DESTINATAIRE</div>
                      <div style={{fontSize:11,fontWeight:600,color:'#111'}}>Jean Dupont</div>
                      <div style={{fontSize:9,color:'#555'}}>45 avenue des Champs, 75008 Paris</div>
                    </div>

                    {/* Lignes */}
                    <div style={{padding:'12px 16px'}}>
                      <div style={{display:'grid',gridTemplateColumns:'1fr 50px 50px 60px',gap:4,marginBottom:4,borderBottom:`1px solid ${BD}`,paddingBottom:4}}>
                        <div style={{fontSize:8,color:'#888',fontWeight:600}}>DÉSIGNATION</div>
                        <div style={{fontSize:8,color:'#888',fontWeight:600,textAlign:'right' as const}}>QTÉ</div>
                        <div style={{fontSize:8,color:'#888',fontWeight:600,textAlign:'right' as const}}>PU HT</div>
                        <div style={{fontSize:8,color:'#888',fontWeight:600,textAlign:'right' as const}}>TOTAL HT</div>
                      </div>
                      {[{d:'Pose parquet chêne',q:'45 m²',pu:'103 €',t:'4 635 €'},{d:'Peinture salon',q:'2 forf.',pu:'800 €',t:'1 600 €'}].map((l,i)=>(
                        <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 50px 50px 60px',gap:4,marginBottom:3}}>
                          <div style={{fontSize:9,color:'#111'}}>{l.d}</div>
                          <div style={{fontSize:9,color:'#555',textAlign:'right' as const}}>{l.q}</div>
                          <div style={{fontSize:9,color:'#555',textAlign:'right' as const}}>{l.pu}</div>
                          <div style={{fontSize:9,fontWeight:600,color:'#111',textAlign:'right' as const}}>{l.t}</div>
                        </div>
                      ))}
                      <div style={{borderTop:`2px solid ${BD}`,paddingTop:4,display:'flex',justifyContent:'space-between',marginTop:4}}>
                        <div style={{fontSize:9,fontWeight:700,color:'#111'}}>Net à payer</div>
                        <div style={{fontSize:11,fontWeight:800,color:params.couleurPrincipale}}>7 535,50 €</div>
                      </div>
                    </div>

                    {/* Signature aperçu */}
                    <div style={{padding:'12px 16px',borderTop:`1px solid ${BD}`,display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                      <div style={{border:`1px solid ${BD}`,borderRadius:4,padding:'6px 8px'}}>
                        <div style={{fontSize:9,fontWeight:600,color:'#111',marginBottom:3}}>{params.texteClient}</div>
                        <div style={{fontSize:7,color:'#888',fontStyle:'italic',marginBottom:4,lineHeight:1.4}}>Bon pour travaux.</div>
                        <div style={{height:40,border:`1px dashed ${BD}`,borderRadius:3}}/>
                      </div>
                      <div style={{border:`1px solid ${BD}`,borderRadius:4,padding:'6px 8px'}}>
                        <div style={{fontSize:9,fontWeight:600,color:'#111',marginBottom:3}}>{params.nomSignataireEntreprise}</div>
                        <div style={{fontSize:7,color:'#888',marginBottom:4}}>{params.titreSignataire}</div>
                        <div style={{height:20,border:`1px dashed ${BD}`,borderRadius:3}}/>
                      </div>
                    </div>

                    {/* Pied de page aperçu */}
                    <div style={{padding:'10px 16px',background:'#f9fafb',borderTop:`1px solid ${BD}`}}>
                      <div style={{fontSize:7,color:'#888',textAlign:'center' as const,lineHeight:1.8}}>
                        {(()=>{
                          const p=params as any
                          const parts:string[]=[p.nomEntreprise]
                          const formeCapital=[
                            p.showFormeJuridiquePied&&p.formeJuridique?p.formeJuridique:'',
                            p.showCapital&&p.capitalSocial?'au capital de '+p.capitalSocial:''
                          ].filter(Boolean).join(' ')
                          if(formeCapital) parts.push(formeCapital)
                          if(p.showRCS&&p.rcs){
                            const ville=p.ville||'[ville]'
                            const num=p.rcs.replace(/^RCSs+w+s+ws+/,'')
                            parts.push('Immatriculée au RCS de '+ville+' sous le numéro '+num)
                          }
                          if(p.showSiren&&p.siren) parts.push('SIREN : '+p.siren)
                          if(p.showSiretPied&&p.siret) parts.push('SIRET : '+p.siret)
                          if(p.showRM&&p.rm) parts.push('RM : '+p.rm)
                          if(p.showTvaIntraP&&p.tvaIntra) parts.push('TVA Intracommunautaire : '+p.tvaIntra)
                          if(p.showCodeAPEPied&&p.codeAPE) parts.push('Code APE : '+p.codeAPE)
                          if(p.showDecennalePied&&p.decennale) parts.push('Assurance Décennale : N° '+p.decennale)
                          if(p.showIBANPied&&p.iban) parts.push('IBAN : '+p.iban)
                          return parts.join(' — ')
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
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

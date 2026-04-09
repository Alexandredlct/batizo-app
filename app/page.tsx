'use client'
import { useState } from 'react'

const G='#1D9E75',AM='#BA7517',BD='#e5e7eb'


function SupportWidget(){
  const[open,setOpen]=useState(false)
  const[tab,setTab]=useState<'home'|'messages'|'aide'>('home')
  const[msg,setMsg]=useState('')
  const[sent,setSent]=useState(false)
  const[showBubble,setShowBubble]=useState(true)

  const envoyer=()=>{if(!msg.trim())return;setSent(true);setMsg('')}

  return(
    <div style={{position:'fixed',bottom:24,right:24,zIndex:99000,fontFamily:'system-ui,sans-serif'}}>
      {/* Bulle */}
      {showBubble&&!open&&(
        <div style={{position:'absolute',bottom:68,right:0,background:'#222',color:'#fff',padding:'8px 14px',borderRadius:20,fontSize:13,fontWeight:600,whiteSpace:'nowrap' as const,boxShadow:'0 2px 12px rgba(0,0,0,0.2)',display:'flex',alignItems:'center',gap:8}}>
          Besoin d'aide ? 👋
          <button onClick={()=>setShowBubble(false)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:16,padding:0,lineHeight:1}}>×</button>
        </div>
      )}

      {/* Bouton */}
      <button onClick={()=>{setOpen(!open);setShowBubble(false)}}
        style={{width:56,height:56,borderRadius:'50%',background:'#1D9E75',border:'none',cursor:'pointer',
          boxShadow:'0 4px 20px rgba(29,158,117,0.45)',display:'flex',alignItems:'center',justifyContent:'center',
          transition:'transform 0.2s',position:'relative'}}
        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1.08)'}
        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.transform='scale(1)'}>
        {open
          ?<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          :<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>}
        {!open&&<span style={{position:'absolute',top:-2,right:-2,width:16,height:16,background:'#E24B4A',borderRadius:'50%',border:'2px solid #fff',fontSize:9,fontWeight:700,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>1</span>}
      </button>

      {/* Panneau */}
      {open&&(
        <div style={{position:'absolute',bottom:68,right:0,width:360,height:540,background:'#fff',borderRadius:16,boxShadow:'0 8px 40px rgba(0,0,0,0.18)',overflow:'hidden',display:'flex',flexDirection:'column'}}>

          {/* Header */}
          <div style={{background:'linear-gradient(135deg,#1D9E75,#16805f)',padding:'20px 20px 16px',color:'#fff',flexShrink:0}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:800,color:'#fff'}}>B</div>
              <div>
                <div style={{fontSize:14,fontWeight:700}}>Batizo</div>
                <div style={{fontSize:11,opacity:0.8}}>Support & Aide</div>
              </div>
            </div>
            <div style={{fontSize:17,fontWeight:700,marginBottom:2}}>Bonjour 👋</div>
            <div style={{fontSize:13,opacity:0.85}}>Comment pouvons-nous vous aider ?</div>
          </div>

          {/* Tabs */}
          <div style={{display:'flex',borderBottom:'1px solid #f0f0f0',flexShrink:0}}>
            {([['home','🏠','Accueil'],['messages','💬','Messages'],['aide','❓','Aide']] as const).map(([t,icon,label])=>(
              <button key={t} onClick={()=>setTab(t)}
                style={{flex:1,padding:'10px 6px',border:'none',background:'transparent',fontSize:11,fontWeight:600,
                  color:tab===t?'#1D9E75':'#888',cursor:'pointer',borderBottom:`2px solid ${tab===t?'#1D9E75':'transparent'}`,
                  display:'flex',flexDirection:'column',alignItems:'center',gap:3,transition:'all 0.15s'}}>
                <span>{icon}</span>{label}
              </button>
            ))}
          </div>

          {/* Contenu */}
          <div style={{flex:1,overflowY:'auto'}}>

            {/* HOME */}
            {tab==='home'&&(
              <div style={{padding:16}}>
                <div style={{background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:12,padding:'12px 14px',cursor:'pointer',marginBottom:12,transition:'all 0.15s'}}
                  onClick={()=>setTab('messages')}
                  onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#1D9E75';d.style.background='#f0fdf4'}}
                  onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#e5e7eb';d.style.background='#f9fafb'}}>
                  <div style={{display:'flex',alignItems:'center',gap:10}}>
                    <div style={{width:34,height:34,borderRadius:'50%',background:'#1D9E75',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700,color:'#111'}}>Envoyer un message</div>
                      <div style={{fontSize:11,color:'#888',marginTop:1}}>⚡ Réponse en quelques minutes</div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>

                <div style={{fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.06em',marginBottom:8}}>Trouver une réponse</div>
                {[
                  {icon:'📄',label:'Créer un devis ou une facture'},
                  {icon:'👥',label:'Gérer mes utilisateurs'},
                  {icon:'💳',label:'Abonnements Batizo'},
                  {icon:'📚',label:'Utiliser la bibliothèque'},
                  {icon:'🎓',label:'Comment ça fonctionne ?'},
                ].map((link,i)=>(
                  <div key={i} onClick={()=>setTab('aide')}
                    style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',fontSize:13,cursor:'pointer',border:'1px solid #e5e7eb',borderRadius:8,marginBottom:6,background:'#fff',transition:'all 0.1s'}}
                    onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#1D9E75';d.style.background='#f0fdf4'}}
                    onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor='#e5e7eb';d.style.background='#fff'}}>
                    <span>{link.icon}</span>
                    <span style={{flex:1,color:'#333'}}>{link.label}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                ))}

                <div style={{display:'flex',alignItems:'center',gap:8,background:'#f8f9fa',borderRadius:10,padding:'10px 12px',marginTop:12}}>
                  <div style={{display:'flex'}}>
                    {['#1D9E75','#3B82F6','#8B5CF6'].map((bg,i)=>(
                      <div key={i} style={{width:26,height:26,borderRadius:'50%',background:bg,border:'2px solid #fff',marginLeft:i>0?-8:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,color:'#fff'}}>
                        {['M','S','A'][i]}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{fontSize:12,fontWeight:600,color:'#111'}}>L'équipe Batizo est disponible</div>
                    <div style={{fontSize:11,color:'#888'}}>⚡ Temps de réponse : ~5 min</div>
                  </div>
                </div>
              </div>
            )}

            {/* MESSAGES */}
            {tab==='messages'&&(
              <div style={{padding:16}}>
                {sent?(
                  <div style={{textAlign:'center' as const,padding:'2rem 1rem'}}>
                    <div style={{fontSize:40,marginBottom:12}}>✅</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:6}}>Message envoyé !</div>
                    <div style={{fontSize:13,color:'#666',lineHeight:1.6}}>Notre équipe vous répond généralement en moins de 5 minutes.</div>
                    <button onClick={()=>setSent(false)} style={{marginTop:16,padding:'8px 20px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                      Nouveau message
                    </button>
                  </div>
                ):(
                  <>
                    <div style={{fontSize:13,color:'#555',marginBottom:14,lineHeight:1.6}}>Décrivez votre problème ou votre question, notre équipe vous répondra rapidement.</div>
                    <div style={{marginBottom:10}}>
                      <label style={{fontSize:12,fontWeight:500,color:'#333',display:'block',marginBottom:4}}>Votre message</label>
                      <textarea value={msg} onChange={e=>setMsg(e.target.value)} rows={5}
                        placeholder="Décrivez votre problème..."
                        style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:8,fontSize:13,outline:'none',resize:'none' as const,fontFamily:'system-ui,sans-serif',color:'#111',boxSizing:'border-box' as const}}/>
                    </div>
                    <button onClick={envoyer} disabled={!msg.trim()}
                      style={{width:'100%',padding:'11px',background:msg.trim()?'#1D9E75':'#e5e7eb',color:msg.trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:msg.trim()?'pointer':'not-allowed',transition:'all 0.15s'}}>
                      Envoyer le message
                    </button>
                  </>
                )}
              </div>
            )}

            {/* AIDE */}
            {tab==='aide'&&(
              <div style={{padding:16}}>
                <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:12}}>Articles populaires</div>
                {[
                  {icon:'📄',titre:'Comment créer mon premier devis ?',desc:'Guide pas à pas pour créer et envoyer un devis professionnel'},
                  {icon:'📚',titre:'Utiliser la bibliotheque d\'ouvrages',desc:'Ajoutez vos materiaux, ouvrages et main d\'oeuvre'},
                  {icon:'👥',titre:'Inviter des collaborateurs',desc:'Gérez les accès et permissions de votre équipe'},
                  {icon:'📊',titre:'Comprendre les statistiques',desc:'Analysez votre CA, vos marges et votre activité'},
                  {icon:'🔒',titre:'Sécurité et RGPD',desc:'Comment vos données sont protégées'},
                  {icon:'💳',titre:'Changer de plan',desc:'Upgrade ou downgrade votre abonnement'},
                ].map((article,i)=>(
                  <div key={i} style={{display:'flex',gap:10,padding:'10px 0',borderBottom:'1px solid #f3f4f6',cursor:'pointer'}}
                    onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.opacity='0.7'}
                    onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.opacity='1'}>
                    <div style={{width:34,height:34,borderRadius:8,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{article.icon}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#111',marginBottom:2}}>{article.titre}</div>
                      <div style={{fontSize:11,color:'#888',lineHeight:1.4}}>{article.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{padding:'10px 16px',borderTop:'1px solid #f0f0f0',textAlign:'center' as const,fontSize:11,color:'#bbb',flexShrink:0}}>
            Propulsé par <strong style={{color:'#1D9E75'}}>Batizo</strong>
          </div>
        </div>
      )}

      {/* Widget Support */}
      <SupportWidget/>

    </div>
  )
}

export default function LandingPage(){
  const[menuOpen,setMenuOpen]=useState(false)
  const[faqOpen,setFaqOpen]=useState<number|null>(null)
  const[planAnnuel,setPlanAnnuel]=useState(false)

  const plans=[
    {
      nom:'Starter',prix:0,prixAnnuel:0,desc:'Gratuit 30 jours puis 9€/mois',couleur:'#f9fafb',border:BD,
      features:['Devis & factures illimités','Gestion clients','Bibliothèque ouvrages','Export PDF','Support chat'],
      cta:'Essayer gratuitement',ctaBg:'#fff',ctaColor:'#111',ctaBorder:BD,highlight:false
    },
    {
      nom:'Pro',prix:19,prixAnnuel:15,desc:'L\'essentiel pour développer',couleur:'#f0fdf4',border:G,
      features:['Tout le Starter','Photos dans les devis','10 utilisateurs','Bibliothèque partagée équipe','Statistiques avancées','IA génération de posts','Support prioritaire'],
      cta:'Démarrer avec Pro',ctaBg:G,ctaColor:'#fff',ctaBorder:G,highlight:true
    },
    {
      nom:'Business',prix:49,prixAnnuel:39,desc:'Pour les équipes ambitieuses',couleur:'#f9fafb',border:BD,
      features:['Tout le Pro','Utilisateurs illimités','Suivi chantier avancé','API & intégrations','Onboarding dédié','Manager de compte','SLA garanti'],
      cta:'Contacter l\'équipe',ctaBg:'#111',ctaColor:'#fff',ctaBorder:'#111',highlight:false
    },
  ]

  const faqs=[
    {q:'Puis-je importer mes données depuis Tolteck ou Excel ?',r:'Oui, Batizo permet d\'importer vos clients, matériaux et ouvrages depuis un fichier CSV ou Excel. Notre équipe peut aussi vous accompagner gratuitement lors de la migration.'},
    {q:'Combien d\'utilisateurs puis-je inviter ?',r:'Le plan Starter inclut 1 utilisateur, le plan Pro jusqu\'à 10, et le plan Business est illimité. Vous pouvez assigner des rôles précis : Admin, Utilisateur ou Observateur.'},
    {q:'Mes données sont-elles sécurisées ?',r:'Vos données sont hébergées en Europe, chiffrées en transit et au repos. Vous pouvez exporter ou supprimer vos données à tout moment (conformité RGPD).'},
    {q:'Puis-je annuler à tout moment ?',r:'Oui, sans engagement. Vous pouvez annuler votre abonnement à tout moment depuis votre espace. Vous gardez l\'accès jusqu\'à la fin de la période payée.'},
    {q:'Y a-t-il une application mobile ?',r:'Batizo est accessible depuis n\'importe quel navigateur sur mobile et tablette. Une application native iOS/Android est prévue pour 2026.'},
    {q:'Comment fonctionne l\'IA de génération de posts ?',r:'Le plan Pro inclut un assistant IA qui génère automatiquement des posts pour vos réseaux sociaux (Instagram, LinkedIn) à partir de vos chantiers terminés.'},
  ]

  const temoignages=[
    {nom:'Thomas Girard',metier:'Électricien — Paris',note:5,texte:'Depuis Batizo, je passe 3x moins de temps sur mes devis. La bibliothèque d\'ouvrages préchargée est un gain de temps énorme.'},
    {nom:'Karim Mansouri',metier:'Promoteur immobilier — Île-de-France',note:5,texte:'On gère 12 chantiers en parallèle avec mon équipe. Le suivi des devis et la gestion des utilisateurs sont impeccables.'},
    {nom:'Sophie Renaud',metier:'Plombière — Lyon',note:5,texte:'Interface très claire, prise en main en 20 minutes. Le calcul de marge automatique m\'a permis d\'augmenter ma rentabilité de 15%.'},
    {nom:'Pierre Dubois',metier:'Peintre — Bordeaux',note:5,texte:'J\'envoyais mes devis sur Word avant. Maintenant en 5 clics c\'est parti. Les clients signent directement en ligne, c\'est top.'},
  ]

  const fonctionnalites=[
    {icon:'📄',titre:'Devis & Factures pro',desc:'Créez des devis et factures professionnels en quelques clics. Envoi par email, signature électronique, relances automatiques.'},
    {icon:'📚',titre:'Bibliothèque complète',desc:'Ouvrages, matériaux, main d\'œuvre — tout est préchargé. Vos prix, vos marges, vos références fournisseurs en un endroit.'},
    {icon:'👥',titre:'Gestion clients',desc:'Fiche client complète avec historique devis, notes, communications. Particuliers et professionnels avec SIRET et TVA intra.'},
    {icon:'📊',titre:'Statistiques & Marges',desc:'Visualisez votre CA, vos marges par chantier, vos clients les plus rentables. Prenez les bonnes décisions.'},
    {icon:'👨‍👩‍👧',titre:'Travail en équipe',desc:'Invitez vos collaborateurs, assignez des rôles (Admin, Utilisateur, Observateur), gérez les permissions par action.'},
    {icon:'🤖',titre:'IA & Automatisation',desc:'Génération de posts réseaux sociaux depuis vos chantiers, suggestions de prix, relances clients automatiques.'},
  ]

  return(
    <div style={{fontFamily:'system-ui,-apple-system,sans-serif',color:'#111',background:'#fff',overflowX:'hidden'}}>

      {/* NAV */}
      <nav style={{position:'sticky',top:0,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(12px)',borderBottom:`1px solid ${BD}`,zIndex:100}}>
        <div style={{maxWidth:1100,margin:'0 auto',padding:'0 24px',height:64,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{fontSize:22,fontWeight:800,color:'#111',letterSpacing:'-0.5px'}}>
            Bati<span style={{color:G}}>zo</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:32,fontSize:14,color:'#555'}}>
            {['Fonctionnalités','Tarifs','FAQ'].map(item=>(
              <a key={item} href={`#${item.toLowerCase()}`} style={{textDecoration:'none',color:'#555',transition:'color 0.15s'}}
                onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color=G}
                onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#555'}>{item}</a>
            ))}
          </div>
          <div style={{display:'flex',gap:10}}>
            <a href="/login" style={{padding:'8px 18px',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,fontSize:14,textDecoration:'none',color:'#333',fontWeight:500}}>Connexion</a>
            <a href="/login" style={{padding:'8px 18px',background:G,color:'#fff',borderRadius:8,fontSize:14,textDecoration:'none',fontWeight:600}}>Essai gratuit</a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{background:'linear-gradient(135deg, #f0fdf4 0%, #fff 60%)',padding:'80px 24px 60px'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:8,background:'#f0fdf4',border:`1px solid ${G}40`,borderRadius:20,padding:'6px 16px',fontSize:13,color:G,fontWeight:600,marginBottom:24}}>
            ✨ 30 jours d'essai gratuit · Sans carte bancaire
          </div>
          <h1 style={{fontSize:52,fontWeight:800,color:'#111',lineHeight:1.15,margin:'0 0 20px',letterSpacing:'-1px'}}>
            Le logiciel de devis<br/>
            <span style={{color:G}}>made for artisans</span>
          </h1>
          <p style={{fontSize:18,color:'#555',lineHeight:1.7,maxWidth:620,margin:'0 auto 36px'}}>
            Créez vos devis et factures en quelques clics, gérez vos clients, pilotez vos marges. Batizo, c'est simple, rapide et professionnel.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/login" style={{padding:'14px 32px',background:G,color:'#fff',borderRadius:10,fontSize:16,fontWeight:700,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8,boxShadow:'0 4px 16px rgba(29,158,117,0.3)'}}>
              Démarrer gratuitement
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="#fonctionnalités" style={{padding:'14px 32px',background:'#fff',color:'#111',borderRadius:10,fontSize:16,fontWeight:600,textDecoration:'none',border:`1px solid ${BD}`}}>
              Voir la démo
            </a>
          </div>
          <div style={{marginTop:24,fontSize:13,color:'#888',display:'flex',alignItems:'center',justifyContent:'center',gap:20,flexWrap:'wrap'}}>
            {['✓ Sans engagement','✓ Sans carte bancaire','✓ Support inclus','✓ Données hébergées en France'].map(item=>(
              <span key={item} style={{color:'#555'}}>{item}</span>
            ))}
          </div>
        </div>

        {/* App preview */}
        <div style={{maxWidth:900,margin:'48px auto 0',background:'#fff',border:`1px solid ${BD}`,borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,0.1)',overflow:'hidden'}}>
          <div style={{background:'#f9fafb',padding:'12px 16px',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:8}}>
            <div style={{display:'flex',gap:6}}>
              {['#ff5f57','#febc2e','#28c840'].map(c=><div key={c} style={{width:12,height:12,borderRadius:'50%',background:c}}/>)}
            </div>
            <div style={{flex:1,background:'#e5e7eb',borderRadius:6,padding:'4px 12px',fontSize:12,color:'#888',maxWidth:300,margin:'0 auto'}}>batizo.fr/dashboard</div>
          </div>
          <div style={{padding:24,background:'#f8f9fa',display:'grid',gridTemplateColumns:'200px 1fr',gap:16,minHeight:300}}>
            {/* Sidebar miniature */}
            <div style={{background:'#fff',borderRadius:10,border:`1px solid ${BD}`,padding:12}}>
              <div style={{fontSize:14,fontWeight:800,color:'#111',marginBottom:16}}>Bati<span style={{color:G}}>zo</span></div>
              {['Dashboard','Devis & Factures','Clients','Bibliothèque'].map((item,i)=>(
                <div key={item} style={{padding:'7px 10px',borderRadius:7,background:i===1?'#f0fdf4':'',color:i===1?G:'#555',fontSize:12,marginBottom:3,fontWeight:i===1?600:400}}>
                  {['📊','📄','👥','📚'][i]} {item}
                </div>
              ))}
            </div>
            {/* Contenu miniature */}
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[{label:'CA ce mois',val:'24 800 €',color:G},{label:'Devis en cours',val:'8',color:'#2563eb'},{label:'Marge moyenne',val:'61%',color:AM}].map(s=>(
                  <div key={s.label} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:'10px 12px'}}>
                    <div style={{fontSize:10,color:'#888',marginBottom:2}}>{s.label}</div>
                    <div style={{fontSize:18,fontWeight:700,color:s.color}}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:8,padding:12,flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:'#111',marginBottom:8}}>Derniers devis</div>
                {[{nom:'Dupont Immobilier',montant:'42 000 €',statut:'Signé',color:'#f0fdf4',tc:G},{nom:'Martin Sophie',montant:'12 400 €',statut:'En attente',color:'#fffbeb',tc:AM},{nom:'Mansouri SARL',montant:'95 000 €',statut:'En cours',color:'#eff6ff',tc:'#2563eb'}].map(d=>(
                  <div key={d.nom} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:`1px solid #f3f4f6`}}>
                    <div style={{fontSize:11,color:'#333',fontWeight:500}}>{d.nom}</div>
                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                      <span style={{fontSize:11,fontWeight:700,color:d.tc}}>{d.montant}</span>
                      <span style={{fontSize:10,padding:'2px 7px',borderRadius:8,background:d.color,color:d.tc,fontWeight:600}}>{d.statut}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section style={{background:'#111',padding:'48px 24px'}}>
        <div style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24,textAlign:'center'}}>
          {[{val:'500+',label:'Artisans actifs'},{val:'50 000+',label:'Devis générés'},{val:'4.9/5',label:'Note moyenne'},{val:'3x',label:'Plus rapide qu\'Excel'}].map(s=>(
            <div key={s.label}>
              <div style={{fontSize:32,fontWeight:800,color:'#fff',marginBottom:4}}>{s.val}</div>
              <div style={{fontSize:14,color:'#888'}}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="fonctionnalités" style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:13,fontWeight:700,color:G,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:10}}>Fonctionnalités</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',margin:'0 0 14px',letterSpacing:'-0.5px'}}>Tout ce qu'il vous faut,<br/>rien de superflu</h2>
            <p style={{fontSize:16,color:'#666',maxWidth:500,margin:'0 auto'}}>Batizo a été conçu par des artisans, pour des artisans. Chaque fonctionnalité répond à un vrai besoin terrain.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {fonctionnalites.map((f,i)=>(
              <div key={i} style={{padding:24,border:`1px solid ${BD}`,borderRadius:14,background:'#fff',transition:'all 0.2s'}}
                onMouseEnter={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=G;d.style.boxShadow='0 4px 20px rgba(29,158,117,0.1)'}}
                onMouseLeave={e=>{const d=e.currentTarget as HTMLDivElement;d.style.borderColor=BD;d.style.boxShadow=''}}>
                <div style={{fontSize:28,marginBottom:14}}>{f.icon}</div>
                <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{f.titre}</div>
                <div style={{fontSize:14,color:'#666',lineHeight:1.6}}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMENT CA MARCHE */}
      <section style={{padding:'80px 24px',background:'#f8f9fa'}}>
        <div style={{maxWidth:900,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:13,fontWeight:700,color:G,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:10}}>Simple comme bonjour</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',margin:0,letterSpacing:'-0.5px'}}>Votre premier devis en 5 minutes</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:24}}>
            {[
              {num:'01',titre:'Créez votre compte',desc:'Inscrivez-vous en 30 secondes. Importez vos ouvrages depuis Excel ou partez de notre bibliothèque de 500+ ouvrages BTP.'},
              {num:'02',titre:'Composez votre devis',desc:'Sélectionnez vos ouvrages, ajoutez vos matériaux et main d\'œuvre. Batizo calcule automatiquement les totaux et marges.'},
              {num:'03',titre:'Envoyez et signez',desc:'Envoyez le devis par email en un clic. Votre client signe électroniquement. Vous êtes notifié instantanément.'},
            ].map((step,i)=>(
              <div key={i} style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:14,padding:24,position:'relative'}}>
                <div style={{fontSize:40,fontWeight:800,color:`${G}20`,position:'absolute',top:16,right:20,lineHeight:1}}>{step.num}</div>
                <div style={{width:40,height:40,borderRadius:10,background:'#f0fdf4',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:14}}>
                  <span style={{fontSize:18}}>{['📝','🔧','✉️'][i]}</span>
                </div>
                <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:8}}>{step.titre}</div>
                <div style={{fontSize:14,color:'#666',lineHeight:1.6}}>{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TÉMOIGNAGES */}
      <section style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:13,fontWeight:700,color:G,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:10}}>Témoignages</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',margin:0,letterSpacing:'-0.5px'}}>Ils font confiance à Batizo</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20}}>
            {temoignages.map((t,i)=>(
              <div key={i} style={{padding:24,border:`1px solid ${BD}`,borderRadius:14,background:'#fff'}}>
                <div style={{display:'flex',marginBottom:10}}>
                  {'★★★★★'.split('').map((s,j)=><span key={j} style={{color:'#f59e0b',fontSize:16}}>{s}</span>)}
                </div>
                <p style={{fontSize:15,color:'#333',lineHeight:1.7,margin:'0 0 16px',fontStyle:'italic'}}>"{t.texte}"</p>
                <div style={{display:'flex',alignItems:'center',gap:10}}>
                  <div style={{width:36,height:36,borderRadius:'50%',background:'#f0fdf4',color:G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700}}>
                    {t.nom.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700,color:'#111'}}>{t.nom}</div>
                    <div style={{fontSize:12,color:'#888'}}>{t.metier}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="tarifs" style={{padding:'80px 24px',background:'#f8f9fa'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:13,fontWeight:700,color:G,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:10}}>Tarifs</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',margin:'0 0 20px',letterSpacing:'-0.5px'}}>Simple et transparent</h2>
            {/* Toggle annuel/mensuel */}
            <div style={{display:'inline-flex',alignItems:'center',gap:12,background:'#fff',border:`1px solid ${BD}`,borderRadius:20,padding:'6px 16px',fontSize:14}}>
              <span style={{color:!planAnnuel?'#111':'#888',fontWeight:!planAnnuel?600:400}}>Mensuel</span>
              <div onClick={()=>setPlanAnnuel(!planAnnuel)} style={{width:44,height:24,borderRadius:12,background:planAnnuel?G:'#d1d5db',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
                <div style={{position:'absolute',top:2,left:planAnnuel?22:2,width:20,height:20,borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}/>
              </div>
              <span style={{color:planAnnuel?'#111':'#888',fontWeight:planAnnuel?600:400}}>Annuel</span>
              {planAnnuel&&<span style={{fontSize:11,fontWeight:700,color:G,background:'#f0fdf4',padding:'2px 8px',borderRadius:10}}>-20%</span>}
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20}}>
            {plans.map((plan,i)=>(
              <div key={i} style={{background:plan.highlight?'#fff':'#fff',border:`2px solid ${plan.highlight?G:BD}`,borderRadius:16,padding:28,position:'relative',boxShadow:plan.highlight?'0 8px 32px rgba(29,158,117,0.15)':''}}>
                {plan.highlight&&<div style={{position:'absolute',top:-12,left:'50%',transform:'translateX(-50%)',background:G,color:'#fff',fontSize:11,fontWeight:700,padding:'4px 14px',borderRadius:12}}>Le plus populaire</div>}
                <div style={{fontSize:20,fontWeight:800,color:'#111',marginBottom:6}}>{plan.nom}</div>
                <div style={{marginBottom:6}}>
                  {plan.prix===0?(
                    <span style={{fontSize:28,fontWeight:800,color:'#111'}}>Gratuit</span>
                  ):(
                    <>
                      <span style={{fontSize:32,fontWeight:800,color:'#111'}}>{planAnnuel?plan.prixAnnuel:plan.prix}€</span>
                      <span style={{fontSize:14,color:'#888'}}> HT/mois</span>
                    </>
                  )}
                </div>
                <div style={{fontSize:13,color:'#888',marginBottom:20}}>{plan.desc}</div>
                <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:24}}>
                  {plan.features.map((f,j)=>(
                    <div key={j} style={{display:'flex',alignItems:'center',gap:8,fontSize:13,color:'#333'}}>
                      <span style={{color:G,fontWeight:700,flexShrink:0}}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <a href="/login" style={{display:'block',width:'100%',padding:'12px',background:plan.ctaBg,color:plan.ctaColor,border:`2px solid ${plan.ctaBorder}`,borderRadius:10,fontSize:14,fontWeight:700,textDecoration:'none',textAlign:'center' as const,boxSizing:'border-box' as const,transition:'opacity 0.15s'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.opacity='0.85'}
                  onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.opacity='1'}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#888'}}>
            Toutes nos offres incluent un essai gratuit de 30 jours. Aucune carte bancaire requise.
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" style={{padding:'80px 24px',background:'#fff'}}>
        <div style={{maxWidth:700,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:48}}>
            <div style={{fontSize:13,fontWeight:700,color:G,textTransform:'uppercase' as const,letterSpacing:'0.08em',marginBottom:10}}>FAQ</div>
            <h2 style={{fontSize:36,fontWeight:800,color:'#111',margin:0,letterSpacing:'-0.5px'}}>Questions fréquentes</h2>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {faqs.map((faq,i)=>(
              <div key={i} style={{border:`1px solid ${faqOpen===i?G:BD}`,borderRadius:12,overflow:'hidden',transition:'border-color 0.2s'}}>
                <button onClick={()=>setFaqOpen(faqOpen===i?null:i)}
                  style={{width:'100%',padding:'16px 20px',background:faqOpen===i?'#f0fdf4':'#fff',border:'none',cursor:'pointer',display:'flex',justifyContent:'space-between',alignItems:'center',textAlign:'left' as const}}>
                  <span style={{fontSize:15,fontWeight:600,color:'#111'}}>{faq.q}</span>
                  <span style={{fontSize:20,color:faqOpen===i?G:'#aaa',transition:'transform 0.2s',transform:faqOpen===i?'rotate(45deg)':'rotate(0deg)',flexShrink:0,marginLeft:12}}>+</span>
                </button>
                {faqOpen===i&&(
                  <div style={{padding:'0 20px 16px',fontSize:14,color:'#555',lineHeight:1.7}}>
                    {faq.r}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{padding:'80px 24px',background:`linear-gradient(135deg, #0f5539 0%, ${G} 100%)`}}>
        <div style={{maxWidth:700,margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontSize:38,fontWeight:800,color:'#fff',margin:'0 0 16px',letterSpacing:'-0.5px'}}>
            Prêt à gagner du temps<br/>sur vos devis ?
          </h2>
          <p style={{fontSize:16,color:'rgba(255,255,255,0.8)',marginBottom:32,lineHeight:1.6}}>
            Rejoignez 500+ artisans qui font confiance à Batizo pour gérer leur activité.
          </p>
          <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
            <a href="/login" style={{padding:'14px 32px',background:'#fff',color:G,borderRadius:10,fontSize:16,fontWeight:700,textDecoration:'none',boxShadow:'0 4px 16px rgba(0,0,0,0.2)'}}>
              Démarrer gratuitement
            </a>
            <a href="#tarifs" style={{padding:'14px 32px',background:'transparent',color:'#fff',borderRadius:10,fontSize:16,fontWeight:600,textDecoration:'none',border:'2px solid rgba(255,255,255,0.4)'}}>
              Voir les tarifs
            </a>
          </div>
          <div style={{marginTop:20,fontSize:13,color:'rgba(255,255,255,0.6)'}}>✓ 30 jours gratuits · ✓ Sans carte bancaire · ✓ Résiliable à tout moment</div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{background:'#111',padding:'48px 24px 24px'}}>
        <div style={{maxWidth:1000,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr',gap:40,marginBottom:40}}>
            <div>
              <div style={{fontSize:22,fontWeight:800,color:'#fff',marginBottom:12}}>Bati<span style={{color:G}}>zo</span></div>
              <p style={{fontSize:14,color:'#888',lineHeight:1.7,maxWidth:280}}>Le logiciel de devis et facturation conçu pour les artisans du bâtiment. Simple, rapide, professionnel.</p>
            </div>
            {[
              {titre:'Produit',liens:['Fonctionnalités','Tarifs','Nouveautés','Roadmap']},
              {titre:'Ressources',liens:['Documentation','Blog','Guides','Webinaires']},
              {titre:'Légal',liens:['CGU','Politique de confidentialité','RGPD','Mentions légales']},
            ].map((col,i)=>(
              <div key={i}>
                <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:14,textTransform:'uppercase' as const,letterSpacing:'0.06em'}}>{col.titre}</div>
                {col.liens.map(l=>(
                  <div key={l} style={{marginBottom:8}}>
                    <a href="#" style={{fontSize:14,color:'#888',textDecoration:'none',transition:'color 0.15s'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLAnchorElement).style.color='#fff'}
                      onMouseLeave={e=>(e.currentTarget as HTMLAnchorElement).style.color='#888'}>{l}</a>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{borderTop:'1px solid #333',paddingTop:20,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:10}}>
            <div style={{fontSize:13,color:'#888'}}>© 2026 Batizo. Tous droits réservés.</div>
            <div style={{fontSize:13,color:'#888'}}>Fait avec ❤️ pour les artisans français</div>
          </div>
        </div>
      </footer>
    </div>
  )
}

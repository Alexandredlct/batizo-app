'use client'
import { useState } from 'react'

export default function ChoisirPlanPage() {
  const [billing, setBilling] = useState<'mensuel' | 'annuel'>('mensuel')
  const [selected, setSelected] = useState('pro')
  const annuel = billing === 'annuel'

  const prix = { pro: annuel ? '15€' : '19€', business: annuel ? '39€' : '49€' }

  const Feature = ({ text }: { text: string }) => (
    <li style={{fontSize:'13px',color:'#111',display:'flex',gap:'8px',alignItems:'flex-start'}}>
      <span style={{color:'#1D9E75',fontWeight:'700',flexShrink:0}}>✓</span>{text}
    </li>
  )

  const CardButton = ({ plan, label }: { plan: string, label: string }) => (
    <button onClick={e => { e.stopPropagation(); setSelected(plan) }}
      style={{width:'100%',padding:'12px',background:selected===plan?'#1D9E75':'#fff',color:selected===plan?'#fff':'#1D9E75',border:'2px solid #1D9E75',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer',marginTop:'auto'}}>
      {selected===plan ? '✓ Sélectionné' : label}
    </button>
  )

  const card = (plan: string) => ({
    background:'#fff', borderRadius:'16px', padding:'1.75rem',
    border:`2px solid ${selected===plan?'#1D9E75':'#e5e7eb'}`,
    width:'260px', cursor:'pointer' as const,
    boxShadow:selected===plan?'0 8px 32px rgba(29,158,117,0.15)':'0 2px 8px rgba(0,0,0,0.05)',
    display:'flex', flexDirection:'column' as const, transition:'all 0.2s',
  })

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4 0%,#e8f5e9 100%)',padding:'2rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{maxWidth:'900px',margin:'0 auto'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
            <div style={{width:'40px',height:'40px',background:'#1D9E75',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{width:'20px',height:'20px'}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{fontSize:'22px',fontWeight:'800',color:'#111'}}>Bati<span style={{color:'#1D9E75'}}>zo</span></span>
          </div>
          <h1 style={{fontSize:'26px',fontWeight:'700',margin:'0 0 8px',color:'#111'}}>Choisissez votre abonnement</h1>
          <p style={{fontSize:'14px',color:'#333',margin:0,fontWeight:'500'}}>30 jours gratuits · Sans carte bancaire · Résiliation en 1 clic</p>
        </div>

        {/* Toggle mensuel/annuel */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'2rem'}}>
          <span style={{fontSize:'15px',fontWeight: !annuel ? '800' : '500', color: !annuel ? '#111' : '#666'}}>Mensuel</span>
          <div onClick={() => setBilling(annuel ? 'mensuel' : 'annuel')}
            style={{width:'48px',height:'26px',background: annuel ? '#1D9E75' : '#ccc',borderRadius:'13px',cursor:'pointer',position:'relative',transition:'background 0.2s'}}>
            <div style={{position:'absolute',top:'3px',left: annuel ? '25px' : '3px',width:'20px',height:'20px',borderRadius:'50%',background:'#fff',transition:'left 0.2s',boxShadow:'0 1px 4px rgba(0,0,0,0.2)'}}></div>
          </div>
          <span style={{fontSize:'15px',fontWeight: annuel ? '800' : '500', color: annuel ? '#111' : '#666'}}>
            Annuel <span style={{background:'#f0fdf4',color:'#1D9E75',padding:'2px 8px',borderRadius:'10px',fontSize:'11px',fontWeight:'700',marginLeft:'4px'}}>-20%</span>
          </span>
        </div>

        {/* Cards */}
        <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap' as const,marginBottom:'2rem',alignItems:'stretch'}}>

          <div style={card('starter')} onClick={() => setSelected('starter')}>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px',color:'#111'}}>Starter</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0',color:'#111'}}>Gratuit <span style={{fontSize:'14px',fontWeight:'400',color:'#444'}}>/ 30 jours</span></div>
            <p style={{fontSize:'13px',color:'#333',marginBottom:'1rem',lineHeight:'1.5'}}>Testez toutes les fonctionnalités, sans engagement.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px',flex:1}}>
              {['Devis & factures illimités','Gestion clients','Bibliothèque matériaux','Export PDF','Support chat'].map(f => <Feature key={f} text={f}/>)}
            </ul>
            <CardButton plan="starter" label="Choisir Starter"/>
          </div>

          <div style={{...card('pro'),position:'relative' as const}} onClick={() => setSelected('pro')}>
            <div style={{position:'absolute' as const,top:'-12px',left:'50%',transform:'translateX(-50%)',background:'#1D9E75',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'3px 14px',borderRadius:'20px',whiteSpace:'nowrap' as const}}>Recommandé</div>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px',color:'#111'}}>Pro</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0',color:'#111'}}>{prix.pro} <span style={{fontSize:'14px',fontWeight:'400',color:'#444'}}>HT / mois</span></div>
            <p style={{fontSize:'13px',color:'#333',marginBottom:'1rem',lineHeight:'1.5'}}>Pour les artisans et TPE qui veulent aller vite.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px',flex:1}}>
              {['Tout le Starter','Photos dans les devis','IA génération de posts','Page de garde personnalisée','Support téléphonique','3 utilisateurs inclus'].map(f => <Feature key={f} text={f}/>)}
            </ul>
            <CardButton plan="pro" label="Choisir Pro"/>
          </div>

          <div style={card('business')} onClick={() => setSelected('business')}>
            <div style={{fontSize:'16px',fontWeight:'700',marginBottom:'4px',color:'#111'}}>Business</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0',color:'#111'}}>{prix.business} <span style={{fontSize:'14px',fontWeight:'400',color:'#444'}}>HT / mois</span></div>
            <p style={{fontSize:'13px',color:'#333',marginBottom:'1rem',lineHeight:'1.5'}}>Pour les entreprises avec plusieurs collaborateurs.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px',flex:1}}>
              {['Tout le Pro','Utilisateurs illimités','Suivi chantier avancé','API & intégrations','Onboarding dédié','Compte manager dédié'].map(f => <Feature key={f} text={f}/>)}
            </ul>
            <CardButton plan="business" label="Choisir Business"/>
          </div>

        </div>

        <div style={{textAlign:'center'}}>
          <button onClick={() => window.location.href='/dashboard'}
            style={{padding:'14px 48px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 16px rgba(29,158,117,0.3)'}}>
            Commencer mon essai gratuit 🚀
          </button>
          <p style={{fontSize:'13px',color:'#444',marginTop:'12px'}}>💳 Sans carte bancaire · Résiliation en 1 clic</p>
        </div>

      </div>
    </div>
  )
}

'use client'
import { useState } from 'react'

export default function ChoisirPlanPage() {
  const [billing, setBilling] = useState<'mensuel' | 'annuel'>('mensuel')
  const [selected, setSelected] = useState('pro')

  const prix = {
    pro: billing === 'mensuel' ? '19€' : '15€',
    business: billing === 'mensuel' ? '49€' : '39€',
  }

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
          <h1 style={{fontSize:'26px',fontWeight:'700',margin:'0 0 8px'}}>Choisissez votre abonnement</h1>
          <p style={{fontSize:'14px',color:'#666',margin:0}}>30 jours gratuits · Sans carte bancaire · Résiliation en 1 clic</p>
        </div>

        {/* Toggle mensuel/annuel */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'12px',marginBottom:'2rem'}}>
          <span style={{fontSize:'14px',fontWeight: billing==='mensuel' ? '700' : '400',color: billing==='mensuel' ? '#111' : '#888'}}>Mensuel</span>
          <div onClick={() => setBilling(billing === 'mensuel' ? 'annuel' : 'mensuel')}
            style={{width:'44px',height:'24px',background:'#1D9E75',borderRadius:'12px',cursor:'pointer',position:'relative'}}>
            <div style={{position:'absolute',top:'3px',left: billing==='annuel' ? '23px' : '3px',width:'18px',height:'18px',borderRadius:'50%',background:'#fff',transition:'left 0.2s'}}></div>
          </div>
          <span style={{fontSize:'14px',fontWeight: billing==='annuel' ? '700' : '400',color: billing==='annuel' ? '#111' : '#888'}}>
            Annuel <span style={{background:'#f0fdf4',color:'#1D9E75',padding:'1px 7px',borderRadius:'10px',fontSize:'11px',fontWeight:'700',marginLeft:'4px'}}>-20%</span>
          </span>
        </div>

        {/* Cards */}
        <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap' as const,marginBottom:'2rem'}}>

          {/* Starter */}
          <div style={{background:'#fff',borderRadius:'16px',padding:'1.75rem',border:`2px solid ${selected==='starter' ? '#1D9E75' : '#e5e7eb'}`,width:'260px',cursor:'pointer',transition:'all 0.2s'}} onClick={() => setSelected('starter')}>
            <div style={{fontSize:'15px',fontWeight:'700',marginBottom:'4px'}}>Starter</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0'}}>Gratuit <span style={{fontSize:'14px',fontWeight:'400',color:'#888'}}>/ 30 jours</span></div>
            <p style={{fontSize:'13px',color:'#666',marginBottom:'1rem'}}>Testez toutes les fonctionnalités, sans engagement.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px'}}>
              {['Devis & factures illimités','Gestion clients','Bibliothèque matériaux','Export PDF','Support chat'].map(f => (
                <li key={f} style={{fontSize:'13px',display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{color:'#1D9E75',fontWeight:'700'}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{width:'100%',padding:'11px',background: selected==='starter' ? '#1D9E75' : '#fff',color: selected==='starter' ? '#fff' : '#1D9E75',border:'2px solid #1D9E75',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
              {selected==='starter' ? '✓ Sélectionné' : 'Choisir Starter'}
            </button>
          </div>

          {/* Pro */}
          <div style={{background:'#fff',borderRadius:'16px',padding:'1.75rem',border:`2px solid ${selected==='pro' ? '#1D9E75' : '#e5e7eb'}`,width:'260px',cursor:'pointer',position:'relative' as const,boxShadow: selected==='pro' ? '0 8px 32px rgba(29,158,117,0.15)' : 'none'}} onClick={() => setSelected('pro')}>
            <div style={{position:'absolute' as const,top:'-12px',left:'50%',transform:'translateX(-50%)',background:'#1D9E75',color:'#fff',fontSize:'11px',fontWeight:'700',padding:'3px 14px',borderRadius:'20px'}}>Recommandé</div>
            <div style={{fontSize:'15px',fontWeight:'700',marginBottom:'4px'}}>Pro</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0'}}>{prix.pro} <span style={{fontSize:'14px',fontWeight:'400',color:'#888'}}>HT / mois</span></div>
            <p style={{fontSize:'13px',color:'#666',marginBottom:'1rem'}}>Pour les artisans et TPE qui veulent aller vite.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px'}}>
              {['Tout le Starter','Photos dans les devis','IA génération de posts','Page de garde personnalisée','Support téléphonique','3 utilisateurs inclus'].map(f => (
                <li key={f} style={{fontSize:'13px',display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{color:'#1D9E75',fontWeight:'700'}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{width:'100%',padding:'11px',background: selected==='pro' ? '#1D9E75' : '#fff',color: selected==='pro' ? '#fff' : '#1D9E75',border:'2px solid #1D9E75',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
              {selected==='pro' ? '✓ Sélectionné' : 'Choisir Pro'}
            </button>
          </div>

          {/* Business */}
          <div style={{background:'#fff',borderRadius:'16px',padding:'1.75rem',border:`2px solid ${selected==='business' ? '#1D9E75' : '#e5e7eb'}`,width:'260px',cursor:'pointer'}} onClick={() => setSelected('business')}>
            <div style={{fontSize:'15px',fontWeight:'700',marginBottom:'4px'}}>Business</div>
            <div style={{fontSize:'28px',fontWeight:'800',margin:'8px 0'}}>{prix.business} <span style={{fontSize:'14px',fontWeight:'400',color:'#888'}}>HT / mois</span></div>
            <p style={{fontSize:'13px',color:'#666',marginBottom:'1rem'}}>Pour les entreprises avec plusieurs collaborateurs.</p>
            <ul style={{listStyle:'none',padding:0,margin:'0 0 1.5rem',display:'flex',flexDirection:'column' as const,gap:'8px'}}>
              {['Tout le Pro','Utilisateurs illimités','Suivi chantier avancé','API & intégrations','Onboarding dédié','Compte manager dédié'].map(f => (
                <li key={f} style={{fontSize:'13px',display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{color:'#1D9E75',fontWeight:'700'}}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button style={{width:'100%',padding:'11px',background: selected==='business' ? '#1D9E75' : '#fff',color: selected==='business' ? '#fff' : '#1D9E75',border:'2px solid #1D9E75',borderRadius:'8px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
              {selected==='business' ? '✓ Sélectionné' : 'Choisir Business'}
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{textAlign:'center'}}>
          <button onClick={() => window.location.href='/dashboard'}
            style={{padding:'14px 48px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'10px',fontSize:'16px',fontWeight:'700',cursor:'pointer',boxShadow:'0 4px 16px rgba(29,158,117,0.3)'}}>
            Commencer mon essai gratuit 🚀
          </button>
          <p style={{fontSize:'12px',color:'#999',marginTop:'12px'}}>💳 Sans carte bancaire · Résiliation en 1 clic</p>
        </div>

      </div>
    </div>
  )
}

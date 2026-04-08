'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  const handleLogin = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError('Email ou mot de passe incorrect')
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4 0%,#e8f5e9 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'420px'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
            <div style={{width:'40px',height:'40px',background:'#1D9E75',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{width:'20px',height:'20px'}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{fontSize:'22px',fontWeight:'800',color:'#111'}}>Bati<span style={{color:'#1D9E75'}}>zo</span></span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'700',margin:'0 0 6px'}}>Bon retour 👋</h1>
          <p style={{fontSize:'14px',color:'#666',margin:0}}>Connectez-vous à votre espace Batizo</p>
        </div>
        <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div>
              <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Adresse email</label>
              <input type="email" placeholder="vous@email.fr" value={email} onChange={e => setEmail(e.target.value)}
                style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'6px'}}>
                <label style={{fontSize:'13px',fontWeight:'500'}}>Mot de passe</label>
                <a href="/mot-de-passe-oublie" style={{fontSize:'12px',color:'#1D9E75',textDecoration:'none'}}>Mot de passe oublié ?</a>
              </div>
              <div style={{position:'relative'}}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{width:'100%',padding:'10px 40px 10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px',padding:'0',lineHeight:'1'}}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <label style={{display:'flex',alignItems:'center',gap:'8px',fontSize:'13px',color:'#555',cursor:'pointer'}}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                style={{accentColor:'#1D9E75',width:'15px',height:'15px',cursor:'pointer'}}
              />
              Se souvenir de moi
            </label>
            {error && <p style={{color:'#e53e3e',fontSize:'13px',margin:0}}>{error}</p>}
            <button onClick={handleLogin} disabled={loading}
              style={{width:'100%',padding:'12px',background:'#1D9E75',color:'#fff',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
            <div style={{textAlign:'center',fontSize:'13px',color:'#666'}}>
              Pas encore de compte ?{' '}
              <a href="/inscription" style={{color:'#1D9E75',fontWeight:'600',textDecoration:'none'}}>M'inscrire gratuitement</a>
            </div>
          </div>
        </div>
        <div style={{textAlign:'center',marginTop:'1.5rem'}}>
          <a href="/" style={{fontSize:'13px',color:'#999',textDecoration:'none'}}>← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  )
}

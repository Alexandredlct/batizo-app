'use client'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function InscriptionPage() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [teamSize, setTeamSize] = useState('solo')
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '', telephone: '',
    password: '', entreprise: '', metier: 'Multi-corps',
    siret: '', comment: 'Bouche-à-oreille', cgu: false
  })

  const passwordStrength = (pwd: string) => {
    if (pwd.length === 0) return { width: '0%', color: '#e5e7eb', label: '' }
    if (pwd.length < 6) return { width: '25%', color: '#e53e3e', label: 'Trop court' }
    if (pwd.length < 8) return { width: '50%', color: '#f6ad55', label: 'Moyen' }
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { width: '75%', color: '#68d391', label: 'Bon' }
    return { width: '100%', color: '#1D9E75', label: 'Excellent' }
  }

  const strength = passwordStrength(form.password)

  const handleNext = () => {
    if (!form.prenom || !form.nom || !form.email || !form.password) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async () => {
    if (!form.cgu) { setError("Veuillez accepter les CGU"); return }
    if (!form.entreprise) { setError("Veuillez renseigner le nom de votre entreprise"); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          prenom: form.prenom,
          nom: form.nom,
          telephone: form.telephone,
          entreprise: form.entreprise,
          metier: form.metier,
          team_size: teamSize
        }
      }
    })
    if (error) setError(error.message)
    else window.location.href = '/dashboard'
    setLoading(false)
  }

  const green = '#1D9E75'
  const inputStyle = {width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',outline:'none',boxSizing:'border-box' as const}

  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4 0%,#e8f5e9 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'480px'}}>

        {/* Logo */}
        <div style={{textAlign:'center',marginBottom:'1.5rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'8px'}}>
            <div style={{width:'40px',height:'40px',background:green,borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{width:'20px',height:'20px'}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
            <span style={{fontSize:'22px',fontWeight:'800',color:'#111'}}>Bati<span style={{color:green}}>zo</span></span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'700',margin:'0 0 4px'}}>Créez votre compte</h1>
          <p style={{fontSize:'14px',color:'#666',margin:0}}>30 jours gratuits · Sans carte bancaire</p>
        </div>

        {/* Indicateur étapes */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'0',marginBottom:'1.5rem'}}>
          <div style={{width:'28px',height:'28px',borderRadius:'50%',background:green,color:'#fff',fontSize:'12px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center'}}>1</div>
          <div style={{width:'60px',height:'2px',background: step >= 2 ? green : '#e5e7eb'}}></div>
          <div style={{width:'28px',height:'28px',borderRadius:'50%',background: step >= 2 ? green : '#e5e7eb',color: step >= 2 ? '#fff' : '#999',fontSize:'12px',fontWeight:'700',display:'flex',alignItems:'center',justifyContent:'center'}}>2</div>
        </div>

        {/* Étape 1 */}
        {step === 1 && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
            <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'1.25rem',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em'}}>Étape 1 — Vos informations</div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Prénom *</label>
                  <input style={inputStyle} placeholder="Alexandre" value={form.prenom} onChange={e => setForm({...form, prenom: e.target.value})}/>
                </div>
                <div>
                  <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Nom *</label>
                  <input style={inputStyle} placeholder="Dupont" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}/>
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Email professionnel *</label>
                <input type="email" style={inputStyle} placeholder="vous@email.fr" value={form.email} onChange={e => setForm({...form, email: e.target.value})}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Téléphone</label>
                <input type="tel" style={inputStyle} placeholder="06 12 34 56 78" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Mot de passe *</label>
                <div style={{position:'relative'}}>
                  <input type={showPassword ? 'text' : 'password'} style={{...inputStyle,paddingRight:'40px'}} placeholder="8 caractères minimum" value={form.password} onChange={e => setForm({...form, password: e.target.value})}/>
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{position:'absolute',right:'10px',top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:'16px'}}>{showPassword ? '🙈' : '👁'}</button>
                </div>
                <div style={{height:'4px',background:'#e5e7eb',borderRadius:'2px',marginTop:'6px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:strength.width,background:strength.color,borderRadius:'2px',transition:'all 0.3s'}}></div>
                </div>
                {strength.label && <div style={{fontSize:'11px',color:'#888',marginTop:'3px'}}>{strength.label}</div>}
              </div>
              {error && <p style={{color:'#e53e3e',fontSize:'13px',margin:0}}>{error}</p>}
              <button onClick={handleNext} style={{width:'100%',padding:'12px',background:green,color:'#fff',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>
                Continuer →
              </button>
              <div style={{textAlign:'center',fontSize:'13px',color:'#666'}}>
                Déjà un compte ?{' '}
                <a href="/login" style={{color:green,fontWeight:'600',textDecoration:'none'}}>Se connecter</a>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2 */}
        {step === 2 && (
          <div style={{background:'#fff',borderRadius:'16px',padding:'2rem',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
            <div style={{fontSize:'13px',fontWeight:'700',marginBottom:'1.25rem',color:'#888',textTransform:'uppercase',letterSpacing:'0.04em'}}>Étape 2 — Votre entreprise</div>
            <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Nom de l'entreprise *</label>
                <input style={inputStyle} placeholder="RENOBAT SAS" value={form.entreprise} onChange={e => setForm({...form, entreprise: e.target.value})}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Corps de métier principal</label>
                <select style={{...inputStyle}} value={form.metier} onChange={e => setForm({...form, metier: e.target.value})}>
                  <option>Électricité</option><option>Plomberie</option><option>Peinture</option>
                  <option>Carrelage</option><option>Menuiserie</option><option>Multi-corps</option>
                  <option>Maçonnerie</option><option>Autre</option>
                </select>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>SIRET (optionnel)</label>
                <input style={inputStyle} placeholder="853 572 014 000 19" value={form.siret} onChange={e => setForm({...form, siret: e.target.value})}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Taille de l'équipe</label>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const}}>
                  {[['solo','Solo'],['small','2-5 pers.'],['medium','6-15 pers.'],['large','15+']].map(([val, label]) => (
                    <button key={val} type="button" onClick={() => setTeamSize(val)}
                      style={{padding:'6px 14px',borderRadius:'6px',fontSize:'13px',cursor:'pointer',border:`1px solid ${teamSize === val ? green : '#e5e7eb'}`,background: teamSize === val ? '#f0fdf4' : '#fff',color: teamSize === val ? green : '#555',fontWeight: teamSize === val ? '600' : '400'}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{display:'block',fontSize:'13px',fontWeight:'500',marginBottom:'6px'}}>Comment nous avez-vous connu ?</label>
                <select style={{...inputStyle}} value={form.comment} onChange={e => setForm({...form, comment: e.target.value})}>
                  <option>Bouche-à-oreille</option><option>Google</option><option>Réseaux sociaux</option>
                  <option>Salon professionnel</option><option>Article / Presse</option><option>Autre</option>
                </select>
              </div>
              <label style={{display:'flex',alignItems:'flex-start',gap:'8px',fontSize:'12px',color:'#555',cursor:'pointer',lineHeight:'1.5'}}>
                <input type="checkbox" checked={form.cgu} onChange={e => setForm({...form, cgu: e.target.checked})} style={{accentColor:green,marginTop:'2px',flexShrink:0,width:'15px',height:'15px'}}/>
                J'accepte les <a href="#" style={{color:green}}>CGU</a> et la <a href="#" style={{color:green}}>politique de confidentialité</a> de Batizo
              </label>
              {error && <p style={{color:'#e53e3e',fontSize:'13px',margin:0}}>{error}</p>}
              <div style={{display:'flex',gap:'8px'}}>
                <button onClick={() => { setStep(1); setError('') }} style={{padding:'12px 16px',background:'#fff',color:'#555',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'14px',cursor:'pointer'}}>← Retour</button>
                <button onClick={handleSubmit} disabled={loading} style={{flex:1,padding:'12px',background:green,color:'#fff',border:'none',borderRadius:'8px',fontSize:'15px',fontWeight:'600',cursor:'pointer'}}>
                  {loading ? 'Création...' : '🚀 Créer mon compte gratuit'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={{textAlign:'center',marginTop:'1.5rem'}}>
          <a href="/" style={{fontSize:'13px',color:'#999',textDecoration:'none'}}>← Retour à l'accueil</a>
        </div>
      </div>
    </div>
  )
}

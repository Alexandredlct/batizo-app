'use client'
import { useState } from 'react'

const G = '#1D9E75'

export default function SupportWidget({ prenom = 'Mon compte', onNouveauDevis }: { prenom?: string, onNouveauDevis?: ()=>void }) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'home' | 'messages' | 'aide'>('home')
  const [msg, setMsg] = useState('')
  const [sent, setSent] = useState(false)
  const hasNotif = false // À brancher sur vraies notifs plus tard

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 99000, fontFamily: 'system-ui,sans-serif' }}>

      {/* Pilule "Besoin d'aide ?" */}
      {!open && (
        <button onClick={() => setOpen(true)}
          style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#222', color: '#fff', border: 'none', borderRadius: 24, fontSize: 13, fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 16px rgba(0,0,0,0.25)', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#333'; b.style.transform = 'translateY(-2px)'; b.style.boxShadow = '0 6px 20px rgba(0,0,0,0.3)' }}
          onMouseLeave={e => { const b = e.currentTarget as HTMLButtonElement; b.style.background = '#222'; b.style.transform = 'translateY(0)'; b.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)' }}>
          Besoin d'aide ? 👋
          {hasNotif && (
            <span style={{ position: 'absolute', top: -3, right: -3, width: 10, height: 10, background: '#E24B4A', borderRadius: '50%', border: '2px solid #fff' }}/>
          )}
        </button>
      )}

      {/* Panel support */}
      {open && (
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 360, height: 540, background: '#fff', borderRadius: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ background: 'linear-gradient(135deg,#1D9E75,#16805f)', padding: '20px 20px 16px', color: '#fff', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: '#fff' }}>B</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>Batizo</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>Support & Aide</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', cursor: 'pointer', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>×</button>
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 2 }}>Bonjour {prenom} 👋</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>Comment pouvons-nous vous aider ?</div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
            {(['home', 'messages', 'aide'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                style={{ flex: 1, padding: '10px 6px', border: 'none', background: 'transparent', fontSize: 11, fontWeight: 600, color: tab === t ? G : '#888', cursor: 'pointer', borderBottom: `2px solid ${tab === t ? G : 'transparent'}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <span>{t === 'home' ? '🏠' : t === 'messages' ? '💬' : '❓'}</span>
                {t === 'home' ? 'Accueil' : t === 'messages' ? 'Messages' : 'Aide'}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'home' && (
              <div style={{ padding: 16 }}>
                <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px 14px', cursor: 'pointer', marginBottom: 12 }}
                  onClick={() => setTab('messages')}
                  onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = G; d.style.background = '#f0fdf4' }}
                  onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.borderColor = '#e5e7eb'; d.style.background = '#f9fafb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: '50%', background: G, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>Envoyer un message</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>⚡ Réponse en quelques minutes</div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Liens rapides</div>
                {[
                  { icon: '📄', label: 'Créer un devis', href: '/devis', modal: true },
                  { icon: '👥', label: 'Gérer mes clients', href: '/clients' },
                  { icon: '📚', label: 'Ma bibliothèque', href: '/bibliotheque' },
                  { icon: '⚙️', label: 'Paramètres', href: '/parametres' },
                ].map((link, i) => (
                  <a key={i} href={(link as any).modal?'#':link.href}
                    onClick={(link as any).modal?e=>{e.preventDefault();setOpen(false);onNouveauDevis&&onNouveauDevis()}:undefined}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', fontSize: 13, border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 6, background: '#fff', textDecoration: 'none', color: '#333' }}
                    onMouseEnter={e => { const d = e.currentTarget as HTMLAnchorElement; d.style.borderColor = G; d.style.background = '#f0fdf4' }}
                    onMouseLeave={e => { const d = e.currentTarget as HTMLAnchorElement; d.style.borderColor = '#e5e7eb'; d.style.background = '#fff' }}>
                    <span>{link.icon}</span><span style={{ flex: 1 }}>{link.label}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
                  </a>
                ))}
              </div>
            )}
            {tab === 'messages' && (
              <div style={{ padding: 16 }}>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 6 }}>Message envoyé !</div>
                    <div style={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>Notre équipe vous répond en moins de 5 minutes.</div>
                    <button onClick={() => setSent(false)} style={{ marginTop: 16, padding: '8px 20px', background: G, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Nouveau message</button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 13, color: '#555', marginBottom: 12, lineHeight: 1.6 }}>Notre équipe vous répondra rapidement.</div>
                    <textarea value={msg} onChange={e => setMsg(e.target.value)} rows={5}
                      placeholder="Votre message..."
                      style={{ width: '100%', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, outline: 'none', resize: 'none', fontFamily: 'system-ui,sans-serif', color: '#111', boxSizing: 'border-box', marginBottom: 10 }} />
                    <button onClick={() => { if (msg.trim()) { setSent(true); setMsg('') } }}
                      disabled={!msg.trim()}
                      style={{ width: '100%', padding: '11px', background: msg.trim() ? G : '#e5e7eb', color: msg.trim() ? '#fff' : '#aaa', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: msg.trim() ? 'pointer' : 'not-allowed' }}>
                      Envoyer
                    </button>
                  </>
                )}
              </div>
            )}
            {tab === 'aide' && (
              <div style={{ padding: 16 }}>
                {[
                  { icon: '📄', titre: 'Créer mon premier devis', desc: 'Guide pas à pas' },
                  { icon: '📚', titre: 'Utiliser la bibliothèque', desc: 'Ouvrages, matériaux, main d\'oeuvre' },
                  { icon: '👥', titre: 'Inviter des collaborateurs', desc: 'Rôles et permissions' },
                  { icon: '📊', titre: 'Comprendre les statistiques', desc: 'CA, marges, activité' },
                ].map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '0.7'}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>{a.icon}</div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 2 }}>{a.titre}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', textAlign: 'center', fontSize: 11, color: '#bbb', flexShrink: 0 }}>
            Propulsé par <strong style={{ color: G }}>Batizo</strong>
          </div>
        </div>
      )}
    </div>
  )
}

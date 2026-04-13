'use client'
import { useState } from 'react'

const G='#1D9E75', BD='#e5e7eb', RD='#E24B4A'

interface Props {
  onClose: () => void
}

export default function NouveauDevisModal({ onClose }: Props) {
  const [nom, setNom] = useState('')

  const valider = () => {
    if (!nom.trim()) return
    // Créer le devis dans localStorage
    const stored = localStorage.getItem('batizo_devis')
    const devis = stored ? JSON.parse(stored) : []
    const newDevis = {
      id: 'dev-' + Math.random().toString(36).slice(2, 8),
      nom: nom.trim(),
      statut: 'brouillon',
      date: new Date().toLocaleDateString('fr-FR'),
      montant: 0,
      client: '',
      createdAt: new Date().toISOString(),
    }
    devis.unshift(newDevis)
    localStorage.setItem('batizo_devis', JSON.stringify(devis))
    // Stocker le devis en cours pour la page nouveau devis
    localStorage.setItem('batizo_devis_current', JSON.stringify(newDevis))
    window.location.href = '/devis/nouveau'
  }

  return (
    <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'system-ui'}}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()}
        style={{background:'#fff',borderRadius:14,padding:28,maxWidth:440,width:'90%',boxShadow:'0 8px 40px rgba(0,0,0,0.18)'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
          <div style={{fontSize:17,fontWeight:700,color:'#111'}}>Nouveau devis</div>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#888',lineHeight:1,padding:0}}>×</button>
        </div>

        {/* Champ */}
        <div style={{marginBottom:24}}>
          <label style={{fontSize:13,fontWeight:500,color:'#333',display:'block',marginBottom:6}}>
            Nom du devis <span style={{color:RD}}>*</span>
          </label>
          <input
            autoFocus
            value={nom}
            onChange={e=>setNom(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&nom.trim()&&valider()}
            placeholder="ex : Martin Dupont — Rénovation salle de bain"
            style={{width:'100%',padding:'11px 14px',border:`1px solid ${BD}`,borderRadius:8,fontSize:14,outline:'none',color:'#111',boxSizing:'border-box' as const,transition:'border-color 0.15s'}}
            onFocus={e=>(e.currentTarget as HTMLInputElement).style.borderColor=G}
            onBlur={e=>(e.currentTarget as HTMLInputElement).style.borderColor=BD}
          />
          <div style={{fontSize:11,color:'#888',marginTop:6}}>Format recommandé : Nom client — Description du projet</div>
        </div>

        {/* Boutons */}
        <div style={{display:'flex',gap:10}}>
          <button onClick={onClose}
            style={{flex:1,padding:'11px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:14,cursor:'pointer',color:'#555',fontWeight:500,transition:'all 0.15s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.borderColor='#888'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.borderColor=BD}>
            Annuler
          </button>
          <button onClick={valider} disabled={!nom.trim()}
            style={{flex:1,padding:'11px',background:nom.trim()?G:'#e5e7eb',color:nom.trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:14,fontWeight:600,cursor:nom.trim()?'pointer':'not-allowed',transition:'all 0.2s'}}>
            Valider →
          </button>
        </div>
      </div>
    </div>
  )
}

'use client'
import { useState, useEffect } from 'react'

const G='#1D9E75', BD='#e5e7eb', AM='#BA7517'

interface Shift {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  startTime: string // HH:MM
  endTime: string // HH:MM
  label: string
  color: string
}

interface Ouvrier {
  id: string
  nom: string
  contrat?: string
  heures?: number
  externe?: boolean
  initiales: string
  color: string
}

const AVATAR_COLORS = ['#7c3aed','#2563eb','#EA580C','#059669','#dc2626','#d97706','#0891b2']

const getInitiales = (nom: string) => {
  const parts = nom.trim().split(' ')
  if(parts.length >= 2) return (parts[0][0]+parts[parts.length-1][0]).toUpperCase()
  return nom.slice(0,2).toUpperCase()
}

const getWeekDays = (weekOffset: number) => {
  const now = new Date()
  const monday = new Date(now)
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day
  monday.setDate(now.getDate() + diff + weekOffset * 7)
  return Array.from({length: 7}, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

const formatDate = (d: Date) => d.toISOString().split('T')[0]

const JOURS = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']

const calcHeures = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.round((eh * 60 + em - sh * 60 - sm) / 60 * 10) / 10
}

const COULEURS_PREDEF = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'
]

export default function ResourceCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editShift, setEditShift] = useState<{userId:string, date:string, shift?:Shift}|null>(null)
  const [form, setForm] = useState({label:'', startTime:'08:00', endTime:'17:00', color:'#3b82f6'})

  // Charger ouvriers depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('batizo_utilisateurs')
      if(raw) {
        const list = JSON.parse(raw)
        const ouvriersList = list
          .filter((u: any) => u.role === 'ouvrier' && u.statut !== 'revoque')
          .map((u: any, i: number) => ({
            id: u.id,
            nom: u.nom,
            contrat: u.contrat,
            heures: u.heures,
            externe: u.externe,
            initiales: getInitiales(u.nom),
            color: AVATAR_COLORS[i % AVATAR_COLORS.length]
          }))
        setOuvriers(ouvriersList)
      }
    } catch(e) {}
  }, [])

  // Charger shifts depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('batizo_planning_shifts')
      if(raw) setShifts(JSON.parse(raw))
    } catch(e) {}
  }, [])

  const saveShifts = (updated: Shift[]) => {
    setShifts(updated)
    try { localStorage.setItem('batizo_planning_shifts', JSON.stringify(updated)) } catch(e) {}
  }

  const days = getWeekDays(weekOffset)
  const today = formatDate(new Date())

  const getShiftsForUserDay = (userId: string, date: string) =>
    shifts.filter(s => s.userId === userId && s.date === date)

  const getTotalHeures = (userId: string) => {
    const weekDates = days.map(formatDate)
    return shifts
      .filter(s => s.userId === userId && weekDates.includes(s.date))
      .reduce((sum, s) => sum + calcHeures(s.startTime, s.endTime), 0)
  }

  const openModal = (userId: string, date: string, shift?: Shift) => {
    setEditShift({userId, date, shift})
    setForm(shift ? {label: shift.label, startTime: shift.startTime, endTime: shift.endTime, color: shift.color} : {label:'', startTime:'08:00', endTime:'17:00', color:'#3b82f6'})
    setShowModal(true)
  }

  const saveShift = () => {
    if(!editShift || !form.label.trim()) return
    let updated: Shift[]
    if(editShift.shift) {
      updated = shifts.map(s => s.id === editShift.shift!.id ? {...s, ...form} : s)
    } else {
      const newShift: Shift = {id: 's'+Date.now(), userId: editShift.userId, date: editShift.date, ...form}
      updated = [...shifts, newShift]
    }
    saveShifts(updated)
    setShowModal(false)
  }

  const deleteShift = () => {
    if(!editShift?.shift) return
    saveShifts(shifts.filter(s => s.id !== editShift.shift!.id))
    setShowModal(false)
  }

  const moisLabel = days[0].toLocaleDateString('fr-FR', {month:'long', year:'numeric'})

  return (
    <div style={{fontFamily:'system-ui,sans-serif'}}>

      {/* Header navigation */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <button onClick={()=>setWeekOffset(0)}
            style={{padding:'6px 12px',border:`1px solid ${BD}`,borderRadius:7,background:'#fff',fontSize:13,cursor:'pointer',fontWeight:500,color:'#333'}}>
            Aujourd'hui
          </button>
          <button onClick={()=>setWeekOffset(w=>w-1)}
            style={{width:32,height:32,border:`1px solid ${BD}`,borderRadius:7,background:'#fff',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
            ‹
          </button>
          <button onClick={()=>setWeekOffset(w=>w+1)}
            style={{width:32,height:32,border:`1px solid ${BD}`,borderRadius:7,background:'#fff',cursor:'pointer',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
            ›
          </button>
          <span style={{fontSize:14,fontWeight:600,color:'#111',textTransform:'capitalize'}}>
            {moisLabel}
          </span>
        </div>
        <div style={{fontSize:13,color:'#888'}}>
          {days[0].toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'})} – {days[6].toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit',year:'numeric'})}
        </div>
      </div>

      {/* Grille */}
      <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>

        {/* En-têtes colonnes */}
        <div style={{display:'grid',gridTemplateColumns:'200px repeat(7, 1fr) 80px',borderBottom:`1px solid ${BD}`,background:'#f9fafb'}}>
          <div style={{padding:'10px 16px',fontSize:12,fontWeight:600,color:'#888',borderRight:`1px solid ${BD}`}}>
            ÉQUIPE
          </div>
          {days.map((d, i) => {
            const isToday = formatDate(d) === today
            return (
              <div key={i} style={{padding:'10px 8px',textAlign:'center',borderRight:`1px solid ${BD}`,background:isToday?'#f0fdf4':'transparent'}}>
                <div style={{fontSize:11,fontWeight:600,color:isToday?G:'#888'}}>{JOURS[i]}</div>
                <div style={{fontSize:16,fontWeight:700,color:isToday?G:'#111'}}>{d.getDate()}</div>
              </div>
            )
          })}
          <div style={{padding:'10px 8px',textAlign:'center',fontSize:11,fontWeight:600,color:'#888'}}>
            TOTAL
          </div>
        </div>

        {/* Ligne Non assignés */}
        <div style={{display:'grid',gridTemplateColumns:'200px repeat(7, 1fr) 80px',borderBottom:`1px solid ${BD}`,background:'#fafafa'}}>
          <div style={{padding:'12px 16px',borderRight:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:32,height:32,borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#888',flexShrink:0}}>N/A</div>
            <div style={{fontSize:12,color:'#888',fontWeight:500}}>Non assignés</div>
          </div>
          {days.map((d, i) => (
            <div key={i} style={{borderRight:`1px solid ${BD}`,minHeight:56,padding:4,cursor:'pointer'}}
              onClick={()=>openModal('unassigned', formatDate(d))}>
              {getShiftsForUserDay('unassigned', formatDate(d)).map(s => (
                <div key={s.id} style={{background:s.color,borderRadius:6,padding:'2px 6px',fontSize:11,color:'#fff',fontWeight:600,marginBottom:2,cursor:'pointer'}}
                  onClick={e=>{e.stopPropagation();openModal('unassigned',formatDate(d),s)}}>
                  {s.startTime}-{s.endTime}
                  <div style={{fontWeight:400,opacity:0.9,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.label}</div>
                </div>
              ))}
            </div>
          ))}
          <div style={{padding:'12px 8px',textAlign:'center',fontSize:12,color:'#888'}}>—</div>
        </div>

        {/* Lignes ouvriers */}
        {ouvriers.length === 0 ? (
          <div style={{padding:'3rem',textAlign:'center',color:'#888',fontSize:13}}>
            Aucun ouvrier dans votre équipe.{' '}
            <a href="/utilisateurs" style={{color:G,textDecoration:'none',fontWeight:600}}>
              + Ajouter un ouvrier
            </a>
          </div>
        ) : (
          ouvriers.map((o, oi) => {
            const total = getTotalHeures(o.id)
            const diff = o.heures ? total - o.heures : null
            return (
              <div key={o.id} style={{display:'grid',gridTemplateColumns:'200px repeat(7, 1fr) 80px',borderBottom:oi<ouvriers.length-1?`1px solid ${BD}`:'none'}}>
                {/* Fiche ouvrier */}
                <div style={{padding:'12px 16px',borderRight:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:8}}>
                  <div style={{width:32,height:32,borderRadius:'50%',background:o.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'#fff',flexShrink:0,position:'relative'}}>
                    {o.initiales}
                    {diff !== null && diff < 0 && (
                      <div style={{position:'absolute',top:-2,right:-2,width:8,height:8,borderRadius:'50%',background:'#ef4444',border:'1px solid #fff'}}/>
                    )}
                  </div>
                  <div style={{minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {o.nom}{o.externe&&<span style={{color:'#888'}}> *</span>}
                    </div>
                    <div style={{fontSize:11,color:AM,fontWeight:500}}>
                      {o.heures ? `${o.heures}h` : o.contrat === 'extra' ? 'Extra' : '—'}
                    </div>
                  </div>
                </div>

                {/* Cellules jours */}
                {days.map((d, di) => {
                  const dateStr = formatDate(d)
                  const isToday = dateStr === today
                  const dayShifts = getShiftsForUserDay(o.id, dateStr)
                  return (
                    <div key={di} style={{borderRight:`1px solid ${BD}`,minHeight:64,padding:4,cursor:'pointer',background:isToday?'#f0fdf420':undefined,transition:'background 0.15s'}}
                      onClick={()=>openModal(o.id, dateStr)}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=isToday?'#f0fdf420':''}>
                      {dayShifts.map(s => (
                        <div key={s.id}
                          style={{background:s.color,borderRadius:6,padding:'3px 6px',fontSize:11,color:'#fff',fontWeight:600,marginBottom:2,cursor:'pointer'}}
                          onClick={e=>{e.stopPropagation();openModal(o.id,dateStr,s)}}>
                          {s.startTime}–{s.endTime}
                          <div style={{fontWeight:400,opacity:0.9,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}

                {/* Total */}
                <div style={{padding:'12px 8px',textAlign:'center'}}>
                  <div style={{fontSize:13,fontWeight:700,color:diff===null?'#111':diff<0?'#ef4444':diff>0?AM:G}}>
                    {total}h
                  </div>
                  {diff !== null && diff !== 0 && (
                    <div style={{fontSize:11,color:diff<0?'#ef4444':AM,fontWeight:600}}>
                      {diff>0?'+':''}{diff}h
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}

        {/* Bouton + Employé */}
        <div style={{borderTop:`1px solid ${BD}`,padding:'10px 16px'}}>
          <a href="/utilisateurs" style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,color:G,textDecoration:'none',fontWeight:500}}>
            <span style={{fontSize:16}}>+</span> Ajouter un ouvrier
          </a>
        </div>
      </div>

      {/* Modale ajout/édition shift */}
      {showModal && editShift && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center'}}
          onClick={()=>setShowModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:28,maxWidth:380,width:'90%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:20}}>
              {editShift.shift ? 'Modifier le shift' : 'Ajouter un shift'}
            </div>

            <div style={{marginBottom:14}}>
              <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Titre / Description *</label>
              <input value={form.label} onChange={e=>setForm(f=>({...f,label:e.target.value}))}
                placeholder="Ex: Rénovation salon"
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:14}}>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Début</label>
                <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Fin</label>
                <input type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}
                  style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              </div>
            </div>

            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Couleur</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                {COULEURS_PREDEF.map(col => (
                  <div key={col} onClick={()=>setForm(f=>({...f,color:col}))}
                    style={{width:28,height:28,borderRadius:'50%',background:col,cursor:'pointer',border:form.color===col?'3px solid #111':'3px solid transparent',transition:'border 0.15s'}}/>
                ))}
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              {editShift.shift && (
                <button onClick={deleteShift}
                  style={{padding:'10px 14px',border:'1px solid #fca5a5',borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#ef4444',fontWeight:500}}>
                  Supprimer
                </button>
              )}
              <button onClick={()=>setShowModal(false)}
                style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>
                Annuler
              </button>
              <button onClick={saveShift} disabled={!form.label.trim()}
                style={{flex:2,padding:11,background:form.label.trim()?G:'#e5e7eb',color:form.label.trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {editShift.shift ? 'Enregistrer' : '+ Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

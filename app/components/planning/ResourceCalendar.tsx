'use client'
import { useState, useEffect, useRef } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core'
import { DraggableShift } from './DraggableShift'
import { DroppableCell } from './DroppableCell'
import DatePicker, { getWeekNumber } from './DatePicker'

const G='#1D9E75', BD='#e5e7eb', AM='#BA7517'

interface Shift {
  id: string
  userId: string
  date: string
  startTime: string
  endTime: string
  label: string
  color: string
  pauseMin: number
  notes: string
  devisId?: string
  devisLabel?: string
  posteId?: string
  posteLabel?: string
}

interface Poste {
  id: string
  name: string
  color: string
  pauseMin: number
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

const calcDuree = (start: string, end: string, pauseMin: number) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const total = Math.max(0, (eh * 60 + em - sh * 60 - sm) - pauseMin)
  const h = Math.floor(total / 60)
  const m = total % 60
  return m > 0 ? `${h}h${String(m).padStart(2,'0')}` : `${h}h`
}

const calcHeures = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return Math.round((eh * 60 + em - sh * 60 - sm) / 60 * 10) / 10
}

const getOrdinal = (n: number) => ['1er','2ème','3ème','4ème','5ème'][n-1]||`${n}ème`
const JOURS_FR = ['dimanche','lundi','mardi','mercredi','jeudi','vendredi','samedi']

const getMonthRepeatOptions = (dateStr: string) => {
  const d = new Date(dateStr+'T12:00:00')
  const dayOfMonth = d.getDate()
  const dayOfWeek = d.getDay()
  const weekNum = Math.ceil(dayOfMonth / 7)
  const jourNom = JOURS_FR[dayOfWeek]
  return [
    {label: String(dayOfMonth), value: 'day'},
    {label: `${getOrdinal(weekNum)} ${jourNom}`, value: 'weekday'}
  ]
}

const COULEURS_PREDEF = [
  '#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6',
  '#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'
]

export default function ResourceCalendar() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView] = useState<'semaine'|'mois'>('semaine')
  const [monthOffset, setMonthOffset] = useState(0)
  const [hoveredShift, setHoveredShift] = useState<string|null>(null)
  const [draggingShift, setDraggingShift] = useState<string|null>(null)
  const [showDragModal, setShowDragModal] = useState<{shift:any,userId:string,date:string,action:'move'|'copy'}|null>(null)
  const [tooltipPos, setTooltipPos] = useState({x:0,y:0})
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editShift, setEditShift] = useState<{userId:string, date:string, shift?:Shift}|null>(null)
  const [form, setForm] = useState({label:'', startTime:'08:00', endTime:'17:00', color:'#3b82f6', pauseMin:0, notes:'', devisId:'', devisLabel:'', posteId:'', posteLabel:''})
  const [devisList, setDevisList] = useState<any[]>([])
  const [postes, setPostes] = useState<Poste[]>([])
  const [showPosteModal, setShowPosteModal] = useState(false)
  const [newPoste, setNewPoste] = useState({name:'', color:'#3b82f6', pauseMin:0})
  const [devisSearch, setDevisSearch] = useState('')
  const [repeatDays, setRepeatDays] = useState<string[]>([])
  const [showRepeatModal, setShowRepeatModal] = useState(false)
  const [repeatConfig, setRepeatConfig] = useState({freq:'1', unit:'semaine', endDate:'', monthOption:'day'})
  const [dragOver, setDragOver] = useState(false)
  const [attachments, setAttachments] = useState<{name:string,size:number,url:string}[]>([])

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
    try {
      const raw = localStorage.getItem('batizo_devis')
      if(raw) {
        const list = JSON.parse(raw)
        const clients = (() => {
          try {
            const rc = localStorage.getItem('batizo_clients')
            return rc ? JSON.parse(rc) : []
          } catch(e) { return [] }
        })()
        setDevisList(list.filter((d:any) => d.statut === 'signe' && !d.archive).map((d:any) => {
          // Trouver le vrai nom client depuis batizo_clients
          const cl = clients.find((c:any) => c.id === d.clientId)
          let clientNom = d.clientNom || 'Client'
          if(cl) {
            clientNom = cl.type==='professionnel'
              ? (cl.raisonSociale||cl.nom)
              : [cl.prenom, cl.nomFamille||cl.nom].filter(Boolean).join(' ')
          }
          return {
            id: d.id,
            label: clientNom + ' — ' + (d.titreProjet||'Devis'),
            clientNom,
            titreProjet: d.titreProjet||'Devis',
            ref: (d.ref&&!d.ref.startsWith('dev-'))?d.ref:'Sans numéro',
            montant: d.montant||0,
            color: '#3b82f6'
          }
        }))
      }
    } catch(e) {}
    try {
      const raw = localStorage.getItem('batizo_planning_postes')
      if(raw) setPostes(JSON.parse(raw))
    } catch(e) {}
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (event: any) => {
    setDraggingShift(event.active.id)
    setHoveredShift(null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setDraggingShift(null)
    const { active, over } = event
    if(!over) return
    const shift = shifts.find(s => s.id === active.id)
    if(!shift) return
    const overId = over.id as string
    const parts = overId.split('__')
    if(parts.length < 2) return
    const targetUserId = parts[0]
    const targetDate = parts[1]
    const action = parts[2] as 'move'|'copy'|undefined
    if(!targetDate || !targetUserId) return
    if(shift.userId === targetUserId && shift.date === targetDate && !action) return
    if(action === 'copy') {
      // Copier : garder l'original + créer un duplicata
      const newShift = {...shift, id: 's'+Date.now()+Math.floor(Math.random()*9999), userId: targetUserId, date: targetDate}
      saveShifts([...shifts, newShift])
    } else {
      // Déplacer : mettre à jour la position
      const updated = shifts.map(s => s.id === shift.id ? {...s, userId: targetUserId, date: targetDate} : s)
      saveShifts(updated)
    }
  }

  const saveShifts = (updated: Shift[]) => {
    setShifts(updated)
    try { localStorage.setItem('batizo_planning_shifts', JSON.stringify(updated)) } catch(e) {}
  }

  // Jours fériés français fixes
  const getEasterDate = (year: number) => {
    const a=year%19,b=Math.floor(year/100),c=year%100
    const d2=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25)
    const g=Math.floor((b-f+1)/3),h=(19*a+b-d2-g+15)%30
    const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7
    const m=Math.floor((a+11*h+22*l)/451)
    const month=Math.floor((h+l-7*m+114)/31)
    const day=((h+l-7*m+114)%31)+1
    return new Date(year,month-1,day)
  }
  const getFrenchHolidays = (year: number): Record<string,string> => {
    const easter=getEasterDate(year)
    const add=(d:Date,days:number)=>{const r=new Date(d);r.setDate(r.getDate()+days);return r}
    const fmt=(d:Date)=>`\${d.getMonth()+1}-\${d.getDate()}`
    return {'1-1':"Jour de l'an",[fmt(add(easter,1))]:'Lundi de Pâques','5-1':'Fête du Travail','5-8':'Victoire 1945',[fmt(add(easter,39))]:'Ascension',[fmt(add(easter,50))]:'Lundi de Pentecôte','7-14':'Fête nationale','8-15':'Assomption','11-1':'Toussaint','11-11':'Armistice 1918','12-25':'Noël'}
  }
  const getHolidayName=(d:Date)=>{const h=getFrenchHolidays(d.getFullYear());return h[`\${d.getMonth()+1}-\${d.getDate()}`]||null}
  const isFerie = (d: Date) => !!getHolidayName(d)

  const getMonthDays = (offset: number) => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth()+offset, 1)
    const last = new Date(now.getFullYear(), now.getMonth()+offset+1, 0)
    const days = []
    for(let d=new Date(first); d<=last; d.setDate(d.getDate()+1)) days.push(new Date(d))
    return days
  }

  const days = getWeekDays(weekOffset)
  const monthDays = getMonthDays(monthOffset)
  const moisLabelMois = new Date(new Date().getFullYear(), new Date().getMonth()+monthOffset, 1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})
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
    setForm(shift ? {label: shift.label, startTime: shift.startTime, endTime: shift.endTime, color: shift.color, pauseMin: shift.pauseMin||0, notes: shift.notes||'', devisId: shift.devisId||'', devisLabel: shift.devisLabel||'', posteId: shift.posteId||'', posteLabel: shift.posteLabel||''} : {label:'', startTime:'08:00', endTime:'17:00', color:'#3b82f6', pauseMin:0, notes:'', devisId:'', devisLabel:'', posteId:'', posteLabel:''})
    setDevisSearch('')
    // Pré-sélectionner le jour courant dans la répétition
    const dayMap = ['dim','lun','mar','mer','jeu','ven','sam']
    const d = new Date(date+'T12:00:00')
    setRepeatDays([dayMap[d.getDay()]])
    setAttachments([])
    setShowModal(true)
  }

  const savePoste = () => {
    if(!newPoste.name.trim()) return
    const poste: Poste = {id: 'p'+Date.now(), ...newPoste}
    const updated = [...postes, poste]
    setPostes(updated)
    try { localStorage.setItem('batizo_planning_postes', JSON.stringify(updated)) } catch(e) {}
    setForm(f => ({...f, posteId: poste.id, posteLabel: poste.name, color: poste.color, devisId:'', devisLabel:''}))
    setShowPosteModal(false)
    setNewPoste({name:'', color:'#3b82f6', pauseMin:0})
  }

  const saveShift = () => {
    if(!editShift) return
    const derivedLabel = form.devisLabel || form.posteLabel || form.label
    if(!derivedLabel.trim()) return
    let updated: Shift[]
    if(editShift.shift) {
      updated = shifts.map(s => s.id === editShift.shift!.id ? {...s, ...form} : s)
    } else {
      // Créer shifts pour chaque jour coché
      const dayMap:Record<string,number> = {lun:1,mar:2,mer:3,jeu:4,ven:5,sam:6,dim:0}
      const baseDate = new Date(editShift.date+'T12:00:00')
      const weekStart = new Date(baseDate)
      const wd = baseDate.getDay()
      weekStart.setDate(baseDate.getDate() - (wd===0?6:wd-1))
      const newShifts: Shift[] = repeatDays.map(day => {
        const targetDay = dayMap[day]
        const d = new Date(weekStart)
        d.setDate(weekStart.getDate() + (targetDay===0?6:targetDay-1))
        return {id:'s'+Date.now()+Math.random(), userId:editShift.userId, date:formatDate(d), ...form, label:derivedLabel, pauseMin:form.pauseMin||0, notes:form.notes||''}
      })
      const newShift = newShifts[0] || {id:'s'+Date.now(), userId:editShift.userId, date:editShift.date, ...form, label:derivedLabel, pauseMin:form.pauseMin||0, notes:form.notes||''}
      updated = [...shifts, ...(repeatDays.length>1?newShifts:[newShift])]
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
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16,gap:8,flexWrap:'nowrap' as const}}>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'nowrap' as const}}>
          <button onClick={()=>{setWeekOffset(0);setMonthOffset(0)}}
            style={{padding:'6px 12px',border:`1px solid ${BD}`,borderRadius:7,background:'#fff',fontSize:13,cursor:'pointer',fontWeight:500,color:'#333',transition:'background 0.15s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
            Aujourd'hui
          </button>
          <button onClick={()=>view==='semaine'?setWeekOffset(w=>w-1):setMonthOffset(m=>m-1)}
            style={{width:32,height:32,border:`1px solid ${BD}`,borderRadius:7,background:'#fff',cursor:'pointer',fontSize:18,fontWeight:700,color:'#333',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
            ‹
          </button>
          <button onClick={()=>view==='semaine'?setWeekOffset(w=>w+1):setMonthOffset(m=>m+1)}
            style={{width:32,height:32,border:`1px solid ${BD}`,borderRadius:7,background:'#fff',cursor:'pointer',fontSize:18,fontWeight:700,color:'#333',display:'flex',alignItems:'center',justifyContent:'center',transition:'background 0.15s'}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
            ›
          </button>
          <DatePicker
            weekOffset={weekOffset}
            monthOffset={monthOffset}
            view={view}
            onWeekChange={setWeekOffset}
            onMonthChange={setMonthOffset}
          />
          {view==='semaine'&&(
            <span style={{fontSize:12,color:'#888',fontWeight:500,background:'#f3f4f6',padding:'4px 10px',borderRadius:6,whiteSpace:'nowrap' as const}}>
              Semaine {getWeekNumber(days[0])}
            </span>
          )}
        </div>
        {/* Sélecteur vue */}
        <div style={{display:'flex',background:'#f3f4f6',borderRadius:8,padding:3,gap:2}}>
          {(['semaine','mois'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)}
              style={{padding:'5px 14px',borderRadius:6,border:'none',fontSize:13,fontWeight:view===v?600:400,background:view===v?'#fff':'transparent',color:view===v?'#111':'#888',cursor:'pointer',boxShadow:view===v?'0 1px 3px rgba(0,0,0,0.1)':'none',transition:'all 0.15s',textTransform:'capitalize' as const}}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grille Semaine */}
      {view==='semaine'&&<DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
                {isFerie(d)&&<div title={getHolidayName(d)||''} style={{fontSize:12,cursor:'default'}}>🎉</div>}
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
                    <DroppableCell key={di} userId={o.id} date={dateStr}
                      onClick={()=>openModal(o.id,dateStr)}
                      style={{borderRight:`1px solid ${BD}`,minHeight:64,padding:4,cursor:'pointer',background:isToday?'#f0fdf420':undefined}}>
                      {dayShifts.map(s => (
                        <DraggableShift key={s.id} shift={s}>
                          <div
                            onMouseEnter={e=>{if(!draggingShift){setHoveredShift(s.id);setTooltipPos({x:e.clientX,y:e.clientY})}}}
                            onMouseLeave={()=>setHoveredShift(null)}
                            style={{background:s.color,borderRadius:6,padding:'3px 6px',fontSize:11,color:'#fff',fontWeight:600,marginBottom:2}}
                            onClick={e=>{e.stopPropagation();openModal(o.id,dateStr,s)}}>
                            {s.startTime}–{s.endTime}
                            <div style={{fontWeight:400,opacity:0.9,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:'100%'}}>{s.label}</div>
                          </div>
                        </DraggableShift>
                      ))}
                    </DroppableCell>
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
      </DndContext>}

      {/* Tooltip global */}
      {hoveredShift&&(()=>{
        const s=shifts.find(sh=>sh.id===hoveredShift)
        if(!s) return null
        return(
          <div style={{position:'fixed',left:tooltipPos.x+12,top:tooltipPos.y-10,background:'#111',color:'#fff',borderRadius:10,padding:'10px 14px',zIndex:999,maxWidth:260,pointerEvents:'none',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',animation:'fadeIn 0.15s ease'}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:s.notes?6:0}}>{s.devisLabel||s.posteLabel||s.label}</div>
            {s.notes&&<div style={{fontSize:12,opacity:0.8,marginBottom:6}}>📝 {s.notes.slice(0,80)}{s.notes.length>80?'...':''}</div>}
            <div style={{fontSize:12,opacity:0.7}}>⏱ Durée : {calcDuree(s.startTime,s.endTime,s.pauseMin||0)}</div>
          </div>
        )
      })()}

      {/* Vue Mois */}
      {view==='mois'&&(
        <div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'auto'}}>
          <div style={{minWidth: monthDays.length*44+200}}>
            {/* En-têtes mois */}
            <div style={{display:'grid',gridTemplateColumns:`200px repeat(${monthDays.length},44px) 80px`,borderBottom:`1px solid ${BD}`,background:'#f9fafb',position:'sticky',top:0,zIndex:10}}>
              <div style={{padding:'8px 16px',fontSize:12,fontWeight:600,color:'#888',borderRight:`1px solid ${BD}`}}>ÉQUIPE</div>
              {monthDays.map((d,i)=>{
                const isToday=formatDate(d)===today
                const ferie=isFerie(d)
                const isWeekend=d.getDay()===0||d.getDay()===6
                return(
                  <div key={i} style={{padding:'6px 2px',textAlign:'center' as const,borderRight:`1px solid ${BD}`,background:isToday?'#f0fdf4':isWeekend?'#fafafa':undefined,minWidth:44}}>
                    <div style={{fontSize:10,fontWeight:600,color:isToday?G:'#888'}}>{['D','L','M','M','J','V','S'][d.getDay()]}</div>
                    <div style={{fontSize:12,fontWeight:700,color:isToday?G:'#111'}}>{d.getDate()}{ferie?' 🎉':''}</div>
                  </div>
                )
              })}
              <div style={{padding:'8px 4px',textAlign:'center' as const,fontSize:11,fontWeight:600,color:'#888'}}>TOTAL</div>
            </div>
            {/* Ligne non assignés mois */}
            <div style={{display:'grid',gridTemplateColumns:`200px repeat(${monthDays.length},44px) 80px`,borderBottom:`1px solid ${BD}`}}>
              <div style={{padding:'8px 16px',borderRight:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:8}}>
                <div style={{width:28,height:28,borderRadius:'50%',background:'#e5e7eb',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#888'}}>N/A</div>
                <span style={{fontSize:12,color:'#888'}}>Non assignés</span>
              </div>
              {monthDays.map((d,i)=>{
                const dateStr=formatDate(d)
                const isWeekend=d.getDay()===0||d.getDay()===6
                const dayShifts=getShiftsForUserDay('unassigned',dateStr)
                return(
                  <div key={i} style={{borderRight:`1px solid ${BD}`,minHeight:44,background:isWeekend?'#fafafa':undefined,cursor:'pointer',display:'flex',flexDirection:'column' as const,gap:1,padding:1}}
                    onClick={()=>openModal('unassigned',dateStr)}>
                    {dayShifts.map(s=>(
                      <div key={s.id} style={{background:s.color,borderRadius:3,height:8,cursor:'pointer'}}
                        onMouseEnter={e=>{e.stopPropagation();setHoveredShift(s.id);setTooltipPos({x:e.clientX,y:e.clientY})}}
                        onMouseLeave={()=>setHoveredShift(null)}
                        onClick={e=>{e.stopPropagation();openModal('unassigned',dateStr,s)}}/>
                    ))}
                  </div>
                )
              })}
              <div style={{padding:'8px 4px',textAlign:'center' as const,fontSize:12,color:'#888'}}>—</div>
            </div>
            {/* Lignes ouvriers mois */}
            {ouvriers.map((o,oi)=>{
              const totalMois=monthDays.reduce((sum,d)=>{
                return sum+getShiftsForUserDay(o.id,formatDate(d)).reduce((s2,sh)=>s2+calcHeures(sh.startTime,sh.endTime),0)
              },0)
              return(
                <div key={o.id} style={{display:'grid',gridTemplateColumns:`200px repeat(${monthDays.length},44px) 80px`,borderBottom:oi<ouvriers.length-1?`1px solid ${BD}`:'none'}}>
                  <div style={{padding:'8px 16px',borderRight:`1px solid ${BD}`,display:'flex',alignItems:'center',gap:8}}>
                    <div style={{width:28,height:28,borderRadius:'50%',background:o.color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:'#fff',flexShrink:0}}>{o.initiales}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' as const}}>{o.nom}{o.externe&&<span style={{color:'#888'}}> *</span>}</div>
                      <div style={{fontSize:10,color:AM}}>{o.heures?`${o.heures}h`:o.contrat==='extra'?'Extra':'—'}</div>
                    </div>
                  </div>
                  {monthDays.map((d,di)=>{
                    const dateStr=formatDate(d)
                    const isToday=dateStr===today
                    const isWeekend=d.getDay()===0||d.getDay()===6
                    const dayShifts=getShiftsForUserDay(o.id,dateStr)
                    return(
                      <div key={di} style={{borderRight:`1px solid ${BD}`,minHeight:44,background:isToday?'#f0fdf420':isWeekend?'#fafafa':undefined,cursor:'pointer',display:'flex',flexDirection:'column' as const,gap:1,padding:1}}
                        onClick={()=>openModal(o.id,dateStr)}>
                        {dayShifts.map(s=>(
                          <div key={s.id}
                            style={{background:s.color,borderRadius:3,padding:'1px 3px',fontSize:9,color:'#fff',fontWeight:600,cursor:'pointer',overflow:'hidden',whiteSpace:'nowrap' as const,textOverflow:'ellipsis'}}
                            onMouseEnter={e=>{e.stopPropagation();setHoveredShift(s.id);setTooltipPos({x:e.clientX,y:e.clientY})}}
                            onMouseLeave={()=>setHoveredShift(null)}
                            onClick={e=>{e.stopPropagation();openModal(o.id,dateStr,s)}}>
                            {s.startTime}
                          </div>
                        ))}
                      </div>
                    )
                  })}
                  <div style={{padding:'8px 4px',textAlign:'center' as const}}>
                    <div style={{fontSize:12,fontWeight:700,color:'#111'}}>{totalMois}h</div>
                  </div>
                </div>
              )
            })}
            <div style={{borderTop:`1px solid ${BD}`,padding:'8px 16px'}}>
              <a href="/utilisateurs" style={{fontSize:13,color:G,textDecoration:'none',fontWeight:500}}>+ Ajouter un ouvrier</a>
            </div>
          </div>
        </div>
      )}

      {/* Modale ajout/édition shift */}
      {showModal && editShift && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={()=>setShowModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:480,width:'100%',maxHeight:'90vh',overflowY:'auto'}}>

            {/* Header */}
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
              <div>
                <div style={{fontSize:15,fontWeight:700,color:'#111'}}>
                  {editShift.shift ? 'Modifier le shift' : `Shift pour ${ouvriers.find(o=>o.id===editShift.userId)?.nom||'Non assigné'}`}
                </div>
                <div style={{fontSize:12,color:'#888',marginTop:2}}>
                  {new Date(editShift.date+'T12:00:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
                </div>
              </div>
              <button onClick={()=>setShowModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888',padding:0}}>×</button>
            </div>

            {/* Onglets */}
            <div style={{display:'flex',gap:0,marginBottom:20,borderBottom:`1px solid ${BD}`}}>
              <button style={{padding:'8px 16px',background:'none',border:'none',borderBottom:`2px solid ${G}`,fontSize:13,fontWeight:600,color:G,cursor:'pointer'}}>Shift</button>
              <button style={{padding:'8px 16px',background:'none',border:'none',borderBottom:'2px solid transparent',fontSize:13,color:'#aaa',cursor:'not-allowed'}} disabled>Absence</button>
            </div>

            {/* Horaires */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Horaires</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:8}}>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Début</label>
                  <input type="time" value={form.startTime} onChange={e=>setForm(f=>({...f,startTime:e.target.value}))}
                    style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Fin</label>
                  <input type="time" value={form.endTime} onChange={e=>setForm(f=>({...f,endTime:e.target.value}))}
                    style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
                </div>
                <div>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Pause (min)</label>
                  <input type="number" value={form.pauseMin} min={0} max={120} onChange={e=>setForm(f=>({...f,pauseMin:parseInt(e.target.value)||0}))}
                    style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
                </div>
              </div>
              <div style={{fontSize:12,color:'#888',background:'#f9fafb',borderRadius:6,padding:'6px 10px',display:'inline-block'}}>
                Durée : <strong style={{color:'#111'}}>{calcDuree(form.startTime, form.endTime, form.pauseMin)}</strong>
              </div>
            </div>

            {/* Client / Devis */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Client — Devis</div>
              {form.devisId ? (
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#f0fdf4',border:`1px solid ${G}44`,borderRadius:8}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:G,flexShrink:0}}/>
                  <span style={{fontSize:13,color:'#111',flex:1}}>{form.devisLabel}</span>
                  <button onClick={()=>setForm(f=>({...f,devisId:'',devisLabel:''}))} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:16,padding:0}}>×</button>
                </div>
              ) : form.posteId ? (
                <div style={{display:'flex',alignItems:'center',gap:8,padding:'8px 12px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8}}>
                  <div style={{width:10,height:10,borderRadius:'50%',background:form.color,flexShrink:0}}/>
                  <span style={{fontSize:13,color:'#111',flex:1}}>{form.posteLabel}</span>
                  <button onClick={()=>setForm(f=>({...f,posteId:'',posteLabel:''}))} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:16,padding:0}}>×</button>
                </div>
              ) : (
                <div>
                  <div style={{position:'relative',marginBottom:8}}>
                    <input value={devisSearch} onChange={e=>setDevisSearch(e.target.value)}
                      placeholder="Rechercher un devis signé..."
                      style={{width:'100%',padding:'8px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
                    {devisSearch && (
                      <div style={{position:'absolute',top:'100%',left:0,right:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:100,maxHeight:180,overflowY:'auto'}}>
                        {devisList.filter(d=>(d.clientNom+d.titreProjet+d.ref).toLowerCase().includes(devisSearch.toLowerCase())).length === 0 ? (
                          <div style={{padding:'12px 16px',fontSize:13,color:'#888'}}>Aucun devis signé trouvé</div>
                        ) : devisList.filter(d=>(d.clientNom+d.titreProjet+d.ref).toLowerCase().includes(devisSearch.toLowerCase())).map(d => (
                          <div key={d.id} onClick={()=>{setForm(f=>({...f,devisId:d.id,devisLabel:d.label,color:d.color}));setDevisSearch('')}}
                            style={{padding:'10px 16px',cursor:'pointer',borderBottom:`1px solid ${BD}`}}
                            onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                            onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:2}}>
                              <span style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.clientNom}</span>
                              <span style={{fontSize:11,color:'#888',fontFamily:'monospace'}}>{d.ref}</span>
                            </div>
                            <div style={{fontSize:12,color:'#555'}}>{d.titreProjet} · <span style={{color:G,fontWeight:500}}>{d.montant.toLocaleString('fr-FR')} € HT</span></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={()=>setShowPosteModal(true)}
                    style={{fontSize:12,color:G,background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                    + Créer un poste libre
                  </button>
                </div>
              )}
            </div>

            {/* Couleur */}
            <div style={{marginBottom:16}}>
              <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:8}}>Couleur</label>
              <div style={{display:'flex',gap:8,flexWrap:'wrap' as const}}>
                {COULEURS_PREDEF.map(col => (
                  <div key={col} onClick={()=>setForm(f=>({...f,color:col}))}
                    style={{width:26,height:26,borderRadius:'50%',background:col,cursor:'pointer',border:form.color===col?'3px solid #111':'3px solid transparent',transition:'border 0.15s'}}/>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Notes</label>
              <textarea value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))}
                placeholder="Ajouter une note..."
                rows={3} maxLength={1000}
                style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const,resize:'vertical' as const,fontFamily:'system-ui'}}/>
            </div>

            {/* Fichiers */}
            <div style={{marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Fichiers</div>
              <div onDragOver={e=>{e.preventDefault();setDragOver(true)}} onDragLeave={()=>setDragOver(false)}
                onDrop={e=>{e.preventDefault();setDragOver(false);const files=Array.from(e.dataTransfer.files).slice(0,6-attachments.length).filter(f=>f.size<=10*1024*1024);setAttachments(a=>[...a,...files.map(f=>({name:f.name,size:f.size,url:URL.createObjectURL(f)}))])}}
                style={{border:`2px dashed ${dragOver?G:BD}`,borderRadius:10,padding:'20px',textAlign:'center' as const,background:dragOver?'#f0fdf4':'#f9fafb',transition:'all 0.15s',cursor:'pointer'}}
                onClick={()=>{const i=document.createElement('input');i.type='file';i.multiple=true;i.accept='image/*,.pdf,.doc,.docx';i.onchange=(e:any)=>{const files=Array.from(e.target.files as FileList).slice(0,6-attachments.length).filter((f:File)=>f.size<=10*1024*1024);setAttachments(a=>[...a,...files.map((f:File)=>({name:(f as File).name,size:(f as File).size,url:URL.createObjectURL(f as File)}))])};i.click()}}>
                <div style={{fontSize:20,marginBottom:4}}>☁️</div>
                <div style={{fontSize:13,fontWeight:500,color:'#555'}}>Ajouter des photos ou documents</div>
                <div style={{fontSize:11,color:'#aaa',marginTop:2}}>Limite de 6 fichiers · Max 10 MB</div>
              </div>
              {attachments.length>0&&(
                <div style={{marginTop:8,display:'flex',flexWrap:'wrap' as const,gap:6}}>
                  {attachments.map((f,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'center',gap:4,background:'#f3f4f6',borderRadius:6,padding:'4px 8px',fontSize:11,color:'#333'}}>
                      📎 {f.name.slice(0,20)}{f.name.length>20?'...':''}
                      <button onClick={()=>setAttachments(a=>a.filter((_,j)=>j!==i))} style={{background:'none',border:'none',cursor:'pointer',color:'#888',fontSize:12,padding:0}}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Répéter */}
            <div style={{marginBottom:20}}>
              <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Répéter le shift</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap' as const,marginBottom:8}}>
                {[['lun','L'],['mar','M'],['mer','M'],['jeu','J'],['ven','V'],['sam','S'],['dim','D']].map(([key,label])=>(
                  <button key={key} onClick={()=>setRepeatDays(d=>d.includes(key)?d.length>1?d.filter(x=>x!==key):d:[...d,key])}
                    style={{width:34,height:34,borderRadius:'50%',border:`1px solid ${repeatDays.includes(key)?G:BD}`,background:repeatDays.includes(key)?G:'#fff',color:repeatDays.includes(key)?'#fff':'#555',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                    {label}
                  </button>
                ))}
              </div>
              <div style={{display:'flex',gap:12,alignItems:'center'}}>
                <button onClick={()=>repeatDays.length===7?setRepeatDays([]):setRepeatDays(['lun','mar','mer','jeu','ven','sam','dim'])}
                  style={{fontSize:12,color:G,background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                  {repeatDays.length===7?'Tout désélectionner':'Tout sélectionner'}
                </button>
                <button onClick={()=>setShowRepeatModal(true)}
                  style={{fontSize:12,color:'#555',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                  🔄 Personnaliser la répétition
                </button>
              </div>
            </div>

            {/* Boutons */}
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
              <button onClick={saveShift} disabled={!(form.devisLabel||form.posteLabel||form.label).trim()}
                style={{flex:2,padding:11,background:(form.devisLabel||form.posteLabel||form.label).trim()?G:'#e5e7eb',color:(form.devisLabel||form.posteLabel||form.label).trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                {editShift.shift ? 'Enregistrer' : '+ Créer le shift'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale répétition personnalisée */}
      {showRepeatModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.6)',zIndex:700,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:380,width:'100%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:16}}>Personnaliser la répétition</div>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
              <span style={{fontSize:13,color:'#555'}}>Tous les</span>
              <input type="number" value={repeatConfig.freq} min={1} max={12} onChange={e=>setRepeatConfig(r=>({...r,freq:e.target.value}))}
                style={{width:56,padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',textAlign:'center' as const,color:'#111'}}/>
              <select value={repeatConfig.unit} onChange={e=>setRepeatConfig(r=>({...r,unit:e.target.value}))}
                style={{padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',background:'#fff',color:'#111'}}>
                <option value="jour">jour(s)</option>
                <option value="semaine">semaine(s)</option>
                <option value="mois">mois</option>
              </select>
            </div>
            {repeatConfig.unit==='semaine'&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:500,color:'#555',marginBottom:8}}>Le</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap' as const}}>
                  {[['lun','L'],['mar','M'],['mer','M'],['jeu','J'],['ven','V'],['sam','S'],['dim','D']].map(([key,label])=>(
                    <button key={key} onClick={()=>setRepeatDays(d=>d.includes(key)?d.filter(x=>x!==key):[...d,key])}
                      style={{width:32,height:32,borderRadius:'50%',border:`1px solid ${repeatDays.includes(key)?G:BD}`,background:repeatDays.includes(key)?G:'#fff',color:repeatDays.includes(key)?'#fff':'#555',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {repeatConfig.unit==='mois'&&editShift&&(
              <div style={{marginBottom:16}}>
                <div style={{fontSize:12,fontWeight:500,color:'#555',marginBottom:8}}>Le</div>
                <div style={{display:'flex',gap:8}}>
                  {getMonthRepeatOptions(editShift.date).map(opt=>(
                    <button key={opt.value} onClick={()=>setRepeatConfig(r=>({...r,monthOption:opt.value}))}
                      style={{padding:'7px 14px',borderRadius:8,border:`1px solid ${repeatConfig.monthOption===opt.value?G:BD}`,background:repeatConfig.monthOption===opt.value?G:'#fff',color:repeatConfig.monthOption===opt.value?'#fff':'#555',fontSize:13,fontWeight:500,cursor:'pointer'}}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{marginBottom:20}}>
              <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Date de fin</label>
              <input type="date" value={repeatConfig.endDate} onChange={e=>setRepeatConfig(r=>({...r,endDate:e.target.value}))}
                style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,color:'#111'}}/>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>{setRepeatDays([]);setRepeatConfig({freq:'1',unit:'semaine',endDate:'',monthOption:'day'});setShowRepeatModal(false)}}
                style={{padding:'8px 12px',border:'1px solid #fca5a5',borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#ef4444',fontWeight:500}}>
                🗑️ Supprimer
              </button>
              <button onClick={()=>setShowRepeatModal(false)} style={{flex:1,padding:'8px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
              <button onClick={()=>setShowRepeatModal(false)} style={{flex:1,padding:'8px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Ajouter</button>
            </div>
          </div>
        </div>
      )}

      {/* Sous-modale Créer un poste */}
      {showPosteModal && (
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.5)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:380,width:'100%'}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111',marginBottom:16}}>Créer un poste libre</div>
            <div style={{display:'grid',gridTemplateColumns:'auto 1fr auto',gap:10,alignItems:'end',marginBottom:20}}>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Couleur</label>
                <div style={{display:'flex',gap:6,flexWrap:'wrap' as const,maxWidth:120}}>
                  {COULEURS_PREDEF.slice(0,6).map(col => (
                    <div key={col} onClick={()=>setNewPoste(p=>({...p,color:col}))}
                      style={{width:24,height:24,borderRadius:'50%',background:col,cursor:'pointer',border:newPoste.color===col?'3px solid #111':'3px solid transparent'}}/>
                  ))}
                </div>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Nom du poste *</label>
                <input value={newPoste.name} onChange={e=>setNewPoste(p=>({...p,name:e.target.value}))}
                  placeholder="Ex: Maintenance"
                  style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const}}/>
              </div>
              <div>
                <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Pause (min)</label>
                <input type="number" value={newPoste.pauseMin} min={0} onChange={e=>setNewPoste(p=>({...p,pauseMin:parseInt(e.target.value)||0}))}
                  style={{width:70,padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none'}}/>
              </div>
            </div>
            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setShowPosteModal(false)} style={{flex:1,padding:10,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
              <button onClick={savePoste} disabled={!newPoste.name.trim()}
                style={{flex:2,padding:10,background:newPoste.name.trim()?G:'#e5e7eb',color:newPoste.name.trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                Créer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

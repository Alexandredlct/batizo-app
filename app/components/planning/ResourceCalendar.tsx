'use client'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  const [draggingShift, setDraggingShift] = useState<Shift|null>(null)
  const [dragGhost, setDragGhost] = useState<{x:number,y:number}|null>(null)
  const [dragTarget, setDragTarget] = useState<{userId:string,date:string,action:'move'|'copy'}|null>(null)
  const [modalTab, setModalTab] = useState<'shift'|'absence'>('shift')
  const [absenceType, setAbsenceType] = useState<'journee'|'demi'|'perso'>('journee')
  const [absenceForm, setAbsenceForm] = useState({startTime:'08:00',endTime:'17:00',notes:''})
  const [tooltipPos, setTooltipPos] = useState({x:0,y:0})
  const [ouvriers, setOuvriers] = useState<Ouvrier[]>([])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [showAddMemberModal, setShowAddMemberModal] = useState(false)
  const [showSortModal, setShowSortModal] = useState(false)
  const [showClearModal, setShowClearModal] = useState(false)
  const [clearTarget, setClearTarget] = useState<'all'|'user'>('all')
  const [clearUserId, setClearUserId] = useState('')
  const [showMenuMore, setShowMenuMore] = useState(false)
  const menuMoreRef = useRef<HTMLDivElement>(null)
  const [sortMode, setSortMode] = useState<'asc'|'desc'|'custom'>(()=>{
    if(typeof window==='undefined') return 'custom'
    try{const r=localStorage.getItem('batizo_planning_sort');return (r as any)||'custom'}catch(e){return 'custom'}
  })
  const [customOrder, setCustomOrder] = useState<string[]>(()=>{
    if(typeof window==='undefined') return []
    try{const r=localStorage.getItem('batizo_planning_order');return r?JSON.parse(r):[]}catch(e){return []}
  })
  const [sortDraft, setSortDraft] = useState<'asc'|'desc'|'custom'>('custom')
  const [sortKey, setSortKey] = useState(0)
  const [customDraft, setCustomDraft] = useState<string[]>([])
  const [planningMemberIds, setPlanningMemberIds] = useState<string[]>(()=>{
    if(typeof window==='undefined') return []
    try{const raw=localStorage.getItem('batizo_planning_members');if(raw)return JSON.parse(raw)}catch(e){}
    return []
  })
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

  // Charger tous les utilisateurs de l'organisation
  useEffect(() => {
    try {
      const raw = localStorage.getItem('batizo_utilisateurs')
      if(raw) {
        const list = JSON.parse(raw)
        const actifs = list.filter((u: any) => u.statut !== 'revoque')
        setAllUsers(actifs)
        // Charger les membres du planning (IDs sauvegardés)
        const savedIds = (() => {
          try{const r=localStorage.getItem('batizo_planning_members');return r?JSON.parse(r):[]}catch(e){return []}
        })()
        const membres = actifs
          .filter((u: any) => savedIds.includes(u.id))
          .map((u: any, i: number) => ({
            id: u.id, nom: u.nom, contrat: u.contrat, heures: u.heures,
            externe: u.externe, initiales: getInitiales(u.nom),
            color: AVATAR_COLORS[i % AVATAR_COLORS.length]
          }))
        setOuvriers(membres)
      }
    } catch(e) {}
  }, [planningMemberIds])

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

  // Fermer menu ⋮ au clic extérieur + Echap
  useEffect(() => {
    if(!showMenuMore) return
    const handleClick = (e: MouseEvent) => {
      if(menuMoreRef.current && !menuMoreRef.current.contains(e.target as Node)) {
        setShowMenuMore(false)
      }
    }
    const handleKey = (e: KeyboardEvent) => { if(e.key==='Escape') setShowMenuMore(false) }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [showMenuMore])

  // Drag natif
  const startDrag = (e: React.MouseEvent, shift: Shift) => {
    e.preventDefault()
    e.stopPropagation()
    setDraggingShift(shift)
    setDragGhost({x: e.clientX, y: e.clientY})
    setHoveredShift(null)

    const onMouseMove = (ev: MouseEvent) => {
      setDragGhost({x: ev.clientX, y: ev.clientY})
      // Détecter la zone survolée
      const el = document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement
      if(el) {
        const cell = el.closest('[data-cell]') as HTMLElement
        if(cell) {
          const userId = cell.dataset.userid || ''
          const date = cell.dataset.date || ''
          const rect = cell.getBoundingClientRect()
          const action = ev.clientX < rect.left + rect.width/2 ? 'move' : 'copy'
          setDragTarget({userId, date, action})
          return
        }
      }
      setDragTarget(null)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      setDragGhost(null)
      setDraggingShift(null)
      setDragTarget(prev => {
        if(prev && shift) {
          if(prev.action === 'copy') {
            const newShift = {...shift, id:'s'+Date.now()+Math.floor(Math.random()*9999), userId:prev.userId, date:prev.date}
            saveShifts([...shifts, newShift])
          } else {
            saveShifts(shifts.map(s => s.id===shift.id ? {...s, userId:prev.userId, date:prev.date} : s))
          }
        }
        return null
      })
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const toggleMember = (userId: string) => {
    setPlanningMemberIds(prev => {
      const updated = prev.includes(userId) ? prev.filter(id=>id!==userId) : [...prev, userId]
      try{localStorage.setItem('batizo_planning_members', JSON.stringify(updated))}catch(e){}
      return updated
    })
  }

  const saveShifts = (updated: Shift[]) => {
    setShifts(updated)
    try { localStorage.setItem('batizo_planning_shifts', JSON.stringify(updated)) } catch(e) {}
  }

  // Jours fériés français fixes
  const getEaster=(y:number)=>{const a=y%19,b=Math.floor(y/100),cc=y%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,ii=Math.floor(cc/4),k=cc%4,l=(32+2*e+2*ii-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;return new Date(y,mo-1,da)}
  const getHolidayName=(d:Date)=>{
    const y=d.getFullYear(),m=d.getMonth()+1,day=d.getDate()
    const e=getEaster(y)
    const add=(dt:Date,n:number)=>{const r=new Date(dt);r.setDate(r.getDate()+n);return r}
    const match=(dt:Date)=>dt.getMonth()+1===m&&dt.getDate()===day
    if(m===1&&day===1) return "Jour de l'an"
    if(match(add(e,1))) return 'Lundi de Pâques'
    if(m===5&&day===1) return 'Fête du Travail'
    if(m===5&&day===8) return 'Victoire 1945'
    if(match(add(e,39))) return 'Ascension'
    if(match(add(e,50))) return 'Lundi de Pentecôte'
    if(m===7&&day===14) return 'Fête nationale'
    if(m===8&&day===15) return 'Assomption'
    if(m===11&&day===1) return 'Toussaint'
    if(m===11&&day===11) return 'Armistice 1918'
    if(m===12&&day===25) return 'Noël'
    return null
  }
  const isFerie=(d:Date)=>!!getHolidayName(d)

  const getMonthDays = (offset: number) => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth()+offset, 1)
    const last = new Date(now.getFullYear(), now.getMonth()+offset+1, 0)
    const days = []
    for(let d=new Date(first); d<=last; d.setDate(d.getDate()+1)) days.push(new Date(d))
    return days
  }

  // Ouvriers triés
  const ouvriersTries = useMemo(()=>{
    const list = [...ouvriers]
    if(sortMode==='asc') return list.sort((a,b)=>a.nom.localeCompare(b.nom,'fr'))
    if(sortMode==='desc') return list.sort((a,b)=>b.nom.localeCompare(a.nom,'fr'))
    // custom : trier selon customOrder
    if(customOrder.length>0) {
      return list.sort((a,b)=>{
        const ia=customOrder.indexOf(a.id)
        const ib=customOrder.indexOf(b.id)
        if(ia===-1&&ib===-1) return 0
        if(ia===-1) return 1
        if(ib===-1) return -1
        return ia-ib
      })
    }
    return list
  },[ouvriers,sortMode,customOrder,sortKey])

  const days = getWeekDays(weekOffset)
  const monthDays = getMonthDays(monthOffset)
  const moisLabelMois = new Date(new Date().getFullYear(), new Date().getMonth()+monthOffset, 1).toLocaleDateString('fr-FR',{month:'long',year:'numeric'})
  const [today, setToday] = useState('')
  useEffect(()=>setToday(formatDate(new Date())),[]) 

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
    setModalTab('shift')
    setAbsenceType('journee')
    setAbsenceForm({startTime:'08:00',endTime:'17:00',notes:''})
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

  const saveAbsence = () => {
    if(!editShift) return
    const dureeLabel = absenceType==='journee'?'Toute la journée':absenceType==='demi'?'Demi-journée':calcDuree(absenceForm.startTime,absenceForm.endTime,0)
    const startTime = absenceType==='journee'?'00:00':absenceType==='demi'?'08:00':absenceForm.startTime
    const endTime = absenceType==='journee'?'23:59':absenceType==='demi'?'13:00':absenceForm.endTime
    const newShift:Shift = {
      id:'s'+Date.now(),userId:editShift.userId,date:editShift.date,
      label:'Absent · '+dureeLabel,startTime,endTime,
      color:'#9ca3af',pauseMin:0,notes:absenceForm.notes,
      devisId:'',devisLabel:'',posteId:'',posteLabel:''
    }
    const updated = editShift.shift
      ? shifts.map(s=>s.id===editShift.shift!.id?{...s,...newShift,id:s.id}:s)
      : [...shifts,newShift]
    saveShifts(updated)
    setShowModal(false)
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
          <div ref={menuMoreRef} style={{position:'relative'}}>
            <button onClick={()=>setShowMenuMore(m=>!m)}
              style={{width:32,height:32,border:`1px solid ${BD}`,borderRadius:7,background:'#fff',cursor:'pointer',fontSize:18,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',color:'#333',transition:'background 0.15s'}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
              ⋮
            </button>
            {showMenuMore&&(
              <div style={{position:'absolute',top:'calc(100% + 4px)',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:10,boxShadow:'0 4px 20px rgba(0,0,0,0.1)',zIndex:200,minWidth:210,overflow:'hidden'}}>
                <button onClick={()=>{setSortDraft(sortMode)
                  // Init draft depuis customOrder si dispo, sinon ordre brut
                  setCustomDraft(customOrder.length>0 ? [...customOrder] : ouvriers.map(o=>o.id))
                  setShowSortModal(true);setShowMenuMore(false)}}
                  style={{width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#333',textAlign:'left' as const,display:'flex',alignItems:'center',gap:8}}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f9fafb'}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='none'}>
                  ⇅ Trier les employés
                </button>
                <button onClick={()=>{setShowClearModal(true);setShowMenuMore(false)}}
                  style={{width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',fontSize:13,color:'#ef4444',textAlign:'left' as const,display:'flex',alignItems:'center',gap:8}}
                  onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#fef2f2'}
                  onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='none'}>
                  🗑️ Effacer les shifts
                </button>
              </div>
            )}
          </div>
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
      {view==='semaine'&&<div style={{background:'#fff',border:`1px solid ${BD}`,borderRadius:12,overflow:'hidden'}}>

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



        {/* Lignes ouvriers */}
        {ouvriersTries.length === 0 ? (
          <div style={{padding:'3rem',textAlign:'center',color:'#888',fontSize:13}}>
            Aucun membre dans le planning.{' '}
            <button onClick={()=>setShowAddMemberModal(true)} style={{color:G,background:'none',border:'none',cursor:'pointer',fontWeight:600,fontSize:13,padding:0}}>
              + Ajouter un utilisateur
            </button>
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
                      dragOverAction={dragTarget?.userId===o.id&&dragTarget?.date===dateStr?dragTarget.action:null}
                      onClick={()=>{if(!draggingShift)openModal(o.id,dateStr)}}
                      style={{borderRight:`1px solid ${BD}`,minHeight:64,padding:4,cursor:'pointer',background:isToday?'#f0fdf420':undefined,'--data-userid':o.id,'--data-date':dateStr} as any}
                      onDragOverZone={(uid,dt,act)=>setDragTarget(act?{userId:uid,date:dt,action:act}:null)}>
                      {dayShifts.map(s => (
                        <DraggableShift key={s.id} shift={s}
                          isDragging={draggingShift?.id===s.id}
                          onMouseDown={(e)=>startDrag(e,s)}
                          onClickShift={e=>{e.stopPropagation();if(!draggingShift)openModal(o.id,dateStr,s)}}
                          onHover={(id,x,y)=>{if(id&&!draggingShift){setHoveredShift(id);setTooltipPos({x,y})}else setHoveredShift(null)}}>
                          <div style={{background:s.color,borderRadius:6,padding:'3px 6px',fontSize:11,color:'#fff',fontWeight:600,marginBottom:2}}>
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

        {/* Bouton + Ajouter un utilisateur */}
        <div style={{borderTop:`1px solid ${BD}`,padding:'10px 16px'}}>
          <button onClick={()=>setShowAddMemberModal(true)}
            style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:13,color:G,background:'none',border:'none',cursor:'pointer',fontWeight:500,padding:0}}>
            <span style={{fontSize:16}}>+</span> Ajouter un utilisateur
          </button>
        </div>
      </div>}

      {/* Modale Trier les employés */}
      {showSortModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={()=>setShowSortModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:440,width:'100%',maxHeight:'80vh',display:'flex',flexDirection:'column' as const}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>⇅ Trier les employés</div>
              <button onClick={()=>setShowSortModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            {/* Options tri */}
            {(['asc','desc','custom'] as const).map(mode=>(
              <div key={mode} onClick={()=>setSortDraft(mode)}
                style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',cursor:'pointer'}}>
                <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${sortDraft===mode?G:BD}`,background:sortDraft===mode?G:'#fff',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {sortDraft===mode&&<div style={{width:6,height:6,borderRadius:'50%',background:'#fff'}}/>}
                </div>
                <span style={{fontSize:13,color:'#111',fontWeight:sortDraft===mode?600:400}}>
                  {mode==='asc'?'A à Z':mode==='desc'?'Z à A':'Personnaliser…'}
                </span>
              </div>
            ))}
            {/* Liste custom avec flèches */}
            {sortDraft==='custom'&&(
              <div style={{marginTop:12,border:`1px solid ${BD}`,borderRadius:10,overflow:'hidden',flex:1,overflowY:'auto'}}>
                {customDraft.map((uid,idx)=>{
                  const u=ouvriers.find(o=>o.id===uid)
                  if(!u) return null
                  return(
                    <div key={uid} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:idx<customDraft.length-1?`1px solid ${BD}`:'none',background:'#fff'}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:u.color,display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:11,fontWeight:700,flexShrink:0}}>{u.initiales}</div>
                      <div style={{flex:1}}>
                        <div style={{fontSize:13,fontWeight:500,color:'#111'}}>{u.nom}</div>
                        <div style={{fontSize:11,color:'#888'}}>{u.heures?`${u.heures}h`:u.contrat||'—'}</div>
                      </div>
                      <div style={{display:'flex',flexDirection:'column' as const,gap:2}}>
                        <button disabled={idx===0} onClick={()=>setCustomDraft(d=>{const r=[...d];[r[idx-1],r[idx]]=[r[idx],r[idx-1]];return r})}
                          style={{width:24,height:24,border:`1px solid ${BD}`,borderRadius:4,background:idx===0?'#f9fafb':'#fff',cursor:idx===0?'default':'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',color:idx===0?'#ccc':'#555'}}>↑</button>
                        <button disabled={idx===customDraft.length-1} onClick={()=>setCustomDraft(d=>{const r=[...d];[r[idx],r[idx+1]]=[r[idx+1],r[idx]];return r})}
                          style={{width:24,height:24,border:`1px solid ${BD}`,borderRadius:4,background:idx===customDraft.length-1?'#f9fafb':'#fff',cursor:idx===customDraft.length-1?'default':'pointer',fontSize:12,display:'flex',alignItems:'center',justifyContent:'center',color:idx===customDraft.length-1?'#ccc':'#555'}}>↓</button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowSortModal(false)} style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
              <button onClick={()=>{
                const newOrder = sortDraft==='custom'
                  ? [...customDraft]
                  : [...ouvriers].sort((a,b)=>sortDraft==='asc'?a.nom.localeCompare(b.nom,'fr'):b.nom.localeCompare(a.nom,'fr')).map(o=>o.id)
                setSortMode(sortDraft)
                setCustomOrder(newOrder)
                setSortKey(k=>k+1)
                try{
                  localStorage.setItem('batizo_planning_sort',sortDraft)
                  localStorage.setItem('batizo_planning_order',JSON.stringify(newOrder))
                }catch(e){}
                setShowSortModal(false)
              }} style={{flex:1,padding:11,background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>Valider</button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Effacer les shifts - Ticket 2 */}
      {showClearModal&&(()=>{
        const weekDates=days.map(formatDate)
        const shiftsThisWeek=shifts.filter(s=>weekDates.includes(s.date))
        const shiftsTarget=clearTarget==='all'?shiftsThisWeek:shiftsThisWeek.filter(s=>s.userId===clearUserId)
        return(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={()=>setShowClearModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:420,width:'100%'}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{fontSize:14,fontWeight:700,color:'#111'}}>
                ⚠️ Effacer les shifts du {days[0].toLocaleDateString('fr-FR',{day:'numeric',month:'long'})} au {days[6].toLocaleDateString('fr-FR',{day:'numeric',month:'long'})}
              </div>
              <button onClick={()=>setShowClearModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            <p style={{fontSize:13,color:'#555',marginBottom:16,lineHeight:1.6}}>
              Vous êtes sur le point de supprimer définitivement les shifts de la semaine du{' '}
              <strong>{days[0].toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</strong> au{' '}
              <strong>{days[6].toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'})}</strong>{' '}
              (semaine {getWeekNumber(days[0])}). Cette action est irréversible.
            </p>
            <div style={{fontSize:13,fontWeight:600,color:'#333',marginBottom:10}}>Quels shifts effacer ?</div>
            {[['all','Tous les shifts de la semaine'],['user','Seulement les shifts de :']] .map(([val,label])=>(
              <div key={val} onClick={()=>setClearTarget(val as any)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',cursor:'pointer'}}>
                <div style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${clearTarget===val?'#ef4444':BD}`,background:clearTarget===val?'#ef4444':'#fff',flexShrink:0}}/>
                <span style={{fontSize:13,color:'#111'}}>{label}</span>
                {val==='all'&&<span style={{fontSize:11,color:'#888'}}>({shiftsThisWeek.length} shifts)</span>}
              </div>
            ))}
            {clearTarget==='user'&&(
              <select value={clearUserId} onChange={e=>setClearUserId(e.target.value)}
                style={{width:'calc(100% - 30px)',marginLeft:30,padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',marginTop:8,boxSizing:'border-box' as const}}>
                <option value="">Sélectionner un membre...</option>
                {ouvriersTries.map(o=>(
                  <option key={o.id} value={o.id}>{o.nom} ({shiftsThisWeek.filter(s=>s.userId===o.id).length} shifts)</option>
                ))}
              </select>
            )}
            {clearTarget==='user'&&clearUserId&&(
              <div style={{fontSize:11,color:'#888',marginTop:6,marginLeft:30}}>{shiftsTarget.length} shift(s) seront supprimés</div>
            )}
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={()=>setShowClearModal(false)} style={{flex:1,padding:11,border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555'}}>Annuler</button>
              <button
                disabled={shiftsTarget.length===0||(clearTarget==='user'&&!clearUserId)}
                onClick={()=>{
                  const toDelete=new Set(shiftsTarget.map(s=>s.id))
                  saveShifts(shifts.filter(s=>!toDelete.has(s.id)))
                  setShowClearModal(false)
                  setClearTarget('all');setClearUserId('')
                }}
                style={{flex:1,padding:11,background:shiftsTarget.length>0&&(clearTarget==='all'||clearUserId)?'#ef4444':'#e5e7eb',color:shiftsTarget.length>0&&(clearTarget==='all'||clearUserId)?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                🗑️ Effacer ({shiftsTarget.length})
              </button>
            </div>
          </div>
        </div>
        )
      })()}

      {/* Modale sélection membres planning */}
      {showAddMemberModal&&(
        <div style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.4)',zIndex:600,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}
          onClick={()=>setShowAddMemberModal(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:16,padding:24,maxWidth:420,width:'100%',maxHeight:'80vh',display:'flex',flexDirection:'column' as const}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Ajouter au planning</div>
              <button onClick={()=>setShowAddMemberModal(false)} style={{background:'none',border:'none',fontSize:20,cursor:'pointer',color:'#888'}}>×</button>
            </div>
            <div style={{fontSize:13,color:'#888',marginBottom:16}}>
              Sélectionnez les membres à afficher dans le planning.
            </div>
            <div style={{flex:1,overflowY:'auto',display:'flex',flexDirection:'column' as const,gap:8,marginBottom:16}}>
              {allUsers.length===0?(
                <div style={{textAlign:'center' as const,padding:'1rem',color:'#888',fontSize:13}}>
                  Aucun utilisateur dans votre organisation.{' '}
                  <a href="/utilisateurs" style={{color:G,fontWeight:600}}>Créer un utilisateur</a>
                </div>
              ):allUsers.map((u:any,i:number)=>{
                const isInPlanning = planningMemberIds.includes(u.id)
                return(
                  <div key={u.id} onClick={()=>toggleMember(u.id)}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:10,border:`1px solid ${isInPlanning?G:BD}`,background:isInPlanning?'#f0fdf4':'#fff',cursor:'pointer',transition:'all 0.15s'}}>
                    <div style={{width:36,height:36,borderRadius:'50%',background:AVATAR_COLORS[i%AVATAR_COLORS.length],display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,flexShrink:0}}>
                      {getInitiales(u.nom)}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{u.nom}</div>
                      <div style={{fontSize:11,color:'#888',textTransform:'capitalize' as const}}>{u.role}{u.heures?` · ${u.heures}h/sem`:''}</div>
                    </div>
                    <div style={{width:20,height:20,borderRadius:'50%',border:`2px solid ${isInPlanning?G:BD}`,background:isInPlanning?G:'#fff',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                      {isInPlanning&&<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{display:'flex',gap:10,borderTop:`1px solid ${BD}`,paddingTop:16}}>
              <a href="/utilisateurs" style={{flex:1,padding:'10px',border:`1px solid ${BD}`,borderRadius:8,background:'#fff',fontSize:13,cursor:'pointer',color:'#555',textDecoration:'none',textAlign:'center' as const,fontWeight:500}}>
                + Créer un utilisateur
              </a>
              <button onClick={()=>setShowAddMemberModal(false)}
                style={{flex:1,padding:'10px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

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

            {/* Lignes ouvriers mois */}
            {ouvriersTries.map((o,oi)=>{
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
              <button onClick={()=>setModalTab('shift')}
                style={{padding:'8px 16px',background:'none',border:'none',borderBottom:modalTab==='shift'?`2px solid ${G}`:'2px solid transparent',fontSize:13,fontWeight:600,color:modalTab==='shift'?G:'#888',cursor:'pointer'}}>Shift</button>
              <button onClick={()=>setModalTab('absence')}
                style={{padding:'8px 16px',background:'none',border:'none',borderBottom:modalTab==='absence'?'2px solid #6b7280':'2px solid transparent',fontSize:13,fontWeight:600,color:modalTab==='absence'?'#374151':'#888',cursor:'pointer'}}>Absence</button>
            </div>

            {modalTab==='shift'&&<>
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

            </>
            }

            {/* Contenu Absence */}
            {modalTab==='absence'&&(
              <div>
                {/* Type d'absence */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Durée</div>
                  <div style={{display:'flex',gap:8,marginBottom:12}}>
                    {([['journee','Toute la journée'],['demi','Demi-journée'],['perso','Personnaliser']] as const).map(([val,label])=>(
                      <button key={val} onClick={()=>setAbsenceType(val)}
                        style={{padding:'8px 14px',borderRadius:8,border:`1px solid ${absenceType===val?'#6b7280':BD}`,background:absenceType===val?'#f3f4f6':'#fff',color:absenceType===val?'#374151':'#555',fontSize:13,fontWeight:absenceType===val?600:400,cursor:'pointer'}}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {absenceType==='perso'&&(
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:8}}>
                      <div>
                        <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Début</label>
                        <input type="time" value={absenceForm.startTime} onChange={e=>setAbsenceForm(f=>({...f,startTime:e.target.value}))}
                          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                      </div>
                      <div>
                        <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:4}}>Fin</label>
                        <input type="time" value={absenceForm.endTime} onChange={e=>setAbsenceForm(f=>({...f,endTime:e.target.value}))}
                          style={{width:'100%',padding:'8px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const}}/>
                      </div>
                      <div style={{gridColumn:'1/-1',fontSize:11,color:'#888',background:'#f9fafb',padding:'6px 10px',borderRadius:6}}>
                        Durée : <strong style={{color:'#111'}}>{calcDuree(absenceForm.startTime,absenceForm.endTime,0)}</strong>
                      </div>
                    </div>
                  )}
                  {absenceType==='journee'&&(
                    <div style={{fontSize:12,color:'#888',background:'#f9fafb',padding:'6px 10px',borderRadius:6,marginTop:8}}>
                      Nombre d'heures : <strong style={{color:'#111'}}>8h</strong>
                    </div>
                  )}
                  {absenceType==='demi'&&(
                    <div style={{fontSize:12,color:'#888',background:'#f9fafb',padding:'6px 10px',borderRadius:6,marginTop:8}}>
                      Nombre d'heures : <strong style={{color:'#111'}}>4h</strong>
                    </div>
                  )}
                </div>
                {/* Notes absence */}
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:12,fontWeight:500,color:'#555',display:'block',marginBottom:5}}>Notes</label>
                  <textarea value={absenceForm.notes} onChange={e=>setAbsenceForm(f=>({...f,notes:e.target.value}))}
                    placeholder="Rédiger une description..."
                    rows={3}
                    style={{width:'100%',padding:'9px 12px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',color:'#111',boxSizing:'border-box' as const,resize:'vertical' as const,fontFamily:'system-ui'}}/>
                </div>
                {/* Fichiers absence */}
                <div style={{marginBottom:16}}>
                  <div style={{border:`2px dashed ${BD}`,borderRadius:10,padding:'16px',textAlign:'center' as const,background:'#f9fafb',cursor:'pointer'}}
                    onClick={()=>{const i=document.createElement('input');i.type='file';i.multiple=true;i.accept='image/*,.pdf,.doc,.docx';i.click()}}>
                    <div style={{fontSize:16,marginBottom:4}}>☁️</div>
                    <div style={{fontSize:13,fontWeight:500,color:'#555'}}>Ajouter des photos ou documents</div>
                    <div style={{fontSize:11,color:'#aaa',marginTop:2}}>Limite de 6 fichiers · Max 10 MB</div>
                  </div>
                </div>
                {/* Répétition absence */}
                <div style={{marginBottom:16}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.04em',marginBottom:8}}>Répéter l'absence</div>
                  <div style={{display:'flex',gap:4,marginBottom:8}}>
                    {([['lun','L'],['mar','M'],['mer','M'],['jeu','J'],['ven','V'],['sam','S'],['dim','D']] as [string,string][]).map(([key,label])=>(
                      <button key={key} onClick={()=>setRepeatDays((d:string[])=>d.includes(key)?d.length>1?d.filter((x:string)=>x!==key):d:[...d,key])}
                        style={{width:34,height:34,borderRadius:'50%',border:`1px solid ${repeatDays.includes(key)?'#1D9E75':BD}`,background:repeatDays.includes(key)?'#1D9E75':'#fff',color:repeatDays.includes(key)?'#fff':'#555',fontSize:12,fontWeight:600,cursor:'pointer'}}>
                        {label}
                      </button>
                    ))}
                  </div>
                  <button onClick={()=>repeatDays.length===7?setRepeatDays([]):setRepeatDays(['lun','mar','mer','jeu','ven','sam','dim'])}
                    style={{fontSize:12,color:'#1D9E75',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline',marginRight:12}}>
                    {repeatDays.length===7?'Tout désélectionner':'Tout sélectionner'}
                  </button>
                  <button onClick={()=>setShowRepeatModal(true)}
                    style={{fontSize:12,color:'#555',background:'none',border:'none',cursor:'pointer',padding:0,textDecoration:'underline'}}>
                    🔄 Personnaliser la répétition
                  </button>
                </div>
              </div>
            )}

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
              {modalTab==='shift'
                ?<button onClick={saveShift} disabled={!(form.devisLabel||form.posteLabel||form.label).trim()}
                  style={{flex:2,padding:11,background:(form.devisLabel||form.posteLabel||form.label).trim()?G:'#e5e7eb',color:(form.devisLabel||form.posteLabel||form.label).trim()?'#fff':'#aaa',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  {editShift.shift ? 'Enregistrer' : '+ Créer le shift'}
                </button>
                :<button onClick={saveAbsence}
                  style={{flex:2,padding:11,background:'#6b7280',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:700,cursor:'pointer'}}>
                  {editShift.shift ? 'Enregistrer' : '+ Créer une absence'}
                </button>
              }
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

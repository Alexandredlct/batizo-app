'use client'
import { useState, useEffect, useRef } from 'react'

const G = '#1D9E75', BD = '#e5e7eb'

// Calcul jours fériés français
const getEasterDate = (year: number) => {
  const a=year%19,b=Math.floor(year/100),c=year%100
  const d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25)
  const g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30
  const i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7
  const m=Math.floor((a+11*h+22*l)/451)
  const month=Math.floor((h+l-7*m+114)/31)
  const day=((h+l-7*m+114)%31)+1
  return new Date(year,month-1,day)
}

const getFrenchHolidays = (year: number): Record<string,string> => {
  const easter = getEasterDate(year)
  const add = (d: Date, days: number) => { const r=new Date(d); r.setDate(r.getDate()+days); return r }
  const fmt = (d: Date) => `${d.getMonth()+1}-${d.getDate()}`
  return {
    '1-1': "Jour de l'an",
    [fmt(add(easter,1))]: 'Lundi de Pâques',
    '5-1': 'Fête du Travail',
    '5-8': 'Victoire 1945',
    [fmt(add(easter,39))]: 'Ascension',
    [fmt(add(easter,50))]: 'Lundi de Pentecôte',
    '7-14': 'Fête nationale',
    '8-15': 'Assomption',
    '11-1': 'Toussaint',
    '11-11': 'Armistice 1918',
    '12-25': 'Noël',
  }
}

const getHolidayName = (d: Date) => {
  const holidays = getFrenchHolidays(d.getFullYear())
  const key = `${d.getMonth()+1}-${d.getDate()}`
  return holidays[key] || null
}

const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
const JOURS_FR = ['Lu','Ma','Me','Je','Ve','Sa','Di']

// Numéro de semaine ISO 8601
const getWeekNumber = (d: Date) => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

// Lundi de la semaine contenant une date
const getMondayOfWeek = (d: Date) => {
  const day = d.getDay() || 7
  const monday = new Date(d)
  monday.setDate(d.getDate() - day + 1)
  monday.setHours(0,0,0,0)
  return monday
}

// Générer les semaines du mois (grille calendrier)
const getCalendarWeeks = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month+1, 0)
  const monday = getMondayOfWeek(firstDay)
  const weeks: Date[][] = []
  let current = new Date(monday)
  while(current <= lastDay || weeks.length < 4) {
    const week: Date[] = []
    for(let i=0; i<7; i++) {
      week.push(new Date(current))
      current.setDate(current.getDate()+1)
    }
    weeks.push(week)
    if(current > lastDay && weeks.length >= 4) break
  }
  return weeks
}

interface Props {
  weekOffset: number
  monthOffset: number
  view: 'semaine' | 'mois'
  onWeekChange: (offset: number) => void
  onMonthChange: (offset: number) => void
}

export default function DatePicker({ weekOffset, monthOffset, view, onWeekChange, onMonthChange }: Props) {
  const [open, setOpen] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth())
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear())
  const ref = useRef<HTMLDivElement>(null)

  // Fermer au clic dehors
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Semaine courante affichée
  const now = new Date()
  const currentMonday = getMondayOfWeek(now)
  const displayMonday = new Date(currentMonday)
  displayMonday.setDate(currentMonday.getDate() + weekOffset * 7)
  const displaySunday = new Date(displayMonday)
  displaySunday.setDate(displayMonday.getDate() + 6)
  const weekNum = getWeekNumber(displayMonday)

  // Label bouton
  const fmt = (d: Date) => d.toLocaleDateString('fr-FR', {day:'numeric', month:'short'})
  const fmtMois = (d: Date) => d.toLocaleDateString('fr-FR', {month:'long', year:'numeric'})

  const buttonLabel = view === 'semaine'
    ? `${fmt(displayMonday)} – ${fmt(displaySunday)}`
    : fmtMois(new Date(now.getFullYear(), now.getMonth()+monthOffset, 1))

  // Clic sur un jour → aller à la semaine contenant ce jour
  const handleDayClick = (d: Date) => {
    const monday = getMondayOfWeek(d)
    const diff = Math.round((monday.getTime() - currentMonday.getTime()) / (7*86400000))
    onWeekChange(diff)
    setOpen(false)
  }

  // Clic sur numéro de semaine → aller à cette semaine
  const handleWeekClick = (d: Date) => {
    handleDayClick(d)
  }

  // Semaine active dans le calendrier
  const isActiveWeek = (d: Date) => {
    const monday = getMondayOfWeek(d)
    return monday.toDateString() === displayMonday.toDateString()
  }

  const weeks = getCalendarWeeks(pickerYear, pickerMonth)

  return (
    <div ref={ref} style={{position:'relative',display:'inline-block'}}>
      {/* Bouton sélecteur */}
      <button onClick={()=>setOpen(o=>!o)}
        style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px',border:`1px solid ${BD}`,borderRadius:7,background:'#fff',fontSize:13,fontWeight:600,color:'#111',cursor:'pointer',transition:'background 0.15s'}}
        onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background='#f3f4f6'}
        onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='#fff'}>
        {buttonLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {/* Indicateur semaine */}
      {view==='semaine'&&(
        <span style={{marginLeft:8,fontSize:12,color:'#888',fontWeight:500,background:'#f3f4f6',padding:'3px 8px',borderRadius:6}}>
          Semaine {weekNum}
        </span>
      )}

      {/* Popup calendrier - Vue Semaine */}
      {open && view==='semaine'&&(
        <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:200,padding:16,minWidth:280}}>
          {/* Header mois */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <button onClick={()=>{
              const d = new Date(pickerYear, pickerMonth-1, 1)
              setPickerMonth(d.getMonth()); setPickerYear(d.getFullYear())
            }} style={{width:28,height:28,border:`1px solid ${BD}`,borderRadius:6,background:'#fff',cursor:'pointer',fontSize:14,color:'#333',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <span style={{fontSize:13,fontWeight:700,color:'#111',textTransform:'capitalize'}}>
              {MOIS_FR[pickerMonth]} {pickerYear}
            </span>
            <button onClick={()=>{
              const d = new Date(pickerYear, pickerMonth+1, 1)
              setPickerMonth(d.getMonth()); setPickerYear(d.getFullYear())
            }} style={{width:28,height:28,border:`1px solid ${BD}`,borderRadius:6,background:'#fff',cursor:'pointer',fontSize:14,color:'#333',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </div>

          {/* En-têtes jours */}
          <div style={{display:'grid',gridTemplateColumns:'32px repeat(7,1fr)',gap:2,marginBottom:4}}>
            <div/>
            {JOURS_FR.map(j=>(
              <div key={j} style={{textAlign:'center',fontSize:11,fontWeight:600,color:'#888'}}>{j}</div>
            ))}
          </div>

          {/* Semaines */}
          {weeks.map((week, wi) => {
            const active = isActiveWeek(week[0])
            return(
              <div key={wi} style={{display:'grid',gridTemplateColumns:'32px repeat(7,1fr)',gap:2,marginBottom:2}}>
                {/* Numéro de semaine */}
                <div onClick={()=>handleWeekClick(week[0])}
                  style={{display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:active?G:'#aaa',cursor:'pointer',background:active?'#f0fdf4':'transparent',borderRadius:4}}>
                  S{getWeekNumber(week[0])}
                </div>
                {/* Jours */}
                {week.map((d,di)=>{
                  const isCurrentMonth = d.getMonth()===pickerMonth
                  const isToday = d.toDateString()===new Date().toDateString()
                  const inActiveWeek = active
                  return(
                    <div key={di} onClick={()=>handleDayClick(d)}
                      style={{
                        width:32,height:32,display:'flex',alignItems:'center',justifyContent:'center',
                        fontSize:12,fontWeight:isToday?700:400,
                        borderRadius:6,cursor:'pointer',
                        background:inActiveWeek?'#dbeafe':isToday?'#f0fdf4':'transparent',
                        color:!isCurrentMonth?'#ccc':isToday?G:inActiveWeek?'#1e40af':'#111',
                        transition:'background 0.1s'
                      }}
                      onMouseEnter={e=>{if(!inActiveWeek)(e.currentTarget as HTMLDivElement).style.background='#f3f4f6'}}
                      onMouseLeave={e=>{if(!inActiveWeek)(e.currentTarget as HTMLDivElement).style.background='transparent'}}>
                      {d.getDate()}{getHolidayName(d)?<span title={getHolidayName(d)||''} style={{fontSize:8,marginLeft:1}}>🎉</span>:null}
                    </div>
                  )
                })}
              </div>
            )
          })}

          {/* Lien Aujourd'hui */}
          <div style={{marginTop:10,textAlign:'center',borderTop:`1px solid ${BD}`,paddingTop:10}}>
            <button onClick={()=>{onWeekChange(0);setOpen(false)}}
              style={{fontSize:12,color:G,background:'none',border:'none',cursor:'pointer',fontWeight:600,textDecoration:'underline'}}>
              Aujourd'hui
            </button>
          </div>
        </div>
      )}

      {/* Popup grille mois - Vue Mois */}
      {open && view==='mois'&&(
        <div style={{position:'absolute',top:'calc(100% + 8px)',left:0,background:'#fff',border:`1px solid ${BD}`,borderRadius:12,boxShadow:'0 8px 32px rgba(0,0,0,0.15)',zIndex:200,padding:16,minWidth:240}}>
          {/* Header année */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <button onClick={()=>setPickerYear(y=>y-1)}
              style={{width:28,height:28,border:`1px solid ${BD}`,borderRadius:6,background:'#fff',cursor:'pointer',fontSize:14,color:'#333',display:'flex',alignItems:'center',justifyContent:'center'}}>‹</button>
            <span style={{fontSize:13,fontWeight:700,color:'#111'}}>{pickerYear}</span>
            <button onClick={()=>setPickerYear(y=>y+1)}
              style={{width:28,height:28,border:`1px solid ${BD}`,borderRadius:6,background:'#fff',cursor:'pointer',fontSize:14,color:'#333',display:'flex',alignItems:'center',justifyContent:'center'}}>›</button>
          </div>
          {/* Grille 12 mois */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}}>
            {MOIS_FR.map((m,i)=>{
              const now2 = new Date()
              const targetOffset = (pickerYear-now2.getFullYear())*12 + i - now2.getMonth()
              const isActive = targetOffset===monthOffset
              return(
                <button key={i} onClick={()=>{onMonthChange(targetOffset);setOpen(false)}}
                  style={{padding:'8px 4px',borderRadius:8,border:`1px solid ${isActive?G:BD}`,background:isActive?G:'#fff',color:isActive?'#fff':'#333',fontSize:12,fontWeight:isActive?700:400,cursor:'pointer',transition:'all 0.1s'}}>
                  {m.slice(0,3)}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

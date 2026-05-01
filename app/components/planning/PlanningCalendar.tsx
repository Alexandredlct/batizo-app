'use client'
import { useEffect, useRef } from 'react'
import { createCalendar, viewWeek, viewMonthGrid, viewDay } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'

export default function PlanningCalendar() {
  const calendarEl = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!calendarEl.current) return

    const calendar = createCalendar({
      target: calendarEl.current,
      views: [viewWeek, viewMonthGrid, viewDay],
      defaultView: viewWeek.name,
      events: [],
      locale: 'fr-FR',
      firstDayOfWeek: 1,
      dayBoundaries: {
        start: '07:00',
        end: '20:00',
      },
    })

    calendar.render()

    return () => {
      calendar.destroy?.()
    }
  }, [])

  return (
    <div ref={calendarEl} style={{ height: 'calc(100vh - 120px)' }} />
  )
}

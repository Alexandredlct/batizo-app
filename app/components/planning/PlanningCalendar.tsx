'use client'
import { useMemo } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewWeek, createViewMonthGrid, createViewDay } from '@schedule-x/calendar'
import '@schedule-x/theme-default/dist/index.css'

export default function PlanningCalendar() {
  const calendar = useCalendarApp({
    views: [createViewWeek(), createViewMonthGrid(), createViewDay()],
    defaultView: 'week',
    events: [],
    locale: 'fr-FR',
    firstDayOfWeek: 1,
    dayBoundaries: {
      start: '07:00',
      end: '20:00',
    },
  })

  return (
    <div style={{ height: 'calc(100vh - 140px)' }}>
      <ScheduleXCalendar calendarApp={calendar} />
    </div>
  )
}

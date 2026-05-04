'use client'
// Composant simple - le drop est géré par ResourceCalendar
interface Props {
  userId: string
  date: string
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
  dragOverAction?: 'move' | 'copy' | null
  onDragOverZone?: (userId: string, date: string, action: 'move' | 'copy' | null) => void
}

const G = '#1D9E75'

export function DroppableCell({ userId, date, children, style, onClick, dragOverAction, onDragOverZone }: Props) {
  const isOver = dragOverAction !== null && dragOverAction !== undefined

  return (
    <div
      data-cell="true"
      data-userid={userId}
      data-date={date}
      style={{ position: 'relative', ...style }}
      onClick={onClick}
    >
      {children}

      {isOver && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', zIndex: 20,
          borderRadius: 6, overflow: 'hidden',
          border: `2px solid ${dragOverAction === 'move' ? G : '#3b82f6'}`,
          pointerEvents: 'none',
        }}>
          <div style={{
            flex: 1,
            background: dragOverAction === 'move' ? '#bbf7d0' : '#f0fdf4',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#166534',
            borderRight: '1px solid #86efac',
          }}>
            📦 Déplacer
          </div>
          <div style={{
            flex: 1,
            background: dragOverAction === 'copy' ? '#bfdbfe' : '#eff6ff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, color: '#1e40af',
          }}>
            📋 Copier
          </div>
        </div>
      )}
    </div>
  )
}

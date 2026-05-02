'use client'
import { useDroppable } from '@dnd-kit/core'
import { useState } from 'react'

interface Props {
  userId: string
  date: string
  onDrop: (shiftId: string, userId: string, date: string, action: 'move'|'copy') => void
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
  isActive?: boolean
}

const G = '#1D9E75'

export function DroppableCell({ userId, date, onDrop, children, style, onClick, isActive }: Props) {
  const cellId = `${userId}__${date}`
  const [hoveredZone, setHoveredZone] = useState<'move'|'copy'|null>(null)

  const { isOver, setNodeRef } = useDroppable({
    id: cellId,
    data: { userId, date }
  })

  return (
    <div
      ref={setNodeRef}
      style={{ position: 'relative', ...style }}
      onClick={onClick}
    >
      {children}

      {/* Zones Déplacer/Copier visibles pendant le survol drag */}
      {isOver && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', zIndex: 50,
          borderRadius: 6, overflow: 'hidden',
          border: `2px solid ${G}`,
        }}
          onClick={e => e.stopPropagation()}
        >
          {/* Zone Déplacer (haut) */}
          <div
            style={{
              flex: 1,
              background: hoveredZone === 'move' ? '#bbf7d0' : '#f0fdf4',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#166534',
              cursor: 'copy', borderBottom: '1px solid #86efac',
              transition: 'background 0.1s'
            }}
            onMouseEnter={() => setHoveredZone('move')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            📦 Déplacer
          </div>

          {/* Zone Copier (bas) */}
          <div
            style={{
              flex: 1,
              background: hoveredZone === 'copy' ? '#bfdbfe' : '#eff6ff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: '#1e40af',
              cursor: 'copy',
              transition: 'background 0.1s'
            }}
            onMouseEnter={() => setHoveredZone('copy')}
            onMouseLeave={() => setHoveredZone(null)}
          >
            📋 Copier
          </div>
        </div>
      )}
    </div>
  )
}

// Hook pour savoir quelle zone est survolée
export function useDropZone(cellId: string) {
  const move = useDroppable({ id: cellId + '__move', data: { action: 'move' } })
  const copy = useDroppable({ id: cellId + '__copy', data: { action: 'copy' } })
  return { move, copy }
}

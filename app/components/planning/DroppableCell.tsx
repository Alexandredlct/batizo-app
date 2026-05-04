'use client'
import { useDroppable } from '@dnd-kit/core'

interface Props {
  userId: string
  date: string
  children: React.ReactNode
  style?: React.CSSProperties
  onClick?: () => void
}

const G = '#1D9E75'

export function DroppableCell({ userId, date, children, style, onClick }: Props) {
  const moveId = `${userId}__${date}__move`
  const copyId = `${userId}__${date}__copy`

  const { isOver: isOverMove, setNodeRef: setMoveRef } = useDroppable({ id: moveId, data: { userId, date, action: 'move' } })
  const { isOver: isOverCopy, setNodeRef: setCopyRef } = useDroppable({ id: copyId, data: { userId, date, action: 'copy' } })

  const isOverAny = isOverMove || isOverCopy

  return (
    <div style={{ position: 'relative', ...style }} onClick={onClick}>
      {children}

      {/* Zones DnD overlay - toujours présentes pour le drop, visibles seulement au survol */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        pointerEvents: 'none', // laisse passer les events normaux
        zIndex: 10,
      }}>
        {/* Zone Déplacer - moitié gauche */}
        <div
          ref={setMoveRef}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isOverMove ? '#bbf7d0' : isOverAny ? '#f0fdf4' : 'transparent',
            borderRadius: '6px 0 0 6px',
            fontSize: 11, fontWeight: 700, color: '#166534',
            opacity: isOverAny ? 1 : 0,
            transition: 'all 0.1s',
            pointerEvents: 'all',
            border: isOverMove ? `2px solid ${G}` : isOverAny ? `1px dashed ${G}` : 'none',
          }}
        >
          {isOverAny && '📦 Déplacer'}
        </div>

        {/* Zone Copier - moitié droite */}
        <div
          ref={setCopyRef}
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isOverCopy ? '#bfdbfe' : isOverAny ? '#eff6ff' : 'transparent',
            borderRadius: '0 6px 6px 0',
            fontSize: 11, fontWeight: 700, color: '#1e40af',
            opacity: isOverAny ? 1 : 0,
            transition: 'all 0.1s',
            pointerEvents: 'all',
            border: isOverCopy ? '2px solid #3b82f6' : isOverAny ? '1px dashed #93c5fd' : 'none',
          }}
        >
          {isOverAny && '📋 Copier'}
        </div>
      </div>
    </div>
  )
}

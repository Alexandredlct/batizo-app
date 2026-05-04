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

function DropZone({ id, label, color, hoverColor, textColor, borderStyle }: {
  id: string, label: string, color: string, hoverColor: string, textColor: string, borderStyle?: string
}) {
  const { isOver, setNodeRef } = useDroppable({ id, data: { droppableId: id } })
  return (
    <div ref={setNodeRef} style={{
      flex: 1,
      background: isOver ? hoverColor : color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 700, color: textColor,
      borderBottom: borderStyle,
      transition: 'background 0.1s',
    }}>
      {label}
    </div>
  )
}

export function DroppableCell({ userId, date, children, style, onClick }: Props) {
  const cellId = `${userId}__${date}`
  const { isOver: isOverCell, setNodeRef } = useDroppable({
    id: cellId,
    data: { userId, date }
  })

  return (
    <div ref={setNodeRef} style={{ position: 'relative', ...style }} onClick={onClick}>
      {children}
      {isOverCell && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          display: 'flex', flexDirection: 'column', zIndex: 50,
          borderRadius: 6, overflow: 'hidden', border: `2px solid ${G}`,
        }}
          onClick={e => e.stopPropagation()}>
          <DropZone
            id={`${cellId}__move`}
            label="📦 Déplacer"
            color="#f0fdf4" hoverColor="#bbf7d0" textColor="#166534"
            borderStyle="1px solid #86efac"
          />
          <DropZone
            id={`${cellId}__copy`}
            label="📋 Copier"
            color="#eff6ff" hoverColor="#bfdbfe" textColor="#1e40af"
          />
        </div>
      )}
    </div>
  )
}

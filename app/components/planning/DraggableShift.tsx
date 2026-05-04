'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  shift: any
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function DraggableShift({ shift, children, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: { shift }
  })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        userSelect: 'none' as const,
      }}
    >
      {/* Handle drag - barre en haut */}
      <div
        {...listeners}
        {...attributes}
        style={{
          height: 6,
          background: 'rgba(255,255,255,0.3)',
          borderRadius: '6px 6px 0 0',
          cursor: isDragging ? 'grabbing' : 'grab',
          touchAction: 'none',
        }}
      />
      {/* Contenu cliquable */}
      <div onClick={onClick} style={{cursor:'pointer'}}>
        {children}
      </div>
    </div>
  )
}

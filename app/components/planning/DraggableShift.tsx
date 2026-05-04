'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  shift: any
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
  onHover?: (id: string | null, x: number, y: number) => void
}

export function DraggableShift({ shift, children, onClick, onHover }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: { shift }
  })

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none' as const,
        position: 'relative',
        zIndex: isDragging ? 999 : 1,
      }}
      onClick={onClick}
      onMouseEnter={e => onHover?.(shift.id, e.clientX, e.clientY)}
      onMouseLeave={() => onHover?.(null, 0, 0)}
    >
      {children}
    </div>
  )
}

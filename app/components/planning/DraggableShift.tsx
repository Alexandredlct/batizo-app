'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  shift: any
  children: React.ReactNode
  onClickShift?: (e: React.MouseEvent) => void
  onHover?: (id: string | null, x: number, y: number) => void
}

export function DraggableShift({ shift, children, onClickShift, onHover }: Props) {
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
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none' as const,
        marginBottom: 2,
      }}
      onMouseEnter={e => onHover?.(shift.id, e.clientX, e.clientY)}
      onMouseLeave={() => onHover?.(null, 0, 0)}
      onClick={e => { e.stopPropagation(); onClickShift?.(e) }}
    >
      {children}
    </div>
  )
}

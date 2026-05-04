'use client'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  shift: any
  children: React.ReactNode
}

export function DraggableShift({ shift, children }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: shift.id,
    data: { shift }
  })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none' as const,
      }}
    >
      {/* Handle de drag séparé - ne bloque pas le clic sur l'enfant */}
      <div
        {...listeners}
        style={{position:'absolute',top:0,left:0,right:0,bottom:0,zIndex:1}}
      />
      <div style={{position:'relative',zIndex:2}}>
        {children}
      </div>
    </div>
  )
}

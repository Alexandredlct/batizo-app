'use client'
// Composant simple - le drag est géré par ResourceCalendar via onMouseDown
interface Props {
  shift: any
  children: React.ReactNode
  onMouseDown?: (e: React.MouseEvent, shift: any) => void
  onClickShift?: (e: React.MouseEvent) => void
  onHover?: (id: string | null, x: number, y: number) => void
  isDragging?: boolean
}

export function DraggableShift({ shift, children, onMouseDown, onClickShift, onHover, isDragging }: Props) {
  return (
    <div
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: 'grab',
        userSelect: 'none' as const,
        marginBottom: 2,
        position: 'relative',
      }}
      onMouseDown={e => onMouseDown?.(e, shift)}
      onMouseEnter={e => onHover?.(shift.id, e.clientX, e.clientY)}
      onMouseLeave={() => onHover?.(null, 0, 0)}
      onClick={e => { e.stopPropagation(); onClickShift?.(e) }}
    >
      {children}
    </div>
  )
}

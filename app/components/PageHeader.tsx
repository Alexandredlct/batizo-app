'use client'
import SearchBar from './SearchBar'
import NotifBell from './NotifBell'

const G='#1D9E75', BD='#e5e7eb'

export interface HeaderAction {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary'
  icon?: React.ReactNode
  disabled?: boolean
}

interface PageHeaderProps {
  title: string
  actions?: HeaderAction[]
}

export default function PageHeader({ title, actions=[] }: PageHeaderProps) {
  return (
    <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
      <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>{title}</div>
      <SearchBar/>
      <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
        {actions.map((a,i)=>(
          <button key={i} onClick={a.disabled?undefined:a.onClick} disabled={a.disabled}
            style={{
              height:40,padding:'0 16px',borderRadius:8,fontSize:13,fontWeight:600,
              cursor:a.disabled?'not-allowed':'pointer',
              display:'flex',alignItems:'center',gap:6,
              border:a.variant==='primary'?'none':`1px solid ${BD}`,
              background:a.disabled?'#e5e7eb':a.variant==='primary'?G:'#fff',
              color:a.disabled?'#aaa':a.variant==='primary'?'#fff':'#333',
              transition:'opacity 0.15s',flexShrink:0,whiteSpace:'nowrap' as const,
            }}
            onMouseEnter={e=>{if(!a.disabled)(e.currentTarget as HTMLButtonElement).style.opacity='0.85'}}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.opacity='1'}>
            {a.icon&&<span style={{display:'flex',alignItems:'center'}}>{a.icon}</span>}
            {a.label}
          </button>
        ))}
        <NotifBell/>
      </div>
    </div>
  )
}

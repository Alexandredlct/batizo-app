'use client'
import { useState, useEffect } from 'react'
import NotificationsPanel from './NotificationsPanel'
import { getUnreadCount } from '../lib/notificationsStore'

const G = '#1D9E75', BD = '#e5e7eb'

export default function NotifBell() {
  const [show, setShow] = useState(false)
  const [unread, setUnread] = useState(0)

  useEffect(()=>{
    setUnread(getUnreadCount())
    const sync=()=>setUnread(getUnreadCount())
    window.addEventListener('batizo_notifs_updated', sync)
    return ()=>window.removeEventListener('batizo_notifs_updated', sync)
  },[])

  return (
    <>
      <button onClick={()=>setShow(true)} style={{position:'relative',background:'none',border:'none',cursor:'pointer',fontSize:18,padding:'4px 8px',color:'#555',display:'flex',alignItems:'center'}}>
        🔔
        {unread>0&&(
          <span style={{position:'absolute',top:-2,right:0,background:'#E24B4A',color:'#fff',fontSize:9,fontWeight:700,padding:'1px 4px',borderRadius:10,minWidth:16,textAlign:'center' as const,lineHeight:'14px'}}>
            {unread>9?'9+':unread}
          </span>
        )}
      </button>
      {show&&<NotificationsPanel onClose={()=>setShow(false)}/>}
    </>
  )
}

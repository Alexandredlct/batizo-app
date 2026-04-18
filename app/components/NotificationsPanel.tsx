'use client'
import { useState, useEffect } from 'react'
import {
  getNotifications, saveNotifications, markAllRead,
  toggleRead, deleteNotif, formatDate, groupByDate,
  type Notification, type NotifType
} from '../lib/notificationsStore'

const G='#1D9E75', BD='#e5e7eb', RD='#E24B4A'

interface Props {
  onClose: () => void
  onOpenClient?: (id: string) => void
}

export default function NotificationsPanel({ onClose, onOpenClient }: Props) {
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [tab, setTab] = useState<'tous'|'mention'|'attribution'>('tous')
  const [nonLuOnly, setNonLuOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [hoverId, setHoverId] = useState<string|null>(null)
  const [showDots, setShowDots] = useState(false)

  const load = () => setNotifs(getNotifications())

  useEffect(() => {
    load()
    window.addEventListener('batizo_notifs_updated', load)
    return () => window.removeEventListener('batizo_notifs_updated', load)
  }, [])

  const filtered = notifs.filter(n => {
    if (tab === 'mention' && n.type !== 'mention') return false
    if (tab === 'attribution' && n.type !== 'attribution') return false
    if (nonLuOnly && n.lu) return false
    if (search && !`${n.auteur} ${n.contenu} ${n.refLabel}`.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const groups = groupByDate(filtered)
  const groupOrder = ["Aujourd'hui", 'Hier', 'Cette semaine', 'Plus ancien']

  return (
    <>
      <div onClick={onClose} style={{position:'fixed',top:0,left:0,width:'100%',height:'100%',background:'rgba(0,0,0,0.3)',zIndex:399}}/>
      <div style={{position:'fixed',top:0,right:0,width:420,height:'100vh',background:'#fff',boxShadow:'-4px 0 24px rgba(0,0,0,0.12)',zIndex:400,display:'flex',flexDirection:'column',overflow:'hidden',animation:'slideIn 0.25s ease-out'}}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Header */}
        <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,flexShrink:0}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <div style={{fontSize:15,fontWeight:700,color:'#111'}}>Notifications</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <a href="/mes-informations#notifications" title="Préférences" style={{fontSize:16,cursor:'pointer',textDecoration:'none'}}>⚙️</a>
              <div style={{position:'relative'}}>
                <button onClick={()=>setShowDots(!showDots)} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:'#888',padding:'0 4px'}}>···</button>
                {showDots&&(
                  <div style={{position:'absolute',right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 12px rgba(0,0,0,0.1)',zIndex:10,minWidth:180}}>
                    <div onClick={()=>{markAllRead();setShowDots(false)}} style={{padding:'10px 14px',fontSize:13,cursor:'pointer',color:'#111'}}
                      onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                      onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=''}>
                      ✓ Tout marquer comme lu
                    </div>
                  </div>
                )}
              </div>
              <button onClick={onClose} style={{width:28,height:28,borderRadius:'50%',border:`1px solid ${BD}`,background:'#f9fafb',cursor:'pointer',fontSize:14,color:'#888',display:'flex',alignItems:'center',justifyContent:'center'}}>×</button>
            </div>
          </div>

          {/* Recherche */}
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            style={{width:'100%',padding:'7px 10px',border:`1px solid ${BD}`,borderRadius:7,fontSize:13,outline:'none',boxSizing:'border-box' as const,marginBottom:10}}/>

          {/* Onglets */}
          <div style={{display:'flex',gap:4,marginBottom:8}}>
            {[['tous','Tous'],['mention','@Mentions'],['attribution','Attribués']].map(([v,l])=>(
              <button key={v} onClick={()=>setTab(v as any)}
                style={{padding:'4px 10px',borderRadius:12,border:`1px solid ${tab===v?G:BD}`,background:tab===v?'#f0fdf4':'#fff',color:tab===v?G:'#888',fontSize:12,fontWeight:tab===v?600:400,cursor:'pointer'}}>
                {l}
              </button>
            ))}
            <label style={{display:'flex',alignItems:'center',gap:5,marginLeft:'auto',fontSize:12,cursor:'pointer',color:'#555'}}>
              <input type="checkbox" checked={nonLuOnly} onChange={e=>setNonLuOnly(e.target.checked)} style={{accentColor:G}}/>
              Non lu
            </label>
          </div>
        </div>

        {/* Liste */}
        <div style={{flex:1,overflowY:'auto'}}>
          {filtered.length===0?(
            <div style={{textAlign:'center' as const,padding:'40px 20px',color:'#888',fontSize:13}}>
              <div style={{fontSize:32,marginBottom:8}}>🔔</div>
              Aucune notification
            </div>
          ):(
            groupOrder.filter(g=>groups[g]?.length>0).map(group=>(
              <div key={group}>
                <div style={{padding:'8px 16px 4px',fontSize:11,fontWeight:700,color:'#888',textTransform:'uppercase' as const,letterSpacing:'0.05em',background:'#f9fafb',borderBottom:`1px solid ${BD}`}}>
                  {group}
                </div>
                {groups[group].map(n=>(
                  <div key={n.id}
                    onMouseEnter={()=>setHoverId(n.id)}
                    onMouseLeave={()=>setHoverId(null)}
                    style={{display:'flex',gap:10,padding:'12px 16px',borderBottom:`1px solid ${BD}`,background:n.lu?'#fff':'#f0f9ff',cursor:'pointer',position:'relative' as const,transition:'background 0.1s'}}>

                    {/* Point non lu */}
                    {!n.lu&&<div style={{position:'absolute',left:6,top:'50%',transform:'translateY(-50%)',width:6,height:6,borderRadius:'50%',background:'#2563eb'}}/>}

                    {/* Avatar */}
                    <div style={{width:36,height:36,borderRadius:'50%',background:n.auteurColor+'20',color:n.auteurColor,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,flexShrink:0}}>
                      {n.auteurInitiales}
                    </div>

                    {/* Contenu */}
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:'#111',lineHeight:1.4,marginBottom:3}}>
                        <strong>{n.auteur}</strong> {n.action}
                      </div>
                      {n.contenu&&<div style={{fontSize:12,color:'#555',background:'#f9fafb',padding:'4px 8px',borderRadius:5,marginBottom:4,lineHeight:1.4}}>{n.contenu}</div>}
                      {n.refLabel&&(
                        <div onClick={()=>n.refId&&onOpenClient&&onOpenClient(n.refId)}
                          style={{fontSize:11,color:'#2563eb',cursor:'pointer',fontWeight:500}}>
                          → {n.refLabel}
                        </div>
                      )}
                      <div style={{fontSize:11,color:'#aaa',marginTop:3}}>{formatDate(n.date)}</div>
                    </div>

                    {/* Actions au survol */}
                    {hoverId===n.id&&(
                      <div style={{display:'flex',gap:4,alignItems:'flex-start',flexShrink:0}}>
                        <button onClick={e=>{e.stopPropagation();toggleRead(n.id)}}
                          title={n.lu?'Marquer non lu':'Marquer lu'}
                          style={{width:28,height:28,borderRadius:6,border:`1px solid ${BD}`,background:'#fff',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',color:G}}>
                          {n.lu?'○':'✓'}
                        </button>
                        <button onClick={e=>{e.stopPropagation();deleteNotif(n.id)}}
                          title="Supprimer"
                          style={{width:28,height:28,borderRadius:6,border:`1px solid #fca5a5`,background:'#fff',cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',color:RD}}>
                          🗑
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

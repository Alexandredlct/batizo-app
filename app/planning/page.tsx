'use client'
import Sidebar from '../components/Sidebar'
import PageHeader from '../components/PageHeader'
import dynamic from 'next/dynamic'

const ResourceCalendar = dynamic(
  () => import('../components/planning/ResourceCalendar'),
  { ssr: false }
)

export default function PlanningPage() {
  return (
    <div style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>
      <Sidebar activePage="planning"/>
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <PageHeader title="Planning" actions={[]}/>
        <div style={{flex:1,overflowY:'auto',padding:24}}>
          <ResourceCalendar/>
        </div>
      </div>
    </div>
  )
}

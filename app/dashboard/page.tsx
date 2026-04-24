'use client'
import NouveauDevisModal from '../components/NouveauDevisModal'
import FicheClientPanel from '../components/FicheClientPanel'
import NotifBell from '../components/NotifBell'
import NouveauClientDrawer from '../components/NouveauClientDrawer'
import { getClients } from '../lib/clientsStore'
import SearchBar from '../components/SearchBar'
import Sidebar from '../components/Sidebar'
import React from 'react'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const G = '#1D9E75', AM = '#BA7517', RD = '#E24B4A', BD = '#e5e7eb'

const NavIcon = ({ id }: { id: string }) => {
  const icons: Record<string, React.ReactNode> = {
    dashboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
    devis: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    clients: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    bibliotheque: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{width:18,height:18}}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  }
  return icons[id] || <span>•</span>
}


function KpiCard({label,value,change,changeColor,valueColor,period,setPeriod,openId,setOpenId,cardId}:{
  label:string,value:string,change:string,changeColor:string,valueColor?:string,
  period:string,setPeriod:(v:string)=>void,openId:string|null,setOpenId:(v:string|null)=>void,cardId:string
}){
  const isOpen=openId===cardId
  const pLabel=(p:string)=>p==='mois'?'Ce mois-ci':p==='12mois'?'Mois dernier':p==='trimestre'?'Ce trimestre':p==='annee'?'Cette année':'Personnalisé'
  return(
    <div style={{background:'#fff',borderRadius:12,padding:16,border:'1px solid #e5e7eb',position:'relative' as const}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
        <div style={{fontSize:12,color:'#444',fontWeight:500}}>{label}</div>
        <div style={{position:'relative' as const}}>
          <button onClick={()=>setOpenId(isOpen?null:cardId)}
            style={{fontSize:10,color:'#555',background:'#f3f4f6',border:'none',borderRadius:4,padding:'2px 6px',cursor:'pointer'}}>
            {pLabel(period)} ▾
          </button>
          {isOpen&&(
            <div style={{position:'absolute' as const,right:0,top:'100%',background:'#fff',border:'1px solid #e5e7eb',borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:200,minWidth:160,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
              {[['mois','Ce mois-ci'],['12mois','Mois dernier'],['trimestre','Ce trimestre'],['annee','Cette année'],['custom','Personnalisé']].map(([v,l])=>(
                <div key={v} onClick={()=>{setPeriod(v);setOpenId(null)}}
                  style={{padding:'8px 12px',fontSize:12,cursor:'pointer',background:period===v?'#f0fdf4':'',color:period===v?'#1D9E75':'#333'}}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=period===v?'#f0fdf4':''}>
                  {l}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div style={{fontSize:20,fontWeight:700,color:valueColor||'#111',marginBottom:4}}>{value}</div>
      <div style={{fontSize:12,color:changeColor,fontWeight:500}}>{change}</div>
    </div>
  )
}

export default function DashboardPage() {
  const[showNouveauDevis,setShowNouveauDevis]=useState(false)
  const[ficheClient,setFicheClient]=useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [userMenu, setUserMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = '/login'
      else setUser(data.user)
    })
  }, [])

  const[prenomLocal,setPrenomLocal]=useState<string>(()=>{
    if(typeof window==='undefined') return ''
    return localStorage.getItem('batizo_prenom')||''
  })
  const prenom = prenomLocal||''
  const[margePeriode,setMargePeriode]=useState<string>(()=>{try{return 'mois'}catch(e){return 'mois'}})
  const[margeDebut,setMargeDebut]=useState('')
  const[margeFin,setMargeFin]=useState('')
  const[showMargePeriode,setShowMargePeriode]=useState(false)
  const[showMargeCustom,setShowMargeCustom]=useState(false)
  const[caMoisPeriode,setCaMoisPeriode]=useState('mois')
  const[caAnneePeriode,setCaAnneePeriode]=useState('annee')
  const[devisPeriode,setDevisPeriode]=useState('mois')
  const[facturesPeriode,setFacturesPeriode]=useState('mois')
  const[showCaMoisDD,setShowCaMoisDD]=useState(false)
  const[openKpiDD,setOpenKpiDD]=useState<string|null>(null)
  const[showNouveauClient,setShowNouveauClient]=useState(false)

  const[showCaAnneeDD,setShowCaAnneeDD]=useState(false)
  const[showDevisDD,setShowDevisDD]=useState(false)
  const[showFacturesDD,setShowFacturesDD]=useState(false)

  const margeStats = React.useMemo(()=>{
    try {
      const devisRaw = localStorage.getItem('batizo_devis')
      if (!devisRaw) return {marge:0, nbDevis:0, caTotal:0}
      const devisList: any[] = JSON.parse(devisRaw)
      const now = new Date()
      const getRange = (): [Date, Date] => {
        if (margePeriode==='mois') return [new Date(now.getFullYear(),now.getMonth(),1),new Date(now.getFullYear(),now.getMonth()+1,0)]
        if (margePeriode==='trimestre') { const q=Math.floor(now.getMonth()/3); return [new Date(now.getFullYear(),q*3,1),new Date(now.getFullYear(),q*3+3,0)] }
        if (margePeriode==='12mois') { const d=new Date(now); d.setFullYear(d.getFullYear()-1); return [d,now] }
        if (margePeriode==='custom'&&margeDebut&&margeFin) return [new Date(margeDebut),new Date(margeFin)]
        return [new Date(now.getFullYear(),0,1),new Date(now.getFullYear(),11,31)]
      }
      const [start,end] = getRange()
      const signed = devisList.filter((d:any)=>{
        if(!['signe','facture','finalise'].includes(d.statut||'')) return false
        const date = new Date(d.dateDevis||d.date||'')
        return !isNaN(date.getTime()) ? date>=start&&date<=end : true
      })
      let caTotal=0, margeTotal=0
      signed.forEach((devis:any)=>{
        (devis.lignes||[]).forEach((l:any)=>{
          if(!['materiau','mo','ouvrage'].includes(l.type)) return
          const ca=(l.qte||0)*(l.pu||0)
          const deb=(l.qte||0)*(l.debourse||l.pu*0.5||0)
          caTotal+=ca; margeTotal+=ca-deb
        })
      })
      return {marge:caTotal>0?Math.round((margeTotal/caTotal)*100):0, nbDevis:signed.length, caTotal:Math.round(caTotal)}
    } catch(e) { return {marge:0,nbDevis:0,caTotal:0} }
  },[margePeriode,margeDebut,margeFin])

  // Calculs dynamiques KPIs dashboard
  const dashboardStats = React.useMemo(()=>{
    try {
      const devisRaw = localStorage.getItem('batizo_devis')
      const devisList: any[] = devisRaw ? JSON.parse(devisRaw) : []
      const now = new Date()
      const moisDebut = new Date(now.getFullYear(), now.getMonth(), 1)
      const moisFin = new Date(now.getFullYear(), now.getMonth()+1, 0)
      const anneeDebut = new Date(now.getFullYear(), 0, 1)
      const moisPrecDebut = new Date(now.getFullYear(), now.getMonth()-1, 1)
      const moisPrecFin = new Date(now.getFullYear(), now.getMonth(), 0)
      const anneePrecDebut = new Date(now.getFullYear()-1, 0, 1)
      const anneePrecFin = new Date(now.getFullYear()-1, 11, 31)

      const calcCA = (list: any[], start: Date, end: Date) => {
        return list.filter((d:any) => {
          if(['refuse','archive'].includes(d.statut||'')) return false
          const date = new Date(d.dateDevis||d.date||'')
          return !isNaN(date.getTime()) && date>=start && date<=end
        }).reduce((s:number, d:any) => {
          return s + (d.lignes||[]).reduce((ls:number, l:any) => {
            if(!['materiau','mo','ouvrage'].includes(l.type)) return ls
            return ls + (l.qte||0)*(l.pu||0)
          }, 0)
        }, 0)
      }

      const caMois = calcCA(devisList, moisDebut, moisFin)
      const caMoisPrec = calcCA(devisList, moisPrecDebut, moisPrecFin)
      const caAnnee = calcCA(devisList, anneeDebut, new Date())
      const caAnneePrec = calcCA(devisList, anneePrecDebut, anneePrecFin)

      // Devis en attente (envoyés/brouillons actifs)
      const devisAttente = devisList.filter((d:any) => ['brouillon','en_attente'].includes(d.statut||'brouillon'))
      const caAttente = devisAttente.reduce((s:number, d:any) => {
        return s + (d.lignes||[]).reduce((ls:number, l:any) => {
          if(!['materiau','mo','ouvrage'].includes(l.type)) return ls
          return ls + (l.qte||0)*(l.pu||0)
        }, 0)
      }, 0)

      const fmt = (n:number) => n>=1000 ? Math.round(n).toLocaleString('fr-FR')+' € HT' : Math.round(n)+' € HT'
      const pct = (a:number, b:number) => b>0 ? Math.round((a-b)/b*100) : 0

      const moisLabel = now.toLocaleString('fr-FR',{month:'long'})
      const moisPrecLabel = new Date(now.getFullYear(), now.getMonth()-1, 1).toLocaleString('fr-FR',{month:'long'})

      return {
        caMois, caMoisStr: fmt(caMois),
        caMoisChange: caMoisPrec>0 ? (pct(caMois,caMoisPrec)>=0?'↑ +':'↓ ')+Math.abs(pct(caMois,caMoisPrec))+'% vs '+moisPrecLabel : 'Premier mois',
        caAnnee, caAnneeStr: fmt(caAnnee),
        caAnneeChange: caAnneePrec>0 ? (pct(caAnnee,caAnneePrec)>=0?'↑ +':'↓ ')+Math.abs(pct(caAnnee,caAnneePrec))+'% vs '+(now.getFullYear()-1) : 'Première année',
        devisAttente: devisAttente.length,
        caAttenteStr: fmt(caAttente)+' en jeu',
        facturesImpayees: 0,
        facturesStr: '0 € HT',
      }
    } catch(e) {
      return {caMoisStr:'—',caMoisChange:'',caAnneeStr:'—',caAnneeChange:'',devisAttente:0,caAttenteStr:'—',facturesImpayees:0,facturesStr:'—'}
    }
  }, [])


  useEffect(()=>{
    try{
      const raw=localStorage.getItem('batizo_clients')
      if(raw) setClientsData(JSON.parse(raw))
    }catch(e){}
  },[])

  const entreprise = user?.user_metadata?.entreprise || 'votre entreprise'
  const sw = collapsed ? 64 : 230

  const navItems = [
    {id:'dashboard', label:'Tableau de bord', href:'/dashboard'},
    {id:'devis', label:'Devis & Factures', href:'/devis', badge:'8'},
    {id:'clients', label:'Clients', href:'/clients'},
    {id:'bibliotheque', label:'Bibliothèque', href:'/bibliotheque'},
  ]

  const devis = React.useMemo(()=>{
    try{
      const raw=localStorage.getItem('batizo_devis')
      if(!raw) return []
      const list=JSON.parse(raw)
      const statMap:Record<string,string>={brouillon:'Brouillon',attente:'En attente',finalise:'Finalisé',signe:'Signé',refuse:'Refusé'}
      return list.filter((d:any)=>!d.archive).map((d:any)=>{
        const date=new Date(d.dateDevis||d.createdAt||Date.now())
        return{
          id:d.id,
          client:d.clientNom||d.nom||'—',
          num:d.ref||d.id?.slice(-6)||'—',
          date:date.toLocaleDateString('fr-FR',{day:'2-digit',month:'2-digit'}),
          montant:(d.montant||0).toLocaleString('fr-FR')+' € HT',
          statut:statMap[d.statut]||d.statut||'Brouillon',
          mois:date.getMonth()+1,
          annee:date.getFullYear(),
        }
      })
    }catch(e){return []}
  },[])

  const[periodeTop,setPeriodeTop]=useState<'mois'|'mois_prec'|'annee'|'annee_prec'>('annee')
  const[periodeDevis,setPeriodeDevis]=useState<'mois'|'mois_prec'|'annee'|'annee_prec'>('annee')
  const now=new Date()
  const filterByPeriode=(items:any[],periode:string)=>{
    return items.filter(d=>{
      if(!d.mois) return true
      if(periode==='mois') return d.mois===now.getMonth()+1&&d.annee===now.getFullYear()
      if(periode==='mois_prec'){const pm=now.getMonth()===0?12:now.getMonth();const py=now.getMonth()===0?now.getFullYear()-1:now.getFullYear();return d.mois===pm&&d.annee===py}
      if(periode==='annee') return d.annee===now.getFullYear()
      if(periode==='annee_prec') return d.annee===now.getFullYear()-1
      return true
    })
  }
  const [clientsData, setClientsData] = useState<any[]>(()=>{
    try{const raw=localStorage.getItem('batizo_clients');if(raw)return JSON.parse(raw)}catch(e){}
    return []
  })
  const topClientsData=clientsData.map(cl=>({
    nom:cl.raisonSociale||cl.prenom+' '+cl.nom,
    n:cl.nbDevis||0,
    ca:cl.caTotal?cl.caTotal.toLocaleString('fr-FR')+' €':'0 €',
    mois:cl.mois||new Date().getMonth()+1,
    annee:cl.annee||new Date().getFullYear(),
    id:cl.id,
  })).sort((a,b)=>b.n-a.n)

  const getStatutColor=(s:string)=>{
    if(s==='Brouillon') return '#888'
    if(s==='En attente') return '#BA7517'
    if(s==='Envoyé') return '#2563eb'
    if(s==='Signé') return '#1D9E75'
    if(s==='Refusé') return '#E24B4A'
    return '#888'
  }
  const devisFiltres=filterByPeriode(devis,periodeDevis)
  const topClientsFiltres=filterByPeriode(topClientsData,periodeTop)

  const actions = [
    {l:'Nouveau devis', e:'📄', href:'/devis', modal:true},
    {l:'Nouvelle facture', e:'🧾', href:'/devis'},
    {l:'Nouveau client', e:'👤', href:'/clients?new=1'},
    {l:'Ajouter matériau', e:'📦', href:'/bibliotheque?new=materiau'},
    {l:'Ajouter ouvrage', e:'🔨', href:'/bibliotheque?new=ouvrage'},
    {l:"Ajouter main d'œuvre", e:'👷', href:'/bibliotheque?new=mo'},
    {l:'Voir les impayés', e:'⚠️'},
  ]

  return (
    <>
    <div onClick={() => setUserMenu(false)} style={{display:'flex',height:'100vh',fontFamily:'system-ui,sans-serif',background:'#f8f9fa',overflow:'hidden'}}>

      <Sidebar activePage="dashboard"/>

      {/* MAIN */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        <div style={{height:60,background:'#fff',borderBottom:`1px solid ${BD}`,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',flexShrink:0}}>
          <div style={{fontSize:16,fontWeight:700,color:'#111',flexShrink:0}}>Tableau de bord</div><SearchBar/>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <button onClick={()=>setShowNouveauClient(true)} style={{padding:'8px 14px',background:'#fff',color:'#333',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer'}}>+ Nouveau client</button>
            <button onClick={()=>setShowNouveauDevis(true)} style={{padding:'8px 16px',background:G,color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}}>+ Nouveau devis</button>
            <div style={{marginLeft:20}}><NotifBell/></div>
          </div>
        </div>

        <div style={{flex:1,overflowY:'auto',padding:24}}>
          <div style={{marginBottom:24}}>
            <h2 style={{fontSize:20,fontWeight:700,margin:'0 0 4px',color:'#111'}}>{prenomLocal!==null?`Bonjour${prenom?' '+prenom:''} 👋`:''}</h2>
            <p style={{fontSize:14,color:'#111',margin:0}}>Voici un résumé de votre activité</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:20}}>
            <KpiCard label="CA ce mois" value={dashboardStats.caMoisStr} change={dashboardStats.caMoisChange} changeColor={G} period={caMoisPeriode} setPeriod={setCaMoisPeriode} openId={openKpiDD} setOpenId={setOpenKpiDD} cardId="caMois"/>
            <KpiCard label="CA cette année" value={dashboardStats.caAnneeStr} change={dashboardStats.caAnneeChange} changeColor={G} period={caAnneePeriode} setPeriod={setCaAnneePeriode} openId={openKpiDD} setOpenId={setOpenKpiDD} cardId="caAnnee"/>
            <KpiCard label="Devis en attente" value={String(dashboardStats.devisAttente)} change={dashboardStats.caAttenteStr} changeColor={AM} valueColor={AM} period={devisPeriode} setPeriod={setDevisPeriode} openId={openKpiDD} setOpenId={setOpenKpiDD} cardId="devis"/>
            <KpiCard label="Factures impayées" value={dashboardStats.facturesStr} change="À jour" changeColor={G} period={facturesPeriode} setPeriod={setFacturesPeriode} openId={openKpiDD} setOpenId={setOpenKpiDD} cardId="factures"/>
            {/* Marge moyenne */}
            <div style={{background:'#fff',borderRadius:12,padding:16,border:`1px solid ${BD}`,position:'relative' as const}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontSize:12,color:'#444',fontWeight:500}}>Marge moyenne</div>
                <div style={{position:'relative' as const}}>
                  <button onClick={()=>setOpenKpiDD(openKpiDD==='marge'?null:'marge')}
                    style={{fontSize:10,color:'#555',background:'#f3f4f6',border:'none',borderRadius:4,padding:'2px 6px',cursor:'pointer'}}>
                    {margePeriode==='mois'?'Ce mois-ci':margePeriode==='trimestre'?'Ce trimestre':margePeriode==='annee'?'Cette année':margePeriode==='12mois'?'Mois dernier':'Ce mois-ci'} ▾
                  </button>
                  {openKpiDD==='marge'&&(
                    <div style={{position:'absolute' as const,right:0,top:'100%',background:'#fff',border:`1px solid ${BD}`,borderRadius:8,boxShadow:'0 4px 16px rgba(0,0,0,0.1)',zIndex:200,minWidth:160,overflow:'hidden'}} onClick={e=>e.stopPropagation()}>
                      {[['mois','Ce mois-ci'],['12mois','Mois dernier'],['trimestre','Ce trimestre'],['annee','Cette année'],['custom','Personnalisé']].map(([v,l])=>(
                        <div key={v} onClick={()=>{setMargePeriode(v);setOpenKpiDD(null);if(v==='custom')setShowMargeCustom(true)}}
                          style={{padding:'8px 12px',fontSize:12,cursor:'pointer',background:margePeriode===v?'#f0fdf4':'',color:margePeriode===v?G:'#333'}}
                          onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background='#f9fafb'}
                          onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background=margePeriode===v?'#f0fdf4':''}>
                          {l}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {showMargeCustom&&margePeriode==='custom'&&(
                <div style={{display:'flex',gap:4,marginBottom:6}}>
                  <input type="date" value={margeDebut} onChange={e=>setMargeDebut(e.target.value)} style={{flex:1,padding:'3px 5px',border:`1px solid ${BD}`,borderRadius:4,fontSize:10,outline:'none'}}/>
                  <input type="date" value={margeFin} onChange={e=>setMargeFin(e.target.value)} style={{flex:1,padding:'3px 5px',border:`1px solid ${BD}`,borderRadius:4,fontSize:10,outline:'none'}}/>
                </div>
              )}
              <div style={{fontSize:20,fontWeight:700,color:margeStats.marge>=50?'#059669':margeStats.marge>=30?'#D97706':'#DC2626',marginBottom:4}}>
                {margeStats.nbDevis>0?margeStats.marge+'%':'\u2014'}
              </div>
              <div style={{fontSize:11,color:'#6B7280'}}>
                {margeStats.nbDevis>0?`Sur ${margeStats.nbDevis} devis signé${margeStats.nbDevis>1?'s':''}\u00A0(${margeStats.caTotal.toLocaleString('fr-FR')}\u00A0€ HT)`:'Aucun devis signé'}
              </div>
            </div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:6}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Derniers devis</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{display:'flex',gap:4}}>
                    {([['mois','Ce mois'],['mois_prec','Mois préc.'],['annee','Cette année'],['annee_prec','Année préc.']] as const).map(([v,l])=>(
                      <button key={v} onClick={()=>setPeriodeDevis(v)}
                        style={{padding:'3px 8px',borderRadius:12,border:`1px solid ${periodeDevis===v?G:BD}`,background:periodeDevis===v?'#f0fdf4':'#fff',color:periodeDevis===v?G:'#888',fontSize:11,fontWeight:periodeDevis===v?600:400,cursor:'pointer'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <a href="/devis" style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600,textDecoration:'none',marginLeft:8}}>Voir tout →</a>
                </div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <tbody>
                  {devisFiltres.map((d,i) => (
                    <tr key={i} onClick={()=>window.location.href=`/devis/${d.id||'nouveau'}`} onMouseEnter={e=>{(e.currentTarget as HTMLTableRowElement).style.background="#f0fdf4"}} onMouseLeave={e=>{(e.currentTarget as HTMLTableRowElement).style.background=""}} style={{borderTop:i===0?'none':`1px solid ${BD}`,cursor:'pointer'}}>
                      <td style={{padding:'10px 16px'}}>
                        <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{d.client}</div>
                        <div style={{fontSize:11,color:'#888'}}>{d.num} · {d.date}</div>
                      </td>
                      <td style={{padding:'10px 16px',textAlign:'right' as const,fontSize:13,fontWeight:600,color:'#111'}}>{d.montant}</td>
                      <td style={{padding:'10px 16px',textAlign:'right' as const}}>
                        <span style={{background:`${getStatutColor(d.statut)}22`,color:getStatutColor(d.statut),padding:'3px 10px',borderRadius:20,fontSize:11,fontWeight:700}}>{d.statut}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,overflow:'hidden'}}>
              <div style={{padding:'14px 16px',borderBottom:`1px solid ${BD}`,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap' as const,gap:6}}>
                <span style={{fontSize:14,fontWeight:700,color:'#111'}}>Top clients</span>
                <div style={{display:'flex',alignItems:'center',gap:8}}>
                  <div style={{display:'flex',gap:4}}>
                    {([['mois','Ce mois'],['mois_prec','Mois préc.'],['annee','Cette année'],['annee_prec','Année préc.']] as const).map(([v,l])=>(
                      <button key={v} onClick={()=>setPeriodeTop(v)}
                        style={{padding:'3px 8px',borderRadius:12,border:`1px solid ${periodeTop===v?G:BD}`,background:periodeTop===v?'#f0fdf4':'#fff',color:periodeTop===v?G:'#888',fontSize:11,fontWeight:periodeTop===v?600:400,cursor:'pointer'}}>
                        {l}
                      </button>
                    ))}
                  </div>
                  <a href="/clients" style={{fontSize:12,color:G,cursor:'pointer',fontWeight:600,textDecoration:'none',marginLeft:8}}>Voir tout →</a>
                </div>
              </div>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <tbody>
                {topClientsFiltres.map((cl,i)=>(
                  <tr key={i} style={{borderBottom:i<topClientsData.length-1?`1px solid ${BD}`:'',cursor:'pointer'}}
                    onClick={()=>setFicheClient(clientsData.find(c=>c.id===cl.id)||clientsData.find(c=>(c.raisonSociale||c.prenom+' '+c.nom)===cl.nom))}
                    onMouseEnter={e=>(e.currentTarget as HTMLTableRowElement).style.background='#f0fdf4'}
                    onMouseLeave={e=>(e.currentTarget as HTMLTableRowElement).style.background=''}>
                    <td style={{padding:'10px 16px'}}>
                      <div style={{fontSize:13,fontWeight:600,color:'#111'}}>{cl.nom}</div>
                      <div style={{fontSize:11,color:'#888'}}>{cl.n} chantier{cl.n>1?'s':''}</div>
                    </td>
                    <td style={{padding:'10px 16px',textAlign:'right' as const,fontSize:13,fontWeight:600,color:'#111'}}>{cl.ca} HT</td>
                  </tr>
                ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{background:'#fff',borderRadius:12,border:`1px solid ${BD}`,padding:16}}>
            <div style={{fontSize:14,fontWeight:700,marginBottom:12,color:'#111'}}>Actions rapides</div>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {actions.map(a => (
                <button key={a.l} onClick={()=>{if((a as any).modal){setShowNouveauDevis(true)}else if((a as any).href) window.location.href=(a as any).href}} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 16px',background:'#f9fafb',border:`1px solid ${BD}`,borderRadius:8,fontSize:13,cursor:'pointer',color:'#333',whiteSpace:'nowrap'}}>
                  {a.e} {a.l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    {showNouveauDevis&&<NouveauDevisModal onClose={()=>setShowNouveauDevis(false)}/>}
    {ficheClient&&<FicheClientPanel 
    client={ficheClient} 
    allClients={clientsData}
    onClose={()=>setFicheClient(null)}
    onSave={(saved:any)=>{
      setClientsData(getClients())
      setFicheClient(saved)
    }}/>
    }
    {showNouveauClient&&(
      <NouveauClientDrawer onClose={()=>setShowNouveauClient(false)} onSave={(client:any)=>{
        try{const existing=JSON.parse(localStorage.getItem('batizo_clients')||'[]');localStorage.setItem('batizo_clients',JSON.stringify([...existing,{...client,id:Date.now().toString()}]))}catch(e){}
        setShowNouveauClient(false)
      }}/>
    )}
    </>
  )
}

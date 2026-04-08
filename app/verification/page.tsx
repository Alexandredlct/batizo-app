export default function VerificationPage() {
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f0fdf4 0%,#e8f5e9 100%)',display:'flex',alignItems:'center',justifyContent:'center',padding:'2rem',fontFamily:'system-ui,sans-serif'}}>
      <div style={{width:'100%',maxWidth:'480px',textAlign:'center'}}>
        <div style={{display:'inline-flex',alignItems:'center',gap:'10px',marginBottom:'2rem'}}>
          <div style={{width:'40px',height:'40px',background:'#1D9E75',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" style={{width:'20px',height:'20px'}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          </div>
          <span style={{fontSize:'22px',fontWeight:'800',color:'#111'}}>Bati<span style={{color:'#1D9E75'}}>zo</span></span>
        </div>
        <div style={{background:'#fff',borderRadius:'16px',padding:'2.5rem',boxShadow:'0 4px 24px rgba(0,0,0,0.08)',border:'1px solid #e5e7eb'}}>
          <div style={{fontSize:'56px',marginBottom:'1rem'}}>✉️</div>
          <h1 style={{fontSize:'22px',fontWeight:'700',margin:'0 0 12px'}}>Vérifiez votre email</h1>
          <p style={{fontSize:'14px',color:'#666',lineHeight:'1.7',margin:'0 0 20px'}}>
            Un email de confirmation vous a été envoyé.<br/>
            Cliquez sur le lien dans l'email pour activer votre compte et accéder à Batizo.
          </p>
          <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:'10px',padding:'14px',marginBottom:'20px'}}>
            <p style={{fontSize:'13px',color:'#166534',margin:0,fontWeight:'500'}}>
              ✅ 30 jours gratuits vous attendent — sans carte bancaire
            </p>
          </div>
          <p style={{fontSize:'12px',color:'#999',margin:0}}>
            Pas reçu l'email ? Vérifiez vos spams ou{' '}
            <a href="/inscription" style={{color:'#1D9E75',textDecoration:'none',fontWeight:'600'}}>recommencez l'inscription</a>
          </p>
        </div>
        <div style={{marginTop:'1.5rem'}}>
          <a href="/login" style={{fontSize:'13px',color:'#999',textDecoration:'none'}}>← Retour à la connexion</a>
        </div>
      </div>
    </div>
  )
}

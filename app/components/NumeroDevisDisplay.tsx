'use client'

const AM = '#BA7517'

interface Props {
  devis: {
    ref?: string
    id?: string
    num?: string
    numero?: string
  }
  showBadge?: boolean
  size?: 'small' | 'normal'
}

export default function NumeroDevisDisplay({ devis, showBadge = true, size = 'normal' }: Props) {
  const numero = devis.ref || devis.num || devis.numero || ''
  
  // Vrai numéro = commence par des lettres (DEV-, FAC-, etc.) ou format configuré
  // Jamais afficher un ID interne (uuid, timestamp, etc.)
  const isValidNumero = numero && 
    !numero.startsWith('dev-') && 
    !numero.startsWith('cli-') &&
    !/^\d{5,}$/.test(numero) &&  // pas un timestamp
    !/^[0-9a-f]{8}-/.test(numero) // pas un UUID

  if (isValidNumero) {
    return (
      <span style={{
        fontWeight: 600,
        fontSize: size === 'small' ? 11 : 13,
        color: '#1D9E75'
      }}>
        {numero}
      </span>
    )
  }

  // Pas de numéro attribué
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{
        color: '#888',
        fontWeight: 500,
        fontSize: size === 'small' ? 11 : 13
      }}>
        Sans numéro
      </span>
      {showBadge && (
        <span style={{
          fontSize: 10,
          fontWeight: 700,
          padding: '1px 6px',
          borderRadius: 10,
          background: '#fff7ed',
          color: AM,
          border: `1px solid ${AM}44`,
          whiteSpace: 'nowrap' as const
        }}>
          À attribuer
        </span>
      )}
    </span>
  )
}

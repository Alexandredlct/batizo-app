import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { email, nom, role } = await req.json()

  if (!email || !nom) {
    return NextResponse.json({ error: 'Email et nom requis' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    data: { prenom: nom.split(' ')[0], nom: nom.split(' ')[1] || '', role }
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, user: data.user })
}

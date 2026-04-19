// app/api/waitlist/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 🔑 Isto evita que o Next.js tente pré-renderizar/coletar dados em build-time
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
  // 🔑 Cria o client DENTRO do handler, não no escopo do módulo
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 500 }
    )
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  // ... resto da sua lógica (ler body, inserir no Supabase, etc)
  const body = await request.json()
  // ...

  return NextResponse.json({ success: true })
}
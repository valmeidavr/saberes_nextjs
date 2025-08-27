import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const artigos = await prisma.agricultura.findMany({
      where: { status: true },
      orderBy: { createdAt: 'desc' }
    })

    // Converter BigInt para string
    const artigosSerializados = artigos.map(artigo => ({
      ...artigo,
      id: artigo.id.toString()
    }))

    return NextResponse.json({
      artigos: artigosSerializados
    })
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
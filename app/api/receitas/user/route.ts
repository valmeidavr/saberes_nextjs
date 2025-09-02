import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const receitas = await prisma.receita.findMany({
      include: {
        usuario: {
          select: { nome: true }
        }
      },
      orderBy: { nome: 'asc' }
    })

    // Converter BigInt para string
    const receitasSerializadas = receitas.map(receita => ({
      ...receita,
      id: receita.id.toString(),
      idUsuario: receita.idUsuario.toString()
    }))

    return NextResponse.json({
      receitas: receitasSerializadas
    })
  } catch (error) {
    console.error('Erro ao buscar receitas:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
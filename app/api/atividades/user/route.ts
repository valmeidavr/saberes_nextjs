import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const atividades = await prisma.atividade.findMany({
      where: { status: true },
      include: {
        participacoes: {
          include: {
            usuario: {
              select: { nome: true }
            }
          }
        }
      },
      orderBy: { data: 'asc' }
    })

    // Converter BigInt para string e verificar participação do usuário
    const atividadesSerializadas = atividades.map(atividade => {
      const isParticipating = atividade.participacoes.some(
        p => p.idUsuario.toString() === session.user?.id
      )
      
      return {
        ...atividade,
        id: atividade.id.toString(),
        participacoes: atividade.participacoes.map(p => ({
          ...p,
          id: p.id.toString(),
          idUsuario: p.idUsuario.toString(),
          idAtividade: p.idAtividade.toString()
        })),
        isParticipating
      }
    })

    return NextResponse.json({
      atividades: atividadesSerializadas
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
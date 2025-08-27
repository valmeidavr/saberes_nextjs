import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const idAtividade = resolvedParams.id

    // Buscar participação do usuário
    const participacao = await prisma.participacao.findFirst({
      where: {
        idUsuario: BigInt(session.user.id),
        idAtividade: BigInt(idAtividade)
      }
    })

    if (!participacao) {
      return NextResponse.json({ error: 'Participação não encontrada' }, { status: 404 })
    }

    await prisma.participacao.delete({
      where: { id: participacao.id }
    })

    return NextResponse.json({ message: 'Participação cancelada com sucesso' })
  } catch (error) {
    console.error('Erro ao cancelar participação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
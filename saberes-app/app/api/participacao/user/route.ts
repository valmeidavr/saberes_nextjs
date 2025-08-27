import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { idAtividade } = data

    // Verificar se a participação já existe
    const existingParticipacao = await prisma.participacao.findFirst({
      where: {
        idUsuario: BigInt(session.user.id),
        idAtividade: BigInt(idAtividade)
      }
    })

    if (existingParticipacao) {
      return NextResponse.json({ error: 'Você já está inscrito nesta atividade' }, { status: 400 })
    }

    // Verificar se a atividade existe e está ativa
    const atividade = await prisma.atividade.findFirst({
      where: {
        id: BigInt(idAtividade),
        status: true
      }
    })

    if (!atividade) {
      return NextResponse.json({ error: 'Atividade não encontrada ou inativa' }, { status: 404 })
    }

    const participacao = await prisma.participacao.create({
      data: {
        idUsuario: BigInt(session.user.id),
        idAtividade: BigInt(idAtividade)
      }
    })

    // Converter BigInt para string
    const participacaoSerializada = {
      ...participacao,
      id: participacao.id.toString(),
      idUsuario: participacao.idUsuario.toString(),
      idAtividade: participacao.idAtividade.toString()
    }

    return NextResponse.json(participacaoSerializada, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar participação:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
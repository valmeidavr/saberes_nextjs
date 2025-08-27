import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const atividade = await prisma.atividade.findUnique({
      where: { id: BigInt(resolvedParams.id) },
      include: {
        participacoes: {
          include: {
            usuario: {
              select: { nome: true }
            }
          }
        }
      }
    })

    if (!atividade) {
      return NextResponse.json({ error: 'Atividade não encontrada' }, { status: 404 })
    }

    // Converter BigInt para string
    const atividadeSerializada = {
      ...atividade,
      id: atividade.id.toString(),
      participacoes: atividade.participacoes.map(p => ({
        ...p,
        id: p.id.toString(),
        idUsuario: p.idUsuario.toString(),
        idAtividade: p.idAtividade.toString()
      }))
    }

    return NextResponse.json(atividadeSerializada)
  } catch (error) {
    console.error('Erro ao buscar atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    const data = await request.json()
    const {
      nome,
      descricao,
      data: dataAtividade,
      hinicio,
      hfim,
      local,
      foto,
      status
    } = data

    const atividade = await prisma.atividade.update({
      where: { id: BigInt(resolvedParams.id) },
      data: {
        nome,
        descricao,
        data: new Date(dataAtividade),
        hinicio: new Date(`1970-01-01T${hinicio}:00.000Z`),
        hfim: new Date(`1970-01-01T${hfim}:00.000Z`),
        local,
        foto,
        status
      }
    })

    // Converter BigInt para string  
    const atividadeSerializada = {
      ...atividade,
      id: atividade.id.toString()
    }

    return NextResponse.json(atividadeSerializada)
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const resolvedParams = await params
    await prisma.atividade.delete({
      where: { id: BigInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: 'Atividade excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
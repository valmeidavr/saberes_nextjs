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
    const receita = await prisma.receita.findUnique({
      where: { id: BigInt(resolvedParams.id) },
      include: {
        usuario: {
          select: { nome: true }
        }
      }
    })

    if (!receita) {
      return NextResponse.json({ error: 'Receita não encontrada' }, { status: 404 })
    }

    // Converter BigInt para string
    const receitaSerializada = {
      ...receita,
      id: receita.id.toString(),
      idUsuario: receita.idUsuario.toString()
    }

    return NextResponse.json(receitaSerializada)
  } catch (error) {
    console.error('Erro ao buscar receita:', error)
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
      ingredientes,
      preparo,
      foto,
      idUsuario
    } = data

    const receita = await prisma.receita.update({
      where: { id: BigInt(resolvedParams.id) },
      data: {
        nome,
        ingredientes,
        preparo,
        foto,
        idUsuario: BigInt(idUsuario)
      },
      include: {
        usuario: {
          select: { nome: true }
        }
      }
    })

    // Converter BigInt para string  
    const receitaSerializada = {
      ...receita,
      id: receita.id.toString(),
      idUsuario: receita.idUsuario.toString()
    }

    return NextResponse.json(receitaSerializada)
  } catch (error) {
    console.error('Erro ao atualizar receita:', error)
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
    await prisma.receita.delete({
      where: { id: BigInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: 'Receita excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir receita:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
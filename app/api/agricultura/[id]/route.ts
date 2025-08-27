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
    const artigo = await prisma.agricultura.findUnique({
      where: { id: BigInt(resolvedParams.id) }
    })

    if (!artigo) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    // Converter BigInt para string
    const artigoSerializado = {
      ...artigo,
      id: artigo.id.toString()
    }

    return NextResponse.json(artigoSerializado)
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
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
      titulo,
      conteudo,
      foto,
      autor,
      status
    } = data

    const artigo = await prisma.agricultura.update({
      where: { id: BigInt(resolvedParams.id) },
      data: {
        titulo,
        conteudo,
        foto,
        autor,
        status
      }
    })

    // Converter BigInt para string  
    const artigoSerializado = {
      ...artigo,
      id: artigo.id.toString()
    }

    return NextResponse.json(artigoSerializado)
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error)
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
    await prisma.agricultura.delete({
      where: { id: BigInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: 'Artigo excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir artigo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
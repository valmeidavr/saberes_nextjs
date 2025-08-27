import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')

    const skip = (page - 1) * limit

    const where = {
      AND: [
        search ? {
          OR: [
            { titulo: { contains: search, mode: 'insensitive' } },
            { conteudo: { contains: search, mode: 'insensitive' } },
            { autor: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        status !== null && status !== '' && status !== 'all' ? { status: status === 'true' } : {}
      ]
    }

    const [artigos, total] = await Promise.all([
      prisma.agricultura.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.agricultura.count({ where })
    ])

    // Converter BigInt para string
    const artigosSerializados = artigos.map(artigo => ({
      ...artigo,
      id: artigo.id.toString()
    }))

    return NextResponse.json({
      artigos: artigosSerializados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const {
      titulo,
      conteudo,
      foto,
      autor,
      status
    } = data

    const artigo = await prisma.agricultura.create({
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

    return NextResponse.json(artigoSerializado, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar artigo:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
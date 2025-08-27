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

    const skip = (page - 1) * limit

    const where = {
      AND: [
        search ? {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { ingredientes: { contains: search, mode: 'insensitive' } },
            { preparo: { contains: search, mode: 'insensitive' } }
          ]
        } : {}
      ]
    }

    const [receitas, total] = await Promise.all([
      prisma.receita.findMany({
        where,
        skip,
        take: limit,
        include: {
          usuario: {
            select: { nome: true }
          }
        },
        orderBy: { nome: 'asc' }
      }),
      prisma.receita.count({ where })
    ])

    // Converter BigInt para string
    const receitasSerializadas = receitas.map(receita => ({
      ...receita,
      id: receita.id.toString(),
      idUsuario: receita.idUsuario.toString()
    }))

    return NextResponse.json({
      receitas: receitasSerializadas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar receitas:', error)
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
      nome,
      ingredientes,
      preparo,
      foto,
      idUsuario
    } = data

    const receita = await prisma.receita.create({
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

    return NextResponse.json(receitaSerializada, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar receita:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
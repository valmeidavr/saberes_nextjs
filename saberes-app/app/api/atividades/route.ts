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
            { nome: { contains: search, mode: 'insensitive' } },
            { descricao: { contains: search, mode: 'insensitive' } },
            { local: { contains: search, mode: 'insensitive' } }
          ]
        } : {},
        status !== null && status !== '' && status !== 'all' ? { status: status === 'true' } : {}
      ]
    }

    const [atividades, total] = await Promise.all([
      prisma.atividade.findMany({
        where,
        skip,
        take: limit,
        include: {
          participacoes: {
            include: {
              usuario: {
                select: { nome: true }
              }
            }
          }
        },
        orderBy: { data: 'desc' }
      }),
      prisma.atividade.count({ where })
    ])

    // Converter BigInt para string
    const atividadesSerializadas = atividades.map(atividade => ({
      ...atividade,
      id: atividade.id.toString(),
      participacoes: atividade.participacoes.map(p => ({
        ...p,
        id: p.id.toString(),
        idUsuario: p.idUsuario.toString(),
        idAtividade: p.idAtividade.toString()
      }))
    }))

    return NextResponse.json({
      atividades: atividadesSerializadas,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar atividades:', error)
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
      descricao,
      data: dataAtividade,
      hinicio,
      hfim,
      local,
      foto,
      status
    } = data

    const atividade = await prisma.atividade.create({
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

    return NextResponse.json(atividadeSerializada, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar atividade:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
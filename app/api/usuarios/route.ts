import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/utils'
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
            { nome: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
            { cidade: { contains: search, mode: 'insensitive' as const } }
          ]
        } : {},
        status !== null && status !== '' ? { status: status === 'true' } : {}
      ]
    }

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nome: true,
          email: true,
          perfil: true,
          sexo: true,
          cep: true,
          complemento: true,
          numero: true,
          bairro: true,
          cidade: true,
          uf: true,
          status: true
        },
        orderBy: { nome: 'asc' }
      }),
      prisma.usuario.count({ where })
    ])

    // Converter BigInt para string
    const usuariosSerializados = usuarios.map(user => ({
      ...user,
      id: user.id.toString()
    }))

    return NextResponse.json({
      usuarios: usuariosSerializados,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
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
      email,
      password,
      perfil,
      sexo,
      cep,
      complemento,
      numero,
      bairro,
      cidade,
      uf,
      status
    } = data

    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        password: hashedPassword,
        perfil: perfil || 'PADRAO',
        sexo,
        cep,
        complemento,
        numero: numero ? parseInt(numero) : 0,
        bairro,
        cidade,
        uf,
        status: status !== undefined ? status : true
      },
      select: {
        id: true,
        nome: true,
        email: true,
        perfil: true,
        sexo: true,
        cep: true,
        complemento: true,
        numero: true,
        bairro: true,
        cidade: true,
        uf: true,
        status: true
      }
    })

    // Converter BigInt para string
    const usuarioSerializado = {
      ...usuario,
      id: usuario.id.toString()
    }

    return NextResponse.json(usuarioSerializado, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
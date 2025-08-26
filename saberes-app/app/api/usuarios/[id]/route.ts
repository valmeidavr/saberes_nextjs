import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/utils'
import { authOptions } from '@/lib/auth'
import { Perfil } from '@prisma/client'

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
    const usuario = await prisma.usuario.findUnique({
      where: { id: BigInt(resolvedParams.id) },
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

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
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

    const resolvedParams = await params
    const existingUser = await prisma.usuario.findFirst({
      where: {
        email,
        NOT: { id: BigInt(resolvedParams.id) }
      }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 400 })
    }

    const updateData: {
      nome: string
      email: string
      perfil: Perfil
      sexo: string
      cep: string
      complemento: string | null
      numero: number
      bairro: string
      cidade: string
      uf: string
      status: boolean
      password?: string
    } = {
      nome,
      email,
      perfil: perfil as Perfil,
      sexo,
      cep,
      complemento,
      numero: parseInt(numero),
      bairro,
      cidade,
      uf,
      status
    }

    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password)
    }

    const usuario = await prisma.usuario.update({
      where: { id: BigInt(resolvedParams.id) },
      data: updateData,
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

    return NextResponse.json(usuario)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
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
    await prisma.usuario.delete({
      where: { id: BigInt(resolvedParams.id) }
    })

    return NextResponse.json({ message: 'Usuário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
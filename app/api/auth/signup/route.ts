import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { nome, email, senha } = await request.json()

    // Validações básicas
    if (!nome || !email || !senha) {
      return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
    }

    if (senha.length < 6) {
      return NextResponse.json({ error: 'A senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Verificar se o email já existe
    const existingUser = await prisma.usuario.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Este email já está em uso' }, { status: 400 })
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 12)

    // Criar o usuário
    const user = await prisma.usuario.create({
      data: {
        nome,
        email,
        password: hashedPassword,
        perfil: 'PADRAO', // Por padrão, novos usuários são PADRAO
        sexo: 'N', // Valor padrão
        cep: '00000000', // Valor padrão
        numero: 0, // Valor padrão
        bairro: 'Não informado', // Valor padrão
        cidade: 'Não informado', // Valor padrão
        uf: 'SP', // Valor padrão
        status: true // Usuário ativo
      }
    })

    // Retornar usuário sem a senha
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      message: 'Usuário criado com sucesso',
      user: {
        ...userWithoutPassword,
        id: userWithoutPassword.id.toString()
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
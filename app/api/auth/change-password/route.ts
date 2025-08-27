import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/utils'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const data = await request.json()
    const { currentPassword, newPassword } = data

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Senha atual e nova senha são obrigatórias' }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
    }

    // Buscar usuário atual
    const user = await prisma.usuario.findUnique({
      where: { id: BigInt(session.user.id) },
      select: { id: true, password: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
    }

    // Verificar senha atual
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })
    }

    // Hash da nova senha
    const hashedNewPassword = await hashPassword(newPassword)

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    })

    return NextResponse.json({ message: 'Senha alterada com sucesso' })
  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
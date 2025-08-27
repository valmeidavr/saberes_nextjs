import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando usuário padrão...')
  
  const hashedPassword = await hashPassword('user123')
  
  const user = await prisma.usuario.upsert({
    where: { email: 'user@saberes.com' },
    update: {},
    create: {
      nome: 'João Silva',
      email: 'user@saberes.com',
      password: hashedPassword,
      perfil: 'PADRAO',
      sexo: 'M',
      cep: '01234-567',
      numero: 123,
      bairro: 'Vila Nova',
      cidade: 'São Paulo',
      uf: 'SP',
      status: true
    }
  })
  
  console.log('✅ Usuário padrão criado:', user.email)
  console.log('📧 Email: user@saberes.com')
  console.log('🔑 Senha: user123')
  console.log('👤 Perfil: Usuário Padrão')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
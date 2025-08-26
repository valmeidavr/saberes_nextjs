import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/utils'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Criando usuário administrador...')
  
  const hashedPassword = await hashPassword('admin123')
  
  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@saberes.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@saberes.com',
      password: hashedPassword,
      perfil: 'ADMIN',
      sexo: 'M',
      cep: '00000-000',
      numero: 1,
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      status: true
    }
  })
  
  console.log('✅ Usuário admin criado:', admin.email)
  console.log('📧 Email: admin@saberes.com')
  console.log('🔑 Senha: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
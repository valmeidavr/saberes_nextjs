const bcrypt = require('bcryptjs');

// Script para criar senha hash para admin
async function createAdminPassword() {
  const password = 'admin123';
  const hashedPassword = await bcrypt.hash(password, 12);
  
  console.log('=== USUÁRIO ADMIN ===');
  console.log('Email: admin@saberes.com');
  console.log('Senha: admin123');
  console.log('Hash da senha:', hashedPassword);
  console.log('\n=== SQL PARA INSERIR NO BANCO ===');
  console.log(`INSERT INTO usuarios (nome, email, password, perfil, sexo, cep, complemento, numero, bairro, cidade, uf, status) VALUES 
('Administrador', 'admin@saberes.com', '${hashedPassword}', 'admin', 'M', '00000-000', null, 1, 'Centro', 'Cidade', 'SP', true);`);
}

createAdminPassword().catch(console.error);
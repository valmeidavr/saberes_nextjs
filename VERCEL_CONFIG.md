# Configuração de Variáveis de Ambiente na Vercel

## Variáveis Obrigatórias

Configure as seguintes variáveis de ambiente no painel da Vercel:

### 1. DATABASE_URL
```
postgresql://neondb_owner:npg_Ov6CiEkRHA1j@ep-calm-cherry-ackb7wa6-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 2. NEXTAUTH_URL
```
https://seu-dominio.vercel.app
```
**IMPORTANTE**: Substitua `seu-dominio` pelo domínio real do seu projeto na Vercel

### 3. NEXTAUTH_SECRET
Para gerar um secret seguro, execute no terminal:
```bash
openssl rand -base64 32
```
Ou use: https://generate-secret.vercel.app/32

## Como Configurar na Vercel

1. Acesse o dashboard do projeto na Vercel
2. Vá em "Settings" → "Environment Variables"
3. Adicione cada variável acima
4. Clique em "Save" para cada uma
5. Faça um novo deploy para aplicar as mudanças

## Verificação

Após configurar, verifique se:
- A página inicial redireciona corretamente
- O login funciona
- As rotas protegidas estão acessíveis após login
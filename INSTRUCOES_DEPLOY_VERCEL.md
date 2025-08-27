# 🚀 Instruções para Deploy na Vercel

## Status Atual
✅ O middleware foi temporariamente desabilitado para evitar o erro 500
✅ Build local funcionando perfeitamente

## Passo a Passo para Deploy

### 1. Configure as Variáveis de Ambiente na Vercel

No dashboard da Vercel, vá em **Settings > Environment Variables** e adicione:

```env
DATABASE_URL=postgresql://neondb_owner:npg_Ov6CiEkRHA1j@ep-calm-cherry-ackb7wa6-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

NEXTAUTH_URL=https://SEU-PROJETO.vercel.app

NEXTAUTH_SECRET=GERE-UMA-CHAVE-SEGURA
```

⚠️ **IMPORTANTE**:
- Substitua `SEU-PROJETO` pelo nome real do seu projeto na Vercel
- Para gerar o `NEXTAUTH_SECRET`, execute: `openssl rand -base64 32`

### 2. Faça o Deploy

```bash
git add .
git commit -m "Fix: Middleware temporariamente desabilitado para resolver erro 500"
git push
```

### 3. Após o Deploy Funcionar

Quando o site estiver funcionando sem erro 500:

1. Delete o arquivo `middleware.ts`
2. Renomeie `middleware.ts.backup` para `middleware.ts`
3. Faça commit e push novamente

```bash
rm middleware.ts
mv middleware.ts.backup middleware.ts
git add .
git commit -m "Reativar middleware com autenticação"
git push
```

## Problema Identificado

O erro `MIDDLEWARE_INVOCATION_FAILED` ocorria porque:
1. As variáveis de ambiente não estavam configuradas corretamente na Vercel
2. O middleware tentava acessar o NextAuth sem as configurações necessárias

## Solução Temporária

O middleware foi desabilitado temporariamente para permitir o deploy. 
Isso significa que:
- ✅ O site funcionará normalmente
- ⚠️ As rotas protegidas não estarão protegidas pelo middleware
- ✅ A autenticação ainda funciona nas páginas

## Solução Definitiva

Após configurar corretamente as variáveis de ambiente, reative o middleware seguindo o passo 3.
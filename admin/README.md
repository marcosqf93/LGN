# Painel Admin — LGN Empreendimentos Imobiliários

## Requisitos

- Node.js 18+
- MongoDB Atlas (gratuito) — https://www.mongodb.com/atlas
- Cloudinary (gratuito) — https://cloudinary.com

## Configuração

1. Instalar dependências:
   ```
   cd admin
   npm install
   ```

2. Copiar `.env.example` para `.env` e preencher:
   ```
   cp .env.example .env
   ```

3. Criar um cluster gratuito no MongoDB Atlas e copiar a string de conexão para `MONGODB_URI`

4. Criar uma conta no Cloudinary e copiar as credenciais (Cloud Name, API Key, API Secret)

5. (Opcional) Importar os 82 imóveis existentes:
   ```
   npm run seed
   ```

6. Iniciar o servidor:
   ```
   npm start
   ```

7. Acessar: http://localhost:3000/admin/login

## Login

- Email: `quintana.mqf@gmail.com`
- Senha: `admin`

## Esqueci minha senha

O link de redefinição aparece no console do servidor (modo debug). Em produção, configure um serviço de email (SendGrid, etc).

## Deploy no Render

1. Importe o `render.yaml` da raiz do projeto no Render
2. O serviço já vem configurado para a pasta `admin/`
3. Adicione as variáveis de ambiente no painel do Render:
   - `MONGODB_URI`
   - `JWT_SECRET` (gere uma string aleatória longa)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `BASE_URL` (URL do seu site no Render, ex: https://seu-admin.onrender.com)
   - `ADMIN_EMAIL` (seu email de login)
   - `ADMIN_PASSWORD` (sua senha de login)
   - `ADMIN_NAME=LGN`
   - `JWT_EXPIRES_IN` (opcional, padrão `7d`)
   - `SENDGRID_API_KEY` e `SENDGRID_FROM` (opcionais, para reset de senha por email)
4. Deploy!

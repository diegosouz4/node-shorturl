# 🔗 Node ShortURL API

Uma API de encurtamento de URLs desenvolvida em **Node.js + TypeScript**, com foco em **arquitetura limpa, regras de negócio bem definidas e padrões de backend utilizados em ambientes reais de produção**.

> 🚧 **Projeto em desenvolvimento**  
> Este README representa o estado atual do projeto e será atualizado conforme novas funcionalidades forem implementadas.

---

## 🚀 Visão Geral

O **Node ShortURL** permite criar URLs encurtadas associadas a usuários, com controle de permissões, limitação por plano e suporte a expiração de links.

O projeto foi pensado não apenas como um encurtador simples, mas como uma **API escalável**, organizada em camadas e preparada para crescer.

---

## 🧠 Principais Conceitos Aplicados

- Arquitetura em camadas (Controller → Service → Model)
- Policy Layer para regras de autorização
- Autenticação via JWT
- Validação de dados com Zod
- ORM com Prisma + PostgreSQL
- Controle de roles (FREEBIE, SUBSCRIBER, ADMIN, MASTER)
- Limitação de criação de URLs por tipo de usuário
- Logs e status de URLs
- Testes de carga com Artillery

---

## 🛠️ Tecnologias Utilizadas

- **Node.js**
- **TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL**
- **Zod**
- **JWT (jsonwebtoken)**
- **Artillery** (testes de carga)

---

## 📦 Estrutura do Projeto

<pre>
  src/
  ├── controllers/ # Camada de entrada (HTTP)
  ├── services/ # Regras de negócio
  ├── policies/ # Regras de autorização
  ├── model/ # Acesso ao banco de dados
  ├── types/ # Schemas e validações (Zod)
  ├── utils/ # Funções utilitárias
  ├── config/ # Configurações da aplicação
  └── middlewares/ # Middlewares (auth, roles, etc)
</pre>

---

## 🔐 Autenticação & Autorização

- Autenticação via **JWT**
- Middleware carrega o usuário autenticado direto do banco
- Regras de acesso centralizadas em **Policy Layer**
- Permissões baseadas em role

### Roles disponíveis
- `FREEBIE`
- `SUBSCRIBER`
- `ADMIN`
- `MASTER`

---

## 🔗 Funcionalidades Implementadas até o Momento

### Usuários
- Criação de usuários
- Login com JWT
- Listagem (restrita por role)
- Visualização de perfil
- Atualização de dados
- Remoção de usuários
- Regras de permissão bem definidas via policy

### URLs
- Criação de URL encurtada
- Geração de short code com verificação de colisão
- Limitação de criação por tipo de usuário
- Associação da URL ao usuário criador
- Suporte a data de expiração
- Registro de logs da URL

---

## 🧪 Testes

- Testes de carga utilizando **Artillery**
- Validação de comportamento sob múltiplas requisições simultâneas

---

## 🗄️ Modelagem de Dados

- Usuários com roles
- URLs encurtadas com status
- Logs de ações da URL
- Índices para otimização de consultas e paginação

---

## ⚙️ Como rodar o projeto localmente

> ⚠️ Instruções simplificadas (README provisório)

```bash
# instalar dependências
npm install

# rodar migrations
npx prisma migrate dev

# iniciar aplicação
npm run dev

# Gestão EHS - Painel de Controle

Este é um projeto Next.js para um Painel de Controle de Gestão de Meio Ambiente, Saúde e Segurança (EHS).

## Pré-requisitos

Antes de começar, certifique-se de ter o seguinte instalado:
- Node.js (versão 18.x ou superior recomendada)
- npm (geralmente vem com o Node.js) ou Yarn

## Instalação

1. Clone o repositório (se aplicável) ou certifique-se de que você tem todos os arquivos do projeto.
2. Navegue até o diretório raiz do projeto no seu terminal.
3. Instale as dependências do projeto:

   Com npm:
   ```bash
   npm install
   ```
   Ou com Yarn:
   ```bash
   yarn install
   ```

## Rodando o Servidor de Desenvolvimento

Após a instalação das dependências, você pode iniciar o servidor de desenvolvimento:

Com npm:
```bash
npm run dev
```
Ou com Yarn:
```bash
yarn dev
```
Isso iniciará a aplicação em modo de desenvolvimento, geralmente acessível em `http://localhost:9002` (a porta pode variar se a 9002 estiver em uso).

A aplicação usa **Turbopack** para um desenvolvimento mais rápido.

## Banco de Dados (SQLite)

- Este projeto utiliza **SQLite** como banco de dados.
- Um arquivo de banco de dados chamado `ehs_database.sqlite` será criado automaticamente na **raiz do seu projeto** na primeira vez que a aplicação precisar acessá-lo (geralmente ao iniciar o servidor e fazer a primeira requisição que interage com o banco).
- O banco de dados será populado com tabelas e dados de exemplo iniciais, conforme definido em `src/lib/db.ts`.

**Importante sobre o Schema do Banco:**
Se você encontrar erros como "no such column" (nenhuma coluna encontrada) ou "table ... has no column named ..." (tabela ... não tem coluna chamada ...), pode ser que o schema do banco de dados tenha sido atualizado no código (`src/lib/db.ts`), mas o arquivo `ehs_database.sqlite` no seu disco ainda está com o schema antigo.
A maneira mais simples de resolver isso durante o desenvolvimento é:
1. Parar a aplicação.
2. **Excluir o arquivo `ehs_database.sqlite`** da raiz do seu projeto.
3. Reiniciar a aplicação (`npm run dev`). Isso forçará a recriação do banco de dados com o schema mais recente.
   **Atenção:** Isso apagará todos os dados existentes no seu banco de dados local.

## Funcionalidades de IA (Genkit)

- Algumas funcionalidades podem utilizar Inteligência Artificial através do Genkit.
- Para usar essas funcionalidades, você precisará de uma chave de API do Google GenAI.
- Crie um arquivo `.env.local` na raiz do projeto (se ainda não existir) e adicione sua chave:
  ```env
  GOOGLE_GENAI_API_KEY=SUA_CHAVE_API_AQUI
  ```
- Se a chave não for fornecida, as funcionalidades de IA não estarão ativas, mas o restante da aplicação deve funcionar normalmente.

## Estrutura do Projeto (Principais Pastas)

- `src/app`: Contém as rotas e páginas da aplicação (usando o App Router do Next.js).
- `src/components`: Componentes React reutilizáveis.
  - `src/components/ui`: Componentes da biblioteca ShadCN UI.
- `src/lib`: Utilitários e lógica principal, como `db.ts` para interações com o banco de dados.
- `src/actions`: Server Actions do Next.js para mutações de dados.
- `src/ai`: Lógica relacionada à Inteligência Artificial com Genkit.
- `public`: Arquivos estáticos, como imagens e uploads.

## Começando

Para explorar a aplicação, comece navegando pelas diferentes seções do menu lateral após iniciar o servidor de desenvolvimento. A página inicial (`src/app/(app)/page.tsx`) serve como o dashboard principal.

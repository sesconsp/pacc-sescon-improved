# Guia de Execução e Integração com Backend

Este guia complementa o `README_INSTRUCOES.md` com foco em como rodar o projeto baixado do GitHub e os passos necessários para salvar os dados do formulário em um banco de dados real.

## 1. Rodando o Projeto do GitHub

Se você clonou o repositório do GitHub (`https://github.com/sesconsp/pacc-sescon-improved`), siga estes passos:

1.  **Instale as dependências**:
    ```bash
    npm install
    ```
2.  **Rode o servidor de desenvolvimento**:
    ```bash
    npm run dev
    ```
3.  Acesse `http://localhost:5173` no seu navegador.

## 2. Como Salvar os Dados do Formulário (Backend)

Atualmente, o formulário é **Frontend-Only**, ou seja, ele roda apenas no navegador do usuário e não tem um servidor para receber e salvar os dados permanentemente. Para transformar isso em uma aplicação completa, você tem três caminhos principais:

### Opção A: Usar um Backend como Serviço (Mais Fácil)

Ferramentas como **Firebase** (Google) ou **Supabase** permitem criar um banco de dados sem configurar servidores.

1.  Crie uma conta no [Supabase](https://supabase.com/).
2.  Crie um novo projeto e uma tabela chamada `cadastros_sescon`.
3.  No seu código (`Home.tsx`), instale a biblioteca do Supabase:
    ```bash
    npm install @supabase/supabase-js
    ```
4.  Substitua a função `enviarDados` para salvar no Supabase em vez de apenas mostrar um alerta.

### Opção B: Criar uma API Própria (Intermediário)

Você pode usar o arquivo `server/index.ts` que já existe no projeto para criar uma API simples.

1.  Instale o `body-parser` para ler os dados enviados:
    ```bash
    npm install body-parser
    ```
2.  No `server/index.ts`, adicione uma rota POST:
    ```typescript
    app.use(express.json());

    app.post('/api/salvar', (req, res) => {
      const dados = req.body;
      console.log("Dados recebidos:", dados);
      // Aqui você conectaria com um banco de dados (MySQL, Postgres, etc.)
      // Para teste, pode salvar em um arquivo JSON local
      res.json({ sucesso: true, mensagem: "Dados recebidos!" });
    });
    ```
3.  No `Home.tsx`, altere o envio para chamar essa rota:
    ```typescript
    await fetch('/api/salvar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cnpjEscritorio, clientes })
    });
    ```

### Opção C: Integração com Ferramentas de Automação (No-Code)

Se não quiser programar o backend, você pode enviar os dados para o **n8n**, **Zapier** ou **Make**.

1.  Crie um Webhook nessas plataformas.
2.  No `Home.tsx`, faça o `fetch` para a URL do Webhook.
3.  A plataforma recebe os dados e pode salvar numa planilha do Google Sheets, enviar por e-mail ou salvar num banco de dados.

## 3. Próximos Passos Recomendados

Para um ambiente de produção profissional, recomendamos a **Opção A (Supabase)** pela facilidade de manutenção e segurança, ou a **Opção B** se você já tiver uma infraestrutura de servidores (VPS) disponível.

# Guia Passo a Passo: Central de Atualização SESCON-SP

Este guia foi preparado especialmente para iniciantes. Ele explica como rodar, editar e colocar no ar o formulário que acabamos de criar.

## 1. Preparando o Seu Computador

Antes de começar, você precisará de duas ferramentas essenciais instaladas no seu computador:

1.  **Node.js**: É o "motor" que faz o nosso projeto funcionar.
    *   Baixe a versão **LTS** (Long Term Support) no site oficial: [nodejs.org](https://nodejs.org/).
    *   Instale seguindo o padrão "Next > Next > Finish".
2.  **VS Code (Visual Studio Code)**: É o editor de código onde você vai mexer nos arquivos.
    *   Baixe gratuitamente em: [code.visualstudio.com](https://code.visualstudio.com/).

## 2. Baixando e Instalando o Projeto

1.  **Baixe o Código**: Pegue a pasta do projeto que você recebeu (ou baixou daqui).
2.  **Abra no VS Code**:
    *   Abra o VS Code.
    *   Vá em `File > Open Folder` (Arquivo > Abrir Pasta).
    *   Selecione a pasta `pacc-sescon-improved`.
3.  **Abra o Terminal**:
    *   No VS Code, vá no menu superior `Terminal > New Terminal`.
    *   Uma janelinha preta vai abrir na parte de baixo.
4.  **Instale as Dependências**:
    *   Digite o comando abaixo no terminal e aperte Enter:
        ```bash
        npm install
        ```
    *   Aguarde até que o processo termine. Isso vai baixar todas as bibliotecas que usamos (como o React, os ícones, as animações, etc.).

## 3. Rodando o Projeto no Seu Computador

Para ver o formulário funcionando na sua máquina:

1.  No terminal do VS Code, digite:
    ```bash
    npm run dev
    ```
2.  Você verá uma mensagem como `Local: http://localhost:5173/`.
3.  Segure a tecla `Ctrl` e clique nesse link, ou abra seu navegador e digite `http://localhost:5173`.
4.  Pronto! O formulário deve aparecer na sua tela.

## 4. Entendendo a Estrutura (Onde mudar as coisas?)

Aqui está um mapa simples de onde estão os arquivos importantes caso você queira mudar algo:

*   **Onde está o código da página?**
    *   Vá em `client/src/pages/Home.tsx`.
    *   É aqui que está todo o formulário, os textos, os botões e a lógica.
*   **Onde mudo as cores?**
    *   No arquivo `Home.tsx`, procure pelas linhas que começam com `const SESCON_BLUE = ...`. Lá você pode trocar os códigos de cor hexadecimal.
*   **Onde coloco o logo?**
    *   As imagens ficam na pasta `client/public/`.
    *   Para trocar o logo, basta colocar seu arquivo de imagem lá e mudar o nome no código `Home.tsx` onde diz `<img src="/seu-logo.png" ... />`.

## 5. Como Colocar na Internet (Deploy)

A maneira mais fácil e gratuita para iniciantes é usar a **Vercel**:

1.  Crie uma conta em [vercel.com](https://vercel.com/).
2.  Instale o "Vercel CLI" no seu computador digitando no terminal:
    ```bash
    npm i -g vercel
    ```
3.  No terminal do VS Code (dentro da pasta do projeto), digite:
    ```bash
    vercel
    ```
4.  Vá respondendo as perguntas com `Enter` (pode aceitar todas as opções padrão).
5.  No final, ele vai te dar um link (ex: `https://pacc-sescon-improved.vercel.app`). Esse é o link do seu site no ar!

## 6. Funcionalidades Importantes que Implementamos

*   **Barra de Progresso**: Mostra visualmente em que etapa o usuário está.
*   **Validação em Tempo Real**: Avisa na hora se o e-mail ou CNPJ estão errados.
*   **Rascunho Automático**: Se o usuário fechar a página, os dados não somem (ficam salvos no navegador dele vinculados ao CNPJ).
*   **Proteção de Saída**: Se tentar fechar a aba sem salvar, o site pergunta se tem certeza.

---

**Dúvida comum:** "Preciso de banco de dados?"
*   Neste momento, o formulário é **Frontend-Only** (só a parte visual).
*   Para que o botão "Enviar" realmente mande os dados para algum lugar, você precisará integrar com uma API ou serviço de backend no futuro.

Se tiver dúvidas, consulte este guia novamente!

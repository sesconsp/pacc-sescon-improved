# Guia Mestre: Como Colocar o Formulário SESCON no Ar (Passo a Passo para Iniciantes)

Este guia reúne todas as instruções em um único lugar. Vamos pegar o código que criamos, configurar o Google para receber os dados e colocar o site na internet.

---

## Fase 1: Preparar o "Cérebro" (Google Sheets + Drive)

Antes de mexer no site, vamos preparar o lugar onde os dados serão salvos.

### 1. Criar a Pasta no Google Drive
1.  Acesse seu [Google Drive](https://drive.google.com).
2.  Clique em **Novo** > **Nova Pasta** e dê o nome de **"Contratos SESCON"**.
3.  Entre na pasta criada.
4.  Olhe para o endereço (URL) lá em cima no navegador. Ele será algo assim:
    `https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J`
5.  Copie apenas o código final (`1A2B3C4D5E6F7G8H9I0J`). Esse é o **ID da Pasta**. Guarde-o.

### 2. Criar a Planilha de Respostas
1.  Acesse [sheets.google.com](https://sheets.google.com) e crie uma planilha em branco.
2.  Dê o nome de **"Respostas SESCON"**.
3.  Na primeira linha, escreva os cabeçalhos nas colunas A até H:
    *   A: Data Envio
    *   B: CNPJ Escritório
    *   C: Razão Social Escritório
    *   D: E-mail Contato
    *   E: CNPJ Cliente
    *   F: Razão Social Cliente
    *   G: E-mail Cliente
    *   H: Link Contrato

### 3. Criar o Robô (Script)
1.  Na planilha, clique em **Extensões** > **Apps Script**.
2.  Apague todo o código que aparecer lá.
3.  Copie e cole o código abaixo:

```javascript
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var dataAtual = new Date();
    
    // *** COLE O ID DA SUA PASTA AQUI EMBAIXO ***
    var FOLDER_ID = "COLE_AQUI_O_ID_QUE_VOCE_COPIOU_DO_DRIVE"; 
    
    var cnpjEscritorio = dados.escritorio.cnpj;
    var razaoSocialEscritorio = dados.escritorio.razaoSocial;
    var emailEscritorio = dados.escritorio.email;
    var clientes = dados.clientes;
    var novasLinhas = [];
    
    for (var i = 0; i < clientes.length; i++) {
      var cliente = clientes[i];
      var emailCliente = cliente.emailPrincipal ? emailEscritorio : cliente.emailCustomizado;
      var linkArquivo = "Não enviado";
      
      if (cliente.arquivoBase64 && cliente.nomeArquivo) {
        try {
          var data = Utilities.base64Decode(cliente.arquivoBase64.split(',')[1]);
          var blob = Utilities.newBlob(data, cliente.tipoArquivo, cliente.nomeArquivo);
          var folder = DriveApp.getFolderById(FOLDER_ID);
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          linkArquivo = file.getUrl();
        } catch (erro) { linkArquivo = "Erro: " + erro.toString(); }
      }
      
      novasLinhas.push([dataAtual, cnpjEscritorio, razaoSocialEscritorio, emailEscritorio, cliente.cnpj, cliente.razaoSocial, emailCliente, linkArquivo]);
    }
    
    if (novasLinhas.length > 0) sheet.getRange(sheet.getLastRow() + 1, 1, novasLinhas.length, novasLinhas[0].length).setValues(novasLinhas);
    
    return ContentService.createTextOutput(JSON.stringify({'result': 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({'result': 'error', 'error': error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

4.  **IMPORTANTE:** Substitua `COLE_AQUI_O_ID_QUE_VOCE_COPIOU_DO_DRIVE` pelo ID que você guardou no passo 1.
5.  Clique no disquete 💾 para Salvar. Dê o nome "API SESCON".

### 4. Publicar o Robô
1.  Clique no botão azul **Implantar** > **Nova implantação**.
2.  Clique na engrenagem ⚙️ > **App da Web**.
3.  Preencha assim:
    *   Descrição: API v1
    *   Executar como: **Eu** (seu e-mail)
    *   Quem pode acessar: **Qualquer pessoa** (Isso é essencial!)
4.  Clique em **Implantar**.
5.  O Google vai pedir permissão. Clique em **Autorizar acesso**, escolha sua conta. Se aparecer "O Google não verificou este app", clique em **Avançado** > **Acessar API SESCON (não seguro)**.
6.  Copie a **URL do App da Web** (começa com `https://script.google.com/...`).

---

## Fase 2: Preparar o Site

Agora vamos colocar esse link no código do site.

1.  Baixe os arquivos deste projeto (se ainda não baixou).
2.  Abra a pasta do projeto no **VS Code** (editor de código gratuito).
3.  No VS Code, abra o arquivo: `client` > `src` > `pages` > `Home.tsx`.
4.  Aperte `Ctrl + F` e procure por: `const GOOGLE_SHEETS_WEBHOOK_URL`.
5.  Vai estar assim: `const GOOGLE_SHEETS_WEBHOOK_URL = "";`
6.  Cole o link que você copiou do Google dentro das aspas.
    *   Ficará assim: `const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/SEU_CODIGO_GIGANTE/exec";`
7.  Salve o arquivo (`Ctrl + S`).

---

## Fase 3: Colocar na Internet (Deploy)

Vamos usar a **Vercel** (é grátis e fácil).

1.  Crie uma conta no [GitHub.com](https://github.com) e na [Vercel.com](https://vercel.com).
2.  Baixe e instale o **GitHub Desktop** no seu computador.
3.  Abra o GitHub Desktop e arraste a pasta do projeto para dentro dele.
4.  Escreva "Primeira versão" no campo de resumo e clique em **Commit to main**.
5.  Clique em **Publish repository** (botão azul no topo). Desmarque a opção "Keep this code private" se quiser que seja público (ou mantenha se preferir privado).
6.  Agora vá no site da **Vercel**:
    *   Clique em **Add New...** > **Project**.
    *   Escolha "Import" ao lado do projeto que você acabou de subir no GitHub.
    *   Clique em **Deploy**.
7.  Aguarde uns 2 minutos. Quando terminar, a Vercel vai te dar um link (ex: `pacc-sescon.vercel.app`).

**Pronto!** Seu formulário está no ar.
Qualquer pessoa que preencher e enviar terá os dados salvos na sua planilha e os contratos na sua pasta do Drive.

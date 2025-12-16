# Guia de Integração: Salvando Dados no Google Sheets

Este guia explica como configurar uma planilha do Google Sheets para receber automaticamente os dados enviados pelo formulário, sem precisar de servidores complexos ou custos adicionais. Usaremos o **Google Apps Script** para criar um "Webhook" gratuito.

## Passo 1: Preparar a Planilha

1.  Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha em branco.
2.  Dê o nome de **"Respostas SESCON"**.
3.  Na primeira linha (cabeçalho), crie as seguintes colunas:
    *   **A1:** Data Envio
    *   **B1:** CNPJ Escritório
    *   **C1:** Razão Social Escritório
    *   **D1:** E-mail Contato
    *   **E1:** Total Clientes
    *   **F1:** Dados JSON (Backup Completo)

## Passo 2: Criar o Script de Recebimento

1.  Na planilha, vá no menu **Extensões** > **Apps Script**.
2.  Uma nova aba abrirá com um editor de código. Apague tudo o que estiver lá e cole o seguinte código:

```javascript
function doPost(e) {
  try {
    // Ler os dados enviados pelo formulário
    var dados = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Pegar a data atual
    var dataAtual = new Date();
    
    // Adicionar linha na planilha
    sheet.appendRow([
      dataAtual,
      dados.escritorio.cnpj,
      dados.escritorio.razaoSocial,
      dados.escritorio.email,
      dados.clientes.length,
      JSON.stringify(dados.clientes) // Salva a lista completa de clientes numa célula
    ]);
    
    // Retornar sucesso
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar erro se algo falhar
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3.  Clique no ícone de disquete 💾 para **Salvar** (dê o nome de "API Formulario").

## Passo 3: Publicar o Webhook

1.  No canto superior direito, clique no botão azul **Implantar** (Deploy) > **Nova implantação**.
2.  Na janela que abrir:
    *   Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web**.
    *   **Descrição:** API Recebimento SESCON.
    *   **Executar como:** Eu (seu e-mail).
    *   **Quem pode acessar:** **Qualquer pessoa** (Isso é importante para o formulário conseguir enviar os dados sem login).
3.  Clique em **Implantar**.
4.  O Google pedirá permissão. Clique em **Autorizar acesso**, selecione sua conta e, se aparecer uma tela de aviso "O Google não verificou este app", clique em **Advanced (Avançado)** > **Go to API Formulario (unsafe)**.
5.  Copie o **URL do App da Web** gerado (começa com `https://script.google.com/macros/s/...`).

## Passo 4: Conectar no Formulário

Agora precisamos dizer ao nosso formulário para enviar os dados para esse link que você copiou.

1.  Abra o arquivo `client/src/pages/Home.tsx` no seu VS Code.
2.  Procure pela linha onde definimos a URL do Webhook (vou adicionar uma variável para isso no próximo passo do nosso chat).
3.  Cole o link do Google Apps Script nessa variável.

## Testando

1.  Rode o projeto (`npm run dev`).
2.  Preencha o formulário e clique em Enviar.
3.  Verifique se uma nova linha apareceu magicamente na sua planilha do Google Sheets!

---

**Observação Importante:** O Google Apps Script pode demorar alguns segundos para processar. Se o formulário der erro de "CORS", pode ser necessário usar um proxy, mas o código acima geralmente funciona bem para envios simples.

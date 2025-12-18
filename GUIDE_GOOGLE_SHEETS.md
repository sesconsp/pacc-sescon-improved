# Guia de Integração: Salvando Dados no Google Sheets (Versão Detalhada)

Este guia explica como configurar uma planilha do Google Sheets para receber automaticamente os dados enviados pelo formulário. Nesta versão, **cada cliente adicionado será salvo em uma linha separada**, repetindo os dados do escritório para facilitar a organização.

## Passo 1: Preparar a Planilha

1.  Acesse [sheets.google.com](https://sheets.google.com) e crie uma nova planilha em branco.
2.  Dê o nome de **"Respostas SESCON Detalhado"**.
3.  Na primeira linha (cabeçalho), crie exatamente as seguintes colunas (na ordem):
    *   **A1:** Data Envio
    *   **B1:** CNPJ Escritório
    *   **C1:** Razão Social Escritório
    *   **D1:** E-mail Contato Escritório
    *   **E1:** CNPJ Cliente
    *   **F1:** Razão Social Cliente
    *   **G1:** E-mail Contato Cliente
    *   **H1:** Nome Arquivo Contrato (Apenas informativo)

## Passo 2: Criar o Script de Recebimento

1.  Na planilha, vá no menu **Extensões** > **Apps Script**.
2.  Uma nova aba abrirá com um editor de código. Apague tudo o que estiver lá e cole o seguinte código:

```javascript
function doPost(e) {
  try {
    // Ler os dados enviados pelo formulário
    var dados = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var dataAtual = new Date();
    
    // Dados do escritório (comuns a todas as linhas deste envio)
    var cnpjEscritorio = dados.escritorio.cnpj;
    var razaoSocialEscritorio = dados.escritorio.razaoSocial;
    var emailEscritorio = dados.escritorio.email;
    
    // Iterar sobre cada cliente e adicionar uma linha
    var clientes = dados.clientes;
    
    // Preparar array para adicionar várias linhas de uma vez (mais rápido)
    var novasLinhas = [];
    
    for (var i = 0; i < clientes.length; i++) {
      var cliente = clientes[i];
      
      // Definir qual e-mail do cliente usar
      var emailCliente = cliente.emailPrincipal ? emailEscritorio : cliente.emailCustomizado;
      
      // Pegar nome do arquivo se existir
      var nomeArquivo = cliente.contratosocial ? cliente.contratosocial.name : "Não enviado";
      
      novasLinhas.push([
        dataAtual,
        cnpjEscritorio,
        razaoSocialEscritorio,
        emailEscritorio,
        cliente.cnpj,
        cliente.razaoSocial,
        emailCliente,
        nomeArquivo
      ]);
    }
    
    // Se houver linhas para adicionar, escreve na planilha
    if (novasLinhas.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, novasLinhas.length, novasLinhas[0].length).setValues(novasLinhas);
    }
    
    // *** ENVIO DE E-MAIL DE CONFIRMAÇÃO ***
    try {
      var assunto = "Confirmação de Envio - Central SESCON-SP";
      var corpo = "Olá, " + razaoSocialEscritorio + "!\n\n" +
                  "Recebemos seus dados com sucesso.\n\n" +
                  "Resumo do Envio:\n" +
                  "- CNPJ do Escritório: " + cnpjEscritorio + "\n" +
                  "- Total de Clientes: " + clientes.length + "\n" +
                  "- Data de Recebimento: " + Utilities.formatDate(dataAtual, "GMT-3", "dd/MM/yyyy HH:mm:ss") + "\n\n" +
                  "Agradecemos sua colaboração.\n\n" +
                  "Atenciosamente,\n" +
                  "Equipe SESCON-SP";
      
      MailApp.sendEmail({
        to: emailEscritorio,
        subject: assunto,
        body: corpo
      });
    } catch (erroEmail) {
      // Se der erro no email, não faz nada, apenas segue (os dados já foram salvos)
    }

    // Retornar sucesso
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Retornar erro se algo falhar
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3.  Clique no ícone de disquete 💾 para **Salvar** (dê o nome de "API Formulario Detalhado").

## Passo 3: Publicar o Webhook

1.  No canto superior direito, clique no botão azul **Implantar** (Deploy) > **Nova implantação**.
2.  Na janela que abrir:
    *   Clique na engrenagem ⚙️ ao lado de "Selecionar tipo" e escolha **App da Web**.
    *   **Descrição:** API Recebimento SESCON Detalhado.
    *   **Executar como:** Eu (seu e-mail).
    *   **Quem pode acessar:** **Qualquer pessoa** (Isso é importante para o formulário conseguir enviar os dados sem login).
3.  Clique em **Implantar**.
4.  O Google pedirá permissão. Clique em **Autorizar acesso**, selecione sua conta e, se aparecer uma tela de aviso "O Google não verificou este app", clique em **Advanced (Avançado)** > **Go to API Formulario Detalhado (unsafe)**.
5.  Copie o **URL do App da Web** gerado (começa com `https://script.google.com/macros/s/...`).

## Passo 4: Conectar no Formulário

1.  Abra o arquivo `client/src/pages/Home.tsx` no seu VS Code.
2.  Procure pela variável `const GOOGLE_SHEETS_WEBHOOK_URL = "";` (perto da linha 484).
3.  Cole o link que você copiou entre as aspas.

---

**Nota sobre Upload de Arquivos:**
O Google Sheets **não** consegue receber o arquivo PDF diretamente via JSON. O script acima salvará apenas o **nome do arquivo** na coluna H para conferência. O arquivo real continua sendo salvo apenas no backup JSON baixado no computador do usuário. Para salvar o arquivo na nuvem (Google Drive), seria necessário uma integração mais complexa enviando o arquivo em Base64, o que pode exceder os limites de tamanho do Google Apps Script.

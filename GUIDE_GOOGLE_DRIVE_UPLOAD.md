# Guia Avançado: Upload de Arquivos para o Google Drive

Este guia explica como atualizar sua integração para permitir que os arquivos (Contrato Social) sejam enviados e salvos automaticamente em uma pasta do seu Google Drive.

> **Atenção:** O Google Apps Script tem um limite de execução de 6 minutos e limite de tamanho de payload. Esta solução funciona bem para arquivos pequenos/médios (até ~5MB). Para arquivos maiores, recomenda-se um backend profissional.

## Passo 1: Criar a Pasta no Google Drive

1.  Acesse seu [Google Drive](https://drive.google.com).
2.  Crie uma nova pasta chamada **"Contratos SESCON"**.
3.  Abra a pasta e copie o **ID da pasta** que aparece na URL do navegador.
    *   Exemplo de URL: `drive.google.com/drive/folders/1a2b3c4d5e6f7g8h9i0j`
    *   O ID é a parte final: `1a2b3c4d5e6f7g8h9i0j`.

## Passo 2: Atualizar o Script do Google Sheets

Vamos modificar o script anterior para aceitar arquivos em formato Base64 e salvá-los no Drive.

1.  Volte para sua planilha > **Extensões** > **Apps Script**.
2.  Substitua TODO o código anterior pelo novo código abaixo:

```javascript
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var dataAtual = new Date();
    
    // ID da pasta do Google Drive onde os arquivos serão salvos
    // SUBSTITUA PELO ID DA SUA PASTA AQUI
    var FOLDER_ID = "COLE_O_ID_DA_SUA_PASTA_AQUI"; 
    
    var cnpjEscritorio = dados.escritorio.cnpj;
    var razaoSocialEscritorio = dados.escritorio.razaoSocial;
    var emailEscritorio = dados.escritorio.email;
    var clientes = dados.clientes;
    var novasLinhas = [];
    
    for (var i = 0; i < clientes.length; i++) {
      var cliente = clientes[i];
      var emailCliente = cliente.emailPrincipal ? emailEscritorio : cliente.emailCustomizado;
      var linkArquivo = "Não enviado";
      
      // Processar upload de arquivo se existir
      if (cliente.arquivoBase64 && cliente.nomeArquivo) {
        try {
          // Decodificar Base64
          var data = Utilities.base64Decode(cliente.arquivoBase64.split(',')[1]);
          var blob = Utilities.newBlob(data, cliente.tipoArquivo, cliente.nomeArquivo);
          
          // Salvar no Drive
          var folder = DriveApp.getFolderById(FOLDER_ID);
          var file = folder.createFile(blob);
          
          // Definir permissão de visualização (opcional)
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          
          // Pegar o link direto
          linkArquivo = file.getUrl();
        } catch (erroArquivo) {
          linkArquivo = "Erro no upload: " + erroArquivo.toString();
        }
      }
      
      novasLinhas.push([
        dataAtual,
        cnpjEscritorio,
        razaoSocialEscritorio,
        emailEscritorio,
        cliente.cnpj,
        cliente.razaoSocial,
        emailCliente,
        linkArquivo // Agora salva o LINK do arquivo no Drive
      ]);
    }
    
    if (novasLinhas.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, novasLinhas.length, novasLinhas[0].length).setValues(novasLinhas);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3.  **Importante:** Cole o ID da sua pasta na linha indicada (`var FOLDER_ID = "..."`).
4.  Salve o projeto 💾.

## Passo 3: Atualizar a Implantação (Deploy)

Sempre que você altera o código do Apps Script, precisa criar uma **NOVA** implantação para que as mudanças valham.

1.  Clique em **Implantar** > **Gerenciar implantações**.
2.  Clique no ícone de lápis ✏️ (Editar) na implantação ativa.
3.  Em "Versão", escolha **Nova versão**.
4.  Clique em **Implantar**.
5.  O Google pedirá novas permissões (agora para acessar o Google Drive). Autorize novamente.

## Passo 4: O Frontend já está pronto?

Sim! Vou atualizar o código do site (`Home.tsx`) no próximo passo para converter automaticamente os arquivos PDF para Base64 antes de enviar. Você só precisa garantir que a URL do Webhook no código do site esteja correta.

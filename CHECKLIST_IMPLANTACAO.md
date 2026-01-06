# Checklist de Implantação: Google Sheets + Google Drive

## O que você precisa fazer para colocar o sistema em funcionamento

Este documento é um **passo a passo prático** para conectar o formulário ao Google Sheets e Google Drive. Siga cada item na ordem.

---

## ✅ PASSO 1: Preparar o Google Drive

### O que fazer:
1.  Acesse seu [Google Drive](https://drive.google.com).
2.  Clique com botão direito em uma área vazia.
3.  Selecione **"Nova pasta"**.
4.  Nomeie como: **`Contratos SESCON`**
5.  Abra a pasta que acabou de criar.
6.  **Copie o ID da pasta** da URL:
    - A URL será algo como: `https://drive.google.com/drive/folders/1A2B3C4D5E6F7G8H9I0J`
    - Copie apenas a parte: `1A2B3C4D5E6F7G8H9I0J`
7.  **Guarde esse ID em um local seguro** (você vai precisar dele).

### Resultado esperado:
- [ ] Pasta "Contratos SESCON" criada no Drive
- [ ] ID da pasta copiado e guardado

---

## ✅ PASSO 2: Preparar a Planilha Google Sheets

### O que fazer:
1.  Acesse [Google Sheets](https://sheets.google.com).
2.  Clique em **"+ Criar"** (nova planilha).
3.  Nomeie como: **`Central SESCON - Dados de Envio`**
4.  Na primeira linha, crie os cabeçalhos (copie exatamente):

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Data Envio | CNPJ Escritório | Razão Social Escritório | E-mail Escritório | CNPJ Cliente | Razão Social Cliente | E-mail Cliente | Link Contrato |

5.  **Copie o ID da planilha** da URL:
    - A URL será algo como: `https://docs.google.com/spreadsheets/d/1A2B3C4D5E6F7G8H9I0J/edit`
    - Copie apenas a parte: `1A2B3C4D5E6F7G8H9I0J`
6.  **Guarde esse ID também** (você vai precisar dele).

### Resultado esperado:
- [ ] Planilha criada com os cabeçalhos corretos
- [ ] ID da planilha copiado e guardado

---

## ✅ PASSO 3: Criar o Google Apps Script (O "Robô")

### O que fazer:
1.  Na sua planilha Google Sheets, clique em **"Extensões"** (no menu superior).
2.  Selecione **"Apps Script"**.
3.  Uma aba nova vai abrir com um editor de código.
4.  **Apague todo o código** que estiver lá (geralmente tem um `function myFunction() {}`).
5.  **Cole este código completo:**

```javascript
function doPost(e) {
  try {
    var dados = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // *** SUBSTITUA PELO ID DA SUA PASTA AQUI ***
    var FOLDER_ID = "COLE_O_ID_DA_SUA_PASTA_AQUI"; 
    
    var clientes = dados.clientes;
    var novasLinhas = [];
    
    for (var i = 0; i < clientes.length; i++) {
      var c = clientes[i];
      var link = "";
      
      // Se houver arquivo, salva no Drive
      if (c.contratosocial && c.contratosocial.data) {
        try {
          var blob = Utilities.newBlob(Utilities.base64Decode(c.contratosocial.data), "application/pdf", c.contratosocial.name);
          var folder = DriveApp.getFolderById(FOLDER_ID);
          var file = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          link = file.getUrl();
        } catch (e) {}
      }
      
      novasLinhas.push([
        new Date(),
        dados.escritorio.cnpj,
        dados.escritorio.razaoSocial,
        dados.escritorio.email,
        c.cnpj,
        c.razaoSocial,
        c.emailPrincipal || "",
        link
      ]);
    }
    
    if (novasLinhas.length > 0) {
      sheet.getRange(sheet.getLastRow() + 1, 1, novasLinhas.length, novasLinhas[0].length).setValues(novasLinhas);
    }
    
    // *** ENVIO DE E-MAIL DE CONFIRMAÇÃO (HTML) ***
    try {
      var assunto = "Confirmação de Envio - Central SESCON-SP";
      var dataFormatada = Utilities.formatDate(new Date(), "GMT-3", "dd/MM/yyyy HH:mm:ss");
      
      var htmlBody = 
        '<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">' +
          '<div style="background-color: #003d7a; padding: 20px; text-align: center;">' +
            '<img src="https://sescon.org.br/wp-content/uploads/2017/10/logo_sescon_sp.png" alt="SESCON-SP" style="max-height: 60px; background-color: white; padding: 5px; border-radius: 4px;">' +
          '</div>' +
          '<div style="padding: 30px; background-color: #ffffff;">' +
            '<h2 style="color: #003d7a; margin-top: 0;">Recebemos seus dados!</h2>' +
            '<p style="color: #555; font-size: 16px;">Olá, <strong>' + dados.escritorio.razaoSocial + '</strong>.</p>' +
            '<p style="color: #555; font-size: 16px;">Confirmamos o recebimento da sua lista de clientes através da Central de Atualização.</p>' +
            
            '<div style="background-color: #f8f9fa; border-left: 4px solid #003d7a; padding: 15px; margin: 20px 0;">' +
              '<p style="margin: 5px 0; color: #333;"><strong>CNPJ do Escritório:</strong> ' + dados.escritorio.cnpj + '</p>' +
              '<p style="margin: 5px 0; color: #333;"><strong>Total de Clientes:</strong> ' + clientes.length + '</p>' +
              '<p style="margin: 5px 0; color: #333;"><strong>Data de Recebimento:</strong> ' + dataFormatada + '</p>' +
            '</div>' +
            
            '<p style="color: #555; font-size: 14px;">Seus dados foram salvos com segurança e serão processados em breve.</p>' +
            '<hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">' +
            '<p style="color: #888; font-size: 12px; text-align: center;">Este é um e-mail automático, por favor não responda.</p>' +
          '</div>' +
          '<div style="background-color: #f1f1f1; padding: 15px; text-align: center; color: #666; font-size: 12px;">' +
            '© ' + new Date().getFullYear() + ' SESCON-SP. Todos os direitos reservados.' +
          '</div>' +
        '</div>';
      
      MailApp.sendEmail({
        to: dados.escritorio.email,
        subject: assunto,
        htmlBody: htmlBody
      });
    } catch (erroEmail) {
      // Se der erro no email, não faz nada
    }

    return ContentService.createTextOutput(JSON.stringify({'result':'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({'result':'error','error':error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}
```

6.  **Procure pela linha que diz:** `var FOLDER_ID = "COLE_O_ID_DA_SUA_PASTA_AQUI";`
7.  **Substitua** `COLE_O_ID_DA_SUA_PASTA_AQUI` pelo **ID da pasta do Drive** que você copiou no Passo 1.
    - Exemplo: `var FOLDER_ID = "1A2B3C4D5E6F7G8H9I0J";`

8.  Clique em **"Salvar"** (ícone de disquete ou Ctrl+S).

### Resultado esperado:
- [ ] Código colado no Apps Script
- [ ] ID da pasta do Drive inserido corretamente
- [ ] Código salvo sem erros

---

## ✅ PASSO 4: Publicar o Apps Script como Webhook

### O que fazer:
1.  No editor do Apps Script, clique no botão azul **"Implantar"** (canto superior direito).
2.  Clique em **"Nova implantação"**.
3.  Clique na engrenagem ⚙️ e selecione **"App da Web"**.
4.  Preencha assim:
    - **Executar como:** Sua conta Google (padrão)
    - **Quem pode acessar:** **Qualquer pessoa** (MUITO IMPORTANTE!)
5.  Clique em **"Implantar"**.
6.  Uma janela vai pedir autorização. Clique em **"Autorizar"**.
7.  Selecione sua conta Google.
8.  Clique em **"Avançado"** (se aparecer um aviso de segurança).
9.  Clique em **"Acessar [Seu Nome] (inseguro)"** (é seguro, é só o Google sendo cauteloso).
10. **Copie a URL do App da Web** que aparecer:
    - Será algo como: `https://script.google.com/macros/s/AKfycbwXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/usercoderun`
11. **Guarde essa URL** (você vai colar no código do site).

### Resultado esperado:
- [ ] Apps Script publicado como "App da Web"
- [ ] Acesso configurado para "Qualquer pessoa"
- [ ] URL do webhook copiada e guardada

---

## ✅ PASSO 5: Conectar o Site ao Webhook

### O que fazer:
1.  Abra o arquivo `Home.tsx` do seu projeto (no VS Code ou editor).
2.  Procure pela linha que diz: `const GOOGLE_SHEETS_WEBHOOK_URL = "";`
3.  **Cole a URL do webhook** entre as aspas:
    - Exemplo: `const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbwXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx/usercoderun";`

4.  **Salve o arquivo** (Ctrl+S).
5.  Se o site estiver rodando localmente, ele vai recarregar automaticamente.
6.  Se estiver hospedado (Vercel), faça um novo deploy.

### Resultado esperado:
- [ ] URL do webhook inserida no código
- [ ] Arquivo salvo
- [ ] Site recarregado/redeploy feito

---

## ✅ PASSO 6: Teste Completo

### O que fazer:
1.  Acesse o site (localmente ou no link da Vercel).
2.  Preencha o formulário com dados de teste:
    - **CNPJ:** `11.222.333/0001-81` (CNPJ válido para teste)
    - **Nome:** Qualquer nome
    - **E-mail:** Seu e-mail pessoal (para receber o e-mail de confirmação)
3.  Adicione 2-3 clientes de teste.
4.  Clique em **"Enviar Dados"**.
5.  **Verifique:**
    - [ ] Um arquivo `.json` foi baixado no seu computador?
    - [ ] Você recebeu um e-mail de confirmação com o template HTML?
    - [ ] Os dados aparecem na planilha Google Sheets?
    - [ ] Os arquivos PDF aparecem na pasta do Google Drive?

### Se tudo funcionou:
✅ **Parabéns! O sistema está 100% operacional!**

### Se algo não funcionou:
- Verifique se a URL do webhook está correta.
- Verifique se o ID da pasta está correto.
- Verifique se o Apps Script está publicado como "Qualquer pessoa".
- Verifique se o e-mail está correto no formulário.

---

## ✅ PASSO 7: Publicar o Site (Vercel)

### O que fazer:
1.  Se ainda não fez, crie uma conta em [Vercel](https://vercel.com).
2.  Conecte sua conta GitHub ao Vercel.
3.  Importe o repositório `pacc-sescon-improved`.
4.  Clique em **"Deploy"**.
5.  Aguarde a implantação (geralmente leva 2-3 minutos).
6.  Você receberá um link público (ex: `pacc-sescon-improved.vercel.app`).
7.  **Compartilhe esse link** com os escritórios do SESCON.

### Resultado esperado:
- [ ] Site publicado e acessível online
- [ ] Link compartilhado com os usuários

---

## ✅ PASSO 8: Configurar Domínio Personalizado (Opcional)

### O que fazer:
1.  Se tiver um domínio próprio (ex: `atualizacao.sescon.org.br`):
    - Acesse as configurações do Vercel.
    - Vá em **"Domains"**.
    - Adicione seu domínio.
    - Siga as instruções para apontar o DNS.

### Resultado esperado:
- [ ] Domínio personalizado configurado (opcional)

---

## 📋 Checklist Final

Marque cada item conforme completar:

- [ ] Pasta "Contratos SESCON" criada no Drive
- [ ] ID da pasta do Drive copiado
- [ ] Planilha Google Sheets criada com cabeçalhos
- [ ] ID da planilha copiado
- [ ] Código do Apps Script colado
- [ ] ID da pasta inserido no código do Apps Script
- [ ] Apps Script salvo
- [ ] Apps Script publicado como "App da Web"
- [ ] Acesso configurado para "Qualquer pessoa"
- [ ] URL do webhook copiada
- [ ] URL do webhook inserida no `Home.tsx`
- [ ] Site salvo/redeploy feito
- [ ] Teste completo realizado com sucesso
- [ ] E-mail de confirmação recebido
- [ ] Dados apareceram na planilha
- [ ] Arquivos apareceram no Drive
- [ ] Site publicado na Vercel
- [ ] Link compartilhado com os usuários

---

## 🆘 Troubleshooting (Solução de Problemas)

### Problema: "Erro ao enviar dados"
**Solução:** Verifique se a URL do webhook está correta e se o Apps Script está publicado.

### Problema: "Dados não aparecem na planilha"
**Solução:** Verifique se o Apps Script está autorizado a acessar a planilha. Tente publicar novamente.

### Problema: "E-mail não é recebido"
**Solução:** Verifique se o e-mail está correto. Verifique a pasta de Spam do Gmail.

### Problema: "Arquivo não é salvo no Drive"
**Solução:** Verifique se o ID da pasta está correto e se o Apps Script tem permissão para acessar o Drive.

### Problema: "Não consigo publicar o Apps Script"
**Solução:** Verifique se você está logado com a conta Google correta. Tente fazer logout e login novamente.

---

## 📞 Próximos Passos

Após completar todos os passos:

1.  **Teste com Usuários Reais:** Peça para 2-3 escritórios testarem o sistema.
2.  **Monitore os Dados:** Acompanhe a planilha para garantir que os dados estão chegando corretamente.
3.  **Crie um Dashboard:** Use Google Data Studio para visualizar os dados em gráficos.
4.  **Treine os Usuários:** Crie um vídeo tutorial mostrando como usar o sistema.

---

## 📚 Referências

- [Google Sheets API](https://developers.google.com/sheets)
- [Google Drive API](https://developers.google.com/drive)
- [Google Apps Script Documentation](https://developers.google.com/apps-script)

---

**Última atualização:** Janeiro de 2026
**Versão:** 1.0

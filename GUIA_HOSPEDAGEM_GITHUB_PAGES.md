# Hospedagem com GitHub Pages vs Vercel

## A Resposta Rápida

**Sim, você pode usar GitHub Pages!** Mas há diferenças importantes que você precisa entender.

---

## Comparação: GitHub Pages vs Vercel

| Aspecto | GitHub Pages | Vercel | Manus |
|--------|-------------|--------|-------|
| **Custo** | Gratuito | Gratuito (com limite) | Gratuito (com limite) |
| **Facilidade** | Média | Muito fácil | Muito fácil |
| **Velocidade de Deploy** | 1-2 minutos | 30 segundos | Instantâneo |
| **Domínio Personalizado** | Sim | Sim | Sim |
| **SSL/HTTPS** | Sim (automático) | Sim (automático) | Sim (automático) |
| **Performance** | Boa | Excelente | Excelente |
| **Suporte a Webhook** | Não (apenas estático) | Sim | Sim |
| **Ideal para** | Sites estáticos | Apps React/Node | Apps React/Node |

---

## ⚠️ IMPORTANTE: Seu Projeto Precisa de Webhook!

Seu formulário **envia dados para o Google Apps Script** (webhook). Isso significa:

- **GitHub Pages:** ❌ **NÃO FUNCIONA** (só hospeda arquivos estáticos, sem servidor)
- **Vercel:** ✅ **FUNCIONA** (suporta webhooks e APIs)
- **Manus:** ✅ **FUNCIONA** (suporta webhooks e APIs)

### Por que GitHub Pages não funciona?
GitHub Pages só serve arquivos HTML, CSS e JavaScript estáticos. Ele **não pode fazer requisições POST** (enviar dados) para servidores externos de forma segura em produção.

---

## Opção 1: GitHub Pages + GitHub Actions (Avançado)

Se você realmente quer usar GitHub Pages, existe uma forma, mas é mais complexa:

### Como funciona:
1.  Você faz upload do código no GitHub.
2.  Um "robô" (GitHub Actions) compila o código.
3.  O site é publicado em `seu-usuario.github.io/pacc-sescon-improved`.

### Problema:
Mesmo assim, o webhook **não funcionará** porque GitHub Pages não tem servidor backend.

### Solução:
Você precisaria usar um serviço intermediário como:
- **Webhook.site** (apenas para testes)
- **Zapier** (mais complexo)
- **n8n** (mais complexo)

---

## Opção 2: GitHub Pages + Vercel (Recomendado)

**A melhor solução é usar AMBOS:**

1.  **GitHub:** Armazena o código (controle de versão).
2.  **Vercel:** Hospeda o site e processa os webhooks.

### Como funciona:
- Você faz push no GitHub.
- Vercel detecta a mudança automaticamente.
- Vercel faz deploy do site em segundos.
- Os webhooks funcionam perfeitamente.

**Isso é o que recomendamos!**

---

## Opção 3: GitHub Pages + Backend Próprio (Muito Avançado)

Se você tiver um servidor próprio (AWS, DigitalOcean, Heroku, etc.):

1.  Hospede o frontend no GitHub Pages.
2.  Hospede o backend em outro lugar.
3.  O frontend faz requisições para o backend.

**Problema:** Muito complexo para um projeto assim.

---

## Opção 4: Usar Manus (Mais Fácil)

A plataforma Manus (onde você está agora) oferece:
- ✅ Hospedagem gratuita
- ✅ Suporte a webhooks
- ✅ Domínio personalizado
- ✅ SSL automático
- ✅ Deploy instantâneo

**Recomendação:** Use Manus para hospedar!

---

## Como Publicar no GitHub Pages (Apenas para Referência)

Se você quer tentar mesmo assim, aqui está o passo a passo:

### Passo 1: Criar um repositório no GitHub
```bash
# Se ainda não criou
gh repo create pacc-sescon-improved --public
```

### Passo 2: Configurar o GitHub Pages
1.  Vá para o repositório no GitHub.
2.  Clique em **"Settings"** (Configurações).
3.  Vá em **"Pages"** (no menu esquerdo).
4.  Em "Source", selecione **"GitHub Actions"**.
5.  Clique em **"Configure"** ao lado de "Static HTML".

### Passo 3: Criar o arquivo de workflow
1.  GitHub vai criar um arquivo `.github/workflows/static.yml`.
2.  Aceite o padrão (não precisa alterar nada).

### Passo 4: Fazer push
```bash
git add .
git commit -m "Deploy no GitHub Pages"
git push origin main
```

### Passo 5: Aguardar
1.  Vá em **"Actions"** no GitHub.
2.  Aguarde o workflow terminar (verde = sucesso).
3.  Seu site estará em: `https://seu-usuario.github.io/pacc-sescon-improved`

### ⚠️ Problema:
O webhook **não vai funcionar** porque GitHub Pages não tem servidor.

---

## Minha Recomendação Final

### Para este projeto, use **Vercel** porque:

1. ✅ **Webhook funciona** (Google Apps Script consegue enviar dados)
2. ✅ **Deploy automático** (conecta ao GitHub, faz deploy a cada push)
3. ✅ **Gratuito** (até 100GB/mês)
4. ✅ **Muito rápido** (CDN global)
5. ✅ **Domínio personalizado** (ex: `atualizacao.sescon.org.br`)
6. ✅ **Suporte excelente**

### Se você insistir em GitHub Pages:

1. ⚠️ O webhook **não funcionará**
2. ⚠️ Os dados **não serão salvos** no Google Sheets
3. ⚠️ Os e-mails **não serão enviados**
4. ⚠️ Os contratos **não serão salvos** no Drive

**Você teria que reescrever todo o sistema para funcionar sem webhook, o que é muito mais complexo.**

---

## Passo a Passo: Vercel (Recomendado)

Se você quer usar Vercel (que é o melhor para este projeto):

### Passo 1: Criar conta na Vercel
1.  Acesse [vercel.com](https://vercel.com).
2.  Clique em **"Sign Up"**.
3.  Escolha **"Continue with GitHub"**.
4.  Autorize a Vercel a acessar seu GitHub.

### Passo 2: Importar o repositório
1.  Na Vercel, clique em **"New Project"**.
2.  Selecione o repositório **`pacc-sescon-improved`**.
3.  Clique em **"Import"**.

### Passo 3: Configurar
1.  **Project Name:** `pacc-sescon-improved` (ou outro nome)
2.  **Framework Preset:** Selecione **"Other"** (já que é React + Vite)
3.  **Build Command:** `pnpm build`
4.  **Output Directory:** `dist`
5.  Clique em **"Deploy"**.

### Passo 4: Aguardar
1.  Vercel vai compilar e fazer deploy.
2.  Você receberá um link: `pacc-sescon-improved.vercel.app`
3.  Seu site está no ar!

### Passo 5: Domínio Personalizado (Opcional)
1.  Na Vercel, vá em **"Settings"** > **"Domains"**.
2.  Adicione seu domínio (ex: `atualizacao.sescon.org.br`).
3.  Siga as instruções para apontar o DNS.

---

## Resumo

| Opção | Funciona? | Facilidade | Custo |
|-------|-----------|-----------|-------|
| GitHub Pages | ❌ Não | Fácil | Gratuito |
| Vercel | ✅ Sim | Muito fácil | Gratuito |
| Manus | ✅ Sim | Muito fácil | Gratuito |
| Backend Próprio | ✅ Sim | Difícil | Pago |

---

## Conclusão

**Use Vercel!** É a melhor opção para este projeto porque:
- O webhook funciona perfeitamente
- É gratuito
- É muito fácil de usar
- Tem excelente performance
- Suporta domínio personalizado

Se você usar GitHub Pages, o sistema **não vai funcionar** porque os dados não serão salvos no Google Sheets.

---

**Última atualização:** Janeiro de 2026
**Versão:** 1.0

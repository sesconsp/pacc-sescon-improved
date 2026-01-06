# Como Usar GitHub Pages com Google Sheets (Como no Exemplo)

## Entendi! Você quer fazer EXATAMENTE como o formulário de referência

Você está certo! O exemplo que você mostrou usa **GitHub Pages** para hospedar o HTML/JavaScript e **Google Apps Script** como backend. Isso **FUNCIONA SIM**, e é exatamente o que vamos fazer com seu projeto.

---

## A Diferença que Eu Expliquei Errado

Eu disse que GitHub Pages "não funciona com webhooks", mas estava **parcialmente errado**. O que eu quis dizer é:

- ❌ GitHub Pages **não pode receber** webhooks (não tem servidor)
- ✅ GitHub Pages **pode ENVIAR** webhooks (o JavaScript do navegador envia dados)

**Seu formulário faz exatamente isso:** O JavaScript envia os dados para o Google Apps Script (que é o servidor), e o Google Apps Script salva na planilha.

---

## Como Funciona o Fluxo (Exatamente como o Exemplo)

```
┌─────────────────────┐
│   Usuário acessa    │
│  GitHub Pages       │
│  (HTML + JS)        │
└──────────┬──────────┘
           │
           │ Usuário preenche e clica "Enviar"
           │
           ▼
┌─────────────────────┐
│  JavaScript envia   │
│  dados via POST     │
│  (fetch)            │
└──────────┬──────────┘
           │
           │ Requisição POST
           │
           ▼
┌─────────────────────┐
│ Google Apps Script  │
│ (Backend/Servidor)  │
└──────────┬──────────┘
           │
           │ Processa e salva
           │
           ▼
┌─────────────────────┐
│ Google Sheets       │
│ (Banco de Dados)    │
└─────────────────────┘
```

**Isso é exatamente o que seu projeto já faz!**

---

## Passo a Passo: Colocar no GitHub Pages (Como o Exemplo)

### PASSO 1: Preparar o Repositório GitHub

1.  Você já tem o repositório `pacc-sescon-improved` no GitHub.
2.  Vá para **Settings** > **Pages** (no menu esquerdo).
3.  Em "Source", selecione **"Deploy from a branch"**.
4.  Selecione a branch **"main"** e a pasta **"/ (root)"**.
5.  Clique em **"Save"**.

### PASSO 2: Preparar o Projeto para GitHub Pages

O seu projeto é React + Vite, então precisa ser compilado em arquivos estáticos (HTML, CSS, JS).

**Opção A: Usar GitHub Actions (Automático)**

1.  Crie um arquivo `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

2.  Faça commit e push:
```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Pages deployment"
git push origin main
```

3.  GitHub vai compilar e fazer deploy automaticamente.

**Opção B: Compilar Localmente e Fazer Upload**

1.  No seu computador, execute:
```bash
pnpm build
```

2.  Isso cria uma pasta `dist/` com os arquivos estáticos.

3.  Faça upload dessa pasta para o GitHub:
```bash
git add dist/
git commit -m "Add compiled files for GitHub Pages"
git push origin main
```

### PASSO 3: Configurar o Vite para GitHub Pages

Se o seu site vai ficar em `seu-usuario.github.io/pacc-sescon-improved/`, você precisa ajustar o Vite.

Abra o arquivo `vite.config.ts` e adicione:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pacc-sescon-improved/', // Adicione esta linha
})
```

### PASSO 4: Acessar o Site

Após o deploy, seu site estará em:
```
https://seu-usuario.github.io/pacc-sescon-improved/
```

Exemplo:
```
https://sesconsp.github.io/pacc-sescon-improved/
```

---

## Verificar se Está Funcionando

1.  Acesse o link acima.
2.  Preencha o formulário com dados de teste.
3.  Clique em "Enviar Dados".
4.  Verifique se:
   - [ ] O arquivo `.json` foi baixado?
   - [ ] Os dados aparecem no Google Sheets?
   - [ ] Você recebeu o e-mail de confirmação?

Se tudo funcionou, **parabéns! Está 100% operacional!**

---

## Comparação: GitHub Pages vs Vercel

| Aspecto | GitHub Pages | Vercel |
|---------|-------------|--------|
| **Hospedagem** | GitHub | Vercel |
| **Custo** | Gratuito | Gratuito |
| **Facilidade** | Média (precisa compilar) | Muito fácil (automático) |
| **Deploy** | Manual ou GitHub Actions | Automático |
| **Webhook** | ✅ Funciona | ✅ Funciona |
| **Performance** | Boa | Excelente |
| **Domínio Personalizado** | Sim | Sim |

---

## Resumo

**Seu projeto PODE ser hospedado no GitHub Pages**, exatamente como o exemplo que você mostrou:

1. ✅ Frontend (HTML + React) no GitHub Pages
2. ✅ Backend (Google Apps Script) no Google
3. ✅ Banco de Dados (Google Sheets) no Google
4. ✅ Webhook funciona perfeitamente

**Próximos passos:**
1. Configurar GitHub Actions ou compilar localmente
2. Fazer deploy para GitHub Pages
3. Testar o formulário completo
4. Compartilhar o link com os usuários

---

**Última atualização:** Janeiro de 2026
**Versão:** 1.0

# Resumo Completo: Central de Atualização SESCON-SP

## O que é o Sistema?

A **Central de Atualização SESCON-SP** é um formulário web profissional que permite que escritórios contábeis associados ao SESCON atualizem seus dados cadastrais e enviem a lista de clientes que representam de forma rápida, segura e organizada.

---

## Fluxo Completo do Sistema

### **FASE 1: O USUÁRIO ACESSA O SITE**

1.  O escritório acessa o link do site (ex: `pacc-sescon.vercel.app`).
2.  A página carrega com um design profissional em azul marinho (cores do SESCON).
3.  Na tela, aparecem:
    *   **Logo do SESCON-SP** no topo.
    *   **Barra de Progresso** indicando o avanço (começa em 50% na primeira aba).
    *   **Painel "Como Funciona"** explicando os 4 passos.
    *   **FAQ** com perguntas frequentes.
    *   **Duas Abas Principais:**
        - Aba 1: "Dados da Empresa"
        - Aba 2: "Gestão de Clientes"

---

### **FASE 2: PREENCHIMENTO DA ABA 1 - "DADOS DA EMPRESA"**

O usuário preenche as informações do seu escritório:

#### **Campos Obrigatórios:**
*   **CNPJ do Escritório:** O usuário digita o CNPJ (ex: `12.345.678/0001-99`).
    - O sistema **valida automaticamente** enquanto digita.
    - Se inválido, mostra mensagem de erro em vermelho.
    - Se válido, mostra confirmação em verde.

*   **Nome do Escritório:** Preenchido automaticamente pela Receita Federal após o CNPJ válido.
    - Não é editável (vem da base oficial).

*   **E-mail para Contato:** O usuário digita o e-mail do escritório.
    - O sistema **valida o formato** (ex: `contato@empresa.com.br`).
    - Se inválido, mostra erro em vermelho.

#### **Funcionalidades Extras:**
*   **Salvamento Automático (Rascunho):** Os dados são salvos automaticamente no navegador do usuário, vinculados ao CNPJ.
    - Se o usuário fechar a aba e voltar depois, os dados aparecem automaticamente.
    - Isso evita perda de informações.

*   **Botão "Salvar Rascunho":** Permite salvar manualmente e recebe uma confirmação.

*   **Botão "Limpar Rascunho":** Abre um **modal de confirmação** para evitar exclusão acidental.

*   **Indicador de Última Atualização:** Mostra quando o rascunho foi salvo pela última vez.

#### **Validação e Feedback:**
*   A barra de progresso sobe para **50%** quando os dados da empresa estão preenchidos.
*   Um **botão "Próximo"** fica habilitado para avançar para a próxima aba.

---

### **FASE 3: TRANSIÇÃO PARA ABA 2 - "GESTÃO DE CLIENTES"**

Quando o usuário clica em "Próximo":

1.  A página faz uma **transição suave** (animação fade-in) para a aba 2.
2.  A barra de progresso sobe para **90%**.
3.  O usuário vê a aba "Gestão de Clientes" com um novo campo no topo:

#### **Campo de Atividade Principal:**
*   **Seletor de Atividade:** O usuário escolhe entre:
    - **"Contabilidade"** → Continua com o fluxo normal (importar/adicionar clientes).
    - **"Outros"** → O formulário muda:
        - A aba de clientes é ocultada.
        - Um botão grande aparece: **"Ir para Atualização Cadastral"** (link externo).
        - Ao clicar, redireciona para o site de atualização do SESCON.

---

### **FASE 4: GESTÃO DE CLIENTES (Se Atividade = "Contabilidade")**

Aqui o usuário adiciona todos os seus clientes. Existem **3 formas** de fazer isso:

#### **Opção 1: Importar de Planilha Excel/CSV**
1.  O usuário clica em **"Importar Clientes"**.
2.  Seleciona um arquivo `.xlsx` ou `.csv` do seu computador.
3.  O sistema **valida automaticamente** cada linha:
    - Verifica se o CNPJ é válido.
    - Verifica se o nome da empresa está preenchido.
    - Verifica se o e-mail (se fornecido) é válido.
4.  Se houver erros, mostra uma **lista de problemas** para o usuário corrigir.
5.  Se tudo estiver correto, os clientes são adicionados à lista.

#### **Opção 2: Adicionar Clientes Manualmente**
1.  O usuário clica em **"Adicionar Cliente"**.
2.  Um **formulário modal** abre com os campos:
    - **CNPJ do Cliente** (com validação em tempo real).
    - **Razão Social** (nome da empresa).
    - **E-mail do Cliente** (opcional).
    - **Contrato Social** (upload de PDF, opcional).
3.  Ao clicar em "Salvar", o cliente é adicionado à lista.

#### **Opção 3: Buscar Cliente por CNPJ**
1.  O usuário digita um CNPJ na barra de busca.
2.  O sistema **busca automaticamente** os dados da Receita Federal.
3.  Se encontrar, preenche o nome da empresa automaticamente.
4.  O usuário confirma e o cliente é adicionado.

#### **Lista de Clientes:**
*   Cada cliente aparece em uma **linha com:**
    - CNPJ formatado.
    - Nome da empresa.
    - E-mail (se fornecido).
    - Ícone de contrato (se arquivo foi enviado).
    - Botão de **editar** e **deletar**.

*   A lista mostra o **total de clientes** no topo.
*   Há um **campo de busca** para encontrar clientes rapidamente.

---

### **FASE 5: UPLOAD DE CONTRATOS SOCIAIS**

Para cada cliente, o usuário pode fazer upload do **Contrato Social em PDF**:

1.  Clica no ícone de **upload** ou **"Adicionar Arquivo"**.
2.  Seleciona um arquivo `.pdf` do computador.
3.  O arquivo é **convertido para Base64** (um formato que pode ser enviado pela internet).
4.  O nome do arquivo é exibido como confirmação.
5.  Quando o formulário for enviado, o arquivo é:
    - Salvo no **Google Drive** (pasta "Contratos SESCON").
    - Um link de acesso é gerado e salvo na planilha.

---

### **FASE 6: REVISÃO E ENVIO**

Quando o usuário termina de adicionar clientes:

1.  Clica em **"Revisar e Enviar"**.
2.  A página exibe um **resumo completo:**
    - Dados do escritório (CNPJ, nome, e-mail).
    - Total de clientes.
    - Lista dos clientes com seus dados.
3.  O usuário pode **voltar** para editar se necessário.
4.  Se tudo estiver correto, clica em **"Enviar Dados"**.

#### **Validação Final:**
*   O sistema verifica se:
    - O CNPJ do escritório é válido.
    - O e-mail do escritório é válido.
    - Há pelo menos 1 cliente adicionado.
    - Todos os clientes têm CNPJ válido.
*   Se algo faltar, mostra um **toast de erro** indicando o problema.

---

### **FASE 7: ENVIO E BACKUP LOCAL**

Quando o usuário clica em "Enviar Dados":

#### **1. Backup Local (Automático):**
*   Um arquivo **`.json`** é **baixado automaticamente** para o computador do usuário.
*   Esse arquivo contém **todos os dados** do envio (escritório, clientes, metadados).
*   Nome do arquivo: `backup_sescon_[CNPJ]_[timestamp].json`
*   Serve como **comprovante** de que os dados foram enviados.

#### **2. Envio para Google Sheets (Se Configurado):**
*   Os dados são enviados para o **Google Apps Script** (o "robô").
*   O script **processa** os dados:
    - Cria **uma linha para cada cliente** na planilha.
    - Repete os dados do escritório em cada linha.
    - Processa os arquivos PDF (se houver).

#### **3. Upload de Contratos para Google Drive:**
*   Para cada cliente com contrato:
    - O arquivo PDF é **decodificado** (convertido de Base64 para PDF novamente).
    - É **salvo na pasta** "Contratos SESCON" do Google Drive.
    - Um **link de acesso** é gerado e salvo na coluna H da planilha.

#### **4. Envio de E-mail de Confirmação:**
*   Um e-mail **em HTML profissional** é enviado para o e-mail do escritório:
    - **Cabeçalho:** Logo do SESCON-SP em fundo azul.
    - **Corpo:** Mensagem de confirmação personalizada.
    - **Dados:** CNPJ, nome, total de clientes, data/hora do envio.
    - **Rodapé:** Copyright e informação de que é automático.

---

### **FASE 8: TELA DE SUCESSO**

Após o envio bem-sucedido:

1.  A página exibe uma **Tela de Sucesso** com:
    - Mensagem de agradecimento.
    - **Número de Protocolo** gerado automaticamente (ex: `SESCON-20251234`).
    - Resumo do envio (total de clientes).
    - Data e hora do envio.

2.  Um botão **"Enviar Novo Lote"** permite que o usuário:
    - Limpe o formulário.
    - Volte para a primeira aba.
    - Envie uma nova lista de clientes.

---

## Dados Salvos e Onde Ficam

### **1. Planilha Google Sheets:**
Cada linha contém:
| Coluna | Dados |
|--------|-------|
| A | Data do Envio |
| B | CNPJ do Escritório |
| C | Razão Social do Escritório |
| D | E-mail do Escritório |
| E | CNPJ do Cliente |
| F | Razão Social do Cliente |
| G | E-mail do Cliente |
| H | Link do Contrato Social (no Drive) |

**Exemplo:** Se um escritório enviar 5 clientes, serão criadas 5 linhas (uma para cada cliente), repetindo os dados do escritório.

### **2. Google Drive:**
*   Pasta: **"Contratos SESCON"**
*   Contém: Todos os arquivos PDF dos contratos sociais.
*   Cada arquivo é nomeado com o nome original (ex: `contrato_empresa_x.pdf`).
*   Cada arquivo tem um **link de acesso** que é salvo na planilha.

### **3. Computador do Usuário:**
*   Arquivo: **`backup_sescon_[CNPJ]_[timestamp].json`**
*   Contém: Todos os dados do envio em formato JSON.
*   Serve como comprovante local.

### **4. Navegador do Usuário (LocalStorage):**
*   Os dados do rascunho são salvos **localmente** no navegador.
*   Vinculados ao CNPJ do escritório.
*   Persistem mesmo se o usuário fechar a aba.

---

## Recursos de Segurança e Confiabilidade

### **1. Validação em Tempo Real:**
*   CNPJ: Algoritmo de validação (dígitos verificadores).
*   E-mail: Formato padrão (ex: `usuario@dominio.com`).
*   Feedback imediato: Mensagens de erro/sucesso enquanto digita.

### **2. Proteção de Dados:**
*   **Alerta ao Sair:** Se houver dados preenchidos não salvos, o navegador avisa antes de fechar.
*   **Modal de Confirmação:** Antes de limpar o rascunho, pede confirmação.
*   **Backup Automático:** Todos os dados são baixados localmente.

### **3. Tratamento de Erros:**
*   Se o Google Sheets falhar, o backup local ainda é salvo.
*   Se o e-mail falhar, o processamento continua (dados já foram salvos).
*   Mensagens de erro claras em português.

### **4. Rastreabilidade:**
*   Cada envio gera um **Número de Protocolo** único.
*   Data e hora são registradas em cada linha da planilha.
*   Histórico de atualizações é mantido (não sobrescreve, apenas adiciona).

---

## Fluxo Visual Resumido

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Usuário acessa o site                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Preenche Aba 1: Dados da Empresa (CNPJ, Nome, E-mail)   │
│    - Validação em tempo real                                │
│    - Salvamento automático (rascunho)                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Avança para Aba 2: Gestão de Clientes                    │
│    - Seleciona Atividade (Contabilidade ou Outros)          │
│    - Se "Outros": Redireciona para link externo             │
│    - Se "Contabilidade": Continua...                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Adiciona Clientes (3 formas):                            │
│    - Importar de Excel/CSV                                  │
│    - Adicionar manualmente                                  │
│    - Buscar por CNPJ                                        │
│    - Upload de Contratos Sociais (PDF)                      │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Revisa os dados                                          │
│    - Verifica se tudo está correto                          │
│    - Pode voltar para editar                                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. Clica em "Enviar Dados"                                  │
│    - Validação final                                        │
│    - Backup .json é baixado                                 │
│    - Dados são enviados para Google Sheets                  │
│    - Contratos são salvos no Google Drive                   │
│    - E-mail de confirmação é enviado                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Tela de Sucesso                                          │
│    - Protocolo gerado                                       │
│    - Resumo do envio                                        │
│    - Botão para enviar novo lote                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Tecnologias Utilizadas

| Componente | Tecnologia | Função |
|-----------|-----------|--------|
| **Frontend** | React 19 + Tailwind CSS | Interface do usuário |
| **Validação** | Algoritmos de CNPJ/E-mail | Verificação de dados |
| **Armazenamento Local** | LocalStorage (navegador) | Rascunho automático |
| **Backend** | Google Apps Script | Processa dados e envia e-mails |
| **Banco de Dados** | Google Sheets | Armazena respostas |
| **Armazenamento de Arquivos** | Google Drive | Salva contratos sociais |
| **E-mail** | Gmail (via Apps Script) | Envia confirmações |
| **Hospedagem** | Vercel | Coloca o site no ar |
| **Versionamento** | GitHub | Controla o código |

---

## Resumo Final

O sistema é uma **solução completa e integrada** que:

✅ Permite que escritórios preencham e enviem dados de forma fácil.
✅ Valida todos os dados em tempo real.
✅ Salva automaticamente (rascunho).
✅ Importa clientes de planilhas.
✅ Faz upload de contratos sociais.
✅ Envia tudo para a nuvem (Google Sheets + Drive).
✅ Envia e-mail de confirmação profissional.
✅ Gera protocolo único para rastreamento.
✅ Oferece backup local como comprovante.
✅ Funciona 100% online (sem instalação).

Tudo isso de forma **segura, rápida e profissional**, com a identidade visual do SESCON-SP.

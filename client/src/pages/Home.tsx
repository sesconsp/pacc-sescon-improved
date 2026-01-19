import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, Mail, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Loader2, Search, Save, RotateCcw, Eye, Clock, CheckCircle2, AlertTriangle, Send, FileDown, Download as DownloadIcon, Trash, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Building, Users, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
// @ts-ignore
import * as XLSX from 'xlsx';
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Cliente {
  id: string;
  cnpj: string;
  razaoSocial: string;
  emailPrincipal: boolean;
  emailCustomizado?: string;
  contratosocial?: File;
  cnpjValido?: boolean;
  ehMatriz?: boolean;
}

interface Rascunho {
  nomeEscritorio: string;
  cnpjEscritorio: string;
  emailEscritorio: string;
  clientes: Omit<Cliente, 'contratosocial'>[];
  dataSalva: string;
}

interface Atualizacao {
  id: string;
  nomeEscritorio: string;
  cnpjEscritorio: string;
  totalClientes: number;
  dataEnvio: string;
  horaEnvio: string;
  resumo: string;
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

// Cores SESCON
const SESCON_BLUE = "#003b61";
const SESCON_DARK_BLUE = "#002a45";
const SESCON_LIGHT_BLUE = "#eef6fb";
const SESCON_ACCENT = "#00568c";

const faqs: FAQ[] = [
  {
    pergunta: "Por que é importante manter o cadastro dos meus clientes atualizados?",
    resposta: "O SESCON está modernizando sua base de dados. Manter o cadastro dos seus clientes atualizado garante que nossas comunicações sejam direcionadas apenas às empresas que você efetivamente representa, assegurando informações corretas, atualizadas e relevantes. "
  },
  {
    pergunta: "Posso usar o mesmo e-mail para vários clientes?",
    resposta: "Sim. É possível utilizar o mesmo e-mail para mais de um cliente. Caso não seja informado um e-mail específico, será considerado o e-mail do seu escritório como contato padrão."
  },
  {
    pergunta: "Para a atualização cadastral, é obrigatório o envio de documentos como o contrato social?",
    resposta: "Não. Para a atualização dos dados de contato, não é necessário o envio de documentos, e o formulário pode ser enviado sem anexos. O contrato social é exigido apenas nos casos de análise de enquadramento sindical."
  },
  {
    pergunta: "Existe algum comprovante de envio dos dados?",
    resposta: "Sim. Após o envio do formulário, você receberá um e-mail de confirmação com um link para baixar o comprovante em PDF contendo todos os dados informados."
  },
  {
    pergunta: "Como baixo os dados que enviei?",
    resposta: "Após enviar, você receberá um e-mail de confirmação com um link para baixar um comprovante em PDF com todos os dados."
  },
  {
    pergunta: "Qual o prazo de atualização?",
    resposta: "A atualização é processada imediatamente após o envio do formulário. Você receberá um e-mail de confirmação em poucos minutos."
  },
  {
    pergunta: "Qual a responsabilidade da contabilidade sobre as informações?",
    resposta: "A contabilidade atua como facilitadora no envio das informações do Sescon-SP aos seus clientes, assegurando que os dados cadastrais e de contribuições estejam corretos e alinhados à regularidade das empresas representadas. "
  },
  {
    pergunta: "Quais são as categorias econômicas representadas pelo SESCON-SP",
    resposta: `O SESCON-SP representa 58 categorias econômicas, divididas entre Contábil e Assessoramento. Abaixo estão listados todos os CNAEs representados:<br/><br/>
<ul style="list-style-type: none; padding-left: 0;">
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">02.30-6/00</strong>: Atividade de apoio à produção florestal</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">52.29-0/02</strong>: Serviços de reboque de veículos</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">52.29-0/99</strong>: Outras atividades auxiliares dos transportes terrestres não especificadas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">52.40-1/01</strong>: Operação dos aeroportos e campos de aterrissagem</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">52.50-8/04</strong>: Organização logística do transporte de carga</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">52.50-8/05</strong>: Operador de transporte multimodal - OTM</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">64.61-1/00</strong>: Holdings de instituições financeiras</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">64.62-0/00</strong>: Holdings de instituições não-financeiras</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">64.63-8/00</strong>: Outras sociedades de participação, exceto holdings</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.11-8/01</strong>: Bolsa de valores</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.11-8/02</strong>: Bolsa de mercadorias</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.11-8/03</strong>: Bolsa de mercadorias e futures</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.11-8/04</strong>: Administração de mercados de balcão organizados</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.12-6/05</strong>: Agentes de investimentos em aplicações financeiras</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.13-4/00</strong>: Administração de cartões de crédito</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.19-3/02</strong>: Correspondentes de instituições financeiras</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.19-3/03</strong>: Representação de bancos</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.19-3/99</strong>: Outras atividades auxiliares dos serviços financeiros não especificadas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.21-5/01</strong>: Peritos e avaliadores de seguros</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.21-5/02</strong>: Auditoria e consultoria atuarial</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.29-1/00</strong>: Atividades auxiliares dos seguros, da previdência complementar e dos planos</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">66.30-4/00</strong>: Atividades de administração de fundos por contrato ou comissão</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">68.10-2/02</strong>: Aluguel de imóveis próprios</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">69.11-7/03</strong>: Atividades auxiliares da justiça: arbitragem, mediação, avaliações, perícia.</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">69.11-7/20</strong>: Agente de propriedade industrial</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">69.20-6/01</strong>: Atividades de contabilidade</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">69.20-6/02</strong>: Atividades de consultoria e auditoria contábil e tributária</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">70.20-4/00</strong>: Atividades de consultoria em gestão empresarial, exceto consultoria técnica</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">71.19-7/01</strong>: Serviços de cartografia, topografia e geodésia</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">71.19-7/02</strong>: Atividades de estudos geológicos (prospecção geológica)</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">71.19-7/03</strong>: Serviços de desenho técnico relacionados à arquitetura e engenharia</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">71.19-7/04</strong>: Serviços de perícia técnica relacionados à segurança do trabalho</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">71.20-1/00</strong>: Testes e análises técnicas (ensaios de materiais e produtos, análise</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">72.10-0/00</strong>: Pesquisa e desenvolvimento experimental em ciências físicas e naturais</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">72.20-7/00</strong>: Pesquisa e desenvolvimento experimental em ciências sociais e humanas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">73.19-0/02</strong>: Promoção de Vendas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">73.19-0/04</strong>: Consultoria em publicidade</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">73.20-3/00</strong>: Pesquisa de mercado e de opinião pública</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.20-0/02</strong>: Atividades de produção de fotografias aéreas e submarinas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.20-0/05</strong>: Serviços de microfilmagem</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.90-1/01</strong>: Serviços de Tradução, Interpretação e Similares</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.90-1/03</strong>: Serviços de agronomia e de consultoria e de atividades agrícolas e pecuárias</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.90-1/04</strong>: Atividades de intermediação e agenciamento de serviços e negócios em geral</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.90-1/05</strong>: Agenciamento de profissionais para atividades esportivas, culturais</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">74.90-1/99</strong>: Outras atividades profissionais, científicas e técnicas não especificadas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">77.40-3/00</strong>: Gestão de ativos intangíveis não-financeiros</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">78.10-8/00</strong>: Seleção e Agenciamento de Mão de obra</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">80.20-0/00</strong>: Atividades de monitoramento de sistemas de segurança</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">82.19-9/99</strong>: Preparação de documentos e serviços especializados de apoio administrativo</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">82.99-7/99</strong>: Outras atividades de serviços prestados principalmente às empresas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">85.50-3/02</strong>: Atividades de apoio à educação, exceto caixas escolares</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">85.99-6/04</strong>: Treinamento em desenvolvimento profissional e gerencial</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">86.60-7/00</strong>: Atividades de apoio a gestão de saúde (exceto serviços privativos de médicos)</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">94.11-1/00</strong>: Atividades de organizações associativas patronais e empresariais</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">94.12-0/00</strong>: Atividades de organizações associativas profissionais</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">94.30-8/00</strong>: Atividades de associações de defesa de direitos sociais</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">94.91-0/00</strong>: Atividades de organizações religiosas</li>
<li style="margin-bottom: 8px;"><strong style="color: ${SESCON_DARK_BLUE}">94.99-5/00</strong>: Atividades associativas não especificadas anteriormente</li>
</ul>`
  }
];

// Função auxiliar para converter arquivo em Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function Home() {
  const [cnpjEscritorio, setCnpjEscritorio] = useState("");
  const [razaoSocialEscritorio, setRazaoSocialEscritorio] = useState("");
  const [emailEscritorio, setEmailEscritorio] = useState("");
  const [atividadePrincipal, setAtividadePrincipal] = useState("contabilidade");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState({
    cnpj: "",
    razaoSocial: "",
    emailPrincipal: true,
    emailCustomizado: "",
    cnpjValido: false,
    ehMatriz: false,
    contratosocial: undefined as File | undefined
  });
  const [cnpjEscritorioValido, setCnpjEscritorioValido] = useState(false);
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState(1);
  const [busca, setBusca] = useState("");
  const [buscaCarregando, setBuscaCarregando] = useState(false);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [temRascunho, setTemRascunho] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [progressoUpload, setProgressoUpload] = useState(0);
  const [statusUpload, setStatusUpload] = useState("");
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [progressoEnvio, setProgressoEnvio] = useState(0);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  // Formatar CNPJ
  const formatarCNPJ = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length > 14) v = v.substring(0, 14);
    v = v.replace(/^(\d{2})(\d)/, "$1.$2");
    v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
    v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    return v;
  };

  // Buscar CNPJ na Receita Federal
  const buscarCNPJ = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;

    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (response.ok) {
        const data = await response.json();
        setRazaoSocialEscritorio(data.razao_social || data.nome_fantasia || "");
        setCnpjEscritorioValido(true);
        toast.success("Dados do escritório carregados!");
      } else {
        toast.error("CNPJ não encontrado na Receita Federal");
        setCnpjEscritorioValido(false);
        setRazaoSocialEscritorio("");
      }
    } catch (error) {
      toast.error("Erro ao buscar CNPJ na Receita Federal");
      setCnpjEscritorioValido(false);
      setRazaoSocialEscritorio("");
    } finally {
      setBuscandoReceita(false);
    }
  };

  // Buscar CNPJ do Cliente na Receita Federal
  const buscarCNPJCliente = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;

    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (response.ok) {
        const data = await response.json();
        const ehMatriz = cnpjLimpo.endsWith("0001");
        setNovoCliente(prev => ({
          ...prev,
          razaoSocial: data.razao_social || data.nome_fantasia || "",
          cnpjValido: true,
          ehMatriz: ehMatriz
        }));
        toast.success("Dados do cliente carregados!", { duration: 2000 });
      } else {
        toast.error("CNPJ não encontrado na Receita Federal", { duration: 2000 });
        setNovoCliente(prev => ({ ...prev, cnpjValido: false, razaoSocial: "" }));
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ do cliente");
      toast.error("Erro ao buscar CNPJ", { duration: 2000 });
      setNovoCliente(prev => ({ ...prev, cnpjValido: false, razaoSocial: "" }));
    }
  };

  // Processar Upload CSV
  const processarUploadCSV = (file: File, onComplete: (clientes: Cliente[]) => void, onProgress: (p: number, s: string) => void, emailEscritorio: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split("\n");
      const novosClientes: Cliente[] = [];
      const total = lines.length - 1;

      lines.slice(1).forEach((line, index) => {
        const [cnpj, razao, email] = line.split(",");
        if (cnpj && razao) {
          novosClientes.push({
            id: Math.random().toString(),
            cnpj: formatarCNPJ(cnpj.trim()),
            razaoSocial: razao.trim(),
            emailPrincipal: !email,
            emailCustomizado: email?.trim() || "",
            cnpjValido: true
          });
        }
        onProgress(Math.round(((index + 1) / total) * 100), `Processando cliente ${index + 1} de ${total}...`);
      });
      onComplete(novosClientes);
    };
    reader.readAsText(file);
  };

  // Processar Upload Excel
  const processarUploadExcel = (file: File, onComplete: (clientes: Cliente[]) => void, onProgress: (p: number, s: string) => void, emailEscritorio: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);
      
      const novosClientes: Cliente[] = [];
      const total = jsonData.length;

      jsonData.forEach((row: any, index) => {
        const cnpj = row["CNPJ"] || row["cnpj"];
        const razao = row["Razão Social"] || row["RazÃ£o Social"] || row["razao_social"] || row["Nome"];
        const email = row["E-mail"] || row["Email"] || row["email"] || row["E-MAIL"];

        if (cnpj && razao) {
          novosClientes.push({
            id: Math.random().toString(),
            cnpj: formatarCNPJ(String(cnpj)),
            razaoSocial: String(razao),
            emailPrincipal: !email,
            emailCustomizado: email ? String(email) : "",
            cnpjValido: true
          });
        }
        onProgress(Math.round(((index + 1) / total) * 100), `Processando cliente ${index + 1} de ${total}...`);
      });
      onComplete(novosClientes);
    };
    reader.readAsArrayBuffer(file);
  };

  // Adicionar cliente manual
  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha os dados do cliente");
      return;
    }

    // Verificar se já existe
    if (clientes.some(c => c.cnpj === novoCliente.cnpj)) {
      if (!confirm("Este CNPJ já está na lista. Deseja adicionar novamente?")) {
        return;
      }
    }

    const cliente: Cliente = {
      id: Math.random().toString(),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal,
      emailCustomizado: novoCliente.emailCustomizado,
      contratosocial: novoCliente.contratosocial,
      cnpjValido: true,
      ehMatriz: novoCliente.ehMatriz
    };

    setClientes([...clientes, cliente]);
    setNovoCliente({
      cnpj: "",
      razaoSocial: "",
      emailPrincipal: true,
      emailCustomizado: "",
      cnpjValido: false,
      ehMatriz: false,
      contratosocial: undefined
    });
    toast.success("Cliente adicionado com sucesso!", { duration: 2000 });
  };

  // Remover cliente
  const removerCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
  };

  // Enviar dados
  const enviarDados = async () => {
    if (!cnpjEscritorio || !razaoSocialEscritorio || !emailEscritorio) {
      toast.error("Preencha os dados do escritório primeiro");
      setAbaSelecionada(1);
      return;
    }
    if (clientes.length === 0) {
      toast.error("Adicione pelo menos um cliente");
      return;
    }

    setIsLoading(true);
    setProgressoEnvio(0);
    
    try {
      // Simulação de progresso inicial para feedback visual imediato
      setProgressoEnvio(10);
      
      // Converte arquivos para Base64 antes de enviar
      const totalClientes = clientes.length;
      const clientesComArquivos = await Promise.all(clientes.map(async (c, index) => {
        let arquivoData = null;
        if (c.contratosocial) {
          try {
            const base64 = await fileToBase64(c.contratosocial);
            arquivoData = {
              data: base64,
              name: c.contratosocial.name,
              type: c.contratosocial.type
            };
          } catch (e) {
            console.error("Erro ao converter arquivo", e);
          }
        }
        
        // Atualiza progresso baseado na conversão (50% do processo total)
        const progressoAtual = 10 + Math.round(((index + 1) / totalClientes) * 40);
        setProgressoEnvio(progressoAtual);
        
        return {
          cnpj: c.cnpj,
          razaoSocial: c.razaoSocial,
          email: c.emailCustomizado || emailEscritorio,
          contratosocial: arquivoData // Nome do campo esperado pelo Apps Script
        };
      }));

      const dadosEnvio = {
        escritorioCnpj: cnpjEscritorio,
        escritorioRazao: razaoSocialEscritorio,
        escritorioEmail: emailEscritorio,
        atividadePrincipal: atividadePrincipal,
        clientes: clientesComArquivos,
        dataEnvio: new Date().toISOString()
      };

      setProgressoEnvio(60);

      const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxR2MCXtsKqCO3cXC6NgAkntgt6E2N5eTFEAqbyw7YW9Q2lATMGOE1L-NI916Ofduio/exec";
      
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEnvio),
      });

      setProgressoEnvio(100);

      const atualizacao: Atualizacao = {
        id: Math.random().toString(),
        nomeEscritorio: razaoSocialEscritorio,
        cnpjEscritorio: cnpjEscritorio,
        totalClientes: clientes.length,
        dataEnvio: new Date().toLocaleDateString("pt-BR"),
        horaEnvio: new Date().toLocaleTimeString("pt-BR"),
        resumo: `${clientes.length} cliente(s) atualizado(s) com sucesso`
      };
      
      setAtualizacoes([atualizacao, ...atualizacoes]);
      
      // Mostrar mensagem de sucesso com destaque
      setMostrarSucesso(true);
      
      // Aguardar um pouco para o usuário ver o sucesso antes de resetar e voltar
      setTimeout(() => {
        setClientes([]);
        setCnpjEscritorio("");
        setRazaoSocialEscritorio("");
        setEmailEscritorio("");
        setMostrarResumo(false);
        
        const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
        if (cnpjLimpo) {
          localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
        }
        
        setTemRascunho(false);
        setMostrarSucesso(false);
        setAbaSelecionada(1); // Volta para a tela inicial
        setIsLoading(false);
        
        // Garantir scroll para o topo ao voltar
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        toast.success("Dados enviados com sucesso!", { duration: 4000 });
      }, 5000);

    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao enviar dados", { duration: 3000 });
      setIsLoading(false);
    }
  };

  // Salvar rascunho vinculado ao CNPJ
  const salvarRascunho = () => {
    if (!cnpjEscritorio) {
      toast.error("Preencha o CNPJ do escritório para salvar o rascunho", { duration: 3000 });
      return;
    }
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) {
      toast.error("CNPJ inválido para salvar rascunho", { duration: 3000 });
      return;
    }

    const rascunho: Rascunho = {
      nomeEscritorio: razaoSocialEscritorio,
      cnpjEscritorio: cnpjEscritorio,
      emailEscritorio: emailEscritorio,
      clientes: clientes.map(({ contratosocial, ...rest }) => rest),
      dataSalva: new Date().toLocaleString("pt-BR")
    };

    localStorage.setItem(`rascunho_pacc_${cnpjLimpo}`, JSON.stringify(rascunho));
    setTemRascunho(true);
    toast.success("Rascunho salvo com sucesso!", { duration: 2000 });
  };

  // Limpar rascunho
  const limparRascunho = () => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo) {
      localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
      setClientes([]);
      setTemRascunho(false);
      toast.success("Rascunho deste CNPJ excluído", { duration: 2000 });
      setMostrarConfirmacaoLimpar(false);
    }
  };

  // Gerar modelo CSV
  const gerarModeloCSV = () => {
    const csv = "CNPJ,Razão Social,E-mail\n00.000.000/0001-00,Empresa Exemplo,email@exemplo.com";
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = "modelo_clientes.csv";
    link.click();
    document.body.removeChild(link);
  };

  // Debounce para busca
  useEffect(() => {
    if (!busca) {
      setBuscaCarregando(false);
      return;
    }
    setBuscaCarregando(true);
    const timer = setTimeout(() => {
      setBuscaCarregando(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [busca]);

  const clientesFiltrados = clientes.filter(c =>
    c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj.includes(busca)
  );

  // Redirecionamento para "Outros"
  useEffect(() => {
    if (atividadePrincipal === "outros") {
      window.location.href = "https://sesconsp.github.io/atualizacao-cadastral/";
    }
  }, [atividadePrincipal]);

  const podeAvancarAba1 = cnpjEscritorioValido && razaoSocialEscritorio && emailEscritorio.includes("@");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#f8fafc" }}>
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50 rounded-full blur-3xl -z-10 opacity-30 -translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-full h-full bg-white/40 -z-20 -translate-x-1/2 -translate-y-1/2"></div>

      {/* Header Corporativo */}
      <header className="border-b" style={{ background: SESCON_BLUE, borderColor: SESCON_DARK_BLUE }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src="/pacc-sescon-improved/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto hidden md:block" />
              <div>
                <h1 className="text-3xl font-extrabold text-white">Central de Atualização SESCON-SP</h1>
                <p className="text-blue-100 text-base mt-1">Atualize as informações dos seus clientes representados de forma rápida e segura.</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Expandido */}
      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-4 gap-8 h-full">
          {/* Left Sidebar - Instruções e FAQ Fixo */}
          <div className="col-span-1 space-y-6">
            {/* Card de Instruções */}
            <div 
              className="rounded-lg p-6 text-white shadow-lg"
              style={{ background: `linear-gradient(135deg, ${SESCON_BLUE} 0%, ${SESCON_DARK_BLUE} 100%)` }}
            >
              <h3 className="text-lg font-bold mb-6 pb-4 border-b border-white border-opacity-30">Como Funciona</h3>
              <div className="space-y-4">
                {[
                  { num: 1, text: "Preencha os dados do seu escritório" },
                  { num: 2, text: "Importe ou adicione todos os seus clientes" },
                  { num: 3, text: "Revise as informações" },
                  { num: 4, text: "Envie para processamento" }
                ].map(step => (
                  <div key={step.num} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm" style={{ color: SESCON_DARK_BLUE }}>
                      {step.num}
                    </div>
                    <p className="text-sm leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Card de Aviso - Estilo Exato da Imagem */}
            <div 
              className="rounded-lg p-6 border-l-4 shadow-sm"
              style={{ background: "#eef6fb", borderColor: SESCON_DARK_BLUE, borderWidth: '0 0 0 6px' }}
            >
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500 fill-yellow-500" />
                <p className="text-lg font-bold" style={{ color: SESCON_DARK_BLUE }}>
                  Importante
                </p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: SESCON_DARK_BLUE }}>
                A base anterior será excluída. Apenas os clientes que você enviar serão mantidos.
              </p>
            </div>
          </div>

          {/* Right Content - Formulário */}
          <div className="col-span-3 space-y-6">
            {/* Barra de Progresso */}
            <div className="bg-white rounded-xl p-4 shadow-md border mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>
                  Progresso do Cadastro
                </span>
                <span className="text-xs font-bold" style={{ color: SESCON_BLUE }}>
                  Passo {abaSelecionada} de 2
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500 ease-in-out"
                  style={{ 
                    width: abaSelecionada === 1 ? '50%' : '100%',
                    background: `linear-gradient(90deg, ${SESCON_BLUE} 0%, ${SESCON_ACCENT} 100%)`
                  }}
                ></div>
              </div>
            </div>

            {/* Conteúdo das Abas */}
            <AnimatePresence mode="wait">
              {abaSelecionada === 1 ? (
                <motion.div
                  key="aba1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-2xl shadow-xl border p-8 backdrop-blur-sm bg-white/95"
                  style={{ borderColor: SESCON_LIGHT_BLUE }}
                >
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Identificação da Empresa</h2>
                  <div className="space-y-6 w-full">
                    <div className="space-y-2">
                      <label className="text-sm font-bold flex items-center gap-1" style={{ color: SESCON_DARK_BLUE }}>
                        CNPJ do Escritório <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Input
                          type="text"
                          placeholder="00.000.000/0000-00"
                          value={cnpjEscritorio}
                          onChange={(e) => setCnpjEscritorio(formatarCNPJ(e.target.value))}
                          onBlur={() => buscarCNPJ(cnpjEscritorio)}
                          className="rounded-lg border-2 px-4 py-3 text-lg focus:ring-2 transition-all w-full"
                          style={{ borderColor: SESCON_BLUE }}
                          maxLength={18}
                        />
                        {buscandoReceita && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">Os dados serão preenchidos automaticamente da Receita Federal</p>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>
                        Nome do Escritório <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Será preenchido automaticamente"
                        value={razaoSocialEscritorio}
                        readOnly
                        className="rounded-lg border-2 px-4 py-3 bg-gray-50 w-full cursor-not-allowed"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>
                        E-mail para Contato (Obrigatório) <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="contato@empresa.com.br"
                        value={emailEscritorio}
                        onChange={(e) => setEmailEscritorio(e.target.value)}
                        disabled={!cnpjEscritorioValido}
                        className={`rounded-lg border-2 px-4 py-3 w-full ${!cnpjEscritorioValido ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        style={{ borderColor: SESCON_BLUE }}
                      />
                      <p className="text-xs text-gray-500">Este e-mail receberá a confirmação do envio</p>
                    </div>

                    <Button
                      onClick={() => setAbaSelecionada(2)}
                      disabled={!podeAvancarAba1}
                      className={`w-full rounded-lg font-bold py-4 text-white text-lg mt-4 shadow-md transition-all ${!podeAvancarAba1 ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
                      style={{ background: SESCON_BLUE }}
                    >
                      Próximo
                    </Button>
                  </div>

                  {/* FAQ Integrado na Aba 1 */}
                  <div className="mt-12 pt-12 border-t" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                    <div className="rounded-xl p-8" style={{ background: SESCON_LIGHT_BLUE }}>
                      <h3 className="text-xl font-bold mb-6" style={{ color: SESCON_DARK_BLUE }}>Perguntas Frequentes</h3>
                      <div className="space-y-3">
                      {faqs.map((faq, idx) => (
                        <div key={idx} className="border rounded-lg overflow-hidden" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                          <button
                            onClick={() => setFaqAberto(faqAberto === idx ? null : idx)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center bg-white hover:bg-gray-50 transition-colors"
                          >
                            <span className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{faq.pergunta}</span>
                            {faqAberto === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <AnimatePresence>
                            {faqAberto === idx && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: "auto" }}
                                exit={{ height: 0 }}
                                className="overflow-hidden bg-white"
                              >
                                <div 
                                  className="px-6 pb-4 text-sm text-gray-600 leading-relaxed"
                                  dangerouslySetInnerHTML={{ __html: faq.resposta }}
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="aba2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-xl border p-8 backdrop-blur-sm bg-white/95"
                  style={{ borderColor: SESCON_LIGHT_BLUE }}
                >
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold" style={{ color: SESCON_DARK_BLUE }}>Gestão de Clientes</h2>
                    <div className="flex gap-2">
                      <Button
                        onClick={gerarModeloCSV}
                        variant="outline"
                        size="sm"
                        className="text-xs font-semibold"
                        style={{ color: SESCON_BLUE, borderColor: SESCON_BLUE }}
                      >
                        <DownloadIcon className="w-3 h-3 mr-1" />
                        Modelo CSV
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Área de Upload */}
                    <div 
                      className="border-2 border-dashed rounded-xl p-10 text-center transition-all hover:bg-blue-50/50 group"
                      style={{ borderColor: SESCON_BLUE }}
                    >
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Upload className="w-8 h-8" style={{ color: SESCON_BLUE }} />
                        </div>
                        <div>
                          <p className="text-lg font-bold" style={{ color: SESCON_DARK_BLUE }}>Importar Lista de Clientes</p>
                          <p className="text-sm text-gray-500 mt-1">Arraste seu arquivo Excel ou CSV aqui ou clique para selecionar</p>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <input
                            type="file"
                            accept=".csv, .xlsx, .xls"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.name.endsWith('.csv')) {
                                  processarUploadCSV(file, setClientes, (p, s) => { setProgressoUpload(p); setStatusUpload(s); }, emailEscritorio);
                                } else {
                                  processarUploadExcel(file, setClientes, (p, s) => { setProgressoUpload(p); setStatusUpload(s); }, emailEscritorio);
                                }
                              }
                            }}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer px-6 py-2 rounded-lg font-semibold text-white transition-all hover:shadow-md"
                            style={{ background: SESCON_BLUE }}
                          >
                            Selecionar Arquivo
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Barra de Progresso de Upload */}
                    {progressoUpload > 0 && progressoUpload < 100 && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold" style={{ color: SESCON_BLUE }}>
                          <span>{statusUpload}</span>
                          <span>{progressoUpload}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                            style={{ width: `${progressoUpload}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Divisor */}
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t"></span>
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-4 text-gray-500 font-bold">Ou Adicionar Manualmente</span>
                      </div>
                    </div>

                    {/* Formulário Manual */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-100">
                      <div className="space-y-2">
                        <label className="text-xs font-bold" style={{ color: SESCON_DARK_BLUE }}>CNPJ do Cliente</label>
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={novoCliente.cnpj}
                          onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: formatarCNPJ(e.target.value) })}
                          onBlur={() => buscarCNPJCliente(novoCliente.cnpj)}
                          className="bg-white"
                          maxLength={18}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold" style={{ color: SESCON_DARK_BLUE }}>Razão Social</label>
                        <Input
                          placeholder="Nome da empresa"
                          value={novoCliente.razaoSocial}
                          onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })}
                          className="bg-white"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold" style={{ color: SESCON_DARK_BLUE }}>E-mail do Cliente (Opcional)</label>
                        <Input
                          placeholder="E-mail específico para este cliente"
                          value={novoCliente.emailCustomizado}
                          onChange={(e) => setNovoCliente({ ...novoCliente, emailCustomizado: e.target.value })}
                          className="bg-white"
                        />
                        <p className="text-[10px] text-gray-500">Se vazio, usará o e-mail do escritório: {emailEscritorio}</p>
                      </div>
                      
                      {/* Upload de Contrato Social */}
                      <div className="space-y-2 md:col-span-2">
                        <label className="text-xs font-bold flex items-center gap-1" style={{ color: SESCON_DARK_BLUE }}>
                          Contrato Social (Opcional)
                          <span className="text-[10px] font-normal text-gray-500">(Apenas PDF)</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.type === 'application/pdf') {
                                  setNovoCliente({ ...novoCliente, contratosocial: file });
                                  toast.success(`Arquivo "${file.name}" selecionado!`, { duration: 2000 });
                                } else {
                                  toast.error('Apenas arquivos PDF são aceitos!', { duration: 3000 });
                                  e.target.value = '';
                                }
                              }
                            }}
                            className="hidden"
                            id="contrato-social-input"
                          />
                          <label
                            htmlFor="contrato-social-input"
                            className="flex-1 cursor-pointer"
                          >
                            <div className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors" style={{ borderColor: SESCON_BLUE }}>
                              <FileText className="w-4 h-4" style={{ color: SESCON_BLUE }} />
                              <span className="text-sm" style={{ color: SESCON_BLUE }}>
                                {novoCliente.contratosocial ? novoCliente.contratosocial.name : 'Selecionar PDF'}
                              </span>
                            </div>
                          </label>
                          {novoCliente.contratosocial && (
                            <Button
                              onClick={() => {
                                setNovoCliente({ ...novoCliente, contratosocial: undefined });
                                const input = document.getElementById('contrato-social-input') as HTMLInputElement;
                                if (input) input.value = '';
                                toast.info('Arquivo removido', { duration: 2000 });
                              }}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        <p className="text-xs text-gray-600">Aceita apenas arquivos em formato PDF</p>
                      </div>
                      <div className="md:col-span-2 flex justify-center">
                        <Button
                          onClick={adicionarCliente}
                          className="w-full md:w-1/2 rounded-lg font-semibold py-2 text-white"
                          style={{ background: SESCON_BLUE }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Adicionar Cliente
                        </Button>
                      </div>
                    </div>

                    {/* LISTA DE CLIENTES COM BUSCA */}
                    {clientes.length > 0 && (
                      <div className="mt-8 space-y-4 border rounded-xl overflow-hidden bg-white shadow-sm">
                        <div className="bg-gray-50 p-4 border-b flex flex-col md:flex-row justify-between items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-900" />
                            <h3 className="font-bold text-blue-900">Clientes Adicionados ({clientes.length})</h3>
                          </div>
                          <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              placeholder="Pesquisar cliente..."
                              value={busca}
                              onChange={(e) => setBusca(e.target.value)}
                              className="pl-9 h-9 text-sm bg-white"
                            />
                          </div>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 font-bold sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-3 border-b">Razão Social</th>
                                <th className="px-4 py-3 border-b">CNPJ</th>
                                <th className="px-4 py-3 border-b">E-mail</th>
                                <th className="px-4 py-3 border-b text-center">Ações</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map((cliente) => (
                                  <tr key={cliente.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-4 py-3 font-medium text-gray-900">
                                      <div className="flex flex-col">
                                        <span>{cliente.razaoSocial}</span>
                                        {cliente.ehMatriz && <span className="text-[10px] text-blue-600 font-bold">🏢 MATRIZ</span>}
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{cliente.cnpj}</td>
                                    <td className="px-4 py-3 text-gray-600 truncate max-w-[150px]">
                                      {cliente.emailCustomizado || <span className="text-gray-400 italic">E-mail do Escritório</span>}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                      <button 
                                        onClick={() => removerCliente(cliente.id)}
                                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Remover Cliente"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="px-4 py-10 text-center text-gray-500 italic">
                                    Nenhum cliente encontrado para "{busca}"
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Progresso de Envio - ESTILO INSTITUCIONAL */}
                    {isLoading && !mostrarSucesso && (
                      <div className="bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-xl space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-900" />
                          </div>
                          <h3 className="text-xl font-bold text-blue-900">Processando Transmissão</h3>
                          <p className="text-sm text-gray-500 max-w-md">
                            Estamos enviando as informações dos seus clientes para a base de dados do SESCON-SP. Por favor, não feche esta janela.
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-end">
                            <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Status do Envio</span>
                            <span className="text-2xl font-black text-blue-900">{progressoEnvio}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border shadow-inner">
                            <motion.div 
                              className="h-full bg-blue-900"
                              initial={{ width: 0 }}
                              animate={{ width: `${progressoEnvio}%` }}
                              transition={{ duration: 0.5 }}
                            ></motion.div>
                          </div>
                          <div className="flex justify-center">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                              {progressoEnvio < 40 ? "PREPARANDO ARQUIVOS..." : 
                               progressoEnvio < 80 ? "TRANSMITINDO DADOS..." : 
                               "FINALIZANDO PROTOCOLO..."}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mensagem de Sucesso - MODAL GIGANTE CENTRALIZADO */}
                    <AnimatePresence>
                      {mostrarSucesso && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="bg-white border-4 border-green-600 p-12 rounded-3xl text-center shadow-[0_0_50px_rgba(0,0,0,0.3)] relative overflow-hidden max-w-2xl w-full"
                          >
                            <div className="absolute top-0 left-0 w-full h-4 bg-green-600"></div>
                            <div className="flex justify-center mb-8">
                              <div className="bg-green-50 rounded-full p-6 border-4 border-green-100">
                                <ShieldCheck className="w-24 h-24 text-green-600" />
                              </div>
                            </div>
                            <h3 className="text-4xl font-black text-gray-900 mb-4 uppercase tracking-tight">Envio Concluído com Sucesso!</h3>
                            <div className="space-y-6">
                              <p className="text-xl text-gray-600 leading-relaxed">
                                A atualização cadastral de <strong className="text-green-700 text-2xl">{clientes.length} clientes</strong> foi processada e confirmada em nossos servidores.
                              </p>
                              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-100 inline-block w-full">
                                <p className="text-sm font-bold text-green-800">
                                  Um protocolo de confirmação foi enviado para:<br/>
                                  <span className="text-lg">{emailEscritorio}</span>
                                </p>
                              </div>
                            </div>
                            <div className="mt-12 pt-8 border-t flex flex-col items-center gap-3">
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                              <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
                                Retornando ao painel principal em instantes...
                              </p>
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </AnimatePresence>

                    <div className="flex flex-col gap-3 pt-4">
                      {temRascunho && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Rascunho salvo automaticamente vinculado ao CNPJ</span>
                        </div>
                      )}
                      <div className="flex gap-3">
                        <Button
                          onClick={() => setAbaSelecionada(1)}
                          variant="outline"
                          className="flex-1 rounded-lg border-2 font-semibold py-2"
                          style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}
                          disabled={isLoading || mostrarSucesso}
                        >
                          Voltar
                        </Button>
                        <Button
                          onClick={salvarRascunho}
                          className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                          style={{ background: SESCON_ACCENT }}
                          disabled={isLoading || mostrarSucesso}
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Salvar Rascunho
                        </Button>
                        <Button
                          onClick={() => setMostrarModalClientes(true)}
                          disabled={clientes.length === 0 || isLoading || mostrarSucesso}
                          className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                          style={{ background: SESCON_ACCENT }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizar Clientes
                        </Button>
                      </div>
                      {!isLoading && !mostrarSucesso && (
                        <Button
                          onClick={enviarDados}
                          disabled={isLoading || clientes.length === 0}
                          className="flex-1 rounded-lg font-bold py-3 text-white text-lg hover:bg-green-700 transition-colors"
                          style={{ background: "#4CAF50" }}
                        >
                          <Send className="w-5 h-5 mr-2" />
                          Enviar Dados
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Modal de Visualização de Clientes */}
      {mostrarModalClientes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold" style={{ color: SESCON_DARK_BLUE }}>Visualizar Clientes</h3>
                <button
                  onClick={() => setMostrarModalClientes(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">Total de clientes a enviar: <strong>{clientes.length}</strong></p>
            </div>
            <div className="p-6 space-y-3">
              {clientes.map((cliente, idx) => (
                <div key={cliente.id} className="p-4 rounded-lg border flex justify-between items-start" style={{ borderColor: SESCON_LIGHT_BLUE, background: SESCON_LIGHT_BLUE }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{idx + 1}. {cliente.razaoSocial}</p>
                    <p className="text-xs text-gray-600 mt-1">CNPJ: {cliente.cnpj}</p>
                    <p className="text-xs text-gray-600 mt-1">E-mail: {cliente.emailCustomizado}</p>
                    {cliente.ehMatriz && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">🏢 Matriz</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <Button
                onClick={() => setMostrarModalClientes(false)}
                variant="outline"
                className="flex-1 rounded-lg border-2 font-semibold py-2"
                style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}
              >
                Voltar
              </Button>
              <Button
                onClick={() => {
                  setMostrarModalClientes(false);
                  enviarDados();
                }}
                disabled={isLoading}
                className="flex-1 rounded-lg font-semibold py-2 text-white"
                style={{ background: SESCON_BLUE }}
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {isLoading ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modais de Confirmação */}
      <AlertDialog open={mostrarConfirmacaoLimpar} onOpenChange={setMostrarConfirmacaoLimpar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Rascunho?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação excluirá permanentemente o rascunho salvo para este CNPJ. Você perderá todos os dados preenchidos até agora.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={limparRascunho} className="bg-red-600 hover:bg-red-700">
              Sim, limpar rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer Redesenhado - Estilo Profissional */}
      <footer className="pt-8 pb-6 px-8" style={{ background: "#003366" }}>
        <div className="max-w-6xl mx-auto text-white">
          
          {/* Seção Superior: Redes Sociais + Informações + Logo */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-6 border-b border-white border-opacity-30">
            
            {/* Esquerda: Redes Sociais */}
            <div className="flex flex-col items-start space-y-3 mb-6 md:mb-0">
              <p className="text-sm font-semibold">Siga o Sescon-SP:</p>
              <div className="flex items-center gap-4">
                <a href="https://www.instagram.com/sesconsp/?hl=pt" target="_blank" rel="noopener noreferrer" className="text-white hover:text-pink-300 transition-colors" title="Instagram">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="https://www.facebook.com/sesconsp" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors" title="Facebook">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://www.youtube.com/channel/UCBjwnyWvusn2PsIT-wRk9MQ" target="_blank" rel="noopener noreferrer" className="text-white hover:text-red-300 transition-colors" title="YouTube">
                  <Youtube className="w-6 h-6" />
                </a>
                <a href="https://br.linkedin.com/company/sescon-sp" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-300 transition-colors" title="LinkedIn">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://api.whatsapp.com/send?phone=551133044416&text=Seja%20bem%20vindo%20ao%20atendimento%20do%20SESCON-SP%20e%20AESCON-SP" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-300 transition-colors" title="WhatsApp">
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
            </div>

            {/* Centro: Informações Principais */}
            <div className="flex flex-col items-center space-y-2 mb-6 md:mb-0 flex-1 md:px-8 text-center">
              <p className="text-sm font-bold">SESCON-SP | CNPJ 62.638.168/0001-84</p>
              <p className="text-xs">Av. Tiradentes, 998 - Luz | São Paulo-SP - 01102-000 (200m do metrô Armênia)</p>
              <p className="text-xs font-bold mt-2">SESCON-SP 2025 | Sindicato das Empresas de Serviços Contábeis, Assessoramento, Perícias, Informações e Pesquisas no Estado de São Paulo</p>
              <p className="text-xs mt-1">Para suporte, entre em contato: <a href="mailto:cadastro@sescon.org.br" className="underline hover:text-blue-200">cadastro@sescon.org.br</a></p>
            </div>

            {/* Direita: Logo Corrigido */}
            <div className="hidden md:flex justify-end">
              <img src="/pacc-sescon-improved/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto" />
            </div>
          </div>

          {/* Seção Inferior: Links e Informações Legais */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 text-xs border-b border-white border-opacity-30 pb-4">
              <a href="https://sescon.org.br/canais-de-atendimento/" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">Canais de atendimento</a>
              <span className="hidden md:inline">|</span>
              <a href="https://sescon.org.br/wp-content/uploads/2025/05/POLITICA-DE-PRIVACIDADE-E-COOKIES-1.pdf" target="_blank" rel="noopener noreferrer" className="text-white hover:text-blue-200 transition-colors">Política de Privacidade e Cookies</a>
            </div>

            <p className="text-xs leading-relaxed opacity-90">
              © O Sescon-SP e a Aescon-SP informam que, em respeito aos preceitos elencados no art. 6º da LGPD e, em especial, ao Princípio da Finalidade, a coleta dos dados pessoais dispostos nos formulários de contato, será pautada na hipótese de tratamento prevista no inciso IX do Art. 7º da Lei nº 13.709/18.
            </p>

            <p className="text-xs font-semibold">SESCON-SP Todos os Direitos Reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

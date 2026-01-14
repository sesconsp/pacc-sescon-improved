import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, Mail, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Loader2, Search, Save, RotateCcw, Eye, Clock, CheckCircle2, AlertTriangle, Send, FileDown, Download as DownloadIcon, Trash, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Building, Users } from "lucide-react";
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

const faqs: FAQ[] = [
  {
    pergunta: "Por que preciso informar todos os meus clientes?",
    resposta: "O SESCON está modernizando sua base de dados. Ao informar todos os seus clientes atuais, garantimos que apenas empresas que você realmente representa receberão nossas comunicações."
  },
  {
    pergunta: "Posso usar o mesmo e-mail para vários clientes?",
    resposta: "Sim, você pode usar o mesmo e-mail para vários clientes. Se não informar um e-mail específico, será utilizado o e-mail do seu escritório."
  },
  {
    pergunta: "O contrato social é obrigatório?",
    resposta: "Não, o contrato social é opcional. Você pode enviar o formulário sem anexar. Se desejar, aceita apenas arquivos em PDF."
  },
  {
    pergunta: "Posso atualizar minha lista depois?",
    resposta: "Sim, você pode atualizar sua lista a qualquer momento preenchendo o formulário novamente. A nova lista substituirá a anterior."
  },
  {
    pergunta: "Como baixo os dados que enviei?",
    resposta: "Após enviar, você receberá um e-mail de confirmação com um link para baixar um comprovante em PDF com todos os dados."
  },
  {
    pergunta: "Quanto tempo leva para processar?",
    resposta: "A atualização é processada imediatamente após o envio. Você receberá um e-mail de confirmação em poucos minutos."
  },
  {
    pergunta: "O que fazer se cometer um erro?",
    resposta: "Você pode enviar os dados novamente. A nova lista substituirá a anterior. Se precisar de ajuda, entre em contato conosco."
  },
  {
    pergunta: "Como valido meu CNPJ?",
    resposta: "O sistema valida automaticamente o CNPJ quando você digita. Se válido, aparecerá uma mensagem de confirmação."
  },
  {
    pergunta: "Qual a responsabilidade da contabilidade sobre as informações?",
    resposta: "A contabilidade atua como facilitadora no envio das informações, garantindo que os dados cadastrais e de contribuições estejam alinhados com as obrigações acessórias e a regularidade das empresas representadas."
  },
  {
    pergunta: "Como saber quais são as categorias representadas pelo SESCON-SP?",
    resposta: "O SESCON-SP representa 58 categorias econômicas, divididas entre Contábil e Assessoramento. Abaixo estão listados todos os CNAEs representados:<br/><br/>\n<ul>\n<li>02.30-6/00: Atividade de apoio à produção florestal</li>\n<li>52.29-0/02: Serviços de reboque de veículos</li>\n<li>52.29-0/99: Outras atividades auxiliares dos transportes terrestres não especificadas</li>\n<li>52.40-1/01: Operação dos aeroportos e campos de aterrissagem</li>\n<li>52.50-8/04: Organização logística do transporte de carga</li>\n<li>52.50-8/05: Operador de transporte multimodal - OTM</li>\n<li>64.61-1/00: Holdings de instituições financeiras</li>\n<li>64.62-0/00: Holdings de instituições não-financeiras</li>\n<li>64.63-8/00: Outras sociedades de participação, exceto holdings</li>\n<li>66.11-8/01: Bolsa de valores</li>\n<li>66.11-8/02: Bolsa de mercadorias</li>\n<li>66.11-8/03: Bolsa de mercadorias e futuros</li>\n<li>66.11-8/04: Administração de mercados de balcão organizados</li>\n<li>66.12-6/05: Agentes de investimentos em aplicações financeiras</li>\n<li>66.13-4/00: Administração de carteiras de crédito</li>\n<li>66.19-3/02: Correspondentes de instituições financeiras</li>\n<li>66.19-3/03: Representação de bancos</li>\n<li>66.19-3/99: Outras atividades auxiliares dos serviços financeiros não especificadas</li>\n<li>66.21-5/01: Peritos e avaliadores de seguros</li>\n<li>66.21-5/02: Auditoria e consultoria atuarial</li>\n<li>66.29-1/00: Atividades auxiliares dos seguros, da previdência complementar e dos planos</li>\n<li>66.30-4/00: Atividades de administração de fundos por contrato ou comissão</li>\n<li>68.10-2/02: Aluguel de imóveis próprios</li>\n<li>69.11-7/03: Atividades auxiliares da justiça: arbitragem, mediação, avaliações, perícia.</li>\n<li>69.11-7/20: Agente de propriedade industrial</li>\n<li>69.20-6/01: Atividades de contabilidade</li>\n<li>69.20-6/02: Atividades de consultoria e auditoria contábil e tributária</li>\n<li>70.20-4/00: Atividades de consultoria em gestão empresarial, exceto consultoria técnica</li>\n<li>71.19-7/01: Serviços de cartografia, topografia e geodésia</li>\n<li>71.19-7/02: Atividades de estudos geológicos (prospecção geológica)</li>\n<li>71.19-7/03: Serviços de desenho técnico relacionados à arquitetura e engenharia</li>\n<li>71.19-7/04: Serviços de perícia técnica relacionados à segurança do trabalho</li>\n<li>71.20-1/00: Testes e análises técnicas (ensaios de materiais e produtos, análise</li>\n<li>72.10-0/00: Pesquisa e desenvolvimento experimental em ciências físicas e naturais</li>\n<li>72.20-7/00: Pesquisa e desenvolvimento experimental em ciências sociais e humanas</li>\n<li>73.19-0/02: Promoção de Vendas</li>\n<li>73.19-0/04: Consultoria em publicidade</li>\n<li>73.20-3/00: Pesquisa de mercado e de opinião pública</li>\n<li>74.20-0/02: Atividades de produção de fotografias aéreas e submarinas</li>\n<li>74.20-0/05: Serviços de microfilmagem</li>\n<li>74.90-1/01: Serviços de Tradução, Interpretação e Similares</li>\n<li>74.90-1/03: Serviços de agronomia e de consultoria e de atividades agrícolas e pecuárias</li>\n<li>74.90-1/04: Atividades de intermediação e agenciamento de serviços e negócios em geral</li>\n<li>74.90-1/05: Agenciamento de profissionais para atividades esportivas, culturais</li>\n<li>74.90-1/99: Outras atividades profissionais, científicas e técnicas não especificadas</li>\n<li>77.40-3/00: Gestão de ativos intangíveis não-financeiros</li>\n<li>78.10-8/00: Seleção e Agenciamento de Mão de obra</li>\n<li>80.20-0/00: Atividades de monitoramento de sistemas de segurança</li>\n<li>82.11-3/00: Serviços combinados de escritório e apoio administrativo</li>\n<li>82.19-9/99: Preparação de documentos e serviços especializados de apoio administrativo</li>\n<li>82.99-7/99: Outras atividades de serviços prestados principalmente às empresas</li>\n<li>85.50-3/02: Atividades de apoio à educação, exceto caixas escolares</li>\n<li>85.99-6/04: Treinamento em desenvolvimento profissional e gerencial</li>\n<li>86.60-7/00: Atividades de apoio a gestão de saúde (exceto serviços privativos de médicos)</li>\n<li>94.11-1/00: Atividades de organizações associativas patronais e empresariais</li>\n<li>94.12-0/00: Atividades de organizações associativas profissionais</li>\n<li>94.30-8/00: Atividades de associações de defesa de direitos sociais</li>\n<li>94.91-0/00: Atividades de organizações religiosas</li>\n<li>94.99-5/00: Atividades associativas não especificadas anteriormente</li>\n</ul>"
  }
];

// Cores SESCON
const SESCON_BLUE = "#003b61";
const SESCON_DARK_BLUE = "#002a45";
const SESCON_LIGHT_BLUE = "#eef6fb";
const SESCON_ACCENT = "#00568c";

// Função auxiliar para converter arquivo em Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Função para validar CNPJ
const validarCNPJ = (cnpj: string): boolean => {
  const cnpjLimpo = cnpj.replace(/\D/g, "");
  if (cnpjLimpo.length !== 14) return false;
  
  let tamanho = cnpjLimpo.length - 2;
  let numeros = cnpjLimpo.substring(0, tamanho);
  let digitos = cnpjLimpo.substring(tamanho);
  let soma = 0;
  let pos = 0;

  for (let i = tamanho - 1; i >= 0; i--) {
    pos++;
    soma += parseInt(numeros.charAt(tamanho - pos)) * (pos % 8 === 0 ? 2 : pos + 1);
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho = tamanho + 1;
  numeros = cnpjLimpo.substring(0, tamanho);
  soma = 0;
  pos = 0;

  for (let i = tamanho - 1; i >= 0; i--) {
    pos++;
    soma += parseInt(numeros.charAt(tamanho - pos)) * (pos % 8 === 0 ? 2 : pos + 1);
  }

  resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
};

// Função para formatar CNPJ
const formatarCNPJ = (value: string): string => {
  const cnpj = value.replace(/\D/g, "");
  if (cnpj.length <= 2) return cnpj;
  if (cnpj.length <= 5) return `${cnpj.slice(0, 2)}.${cnpj.slice(2)}`;
  if (cnpj.length <= 8) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5)}`;
  if (cnpj.length <= 12) return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8)}`;
  return `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`;
};

export default function Home() {
  const [cnpjEscritorio, setCnpjEscritorio] = useState("");
  const [razaoSocialEscritorio, setRazaoSocialEscritorio] = useState("");
  const [emailEscritorio, setEmailEscritorio] = useState("");
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
  const [abaSelecionada, setAbaSelecionada] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [atividadePrincipal, setAtividadePrincipal] = useState("contabilidade");
  
  // Estados de validação
  const [erroEmail, setErroEmail] = useState("");
  const [erroCNPJ, setErroCNPJ] = useState("");

  // Função de validação de e-mail
  const validarEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validação em tempo real do CNPJ
  useEffect(() => {
    if (cnpjEscritorio) {
      const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
      if (cnpjLimpo.length > 0 && cnpjLimpo.length < 14) {
        setErroCNPJ("CNPJ incompleto");
      } else if (cnpjLimpo.length === 14 && !validarCNPJ(cnpjLimpo)) {
        setErroCNPJ("CNPJ inválido");
      } else {
        setErroCNPJ("");
      }
    } else {
      setErroCNPJ("");
    }
  }, [cnpjEscritorio]);

  // Validação em tempo real do E-mail
  useEffect(() => {
    if (emailEscritorio) {
      if (!validarEmail(emailEscritorio)) {
        setErroEmail("E-mail inválido");
      } else {
        setErroEmail("");
      }
    } else {
      setErroEmail("");
    }
  }, [emailEscritorio]);
  
  const [temRascunho, setTemRascunho] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [progressoUpload, setProgressoUpload] = useState(0);
  const [statusUpload, setStatusUpload] = useState("");
  const [busca, setBusca] = useState("");
  const [buscaCarregando, setBuscaCarregando] = useState(false);
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [mostrarConfirmacaoSair, setMostrarConfirmacaoSair] = useState(false);

  // Interceptar fechamento/atualização da página
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cnpjEscritorio || razaoSocialEscritorio || clientes.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cnpjEscritorio, razaoSocialEscritorio, clientes]);

  // Buscar CNPJ do escritório (simulado)
  const buscarCNPJEscritorio = async (cnpj: string) => {
    setBuscandoReceita(true);
    try {
      // Simulação de busca - em produção, isso chamaria uma API real
      await new Promise(resolve => setTimeout(resolve, 1000));
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      if (validarCNPJ(cnpjLimpo)) {
        setCnpjEscritorioValido(true);
        setRazaoSocialEscritorio("Escritório Contábil Exemplo LTDA");
        toast.success("CNPJ validado com sucesso!", { duration: 2000 });
      }
    } catch (error) {
      toast.error("Erro ao buscar CNPJ", { duration: 3000 });
    } finally {
      setBuscandoReceita(false);
    }
  };

  // Buscar CNPJ do cliente (simulado)
  const buscarCNPJCliente = async (cnpj: string) => {
    try {
      // Simulação de busca
      await new Promise(resolve => setTimeout(resolve, 500));
      const cnpjLimpo = cnpj.replace(/\D/g, "");
      if (validarCNPJ(cnpjLimpo)) {
        setNovoCliente({
          ...novoCliente,
          cnpjValido: true,
          razaoSocial: "Empresa Cliente LTDA",
          ehMatriz: true
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ do cliente", error);
    }
  };

  // Processar upload de CSV
  const processarUploadCSV = (file: File, callback: (clientes: Cliente[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target?.result as string;
        const linhas = csv.split('\n').filter(l => l.trim());
        const novosClientes: Cliente[] = [];
        
        linhas.forEach((linha, idx) => {
          if (idx === 0) return; // Pular cabeçalho
          const [cnpj, razaoSocial, email] = linha.split(',').map(s => s.trim());
          if (cnpj && razaoSocial) {
            novosClientes.push({
              id: Math.random().toString(),
              cnpj: formatarCNPJ(cnpj),
              razaoSocial,
              emailPrincipal: !email,
              emailCustomizado: email || "",
              cnpjValido: validarCNPJ(cnpj),
              ehMatriz: false
            });
          }
        });
        
        callback(novosClientes);
        toast.success(`${novosClientes.length} cliente(s) importado(s)!`, { duration: 3000 });
      } catch (error) {
        toast.error("Erro ao processar CSV", { duration: 3000 });
      }
    };
    reader.readAsText(file);
  };

  // Processar upload de Excel
  const processarUploadExcel = (file: File, callback: (clientes: Cliente[]) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const dados = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(dados, { type: 'array' });
        const planilha = workbook.Sheets[workbook.SheetNames[0]];
        const dados_json = XLSX.utils.sheet_to_json(planilha);
        
        const novosClientes: Cliente[] = dados_json.map((row: any) => ({
          id: Math.random().toString(),
          cnpj: formatarCNPJ(row.CNPJ || row.cnpj || ""),
          razaoSocial: row["Razão Social"] || row["razao_social"] || row.razaoSocial || "",
          emailPrincipal: !row.Email && !row.email,
          emailCustomizado: row.Email || row.email || "",
          cnpjValido: validarCNPJ((row.CNPJ || row.cnpj || "").replace(/\D/g, "")),
          ehMatriz: false
        })).filter((c: Cliente) => c.cnpj && c.razaoSocial);
        
        callback(novosClientes);
        toast.success(`${novosClientes.length} cliente(s) importado(s)!`, { duration: 3000 });
      } catch (error) {
        toast.error("Erro ao processar Excel", { duration: 3000 });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Adicionar cliente manualmente
  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha CNPJ e Razão Social", { duration: 2000 });
      return;
    }

    const cnpjLimpo = novoCliente.cnpj.replace(/\D/g, "");
    if (!validarCNPJ(cnpjLimpo)) {
      toast.error("CNPJ inválido", { duration: 2000 });
      return;
    }

    const novoClienteObj: Cliente = {
      id: Math.random().toString(),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal,
      emailCustomizado: novoCliente.emailCustomizado,
      cnpjValido: true,
      ehMatriz: novoCliente.ehMatriz,
      contratosocial: novoCliente.contratosocial
    };

    setClientes([...clientes, novoClienteObj]);
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
    toast.success("Cliente removido", { duration: 2000 });
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
    try {
      // Converte arquivos para Base64 antes de enviar
      const clientesComArquivos = await Promise.all(clientes.map(async (c) => {
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
        return {
          cnpj: c.cnpj,
          razaoSocial: c.razaoSocial,
          email: c.emailCustomizado || emailEscritorio,
          contratoArquivo: arquivoData
        };
      }));

      const dadosEnvio = {
        escritorioCnpj: cnpjEscritorio,
        escritorioRazao: razaoSocialEscritorio,
        escritorioEmail: emailEscritorio,
        clientes: clientesComArquivos,
        dataEnvio: new Date().toISOString()
      };

      // URL do Google Apps Script para enviar para Google Drive
      const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxR2MCXtsKqCO3cXC6NgAkntgt6E2N5eTFEAqbyw7YW9Q2lATMGOE1L-NI916Ofduio/exec";
      
      const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEnvio),
      });

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
      toast.success("Dados enviados com sucesso!", { duration: 4000 });
    } catch (error) {
      console.error("Erro ao enviar dados:", error);
      toast.error("Erro ao enviar dados", { duration: 3000 });
    } finally {
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
    
    // Salva usando o CNPJ como chave
    localStorage.setItem(`rascunho_pacc_${cnpjLimpo}`, JSON.stringify(rascunho));
    setTemRascunho(true);
    toast.success(`Rascunho salvo para o CNPJ ${cnpjEscritorio}`, { duration: 3000 });
  };

  // Tentar carregar rascunho quando o CNPJ é preenchido
  useEffect(() => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      const rascunhoSalvo = localStorage.getItem(`rascunho_pacc_${cnpjLimpo}`);
      if (rascunhoSalvo) {
        // Se encontrou rascunho, pergunta se quer carregar (ou carrega silenciosamente se preferir)
        // Aqui vamos carregar automaticamente apenas se os outros campos estiverem vazios
        if (!razaoSocialEscritorio && clientes.length === 0) {
          try {
            const dados = JSON.parse(rascunhoSalvo) as Rascunho;
            setRazaoSocialEscritorio(dados.nomeEscritorio || "");
            setEmailEscritorio(dados.emailEscritorio || "");
            setClientes(dados.clientes || []);
            setTemRascunho(true);
            toast.info("Rascunho encontrado e carregado para este CNPJ", { duration: 4000 });
          } catch (e) {
            console.error("Erro ao carregar rascunho", e);
          }
        }
      }
    }
  }, [cnpjEscritorio]);

  // Limpar rascunho atual
  const limparRascunho = () => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo) {
      localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
      setTemRascunho(false);
      toast.success("Rascunho deste CNPJ excluído", { duration: 2000 });
      setMostrarConfirmacaoLimpar(false);
    }
  };

  // Gerar modelo CSV
  const gerarModeloCSV = () => {
    const csv = "CNPJ,Razão Social,E-mail\n00.000.000/0000-00,Empresa Exemplo,email@exemplo.com";
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

  const clientesFiltrados = clientes.filter((c: Cliente) =>
    c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj.includes(busca)
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f7fa" }}>
      {/* Header Corporativo */}
      <header className="border-b" style={{ background: SESCON_BLUE, borderColor: SESCON_DARK_BLUE }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src="/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto hidden md:block" />
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
            <div className="bg-white rounded-lg p-4 shadow-sm border mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>
                  Progresso do Cadastro
                </span>
                <span className="text-sm font-bold" style={{ color: SESCON_BLUE }}>
                  {abaSelecionada === 1 ? "50%" : "90%"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500 ease-out" 
                  style={{ 
                    width: abaSelecionada === 1 ? "50%" : "90%", 
                    background: SESCON_BLUE 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {abaSelecionada === 1 
                  ? "Passo 1 de 2: Identificação do Escritório" 
                  : "Passo 2 de 2: Gestão de Clientes e Envio"}
              </p>
            </div>

            {/* Abas - Redesenhadas */}
            <div className="flex gap-6 border-b-2 mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <button
                onClick={() => setAbaSelecionada(1)}
                className={`pb-4 px-4 font-bold transition-all border-b-4 text-lg flex items-center gap-3 hover:text-blue-800`}
                style={{
                  color: abaSelecionada === 1 ? SESCON_BLUE : "#999",
                  borderColor: abaSelecionada === 1 ? SESCON_BLUE : "transparent"
                }}
              >
                <Building className="w-5 h-5" />
                Dados da Empresa
              </button>
              <button
                onClick={() => setAbaSelecionada(2)}
                className={`pb-4 px-4 font-bold transition-all border-b-4 text-lg flex items-center gap-3 hover:text-blue-800`}
                style={{
                  color: abaSelecionada === 2 ? SESCON_BLUE : "#999",
                  borderColor: abaSelecionada === 2 ? SESCON_BLUE : "transparent"
                }}
              >
                <Users className="w-5 h-5" />
                Gestão de Clientes
              </button>
            </div>

            {/* Conteúdo das Abas com Animação */}
            <AnimatePresence mode="wait">
              {abaSelecionada === 1 ? (
                <motion.div
                  key="aba1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="rounded-lg p-8 shadow-sm border bg-white"
                >
                <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>
                  Identificação da Empresa
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>
                      CNPJ do Escritório *
                    </label>
                    <div className="flex gap-3">
                      <Input
                        type="text"
                        placeholder="00.000.000/0000-00"
                        value={cnpjEscritorio}
                        onChange={(e) => {
                          const formatado = formatarCNPJ(e.target.value);
                          setCnpjEscritorio(formatado);
                        }}
                        onBlur={() => {
                          if (cnpjEscritorio.replace(/\D/g, "").length === 14) {
                            buscarCNPJEscritorio(cnpjEscritorio);
                          }
                        }}
                        maxLength={18}
                        className={`flex-1 rounded-lg border-2 px-4 py-2 transition-colors ${erroCNPJ ? "border-red-500 focus:border-red-500" : "focus:border-blue-500 focus:ring-blue-500"}`}
                      />
                      {buscandoReceita && <Loader2 className="w-5 h-5 animate-spin" style={{ color: SESCON_BLUE }} />}
                    </div>
                    {erroCNPJ && <p className="text-xs mt-1 text-red-500 font-semibold">{erroCNPJ}</p>}
                    <p className="text-xs mt-2 text-gray-600">Os dados serão preenchidos automaticamente da Receita Federal</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>
                      Nome do Escritório *
                    </label>
                    <Input
                      type="text"
                      placeholder="Será preenchido automaticamente"
                      value={razaoSocialEscritorio}
                      onChange={(e) => setRazaoSocialEscritorio(e.target.value)}
                      className="rounded-lg border-2 px-4 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>
                      E-mail para Contato (Obrigatório) *
                    </label>
                    <Input
                      type="email"
                      placeholder="contato@empresa.com.br"
                      value={emailEscritorio}
                      onChange={(e) => setEmailEscritorio(e.target.value)}
                      className={`rounded-lg border-2 px-4 py-2 ${erroEmail ? "border-red-500 focus:border-red-500" : ""}`}
                    />
                    {erroEmail && <p className="text-xs mt-1 text-red-500 font-semibold">{erroEmail}</p>}
                    <p className="text-xs mt-2 text-gray-600">Este e-mail receberá a confirmação do envio</p>
                  </div>

                  {cnpjEscritorioValido && (
                    <div 
                      className="p-4 rounded-lg border-l-4 flex gap-3"
                      style={{ background: "#e8f5e9", borderColor: "#4caf50" }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <p className="text-sm text-green-800">CNPJ validado com sucesso. Dados carregados da Receita Federal.</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    {temRascunho && (
                      <Button
                        onClick={() => setMostrarConfirmacaoLimpar(true)}
                        variant="outline"
                        className="rounded-lg border-2 font-semibold py-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 mr-2" />
                        Limpar Rascunho
                      </Button>
                    )}
                    <Button
                      onClick={() => setAbaSelecionada(2)}
                      className="flex-1 rounded-lg font-bold py-3 text-white text-lg hover:bg-blue-700 transition-colors"
                      style={{ background: SESCON_BLUE }}
                    >
                      Próximo
                    </Button>
                  </div>
                </div>
                
                {/* FAQ Section - Centralizado */}
                <div className="mt-6 rounded-lg p-8 shadow-sm border" style={{ borderColor: SESCON_BLUE, background: SESCON_LIGHT_BLUE }}>
                  <h2 className="text-2xl font-bold mb-6" style={{ color: SESCON_DARK_BLUE }}>
                    Perguntas Frequentes
                  </h2>
                  <div className="space-y-3">
                    {faqs.map((faq, i) => (
                      <div key={i} className="border rounded-lg overflow-hidden shadow-sm" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                        <button
                          onClick={() => setExpandedFAQ(expandedFAQ === i ? null : i)}
                          className="w-full p-4 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                        >
                          <p className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{faq.pergunta}</p>
                          {expandedFAQ === i ? (
                            <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: SESCON_BLUE }} />
                          ) : (
                            <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: SESCON_BLUE }} />
                          )}
                        </button>
                        {expandedFAQ === i && (
                          <div className="p-4 bg-gray-50 border-t" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                            <div className="text-sm text-gray-700 leading-relaxed space-y-2" dangerouslySetInnerHTML={{ __html: faq.resposta.replace(/(\d{2}\.\d{2}-\d\/\d{2})/g, `<strong style="color: ${SESCON_DARK_BLUE}; font-weight: 800;">$1</strong>`) }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
                <motion.div
                  key="aba2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg p-8 shadow-sm border"
                  style={{ borderColor: SESCON_LIGHT_BLUE }}
                >
                <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>
                  Gestão de Clientes
                </h2>

                <div className="space-y-6">
                  {/* Seleção de Atividade */}
                  <div className="p-6 rounded-lg border bg-blue-50/30" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                    <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>
                      Atividade Principal *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="atividade"
                          value="contabilidade"
                          checked={atividadePrincipal === "contabilidade"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Contabilidade</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="atividade"
                          value="outros"
                          checked={atividadePrincipal === "outros"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <span>Outros</span>
                      </label>
                    </div>
                  </div>

                  {atividadePrincipal === "outros" ? (
                    <div className="p-8 rounded-xl border-2 border-dashed bg-blue-50/30 text-center" style={{ borderColor: SESCON_BLUE }}>
                      <h3 className="text-xl font-bold mb-4" style={{ color: SESCON_DARK_BLUE }}>
                        Atualização Cadastral
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Para outras atividades, por favor utilize o formulário específico de atualização cadastral.
                      </p>
                      <Button
                        onClick={() => window.location.href = "https://sesconsp.github.io/atualizacao-cadastral/"}
                        className="rounded-lg font-bold py-3 px-6 text-white text-lg hover:bg-blue-700 transition-colors"
                        style={{ background: SESCON_BLUE }}
                      >
                        Ir para Atualização Cadastral
                      </Button>
                    </div>
                  ) : (
                    <>
                      {/* Importação - Redesenhada */}
                      <div className="p-8 rounded-xl border-2 border-dashed bg-blue-50/30 transition-colors hover:bg-blue-50/60" style={{ borderColor: SESCON_BLUE }}>
                    <div className="flex flex-col items-center text-center mb-8">
                      <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4 shadow-sm">
                        <Upload className="w-8 h-8" style={{ color: SESCON_BLUE }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ color: SESCON_DARK_BLUE }}>
                        Importar Lista de Clientes
                      </h3>
                      <p className="text-sm text-gray-600 max-w-md leading-relaxed">
                        Agilize o cadastro importando seus clientes via planilha.<br/>
                        Aceitamos arquivos <strong>.CSV</strong> ou <strong>.Excel</strong> com as colunas: CNPJ, Razão Social e E-mail.
                      </p>
                    </div>

                    <div className="flex gap-4 max-w-xl mx-auto">
                      <Button
                        onClick={gerarModeloCSV}
                        variant="outline"
                        className="flex-1 rounded-lg border-2 py-6 hover:bg-blue-50 transition-colors h-auto flex flex-col gap-2"
                        style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}
                      >
                        <Download className="w-6 h-6" />
                        <span className="font-bold">Baixar Modelo</span>
                      </Button>
                      <label className="flex-1">
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.name.endsWith('.csv')) {
                                processarUploadCSV(file, (novosClientes) => {
                                  setClientes([...clientes, ...novosClientes]);
                                  setProgressoUpload(0);
                                });
                              } else {
                                processarUploadExcel(file, (novosClientes) => {
                                  setClientes([...clientes, ...novosClientes]);
                                  setProgressoUpload(0);
                                });
                              }
                            }
                          }}
                          className="hidden"
                          id="file-upload"
                        />
                        <div
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex items-center justify-center gap-2 p-6 rounded-lg border-2 border-dashed hover:bg-blue-50 transition-colors h-full" style={{ borderColor: SESCON_BLUE }}>
                            <Upload className="w-6 h-6" style={{ color: SESCON_BLUE }} />
                            <span className="font-bold" style={{ color: SESCON_BLUE }}>Selecionar Arquivo</span>
                          </div>
                        </div>
                      </label>
                    </div>
                      </div>

                  {/* Adicionar Manual */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                    <p className="text-sm font-semibold mb-4" style={{ color: SESCON_DARK_BLUE }}>
                      Adicionar Cliente Manualmente
                    </p>
                    <div className="space-y-3">
                      <Input
                        type="text"
                        placeholder="CNPJ"
                        value={novoCliente.cnpj}
                        onChange={(e) => {
                          const formatado = formatarCNPJ(e.target.value);
                          setNovoCliente({ ...novoCliente, cnpj: formatado });
                        }}
                        onBlur={() => {
                          if (novoCliente.cnpj.replace(/\D/g, "").length === 14) {
                            buscarCNPJCliente(novoCliente.cnpj);
                          }
                        }}
                        maxLength={18}
                        className="rounded-lg border-2 px-4 py-2"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                      <Input
                        type="text"
                        placeholder="Razão Social"
                        value={novoCliente.razaoSocial}
                        onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })}
                        className="rounded-lg border-2 px-4 py-2"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>
                          E-mail do Cliente
                        </label>
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer" style={{ borderColor: novoCliente.emailPrincipal ? SESCON_BLUE : "#ddd", background: novoCliente.emailPrincipal ? SESCON_LIGHT_BLUE : "white" }}>
                            <input
                              type="radio"
                              checked={novoCliente.emailPrincipal}
                              onChange={() => setNovoCliente({ ...novoCliente, emailPrincipal: true, emailCustomizado: "" })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm" style={{ color: SESCON_DARK_BLUE }}>Usar e-mail da empresa</span>
                          </label>
                          <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer" style={{ borderColor: !novoCliente.emailPrincipal ? SESCON_BLUE : "#ddd", background: !novoCliente.emailPrincipal ? SESCON_LIGHT_BLUE : "white" }}>
                            <input
                              type="radio"
                              checked={!novoCliente.emailPrincipal}
                              onChange={() => setNovoCliente({ ...novoCliente, emailPrincipal: false })}
                              className="w-4 h-4"
                            />
                            <span className="text-sm" style={{ color: SESCON_DARK_BLUE }}>E-mail customizado</span>
                          </label>
                        </div>
                        {!novoCliente.emailPrincipal && (
                          <Input
                            type="email"
                            placeholder="email@cliente.com.br"
                            value={novoCliente.emailCustomizado}
                            onChange={(e) => setNovoCliente({ ...novoCliente, emailCustomizado: e.target.value })}
                            className="rounded-lg border-2 px-4 py-2"
                            style={{ borderColor: SESCON_BLUE }}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>
                          Contrato Social (Opcional)
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
                      <Button
                        onClick={adicionarCliente}
                        className="w-full rounded-lg font-semibold py-2 text-white"
                        style={{ background: SESCON_BLUE }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Cliente
                      </Button>
                    </div>
                  </div>

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
                      >
                        Voltar
                      </Button>
                      <Button
                        onClick={salvarRascunho}
                        className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                        style={{ background: SESCON_ACCENT }}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Rascunho
                      </Button>
                      <Button
                        onClick={() => setMostrarModalClientes(true)}
                        disabled={clientes.length === 0}
                        className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                        style={{ background: SESCON_ACCENT }}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Clientes
                      </Button>
                    </div>
                    <Button
                      onClick={enviarDados}
                      disabled={isLoading || clientes.length === 0}
                      className="flex-1 rounded-lg font-bold py-3 text-white text-lg hover:bg-green-700 transition-colors"
                      style={{ background: "#4CAF50" }}
                    >
                      {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
                      {isLoading ? "Enviando..." : "Enviar Dados"}
                    </Button>
                  </div>
                    </>
                  )}
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
                    <p className="text-xs text-gray-600 mt-1">E-mail: {cliente.emailCustomizado || emailEscritorio}</p>
                    {cliente.ehMatriz && (
                      <p className="text-xs text-blue-600 mt-1 font-semibold">🏢 Matriz</p>
                    )}
                    {cliente.contratosocial && (
                      <p className="text-xs text-green-600 mt-1 font-semibold">✓ Contrato Social anexado</p>
                    )}
                  </div>
                  <Button
                    onClick={() => removerCliente(cliente.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Limpar Rascunho */}
      <AlertDialog open={mostrarConfirmacaoLimpar} onOpenChange={setMostrarConfirmacaoLimpar}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar Rascunho</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o rascunho salvo para este CNPJ? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={limparRascunho} className="bg-red-600 hover:bg-red-700">
              Excluir Rascunho
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

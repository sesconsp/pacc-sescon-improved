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
	    resposta: "O SESCON-SP representa 58 categorias econômicas, divididas entre Contábil e Assessoramento. Abaixo estão listados todos os CNAEs representados:<br/><br/>\n<ul>\n<li>02.30-6/00: Atividade de apoio à produção florestal</li>\n<li>52.29-0/02: Serviços de reboque de veículos</li>\n<li>52.29-0/99: Outras atividades auxiliares dos transportes terrestres não especificadas</li>\n<li>52.40-1/01: Operação dos aeroportos e campos de aterrissagem</li>\n<li>52.50-8/04: Organização logística do transporte de carga</li>\n<li>52.50-8/05: Operador de transporte multimodal - OTM</li>\n<li>64.61-1/00: Holdings de instituições financeiras</li>\n<li>64.62-0/00: Holdings de instituições não-financeiras</li>\n<li>64.63-8/00: Outras sociedades de participação, exceto holdings</li>\n<li>66.11-8/01: Bolsa de valores</li>\n<li>66.11-8/02: Bolsa de mercadorias</li>\n<li>66.11-8/03: Bolsa de mercadorias e futuros</li>\n<li>66.11-8/04: Administração de mercados de balcão organizados</li>\n<li>66.12-6/05: Agentes de investimentos em aplicações financeiras</li>\n<li>66.13-4/00: Administração de cartões de crédito</li>\n<li>66.19-3/02: Correspondentes de instituições financeiras</li>\n<li>66.19-3/03: Representação de bancos</li>\n<li>66.19-3/99: Outras atividades auxiliares dos serviços financeiros não especificadas</li>\n<li>66.21-5/01: Peritos e avaliadores de seguros</li>\n<li>66.21-5/02: Auditoria e consultoria atuarial</li>\n<li>66.29-1/00: Atividades auxiliares dos seguros, da previdência complementar e dos planos</li>\n<li>66.30-4/00: Atividades de administração de fundos por contrato ou comissão</li>\n<li>68.10-2/02: Aluguel de imóveis próprios</li>\n<li>69.11-7/03: Atividades auxiliares da justiça: arbitragem, mediação, avaliações, perícia.</li>\n<li>69.11-7/20: Agente de propriedade industrial</li>\n<li>69.20-6/01: Atividades de contabilidade</li>\n<li>69.20-6/02: Atividades de consultoria e auditoria contábil e tributária</li>\n<li>70.20-4/00: Atividades de consultoria em gestão empresarial, exceto consultoria técnica</li>\n<li>71.19-7/01: Serviços de cartografia, topografia e geodésia</li>\n<li>71.19-7/02: Atividades de estudos geológicos (prospecção geológica)</li>\n<li>71.19-7/03: Serviços de desenho técnico relacionados à arquitetura e engenharia</li>\n<li>71.19-7/04: Serviços de perícia técnica relacionados à segurança do trabalho</li>\n<li>71.20-1/00: Testes e análises técnicas (ensaios de materiais e produtos, análise</li>\n<li>72.10-0/00: Pesquisa e desenvolvimento experimental em ciências físicas e naturais</li>\n<li>72.20-7/00: Pesquisa e desenvolvimento experimental em ciências sociais e humanas</li>\n<li>73.19-0/02: Promoção de Vendas</li>\n<li>73.19-0/04: Consultoria em publicidade</li>\n<li>73.20-3/00: Pesquisa de mercado e de opinião pública</li>\n<li>74.20-0/02: Atividades de produção de fotografias aéreas e submarinas</li>\n<li>74.20-0/05: Serviços de microfilmagem</li>\n<li>74.90-1/01: Serviços de Tradução, Interpretação e Similares</li>\n<li>74.90-1/03: Serviços de agronomia e de consultoria e de atividades agrícolas e pecuárias</li>\n<li>74.90-1/04: Atividades de intermediação e agenciamento de serviços e negócios em geral</li>\n<li>74.90-1/05: Agenciamento de profissionais para atividades esportivas, culturais</li>\n<li>74.90-1/99: Outras atividades profissionais, científicas e técnicas não especificadas</li>\n<li>77.40-3/00: Gestão de ativos intangíveis não-financeiros</li>\n<li>78.10-8/00: Seleção e Agenciamento de Mão de obra</li>\n<li>80.20-0/00: Atividades de monitoramento de sistemas de segurança</li>\n<li>82.11-3/00: Serviços combinados de escritório e apoio administrativo</li>\n<li>82.19-9/99: Preparação de documentos e serviços especializados de apoio administrativo</li>\n<li>82.99-7/99: Outras atividades de serviços prestados principalmente às empresas</li>\n<li>85.50-3/02: Atividades de apoio à educação, exceto caixas escolares</li>\n<li>85.99-6/04: Treinamento em desenvolvimento profissional e gerencial</li>\n<li>86.60-7/00: Atividades de apoio a gestão de saúde (exceto serviços privativos de médicos)</li>\n<li>94.11-1/00: Atividades de organizações associativas patronais e empresariais</li>\n<li>94.12-0/00: Atividades de organizações associativas profissionais</li>\n<li>94.30-8/00: Atividades de associações de defesa de direitos sociais</li>\n<li>94.91-0/00: Atividades de organizações religiosas</li>\n<li>94.99-5/00: Atividades associativas não especificadas anteriormente</li>\n</ul>"
	  }
	];

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
  // abaSelecionada já foi declarado acima, removendo duplicata
  // const [abaSelecionada, setAbaSelecionada] = useState(1);
  const [atividadePrincipal, setAtividadePrincipal] = useState("");
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

  // Cores SESCON Oficiais - Azul Marinho Mais Escuro
  const SESCON_BLUE = "#003d7a";
  const SESCON_DARK_BLUE = "#002147";
  const SESCON_LIGHT_BLUE = "#e6f0f7";
  const SESCON_ACCENT = "#0056b3";

  // Formatar CNPJ com máscara
  function formatarCNPJ(cnpj: string): string {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
    if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
  }

  // Validar CNPJ - Algoritmo correto
  function validarCNPJ(cnpj: string): boolean {
    const numeros = cnpj.replace(/\D/g, "");
    
    // Verifica se tem 14 dígitos
    if (numeros.length !== 14) return false;
    
    // Verifica se todos os dígitos são iguais (CNPJs inválidos)
    if (/^(\d)\1{13}$/.test(numeros)) return false;
    
    // Calcula o primeiro dígito verificador
    let tamanho = numeros.length - 2;
    let numeros_array = numeros.substring(0, tamanho);
    let digito = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_array.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    if (resultado !== parseInt(digito.charAt(0))) return false;
    
    // Calcula o segundo dígito verificador
    tamanho = tamanho + 1;
    numeros_array = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_array.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    
    resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
    return resultado === parseInt(digito.charAt(1));
  }

  // Verificar se é Matriz ou Filial
  function verificarMatrizFilial(cnpj: string): boolean {
    const numeros = cnpj.replace(/\D/g, "");
    return numeros.substring(8, 12) === "0001";
  }

  // Buscar CNPJ no BrasilAPI com tratamento de erro melhorado
  async function buscarCNPJEscritorio(cnpj: string) {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14 || !validarCNPJ(cnpj)) {
      setCnpjEscritorioValido(false);
      toast.error("CNPJ inválido", { duration: 2000 });
      return;
    }
    
    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.name || data.razao_social) {
        const nome = data.name || data.razao_social;
        setRazaoSocialEscritorio(nome);
        setCnpjEscritorioValido(true);
        toast.success("CNPJ validado com sucesso!", { duration: 2000 });
      } else if (data.message) {
        setCnpjEscritorioValido(false);
        toast.error("CNPJ não encontrado na Receita Federal", { duration: 2000 });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setCnpjEscritorioValido(false);
      toast.error("Erro ao buscar CNPJ. Verifique sua conexão.", { duration: 3000 });
    } finally {
      setBuscandoReceita(false);
    }
  }

  // Buscar CNPJ do cliente
  async function buscarCNPJCliente(cnpj: string) {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14 || !validarCNPJ(cnpj)) {
      setNovoCliente({ ...novoCliente, cnpjValido: false });
      return;
    }
    
    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.name || data.razao_social) {
        const nome = data.name || data.razao_social;
        setNovoCliente({ 
          ...novoCliente, 
          razaoSocial: nome, 
          cnpjValido: true, 
          ehMatriz: verificarMatrizFilial(cnpj) 
        });
        toast.success("Dados do cliente carregados!", { duration: 2000 });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      setNovoCliente({ ...novoCliente, cnpjValido: false });
    } finally {
      setBuscandoReceita(false);
    }
  }

  // Função para processar upload de CSV com progresso
function processarUploadCSV(file: File, callback: (clientes: Cliente[]) => void, onProgress?: (progresso: number, status: string) => void, emailEscritorio?: string) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const texto = e.target?.result as string;
    const linhas = texto.split("\n").filter(l => l.trim());
    const novosClientes: Cliente[] = [];
    
    for (let i = 1; i < linhas.length; i++) {
      const partes = linhas[i].split(",").map(p => p.trim());
      if (partes.length >= 2) {
        const cnpj = partes[0];
        const razaoSocial = partes[1];
        const email = partes[2] && partes[2].trim() ? partes[2] : "";
        
        novosClientes.push({
          id: Math.random().toString(),
          cnpj,
          razaoSocial,
          emailPrincipal: !email, // Se não tem email customizado, usa o da empresa
          emailCustomizado: email || emailEscritorio,
          cnpjValido: validarCNPJ(cnpj),
          ehMatriz: verificarMatrizFilial(cnpj)
        });
      }
      
      if (onProgress) {
        const progresso = Math.round((i / linhas.length) * 100);
        onProgress(progresso, `Processando ${i} de ${linhas.length} linhas...`);
      }
    }
    
    callback(novosClientes);
  };
  reader.readAsText(file);
}

// Função para processar upload de Excel com progresso
function processarUploadExcel(file: File, callback: (clientes: Cliente[]) => void, onProgress?: (progresso: number, status: string) => void, emailEscritorio?: string) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const dados = e.target?.result as string;
    // @ts-ignore
    const workbook = XLSX.read(dados, { type: 'binary' } as any);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet) as any[];
    
    const novosClientes: Cliente[] = [];
    
    for (let i = 0; i < json.length; i++) {
      const linha = json[i];
      const cnpj = String(linha.CNPJ || linha.cnpj || "").trim();
      const razaoSocial = String(linha["Razão Social"] || linha["razao_social"] || linha["Razao Social"] || "").trim();
      const email = String(linha["E-mail"] || linha["email"] || ["Email"] || ["E-MAIL"] "").trim();
      
      if (cnpj && razaoSocial) {
        novosClientes.push({
          id: Math.random().toString(),
          cnpj,
          razaoSocial,
          emailPrincipal: !email, // Se não tem email customizado, usa o da empresa
          emailCustomizado: email || emailEscritorio || "",
          cnpjValido: validarCNPJ(cnpj),
          ehMatriz: verificarMatrizFilial(cnpj)
        });
      }
      
      if (onProgress) {
        const progresso = Math.round(((i + 1) / json.length) * 100);
        onProgress(progresso, `Processando ${i + 1} de ${json.length} linhas...`);
      }
    }
    
    callback(novosClientes);
  };
  reader.readAsBinaryString(file);
}

  // Adicionar cliente
  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Por favor, preencha CNPJ e Razão Social", { duration: 3000 });
      return;
    }

    // Validar e-mail se customizado
    if (!novoCliente.emailPrincipal && !novoCliente.emailCustomizado) {
      toast.error("Por favor, preencha o e-mail customizado", { duration: 3000 });
      return;
    }

    if (!novoCliente.emailPrincipal && novoCliente.emailCustomizado) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(novoCliente.emailCustomizado)) {
        toast.error("E-mail customizado inválido", { duration: 3000 });
        return;
      }
    }

    const cliente: Cliente = {
      id: Math.random().toString(),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal,
      emailCustomizado: novoCliente.emailCustomizado,
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
      toast.error("Por favor, preencha os dados do escritório", { duration: 3000 });
      return;
    }
    if (clientes.length === 0) {
      toast.error("Por favor, adicione pelo menos um cliente", { duration: 3000 });
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Função auxiliar para converter arquivo em Base64
      const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      // Preparar clientes com arquivos convertidos para Base64
      const clientesComArquivos = await Promise.all(clientes.map(async (c) => {
        let arquivoBase64 = null;
        let nomeArquivo = null;
        let tipoArquivo = null;

        if (c.contratosocial) {
          try {
            arquivoBase64 = await fileToBase64(c.contratosocial);
            nomeArquivo = c.contratosocial.name;
            tipoArquivo = c.contratosocial.type;
          } catch (e) {
            console.error("Erro ao converter arquivo", e);
          }
        }

        return {
          ...c,
          contratosocial: c.contratosocial ? { name: c.contratosocial.name, size: c.contratosocial.size } : null,
          arquivoBase64, // Campo novo para envio ao Google Apps Script
          nomeArquivo,
          tipoArquivo
        };
      }));

      const dadosEnvio = {
        escritorio: {
          cnpj: cnpjEscritorio,
          razaoSocial: razaoSocialEscritorio,
          email: emailEscritorio
        },
        clientes: clientesComArquivos,
        dataEnvio: new Date().toISOString()
      };

      const blob = new Blob([JSON.stringify(dadosEnvio, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_sescon_${cnpjEscritorio.replace(/\D/g, "")}_${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Tentar enviar para o Google Sheets (se a URL estiver configurada)
      // Substitua a string vazia abaixo pela URL do seu Web App do Google Apps Script
      const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyBjgN0QA8k-4gvUrutLRkQAC93avC9PmKdLsA3Buy-Nm_6thfGKLL6jO5K-GZVVr_8xg/exec";
      
      if (GOOGLE_SHEETS_WEBHOOK_URL) {
        try {
          await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
            method: "POST",
            mode: "no-cors", // Necessário para evitar bloqueio de CORS do Google
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(dadosEnvio),
          });
          console.log("Dados enviados para o Google Sheets");
        } catch (sheetError) {
          console.error("Erro ao enviar para o Google Sheets:", sheetError);
          // Não interrompemos o fluxo principal se o Sheets falhar, pois o backup local já foi salvo
        }
      }

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
      
      // Limpar rascunho específico do CNPJ
      const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
      if (cnpjLimpo) {
        localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
      }
      
      setTemRascunho(false);
      toast.success("Dados enviados! Um backup foi salvo no seu computador.", { duration: 4000 });
    } catch (error) {
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

  const clientesFiltrados = clientes.filter(c =>
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
                                  setStatusUpload("");
                                  toast.success("Arquivo importado com sucesso!", { duration: 3000 });
                                }, (progresso, status) => {
                                  setProgressoUpload(progresso);
                                  setStatusUpload(status);
                                }, emailEscritorio);
                              } else {
                                processarUploadExcel(file, (novosClientes) => {
                                  setClientes([...clientes, ...novosClientes]);
                                  setProgressoUpload(0);
                                  setStatusUpload("");
                                  toast.success("Arquivo importado com sucesso!", { duration: 3000 });
                                }, (progresso, status) => {
                                  setProgressoUpload(progresso);
                                  setStatusUpload(status);
                                }, emailEscritorio);
                              }
                            }
                          }}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          className="w-full rounded-lg font-bold py-6 text-white shadow-md hover:shadow-lg transition-all h-auto flex flex-col gap-2"
                          style={{ background: SESCON_BLUE }}
                          onClick={(e) => {
                            const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                            input.click();
                          }}
                        >
                          <Upload className="w-6 h-6" />
                          <span>Selecionar Arquivo</span>
                        </Button>
                      </label>
                    </div>
                  </div>

                  {progressoUpload > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600">{statusUpload}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${progressoUpload}%`, background: SESCON_BLUE }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Lista de Clientes */}
                  <div>
                    <p className="text-sm font-semibold mb-4" style={{ color: SESCON_DARK_BLUE }}>
                      Clientes Adicionados ({clientes.length})
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {clientes.length > 0 ? (
                        clientes.map((cliente) => (
                          <div key={cliente.id} className="p-3 rounded-lg border flex justify-between items-start" style={{ borderColor: SESCON_LIGHT_BLUE, background: SESCON_LIGHT_BLUE }}>
                            <div className="flex-1">
                              <p className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{cliente.razaoSocial}</p>
                              <p className="text-xs text-gray-600">{cliente.cnpj}</p>
                            </div>
                            <Button
                              onClick={() => removerCliente(cliente.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-center text-gray-500 text-sm py-8">Nenhum cliente adicionado ainda</p>
                      )}
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
                        style={{ background: SESCON_ACCENT }} // Cor de destaque para ação secundária
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Rascunho
                      </Button>
                      <Button
                        onClick={() => setMostrarModalClientes(true)}
                        disabled={clientes.length === 0}
                        className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                        style={{ background: SESCON_ACCENT }} // Cor de destaque para ação secundária
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Visualizar Clientes
                      </Button>
                    </div>
                    <Button
                      onClick={enviarDados}
                      disabled={isLoading || clientes.length === 0}
                      className="flex-1 rounded-lg font-bold py-3 text-white text-lg hover:bg-green-700 transition-colors" // Botão mais robusto e cor de sucesso
                      style={{ background: "#4CAF50" }} // Verde de sucesso para Enviar
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

            {/* Direita: Logo */}
            <div className="hidden md:flex justify-end">
              <img src="/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto" />
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

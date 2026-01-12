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

// Cores SESCON
const SESCON_BLUE = "#003b61";
const SESCON_DARK_BLUE = "#002a45";
const SESCON_LIGHT_BLUE = "#eef6fb";
const SESCON_ACCENT = "#005a8d";

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
  const [atividadePrincipal, setAtividadePrincipal] = useState("");
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [mostrarResumo, setMostrarResumo] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [mostrarConfirmacaoSair, setMostrarConfirmacaoSair] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

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

  // Funções de utilidade
  const formatarCNPJ = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 14) {
      v = v.replace(/^(\d{2})(\d)/, "$1.$2");
      v = v.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
      v = v.replace(/\.(\d{3})(\d)/, ".$1/$2");
      v = v.replace(/(\d{4})(\d)/, "$1-$2");
    }
    return v;
  };

  const validarCNPJ = (cnpj: string) => {
    cnpj = cnpj.replace(/[^\d]+/g, "");
    if (cnpj === "" || cnpj.length !== 14) return false;
    if (/^(\d)\1+$/.test(cnpj)) return false;
    let tamanho = cnpj.length - 2;
    let numeros = cnpj.substring(0, tamanho);
    let digitos = cnpj.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;
    tamanho = tamanho + 1;
    numeros = cnpj.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;
    return true;
  };

  const buscarCNPJEscritorio = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;
    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
      if (response.ok) {
        const data = await response.json();
        setRazaoSocialEscritorio(data.razao_social);
        setCnpjEscritorioValido(true);
        toast.success("Dados do escritório carregados!");
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ", error);
    } finally {
      setBuscandoReceita(false);
    }
  };

  const buscarCNPJCliente = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
      if (response.ok) {
        const data = await response.json();
        setNovoCliente({
          ...novoCliente,
          razaoSocial: data.razao_social,
          cnpjValido: true,
          ehMatriz: data.estabelecimento.tipo === "Matriz"
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ do cliente", error);
    }
  };

  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha o CNPJ e a Razão Social");
      return;
    }
    const cliente: Cliente = {
      id: Math.random().toString(),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal,
      emailCustomizado: novoCliente.emailPrincipal ? emailEscritorio : novoCliente.emailCustomizado,
      contratosocial: novoCliente.contratosocial,
      cnpjValido: novoCliente.cnpjValido,
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
    toast.success("Cliente adicionado!");
  };

  const removerCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
    toast.info("Cliente removido");
  };

  const processarUploadExcel = (file: File, callback: (clientes: Cliente[]) => void, progressCallback: (p: number, s: string) => void, emailPadrao: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet);
      
      const novosClientes: Cliente[] = json.map((row: any) => ({
        id: Math.random().toString(),
        cnpj: String(row["CNPJ"] || row["cnpj"] || ""),
        razaoSocial: String(row["Razão Social"] || row["RazÃ£o Social"] || row["razao_social"] || row["Nome"] || ""),
        emailPrincipal: true,
        emailCustomizado: String(row["E-mail"] || row["Email"] || row["email"] || row["E-MAIL"] || emailPadrao),
        cnpjValido: true
      }));
      callback(novosClientes);
    };
    reader.readAsBinaryString(file);
  };

  const processarUploadCSV = (file: File, callback: (clientes: Cliente[]) => void, progressCallback: (p: number, s: string) => void, emailPadrao: string) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const novosClientes: Cliente[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(',');
        novosClientes.push({
          id: Math.random().toString(),
          cnpj: cols[0]?.trim() || "",
          razaoSocial: cols[1]?.trim() || "",
          emailPrincipal: true,
          emailCustomizado: cols[2]?.trim() || emailPadrao,
          cnpjValido: true
        });
      }
      callback(novosClientes);
    };
    reader.readAsText(file);
  };

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
      // Converte arquivos para Base64
      const clientesComArquivos = await Promise.all(clientes.map(async (c) => {
        let arquivoData = null;
        if (c.contratosocial) {
          const base64 = await fileToBase64(c.contratosocial);
          arquivoData = {
            data: base64,
            name: c.contratosocial.name,
            type: c.contratosocial.type
          };
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

      const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyBjgN0QA8k-4gvUrutLRkQAC93avC9PmKdLsA3Buy-Nm_6thfGKLL6jO5K-GZVVr_8xg/exec";
      
      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosEnvio),
      });

      toast.success("Dados enviados com sucesso!", { duration: 4000 });
      setClientes([]);
      setCnpjEscritorio("");
      setRazaoSocialEscritorio("");
      setEmailEscritorio("");
      setAbaSelecionada(1);
      setShowSuccess(true);
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
        if (!razaoSocialEscritorio && clientes.length === 0) {
          try {
            const dados = JSON.parse(rascunhoSalvo) as Rascunho;
            setRazaoSocialEscritorio(dados.nomeEscritorio || "");
            setEmailEscritorio(dados.emailEscritorio || "");
            setClientes(dados.clientes.map(c => ({ ...c, id: Math.random().toString() })) || []);
            setTemRascunho(true);
            toast.info("Rascunho encontrado e carregado para este CNPJ", { duration: 4000 });
          } catch (e) {
            console.error("Erro ao carregar rascunho", e);
          }
        }
      }
    }
  }, [cnpjEscritorio]);

  const limparRascunho = () => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo) {
      localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
      setTemRascunho(false);
      toast.success("Rascunho deste CNPJ excluído", { duration: 2000 });
      setMostrarConfirmacaoLimpar(false);
    }
  };

  const gerarModeloCSV = () => {
    const csv = "CNPJ,Razão Social,E-mail\n00.000.000/0000-00,Empresa Exemplo,email@exemplo.com";
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = "modelo_clientes.csv";
    link.click();
    document.body.removeChild(link);
  };

  const clientesFiltrados = clientes.filter(c =>
    c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    c.cnpj.includes(busca)
  );

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="text-center max-w-md w-full">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="w-20 h-20 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Envio Concluído!</CardTitle>
            <CardDescription>As informações foram enviadas com sucesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" style={{ background: SESCON_BLUE }} onClick={() => setShowSuccess(false)}>Realizar Novo Envio</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f7fa" }}>
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

      {/* Main Content */}
      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-4 gap-8 h-full">
          {/* Left Sidebar */}
          <div className="col-span-1 space-y-6">
            <div className="rounded-lg p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${SESCON_BLUE} 0%, ${SESCON_DARK_BLUE} 100%)` }}>
              <h3 className="text-lg font-bold mb-6 pb-4 border-b border-white border-opacity-30">Como Funciona</h3>
              <div className="space-y-4">
                {[{ num: 1, text: "Preencha os dados do seu escritório" }, { num: 2, text: "Importe ou adicione todos os seus clientes" }, { num: 3, text: "Revise as informações" }, { num: 4, text: "Envie para processamento" }].map(step => (
                  <div key={step.num} className="flex gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm" style={{ color: SESCON_DARK_BLUE }}>{step.num}</div>
                    <p className="text-sm leading-relaxed">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg p-6 border-l-4 shadow-sm" style={{ background: "#eef6fb", borderColor: SESCON_DARK_BLUE, borderWidth: '0 0 0 6px' }}>
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 text-yellow-500 fill-yellow-500" />
                <p className="text-lg font-bold" style={{ color: SESCON_DARK_BLUE }}>Importante</p>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: SESCON_DARK_BLUE }}>A base anterior será excluída. Apenas os clientes que você enviar serão mantidos.</p>
            </div>
          </div>

          {/* Right Content */}
          <div className="col-span-3 space-y-6">
            {/* Barra de Progresso */}
            <div className="bg-white rounded-lg p-4 shadow-sm border mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>Progresso do Cadastro</span>
                <span className="text-sm font-bold" style={{ color: SESCON_BLUE }}>{abaSelecionada === 1 ? "50%" : "90%"}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: abaSelecionada === 1 ? "50%" : "90%", background: SESCON_BLUE }}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {abaSelecionada === 1 ? "Passo 1 de 2: Identificação do Escritório" : "Passo 2 de 2: Gestão de Clientes e Envio"}
              </p>
            </div>

            {/* Abas */}
            <div className="flex gap-6 border-b-2 mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <button onClick={() => setAbaSelecionada(1)} className={`pb-4 px-2 font-bold transition-all ${abaSelecionada === 1 ? "border-b-4" : "text-gray-400"}`} style={{ borderColor: abaSelecionada === 1 ? SESCON_BLUE : "transparent", color: abaSelecionada === 1 ? SESCON_BLUE : "" }}>1. Identificação</button>
              <button onClick={() => setAbaSelecionada(2)} className={`pb-4 px-2 font-bold transition-all ${abaSelecionada === 2 ? "border-b-4" : "text-gray-400"}`} style={{ borderColor: abaSelecionada === 2 ? SESCON_BLUE : "transparent", color: abaSelecionada === 2 ? SESCON_BLUE : "" }}>2. Clientes</button>
            </div>

            <AnimatePresence mode="wait">
              {abaSelecionada === 1 ? (
                <motion.div key="aba1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-lg p-8 shadow-sm border" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Dados do Escritório</h2>
                  <div className="space-y-6 max-w-2xl">
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>CNPJ do Escritório *</label>
                      <div className="flex gap-3 items-center">
                        <Input type="text" placeholder="00.000.000/0000-00" value={cnpjEscritorio} onChange={(e) => setCnpjEscritorio(formatarCNPJ(e.target.value))} onBlur={() => buscarCNPJEscritorio(cnpjEscritorio)} maxLength={18} className="flex-1 rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                        {buscandoReceita && <Loader2 className="w-5 h-5 animate-spin" style={{ color: SESCON_BLUE }} />}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>Nome do Escritório *</label>
                      <Input type="text" value={razaoSocialEscritorio} onChange={(e) => setRazaoSocialEscritorio(e.target.value)} className="rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>E-mail para Contato *</label>
                      <Input type="email" value={emailEscritorio} onChange={(e) => setEmailEscritorio(e.target.value)} className="rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                    </div>
                    <Button onClick={() => setAbaSelecionada(2)} className="w-full rounded-lg font-bold py-3 text-white" style={{ background: SESCON_BLUE }}>Próximo</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="aba2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-lg p-8 shadow-sm border" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Gestão de Clientes</h2>
                  <div className="space-y-6">
                    <div className="p-6 rounded-lg border bg-blue-50/30" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                      <label className="block text-sm font-semibold mb-3" style={{ color: SESCON_DARK_BLUE }}>Atividade Principal *</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="atividade" value="contabilidade" checked={atividadePrincipal === "contabilidade"} onChange={(e) => setAtividadePrincipal(e.target.value)} /><span>Contabilidade</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="atividade" value="outros" checked={atividadePrincipal === "outros"} onChange={(e) => setAtividadePrincipal(e.target.value)} /><span>Outros</span></label>
                      </div>
                    </div>

                    {atividadePrincipal === "contabilidade" && (
                      <>
                        <div className="p-8 rounded-xl border-2 border-dashed bg-blue-50/30 text-center" style={{ borderColor: SESCON_BLUE }}>
                          <Upload className="w-8 h-8 mx-auto mb-4" style={{ color: SESCON_BLUE }} />
                          <h3 className="text-xl font-bold mb-2">Importar Lista</h3>
                          <div className="flex gap-4 justify-center mt-6">
                            <Button onClick={gerarModeloCSV} variant="outline" style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}>Baixar Modelo</Button>
                            <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg font-bold" style={{ background: SESCON_BLUE }}>
                              Selecionar Arquivo
                              <input type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.name.endsWith('.csv')) processarUploadCSV(file, setClientes, () => {}, emailEscritorio);
                                  else processarUploadExcel(file, setClientes, () => {}, emailEscritorio);
                                }
                              }} />
                            </label>
                          </div>
                        </div>

                        {/* Lista de Clientes Adicionados */}
                        <div>
                          <p className="text-sm font-semibold mb-4" style={{ color: SESCON_DARK_BLUE }}>Clientes Adicionados ({clientes.length})</p>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {clientes.length > 0 ? (
                              clientes.map((cliente) => (
                                <div key={cliente.id} className="p-3 rounded-lg border flex justify-between items-start" style={{ borderColor: SESCON_LIGHT_BLUE, background: SESCON_LIGHT_BLUE }}>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{cliente.razaoSocial}</p>
                                    <p className="text-xs text-gray-600">{cliente.cnpj}</p>
                                  </div>
                                  <Button onClick={() => removerCliente(cliente.id)} variant="ghost" size="sm" className="text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></Button>
                                </div>
                              ))
                            ) : (
                              <p className="text-center text-gray-500 text-sm py-8">Nenhum cliente adicionado ainda</p>
                            )}
                          </div>
                        </div>

                        {/* Adicionar Manualmente */}
                        <div className="p-6 rounded-lg border-2" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                          <p className="text-sm font-semibold mb-4" style={{ color: SESCON_DARK_BLUE }}>Adicionar Cliente Manualmente</p>
                          <div className="space-y-3">
                            <Input placeholder="CNPJ" value={novoCliente.cnpj} onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: formatarCNPJ(e.target.value) })} onBlur={() => buscarCNPJCliente(novoCliente.cnpj)} maxLength={18} className="rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                            <Input placeholder="Razão Social" value={novoCliente.razaoSocial} onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })} className="rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                            
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>E-mail do Cliente</label>
                              <div className="flex gap-2">
                                <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer" style={{ borderColor: novoCliente.emailPrincipal ? SESCON_BLUE : "#ddd", background: novoCliente.emailPrincipal ? SESCON_LIGHT_BLUE : "white" }}>
                                  <input type="radio" checked={novoCliente.emailPrincipal} onChange={() => setNovoCliente({ ...novoCliente, emailPrincipal: true, emailCustomizado: "" })} className="w-4 h-4" />
                                  <span className="text-sm" style={{ color: SESCON_DARK_BLUE }}>Usar e-mail da empresa</span>
                                </label>
                                <label className="flex items-center gap-2 flex-1 p-3 rounded-lg border-2 cursor-pointer" style={{ borderColor: !novoCliente.emailPrincipal ? SESCON_BLUE : "#ddd", background: !novoCliente.emailPrincipal ? SESCON_LIGHT_BLUE : "white" }}>
                                  <input type="radio" checked={!novoCliente.emailPrincipal} onChange={() => setNovoCliente({ ...novoCliente, emailPrincipal: false })} className="w-4 h-4" />
                                  <span className="text-sm" style={{ color: SESCON_DARK_BLUE }}>E-mail customizado</span>
                                </label>
                              </div>
                              {!novoCliente.emailPrincipal && (
                                <Input type="email" placeholder="email@cliente.com.br" value={novoCliente.emailCustomizado} onChange={(e) => setNovoCliente({ ...novoCliente, emailCustomizado: e.target.value })} className="rounded-lg border-2 px-4 py-2" style={{ borderColor: SESCON_BLUE }} />
                              )}
                            </div>

                            <div className="space-y-2">
                              <label className="block text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>Contrato Social (Opcional)</label>
                              <div className="flex items-center gap-3">
                                <input type="file" accept=".pdf" onChange={(e) => setNovoCliente({ ...novoCliente, contratosocial: e.target.files?.[0] })} className="hidden" id="contrato-social-input" />
                                <label htmlFor="contrato-social-input" className="flex-1 cursor-pointer">
                                  <div className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed hover:bg-gray-50 transition-colors" style={{ borderColor: SESCON_BLUE }}>
                                    <FileText className="w-4 h-4" style={{ color: SESCON_BLUE }} />
                                    <span className="text-sm" style={{ color: SESCON_BLUE }}>{novoCliente.contratosocial ? novoCliente.contratosocial.name : 'Selecionar PDF'}</span>
                                  </div>
                                </label>
                              </div>
                            </div>

                            <Button onClick={adicionarCliente} className="w-full rounded-lg font-semibold py-2 text-white" style={{ background: SESCON_BLUE }}>
                              <Plus className="w-4 h-4 mr-2" /> Adicionar Cliente
                            </Button>
                          </div>
                        </div>

                        {/* Ações Finais */}
                        <div className="flex flex-col gap-3 pt-4">
                          <div className="flex gap-3">
                            <Button onClick={() => setAbaSelecionada(1)} variant="outline" className="flex-1 rounded-lg border-2 font-semibold py-2" style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}>Voltar</Button>
                            <Button onClick={salvarRascunho} className="flex-1 rounded-lg font-semibold py-2 text-white" style={{ background: SESCON_ACCENT }}><Save className="w-4 h-4 mr-2" /> Salvar Rascunho</Button>
                            <Button onClick={() => setMostrarModalClientes(true)} disabled={clientes.length === 0} className="flex-1 rounded-lg font-semibold py-2 text-white" style={{ background: SESCON_ACCENT }}><Eye className="w-4 h-4 mr-2" /> Visualizar Clientes</Button>
                          </div>
                          <Button onClick={enviarDados} disabled={isLoading || clientes.length === 0} className="flex-1 rounded-lg font-bold py-3 text-white text-lg" style={{ background: "#4CAF50" }}>
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

      {/* Modal de Visualização */}
      {mostrarModalClientes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold" style={{ color: SESCON_DARK_BLUE }}>Visualizar Clientes</h3>
                <button onClick={() => setMostrarModalClientes(false)} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">✕</button>
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
                  </div>
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <Button onClick={() => setMostrarModalClientes(false)} variant="outline" className="flex-1 rounded-lg border-2 font-semibold py-2" style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}>Voltar</Button>
              <Button onClick={() => { setMostrarModalClientes(false); enviarDados(); }} disabled={isLoading} className="flex-1 rounded-lg font-semibold py-2 text-white" style={{ background: SESCON_BLUE }}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                {isLoading ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Corporativo */}
      <footer className="pt-8 pb-6 px-8" style={{ background: "#003366" }}>
        <div className="max-w-6xl mx-auto text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-6 border-b border-white border-opacity-30">
            <div className="flex flex-col items-start space-y-3 mb-6 md:mb-0">
              <p className="text-sm font-semibold">Siga o Sescon-SP:</p>
              <div className="flex items-center gap-4">
                <Instagram className="w-6 h-6 cursor-pointer hover:text-pink-300" />
                <Facebook className="w-6 h-6 cursor-pointer hover:text-blue-300" />
                <Youtube className="w-6 h-6 cursor-pointer hover:text-red-300" />
                <Linkedin className="w-6 h-6 cursor-pointer hover:text-blue-300" />
                <MessageCircle className="w-6 h-6 cursor-pointer hover:text-green-300" />
              </div>
            </div>
            <div className="flex flex-col items-center space-y-2 mb-6 md:mb-0 flex-1 md:px-8 text-center">
              <p className="text-sm font-bold">SESCON-SP | CNPJ 62.638.168/0001-84</p>
              <p className="text-xs">Av. Tiradentes, 998 - Luz | São Paulo-SP - 01102-000</p>
              <p className="text-xs font-bold mt-2">SESCON-SP 2025 | Sindicato das Empresas de Serviços Contábeis</p>
            </div>
            <div className="hidden md:flex justify-end">
              <img src="/pacc-sescon-improved/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto" />
            </div>
          </div>
          <div className="space-y-4">
            <p className="text-xs leading-relaxed opacity-90">
              © O Sescon-SP e a Aescon-SP informam que, em respeito aos preceitos elencados no art. 6º da LGPD...
            </p>
            <p className="text-xs font-semibold">SESCON-SP Todos os Direitos Reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

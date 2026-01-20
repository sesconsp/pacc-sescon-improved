import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, Mail, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Loader2, Search, Save, RotateCcw, Eye, Clock, CheckCircle2, AlertTriangle, Send, FileDown, Download as DownloadIcon, Trash, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Building, Users, DollarSign, Phone } from "lucide-react";
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
  faturamento?: string;
  funcionarios?: string;
  emailEmpresa?: string;
  telefoneEmpresa?: string;
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
    pergunta: "Quais são as categorias econômicas representadas pelo SESCON-SP?",
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

export default function Home() {
  const [abaSelecionada, setAbaSelecionada] = useState(1);
  const [cnpjEscritorio, setCnpjEscritorio] = useState("");
  const [razaoSocialEscritorio, setRazaoSocialEscritorio] = useState("");
  const [emailEscritorio, setEmailEscritorio] = useState("");
  const [atividadePrincipal, setAtividadePrincipal] = useState("contabilidade");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({
    cnpj: "",
    razaoSocial: "",
    emailPrincipal: true,
    emailCustomizado: "",
    faturamento: "",
    funcionarios: "",
    emailEmpresa: "",
    telefoneEmpresa: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progressoEnvio, setProgressoEnvio] = useState(0);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [buscaCarregando, setBuscaCarregando] = useState(false);
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [cnpjEscritorioValido, setCnpjEscritorioValido] = useState(false);
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);
  const [temRascunho, setTemRascunho] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Máscaras
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

  const formatarMoeda = (v: string) => {
    v = v.replace(/\D/g, "");
    v = (Number(v) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    return v;
  };

  const formatarTelefone = (v: string) => {
    v = v.replace(/\D/g, "");
    if (v.length <= 11) {
      v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
      v = v.replace(/(\d)(\d{4})$/, "$1-$2");
    }
    return v;
  };

  // Buscar CNPJ na Receita Federal (BrasilAPI)
  const buscarCNPJ = async (cnpj: string, isCliente = false) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length !== 14) return;

    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
      if (response.ok) {
        const data = await response.json();
        if (isCliente) {
          setNovoCliente(prev => ({ ...prev, razaoSocial: data.razao_social }));
          toast.success("Cliente localizado!");
        } else {
          setRazaoSocialEscritorio(data.razao_social);
          setCnpjEscritorioValido(true);
          toast.success("Escritório localizado!");
          verificarRascunho(cnpjLimpo);
        }
      } else {
        if (!isCliente) setCnpjEscritorioValido(false);
        toast.error("CNPJ não localizado na Receita Federal");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a Receita Federal");
    } finally {
      setBuscandoReceita(false);
    }
  };

  // Lógica de Rascunho
  const verificarRascunho = (cnpj: string) => {
    const rascunho = localStorage.getItem(`rascunho_${cnpj}`);
    if (rascunho) {
      setTemRascunho(true);
      toast.info("Rascunho encontrado para este CNPJ!", {
        action: {
          label: "Carregar",
          onClick: () => carregarRascunho(cnpj)
        },
        duration: 5000
      });
    }
  };

  const carregarRascunho = (cnpj: string) => {
    const rascunhoStr = localStorage.getItem(`rascunho_${cnpj}`);
    if (rascunhoStr) {
      const rascunho: Rascunho = JSON.parse(rascunhoStr);
      setRazaoSocialEscritorio(rascunho.nomeEscritorio);
      setEmailEscritorio(rascunho.emailEscritorio);
      setClientes(rascunho.clientes as Cliente[]);
      toast.success("Rascunho carregado com sucesso!");
    }
  };

  const salvarRascunho = () => {
    if (!cnpjEscritorioValido) {
      toast.error("Valide o CNPJ do escritório primeiro");
      return;
    }
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    const rascunho: Rascunho = {
      nomeEscritorio: razaoSocialEscritorio,
      cnpjEscritorio: cnpjEscritorio,
      emailEscritorio: emailEscritorio,
      clientes: clientes.map(({ contratosocial, ...rest }) => rest),
      dataSalva: new Date().toISOString()
    };
    localStorage.setItem(`rascunho_${cnpjLimpo}`, JSON.stringify(rascunho));
    setTemRascunho(true);
    toast.success("Rascunho salvo com sucesso!");
  };

  const limparRascunho = () => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    localStorage.removeItem(`rascunho_${cnpjLimpo}`);
    setTemRascunho(false);
    toast.success("Rascunho excluído");
  };

  const resetForm = () => {
    setCnpjEscritorio("");
    setRazaoSocialEscritorio("");
    setEmailEscritorio("");
    setAtividadePrincipal("contabilidade");
    setClientes([]);
    setAbaSelecionada(1);
    setProgressoEnvio(0);
    setShowSuccessDialog(false);
    setCnpjEscritorioValido(false);
    setTemRascunho(false);
  };

  const enviarDados = async () => {
    setIsLoading(true);
    setProgressoEnvio(10);
    
    try {
      const dadosEnvio = {
        escritorioCnpj: cnpjEscritorio,
        escritorioRazao: razaoSocialEscritorio,
        escritorioEmail: emailEscritorio,
        atividadePrincipal: atividadePrincipal,
        clientes: clientes.map(c => ({
          cnpj: c.cnpj,
          razaoSocial: c.razaoSocial,
          email: c.emailPrincipal ? emailEscritorio : c.emailCustomizado,
          faturamento: c.faturamento,
          funcionarios: c.funcionarios,
          emailEmpresa: c.emailEmpresa,
          telefoneEmpresa: c.telefoneEmpresa
        })),
        dataEnvio: new Date().toISOString()
      };

      setProgressoEnvio(40);

      const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxR2MCXtsKqCO3cXC6NgAkntgt6E2N5eTFEAqbyw7YW9Q2lATMGOE1L-NI916Ofduio/exec";
      
      setProgressoEnvio(70);

      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dadosEnvio),
      });

      setProgressoEnvio(100);
      setShowSuccessDialog(true);
      
      const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
      localStorage.removeItem(`rascunho_${cnpjLimpo}`);
    } catch (error) {
      toast.error("Erro ao enviar dados. Tente novamente.");
      setProgressoEnvio(0);
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha o CNPJ e a Razão Social do cliente");
      return;
    }
    const cliente: Cliente = {
      id: Math.random().toString(36).substr(2, 9),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal || false,
      emailCustomizado: novoCliente.emailPrincipal ? emailEscritorio : novoCliente.emailCustomizado,
      faturamento: novoCliente.faturamento,
      funcionarios: novoCliente.funcionarios,
      emailEmpresa: novoCliente.emailEmpresa,
      telefoneEmpresa: novoCliente.telefoneEmpresa,
      contratosocial: novoCliente.contratosocial,
      cnpjValido: true
    };
    setClientes([...clientes, cliente]);
    setNovoCliente({ cnpj: "", razaoSocial: "", emailPrincipal: true, emailCustomizado: "", faturamento: "", funcionarios: "", emailEmpresa: "", telefoneEmpresa: "" });
    toast.success("Cliente adicionado à lista!");
  };

  const removerCliente = (id: string) => {
    setClientes(clientes.filter(c => c.id !== id));
    toast.info("Cliente removido");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const novosClientes: Cliente[] = data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          cnpj: formatarCNPJ(String(row.CNPJ || row.cnpj || "")),
          razaoSocial: String(row.RazaoSocial || row.razaoSocial || row.Nome || ""),
          emailPrincipal: !row.Email,
          emailCustomizado: row.Email || emailEscritorio,
          faturamento: String(row.Faturamento || row.faturamento || ""),
          funcionarios: String(row.Funcionarios || row.funcionarios || ""),
          emailEmpresa: String(row.EmailEmpresa || row.emailEmpresa || ""),
          telefoneEmpresa: formatarTelefone(String(row.Telefone || row.telefone || "")),
          cnpjValido: true
        })).filter(c => c.cnpj && c.razaoSocial);

        setClientes([...clientes, ...novosClientes]);
        toast.success(`${novosClientes.length} clientes importados com sucesso!`);
      } catch (err) {
        toast.error("Erro ao processar planilha. Verifique o formato.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const baixarModelo = () => {
    const headers = ["CNPJ", "RazaoSocial", "Email", "Faturamento", "Funcionarios", "EmailEmpresa", "Telefone"];
    const csv = headers.join(",") + "\n00.000.000/0000-00,Exemplo Empresa LTDA,email@contabilidade.com,R$ 1.000.000,00,10,contato@empresa.com,(11) 99999-9999";
    const link = document.createElement("a");
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = "modelo_clientes.csv";
    link.click();
    document.body.removeChild(link);
  };

  const baixarExcelClientes = () => {
    if (clientes.length === 0) {
      toast.error("Adicione clientes antes de baixar o Excel");
      return;
    }
    const data = clientes.map(c => ({
      CNPJ: c.cnpj,
      RazaoSocial: c.razaoSocial,
      Email: c.emailPrincipal ? emailEscritorio : c.emailCustomizado,
      Faturamento: c.faturamento,
      Funcionarios: c.funcionarios,
      EmailEmpresa: c.emailEmpresa,
      Telefone: c.telefoneEmpresa
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meus Clientes");
    XLSX.writeFile(wb, "meus_clientes.xlsx");
    toast.success("Excel gerado com sucesso!");
  };

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

  useEffect(() => {
    if (atividadePrincipal === "outros") {
      window.location.href = "https://sesconsp.github.io/atualizacao-cadastral/";
    }
  }, [atividadePrincipal]);

  const podeAvancarAba1 = cnpjEscritorioValido && razaoSocialEscritorio && emailEscritorio.includes("@");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#f8fafc" }}>
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-50 rounded-full blur-3xl -z-10 opacity-50 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-50 rounded-full blur-3xl -z-10 opacity-30 -translate-x-1/4 translate-y-1/4"></div>
      <div className="absolute top-1/2 left-1/2 w-full h-full bg-white/40 -z-20 -translate-x-1/2 -translate-y-1/2"></div>

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

      <main className="flex-1 px-8 py-8">
        <div className="grid grid-cols-4 gap-8 h-full">
          <div className="col-span-1 space-y-6">
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

            {/* CAIXA DE VISUALIZAR CLIENTES - SEMPRE VISÍVEL */}
            <div className="rounded-lg p-6 border-2 shadow-sm bg-white" style={{ borderColor: SESCON_BLUE }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold" style={{ color: SESCON_DARK_BLUE }}>Visualizar Clientes</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded-full">{clientes.length}</span>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 mb-4">
                {clientes.length === 0 ? (
                  <p className="text-xs text-gray-500 italic">Nenhum cliente adicionado ainda.</p>
                ) : (
                  clientes.slice(0, 5).map((c, i) => (
                    <div key={c.id} className="text-xs p-2 rounded bg-gray-50 border border-gray-100 truncate">
                      {i+1}. {c.razaoSocial}
                    </div>
                  ))
                )}
                {clientes.length > 5 && <p className="text-[10px] text-center text-gray-400">... e mais {clientes.length - 5} clientes</p>}
              </div>
              <Button
                onClick={() => setMostrarModalClientes(true)}
                disabled={clientes.length === 0}
                className="w-full rounded-lg font-semibold py-2 text-white text-xs"
                style={{ background: SESCON_ACCENT }}
              >
                <Eye className="w-3 h-3 mr-2" />
                Abrir Lista Completa
              </Button>
            </div>
          </div>

          <div className="col-span-3 space-y-6">
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
                            <span className="font-bold text-sm" style={{ color: SESCON_DARK_BLUE }}>{faq.pergunta}</span>
                            {faqAberto === idx ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                          <AnimatePresence>
                            {faqAberto === idx && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="bg-white px-6 pb-4"
                              >
                                <div 
                                  className="p-4 rounded-lg border text-sm leading-relaxed text-gray-600"
                                  style={{ borderColor: SESCON_LIGHT_BLUE, background: "#fcfdfe" }}
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
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Gestão de Clientes</h2>
                  
                  <div className="space-y-8">
                    <div className="p-6 rounded-xl border-2" style={{ borderColor: SESCON_LIGHT_BLUE, background: "#fcfdfe" }}>
                      <label className="text-sm font-bold mb-4 block" style={{ color: SESCON_DARK_BLUE }}>Atividade Principal *</label>
                      <div className="flex gap-8">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="atividade"
                            value="contabilidade"
                            checked={atividadePrincipal === "contabilidade"}
                            onChange={(e) => setAtividadePrincipal(e.target.value)}
                            className="w-5 h-5"
                            style={{ accentColor: SESCON_BLUE }}
                          />
                          <span className="text-sm font-semibold group-hover:text-blue-700 transition-colors">Contabilidade</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="radio"
                            name="atividade"
                            value="outros"
                            checked={atividadePrincipal === "outros"}
                            onChange={(e) => setAtividadePrincipal(e.target.value)}
                            className="w-5 h-5"
                            style={{ accentColor: SESCON_BLUE }}
                          />
                          <span className="text-sm font-semibold group-hover:text-blue-700 transition-colors">Outros</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: SESCON_DARK_BLUE }}>
                          <Upload className="w-5 h-5" />
                          Importar Planilha (.xlsx, .csv)
                        </h3>
                        <div 
                          className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-blue-50 transition-all cursor-pointer relative group"
                          style={{ borderColor: SESCON_BLUE }}
                        >
                          <input
                            type="file"
                            accept=".xlsx, .xls, .csv"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                          <div className="space-y-2">
                            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                              <FileDown className="w-6 h-6" style={{ color: SESCON_BLUE }} />
                            </div>
                            <p className="text-sm font-bold" style={{ color: SESCON_BLUE }}>Clique ou arraste sua planilha aqui</p>
                            <p className="text-xs text-gray-500">Formatos aceitos: .xlsx, .xls, .csv</p>
                          </div>
                        </div>
                        <Button
                          onClick={baixarModelo}
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs font-bold hover:bg-blue-50"
                          style={{ color: SESCON_BLUE }}
                        >
                          <DownloadIcon className="w-3 h-3 mr-1" />
                          Baixar Planilha Modelo
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: SESCON_DARK_BLUE }}>
                          <Plus className="w-5 h-5" />
                          Adicionar Cliente
                        </h3>
                        <div className="space-y-3">
                          <Input
                            placeholder="CNPJ do Cliente"
                            value={novoCliente.cnpj}
                            onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: formatarCNPJ(e.target.value) })}
                            onBlur={() => buscarCNPJ(novoCliente.cnpj || "", true)}
                            className="rounded-lg border-2"
                            style={{ borderColor: SESCON_BLUE }}
                          />
                          <Input
                            placeholder="Razão Social"
                            value={novoCliente.razaoSocial}
                            onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })}
                            className="rounded-lg border-2"
                            style={{ borderColor: SESCON_BLUE }}
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Faturamento Anual"
                                value={novoCliente.faturamento}
                                onChange={(e) => setNovoCliente({ ...novoCliente, faturamento: formatarMoeda(e.target.value) })}
                                className="rounded-lg border-2 pl-9"
                                style={{ borderColor: SESCON_BLUE }}
                              />
                            </div>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Nº Funcionários"
                                value={novoCliente.funcionarios}
                                onChange={(e) => setNovoCliente({ ...novoCliente, funcionarios: e.target.value.replace(/\D/g, "") })}
                                className="rounded-lg border-2 pl-9"
                                style={{ borderColor: SESCON_BLUE }}
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="E-mail Empresa (Pode separar por ;)"
                                value={novoCliente.emailEmpresa}
                                onChange={(e) => setNovoCliente({ ...novoCliente, emailEmpresa: e.target.value })}
                                className="rounded-lg border-2 pl-9"
                                style={{ borderColor: SESCON_BLUE }}
                              />
                            </div>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <Input
                                placeholder="Telefone Empresa"
                                value={novoCliente.telefoneEmpresa}
                                onChange={(e) => setNovoCliente({ ...novoCliente, telefoneEmpresa: formatarTelefone(e.target.value) })}
                                className="rounded-lg border-2 pl-9"
                                style={{ borderColor: SESCON_BLUE }}
                              />
                            </div>
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
                    </div>

                    <div className="flex flex-col gap-3 pt-4">
                      {temRascunho && (
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-2">
                          <Clock className="w-4 h-4" />
                          <span>Rascunho salvo automaticamente vinculado ao CNPJ</span>
                        </div>
                      )}

                      {isLoading && (
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-xs font-bold" style={{ color: SESCON_BLUE }}>
                            <span>Enviando dados para o SESCON-SP...</span>
                            <span>{progressoEnvio}%</span>
                          </div>
                          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progressoEnvio}%` }}
                              className="h-full bg-green-500"
                            />
                          </div>
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
                          onClick={baixarExcelClientes}
                          disabled={clientes.length === 0}
                          className="flex-1 rounded-lg font-semibold py-2 text-white hover:bg-blue-700 transition-colors"
                          style={{ background: SESCON_ACCENT }}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Baixar meus Clientes (Excel)
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {mostrarModalClientes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
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
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Pesquisar na lista..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="p-6 space-y-3 overflow-y-auto flex-1">
              {clientesFiltrados.map((cliente, idx) => (
                <div key={cliente.id} className="p-4 rounded-lg border flex justify-between items-center" style={{ borderColor: SESCON_LIGHT_BLUE, background: SESCON_LIGHT_BLUE }}>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: SESCON_DARK_BLUE }}>{idx + 1}. {cliente.razaoSocial}</p>
                    <p className="text-xs text-gray-600 mt-1">CNPJ: {cliente.cnpj}</p>
                    <div className="grid grid-cols-2 gap-x-4 mt-1">
                      <p className="text-xs text-gray-500">Fat: {cliente.faturamento || "N/A"}</p>
                      <p className="text-xs text-gray-500">Func: {cliente.funcionarios || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 mt-1">
                      <p className="text-xs text-gray-500">E-mail: {cliente.emailEmpresa || "N/A"}</p>
                      <p className="text-xs text-gray-500">Tel: {cliente.telefoneEmpresa || "N/A"}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => removerCliente(cliente.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
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

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl p-8 max-w-md mx-auto">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-800">Sucesso!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-lg">
              Sua atualização cadastral foi recebida com sucesso. Um e-mail de confirmação foi enviado para <strong>{emailEscritorio}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction 
              onClick={resetForm}
              className="w-full h-14 bg-[#003b61] hover:bg-[#00568c] text-lg font-bold rounded-xl shadow-lg shadow-blue-900/20"
            >
              Concluir e Voltar ao Início
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      <footer className="pt-8 pb-6 px-8" style={{ background: "#003366" }}>
        <div className="max-w-6xl mx-auto text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 mb-6 border-b border-white border-opacity-30">
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
            <div className="flex flex-col items-center space-y-2 mb-6 md:mb-0 flex-1 md:px-8 text-center">
              <p className="text-sm font-bold">SESCON-SP | CNPJ 62.638.168/0001-84</p>
              <p className="text-xs">Av. Tiradentes, 998 - Luz | São Paulo-SP - 01102-000 (200m do metrô Armênia)</p>
              <p className="text-xs font-bold mt-2">SESCON-SP 2025 | Sindicato das Empresas de Serviços Contábeis, Assessoramento, Perícias, Informações e Pesquisas no Estado de São Paulo</p>
              <p className="text-xs mt-1">Para suporte, entre em contato: <a href="mailto:cadastro@sescon.org.br" className="underline hover:text-blue-200">cadastro@sescon.org.br</a></p>
            </div>
            <div className="hidden md:flex justify-end">
              <img src="/pacc-sescon-improved/logo-sescon-branco.png" alt="SESCON-SP" className="h-20 w-auto" />
            </div>
          </div>
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

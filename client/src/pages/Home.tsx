import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, Mail, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Loader2, Search, Save, RotateCcw, Eye, Clock, CheckCircle2, AlertTriangle, Send, FileDown, Download as DownloadIcon, Trash, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Building, Users, DollarSign, Phone, FileUp } from "lucide-react";
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
  emailResponsavel: string;
  faturamento?: string;
  funcionarios?: string;
  emailEmpresa?: string;
  telefoneEmpresa?: string;
  contratosocial?: {
    name: string;
    data: string;
  };
  cnpjValido?: boolean;
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
    emailResponsavel: "",
    faturamento: "",
    funcionarios: "",
    emailEmpresa: "",
    telefoneEmpresa: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progressoEnvio, setProgressoEnvio] = useState(0);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [busca, setBusca] = useState("");
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [cnpjEscritorioValido, setCnpjEscritorioValido] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showLimparDialog, setShowLimparDialog] = useState(false);

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
        }
      } else {
        if (!isCliente) setCnpjEscritorioValido(false);
        toast.error("CNPJ não localizado");
      }
    } catch (error) {
      toast.error("Erro ao conectar com a Receita Federal");
    } finally {
      setBuscandoReceita(false);
    }
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
  };

  const limparRascunho = () => {
    resetForm();
    setShowLimparDialog(false);
    toast.info("Rascunho limpo com sucesso");
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
        clientes: clientes,
        dataEnvio: new Date().toISOString()
      };
      setProgressoEnvio(40);
      const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxR2MCXtsKqCO3cXC6NgAkntgt6E2N5eTFEAqbyw7YW9Q2lATMGOE1L-NI916Ofduio/exec";
      await fetch(WEBHOOK_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(dadosEnvio) });
      setProgressoEnvio(100);
      setShowSuccessDialog(true);
    } catch (error) {
      toast.error("Erro ao enviar dados.");
      setProgressoEnvio(0);
    } finally {
      setIsLoading(false);
    }
  };

  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha o CNPJ e a Razão Social");
      return;
    }
    const cliente: Cliente = {
      id: Math.random().toString(36).substr(2, 9),
      cnpj: novoCliente.cnpj!,
      razaoSocial: novoCliente.razaoSocial!,
      emailResponsavel: novoCliente.emailResponsavel || emailEscritorio,
      faturamento: novoCliente.faturamento,
      funcionarios: novoCliente.funcionarios,
      emailEmpresa: novoCliente.emailEmpresa,
      telefoneEmpresa: novoCliente.telefoneEmpresa,
      contratosocial: novoCliente.contratosocial,
      cnpjValido: true
    };
    setClientes([...clientes, cliente]);
    setNovoCliente({ cnpj: "", razaoSocial: "", emailResponsavel: "", faturamento: "", funcionarios: "", emailEmpresa: "", telefoneEmpresa: "" });
    toast.success("Cliente adicionado!");
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
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        const novosClientes: Cliente[] = data.map((row: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          cnpj: formatarCNPJ(String(row.CNPJ || row.cnpj || "")),
          razaoSocial: String(row.RazaoSocial || row.razaoSocial || ""),
          emailResponsavel: row.EmailResponsavel || row.emailResponsavel || emailEscritorio,
          faturamento: String(row.Faturamento || row.faturamento || ""),
          funcionarios: String(row.Funcionarios || row.funcionarios || ""),
          emailEmpresa: String(row.EmailEmpresa || row.emailEmpresa || ""),
          telefoneEmpresa: formatarTelefone(String(row.Telefone || row.telefone || "")),
          cnpjValido: true
        })).filter(c => c.cnpj && c.razaoSocial);
        setClientes([...clientes, ...novosClientes]);
        toast.success(`${novosClientes.length} clientes importados!`);
      } catch (err) {
        toast.error("Erro ao processar planilha.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const exportarExcel = () => {
    if (clientes.length === 0) {
      toast.error("Não há clientes para exportar");
      return;
    }
    const data = clientes.map(c => ({
      "CNPJ": c.cnpj,
      "Razão Social": c.razaoSocial,
      "E-mail Responsável": c.emailResponsavel,
      "Faturamento": c.faturamento,
      "Funcionários": c.funcionarios,
      "E-mail Empresa": c.emailEmpresa,
      "Telefone Empresa": c.telefoneEmpresa
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Clientes");
    XLSX.writeFile(wb, "Lista_Clientes_SESCON.xlsx");
    toast.success("Lista exportada com sucesso!");
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNovoCliente({
          ...novoCliente,
          contratosocial: {
            name: file.name,
            data: evt.target?.result as string
          }
        });
        toast.success("PDF anexado com sucesso!");
      };
      reader.readAsDataURL(file);
    } else {
      toast.error("Por favor, selecione um arquivo PDF.");
    }
  };

  useEffect(() => {
    if (atividadePrincipal === "outros") {
      window.location.href = "https://sesconsp.github.io/atualizacao-cadastral/";
    }
  }, [atividadePrincipal]);

  const podeAvancarAba1 = cnpjEscritorioValido && razaoSocialEscritorio && emailEscritorio.includes("@");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#f8fafc" }}>
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
          {/* Sidebar */}
          <div className="col-span-1 space-y-6">
            <div className="rounded-lg p-6 text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${SESCON_BLUE} 0%, ${SESCON_DARK_BLUE} 100%)` }}>
              <h3 className="text-lg font-bold mb-6 pb-4 border-b border-white border-opacity-30">Como Funciona</h3>
              <div className="space-y-4">
                {[
                  { num: 1, text: "Preencha os dados do seu escritório" },
                  { num: 2, text: "Importe ou adicione todos os seus clientes" },
                  { num: 3, text: "Revise as informações" },
                  { num: 4, text: "Envie para processamento" }
                ].map(step => (
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

          {/* Form Content */}
          <div className="col-span-3 space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-md border mb-6" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>Progresso do Cadastro</span>
                <span className="text-xs font-bold" style={{ color: SESCON_BLUE }}>Passo {abaSelecionada} de 2</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="h-2.5 rounded-full transition-all duration-500 ease-in-out" style={{ width: abaSelecionada === 1 ? '50%' : '100%', background: `linear-gradient(90deg, ${SESCON_BLUE} 0%, ${SESCON_ACCENT} 100%)` }}></div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {abaSelecionada === 1 ? (
                <motion.div key="aba1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Identificação da Empresa</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>CNPJ do Escritório <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Input type="text" placeholder="00.000.000/0000-00" value={cnpjEscritorio} onChange={(e) => setCnpjEscritorio(formatarCNPJ(e.target.value))} onBlur={() => buscarCNPJ(cnpjEscritorio)} className="rounded-lg border-2 px-4 py-3 text-lg" style={{ borderColor: SESCON_BLUE }} maxLength={18} />
                        {buscandoReceita && <div className="absolute right-3 top-1/2 -translate-y-1/2"><Loader2 className="w-5 h-5 animate-spin text-blue-600" /></div>}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>Nome do Escritório <span className="text-red-500">*</span></label>
                      <Input type="text" value={razaoSocialEscritorio} readOnly className="bg-gray-50 rounded-lg border-2 px-4 py-3" style={{ borderColor: SESCON_BLUE }} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>E-mail para Contato <span className="text-red-500">*</span></label>
                      <Input type="email" placeholder="contato@empresa.com.br" value={emailEscritorio} onChange={(e) => setEmailEscritorio(e.target.value)} className="rounded-lg border-2 px-4 py-3" style={{ borderColor: SESCON_BLUE }} />
                    </div>
                    <Button onClick={() => setAbaSelecionada(2)} disabled={!podeAvancarAba1} className="w-full py-6 text-lg font-bold text-white shadow-lg" style={{ background: SESCON_BLUE }}>Próximo</Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="aba2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl shadow-xl border p-8" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold" style={{ color: SESCON_DARK_BLUE }}>Gestão de Clientes</h2>
                    <Button variant="ghost" onClick={() => setAbaSelecionada(1)} className="text-blue-600 font-bold">Voltar</Button>
                  </div>

                  <div className="space-y-8">
                    {/* Atividade Principal */}
                    <div className="p-6 rounded-lg border-2" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                      <label className="text-sm font-bold block mb-4" style={{ color: SESCON_DARK_BLUE }}>Atividade Principal <span className="text-red-500">*</span></label>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={atividadePrincipal === "contabilidade"} onChange={() => setAtividadePrincipal("contabilidade")} className="w-4 h-4" />
                          <span className="font-semibold">Contabilidade</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="radio" checked={atividadePrincipal === "outros"} onChange={() => setAtividadePrincipal("outros")} className="w-4 h-4" />
                          <span className="font-semibold">Outros</span>
                        </label>
                      </div>
                    </div>

                    {/* Importação */}
                    <div className="p-8 rounded-xl border-2 border-dashed text-center" style={{ borderColor: SESCON_BLUE, background: SESCON_LIGHT_BLUE }}>
                      <div className="max-w-md mx-auto mb-6">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                          <FileText className="w-8 h-8" style={{ color: SESCON_BLUE }} />
                        </div>
                        <h4 className="text-lg font-bold mb-2" style={{ color: SESCON_DARK_BLUE }}>Importar Lista de Clientes</h4>
                        <p className="text-sm text-gray-600">Aceitamos arquivos <strong>.CSV</strong> ou <strong>.Excel</strong>.</p>
                      </div>
                      <div className="flex gap-4 justify-center">
                        <Button onClick={exportarExcel} variant="outline" className="rounded-lg border-2 h-auto py-3 px-6 flex items-center gap-2" style={{ borderColor: SESCON_BLUE, color: SESCON_BLUE }}><DownloadIcon className="w-5 h-5" /> Exportar Excel</Button>
                        <label className="cursor-pointer">
                          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                          <div className="rounded-lg font-bold py-3 px-6 text-white shadow-md flex items-center gap-2" style={{ background: SESCON_BLUE }}><Upload className="w-5 h-5" /> Selecionar Arquivo</div>
                        </label>
                      </div>
                    </div>

                    {/* Lista de Clientes Direta */}
                    <div className="p-6 rounded-lg border-2" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold" style={{ color: SESCON_DARK_BLUE }}>Clientes Adicionados ({clientes.length})</h4>
                        <div className="relative w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input type="text" placeholder="Pesquisar..." value={busca} onChange={(e) => setBusca(e.target.value)} className="pl-10 py-1 text-sm" />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
                        {clientes.filter(c => c.razaoSocial.toLowerCase().includes(busca.toLowerCase()) || c.cnpj.includes(busca)).map(c => (
                          <div key={c.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                            <div>
                              <p className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>{c.razaoSocial}</p>
                              <p className="text-xs text-gray-500">{c.cnpj} | {c.emailResponsavel}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => removerCliente(c.id)} className="text-red-500 hover:bg-red-50"><Trash className="w-4 h-4" /></Button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Adição Manual com Novos Campos */}
                    <div className="p-6 rounded-lg border-2" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                      <h4 className="font-bold mb-4" style={{ color: SESCON_DARK_BLUE }}>Adicionar Cliente Manualmente</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="CNPJ" value={novoCliente.cnpj} onChange={(e) => setNovoCliente({...novoCliente, cnpj: formatarCNPJ(e.target.value)})} onBlur={() => buscarCNPJ(novoCliente.cnpj!, true)} />
                        <Input placeholder="Razão Social" value={novoCliente.razaoSocial} onChange={(e) => setNovoCliente({...novoCliente, razaoSocial: e.target.value})} />
                        <Input placeholder="E-mail do Responsável (Contabilidade)" value={novoCliente.emailResponsavel} onChange={(e) => setNovoCliente({...novoCliente, emailResponsavel: e.target.value})} />
                        <Input placeholder="Faturamento Anual" value={novoCliente.faturamento} onChange={(e) => setNovoCliente({...novoCliente, faturamento: formatarMoeda(e.target.value)})} />
                        <Input placeholder="Qtd. Funcionários" value={novoCliente.funcionarios} onChange={(e) => setNovoCliente({...novoCliente, funcionarios: e.target.value.replace(/\D/g, "")})} />
                        <Input placeholder="E-mail da Empresa" value={novoCliente.emailEmpresa} onChange={(e) => setNovoCliente({...novoCliente, emailEmpresa: e.target.value})} />
                        <Input placeholder="Telefone da Empresa" value={novoCliente.telefoneEmpresa} onChange={(e) => setNovoCliente({...novoCliente, telefoneEmpresa: formatarTelefone(e.target.value)})} />
                        <div className="flex items-center gap-2">
                          <label className="flex-1 cursor-pointer border-2 border-dashed rounded-lg p-2 text-center text-sm" style={{ borderColor: SESCON_BLUE }}>
                            <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
                            <div className="flex items-center justify-center gap-2"><FileUp className="w-4 h-4" /> {novoCliente.contratosocial ? "PDF Anexado" : "Anexar PDF"}</div>
                          </label>
                        </div>
                      </div>
                      <Button onClick={adicionarCliente} className="w-full mt-4 text-white font-bold" style={{ background: SESCON_BLUE }}>Adicionar à Lista</Button>
                    </div>

                    {/* Envio Final */}
                    <div className="pt-6 border-t">
                      {isLoading && (
                        <div className="mb-4">
                          <div className="flex justify-between text-xs font-bold mb-1" style={{ color: SESCON_BLUE }}>
                            <span>Enviando dados...</span>
                            <span>{progressoEnvio}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progressoEnvio}%` }}></div>
                          </div>
                        </div>
                      )}
                      <Button onClick={enviarDados} disabled={clientes.length === 0 || isLoading} className="w-full py-8 text-xl font-bold text-white shadow-xl" style={{ background: `linear-gradient(135deg, ${SESCON_BLUE} 0%, ${SESCON_DARK_BLUE} 100%)` }}>
                        {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Send className="w-6 h-6 mr-2" />}
                        Enviar Atualização para o SESCON-SP
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ - Caixa Azul de Destaque */}
            <div className="rounded-2xl p-8 shadow-lg border" style={{ background: SESCON_LIGHT_BLUE, borderColor: SESCON_BLUE }}>
              <h2 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{ color: SESCON_DARK_BLUE }}>
                <MessageCircle className="w-8 h-8" /> Perguntas Frequentes
              </h2>
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl border overflow-hidden transition-all" style={{ borderColor: SESCON_BLUE }}>
                    <button onClick={() => setFaqAberto(faqAberto === index ? null : index)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                      <span className="font-bold text-lg" style={{ color: SESCON_DARK_BLUE }}>{faq.pergunta}</span>
                      {faqAberto === index ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                    </button>
                    <AnimatePresence>
                      {faqAberto === index && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-6 py-4 border-t bg-gray-50" style={{ borderColor: SESCON_LIGHT_BLUE }}>
                            <div className="text-gray-700 leading-relaxed text-base" dangerouslySetInnerHTML={{ __html: faq.resposta }}></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Institucional Completo */}
      <footer className="text-white py-12 px-8 mt-12" style={{ background: SESCON_BLUE }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="space-y-4">
              <h4 className="text-xl font-bold">Siga o SESCON-SP</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/sesconsp/" target="_blank" rel="noopener noreferrer" className="hover:text-pink-400 transition-colors"><Instagram className="w-6 h-6" /></a>
                <a href="https://www.facebook.com/sesconsp" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors"><Facebook className="w-6 h-6" /></a>
                <a href="https://www.youtube.com/channel/UCBjwnyWvusn2PsIT-wRk9MQ" target="_blank" rel="noopener noreferrer" className="hover:text-red-400 transition-colors"><Youtube className="w-6 h-6" /></a>
                <a href="https://br.linkedin.com/company/sescon-sp" target="_blank" rel="noopener noreferrer" className="hover:text-blue-300 transition-colors"><Linkedin className="w-6 h-6" /></a>
                <a href="https://api.whatsapp.com/send?phone=551133044416" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 transition-colors"><MessageCircle className="w-6 h-6" /></a>
              </div>
            </div>
            <div className="text-center md:text-left space-y-2">
              <p className="text-sm font-bold">SESCON-SP | CNPJ 62.638.168/0001-84</p>
              <p className="text-xs">Av. Tiradentes, 998 - Luz | São Paulo-SP - 01102-000</p>
              <p className="text-xs">Suporte: <a href="mailto:cadastro@sescon.org.br" className="underline">cadastro@sescon.org.br</a></p>
            </div>
            <img src="/pacc-sescon-improved/logo-sescon-branco.png" alt="SESCON-SP" className="h-16 w-auto" />
          </div>
          <div className="border-t border-white/20 pt-8 text-xs space-y-4">
            <div className="flex gap-4">
              <a href="https://sescon.org.br/canais-de-atendimento/" className="hover:underline">Canais de atendimento</a>
              <span>|</span>
              <a href="https://sescon.org.br/wp-content/uploads/2025/05/POLITICA-DE-PRIVACIDADE-E-COOKIES-1.pdf" className="hover:underline">Política de Privacidade</a>
            </div>
            <p className="opacity-80">© O Sescon-SP e a Aescon-SP informam que a coleta dos dados pessoais é pautada na LGPD (Lei nº 13.709/18).</p>
            <p className="font-bold">SESCON-SP Todos os Direitos Reservados.</p>
          </div>
        </div>
      </footer>

      {/* Modais */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent className="max-w-md rounded-2xl">
          <AlertDialogHeader className="flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"><CheckCircle2 className="w-12 h-12 text-green-600" /></div>
            <AlertDialogTitle className="text-2xl font-bold text-gray-900">Sucesso!</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">Sua atualização foi recebida. Um e-mail de confirmação foi enviado para <strong>{emailEscritorio}</strong>.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter><Button onClick={resetForm} className="w-full py-6 text-lg font-bold text-white" style={{ background: SESCON_BLUE }}>Concluir</Button></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

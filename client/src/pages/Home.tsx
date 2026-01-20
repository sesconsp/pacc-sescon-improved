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
  cnpjValido?: boolean;
  ehMatriz?: boolean;
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
  const [cnpjEscritorioValido, setCnpjEscritorioValido] = useState(false);
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [atividadePrincipal, setAtividadePrincipal] = useState("contabilidade");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({
    cnpj: "",
    razaoSocial: "",
    faturamento: "",
    funcionarios: "",
    emailEmpresa: "",
    telefoneEmpresa: "",
    emailCustomizado: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progressoEnvio, setProgressoEnvio] = useState(0);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);

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
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
      const data = await response.json();
      
      if (isCliente) {
        setNovoCliente(prev => ({
          ...prev,
          razaoSocial: data.razao_social,
          emailEmpresa: data.estabelecimento.email,
          telefoneEmpresa: `(${data.estabelecimento.ddd1}) ${data.estabelecimento.telefone1}`
        }));
      } else {
        setRazaoSocialEscritorio(data.razao_social);
        setCnpjEscritorioValido(true);
      }
    } catch (error) {
      toast.error("Erro ao buscar CNPJ. Verifique os dados.");
    } finally {
      setBuscandoReceita(false);
    }
  };

  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("CNPJ e Razão Social são obrigatórios");
      return;
    }
    const cliente: Cliente = {
      id: Math.random().toString(36).substr(2, 9),
      cnpj: novoCliente.cnpj!,
      razaoSocial: novoCliente.razaoSocial!,
      emailPrincipal: !novoCliente.emailCustomizado,
      ...novoCliente
    } as Cliente;

    setClientes([...clientes, cliente]);
    setNovoCliente({
      cnpj: "",
      razaoSocial: "",
      faturamento: "",
      funcionarios: "",
      emailEmpresa: "",
      telefoneEmpresa: "",
      emailCustomizado: ""
    });
    toast.success("Cliente adicionado com sucesso!");
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
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws) as any[];

      const novosClientes = data.map((row: any) => ({
        id: Math.random().toString(36).substr(2, 9),
        cnpj: formatarCNPJ(String(row.CNPJ || row.cnpj || "")),
        razaoSocial: String(row['Razão Social'] || row.razaoSocial || ""),
        emailCustomizado: String(row['E-mail Contabilidade'] || row.email || ""),
        faturamento: String(row.Faturamento || row.faturamento || ""),
        funcionarios: String(row.Funcionários || row.funcionarios || ""),
        emailEmpresa: String(row['E-mail Empresa'] || row.emailEmpresa || ""),
        telefoneEmpresa: String(row['Telefone Empresa'] || row.telefoneEmpresa || ""),
        emailPrincipal: !row['E-mail Contabilidade']
      }));

      setClientes([...clientes, ...novosClientes]);
      toast.success(`${novosClientes.length} clientes importados!`);
    };
    reader.readAsBinaryString(file);
  };

  const baixarExcel = () => {
    if (clientes.length === 0) {
      toast.error("Não há clientes para baixar.");
      return;
    }
    const dataParaExportar = clientes.map(c => ({
      'CNPJ Cliente': c.cnpj,
      'Razão Social': c.razaoSocial,
      'E-mail Contabilidade / Responsável': c.emailCustomizado || emailEscritorio,
      'Faturamento': c.faturamento,
      'Funcionários': c.funcionarios,
      'E-mail Empresa': c.emailEmpresa,
      'Telefone Empresa': c.telefoneEmpresa
    }));

    const ws = XLSX.utils.json_to_sheet(dataParaExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Meus Clientes");
    XLSX.writeFile(wb, `Meus_Clientes_${cnpjEscritorio.replace(/\D/g, "")}.xlsx`);
    toast.success("Planilha gerada com sucesso!");
  };

  const enviarDados = async () => {
    setIsLoading(true);
    setProgressoEnvio(10);
    
    const payload = {
      escritorioCnpj: cnpjEscritorio,
      escritorioRazao: razaoSocialEscritorio,
      escritorioEmail: emailEscritorio,
      clientes: clientes.map(c => ({
        cnpj: c.cnpj,
        razaoSocial: c.razaoSocial,
        email: c.emailCustomizado || emailEscritorio,
        faturamento: c.faturamento,
        funcionarios: c.funcionarios,
        emailEmpresa: c.emailEmpresa,
        telefoneEmpresa: c.telefoneEmpresa
      }))
    };

    try {
      setProgressoEnvio(50);
      // Substitua pela sua URL do AppScript
      const response = await fetch('SUA_URL_DO_APPSCRIPT_AQUI', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      setProgressoEnvio(100);
      toast.success("Dados enviados com sucesso!");
      setAbaSelecionada(1);
      setClientes([]);
    } catch (error) {
      toast.error("Erro ao enviar dados.");
    } finally {
      setIsLoading(false);
      setProgressoEnvio(0);
    }
  };

  const podeAvancarAba1 = cnpjEscritorioValido && emailEscritorio.includes("@");

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-900 rounded-xl flex items-center justify-center shadow-lg">
              <Building className="text-white w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight" style={{ color: SESCON_DARK_BLUE }}>SESCON-SP</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Atualização Cadastral 2026</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Esquerda: Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-t-4" style={{ borderColor: SESCON_BLUE }}>
              <h2 className="text-xl font-bold mb-4" style={{ color: SESCON_DARK_BLUE }}>Central de Atualização</h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                Mantenha a base de dados do seu escritório e de seus clientes atualizada para garantir todos os benefícios e representatividade do SESCON-SP.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
                  <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: SESCON_DARK_BLUE }}>Segurança de Dados</p>
                    <p className="text-[10px] text-gray-500">Ambiente criptografado e seguro</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
                  <Clock className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold" style={{ color: SESCON_DARK_BLUE }}>Processamento Rápido</p>
                    <p className="text-[10px] text-gray-500">Atualização em tempo real</p>
                  </div>
                </div>
              </div>
            </div>

            {/* CAIXA DE VISUALIZAÇÃO DE CLIENTES (Sempre visível se houver clientes) */}
            <div className="bg-white rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: SESCON_DARK_BLUE }}>
                  <Users className="w-4 h-4" />
                  Clientes Adicionados ({clientes.length})
                </h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto p-4 space-y-3">
                {clientes.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Nenhum cliente adicionado ainda.</p>
                  </div>
                ) : (
                  clientes.map((c) => (
                    <div key={c.id} className="p-3 rounded-lg border bg-white hover:border-blue-200 transition-colors group relative">
                      <button 
                        onClick={() => removerCliente(c.id)}
                        className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <p className="text-[10px] font-bold text-blue-600">{c.cnpj}</p>
                      <p className="text-xs font-bold truncate pr-6" style={{ color: SESCON_DARK_BLUE }}>{c.razaoSocial}</p>
                      <p className="text-[10px] text-gray-500 truncate mt-1">
                        <Mail className="w-3 h-3 inline mr-1" />
                        {c.emailCustomizado || "E-mail do Escritório"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Coluna Direita: Formulário */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-md border" style={{ borderColor: SESCON_LIGHT_BLUE }}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold" style={{ color: SESCON_DARK_BLUE }}>Progresso</span>
                <span className="text-xs font-bold" style={{ color: SESCON_BLUE }}>Passo {abaSelecionada} de 2</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full transition-all duration-500"
                  style={{ width: abaSelecionada === 1 ? '50%' : '100%', background: SESCON_BLUE }}
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
                  className="bg-white rounded-2xl shadow-xl border p-8"
                >
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Identificação do Escritório</h2>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>CNPJ do Escritório *</label>
                      <div className="relative">
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={cnpjEscritorio}
                          onChange={(e) => setCnpjEscritorio(formatarCNPJ(e.target.value))}
                          onBlur={() => buscarCNPJ(cnpjEscritorio)}
                          className="rounded-lg border-2 py-6 text-lg"
                          style={{ borderColor: SESCON_BLUE }}
                        />
                        {buscandoReceita && <Loader2 className="absolute right-3 top-4 w-5 h-5 animate-spin text-blue-600" />}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>Nome do Escritório</label>
                      <Input value={razaoSocialEscritorio} readOnly className="bg-gray-50 border-2 py-6" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold" style={{ color: SESCON_DARK_BLUE }}>E-mail para Contato *</label>
                      <Input
                        type="email"
                        placeholder="contato@escritorio.com.br"
                        value={emailEscritorio}
                        onChange={(e) => setEmailEscritorio(e.target.value)}
                        className="border-2 py-6"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                    </div>

                    <Button
                      onClick={() => setAbaSelecionada(2)}
                      disabled={!podeAvancarAba1}
                      className="w-full py-8 text-lg font-bold"
                      style={{ background: SESCON_BLUE }}
                    >
                      Próximo Passo
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="aba2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl shadow-xl border p-8"
                >
                  <h2 className="text-2xl font-bold mb-8" style={{ color: SESCON_DARK_BLUE }}>Gestão de Clientes</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Importação */}
                    <div className="space-y-4">
                      <h3 className="font-bold flex items-center gap-2" style={{ color: SESCON_DARK_BLUE }}>
                        <Upload className="w-5 h-5" /> Importar Planilha
                      </h3>
                      <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-blue-50 transition-all relative group" style={{ borderColor: SESCON_BLUE }}>
                        <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <FileDown className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                        <p className="text-xs font-bold text-blue-600">Clique ou arraste sua planilha</p>
                      </div>
                    </div>

                    {/* Adicionar Manual */}
                    <div className="space-y-3">
                      <h3 className="font-bold flex items-center gap-2" style={{ color: SESCON_DARK_BLUE }}>
                        <Plus className="w-5 h-5" /> Adicionar Manualmente
                      </h3>
                      <Input
                        placeholder="CNPJ do Cliente"
                        value={novoCliente.cnpj}
                        onChange={(e) => setNovoCliente({ ...novoCliente, cnpj: formatarCNPJ(e.target.value) })}
                        onBlur={() => buscarCNPJ(novoCliente.cnpj || "", true)}
                        className="border-2"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                      <Input
                        placeholder="Razão Social"
                        value={novoCliente.razaoSocial}
                        onChange={(e) => setNovoCliente({ ...novoCliente, razaoSocial: e.target.value })}
                        className="border-2"
                        style={{ borderColor: SESCON_BLUE }}
                      />
                      
                      {/* Campo de E-mail da Contabilidade Melhorado */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">E-mail do Responsável / Contabilidade</label>
                        <Input
                          placeholder="Ex: joao@contabil.com; maria@contabil.com"
                          value={novoCliente.emailCustomizado}
                          onChange={(e) => setNovoCliente({ ...novoCliente, emailCustomizado: e.target.value })}
                          className="border-2"
                          style={{ borderColor: SESCON_BLUE }}
                        />
                        <p className="text-[9px] text-gray-400">Para múltiplos e-mails, separe por ponto e vírgula (;)</p>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Faturamento"
                          value={novoCliente.faturamento}
                          onChange={(e) => setNovoCliente({ ...novoCliente, faturamento: formatarMoeda(e.target.value) })}
                          className="border-2"
                        />
                        <Input
                          placeholder="Funcionários"
                          value={novoCliente.funcionarios}
                          onChange={(e) => setNovoCliente({ ...novoCliente, funcionarios: e.target.value.replace(/\D/g, "") })}
                          className="border-2"
                        />
                      </div>

                      <Button onClick={adicionarCliente} className="w-full" style={{ background: SESCON_BLUE }}>
                        Adicionar à Lista
                      </Button>
                    </div>
                  </div>

                  {/* Ações Finais */}
                  <div className="space-y-4 pt-6 border-t">
                    {isLoading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-blue-600">
                          <span>Enviando dados...</span>
                          <span>{progressoEnvio}%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all" style={{ width: `${progressoEnvio}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button onClick={() => setAbaSelecionada(1)} variant="outline" className="flex-1 border-2">Voltar</Button>
                      <Button onClick={baixarExcel} className="flex-1 text-white" style={{ background: SESCON_ACCENT }}>
                        <Download className="w-4 h-4 mr-2" /> Baixar meus Clientes (Excel)
                      </Button>
                    </div>
                    
                    <Button
                      onClick={enviarDados}
                      disabled={isLoading || clientes.length === 0}
                      className="w-full py-6 text-xl font-bold text-white bg-green-600 hover:bg-green-700"
                    >
                      {isLoading ? <Loader2 className="w-6 h-6 animate-spin mr-2" /> : <Send className="w-6 h-6 mr-2" />}
                      FINALIZAR E ENVIAR AO SESCON
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );

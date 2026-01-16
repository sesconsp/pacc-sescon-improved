import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Upload, CheckCircle, Mail, AlertCircle, FileText, Download, ChevronDown, ChevronUp, Loader2, Search, Save, RotateCcw, Eye, Clock, CheckCircle2, AlertTriangle, Send, FileDown, Download as DownloadIcon, Trash, Instagram, Facebook, Youtube, Linkedin, MessageCircle, Building, Users, Globe, Phone, MapPin } from "lucide-react";
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
</ul>`
  }
];

export default function Home() {
  const [abaAtiva, setAbaAtiva] = useState("empresa");
  const [cnpjEscritorio, setCnpjEscritorio] = useState("");
  const [razaoSocialEscritorio, setRazaoSocialEscritorio] = useState("");
  const [emailEscritorio, setEmailEscritorio] = useState("");
  const [atividadePrincipal, setAtividadePrincipal] = useState("contabilidade");
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [novoCliente, setNovoCliente] = useState<Partial<Cliente>>({
    cnpj: "",
    razaoSocial: "",
    emailPrincipal: true,
    emailCustomizado: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [faqAberto, setFaqAberto] = useState<number | null>(null);
  const [termoBusca, setTermoBusca] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Efeito para redirecionar se "Outros" for selecionado
  useEffect(() => {
    if (atividadePrincipal === "outros") {
      window.open("https://sesconsp.github.io/atualizacao-cadastral/", "_blank");
    }
  }, [atividadePrincipal]);

  // Buscar CNPJ do Escritório
  const buscarCNPJ = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
        if (response.ok) {
          const data = await response.json();
          setRazaoSocialEscritorio(data.razao_social);
          toast.success("Escritório localizado com sucesso!");
        } else {
          toast.error("CNPJ não localizado na Receita Federal");
        }
      } catch (error) {
        toast.error("Erro ao buscar CNPJ");
      }
    }
  };

  // Buscar CNPJ do Cliente
  const buscarCNPJCliente = async (cnpj: string) => {
    const cnpjLimpo = cnpj.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);
        if (response.ok) {
          const data = await response.json();
          setNovoCliente(prev => ({ ...prev, razaoSocial: data.razao_social }));
          toast.success("Cliente localizado!");
        }
      } catch (error) {}
    }
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
      const data = XLSX.utils.sheet_to_json(ws);

      const novosClientes: Cliente[] = data.map((row: any, index: number) => ({
        id: Math.random().toString(),
        cnpj: row.CNPJ || row.cnpj || "",
        razaoSocial: row.RazaoSocial || row.razaoSocial || row.Nome || "",
        emailPrincipal: !row.Email,
        emailCustomizado: row.Email || "",
        cnpjValido: true
      }));

      setClientes(prev => [...prev, ...novosClientes]);
      toast.success(`${novosClientes.length} clientes importados!`);
    };
    reader.readAsBinaryString(file);
  };

  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Preencha os dados do cliente");
      return;
    }
    const cliente: Cliente = {
      id: Math.random().toString(),
      cnpj: novoCliente.cnpj,
      razaoSocial: novoCliente.razaoSocial,
      emailPrincipal: novoCliente.emailPrincipal || false,
      emailCustomizado: novoCliente.emailCustomizado,
      cnpjValido: true
    };
    setClientes(prev => [...prev, cliente]);
    setNovoCliente({ cnpj: "", razaoSocial: "", emailPrincipal: true, emailCustomizado: "" });
    toast.success("Cliente adicionado!");
  };

  const removerCliente = (id: string) => {
    setClientes(prev => prev.filter(c => c.id !== id));
  };

  const enviarDados = async () => {
    setIsLoading(true);
    try {
      const dadosEnvio = {
        escritorioCnpj: cnpjEscritorio,
        escritorioRazao: razaoSocialEscritorio,
        escritorioEmail: emailEscritorio,
        atividadePrincipal: atividadePrincipal,
        clientes: clientes.map(c => ({
          cnpj: c.cnpj,
          razaoSocial: c.razaoSocial,
          email: c.emailPrincipal ? emailEscritorio : c.emailCustomizado
        })),
        dataEnvio: new Date().toISOString()
      };

      const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxR2MCXtsKqCO3cXC6NgAkntgt6E2N5eTFEAqbyw7YW9Q2lATMGOE1L-NI916Ofduio/exec";
      
      await fetch(WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify(dadosEnvio),
      });

      toast.success("Dados enviados com sucesso!");
      setProgresso(100);
      setShowConfirmDialog(true);
    } catch (error) {
      toast.error("Erro ao enviar dados");
    } finally {
      setIsLoading(false);
    }
  };

  const clientesFiltrados = clientes.filter(c => 
    c.razaoSocial.toLowerCase().includes(termoBusca.toLowerCase()) || 
    c.cnpj.includes(termoBusca)
  );

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 relative overflow-hidden bg-slate-50">
      {/* Elementos Decorativos de Fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-50/50 blur-[120px] pointer-events-none" />

      {/* Header Institucional */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-[#003b61] p-2 rounded-lg shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#003b61] tracking-tight">SESCON-SP</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-widest">Central de Atualização</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-[#003b61] transition-colors">Início</a>
            <a href="#" className="hover:text-[#003b61] transition-colors">Sobre</a>
            <a href="#" className="hover:text-[#003b61] transition-colors">Suporte</a>
            <Button variant="outline" className="border-[#003b61] text-[#003b61] hover:bg-[#003b61] hover:text-white transition-all duration-300">
              Acessar Portal
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-12 relative z-10">
        {/* Barra de Progresso Estilizada */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Atualização Cadastral</h2>
              <p className="text-slate-500 text-sm">Passo {abaAtiva === "empresa" ? "1" : "2"} de 2</p>
            </div>
            <span className="text-sm font-bold text-[#003b61]">{abaAtiva === "empresa" ? "50%" : "100%"}</span>
          </div>
          <div className="h-3 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: abaAtiva === "empresa" ? "50%" : "100%" }}
              className="h-full bg-gradient-to-r from-[#003b61] to-[#00568c] shadow-lg"
            />
          </div>
        </div>

        {/* Tabs de Navegação */}
        <div className="flex gap-2 mb-8 p-1 bg-slate-200/50 rounded-xl backdrop-blur-sm w-fit mx-auto">
          <button
            onClick={() => setAbaAtiva("empresa")}
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              abaAtiva === "empresa" 
              ? "bg-white text-[#003b61] shadow-md scale-105" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Building className="w-4 h-4" />
            Dados da Empresa
          </button>
          <button
            onClick={() => setAbaAtiva("clientes")}
            className={`px-8 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2 ${
              abaAtiva === "clientes" 
              ? "bg-white text-[#003b61] shadow-md scale-105" 
              : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Users className="w-4 h-4" />
            Gestão de Clientes
          </button>
        </div>

        <AnimatePresence mode="wait">
          {abaAtiva === "empresa" ? (
            <motion.div
              key="empresa"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
                <div className="h-2 bg-[#003b61]" />
                <CardHeader className="pb-8 pt-10 px-10">
                  <CardTitle className="text-2xl text-[#003b61]">Identificação da Empresa</CardTitle>
                  <CardDescription className="text-slate-500">
                    Inicie o processo validando os dados do seu escritório contábil.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8 px-10 pb-12">
                  <div className="grid gap-8">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        CNPJ do Escritório <span className="text-red-500">*</span>
                      </label>
                      <div className="relative group">
                        <Input
                          placeholder="00.000.000/0000-00"
                          value={cnpjEscritorio}
                          onChange={(e) => {
                            setCnpjEscritorio(e.target.value);
                            buscarCNPJ(e.target.value);
                          }}
                          className="h-14 px-5 text-lg border-slate-200 focus:border-[#003b61] focus:ring-[#003b61]/10 transition-all rounded-xl group-hover:border-slate-300"
                        />
                        {razaoSocialEscritorio && (
                          <div className="absolute right-4 top-1/2 -translate-y-1/2">
                            <CheckCircle2 className="w-6 h-6 text-green-500" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nome do Escritório</label>
                      <Input
                        value={razaoSocialEscritorio}
                        readOnly
                        placeholder="Preenchido automaticamente"
                        className="h-14 px-5 bg-slate-50 border-slate-200 text-slate-600 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                        E-mail para Contato <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="email"
                        placeholder="contato@escritorio.com.br"
                        value={emailEscritorio}
                        disabled={!razaoSocialEscritorio}
                        onChange={(e) => setEmailEscritorio(e.target.value)}
                        className="h-14 px-5 text-lg border-slate-200 focus:border-[#003b61] focus:ring-[#003b61]/10 transition-all rounded-xl disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => setAbaAtiva("clientes")}
                    disabled={!cnpjEscritorio || !razaoSocialEscritorio || !emailEscritorio}
                    className="w-full h-16 text-lg font-bold bg-[#003b61] hover:bg-[#00568c] shadow-lg shadow-[#003b61]/20 transition-all duration-300 rounded-xl mt-4"
                  >
                    Próximo Passo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="clientes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-xl overflow-hidden">
                <div className="h-2 bg-[#003b61]" />
                <CardHeader className="px-10 pt-10">
                  <CardTitle className="text-2xl text-[#003b61]">Gestão de Clientes</CardTitle>
                  <CardDescription>Adicione ou importe a lista de empresas que seu escritório representa.</CardDescription>
                </CardHeader>
                <CardContent className="px-10 pb-12 space-y-10">
                  {/* Atividade Principal */}
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-700 mb-4 block">Atividade Principal do Escritório</label>
                    <div className="flex flex-wrap gap-6">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="atividade"
                          value="contabilidade"
                          checked={atividadePrincipal === "contabilidade"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-5 h-5 text-[#003b61] focus:ring-[#003b61]"
                        />
                        <span className="text-slate-700 font-medium group-hover:text-[#003b61] transition-colors">Contabilidade</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="radio"
                          name="atividade"
                          value="outros"
                          checked={atividadePrincipal === "outros"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-5 h-5 text-[#003b61] focus:ring-[#003b61]"
                        />
                        <span className="text-slate-700 font-medium group-hover:text-[#003b61] transition-colors">Outros (Redirecionar)</span>
                      </label>
                    </div>
                  </div>

                  {/* Importação e Adição */}
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-[#003b61]" /> Importar Planilha
                      </h3>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-[#003b61] hover:bg-blue-50/30 transition-all cursor-pointer relative group">
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <div className="space-y-3">
                          <div className="w-12 h-12 bg-blue-100 text-[#003b61] rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <FileDown className="w-6 h-6" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">Arraste sua planilha ou clique para selecionar</p>
                          <p className="text-xs text-slate-400">Formatos aceitos: .xlsx, .xls</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-[#003b61]" /> Adicionar Manualmente
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="CNPJ do Cliente"
                          value={novoCliente.cnpj}
                          onChange={(e) => {
                            setNovoCliente(prev => ({ ...prev, cnpj: e.target.value }));
                            buscarCNPJCliente(e.target.value);
                          }}
                          className="h-12 rounded-xl border-slate-200"
                        />
                        <Input
                          placeholder="Razão Social"
                          value={novoCliente.razaoSocial}
                          onChange={(e) => setNovoCliente(prev => ({ ...prev, razaoSocial: e.target.value }))}
                          className="h-12 rounded-xl border-slate-200"
                        />
                        <Button 
                          onClick={adicionarCliente}
                          className="w-full h-12 bg-slate-800 hover:bg-slate-900 rounded-xl font-bold"
                        >
                          Adicionar à Lista
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Clientes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#003b61]" /> Clientes Adicionados ({clientes.length})
                      </h3>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Pesquisar na lista..."
                          value={termoBusca}
                          onChange={(e) => setTermoBusca(e.target.value)}
                          className="pl-10 h-10 rounded-lg border-slate-200 text-sm"
                        />
                      </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto rounded-2xl border border-slate-100 bg-slate-50/50 p-2 space-y-2">
                      {clientesFiltrados.length > 0 ? (
                        clientesFiltrados.map((cliente) => (
                          <div key={cliente.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-[#003b61]/30 transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-[#003b61] font-bold text-xs">
                                {cliente.razaoSocial.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800 text-sm">{cliente.razaoSocial}</p>
                                <p className="text-xs text-slate-500">{cliente.cnpj}</p>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removerCliente(cliente.id)}
                              className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="py-12 text-center text-slate-400">
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>Nenhum cliente encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={enviarDados}
                    disabled={isLoading || clientes.length === 0}
                    className="w-full h-16 text-lg font-bold bg-[#003b61] hover:bg-[#00568c] shadow-lg shadow-[#003b61]/20 transition-all duration-300 rounded-xl"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Enviando Dados...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Send className="w-5 h-5" />
                        Finalizar e Enviar Atualização
                      </div>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ Section */}
        <section className="mt-20 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-[#003b61]">Dúvidas Frequentes</h2>
            <p className="text-slate-500">Tudo o que você precisa saber sobre a atualização cadastral.</p>
          </div>
          <div className="bg-[#eef6fb] p-8 rounded-[2rem] border border-blue-100 shadow-xl shadow-blue-900/5">
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden border border-blue-50 shadow-sm">
                  <button
                    onClick={() => setFaqAberto(faqAberto === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-700">{faq.pergunta}</span>
                    {faqAberto === index ? <ChevronUp className="w-5 h-5 text-[#003b61]" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {faqAberto === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.resposta }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé Institucional */}
      <footer className="bg-[#003b61] text-white pt-20 pb-10 mt-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400/30 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-white p-2 rounded-lg">
                  <Building className="w-8 h-8 text-[#003b61]" />
                </div>
                <h2 className="text-2xl font-bold tracking-tighter">SESCON-SP</h2>
              </div>
              <p className="text-blue-100/70 max-w-md leading-relaxed">
                Sindicato das Empresas de Serviços Contábeis e das Empresas de Assessoramento, Perícias, Informações e Pesquisas no Estado de São Paulo.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#003b61] transition-all duration-300"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#003b61] transition-all duration-300"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#003b61] transition-all duration-300"><Linkedin className="w-5 h-5" /></a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white hover:text-[#003b61] transition-all duration-300"><Youtube className="w-5 h-5" /></a>
              </div>
            </div>
            
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2">Contato</h3>
              <ul className="space-y-4 text-sm text-blue-100/70">
                <li className="flex items-center gap-3"><Phone className="w-4 h-4" /> (11) 3304-4400</li>
                <li className="flex items-center gap-3"><Mail className="w-4 h-4" /> cadastro@sescon.org.br</li>
                <li className="flex items-start gap-3"><MapPin className="w-4 h-4 mt-1" /> Av. Tiradentes, 998 - Luz<br/>São Paulo - SP</li>
              </ul>
            </div>

            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b border-white/10 pb-2">Links Úteis</h3>
              <ul className="space-y-3 text-sm text-blue-100/70">
                <li><a href="#" className="hover:text-white transition-colors">Portal do Associado</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cursos e Eventos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Convenções Coletivas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/10 text-center text-xs text-blue-100/40">
            <p>© 2026 SESCON-SP. Todos os direitos reservados. Desenvolvido para excelência no setor contábil.</p>
          </div>
        </div>
      </footer>

      {/* Dialog de Confirmação Final */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white rounded-3xl border-none shadow-2xl p-8">
          <AlertDialogHeader className="items-center text-center space-y-4">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="w-10 h-10" />
            </div>
            <AlertDialogTitle className="text-2xl font-bold text-slate-800">Envio Concluído!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-lg">
              Sua atualização cadastral foi recebida com sucesso. Um e-mail de confirmação foi enviado para <strong>{emailEscritorio}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8">
            <AlertDialogAction 
              onClick={() => window.location.reload()}
              className="w-full h-14 bg-[#003b61] hover:bg-[#00568c] text-lg font-bold rounded-xl"
            >
              Entendido
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

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
    pergunta: "Como saber quais são las categorias representadas pelo SESCON-SP?",
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 relative overflow-hidden">
      {/* Fundo Decorativo */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-blue-100/50 to-transparent pointer-events-none" />
      
      {/* Header com Logo */}
      <header className="w-full py-6 px-8 flex justify-between items-center relative z-10">
        <img 
          src="https://sescon.org.br/wp-content/uploads/2020/09/logo-sescon-sp.png" 
          alt="SESCON-SP" 
          className="h-16 object-contain"
        />
        <div className="text-right hidden md:block">
          <h1 className="text-xl font-bold text-[#003b61]">Central de Atualização</h1>
          <p className="text-xs text-slate-500 uppercase tracking-widest">Sindicato das Empresas de Serviços Contábeis</p>
        </div>
      </header>

      <main className="flex-grow max-w-5xl mx-auto w-full px-4 py-8 relative z-10">
        {/* Barra de Progresso */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm font-bold text-[#003b61]">Progresso do Cadastro</span>
            <span className="text-sm font-bold text-[#003b61]">{abaAtiva === "empresa" ? "50%" : "100%"}</span>
          </div>
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: abaAtiva === "empresa" ? "50%" : "100%" }}
              className="h-full bg-[#003b61]"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-8">
          <button
            onClick={() => setAbaAtiva("empresa")}
            className={`px-8 py-4 text-sm font-bold transition-all relative ${
              abaAtiva === "empresa" ? "text-[#003b61]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4" />
              Dados da Empresa
            </div>
            {abaAtiva === "empresa" && (
              <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-1 bg-[#003b61]" />
            )}
          </button>
          <button
            onClick={() => setAbaAtiva("clientes")}
            className={`px-8 py-4 text-sm font-bold transition-all relative ${
              abaAtiva === "clientes" ? "text-[#003b61]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Gestão de Clientes
            </div>
            {abaAtiva === "clientes" && (
              <motion.div layoutId="tab-active" className="absolute bottom-0 left-0 w-full h-1 bg-[#003b61]" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {abaAtiva === "empresa" ? (
            <motion.div
              key="empresa"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-2xl text-[#003b61]">Identificação da Empresa</CardTitle>
                  <CardDescription>Valide os dados do seu escritório para prosseguir.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">CNPJ do Escritório *</label>
                      <Input
                        placeholder="00.000.000/0000-00"
                        value={cnpjEscritorio}
                        onChange={(e) => {
                          setCnpjEscritorio(e.target.value);
                          buscarCNPJ(e.target.value);
                        }}
                        className="h-12 border-slate-200 focus:border-[#003b61] focus:ring-[#003b61]/10"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">Nome do Escritório *</label>
                      <Input
                        value={razaoSocialEscritorio}
                        readOnly
                        placeholder="Preenchido automaticamente"
                        className="h-12 bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">E-mail para Contato *</label>
                      <Input
                        type="email"
                        placeholder="contato@escritorio.com.br"
                        value={emailEscritorio}
                        disabled={!razaoSocialEscritorio}
                        onChange={(e) => setEmailEscritorio(e.target.value)}
                        className="h-12 border-slate-200 focus:border-[#003b61] focus:ring-[#003b61]/10"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={() => setAbaAtiva("clientes")}
                    disabled={!cnpjEscritorio || !razaoSocialEscritorio || !emailEscritorio}
                    className="w-full h-14 text-lg font-bold bg-[#003b61] hover:bg-[#00568c] transition-all"
                  >
                    Próximo
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="clientes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card className="border-none shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-2xl text-[#003b61]">Gestão de Clientes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Atividade Principal */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="text-sm font-bold text-slate-700 mb-3 block">Atividade Principal *</label>
                    <div className="flex gap-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="atividade"
                          value="contabilidade"
                          checked={atividadePrincipal === "contabilidade"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-4 h-4 text-[#003b61]"
                        />
                        <span className="text-sm font-medium">Contabilidade</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="atividade"
                          value="outros"
                          checked={atividadePrincipal === "outros"}
                          onChange={(e) => setAtividadePrincipal(e.target.value)}
                          className="w-4 h-4 text-[#003b61]"
                        />
                        <span className="text-sm font-medium">Outros</span>
                      </label>
                    </div>
                  </div>

                  {/* Importação e Adição */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Importar Planilha
                      </h3>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#003b61] transition-all cursor-pointer relative">
                        <input
                          type="file"
                          accept=".xlsx, .xls"
                          onChange={handleFileUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <p className="text-sm text-slate-500">Clique ou arraste sua planilha aqui</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Plus className="w-4 h-4" /> Adicionar Manual
                      </h3>
                      <div className="space-y-2">
                        <Input
                          placeholder="CNPJ do Cliente"
                          value={novoCliente.cnpj}
                          onChange={(e) => {
                            setNovoCliente(prev => ({ ...prev, cnpj: e.target.value }));
                            buscarCNPJCliente(e.target.value);
                          }}
                          className="h-10"
                        />
                        <Input
                          placeholder="Razão Social"
                          value={novoCliente.razaoSocial}
                          onChange={(e) => setNovoCliente(prev => ({ ...prev, razaoSocial: e.target.value }))}
                          className="h-10"
                        />
                        <Button 
                          onClick={adicionarCliente}
                          className="w-full h-10 bg-slate-800 hover:bg-slate-900"
                        >
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Clientes */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800">Clientes Adicionados ({clientes.length})</h3>
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          placeholder="Pesquisar..."
                          value={termoBusca}
                          onChange={(e) => setTermoBusca(e.target.value)}
                          className="pl-10 h-9 text-sm"
                        />
                      </div>
                    </div>

                    <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 space-y-2">
                      {clientesFiltrados.map((cliente) => (
                        <div key={cliente.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center justify-between group">
                          <div>
                            <p className="font-bold text-slate-800 text-sm">{cliente.razaoSocial}</p>
                            <p className="text-xs text-slate-500">{cliente.cnpj}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removerCliente(cliente.id)}
                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={enviarDados}
                    disabled={isLoading || clientes.length === 0}
                    className="w-full h-14 text-lg font-bold bg-[#003b61] hover:bg-[#00568c] transition-all"
                  >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Enviar Atualização"}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQ */}
        <section className="mt-16 space-y-6">
          <h2 className="text-2xl font-bold text-[#003b61] text-center">Perguntas Frequentes</h2>
          <div className="bg-[#eef6fb] p-6 rounded-2xl border border-blue-100">
            <div className="space-y-2">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden border border-blue-50">
                  <button
                    onClick={() => setFaqAberto(faqAberto === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-bold text-slate-700 text-sm">{faq.pergunta}</span>
                    {faqAberto === index ? <ChevronUp className="w-4 h-4 text-[#003b61]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  <AnimatePresence>
                    {faqAberto === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-4"
                      >
                        <div className="p-4 bg-slate-50 rounded-lg border border-slate-100 text-slate-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: faq.resposta }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Rodapé com Logo */}
      <footer className="w-full py-12 px-8 bg-white border-t border-slate-200 mt-12 flex flex-col items-center gap-6 relative z-10">
        <img 
          src="https://sescon.org.br/wp-content/uploads/2020/09/logo-sescon-sp.png" 
          alt="SESCON-SP" 
          className="h-12 object-contain opacity-50 grayscale hover:grayscale-0 transition-all"
        />
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium">© 2026 SESCON-SP. Todos os direitos reservados.</p>
          <div className="flex gap-4 justify-center text-slate-400">
            <Instagram className="w-4 h-4 cursor-pointer hover:text-[#003b61]" />
            <Facebook className="w-4 h-4 cursor-pointer hover:text-[#003b61]" />
            <Linkedin className="w-4 h-4 cursor-pointer hover:text-[#003b61]" />
          </div>
        </div>
      </footer>

      {/* Dialog de Sucesso */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="bg-white rounded-2xl border-none shadow-2xl">
          <AlertDialogHeader className="items-center text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">Dados Enviados!</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600">
              Sua atualização foi processada. Um e-mail de confirmação foi enviado para o endereço informado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogAction 
              onClick={() => window.location.reload()}
              className="w-full h-12 bg-[#003b61] hover:bg-[#00568c] font-bold rounded-lg"
            >
              Concluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

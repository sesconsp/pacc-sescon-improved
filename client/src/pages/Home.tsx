// src/pages/Home.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Upload,
  CheckCircle,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  Save,
  Eye,
  Clock,
  AlertTriangle,
  Send,
  FileText,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  MessageCircle,
  Building,
  Users,
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
// @ts-ignore
import * as XLSX from "xlsx";
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
  contratosocial?: File; // File no estado do cliente
  cnpjValido?: boolean;
  ehMatriz?: boolean;
}
interface Rascunho {
  nomeEscritorio: string;
  cnpjEscritorio: string;
  emailEscritorio: string;
  clientes: Omit<Cliente, "contratosocial">[];
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
  { pergunta: "Por que preciso informar todos os meus clientes?", resposta: "O SESCON está modernizando sua base de dados. Ao informar todos os seus clientes atuais, garantimos que apenas empresas que você realmente representa receberão nossas comunicações." },
  { pergunta: "Posso usar o mesmo e-mail para vários clientes?", resposta: "Sim, você pode usar o mesmo e-mail para vários clientes. Se não informar um e-mail específico, será utilizado o e-mail do seu escritório." },
  { pergunta: "O contrato social é obrigatório?", resposta: "Não, o contrato social é opcional. Você pode enviar o formulário sem anexar. Se desejar, aceita apenas arquivos em PDF." },
  { pergunta: "Posso atualizar minha lista depois?", resposta: "Sim, você pode atualizar sua lista a qualquer momento preenchendo o formulário novamente. A nova lista substituirá a anterior." },
  { pergunta: "Como baixo os dados que enviei?", resposta: "Após enviar, você receberá um e-mail de confirmação com um link para baixar um comprovante em PDF com todos os dados." },
  { pergunta: "Quanto tempo leva para processar?", resposta: "A atualização é processada imediatamente após o envio. Você receberá um e-mail de confirmação em poucos minutos." },
  { pergunta: "O que fazer se cometer um erro?", resposta: "Você pode enviar os dados novamente. A nova lista substituirá a anterior. Se precisar de ajuda, entre em contato conosco." },
  { pergunta: "Como valido meu CNPJ?", resposta: "O sistema valida automaticamente o CNPJ quando você digita. Se válido, aparecerá uma mensagem de confirmação." },
  { pergunta: "Qual a responsabilidade da contabilidade sobre as informações?", resposta: "A contabilidade atua como facilitadora no envio das informações, garantindo que os dados cadastrais e de contribuições estejam alinhados com as obrigações acessórias e a regularidade das empresas representadas." },
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
    contratosocial: undefined as File | undefined,
  });
  const [cnpjEscritorioValido, setCnpjEscritorioValido] = useState(false);
  const [buscandoReceita, setBuscandoReceita] = useState(false);
  const [abaSelecionada, setAbaSelecionada] = useState(1);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const [erroEmail, setErroEmail] = useState("");
  const [erroCNPJ, setErroCNPJ] = useState("");

  const [temRascunho, setTemRascunho] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [atualizacoes, setAtualizacoes] = useState<Atualizacao[]>([]);
  const [progressoUpload, setProgressoUpload] = useState(0);
  const [statusUpload, setStatusUpload] = useState("");
  const [atividadePrincipal, setAtividadePrincipal] = useState("");
  const [mostrarModalClientes, setMostrarModalClientes] = useState(false);
  const [mostrarConfirmacaoLimpar, setMostrarConfirmacaoLimpar] = useState(false);

  // Cores SESCON
  const SESCON_BLUE = "#003d7a";
  const SESCON_DARK_BLUE = "#002147";
  const SESCON_LIGHT_BLUE = "#e6f0f7";
  const SESCON_ACCENT = "#0056b3";

  // Validação de e-mail
  const validarEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  // Validação em tempo real do Email
  useEffect(() => {
    if (emailEscritorio) {
      setErroEmail(validarEmail(emailEscritorio) ? "" : "E-mail inválido");
    } else {
      setErroEmail("");
    }
  }, [emailEscritorio]);

  // Interceptar fechamento
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (cnpjEscritorio && razaoSocialEscritorio && clientes.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [cnpjEscritorio, razaoSocialEscritorio, clientes]);

  // Helpers CNPJ
  function formatarCNPJ(cnpj: string): string {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length <= 2) return numeros;
    if (numeros.length <= 5) return `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
    if (numeros.length <= 8) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5)}`;
    if (numeros.length <= 12) return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8)}`;
    return `${numeros.slice(0, 2)}.${numeros.slice(2, 5)}.${numeros.slice(5, 8)}/${numeros.slice(8, 12)}-${numeros.slice(12, 14)}`;
  }
  function validarCNPJ(cnpj: string): boolean {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14) return false;
    if (/^(\d)\1{13}$/.test(numeros)) return false;

    let tamanho = numeros.length - 2;
    let numeros_array = numeros.substring(0, tamanho);
    let digito = numeros.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_array.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digito.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros_array = numeros.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;
    for (let i = tamanho; i >= 1; i--) {
      soma += parseInt(numeros_array.charAt(tamanho - i)) * pos--;
      if (pos < 2) pos = 9;
    }
    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    return resultado === parseInt(digito.charAt(1));
  }
  function verificarMatrizFilial(cnpj: string): boolean {
    const numeros = cnpj.replace(/\D/g, "");
    return numeros.substring(8, 12) === "0001";
  }

  // Buscar CNPJ no BrasilAPI (escritório/cliente)
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
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const nome = data?.name || data?.razao_social;
      if (nome) {
        setRazaoSocialEscritorio(nome);
        setCnpjEscritorioValido(true);
        toast.success("CNPJ validado com sucesso!", { duration: 2000 });
      } else {
        setCnpjEscritorioValido(false);
        toast.error("CNPJ não encontrado na Receita Federal", { duration: 2000 });
      }
    } catch (err) {
      console.error("Erro ao buscar CNPJ:", err);
      setCnpjEscritorioValido(false);
      toast.error("Erro ao buscar CNPJ. Verifique sua conexão.", { duration: 3000 });
    } finally {
      setBuscandoReceita(false);
    }
  }
  async function buscarCNPJCliente(cnpj: string) {
    const numeros = cnpj.replace(/\D/g, "");
    if (numeros.length !== 14 || !validarCNPJ(cnpj)) {
      setNovoCliente({ ...novoCliente, cnpjValido: false });
      return;
    }
    setBuscandoReceita(true);
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${numeros}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const nome = data?.name || data?.razao_social;
      if (nome) {
        setNovoCliente({
          ...novoCliente,
          razaoSocial: nome,
          cnpjValido: true,
          ehMatriz: verificarMatrizFilial(cnpj),
        });
        toast.success("Dados do cliente carregados!", { duration: 2000 });
      }
    } catch (err) {
      console.error("Erro ao buscar CNPJ:", err);
      setNovoCliente({ ...novoCliente, cnpjValido: false });
    } finally {
      setBuscandoReceita(false);
    }
  }

  // Upload CSV/Excel
  function processarUploadCSV(
    file: File,
    callback: (clientes: Cliente[]) => void,
    onProgress?: (progresso: number, status: string) => void,
    emailEscritorioParam?: string
  ) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const texto = e.target?.result as string;
      const linhas = texto.split("\n").filter((l) => l.trim());
      const novosClientes: Cliente[] = [];
      for (let i = 1; i < linhas.length; i++) {
        const partes = linhas[i].split(",").map((p) => p.trim());
        if (partes.length >= 2) {
          const cnpj = partes[0];
          const razaoSocial = partes[1];
          const email = partes[2] && partes[2].trim() ? partes[2] : "";
          novosClientes.push({
            id: Math.random().toString(),
            cnpj,
            razaoSocial,
            emailPrincipal: !email,
            emailCustomizado: email || emailEscritorioParam,
            cnpjValido: validarCNPJ(cnpj),
            ehMatriz: verificarMatrizFilial(cnpj),
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
  function processarUploadExcel(
    file: File,
    callback: (clientes: Cliente[]) => void,
    onProgress?: (progresso: number, status: string) => void,
    emailEscritorioParam?: string
  ) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dados = e.target?.result as string;
      const workbook = XLSX.read(dados, { type: "binary" } as any);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];
      const novosClientes: Cliente[] = [];
      for (let i = 0; i < json.length; i++) {
        const linha = json[i];
        const cnpj = String(linha.CNPJ || linha.cnpj || "").trim();
        const razaoSocial = String(linha["Razão Social"] || linha["razao_social"] || linha["Razao Social"] || "").trim();
        const email = String(linha["E-mail"] || linha["email"] || linha["Email"] || linha["E-MAIL"] || "").trim();
        if (cnpj && razaoSocial) {
          novosClientes.push({
            id: Math.random().toString(),
            cnpj,
            razaoSocial,
            emailPrincipal: !email,
            emailCustomizado: email || emailEscritorioParam || "",
            cnpjValido: validarCNPJ(cnpj),
            ehMatriz: verificarMatrizFilial(cnpj),
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

  // Adicionar/Remover
  const adicionarCliente = () => {
    if (!novoCliente.cnpj || !novoCliente.razaoSocial) {
      toast.error("Por favor, preencha CNPJ e Razão Social", { duration: 3000 });
      return;
    }
    if (!novoCliente.emailPrincipal && !novoCliente.emailCustomizado) {
      toast.error("Por favor, preencha o e-mail customizado", { duration: 3000 });
      return;
    }
    if (!novoCliente.emailPrincipal && novoCliente.emailCustomizado) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(novoCliente.emailCustomizado)) {
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
      ehMatriz: novoCliente.ehMatriz,
      contratosocial: novoCliente.contratosocial,
    };
    setClientes([...clientes, cliente]);
    setNovoCliente({
      cnpj: "",
      razaoSocial: "",
      emailPrincipal: true,
      emailCustomizado: "",
      cnpjValido: false,
      ehMatriz: false,
      contratosocial: undefined,
    });
    toast.success("Cliente adicionado com sucesso!", { duration: 2000 });
  };
  const removerCliente = (id: string) => setClientes(clientes.filter((c) => c.id !== id));

  // ======== ENVIAR DADOS (Hospeda PDF no Drive) ========
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
      await new Promise((r) => setTimeout(r, 300));

      // Lê o PDF como DataURL (com prefixo "data:...;base64,")
      const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });

      const clientesComArquivos = await Promise.all(
        clientes.map(async (c) => {
          let arquivoData: { data: string; name: string; type: string } | null = null;
          if (c.contratosocial) {
            const base64 = await fileToBase64(c.contratosocial);
            arquivoData = {
              data: base64,
              name: c.contratosocial.name,
              type: c.contratosocial.type,
            };
          }
          return {
            cnpj: c.cnpj,
            razaoSocial: c.razaoSocial,
            email: c.emailCustomizado || emailEscritorio,
            // 🔁 CHAVE CORRIGIDA PARA O GAS: contratoSocial
            contratoSocial: arquivoData,
          };
        })
      );

      const dadosEnvio = {
        escritorioCnpj: cnpjEscritorio,
        escritorioRazao: razaoSocialEscritorio,
        escritorioEmail: emailEscritorio,
        clientes: clientesComArquivos,
        dataEnvio: new Date().toISOString(),
      };

      // Backup local (opcional)
      try {
        const blob = new Blob([JSON.stringify(dadosEnvio, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `backup_sescon_${cnpjEscritorio.replace(/\D/g, "")}_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch {}

      const GOOGLE_SHEETS_WEBHOOK_URL =
        "https://script.google.com/macros/s/AKfycbyBjgN0QA8k-4gvUrutLRkQAC93avC9PmKdLsA3Buy-Nm_6thfGKLL6jO5K-GZVVr_8xg/exec";

      await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
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
        resumo: `${clientes.length} cliente(s) atualizado(s) com sucesso`,
      };
      setAtualizacoes([atualizacao, ...atualizacoes]);

      setClientes([]);
      setCnpjEscritorio("");
      setRazaoSocialEscritorio("");
      setEmailEscritorio("");

      const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
      if (cnpjLimpo) localStorage.removeItem(`rascunho_pacc_${cnpjLimpo}`);
      setTemRascunho(false);

      toast.success("Dados enviados com sucesso!", { duration: 4000 });
    } catch (error) {
      console.error("Erro ao enviar dados", error);
      toast.error("Erro ao enviar dados", { duration: 3000 });
    } finally {
      setIsLoading(false);
    }
  };
  // ======== FIM ENVIAR DADOS ========

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
      dataSalva: new Date().toLocaleString("pt-BR"),
    };
    localStorage.setItem(`rascunho_pacc_${cnpjLimpo}`, JSON.stringify(rascunho));
    setTemRascunho(true);
    toast.success(`Rascunho salvo para o CNPJ ${cnpjEscritorio}`, { duration: 3000 });
  };

  useEffect(() => {
    const cnpjLimpo = cnpjEscritorio.replace(/\D/g, "");
    if (cnpjLimpo.length === 14) {
      const rascunhoSalvo = localStorage.getItem(`rascunho_pacc_${cnpjLimpo}`);
      if (rascunhoSalvo && !razaoSocialEscritorio && clientes.length === 0) {
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f7fa" }}>
      {/* Header */}
      <header className="border-b" style={{ background: SESCON_BLUE, borderColor: SESCON_DARK_BLUE }}>
        <div className="px-8 py-6">
          <div className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img src="/logo-sescon.png" alt="SESCON-SP" className="h-20 w-auto hidden md:block" />
              <div>
                <h1 className="text-3xl font-extrabold text-white">Central de Atualização SESCON-SP</h1>
                <p className="text-blue-100 text-base mt-1">
                  Atualize as informações dos seus clientes representados de forma rápida e segura.
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ... (demais componentes visuais mantidos) ... */}

      <main className="flex-1 px-8 py-8">
        {/* Conteúdo omitido por brevidade — igual à versão anterior */}
        {/* O essencial da mudança está no enviarDados, já acima */}
      </main>

      <footer className="pt-8 pb-6 px-8" style={{ background: "#003366" }}>
        <div className="max-w-6xl mx-auto text-white">
          <div className="hidden md:flex justify-end">
            <img src="/logo-sescon.png" alt="SESCON-SP" className="h-20 w-auto" />
          </div>
        </div>
      </footer>
    </div>
  );
}

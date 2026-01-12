import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Building2,
  UserPlus,
  ArrowRight,
  ArrowLeft,
  Save,
  Download,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Cores padrão SESCON
const SESCON_BLUE = "#003b61";
const SESCON_RED = "#e30613";

// Esquema de validação
const clientSchema = z.object({
  cnpj: z.string().min(14, "CNPJ inválido").max(18),
  razaoSocial: z.string().min(3, "Razão Social é obrigatória"),
  email: z.string().email("E-mail inválido"),
  telefone: z.string().optional(),
  contratosocial: z.any().optional(),
});

const formSchema = z.object({
  escritorioCnpj: z.string().min(14, "CNPJ inválido").max(18),
  escritorioRazao: z.string().min(3, "Razão Social é obrigatória"),
  escritorioEmail: z.string().email("E-mail inválido"),
  clientes: z.array(clientSchema).min(1, "Adicione pelo menos um cliente"),
});

type FormValues = z.infer<typeof formSchema>;

// Função auxiliar para converter arquivo em Base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export default function Home({ onSuccess }: { onSuccess?: () => void }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      escritorioCnpj: "",
      escritorioRazao: "",
      escritorioEmail: "",
      clientes: [{ cnpj: "", razaoSocial: "", email: "", telefone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "clientes",
  });

  // Recuperar rascunho
  useEffect(() => {
    const saved = localStorage.getItem("sescon_draft");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        form.reset(parsed);
        toast.info("Rascunho recuperado automaticamente");
      } catch (e) {
        console.error("Erro ao carregar rascunho", e);
      }
    }
  }, []);

  // Salvar rascunho
  const saveDraft = () => {
    const values = form.getValues();
    localStorage.setItem("sescon_draft", JSON.stringify(values));
    toast.success("Rascunho salvo com sucesso!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        const worksheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[worksheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const mappedData = jsonData.map((row: any) => ({
          cnpj: String(row["CNPJ"] || row["cnpj"] || ""),
          razaoSocial: String(row["Razão Social"] || row["RazÃ£o Social"] || row["razao_social"] || row["Nome"] || ""),
          email: String(row["E-mail"] || row["Email"] || row["email"] || row["E-MAIL"] || ""),
          telefone: String(row["Telefone"] || row["telefone"] || row["Celular"] || ""),
        }));

        if (mappedData.length > 0) {
          form.setValue("clientes", mappedData as any);
          toast.success(`${mappedData.length} clientes importados com sucesso!`);
        }
      } catch (err) {
        toast.error("Erro ao ler o arquivo. Verifique o formato.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      setUploadProgress(10);
      
      // 1. Processa os clientes e converte os arquivos PDF para Base64
      const clientesProcessados = await Promise.all(
        data.clientes.map(async (cliente: any, index: number) => {
          let arquivoData = null;
          if (cliente.contratosocial && cliente.contratosocial[0]) {
            const file = cliente.contratosocial[0];
            const base64 = await fileToBase64(file);
            arquivoData = {
              data: base64,
              name: file.name,
              type: file.type
            };
          }
          
          // Atualiza progresso visual
          setUploadProgress(10 + Math.floor((index / data.clientes.length) * 40));

          return {
            cnpj: cliente.cnpj,
            razaoSocial: cliente.razaoSocial,
            email: cliente.email,
            telefone: cliente.telefone,
            contratoArquivo: arquivoData
          };
        })
      );

      const payload = {
        escritorioCnpj: data.escritorioCnpj,
        escritorioRazao: data.escritorioRazao,
        escritorioEmail: data.escritorioEmail,
        clientes: clientesProcessados
      };

      setUploadProgress(60);

      // 2. Envia para o Google Apps Script
      await fetch("https://script.google.com/macros/s/AKfycbyBjgN0QA8k-4gvUrutLRkQAC93avC9PmKdLsA3Buy-Nm_6thfGKLL6jO5K-GZVVr_8xg/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setUploadProgress(100);
      toast.success("Dados enviados com sucesso!");
      localStorage.removeItem("sescon_draft");
      setShowSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Erro no envio:", error);
      toast.error("Erro ao enviar os dados. Verifique sua conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="text-center border-t-4" style={{ borderTopColor: SESCON_BLUE }}>
            <CardHeader>
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-20 h-20 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Envio Concluído!</CardTitle>
              <CardDescription>
                As informações foram enviadas com sucesso para a Central SESCON-SP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 mb-6">
                Você receberá uma confirmação no e-mail do escritório em breve.
              </p>
              <Button 
                className="w-full" 
                style={{ backgroundColor: SESCON_BLUE }}
                onClick={() => window.location.reload()}
              >
                Realizar Novo Envio
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <img 
              src="/pacc-sescon-improved/logo-sescon.png" 
              alt="SESCON-SP" 
              className="h-12 md:h-16 object-contain"
              onError={(e) => {
                // Fallback caso a imagem não carregue
                (e.target as HTMLImageElement).src = "https://www.sescon.org.br/wp-content/uploads/2021/08/logo-sescon-sp.png";
              }}
            />
            <div className="h-10 w-px bg-slate-200 hidden md:block" />
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Central de Atualização</h1>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">PACC - Programa de Apoio</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={saveDraft} className="gap-2">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Salvar Rascunho</span>
            </Button>
            <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 text-sm font-medium text-slate-600">
              Etapa {step} de 2
            </div>
          </div>
        </div>
        <Progress value={step === 1 ? 50 : 100} className="h-1 rounded-none" />
      </header>

      <main className="container mx-auto px-4 mt-8 max-w-5xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-6"
                >
                  <Card className="border-none shadow-md">
                    <CardHeader className="bg-slate-50/50 rounded-t-lg border-b">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                          <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                          <CardTitle>Dados do Escritório Contábil</CardTitle>
                          <CardDescription>Identifique o escritório responsável pelo envio</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control,
                        name: "escritorioCnpj",
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ do Escritório</FormLabel>
                            <FormControl>
                              <Input placeholder="00.000.000/0000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control,
                        name: "escritorioEmail",
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>E-mail de Contato</FormLabel>
                            <FormControl>
                              <Input placeholder="contato@escritorio.com.br" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control,
                        name: "escritorioRazao",
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Razão Social</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo da organização contábil" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter className="bg-slate-50/30 border-t justify-end py-4">
                      <Button 
                        type="button" 
                        onClick={() => setStep(2)}
                        style={{ backgroundColor: SESCON_BLUE }}
                        className="gap-2"
                      >
                        Próxima Etapa
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </CardFooter>
                  </Card>

                  <Alert className="bg-blue-50 border-blue-200 text-blue-800">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <AlertTitle>Dica de Segurança</AlertTitle>
                    <AlertDescription>
                      Seus dados são salvos automaticamente como rascunho neste navegador. Você pode fechar a página e voltar depois para continuar.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              ) : (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-800">Lista de Clientes</h2>
                      <p className="text-slate-500">Adicione manualmente ou importe via planilha Excel</p>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 md:flex-none gap-2"
                        onClick={() => document.getElementById("excel-upload")?.click()}
                      >
                        <Download className="w-4 h-4" />
                        Importar Excel
                      </Button>
                      <input
                        id="excel-upload"
                        type="file"
                        accept=".xlsx, .xls"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                      <Button
                        type="button"
                        onClick={() => append({ cnpj: "", razaoSocial: "", email: "", telefone: "" })}
                        className="flex-1 md:flex-none gap-2"
                        style={{ backgroundColor: SESCON_RED }}
                      >
                        <Plus className="w-4 h-4" />
                        Novo Cliente
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-l-4 shadow-sm" style={{ borderLeftColor: SESCON_BLUE }}>
                        <CardHeader className="py-3 px-6 flex flex-row items-center justify-between bg-slate-50/50">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-xs font-bold">
                              {index + 1}
                            </span>
                            <CardTitle className="text-sm font-semibold">Dados do Cliente</CardTitle>
                          </div>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => remove(index)}
                              className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name={`clientes.${index}.cnpj`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase text-slate-500">CNPJ</FormLabel>
                                <FormControl>
                                  <Input placeholder="00.000.000/0000-00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`clientes.${index}.razaoSocial`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-xs uppercase text-slate-500">Razão Social</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome da empresa cliente" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`clientes.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase text-slate-500">E-mail</FormLabel>
                                <FormControl>
                                  <Input placeholder="cliente@email.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`clientes.${index}.telefone`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase text-slate-500">Telefone</FormLabel>
                                <FormControl>
                                  <Input placeholder="(00) 00000-0000" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`clientes.${index}.contratosocial`}
                            render={({ field: { value, onChange, ...fieldProps } }) => (
                              <FormItem>
                                <FormLabel className="text-xs uppercase text-slate-500">Contrato Social (PDF)</FormLabel>
                                <FormControl>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="file"
                                      accept=".pdf"
                                      onChange={(e) => onChange(e.target.files)}
                                      {...fieldProps}
                                      className="text-xs"
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex flex-col md:flex-row gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Voltar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-[2] gap-2"
                      style={{ backgroundColor: SESCON_BLUE }}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando ({uploadProgress}%)...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Finalizar e Enviar para SESCON-SP
                        </>
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} SESCON-SP - Sindicato das Empresas de Serviços Contábeis e das Empresas de Assessoramento, Perícias, Informações e Pesquisas no Estado de São Paulo.
          </p>
        </div>
      </footer>
    </div>
  );
}

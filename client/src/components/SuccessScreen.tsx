import { motion } from "framer-motion";
import { CheckCircle, Download, RefreshCw, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface SuccessScreenProps {
  protocolo: string;
  totalClientes: number;
  emailEscritorio: string;
  onReset: () => void;
}

export function SuccessScreen({ protocolo, totalClientes, emailEscritorio, onReset }: SuccessScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-2xl mx-auto p-4"
    >
      <Card className="w-full border-2 border-green-100 shadow-xl bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-green-800">Envio Realizado com Sucesso!</CardTitle>
          <p className="text-muted-foreground mt-2">
            Os dados do seu escritório e de seus clientes foram processados.
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4 pb-4 border-b border-slate-200">
              <div className="text-center md:text-left">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Protocolo</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{protocolo}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total de Clientes</p>
                <p className="text-2xl font-bold text-slate-800">{totalClientes}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <Download className="w-4 h-4 mt-0.5 text-blue-600" />
                <p>Um arquivo de backup (<strong>.json</strong>) foi baixado automaticamente no seu computador.</p>
              </div>
              <div className="flex items-start gap-2">
                <FileText className="w-4 h-4 mt-0.5 text-blue-600" />
                <p>Seus dados também foram enviados para nossa base segura.</p>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Uma confirmação foi enviada para: <span className="font-medium text-slate-900">{emailEscritorio}</span>
          </div>
        </CardContent>

        <CardFooter className="flex justify-center pt-2 pb-8">
          <Button 
            onClick={onReset} 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-8"
          >
            <RefreshCw className="w-4 h-4" />
            Enviar Novo Lote
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Calendar, MapPin, Clock, Users } from "lucide-react";
import { Link } from "react-router-dom";

const formSchema = z.object({
  nome_completo: z.string().min(1, "Nome completo é obrigatório").max(100),
  email_corporativo: z
    .string()
    .min(1, "E-mail é obrigatório")
    .email("E-mail inválido")
    .max(255),
  departamento: z.string().min(1, "Departamento é obrigatório"),
  nivel_automacao: z.string().min(1, "Nível de familiaridade é obrigatório"),
  acessibilidade: z.boolean(),
  descricao_acessibilidade: z.string().optional(),
  dia_participacao: z.string().min(1, "Dia de participação é obrigatório"),
  observacoes: z.string().max(1000).optional(),
});

type FormData = z.infer<typeof formSchema>;

const Index = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      acessibilidade: false,
    },
  });

  const acessibilidade = watch("acessibilidade");

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.from("inscricoes_treinamento").insert({
        nome_completo: data.nome_completo,
        email_corporativo: data.email_corporativo,
        departamento: data.departamento,
        nivel_automacao: data.nivel_automacao,
        acessibilidade: data.acessibilidade,
        descricao_acessibilidade: data.descricao_acessibilidade || null,
        dia_participacao: data.dia_participacao,
        observacoes: data.observacoes || null,
      });

      if (error) throw error;

      setIsSubmitted(true);
      reset();
    } catch (error) {
      toast({
        title: "Erro ao enviar inscrição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center">
          <CardContent className="pt-8 pb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Inscrição realizada com sucesso!
            </h2>
            <p className="text-muted-foreground mb-6">
              Agradecemos sua participação. Nos vemos no treinamento!
            </p>
            <Button onClick={() => setIsSubmitted(false)}>
              Nova Inscrição
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header text-primary-foreground py-12 px-4 relative">
        <Link
          to="/rh"
          className="absolute top-4 right-4 flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          <Users className="w-4 h-4" />
          Área do RH
        </Link>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Inscrição Interna – Treinamento Dominando a Automação e
            Microinterações
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Fique por dentro das tendências de automação, aumente sua
            produtividade e eleve suas habilidades profissionais.
          </p>
        </div>
      </header>

      {/* Info Cards */}
      <div className="max-w-4xl mx-auto px-4 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-card shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Calendar className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Datas</p>
                <p className="text-sm text-muted-foreground">
                  11, 12 e 13 de Dezembro
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Horário</p>
                <p className="text-sm text-muted-foreground">10h</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <MapPin className="w-8 h-8 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Local</p>
                <p className="text-sm text-muted-foreground">
                  Sala de Treinamento 25
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form */}
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">
              Formulário de Inscrição
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Nome Completo */}
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  placeholder="Digite seu nome completo"
                  {...register("nome_completo")}
                />
                {errors.nome_completo && (
                  <p className="text-sm text-destructive">
                    {errors.nome_completo.message}
                  </p>
                )}
              </div>

              {/* E-mail Corporativo */}
              <div className="space-y-2">
                <Label htmlFor="email_corporativo">E-mail Corporativo *</Label>
                <Input
                  id="email_corporativo"
                  type="email"
                  placeholder="seuemail@nexora.com"
                  {...register("email_corporativo")}
                />
                {errors.email_corporativo && (
                  <p className="text-sm text-destructive">
                    {errors.email_corporativo.message}
                  </p>
                )}
              </div>

              {/* Departamento */}
              <div className="space-y-2">
                <Label>Departamento/Área *</Label>
                <Select onValueChange={(value) => setValue("departamento", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="RH">RH</SelectItem>
                    <SelectItem value="TI">TI</SelectItem>
                    <SelectItem value="Vendas">Vendas</SelectItem>
                    <SelectItem value="Operações">Operações</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
                {errors.departamento && (
                  <p className="text-sm text-destructive">
                    {errors.departamento.message}
                  </p>
                )}
              </div>

              {/* Nível de Automação */}
              <div className="space-y-3">
                <Label>Nível de Familiaridade com Automação *</Label>
                <RadioGroup
                  onValueChange={(value) => setValue("nivel_automacao", value)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Baixo" id="baixo" />
                    <Label htmlFor="baixo" className="font-normal cursor-pointer">
                      Baixo
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Médio" id="medio" />
                    <Label htmlFor="medio" className="font-normal cursor-pointer">
                      Médio
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Alto" id="alto" />
                    <Label htmlFor="alto" className="font-normal cursor-pointer">
                      Alto
                    </Label>
                  </div>
                </RadioGroup>
                {errors.nivel_automacao && (
                  <p className="text-sm text-destructive">
                    {errors.nivel_automacao.message}
                  </p>
                )}
              </div>

              {/* Acessibilidade */}
              <div className="space-y-3">
                <Label>Precisa de Acessibilidade Especial? *</Label>
                <RadioGroup
                  onValueChange={(value) =>
                    setValue("acessibilidade", value === "sim")
                  }
                  defaultValue="nao"
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sim" id="acess-sim" />
                    <Label htmlFor="acess-sim" className="font-normal cursor-pointer">
                      Sim
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="nao" id="acess-nao" />
                    <Label htmlFor="acess-nao" className="font-normal cursor-pointer">
                      Não
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Descrição Acessibilidade */}
              {acessibilidade && (
                <div className="space-y-2">
                  <Label htmlFor="descricao_acessibilidade">
                    Descreva sua necessidade de acessibilidade
                  </Label>
                  <Textarea
                    id="descricao_acessibilidade"
                    placeholder="Descreva sua necessidade..."
                    {...register("descricao_acessibilidade")}
                  />
                </div>
              )}

              {/* Dia de Participação */}
              <div className="space-y-2">
                <Label>Dia que irá participar *</Label>
                <Select
                  onValueChange={(value) => setValue("dia_participacao", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o dia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="11/12">11/12 (Quarta-feira)</SelectItem>
                    <SelectItem value="12/12">12/12 (Quinta-feira)</SelectItem>
                    <SelectItem value="13/12">13/12 (Sexta-feira)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.dia_participacao && (
                  <p className="text-sm text-destructive">
                    {errors.dia_participacao.message}
                  </p>
                )}
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações/Dúvidas (opcional)</Label>
                <Textarea
                  id="observacoes"
                  placeholder="Alguma dúvida ou observação?"
                  {...register("observacoes")}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
                {isLoading ? "Enviando..." : "Enviar Inscrição"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Index;

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Users,
  Calendar,
  Building2,
  Accessibility,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Inscricao {
  id: string;
  nome_completo: string;
  email_corporativo: string;
  departamento: string;
  nivel_automacao: string;
  acessibilidade: boolean;
  descricao_acessibilidade: string | null;
  dia_participacao: string;
  observacoes: string | null;
  data_envio: string;
}

const COLORS = [
  "hsl(213, 94%, 35%)",
  "hsl(199, 89%, 48%)",
  "hsl(171, 77%, 39%)",
  "hsl(43, 96%, 56%)",
  "hsl(0, 84%, 60%)",
];

const RHAdmin = () => {
  const [inscricoes, setInscricoes] = useState<Inscricao[]>([]);
  const [filteredInscricoes, setFilteredInscricoes] = useState<Inscricao[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInscricoes();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("inscricoes-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "inscricoes_treinamento",
        },
        () => {
          fetchInscricoes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const filtered = inscricoes.filter(
      (i) =>
        i.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        i.email_corporativo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredInscricoes(filtered);
  }, [searchTerm, inscricoes]);

  const fetchInscricoes = async () => {
    const { data, error } = await supabase
      .from("inscricoes_treinamento")
      .select("*")
      .order("data_envio", { ascending: false });

    if (!error && data) {
      setInscricoes(data);
      setFilteredInscricoes(data);
    }
    setLoading(false);
  };

  const exportCSV = () => {
    const headers = [
      "Nome Completo",
      "E-mail",
      "Departamento",
      "Nível Automação",
      "Acessibilidade",
      "Descrição Acessibilidade",
      "Dia Participação",
      "Observações",
      "Data Envio",
    ];

    const csvContent = [
      headers.join(","),
      ...inscricoes.map((i) =>
        [
          `"${i.nome_completo}"`,
          `"${i.email_corporativo}"`,
          `"${i.departamento}"`,
          `"${i.nivel_automacao}"`,
          i.acessibilidade ? "Sim" : "Não",
          `"${i.descricao_acessibilidade || ""}"`,
          `"${i.dia_participacao}"`,
          `"${i.observacoes || ""}"`,
          new Date(i.data_envio).toLocaleString("pt-BR"),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "inscricoes_treinamento.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Dashboard data
  const departamentosData = inscricoes.reduce((acc, i) => {
    const existing = acc.find((d) => d.name === i.departamento);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: i.departamento, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const diasData = [
    { dia: "11/12", inscritos: inscricoes.filter((i) => i.dia_participacao === "11/12").length },
    { dia: "12/12", inscritos: inscricoes.filter((i) => i.dia_participacao === "12/12").length },
    { dia: "13/12", inscritos: inscricoes.filter((i) => i.dia_participacao === "13/12").length },
  ];

  const totalAcessibilidade = inscricoes.filter((i) => i.acessibilidade).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-header text-primary-foreground py-8 px-4 relative">
        <Link
          to="/"
          className="absolute top-4 left-4 flex items-center gap-2 bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-lg transition-colors text-sm font-medium"
        >
          ← Voltar
        </Link>
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl md:text-3xl font-bold">
            Painel RH – Inscritos no Treinamento
          </h1>
          <p className="opacity-90 mt-2">
            Dominando a Automação e Microinterações
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Inscritos</p>
                <p className="text-3xl font-bold text-foreground">
                  {inscricoes.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dia mais popular</p>
                <p className="text-3xl font-bold text-foreground">
                  {diasData.reduce((max, d) => (d.inscritos > max.inscritos ? d : max), diasData[0])?.dia || "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departamentos</p>
                <p className="text-3xl font-bold text-foreground">
                  {departamentosData.length}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="p-3 rounded-full bg-primary/10">
                <Accessibility className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Acessibilidade</p>
                <p className="text-3xl font-bold text-foreground">
                  {totalAcessibilidade}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inscritos por Departamento</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={departamentosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {departamentosData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inscritos por Dia</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={diasData}>
                  <XAxis dataKey="dia" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="inscritos"
                    fill="hsl(213, 94%, 35%)"
                    name="Inscritos"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Search and Export */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={exportCSV} className="gap-2">
                <Download className="w-4 h-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Lista de Inscritos ({filteredInscricoes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center py-8 text-muted-foreground">
                Carregando...
              </p>
            ) : filteredInscricoes.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">
                Nenhuma inscrição encontrada.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>E-mail</TableHead>
                      <TableHead>Departamento</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Dia</TableHead>
                      <TableHead>Acessibilidade</TableHead>
                      <TableHead>Data Inscrição</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInscricoes.map((inscricao) => (
                      <TableRow key={inscricao.id}>
                        <TableCell className="font-medium">
                          {inscricao.nome_completo}
                        </TableCell>
                        <TableCell>{inscricao.email_corporativo}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {inscricao.departamento}
                          </Badge>
                        </TableCell>
                        <TableCell>{inscricao.nivel_automacao}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {inscricao.dia_participacao}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {inscricao.acessibilidade ? (
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                              Sim
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">Não</span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(inscricao.data_envio).toLocaleDateString(
                            "pt-BR"
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default RHAdmin;

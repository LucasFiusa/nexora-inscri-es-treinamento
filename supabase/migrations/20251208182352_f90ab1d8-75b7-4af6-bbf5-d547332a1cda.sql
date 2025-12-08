-- Create table for training registrations
CREATE TABLE public.inscricoes_treinamento (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome_completo TEXT NOT NULL,
    email_corporativo TEXT NOT NULL,
    departamento TEXT NOT NULL,
    nivel_automacao TEXT NOT NULL,
    acessibilidade BOOLEAN NOT NULL DEFAULT false,
    descricao_acessibilidade TEXT,
    dia_participacao TEXT NOT NULL,
    observacoes TEXT,
    data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.inscricoes_treinamento ENABLE ROW LEVEL SECURITY;

-- Create policy for public insert (anyone can register)
CREATE POLICY "Anyone can insert registrations" 
ON public.inscricoes_treinamento 
FOR INSERT 
WITH CHECK (true);

-- Create policy for public select (HR needs to view all)
CREATE POLICY "Anyone can view registrations" 
ON public.inscricoes_treinamento 
FOR SELECT 
USING (true);

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.inscricoes_treinamento;
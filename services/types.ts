// Type Definitions - App Institucional

export type TipoUsuario = 'ALUNO' | 'RESPONSAVEL';

export interface LoginResponse {
  token: string;
  tipoUsuario: TipoUsuario;
}

export interface PerfilAluno {
  codigo: string;
  nome: string;
  turma: string;
  sede?: string;
  curso?: string;
  turno?: string;
  periodoLetivo?: number;
  matricula?: string;
}

export interface PerfilResponsavel {
  codigo: string;
  nome: string;
  sede?: string;
  alunos: PerfilAluno[];
}

export type Perfil = PerfilAluno | PerfilResponsavel;

export interface Mensagem {
  codigo: string;
  descricao: string;
  conteudo: string;
  data: string; // ISO 8601
  lida: string;
  critico?: boolean;
  exigeAcao?: boolean;
  prazo?: string; // ISO 8601
  anexo?: string;
  anexoNome?: string | null;
  destinatario?: string;
}

// Disciplina information
export interface Disciplina {
  nome: string;
  cor: string; // HSL color for UI
  icone?: string; // Lucide icon name
}

// Aula (class session) information
export interface Aula {
  numero: number; // 1ª aula, 2ª aula...
  horario: string; // "08:00"
  disciplina: Disciplina;
  professor?: string;
}

// Conteúdo da aula (class content)
export interface ConteudoAula {
  lecionado: string; // "Equações de 2º grau"
  exercicioClasse?: string; // "Livro p.45-47"
  exercicioCasa?: {
    descricao: string; // "Lista 3, questões 1-10"
    prazo?: string; // ISO 8601
    concluido: boolean;
  };
  material?: string; // "Trazer calculadora"
  observacao?: string;
}

// Detailed agenda item (new structure)
export interface AgendaItemDetalhado {
  codigo: string;
  data: string; // ISO 8601
  aula: Aula;
  conteudo: ConteudoAula;
}

// Legacy agenda item (backward compatibility)
export interface AgendaItem {
  codigo: string;
  titulo: string;
  data: string; // ISO 8601
  descricao?: string;
  horario?: string;
}

export interface ChangePasswordPayload {
  senha: string;
  novaSenha: string;
  confirmaSenha: string;
}

export interface ApiError {
  message: string;
  status?: number;
}

// ============= MATERIAIS =============

export type TipoMaterial = 
  | "Calendários de avaliações"
  | "Circulares"
  | "Gabaritos"
  | "Guia do estudante"
  | "Roteiros"
  | "TD"
  | "Vestibulares";

export type Curso =
  | "Infantil 1" | "Infantil 2" 
  | "1º Ano" | "2º Ano" | "3º Ano" | "4º Ano" | "5º Ano"
  | "6º Ano" | "7º Ano" | "8º Ano" | "9º Ano"
  | "1ª Série/EM" | "2ª Série/EM" | "3ª Série/EM"
  | "Extensivo" | "Intensivo";

export interface ArquivoMaterial {
  nome: string;
}

export interface Material {
  codigo: string;
  tipo: TipoMaterial;
  titulo: string;
  descricao?: string;
  dataPublicacao: string; // ISO 8601
  arquivo: ArquivoMaterial;
  
  // Campos opcionais para filtros avançados
  autor?: string;           // "EQUIPE 08 CHRISTUS"
  disciplina?: string;      // "Matemática"
  thumbnailUrl?: string;    // URL da thumbnail
  dataMaterial?: string;    // Data do material em si
}

export interface Parametro {
  codigo: string;
  descricao: string;
}

export interface MaterialFilters {
  tipo: string;              // "todos" | TipoMaterial
  keyword: string;           // busca por texto
  mes?: string;              // "2025-10" (YYYY-MM)
  disciplinas: string[];     // ["Matemática", "História"]
  dataInicio?: string;       // ISO 8601
  dataFim?: string;          // ISO 8601
}

// Helper: Determinar materiais disponíveis por curso
// ============= BOLETIM =============

export interface Boletim { 
  etapa: string;
  imagemBoletim: string;
  mensagemMedalha: string;
}

// Helper: Determinar materiais disponíveis por curso
export function getMaterialTypesByCourse(curso: string): TipoMaterial[] {
  const cursosSemVestibular: string[] = [
    "Infantil 1", "Infantil 2",
    "1º Ano", "2º Ano", "3º Ano", "4º Ano", "5º Ano",
    "6º Ano", "7º Ano", "8º Ano", "9º Ano",
    "1ª Série/EM", "2ª Série/EM"
  ];
  
  if (cursosSemVestibular.includes(curso)) {
    return ["Circulares", "Gabaritos", "Guia do estudante", "Roteiros"];
  }
  
  // 3ª Série/EM, Extensivo, Intensivo
  return [
    "Calendários de avaliações",
    "Circulares",
    "Gabaritos",
    "Guia do estudante",
    "Roteiros",
    "TD",
    "Vestibulares"
  ];
}
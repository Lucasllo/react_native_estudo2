// API Response Adapters
// Parse backend responses into internal typed models

import { AgendaItemDetalhado, LoginResponse, Mensagem, Perfil } from './types';

/**
 * Parse login response from String format
 * Expected format: "Bearer <token> | ALUNO" or similar
 * TODO: Adjust based on actual backend response format
 */
export function parseLoginResponse(raw: any): LoginResponse {
  try {
    // Caso o backend já retorne um objeto JSON:
    if (typeof raw === 'object' && raw !== null) {
      return {
        token: raw.token || '',
        tipoUsuario: raw.tipoUsuario || raw.tipo || 'ALUNO',
      };
    }

    // Caso ainda venha como string ("Bearer TOKEN | ALUNO"):
    if (typeof raw === 'string') {
      const parts = raw.split('|').map(p => p.trim());
      if (parts.length >= 2) {
        const token = parts[0].replace('Bearer ', '').trim();
        const tipoUsuario = parts[1].trim() as 'ALUNO' | 'RESPONSAVEL';
        return { token, tipoUsuario };
      }

      // Fallback: string sem separador
      return {
        token: raw.replace('Bearer ', '').trim(),
        tipoUsuario: 'ALUNO',
      };
    }

    // Fallback geral — se não for string nem objeto
    console.error('❌ Formato inesperado do login response:', raw);
    throw new Error('Formato de resposta inválido');

  } catch (error) {
    console.error('Error parsing login response:', error);
    throw new Error('Erro ao interpretar resposta do login');
  }
}

/**
 * Normalize message from backend
 * Add optional fields as undefined if not present
 */
export function normalizeMensagem(raw: any): Mensagem {
  return {
    codigo: raw.codigo || raw.codigoMensagem || '',
    descricao: raw.descricao || '',
    conteudo: raw.conteudo || raw.mensagem || '',
    data: raw.data || raw.dataEnvio || new Date().toISOString(),
    lida: raw.lida || false,
    critico: raw.critico,
    exigeAcao: raw.exigeAcao,
    prazo: raw.prazo,
    anexo: raw.anexo,
    anexoNome: raw.anexoNome,
    destinatario: raw.destinatario,
  };
}

/**
 * Get disciplina color based on name
 */
function getDisciplinaColor(nome: string): string {
  const colorMap: Record<string, string> = {
    'Matemática': 'hsl(220, 70%, 50%)', // Blue
    'Português': 'hsl(340, 75%, 55%)', // Red
    'História': 'hsl(25, 80%, 55%)', // Orange
    'Geografia': 'hsl(150, 60%, 45%)', // Green
    'Ciências': 'hsl(280, 65%, 60%)', // Purple
    'Inglês': 'hsl(200, 70%, 50%)', // Cyan
    'Ed. Física': 'hsl(45, 90%, 55%)', // Yellow
    'Artes': 'hsl(300, 70%, 60%)', // Magenta
  };
  return colorMap[nome] || 'hsl(var(--primary))';
}

/**
 * Get disciplina icon based on name
 */
function getDisciplinaIcon(nome: string): string {
  const iconMap: Record<string, string> = {
    'Matemática': 'calculator',
    'Português': 'book-open',
    'História': 'landmark',
    'Geografia': 'globe',
    'Ciências': 'flask-conical',
    'Inglês': 'languages',
    'Ed. Física': 'dumbbell',
    'Artes': 'palette',
  };
  return iconMap[nome] || 'book';
}


function gerarCorPorNome(nome: string = ''): string {
  // Exemplo simples de hash -> cor
  const cores = ['#FF6B6B', '#6BCB77', '#4D96FF', '#FFC75F', '#A66DD4'];
  const index = nome
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % cores.length;
  return cores[index];
}

function gerarIconePorNome(nome: string = ''): string {
  // Mapeamento simples para ícones com base no nome da disciplina
  const mapa: Record<string, string> = {
    matemática: 'FunctionSquare',
    história: 'BookOpen',
    geografia: 'Globe',
    português: 'FileText',
    biologia: 'Leaf',
    física: 'Zap',
    química: 'FlaskConical',
    inglês: 'Languages',
  };
  const chave = nome.toLowerCase();
  return mapa[chave] ?? 'Book';
}

/**
 * Normalize agenda item from backend (detailed structure)
 */
 export function normalizeAgendaItem(raw: any): AgendaItemDetalhado {
  return {
    codigo: raw.codigo ?? crypto.randomUUID(),
    data: raw.data,
    aula: {
      numero: raw.numero ?? 1,
      horario: raw.horario ?? '08:00',
      disciplina: {
        nome: raw.disciplina?.nome ?? 'Disciplina',
        cor: gerarCorPorNome(raw.disciplina?.nome),
        icone: gerarIconePorNome(raw.disciplina?.nome),
      },
      professor: raw.professor ?? undefined,
    },
    conteudo: {
      lecionado: raw.conteudo ?? '',
      exercicioClasse: raw.exercicioClasse ?? undefined,
      exercicioCasa: raw.exercicioCasa
        ? {
            descricao: raw.exercicioCasa,
            concluido: false,
          }
        : undefined,
      observacao: raw.observacao ?? undefined,
    },
  };
}

/**
 * Normalize profile response
 */
export function normalizePerfil(raw: any): Perfil {
  // Check if it's RESPONSAVEL (has alunos array)
  if (raw.perfilResponsavel && Array.isArray(raw.perfilResponsavel.alunos)) {
    return {
      codigo: raw.perfilResponsavel.codigo || '',
      nome: raw.perfilResponsavel.nome || '',
      alunos: raw.perfilResponsavel.alunos.map((a: any) => ({
        codigo: a.codigo || '',
        nome: a.nome || '',
        turma: a.turma || '',
        turno: a.turno || '',
        sede: a.sede || '',
        curso: a.curso || '',
        matricula: a.matricula || '',
        periodoLetivo: a.periodoLetivo || '',
      })),
    };
  }
  
  // It's ALUNO
  return {
	codigo: raw.perfilAluno.codigo || '',
	nome: raw.perfilAluno.nome || '',
	turma: raw.perfilAluno.turma || '',
	turno: raw.perfilAluno.turno || '',
	sede: raw.perfilAluno.sede || '',
	curso: raw.perfilAluno.curso || '',
	matricula: raw.perfilAluno.matricula || '',
  periodoLetivo: raw.perfilAluno.periodoLetivo ||''
  };
}

/**
 * Normalize material from backend
 */
export function normalizeMaterial(raw: any): import('./types').Material {
  return {
    codigo: raw.codigo || '',
    tipo: raw.tipo || '',
    titulo: raw.titulo || 'Documento sem título',
    dataPublicacao: raw.dataPublicacao || new Date().toISOString(),
    arquivo: {
      nome: raw.arquivo || ''
    },
    autor: raw.usuario,
    disciplina: raw.disciplina,
    thumbnailUrl: raw.thumbnailUrl,
    dataMaterial: raw.dataMaterial
  };
}

export function normalizeMaterialParametros(raw: any): import('./types').Parametro {
  return {
    codigo: raw.codigo || '',
    descricao: raw.descricao || '',
  };
}
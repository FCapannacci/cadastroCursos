export type UsuarioDTO = {
    nome: string;
    usuario: string;
  };
  
  export type ProfessorDTO = {
    nome: string;
    usuario: string;
    professorId: number;
  };
  
  export type CursoDTO = {
    nome: string;
    descricao: string;
    banner: string;
    professorId: number;
    alunosParaConectarIds?: number[] | null;
    alunosParaDesconectarIds?: number[] | null;
  };
  
  export type AlunoDTO = {
    nome: string;
    usuario: string;
    alunoIdExclusivo: number;
    matriculadoEmCursos?: CursoDTO[] | null;
  };
  
  export type AulaDTO = {
    cursoId: number; // Adicionando o cursoId na aula
    texto?: string;
    arquivo?: {
      nome: string;
      tipo: 'pdf' | 'xlsx' | 'docx' | 'pptx';
    };
    link?: string;
  };
 
  export type AcessoAulaDTO = {
    visualizado: boolean;
    alunoId: number;
    aulaId: number;
  };
  
  export type AprovacaoDTO = {
    aprovado: boolean;
    professorId: number;
    alunoId: number;
    cursoId: number;
  };
  
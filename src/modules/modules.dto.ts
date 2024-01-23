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
    professorId?: number;
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
    cursoId: number; 
    texto?: string;
    arquivo?: string;
    link?: string;
  };

  export type AlunoAcessoDTO = {
    alunoId: number;
    nome: string;
    email: string;
    aulasVisualizadas: number;
    aprovado: boolean;
  };
 
  export type AcessoAulaDTO = {
    visualizado: boolean;
    alunoId: number;
    aulaId: number;
  };
  
  export type AprovacaoDTO = {
    aprovado: boolean;
    professor: number;
    alunoId: number;
    cursoId: number | null;
    };

  export type AlunoComAcessoDTO = {
    alunoIdExclusivo: number;
    nome: string;
    usuario: string;
    aprovado: boolean;
    aulasVisualizadas: number;
}; 

export type aulasVisualizadasDTO = {
  alunoIdExclusivo: number;
  nome: string;
  usuario: string;
  aprovado: boolean;
  aulasVisualizadas: number;
  totalAulas: number;
}


////////
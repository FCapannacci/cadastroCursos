
import { ApiProperty } from "@nestjs/swagger";

export class ProfessorSwagger {
    @ApiProperty({
        description: 'Nome do Professor',
        example: 'Guilherme Silva',
      })
    nome: string;

    @ApiProperty({
        description: 'Nome de usuário do professor',
        example: 'GSilva',
      })
    usuario: string;
  };
  
  export class UsuarioSwagger {
    @ApiProperty()
    nome: string;

    @ApiProperty()
    usuario: string;
  };


export class CursoSwagger {
  @ApiProperty({
    description: 'Nome do curso',
    example: 'Curso de Inglês',
  })
  nome: string;

  @ApiProperty({
    description: 'Descrição do curso',
    example: 'Curso para aprendizado do idioma mais falado no mundo!',
  })
  descricao: string;

  @ApiProperty({
    description: 'URL do banner do curso',
    example: 'www.urlaqui.com.br',
  })
  banner: string;
}

  export class AlunoSwagger {
    @ApiProperty({
      description: 'Nome do aluno',
      example: 'Bart Mazzoca',
    })
    nome: string;
  
    @ApiProperty({
      description: 'Nome de usuário do aluno',
      example: 'BartMazzoca',
    })
    usuario: string;
  }


  export class AulaSwagger {
    @ApiProperty({ 
        description: 'idCurso',
        example: '11',
    })
    cursoId: number;
  
    @ApiProperty({ required: false, description: 'Texto da aula' })
    texto?: string;
  
    @ApiProperty({ required: false, description: 'Caminho do arquivo' })
    arquivo?: string;
  
    @ApiProperty({ required: false, description: 'Link relacionado à aula' })
    link?: string;
  }
  
  export class AprovacaoSwagger {
    @ApiProperty({ description: 'Indica se a aprovação foi bem-sucedida', example: true })
    aprovado: boolean;
  
    @ApiProperty({ description: 'ID do professor', example: 67852 })
    professor: number;
  
    @ApiProperty({ description: 'ID do aluno', example: 5 })
    alunoId: number;
  
    @ApiProperty({ required: false, description: 'ID do curso (opcional)', example: 11 })
    cursoId?: number | null;
  }
  

  ////////
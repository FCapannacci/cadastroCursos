import { Body, Controller, Post, ConflictException, Get, Param, Put, Delete, Req, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ProfessorDTO, AlunoDTO, CursoDTO, AulaDTO, AprovacaoDTO, AlunoComAcessoDTO } from './modules.dto';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) { }

  @Post('/professores')
  async createProfessor(@Body() professorDTO: ProfessorDTO) {
    try {
      const result = await this.modulesService.createProfessor(professorDTO);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      }
      throw error;
    }
  }

  @Post('alunos')
  async createAluno(@Body() alunoDTO: AlunoDTO) {
    // Lógica para criar aluno
    const aluno = await this.modulesService.createAluno(alunoDTO);
    return { aluno }; // Responde com o aluno criado
  }

  @Post(':professorId/cursos')
  async createCurso(@Param('professorId') professorId: number, @Body() cursoDTO: CursoDTO) {
    const curso = await this.modulesService.createCurso(professorId, cursoDTO);
    return { message: 'Curso criado com sucesso', curso };
  }

  @Put(':professorId/cursos/:cursoId')
  async updateCurso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() cursoDTO: CursoDTO,
    @Req() req: Request,
  ) {
    if (!professorId) {
      throw new UnauthorizedException('Apenas professores podem editar cursos.');
    }

    // Restante da lógica para editar o curso
    const curso = await this.modulesService.updateCurso(professorId, cursoId, cursoDTO);
    return { message: 'Curso editado com sucesso', curso };
  }

  @Delete(':professorId/cursos/:cursoId')
  async deleteCurso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
  ) {
    // Substitua isso pela lógica real de verificação do professor
    const isProfessor = await this.modulesService.isUserProfessor(professorId);

    if (!isProfessor) {
      throw new UnauthorizedException('Apenas professores podem excluir cursos.');
    }

    const result = await this.modulesService.deleteCurso(professorId, cursoId);
    return { message: 'Curso excluído com sucesso', result };
  }

  @Post(':professorId/cursos/:cursoId/grant-access')
  async grantAccessToCourse(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() studentIds: number[],  // Certifique-se de que o corpo seja um array
  ) {
    await this.modulesService.grantAccessToCourse(cursoId, studentIds);
    return { message: 'Acesso concedido com sucesso' };
  }

  @Post(':professorId/cursos/:cursoId/revoke-access')
  async revokeAccessToCourse(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() studentIds: number[],
  ) {
    await this.modulesService.revokeAccessToCourse(cursoId, studentIds);
    return { message: 'Acesso revogado com sucesso' };
  }

  @Post('/aulas')
  async createAula(
    @Body() aulaDTO: AulaDTO,
  ) {
    console.log('Received request with aulaDTO:', aulaDTO);

    try {
      await this.modulesService.createAula(aulaDTO.cursoId, aulaDTO);

      return { message: 'Aula criada com sucesso!' };
    } catch (error) {
      console.error(error);
      return { message: 'Erro ao criar aula.' };
    }
  }
  @Get(':professorId/cursos/:cursoId/alunos-com-acesso')
  async getAlunosComAcesso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number
  ) {
    const isProfessor = await this.modulesService.isUserProfessor(professorId);

    if (!isProfessor) {
      throw new UnauthorizedException('Apenas professores podem acessar esta informação.');
    }

    const alunosComAcesso = await this.modulesService.getAlunosComAcessoAoCurso(cursoId);
    return { alunosComAcesso };
  }

  @Post(':professorId/cursos/:cursoId/aprovacoes')
    async createAprovacao(@Body() aprovacaoDTO: AprovacaoDTO) {
        try {
            const result = await this.modulesService.createAprovacao(aprovacaoDTO);
            return { success: result.success, data: result.data, message: result.message };
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw new UnauthorizedException(error.message);
            }
            throw error;
        }
    }


    
    @Get(':cursoId/alunos/:alunoId/curso')
    async getCursoPorAluno(
        @Param('cursoId') cursoId: number,
        @Param('alunoId') alunoId: number,
    ): Promise<CursoDTO> {
        try {
            const curso = await this.modulesService.getCursoPorAluno(alunoId, cursoId);
            return curso;
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }

    @Post(':alunoId/aulas/:aulaId/visualizacao')
    async registerAulaVisualization(
        @Param('alunoId') alunoId: number,
        @Param('aulaId') aulaId: number,
    ) {
        try {
            await this.modulesService.registerAulaVisualization(alunoId, aulaId);
            return { success: true, message: 'Visualização registrada com sucesso' };
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(error.message);
            }
            throw error;
        }
    }
    @Get(':alunoId/cursos/:cursoId/status')
    async getStatusDoAlunoNoCurso(
        @Param('alunoId') alunoId: number,
        @Param('cursoId') cursoId: number,
    ): Promise<{ status: string }> {
        try {
            const status = await this.modulesService.getStatusDoAlunoNoCurso(alunoId, cursoId);
            return { status };
        } catch (error) {
            // Tratar o erro conforme necessário, por exemplo, retornar uma resposta HTTP 404 se o curso não for encontrado
            throw error;
        }
    }
    
}
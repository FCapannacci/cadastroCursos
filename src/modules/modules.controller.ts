import { Body, Controller, Post, ConflictException, Get, Param, Put, Delete, Req, UnauthorizedException } from '@nestjs/common';
import { ModulesService } from './modules.service';
import { ProfessorDTO, AlunoDTO, CursoDTO, AulaDTO } from './modules.dto';

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

  @Post(':courseId/aulas')
  async createAula(
    @Param('courseId') courseId: number,
    @Body() aulaDTO: AulaDTO,
  ) {
    // Valide ou faça outras verificações necessárias aqui
    await this.modulesService.createAula(courseId, aulaDTO);

    return { message: 'Aula criada com sucesso!' };
  }
}



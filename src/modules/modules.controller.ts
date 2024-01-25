import {
  Body,
  Controller,
  Post,
  ConflictException,
  Get,
  Param,
  Put,
  Delete,
  Req,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import {
  ProfessorDTO,
  AlunoDTO,
  CursoDTO,
  AulaDTO,
  AprovacaoDTO,
  AlunoComAcessoDTO,
} from './modules.dto';
import {
  AlunoSwagger,
  AprovacaoSwagger,
  AulaSwagger,
  CursoSwagger,
  ProfessorSwagger,
} from 'src/swagger/swagger.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Controller('modules')
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post('/professores')
  @ApiOperation({ summary: 'Criação de Professor' })
  @ApiBody({ type: ProfessorSwagger })
  @ApiResponse({ status: 201, description: 'Professor criado com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Usuário já cadastrado',
    type: ConflictException,
  })
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

  @Post('/alunos')
  @ApiOperation({ summary: 'Criação de Aluno' })
  @ApiBody({ type: AlunoSwagger })
  @ApiResponse({ status: 201, description: 'Aluno criado com sucesso' })
  @ApiResponse({
    status: 409,
    description: 'Nome de usuário já existente',
    type: ConflictException,
  })
  async createAluno(@Body() alunoDTO: AlunoDTO) {
    const aluno = await this.modulesService.createAluno(alunoDTO);
    return { aluno };
  }

  @Post(':professorId/cursos')
  @ApiOperation({ summary: 'Criação de Curso' })
  @ApiBody({ type: CursoSwagger })
  @ApiResponse({
    status: 201,
    description: 'Curso criado com sucesso',
    type: CursoSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Professor não encontrado',
    type: NotFoundException,
  })
  async createCurso(
    @Param('professorId') professorId: number,
    @Body() cursoDTO: CursoDTO,
  ) {
    const curso = await this.modulesService.createCurso(professorId, cursoDTO);
    return { message: 'Curso criado com sucesso', curso };
  }

  @Put(':professorId/cursos/:cursoId')
  @ApiOperation({ summary: 'Atualização de Curso' })
  @ApiBody({ type: CursoSwagger })
  @ApiResponse({
    status: 200,
    description: 'Curso editado com sucesso',
    type: CursoSwagger,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
    type: NotFoundException,
  })
  async updateCurso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() cursoDTO: CursoDTO,
    @Req() req: Request,
  ) {
    if (!professorId) {
      throw new UnauthorizedException(
        'Apenas professores podem editar cursos.',
      );
    }

    // Restante da lógica para editar o curso
    const curso = await this.modulesService.updateCurso(
      professorId,
      cursoId,
      cursoDTO,
    );
    return { message: 'Curso editado com sucesso', curso };
  }

  @Delete(':professorId/cursos/:cursoId')
  @ApiOperation({ summary: 'Exclusão de Curso' })
  @ApiResponse({ status: 200, description: 'Curso excluído com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
    type: NotFoundException,
  })
  @ApiResponse({
    status: 401,
    description: 'Apenas professores podem excluir cursos',
    type: UnauthorizedException,
  })
  async deleteCurso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
  ) {
    // Substitua isso pela lógica real de verificação do professor
    const isProfessor = await this.modulesService.isUserProfessor(professorId);

    if (!isProfessor) {
      throw new UnauthorizedException(
        'Apenas professores podem excluir cursos.',
      );
    }

    const result = await this.modulesService.deleteCurso(professorId, cursoId);
    return { message: 'Curso excluído com sucesso', result };
  }

  @Post(':professorId/cursos/:cursoId/grant-access')
  @ApiOperation({ summary: 'Conceder Acesso ao Curso' })
  @ApiBody({
    type: [Number],
    description: 'Array de IDs de alunos, example: [1, 2, 3] ',
  })
  @ApiResponse({ status: 200, description: 'Acesso concedido com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Digite um ID válido no corpo da requisição.',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 404,
    description: 'Um ou mais alunos não foram encontrados.',
    type: NotFoundException,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
    type: NotFoundException,
  })
  async grantAccessToCourse(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() studentIds: number[], // Certifique-se de que o corpo seja um array
  ) {
    await this.modulesService.grantAccessToCourse(cursoId, studentIds);
    return { message: 'Acesso concedido com sucesso' };
  }

  @Post(':professorId/cursos/:cursoId/revoke-access')
  @ApiOperation({ summary: 'Revogar Acesso ao Curso' })
  @ApiBody({
    type: [Number],
    description: 'Array de IDs de alunos, example: [1, 2, 3]',
  })
  @ApiResponse({ status: 200, description: 'Acesso revogado com sucesso' })
  @ApiResponse({
    status: 400,
    description: 'Digite um ID válido no corpo da requisição.',
    type: BadRequestException,
  })
  @ApiResponse({
    status: 404,
    description: 'Um ou mais alunos não foram encontrados.',
    type: NotFoundException,
  })
  @ApiResponse({
    status: 404,
    description: 'Curso não encontrado',
    type: NotFoundException,
  })
  async revokeAccessToCourse(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
    @Body() studentIds: number[],
  ) {
    await this.modulesService.revokeAccessToCourse(cursoId, studentIds);
    return { message: 'Acesso revogado com sucesso' };
  }

  @Post('/aulas')
  @ApiOperation({ summary: 'Criar Aula' })
  @ApiBody({ type: AulaSwagger })
  @ApiResponse({ status: 201, description: 'Aula criada com sucesso!' })
  @ApiResponse({ status: 201, description: 'Erro ao criar aula.' })
  async createAula(@Body() aulaDTO: AulaDTO) {
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
  @ApiOperation({ summary: 'Obter Alunos com Acesso ao Curso' })
  @ApiParam({
    name: 'professorId',
    type: Number,
    description: 'ID do Professor',
  })
  @ApiParam({ name: 'cursoId', type: Number, description: 'ID do Curso' })
  @ApiResponse({
    status: 200,
    description: 'Lista de alunos com acesso ao curso',
  })
  @ApiResponse({
    status: 401,
    description: 'Apenas professores podem acessar esta informação.',
    type: UnauthorizedException,
  })
  async getAlunosComAcesso(
    @Param('professorId') professorId: number,
    @Param('cursoId') cursoId: number,
  ) {
    const isProfessor = await this.modulesService.isUserProfessor(professorId);

    if (!isProfessor) {
      throw new UnauthorizedException(
        'Apenas professores podem acessar esta informação.',
      );
    }

    const alunosComAcesso =
      await this.modulesService.getAlunosComAcessoAoCurso(cursoId);
    return { alunosComAcesso };
  }

  @Post(':professorId/cursos/:cursoId/aprovacoes')
  @ApiOperation({ summary: 'Criar Aprovação' })
  @ApiBody({ type: AprovacaoSwagger })
  @ApiResponse({ status: 201, description: 'Aprovação criada com sucesso' })
  @ApiResponse({
    status: 401,
    description: 'Aluno não atende aos critérios de aprovação',
    type: UnauthorizedException,
  })
  async createAprovacao(@Body() aprovacaoDTO: AprovacaoDTO) {
    try {
      const result = await this.modulesService.createAprovacao(aprovacaoDTO);
      return {
        success: result.success,
        data: result.data,
        message: result.message,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          {
            message: 'Aluno não atende aos critérios de aprovação',
            error: 'Unauthorized',
            statusCode: HttpStatus.UNAUTHORIZED,
          },
          HttpStatus.UNAUTHORIZED,
        );
      } else if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          { message: 'Aluno não atende aos critérios de aprovação' },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  @Get(':cursoId/alunos/:alunoId/curso')
  @ApiOperation({ summary: 'Visualização do aluno' })
  @ApiResponse({
    status: 200,
    description: 'Retorna os detalhes do curso para o aluno',
    type: CursoSwagger,
  })
  @ApiParam({ name: 'cursoId', description: 'ID do Curso', type: Number })
  @ApiParam({ name: 'alunoId', description: 'ID do Aluno', type: Number })
  async getCursoPorAluno(
    @Param('cursoId') cursoId: number,
    @Param('alunoId') alunoId: number,
  ): Promise<CursoDTO> {
    try {
      const curso = await this.modulesService.getCursoPorAluno(
        alunoId,
        cursoId,
      );
      return curso;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(error.message);
      }
      throw error;
    }
  }
  @Post(':alunoId/aulas/:aulaId/visualizacao')
  @ApiOperation({ summary: 'Registro no sistema da aula assistida pelo aluno' })
  @ApiResponse({
    status: 201,
    description: 'Visualização registrada com sucesso',
    type: Object, // Altere para o tipo de resposta real, se necessário
  })
  @ApiNotFoundResponse({
    description: 'Aula não encontrada',
    type: Object, // Altere para o tipo de resposta real, se necessário
  })
  @ApiParam({ name: 'alunoId', description: 'ID do Aluno', type: Number })
  @ApiParam({ name: 'aulaId', description: 'ID da Aula', type: Number })
  @ApiBody({
    description: 'Status da aula assistida pelo aluno',
    required: true,
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['iniciada', 'finalizada'],
        },
      },
    },
  })
  async registerAulaVisualization(
    @Param('alunoId') alunoId: number,
    @Param('aulaId') aulaId: number,
    @Body() body: { status: string },
  ) {
    try {
      const { status } = body;
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
  @ApiOperation({ summary: 'Obter status do aluno no curso' })
  @ApiResponse({
    status: 200,
    description: 'Status obtido com sucesso',
  })
  @ApiBadRequestResponse({
    description: 'Erro na solicitação',
  })
  @ApiParam({ name: 'alunoId', description: 'ID do Aluno', type: Number })
  @ApiParam({ name: 'cursoId', description: 'ID do Curso', type: Number })
  async getStatusDoAlunoNoCurso(
    @Param('alunoId') alunoId: number,
    @Param('cursoId') cursoId: number,
  ): Promise<{ status: string }> {
    try {
      const status = await this.modulesService.getStatusDoAlunoNoCurso(
        alunoId,
        cursoId,
      );
      return { status };
    } catch (error) {
      throw error;
    }
  }
}

////////

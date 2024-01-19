import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UsuarioDTO, ProfessorDTO, AlunoDTO, CursoDTO, AulaDTO, AcessoAulaDTO, AprovacaoDTO } from './modules.dto';
import { v4 as uuidv4 } from 'uuid';
import { Prisma } from '@prisma/client';

@Injectable()
export class ModulesService {
    constructor(private prisma: PrismaService) { }

    async createProfessor(professorDTO: ProfessorDTO) {
        try {
            const id = this.generateFiveDigitId(); // Função para gerar ID de 5 dígitos
            return await this.prisma.professor.create({
                data: {
                    ...professorDTO,
                    id: id,
                },
            });
        } catch (error) {
            if (this.isUniqueConstraintViolation(error, 'usuario')) {
                throw new ConflictException('Usuário já cadastrado');
            }
            throw error;
        }
    }

    private generateFiveDigitId(): number {
        const min = 10000; // Mínimo valor de 5 dígitos
        const max = 99999; // Máximo valor de 5 dígitos
        const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
        return randomId;
    }

    private isUniqueConstraintViolation(error: any, field: string): boolean {
        return error.code === 'P2002' && error.meta.target.includes(field);
    }

    async createAluno(alunoDTO: AlunoDTO) {
        const alunoIdExclusivo = await this.gerarAlunoId();
        const alunoData = {
            ...alunoDTO,
            aprovado: false,
        };

        // Verifique se o nome de usuário é único antes de criar o aluno
        const usuarioExistente = await this.prisma.aluno.findUnique({
            where: { usuario: alunoData.usuario },
        });

        if (usuarioExistente) {
            // Nome de usuário duplicado, você pode tratar isso como necessário
            throw new ConflictException('Nome de usuário já existente');
        }

        try {
            const aluno = await this.prisma.aluno.create({
                data: alunoData,
            });

            return aluno;
        } catch (error) {
            // Trate os erros, se necessário
            throw error;
        }
    }

    // Adicione a lógica para gerar um ID exclusivo para o aluno
    async gerarAlunoId(): Promise<number> {
        // Lógica para gerar um ID exclusivo
        // Por exemplo, pode-se usar algum algoritmo de geração de ID único.
        return Math.floor(Math.random() * 1000000);
    }

    async createCurso(professorId: number, cursoDTO: CursoDTO) {
        // Verifique se o professor existe
        const professor = await this.prisma.professor.findUnique({
            where: { id: Number(professorId) },
        });

        if (!professor) {
            throw new NotFoundException('Professor não encontrado');
        }

        // Certifique-se de associar o curso ao professor
        const cursoData = {
            ...cursoDTO,
            professorId: Number(professorId),
        };

        try {
            const curso = await this.prisma.curso.create({
                data: cursoData,
            });

            return curso;
        } catch (error) {
            // Trate os erros, se necessário
            throw error;
        }
    }
    async updateCurso(professorId: number, cursoId: number, cursoDTO: CursoDTO) {
        // Verifique se o professor existe e se está associado ao curso
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId), professorId: Number(professorId) },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        try {
            // Atualize os dados do curso, garantindo que o professorId não seja alterado
            const updatedCurso = await this.prisma.curso.update({
                where: { id: Number(cursoId) },
                data: { ...cursoDTO, professorId: Number(professorId) },
            });
            return updatedCurso;
        } catch (error) {
            // Trate os erros, se necessário
            throw error;
        }
    }

    async deleteCurso(professorId: number, cursoId: number) {
        // Verifique se o professor existe e se está associado ao curso
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId), professorId: Number(professorId) },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        // Restante da lógica para exclusão do curso
        const result = await this.prisma.curso.delete({
            where: { id: Number(cursoId) },
        });

        return result;
    }

    async isUserProfessor(userId: number): Promise<boolean> {
        const professor = await this.prisma.professor.findUnique({
            where: {
                id: Number(userId),
            },
        });

        return !!professor;
    }

    async grantAccessToCourse(courseId: number, studentIds: number[]): Promise<void> {
        const course = await this.findCourse(courseId);

        if (!studentIds.length) {
            throw new BadRequestException('Digite um ID válido no corpo da requisição.');
        }

        // Verificar se todos os alunos existem antes de conceder acesso
        const existingStudents = await this.prisma.aluno.findMany({
            where: {
                id: {
                    in: studentIds,
                },
            },
        });

        if (existingStudents.length !== studentIds.length) {
            throw new NotFoundException('Um ou mais alunos não foram encontrados.');
        }

        // Conceder acesso apenas aos alunos existentes
        await this.prisma.curso.update({
            where: { id: Number(courseId) },
            data: {
                alunos: {
                    connect: existingStudents.map((student) => ({ id: student.id })),
                },
            },
        });
    }

    async revokeAccessToCourse(courseId: number, studentIds: number[]): Promise<void> {
        const course = await this.findCourse(courseId);

        if (!studentIds.length) {
            throw new BadRequestException('Digite um ID válido no corpo da requisição.');
        }

        // Verificar se todos os alunos existem antes de revogar acesso
        const existingStudents = await this.prisma.aluno.findMany({
            where: {
                id: {
                    in: studentIds,
                },
            },
        });

        if (existingStudents.length !== studentIds.length) {
            throw new NotFoundException('Um ou mais alunos não foram encontrados.');
        }

        // Revogar acesso apenas aos alunos existentes
        await this.prisma.curso.update({
            where: { id: Number(courseId) },
            data: {
                alunos: {
                    disconnect: existingStudents.map((student) => ({ id: student.id })),
                },
            },
        });
    }

    private async findCourse(courseId: number) {
        const course = await this.prisma.curso.findUnique({
            where: { id: Number(courseId) },
        });

        if (!course) {
            throw new NotFoundException('Curso não encontrado');
        }

        return course;
    }

    async createAula(cursoId: number, aulaDTO: AulaDTO): Promise<void> {
        // Certifique-se de validar ou realizar outras verificações necessárias
      
        // Verificar se o curso associado à aula existe
        const curso = await this.prisma.curso.findUnique({
          where: { id: Number(cursoId) },
        });
      
        if (!curso) {
          throw new NotFoundException('Curso não encontrado');
        }
      
        // Criar a aula associada ao curso
        await this.prisma.aula.create({
            data: {
              texto: aulaDTO.texto,
              arquivo: { // Assumindo que o campo arquivo aceita um objeto contendo nome e tipo
                create: {
                  nome: aulaDTO.arquivo?.nome,
                  tipo: aulaDTO.arquivo?.tipo,
                },
              },
              link: aulaDTO.link,
              curso: {
                connect: { id: Number(cursoId) },
            },
          },
        });
    }
}
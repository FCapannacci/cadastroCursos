import { Injectable, ConflictException, UnauthorizedException, NotFoundException, BadRequestException, Param, Req } from '@nestjs/common';
import { PrismaService } from 'src/database/PrismaService';
import { UsuarioDTO, ProfessorDTO, AlunoDTO, CursoDTO, AulaDTO, aulasVisualizadasDTO, AcessoAulaDTO, AprovacaoDTO, AlunoComAcessoDTO } from './modules.dto';
import axios from 'axios';


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
        return this.prisma.$transaction(async (prisma) => {
            const curso = await prisma.curso.findUnique({
                where: { id: Number(cursoId), professorId: Number(professorId) },
            });
    
            if (!curso) {
                throw new NotFoundException('Curso não encontrado');
            }
    
            // Excluir registros relacionados (por exemplo, registros em tabelas associadas)
    
            // Restante da lógica para exclusão do curso
            const result = await prisma.curso.delete({
                where: { id: Number(cursoId) },
            });
    
            return result;
        });
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
        console.log('Creating aula for cursoId:', cursoId);
        console.log('Received aulaDTO:', aulaDTO);
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
                arquivo: aulaDTO.arquivo, // assumindo que o campo arquivo aceita uma string
                link: aulaDTO.link,
                curso: {
                    connect: { id: Number(cursoId) },
                },
            },
        });
    }
    async getAlunosComAcessoAoCurso(cursoId: number): Promise<AlunoComAcessoDTO[]> {
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId) },
            include: {
                alunos: {
                    select: {
                        id: true,
                        nome: true,
                        usuario: true,
                        aprovado: true,
                        aulasVisualizadas: {
                            select: {
                                aulaId: true,
                            },
                        },
                    },
                },
            },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        return curso.alunos.map((aluno) => ({
            alunoIdExclusivo: aluno.id,
            nome: aluno.nome,
            usuario: aluno.usuario,
            aprovado: aluno.aprovado,
            aulasVisualizadas: aluno.aulasVisualizadas ? aluno.aulasVisualizadas.length : 0,
        }));
    }

    async getAulasVisualizadasPorAluno(alunoId: number, cursoId: number): Promise<number[]> {
        const acessosAula = await this.prisma.acessoAula.findMany({
            where: {
                alunoId: Number(alunoId),
                aula: {
                    cursoId: Number(cursoId),
                },
            },
            select: {
                aulaId: true,
            },
        });

        return acessosAula.map((acesso) => acesso.aulaId);
    }

    async getTodasAulasDoCurso(cursoId: number): Promise<AulaDTO[]> {
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId) },
            include: {
                aulas: true,
            },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        return curso.aulas || [];
    }
    async getAlunosVisualizadas(cursoId: number): Promise<AlunoComAcessoDTO[]> {
        const curso = await this.prisma.curso.findUnique({
            where: { id: cursoId },
            include: {
                alunos: {
                    select: {
                        id: true,
                        nome: true,
                        usuario: true,
                        aprovado: true,
                        aulasVisualizadas: {
                            select: {
                                aulaId: true,
                            },
                        },
                    },
                },
                aulas: {
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        const alunosComAcesso = curso.alunos.map((aluno) => {
            const totalAulas = curso.aulas.length;
            const aulasVisualizadas = aluno.aulasVisualizadas ? aluno.aulasVisualizadas.length : 0;
            const aprovado = aulasVisualizadas === totalAulas;

            return {
                alunoIdExclusivo: aluno.id,
                nome: aluno.nome,
                usuario: aluno.usuario,
                aprovado: aprovado,
                aulasVisualizadas: aulasVisualizadas,
                totalAulas: totalAulas,
            };
        });

        return alunosComAcesso;
    }
    async isAlunoAprovado(alunoId: number, cursoId: number): Promise<boolean> {
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId) },
            include: {
                aulas: true,
                alunos: {
                    where: { id: alunoId },
                    select: {
                        id: true,
                    },
                },
            },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }

        const totalAulas = curso.aulas.length;
        const aulasVisualizadas = await this.getAulasVisualizadasPorAluno(alunoId, cursoId);
        return aulasVisualizadas.length === totalAulas;
    }

    async createAprovacao(aprovacaoDTO: AprovacaoDTO) {
        try {
            const { alunoId, cursoId, professor, ...restDTO } = aprovacaoDTO;

            const isAlunoAprovado = await this.isAlunoAprovado(alunoId, cursoId);

            if (!isAlunoAprovado) {
                throw new UnauthorizedException('Aluno não atende aos critérios de aprovação');
            }

            const existingAprovacao = await this.prisma.aprovacao.findFirst({
                where: {
                    professorId: Number(professor),
                    alunoId: Number(alunoId),
                    cursoId: Number(cursoId),
                },
            });

            if (existingAprovacao) {
                // Se já existe uma aprovação para esta combinação, retorne uma mensagem adequada
                return { success: false, message: 'Aluno já está aprovado para este curso' };
            }

            // Crie a aprovação se tudo estiver correto
            const novaAprovacao = await this.prisma.aprovacao.create({
                data: {
                    ...restDTO,
                    professor: {
                        connect: { id: Number(professor) },
                    },
                    aluno: {
                        connect: { id: Number(alunoId) },
                    },
                    curso: {
                        connect: { id: Number(cursoId) },
                    },
                },
            });

            // Atualize o status "aprovado" na API "alunos-com-acesso"
            await this.atualizarStatusAprovadoNaAlunosComAcesso(professor, cursoId, alunoId);
            console.log('Aprovação criada com sucesso:', novaAprovacao);

            return { success: true, data: novaAprovacao };
        } catch (error) {
            console.error('Erro ao criar aprovação:', error);
            throw new Error('Erro ao criar aprovação: ' + error.message);
        }
    }


    private async atualizarStatusAprovadoNaAlunosComAcesso(professorId: number, cursoId: number, alunoId: number) {
        try {

            const response = await axios.put(`/modules/alunos`, {
                aprovado: true,
            });

            console.log('Response from alunos-com-acesso API:', response.data);

            if (response.status !== 200) {
                throw new Error('Falha ao atualizar o status na API "alunos-com-acesso"');
            }

            console.log('Status atualizado com sucesso na API "alunos-com-acesso"');
        } catch (error) {
            console.error('Erro ao atualizar o status na API "alunos-com-acesso":', error);
        }
    }
    async getCursoPorAluno(alunoId: number, cursoId: number): Promise<CursoDTO> {
        const curso = await this.prisma.curso.findFirst({
            where: {
                id: Number(cursoId),
                alunos: {
                    some: {
                        id: Number(alunoId),
                    },
                },
            },
        });

        if (!curso) {
            throw new NotFoundException('Curso não encontrado ou aluno não cadastrado no curso.');
        }

        // Remover o campo professorId do objeto de resposta
        const { professorId, ...cursoWithoutProfessorId } = curso;
        return cursoWithoutProfessorId;
    }

    async registerAulaVisualization(alunoId: number, aulaId: number): Promise<void> {
        const aluno = await this.prisma.aluno.findUnique({
            where: { id: Number(alunoId) },
        });

        const aula = await this.prisma.aula.findUnique({
            where: { id: Number(aulaId) },
        });

        if (!aluno || !aula) {
            throw new NotFoundException('Aluno ou aula não encontrados');
        }
        const existingVisualization = await this.prisma.acessoAula.findFirst({
            where: {
                alunoId: Number(alunoId),
                aulaId: Number(aulaId),
            },
        });

        if (existingVisualization) {
            return;
        }

        await this.prisma.acessoAula.create({
            data: {
                aluno: {
                    connect: { id: Number(alunoId) },
                },
                aula: {
                    connect: { id: Number(aulaId) },
                },
                visualizado: true,
            },
        });
    }
    async getStatusDoAlunoNoCurso(alunoId: number, cursoId: number): Promise<string> {
        const curso = await this.prisma.curso.findUnique({
            where: { id: Number(cursoId) },
            include: {
                aulas: true,
                alunos: {
                    where: { id: Number(alunoId) },
                    select: {
                        id: true,
                    },
                },
            },
        });
    
        if (!curso) {
            throw new NotFoundException('Curso não encontrado');
        }
    
        const totalAulas = curso.aulas.length;
        const aulasVisualizadas = await this.getAulasVisualizadasPorAluno(alunoId, cursoId);
    
        if (aulasVisualizadas.length === 0) {
            return 'Não iniciado';
        } else if (aulasVisualizadas.length < totalAulas) {
            return 'Em andamento';
        } else {
            const isAprovado = await this.isAlunoAprovado(alunoId, cursoId);
    
            if (isAprovado) {
                return 'Aprovado';
            } else {
                return 'Finalizado';
            }
        }
    }
    
}
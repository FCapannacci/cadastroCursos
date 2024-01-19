-- CreateTable
CREATE TABLE "Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "usuario" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Aluno" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "aprovado" BOOLEAN NOT NULL
);

-- CreateTable
CREATE TABLE "Curso" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "banner" TEXT NOT NULL,
    "professorId" INTEGER NOT NULL,
    CONSTRAINT "Curso_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "texto" TEXT,
    "arquivo" TEXT,
    "link" TEXT,
    "cursoId" INTEGER NOT NULL,
    CONSTRAINT "Aula_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AcessoAula" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "visualizado" BOOLEAN NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "aulaId" INTEGER NOT NULL,
    CONSTRAINT "AcessoAula_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AcessoAula_aulaId_fkey" FOREIGN KEY ("aulaId") REFERENCES "Aula" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Aprovacao" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aprovado" BOOLEAN NOT NULL,
    "professorId" INTEGER NOT NULL,
    "alunoId" INTEGER NOT NULL,
    "cursoId" INTEGER NOT NULL,
    CONSTRAINT "Aprovacao_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Aprovacao_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Aprovacao_cursoId_fkey" FOREIGN KEY ("cursoId") REFERENCES "Curso" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CursoAluno" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CursoAluno_A_fkey" FOREIGN KEY ("A") REFERENCES "Aluno" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CursoAluno_B_fkey" FOREIGN KEY ("B") REFERENCES "Curso" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Professor_usuario_key" ON "Professor"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Aluno_usuario_key" ON "Aluno"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "AcessoAula_alunoId_aulaId_key" ON "AcessoAula"("alunoId", "aulaId");

-- CreateIndex
CREATE UNIQUE INDEX "Aprovacao_professorId_alunoId_cursoId_key" ON "Aprovacao"("professorId", "alunoId", "cursoId");

-- CreateIndex
CREATE UNIQUE INDEX "_CursoAluno_AB_unique" ON "_CursoAluno"("A", "B");

-- CreateIndex
CREATE INDEX "_CursoAluno_B_index" ON "_CursoAluno"("B");

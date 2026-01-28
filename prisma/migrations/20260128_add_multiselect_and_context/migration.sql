-- AlterTable
ALTER TABLE "Question" ADD COLUMN "answerCount" INTEGER DEFAULT 1,
ADD COLUMN "correctAnswers" TEXT,
ADD COLUMN "hasContext" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "contextType" TEXT;

-- CreateTable
CREATE TABLE "QuestionContext" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "QuestionContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionContext_questionId_idx" ON "QuestionContext"("questionId");

-- AddForeignKey
ALTER TABLE "QuestionContext" ADD CONSTRAINT "QuestionContext_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

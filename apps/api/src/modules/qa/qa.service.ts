import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  async listQuestions(videoId: string, userId: string) {
    const questions = await this.prisma.question.findMany({
      where: { videoId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            votes: { where: { userId } },
          },
          orderBy: [{ isAccepted: 'desc' }, { isPinned: 'desc' }, { voteScore: 'desc' }],
        },
        votes: { where: { userId } },
      },
      orderBy: [{ isPinned: 'desc' }, { voteScore: 'desc' }, { createdAt: 'desc' }],
    });

    return {
      data: questions.map((q) => this.mapQuestion(q, userId)),
    };
  }

  async createQuestion(videoId: string, userId: string, body: string) {
    const question = await this.prisma.question.create({
      data: { videoId, userId, body },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            votes: { where: { userId } },
          },
        },
        votes: { where: { userId } },
      },
    });
    return { data: this.mapQuestion(question, userId) };
  }

  async createAnswer(questionId: string, userId: string, body: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });
    if (!question) throw new NotFoundException('Question not found');

    const answer = await this.prisma.answer.create({
      data: { questionId, userId, body },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        votes: true,
      },
    });
    return { data: this.mapAnswer(answer, userId) };
  }

  async voteQuestion(questionId: string, userId: string, value: 1 | -1) {
    await this.applyVote('question', questionId, userId, value);
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        answers: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            votes: { where: { userId } },
          },
        },
        votes: { where: { userId } },
      },
    });
    return { data: this.mapQuestion(question!, userId) };
  }

  async voteAnswer(answerId: string, userId: string, value: 1 | -1) {
    await this.applyVote('answer', answerId, userId, value);
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        votes: { where: { userId } },
      },
    });
    return { data: this.mapAnswer(answer!, userId) };
  }

  async acceptAnswer(answerId: string, userId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { id: answerId },
      include: { question: { include: { video: { select: { uploadedById: true } } } } },
    });
    if (!answer) throw new NotFoundException('Answer not found');
    if (answer.question.video.uploadedById !== userId) {
      throw new ForbiddenException('Only the video owner can accept answers');
    }

    await this.prisma.$transaction([
      this.prisma.answer.updateMany({
        where: { questionId: answer.questionId },
        data: { isAccepted: false },
      }),
      this.prisma.answer.update({
        where: { id: answerId },
        data: { isAccepted: true, isPinned: true },
      }),
    ]);

    return { data: { success: true } };
  }

  private async applyVote(
    type: 'question' | 'answer',
    id: string,
    userId: string,
    value: 1 | -1,
  ) {
    if (type === 'question') {
      const existing = await this.prisma.questionVote.findUnique({
        where: { questionId_userId: { questionId: id, userId } },
      });
      const delta = existing ? value - existing.value : value;
      await this.prisma.questionVote.upsert({
        where: { questionId_userId: { questionId: id, userId } },
        create: { questionId: id, userId, value },
        update: { value },
      });
      await this.prisma.question.update({
        where: { id },
        data: { voteScore: { increment: delta } },
      });
      return;
    }

    const existing = await this.prisma.answerVote.findUnique({
      where: { answerId_userId: { answerId: id, userId } },
    });
    const delta = existing ? value - existing.value : value;
    await this.prisma.answerVote.upsert({
      where: { answerId_userId: { answerId: id, userId } },
      create: { answerId: id, userId, value },
      update: { value },
    });
    await this.prisma.answer.update({
      where: { id },
      data: { voteScore: { increment: delta } },
    });
  }

  private mapQuestion(
    q: {
      id: string;
      body: string;
      isPinned: boolean;
      voteScore: number;
      viewCount: number;
      createdAt: Date;
      user: { id: string; name: string; avatarUrl: string | null };
      answers: Array<Parameters<QaService['mapAnswer']>[0]>;
      votes: { value: number }[];
    },
    userId: string,
  ) {
    return {
      id: q.id,
      body: q.body,
      isPinned: q.isPinned,
      voteScore: q.voteScore,
      viewCount: q.viewCount,
      createdAt: q.createdAt.toISOString(),
      user: q.user,
      userVote: q.votes[0]?.value ?? 0,
      answers: q.answers.map((a) => this.mapAnswer(a, userId)),
    };
  }

  private mapAnswer(
    a: {
      id: string;
      body: string;
      isAccepted: boolean;
      isPinned: boolean;
      voteScore: number;
      createdAt: Date;
      user: { id: string; name: string; avatarUrl: string | null };
      votes: { value: number }[];
    },
    _userId: string,
  ) {
    return {
      id: a.id,
      body: a.body,
      isAccepted: a.isAccepted,
      isPinned: a.isPinned,
      voteScore: a.voteScore,
      createdAt: a.createdAt.toISOString(),
      user: a.user,
      userVote: a.votes[0]?.value ?? 0,
    };
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { validateReportReason, sanitizeInput } from '@/lib/validation';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { reason, description } = await request.json();

    const reasonErr = validateReportReason(reason);
    if (reasonErr) {
      return NextResponse.json({ error: 'Validation failed', errors: { reason: reasonErr } }, { status: 400 });
    }

    if (user.id === params.id) {
      return NextResponse.json({ error: 'You cannot report yourself' }, { status: 400 });
    }

    const reportedUser = await prisma.user.findUnique({ where: { id: params.id } });
    if (!reportedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingReport = await prisma.report.findFirst({
      where: { reporterId: user.id, reportedUserId: params.id },
    });
    if (existingReport) {
      return NextResponse.json({ error: 'You already reported this user' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        reportedUserId: params.id,
        reason,
        description: description ? sanitizeInput(description) : null,
      },
    });

    return NextResponse.json({ report }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

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

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    const existingReport = await prisma.report.findFirst({
      where: { reporterId: user.id, listingId: params.id },
    });
    if (existingReport) {
      return NextResponse.json({ error: 'You already reported this listing' }, { status: 409 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: user.id,
        listingId: params.id,
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

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        location: true,
        phone: true,
        role: true,
        isAdmin: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: { listings: true, favorites: true, reviewsReceived: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const buyers = users.filter(u => u.role === 'buyer');
    const sellers = users.filter(u => u.role === 'seller');
    const admins = users.filter(u => u.role === 'admin' || u.isAdmin);

    return NextResponse.json({
      users,
      stats: {
        total: users.length,
        buyers: buyers.length,
        sellers: sellers.length,
        admins: admins.length,
      }
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

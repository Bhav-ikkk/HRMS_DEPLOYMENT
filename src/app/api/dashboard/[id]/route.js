import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function GET(request, context) {
  try {
    const params = await context.params; // Await params to handle Promise
    const paramId = parseInt(params.id);
    if (isNaN(paramId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = parseInt(session.user.id);
    if (isNaN(sessionId)) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const role = session.user.role;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    let stats = {};

    if (role === 'ADMIN') {
      // Admin: Return total summary for all users
      const loggedInUsers = await prisma.trace.count({
        where: {
          loginAt: { gte: startOfDay },
        },
      });

      const leavesRequestedToday = await prisma.leave.count({
        where: {
          createdAt: { gte: startOfDay },
        },
      });

      const pendingApprovals = await prisma.leave.count({
        where: {
          status: 'PENDING',
        },
      });

      const departments = await prisma.department.count();

      stats = {
        summary: true,
        loggedInUsers,
        leavesRequestedToday,
        pendingApprovals,
        departments,
      };
    } else {
      // Employee: Return stats only for their own ID
      if (sessionId !== paramId) {
        return NextResponse.json(
          { error: 'Forbidden: Employees can only view their own dashboard' },
          { status: 403 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: sessionId },
        include: { department: true },
      });

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const loggedInUsers = await prisma.trace.count({
        where: {
          userId: sessionId,
          loginAt: { gte: startOfDay },
        },
      });

      const leavesRequestedToday = await prisma.leave.count({
        where: {
          userId: sessionId,
          createdAt: { gte: startOfDay },
        },
      });

      const pendingApprovals = await prisma.leave.count({
        where: {
          userId: sessionId,
          status: 'PENDING',
        },
      });

      const departments = user.department ? 1 : 0;

      stats = {
        summary: false,
        userId: sessionId,
        userName: user.name,
        loggedInUsers,
        leavesRequestedToday,
        pendingApprovals,
        departments,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
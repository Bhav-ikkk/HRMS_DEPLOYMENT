import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  // Step 1: Get the session
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Step 2: Validate user ID
  const userId = parseInt(session.user.id ?? '', 10);
  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  }

  // Step 3: Fetch the user with department
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      department: {
        select: { name: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Step 4: Fetch leave requests based on role
  const leaveRequests = await prisma.leave.findMany({
    where: user.role === 'ADMIN' ? {} : { userId: user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Step 5: Return the results
  return NextResponse.json(leaveRequests);
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req) {
  try {
    const { userId, startDate, endDate, reason } = await req.json();

    // Validate required fields
    if (!userId || !startDate || !endDate || !reason) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Ensure userId is an integer
    const parsedUserId = parseInt(userId, 10);
    if (isNaN(parsedUserId)) {
      return NextResponse.json({ error: 'Invalid userId format' }, { status: 400 });
    }

    // Ensure startDate and endDate are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) {
      return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
    }

    // Create leave request
    const leaveRequest = await prisma.leave.create({
      data: {
        userId: parsedUserId,
        startDate: start,
        endDate: end,
        reason,
        // status: 'PENDING' not needed due to schema default
      },
    });

    return NextResponse.json(leaveRequest, { status: 201 });
  } catch (error) {
    console.error('Error creating leave request:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Check if departments already exist
    const existing = await prisma.department.findMany();
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Departments already seeded' }, { status: 200 });
    }

    // Seed departments
    const departments = await prisma.department.createMany({
      data: [
        { name: 'Marketing' },
        { name: 'Technical' },
        { name: 'Logistics' },
        { name: 'Design' },
      ],
    });

    return NextResponse.json({ message: 'Departments seeded successfully', departments }, { status: 201 });
  } catch (error) {
    console.error('Error seeding departments:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
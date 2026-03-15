import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { TrainingStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const trainingId = searchParams.get('trainingId');
    const status = searchParams.get('status') as TrainingStatus | null;

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (trainingId) where.trainingId = trainingId;
    if (status) where.status = status;

    const employeeTrainings = await db.employeeTraining.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: { select: { name: true } }
          }
        },
        training: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: employeeTrainings });
  } catch (error) {
    console.error('Error fetching employee trainings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des formations employés' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      trainingId,
      status,
      startDate,
      endDate,
      hoursCompleted,
      certificate,
      notes
    } = body;

    // Check if already registered
    const existing = await db.employeeTraining.findFirst({
      where: { employeeId, trainingId }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'L\'employé est déjà inscrit à cette formation' },
        { status: 400 }
      );
    }

    const employeeTraining = await db.employeeTraining.create({
      data: {
        employeeId,
        trainingId,
        status: status as TrainingStatus || TrainingStatus.REGISTERED,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        hoursCompleted: hoursCompleted ? parseFloat(hoursCompleted) : 0,
        certificate,
        notes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        training: true
      }
    });

    return NextResponse.json({ success: true, data: employeeTraining });
  } catch (error) {
    console.error('Error creating employee training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'inscription à la formation' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'inscription requis' },
        { status: 400 }
      );
    }

    // Handle fields
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.hoursCompleted) data.hoursCompleted = parseFloat(data.hoursCompleted);

    const employeeTraining = await db.employeeTraining.update({
      where: { id },
      data,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        },
        training: true
      }
    });

    return NextResponse.json({ success: true, data: employeeTraining });
  } catch (error) {
    console.error('Error updating employee training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'inscription' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID de l\'inscription requis' },
        { status: 400 }
      );
    }

    await db.employeeTraining.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Inscription supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting employee training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'inscription' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');

    const where: Record<string, unknown> = {};
    if (category) where.category = category;

    const trainings = await db.training.findMany({
      where,
      include: {
        _count: {
          select: { employeeTrainings: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: trainings });
  } catch (error) {
    console.error('Error fetching trainings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des formations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      provider,
      duration,
      cost,
      category,
      startDate,
      endDate,
      location
    } = body;

    const training = await db.training.create({
      data: {
        title,
        description,
        provider,
        duration: duration ? parseFloat(duration) : null,
        cost: cost ? parseFloat(cost) : null,
        category,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location
      }
    });

    return NextResponse.json({ success: true, data: training });
  } catch (error) {
    console.error('Error creating training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de la formation' },
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
        { success: false, error: 'ID de la formation requis' },
        { status: 400 }
      );
    }

    // Handle fields
    if (data.duration) data.duration = parseFloat(data.duration);
    if (data.cost) data.cost = parseFloat(data.cost);
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);

    const training = await db.training.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: training });
  } catch (error) {
    console.error('Error updating training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de la formation' },
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
        { success: false, error: 'ID de la formation requis' },
        { status: 400 }
      );
    }

    // Delete related employee trainings first
    await db.employeeTraining.deleteMany({ where: { trainingId: id } });
    await db.training.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Formation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting training:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la formation' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const positions = await db.position.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { title: 'asc' }
    });

    return NextResponse.json({ success: true, data: positions });
  } catch (error) {
    console.error('Error fetching positions:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des postes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, baseSalary } = body;

    const existing = await db.position.findUnique({
      where: { title }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un poste avec ce titre existe déjà' },
        { status: 400 }
      );
    }

    const position = await db.position.create({
      data: {
        title,
        description,
        baseSalary: baseSalary ? parseFloat(baseSalary) : null
      }
    });

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error creating position:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du poste' },
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
        { success: false, error: 'ID du poste requis' },
        { status: 400 }
      );
    }

    if (data.baseSalary) data.baseSalary = parseFloat(data.baseSalary);

    const position = await db.position.update({
      where: { id },
      data
    });

    return NextResponse.json({ success: true, data: position });
  } catch (error) {
    console.error('Error updating position:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du poste' },
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
        { success: false, error: 'ID du poste requis' },
        { status: 400 }
      );
    }

    // Check if position has employees
    const position = await db.position.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } }
      }
    });

    if (position?._count.employees && position._count.employees > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer un poste occupé par des employés' },
        { status: 400 }
      );
    }

    await db.position.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Poste supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting position:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du poste' },
      { status: 500 }
    );
  }
}

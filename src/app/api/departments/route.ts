import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const departments = await db.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        },
        manager: {
          select: { firstName: true, lastName: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des départements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, managerId } = body;

    const existing = await db.department.findUnique({
      where: { name }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un département avec ce nom existe déjà' },
        { status: 400 }
      );
    }

    const department = await db.department.create({
      data: {
        name,
        description,
        managerId: managerId || null
      },
      include: {
        manager: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: department });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du département' },
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
        { success: false, error: 'ID du département requis' },
        { status: 400 }
      );
    }

    const department = await db.department.update({
      where: { id },
      data,
      include: {
        manager: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    return NextResponse.json({ success: true, data: department });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du département' },
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
        { success: false, error: 'ID du département requis' },
        { status: 400 }
      );
    }

    // Check if department has employees
    const department = await db.department.findUnique({
      where: { id },
      include: {
        _count: { select: { employees: true } }
      }
    });

    if (department?._count.employees && department._count.employees > 0) {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer un département contenant des employés' },
        { status: 400 }
      );
    }

    await db.department.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Département supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du département' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { MovementType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type') as MovementType | null;
    const year = searchParams.get('year');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (year) {
      const yearNum = parseInt(year);
      const yearStart = new Date(yearNum, 0, 1);
      const yearEnd = new Date(yearNum, 11, 31);
      where.effectiveDate = { gte: yearStart, lte: yearEnd };
    }

    const movements = await db.movement.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: { select: { name: true } },
            position: { select: { title: true } }
          }
        }
      },
      orderBy: { effectiveDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: movements });
  } catch (error) {
    console.error('Error fetching movements:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des mouvements' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      type,
      effectiveDate,
      reason,
      fromDepartment,
      toDepartment,
      fromPosition,
      toPosition,
      notes
    } = body;

    const movement = await db.movement.create({
      data: {
        employeeId,
        type: type as MovementType,
        effectiveDate: new Date(effectiveDate),
        reason,
        fromDepartment,
        toDepartment,
        fromPosition,
        toPosition,
        notes
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      }
    });

    // Update employee status if termination
    if (type === 'TERMINATION') {
      await db.employee.update({
        where: { id: employeeId },
        data: {
          status: 'TERMINATED',
          terminationDate: new Date(effectiveDate)
        }
      });
    }

    return NextResponse.json({ success: true, data: movement });
  } catch (error) {
    console.error('Error creating movement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du mouvement' },
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
        { success: false, error: 'ID du mouvement requis' },
        { status: 400 }
      );
    }

    await db.movement.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Mouvement supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting movement:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du mouvement' },
      { status: 500 }
    );
  }
}

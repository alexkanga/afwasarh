import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { AbsenceType, AbsenceStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const type = searchParams.get('type') as AbsenceType | null;
    const status = searchParams.get('status') as AbsenceStatus | null;
    const year = searchParams.get('year');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (year) {
      const yearNum = parseInt(year);
      const yearStart = new Date(yearNum, 0, 1);
      const yearEnd = new Date(yearNum, 11, 31);
      where.startDate = { gte: yearStart, lte: yearEnd };
    }

    const absences = await db.absence.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true,
            department: {
              select: { name: true }
            }
          }
        }
      },
      orderBy: { startDate: 'desc' }
    });

    return NextResponse.json({ success: true, data: absences });
  } catch (error) {
    console.error('Error fetching absences:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des absences' },
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
      startDate,
      endDate,
      days,
      reason,
      notes
    } = body;

    // Calculate days if not provided
    let calculatedDays = days;
    if (!calculatedDays && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      calculatedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }

    const absence = await db.absence.create({
      data: {
        employeeId,
        type: type as AbsenceType,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        days: parseFloat(calculatedDays) || 1,
        reason,
        notes,
        status: AbsenceStatus.PENDING
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

    return NextResponse.json({ success: true, data: absence });
  } catch (error) {
    console.error('Error creating absence:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'absence' },
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
        { success: false, error: 'ID de l\'absence requis' },
        { status: 400 }
      );
    }

    // Handle date fields
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.approvedAt) data.approvedAt = new Date(data.approvedAt);
    if (data.days) data.days = parseFloat(data.days);

    const absence = await db.absence.update({
      where: { id },
      data,
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

    return NextResponse.json({ success: true, data: absence });
  } catch (error) {
    console.error('Error updating absence:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'absence' },
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
        { success: false, error: 'ID de l\'absence requis' },
        { status: 400 }
      );
    }

    await db.absence.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Absence supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting absence:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'absence' },
      { status: 500 }
    );
  }
}

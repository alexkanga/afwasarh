import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ContractType } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (isActive !== null) where.isActive = isActive === 'true';

    const contracts = await db.contract.findMany({
      where,
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            employeeNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des contrats' },
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
      monthlySalary,
      workHours,
      notes
    } = body;

    // Deactivate existing active contracts for this employee
    await db.contract.updateMany({
      where: {
        employeeId,
        isActive: true
      },
      data: { isActive: false }
    });

    const contract = await db.contract.create({
      data: {
        employeeId,
        type: type as ContractType,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        monthlySalary: parseFloat(monthlySalary),
        workHours: workHours ? parseFloat(workHours) : 35,
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

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du contrat' },
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
        { success: false, error: 'ID du contrat requis' },
        { status: 400 }
      );
    }

    // Handle date fields
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    if (data.monthlySalary) data.monthlySalary = parseFloat(data.monthlySalary);
    if (data.workHours) data.workHours = parseFloat(data.workHours);

    const contract = await db.contract.update({
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

    return NextResponse.json({ success: true, data: contract });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du contrat' },
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
        { success: false, error: 'ID du contrat requis' },
        { status: 400 }
      );
    }

    await db.contract.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Contrat supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du contrat' },
      { status: 500 }
    );
  }
}

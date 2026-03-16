import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmployeeStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as EmployeeStatus | null;
    const departmentId = searchParams.get('departmentId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    const employees = await db.employee.findMany({
      where,
      include: {
        department: true,
        position: true,
        contracts: {
          where: { isActive: true },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: employees });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des employés' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeNumber,
      firstName,
      lastName,
      email,
      phone,
      birthDate,
      hireDate,
      departmentId,
      positionId,
      address,
      photo
    } = body;

    // Check if employee number or email already exists
    const existing = await db.employee.findFirst({
      where: {
        OR: [
          { employeeNumber },
          { email }
        ]
      }
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Un employé avec ce numéro ou cet email existe déjà' },
        { status: 400 }
      );
    }

    const employee = await db.employee.create({
      data: {
        employeeNumber,
        firstName,
        lastName,
        email,
        phone,
        birthDate: birthDate ? new Date(birthDate) : null,
        hireDate: new Date(hireDate),
        departmentId: departmentId || null,
        positionId: positionId || null,
        address,
        photo,
        status: EmployeeStatus.ACTIVE
      },
      include: {
        department: true,
        position: true
      }
    });

    // Create a movement for hiring
    await db.movement.create({
      data: {
        employeeId: employee.id,
        type: 'HIRE',
        effectiveDate: new Date(hireDate),
        toDepartment: departmentId ? (await db.department.findUnique({ where: { id: departmentId } }))?.name : null,
        toPosition: positionId ? (await db.position.findUnique({ where: { id: positionId } }))?.title : null
      }
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'employé' },
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
        { success: false, error: 'ID de l\'employé requis' },
        { status: 400 }
      );
    }

    // Handle date fields
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    if (data.hireDate) data.hireDate = new Date(data.hireDate);
    if (data.terminationDate) data.terminationDate = new Date(data.terminationDate);

    const employee = await db.employee.update({
      where: { id },
      data,
      include: {
        department: true,
        position: true
      }
    });

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour de l\'employé' },
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
        { success: false, error: 'ID de l\'employé requis' },
        { status: 400 }
      );
    }

    // Check for related records
    const employee = await db.employee.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            contracts: true,
            absences: true,
            trainings: true,
            salaries: true,
            movements: true
          }
        }
      }
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Employé non trouvé' },
        { status: 404 }
      );
    }

    // Delete related records first
    await db.contract.deleteMany({ where: { employeeId: id } });
    await db.absence.deleteMany({ where: { employeeId: id } });
    await db.employeeTraining.deleteMany({ where: { employeeId: id } });
    await db.salary.deleteMany({ where: { employeeId: id } });
    await db.movement.deleteMany({ where: { employeeId: id } });

    // Delete employee
    await db.employee.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Employé supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'employé' },
      { status: 500 }
    );
  }
}

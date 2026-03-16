import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { SalaryStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const status = searchParams.get('status') as SalaryStatus | null;

    const where: Record<string, unknown> = {};
    if (employeeId) where.employeeId = employeeId;
    if (status) where.status = status;
    if (year && month) {
      const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      where.month = monthDate;
    } else if (year) {
      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year), 11, 31);
      where.month = { gte: yearStart, lte: yearEnd };
    }

    const salaries = await db.salary.findMany({
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
      orderBy: [
        { month: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    return NextResponse.json({ success: true, data: salaries });
  } catch (error) {
    console.error('Error fetching salaries:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des salaires' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      employeeId,
      month,
      baseSalary,
      bonus,
      overtime,
      deductions,
      socialCharges,
      paidAt,
      notes
    } = body;

    // Calculate gross and net salary
    const base = parseFloat(baseSalary);
    const bonusVal = parseFloat(bonus) || 0;
    const overtimeVal = parseFloat(overtime) || 0;
    const deductionsVal = parseFloat(deductions) || 0;
    const socialChargesVal = parseFloat(socialCharges) || 0;

    const grossSalary = base + bonusVal + overtimeVal;
    const netSalary = grossSalary - deductionsVal - socialChargesVal;

    const salary = await db.salary.create({
      data: {
        employeeId,
        month: new Date(month),
        baseSalary: base,
        bonus: bonusVal,
        overtime: overtimeVal,
        deductions: deductionsVal,
        socialCharges: socialChargesVal,
        grossSalary,
        netSalary,
        paidAt: paidAt ? new Date(paidAt) : null,
        notes,
        status: SalaryStatus.PENDING
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

    return NextResponse.json({ success: true, data: salary });
  } catch (error) {
    console.error('Error creating salary:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du salaire' },
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
        { success: false, error: 'ID du salaire requis' },
        { status: 400 }
      );
    }

    // Handle fields
    if (data.month) data.month = new Date(data.month);
    if (data.paidAt) data.paidAt = new Date(data.paidAt);

    // Recalculate if salary components changed
    if (data.baseSalary !== undefined || data.bonus !== undefined || 
        data.overtime !== undefined || data.deductions !== undefined || 
        data.socialCharges !== undefined) {
      
      const existing = await db.salary.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json(
          { success: false, error: 'Salaire non trouvé' },
          { status: 404 }
        );
      }

      const base = parseFloat(data.baseSalary) || existing.baseSalary;
      const bonus = parseFloat(data.bonus) || existing.bonus;
      const overtime = parseFloat(data.overtime) || existing.overtime;
      const deductions = parseFloat(data.deductions) || existing.deductions;
      const socialCharges = parseFloat(data.socialCharges) || existing.socialCharges;

      data.grossSalary = base + bonus + overtime;
      data.netSalary = data.grossSalary - deductions - socialCharges;
    }

    const salary = await db.salary.update({
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

    return NextResponse.json({ success: true, data: salary });
  } catch (error) {
    console.error('Error updating salary:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour du salaire' },
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
        { success: false, error: 'ID du salaire requis' },
        { status: 400 }
      );
    }

    await db.salary.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Salaire supprimé avec succès' });
  } catch (error) {
    console.error('Error deleting salary:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du salaire' },
      { status: 500 }
    );
  }
}

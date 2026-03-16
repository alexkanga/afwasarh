import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmployeeStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!) : new Date().getFullYear();

    // Effectifs actuels
    const totalEmployees = await db.employee.count({
      where: { status: EmployeeStatus.ACTIVE }
    });

    // Répartition par département
    const employeesByDepartment = await db.employee.groupBy({
      by: ['departmentId'],
      where: { status: EmployeeStatus.ACTIVE },
      _count: { id: true }
    });

    const departments = await db.department.findMany();
    const departmentStats = employeesByDepartment.map(item => {
      const dept = departments.find(d => d.id === item.departmentId);
      return {
        department: dept?.name || 'Non assigné',
        count: item._count.id
      };
    });

    // Nouveaux recrutements cette année
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31);

    const newHires = await db.employee.count({
      where: {
        hireDate: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    // Départs cette année
    const terminations = await db.employee.count({
      where: {
        terminationDate: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    // Taux de turnover
    const avgEmployees = totalEmployees + (newHires - terminations) / 2;
    const turnoverRate = avgEmployees > 0 ? ((terminations / avgEmployees) * 100).toFixed(1) : 0;

    // Répartition par type de contrat
    const contractsByType = await db.contract.groupBy({
      by: ['type'],
      where: { isActive: true },
      _count: { id: true }
    });

    const contractStats = contractsByType.map(item => ({
      type: item.type,
      count: item._count.id
    }));

    // Absences cette année
    const absences = await db.absence.findMany({
      where: {
        startDate: {
          gte: yearStart,
          lte: yearEnd
        }
      },
      include: {
        employee: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    const totalAbsentDays = absences.reduce((sum, a) => sum + a.days, 0);

    const absencesByType: Record<string, number> = {};
    absences.forEach(absence => {
      const type = absence.type;
      absencesByType[type] = (absencesByType[type] || 0) + absence.days;
    });

    // Masse salariale
    const salaries = await db.salary.findMany({
      where: {
        month: {
          gte: yearStart,
          lte: yearEnd
        }
      }
    });

    const totalSalaryCost = salaries.reduce((sum, s) => sum + s.grossSalary + s.socialCharges, 0);
    const totalGrossSalaries = salaries.reduce((sum, s) => sum + s.grossSalary, 0);
    const totalSocialCharges = salaries.reduce((sum, s) => sum + s.socialCharges, 0);

    // Formations
    const employeeTrainings = await db.employeeTraining.findMany({
      where: {
        startDate: {
          gte: yearStart,
          lte: yearEnd
        }
      },
      include: { training: true }
    });

    const totalTrainingCost = employeeTrainings.reduce((sum, et) => {
      if (et.training) {
        return sum + (et.training.cost || 0);
      }
      return sum;
    }, 0);

    const totalTrainingHours = employeeTrainings.reduce((sum, et) => sum + et.hoursCompleted, 0);

    // Évolution mensuelle des effectifs
    const monthlyEvolution = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const hired = await db.employee.count({
        where: {
          hireDate: { gte: monthStart, lte: monthEnd }
        }
      });

      const left = await db.employee.count({
        where: {
          terminationDate: { gte: monthStart, lte: monthEnd }
        }
      });

      monthlyEvolution.push({
        month: monthStart.toLocaleDateString('fr-FR', { month: 'short' }),
        hired,
        left
      });
    }

    // Ancienneté moyenne
    const activeEmployees = await db.employee.findMany({
      where: { status: EmployeeStatus.ACTIVE },
      select: { hireDate: true }
    });

    const now = new Date();
    const avgTenure = activeEmployees.reduce((sum, emp) => {
      const tenure = (now.getTime() - emp.hireDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
      return sum + tenure;
    }, 0) / (activeEmployees.length || 1);

    // Salaires par département
    const salariesByDept = await db.salary.findMany({
      where: {
        month: { gte: yearStart, lte: yearEnd }
      },
      include: {
        employee: {
          include: { department: true }
        }
      }
    });

    const deptSalaryStats: Record<string, number> = {};
    salariesByDept.forEach(s => {
      const deptName = s.employee.department?.name || 'Non assigné';
      deptSalaryStats[deptName] = (deptSalaryStats[deptName] || 0) + s.grossSalary;
    });

    return NextResponse.json({
      success: true,
      data: {
        totalEmployees,
        newHires,
        terminations,
        turnoverRate: parseFloat(turnoverRate as string),
        avgTenure: parseFloat(avgTenure.toFixed(1)),
        totalAbsentDays,
        totalSalaryCost,
        totalGrossSalaries,
        totalSocialCharges,
        totalTrainingCost,
        totalTrainingHours,
        departmentStats,
        contractStats,
        absencesByType,
        monthlyEvolution,
        deptSalaryStats,
        recentAbsences: absences.slice(-5)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des données' },
      { status: 500 }
    );
  }
}

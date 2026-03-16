import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { EmployeeStatus, ContractType, AbsenceType, AbsenceStatus, TrainingStatus, SalaryStatus, MovementType } from '@prisma/client';

export async function GET() {
  try {
    // Check if data already exists
    const existingEmployees = await db.employee.count();
    if (existingEmployees > 0) {
      return NextResponse.json({ 
        success: true, 
        message: 'La base de données contient déjà des données',
        count: existingEmployees
      });
    }

    // Create Departments
    const departments = await Promise.all([
      db.department.create({
        data: { name: 'Direction', description: 'Direction générale de l\'entreprise' }
      }),
      db.department.create({
        data: { name: 'Ressources Humaines', description: 'Gestion du personnel' }
      }),
      db.department.create({
        data: { name: 'Finance & Comptabilité', description: 'Gestion financière et comptable' }
      }),
      db.department.create({
        data: { name: 'Marketing', description: 'Marketing et communication' }
      }),
      db.department.create({
        data: { name: 'Commercial', description: 'Équipe commerciale' }
      }),
      db.department.create({
        data: { name: 'Technique / IT', description: 'Développement et infrastructure' }
      }),
      db.department.create({
        data: { name: 'Production', description: 'Production et fabrication' }
      }),
      db.department.create({
        data: { name: 'Logistique', description: 'Gestion des flux logistiques' }
      })
    ]);

    // Create Positions
    const positions = await Promise.all([
      db.position.create({ data: { title: 'Directeur Général', baseSalary: 8500 } }),
      db.position.create({ data: { title: 'Directeur RH', baseSalary: 6500 } }),
      db.position.create({ data: { title: 'Responsable RH', baseSalary: 4500 } }),
      db.position.create({ data: { title: 'Assistant RH', baseSalary: 2800 } }),
      db.position.create({ data: { title: 'Directeur Financier', baseSalary: 7000 } }),
      db.position.create({ data: { title: 'Comptable', baseSalary: 3500 } }),
      db.position.create({ data: { title: 'Assistant Comptable', baseSalary: 2600 } }),
      db.position.create({ data: { title: 'Directeur Marketing', baseSalary: 6000 } }),
      db.position.create({ data: { title: 'Chef de Produit', baseSalary: 4200 } }),
      db.position.create({ data: { title: 'Responsable Communication', baseSalary: 3800 } }),
      db.position.create({ data: { title: 'Directeur Commercial', baseSalary: 6500 } }),
      db.position.create({ data: { title: 'Commercial Senior', baseSalary: 3800 } }),
      db.position.create({ data: { title: 'Commercial', baseSalary: 3000 } }),
      db.position.create({ data: { title: 'Directeur Technique', baseSalary: 7000 } }),
      db.position.create({ data: { title: 'Développeur Senior', baseSalary: 4500 } }),
      db.position.create({ data: { title: 'Développeur', baseSalary: 3500 } }),
      db.position.create({ data: { title: 'Chef de Projet', baseSalary: 4000 } }),
      db.position.create({ data: { title: 'Responsable Production', baseSalary: 4500 } }),
      db.position.create({ data: { title: 'Technicien', baseSalary: 2800 } }),
      db.position.create({ data: { title: 'Opérateur', baseSalary: 2200 } }),
      db.position.create({ data: { title: 'Responsable Logistique', baseSalary: 4200 } }),
      db.position.create({ data: { title: 'Magasinier', baseSalary: 2400 } })
    ]);

    // Employee data
    const employeeData = [
      // Direction
      { firstName: 'Pierre', lastName: 'Martin', email: 'p.martin@company.fr', dept: 0, pos: 0, salary: 8500, hireDate: '2018-01-15' },
      // RH
      { firstName: 'Sophie', lastName: 'Dubois', email: 's.dubois@company.fr', dept: 1, pos: 1, salary: 6500, hireDate: '2019-03-01' },
      { firstName: 'Marie', lastName: 'Leroy', email: 'm.leroy@company.fr', dept: 1, pos: 2, salary: 4500, hireDate: '2020-06-15' },
      { firstName: 'Thomas', lastName: 'Moreau', email: 't.moreau@company.fr', dept: 1, pos: 3, salary: 2800, hireDate: '2022-09-01' },
      // Finance
      { firstName: 'Jean', lastName: 'Bernard', email: 'j.bernard@company.fr', dept: 2, pos: 4, salary: 7000, hireDate: '2017-05-20' },
      { firstName: 'Claire', lastName: 'Petit', email: 'c.petit@company.fr', dept: 2, pos: 5, salary: 3500, hireDate: '2019-11-10' },
      { firstName: 'Lucas', lastName: 'Garcia', email: 'l.garcia@company.fr', dept: 2, pos: 6, salary: 2600, hireDate: '2023-01-15' },
      // Marketing
      { firstName: 'Emma', lastName: 'Roux', email: 'e.roux@company.fr', dept: 3, pos: 7, salary: 6000, hireDate: '2018-09-01' },
      { firstName: 'Hugo', lastName: 'Simon', email: 'h.simon@company.fr', dept: 3, pos: 8, salary: 4200, hireDate: '2021-03-15' },
      { firstName: 'Léa', lastName: 'Michel', email: 'l.michel@company.fr', dept: 3, pos: 9, salary: 3800, hireDate: '2022-06-01' },
      // Commercial
      { firstName: 'Antoine', lastName: 'David', email: 'a.david@company.fr', dept: 4, pos: 10, salary: 6500, hireDate: '2017-02-01' },
      { firstName: 'Camille', lastName: 'Bertrand', email: 'c.bertrand@company.fr', dept: 4, pos: 11, salary: 3800, hireDate: '2020-01-15' },
      { firstName: 'Maxime', lastName: 'Thomas', email: 'm.thomas@company.fr', dept: 4, pos: 12, salary: 3000, hireDate: '2023-05-01' },
      { firstName: 'Julie', lastName: 'Robert', email: 'j.robert@company.fr', dept: 4, pos: 12, salary: 3000, hireDate: '2023-09-15' },
      // IT
      { firstName: 'Nicolas', lastName: 'Richard', email: 'n.richard@company.fr', dept: 5, pos: 13, salary: 7000, hireDate: '2016-10-01' },
      { firstName: 'Alexandre', lastName: 'Durand', email: 'a.durand@company.fr', dept: 5, pos: 14, salary: 4500, hireDate: '2019-04-15' },
      { firstName: 'Sarah', lastName: 'Lefebvre', email: 's.lefebvre@company.fr', dept: 5, pos: 15, salary: 3500, hireDate: '2022-02-01' },
      { firstName: 'Romain', lastName: 'Girard', email: 'r.girard@company.fr', dept: 5, pos: 16, salary: 4000, hireDate: '2021-07-15' },
      // Production
      { firstName: 'Philippe', lastName: 'Bonnet', email: 'p.bonnet@company.fr', dept: 6, pos: 17, salary: 4500, hireDate: '2018-04-01' },
      { firstName: 'David', lastName: 'Fournier', email: 'd.fournier@company.fr', dept: 6, pos: 18, salary: 2800, hireDate: '2020-08-15' },
      { firstName: 'Stéphane', lastName: 'Lambert', email: 's.lambert@company.fr', dept: 6, pos: 19, salary: 2200, hireDate: '2023-03-01' },
      { firstName: 'Christophe', lastName: 'Fontaine', email: 'c.fontaine@company.fr', dept: 6, pos: 19, salary: 2200, hireDate: '2023-06-15' },
      // Logistique
      { firstName: 'François', lastName: 'Chevalier', email: 'f.chevalier@company.fr', dept: 7, pos: 20, salary: 4200, hireDate: '2019-01-01' },
      { firstName: 'Olivier', lastName: 'Lecoq', email: 'o.lecoq@company.fr', dept: 7, pos: 21, salary: 2400, hireDate: '2021-11-15' },
      { firstName: 'Vincent', lastName: 'Duval', email: 'v.duval@company.fr', dept: 7, pos: 21, salary: 2400, hireDate: '2022-04-01' }
    ];

    // Create Employees
    const employees = [];
    for (let i = 0; i < employeeData.length; i++) {
      const emp = employeeData[i];
      const employee = await db.employee.create({
        data: {
          employeeNumber: `EMP${String(i + 1).padStart(4, '0')}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          phone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          hireDate: new Date(emp.hireDate),
          departmentId: departments[emp.dept].id,
          positionId: positions[emp.pos].id,
          status: EmployeeStatus.ACTIVE,
          birthDate: new Date(1980 + Math.floor(Math.random() * 20), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
        }
      });
      employees.push(employee);

      // Create contract
      await db.contract.create({
        data: {
          employeeId: employee.id,
          type: ContractType.CDI,
          startDate: new Date(emp.hireDate),
          monthlySalary: emp.salary,
          workHours: 35,
          isActive: true
        }
      });

      // Create movement for hiring
      await db.movement.create({
        data: {
          employeeId: employee.id,
          type: MovementType.HIRE,
          effectiveDate: new Date(emp.hireDate),
          toDepartment: departments[emp.dept].name,
          toPosition: positions[emp.pos].title
        }
      });
    }

    // Create Trainings
    const trainings = await Promise.all([
      db.training.create({
        data: {
          title: 'Management d\'équipe',
          description: 'Formation au management et leadership',
          provider: 'CEGOS',
          duration: 21,
          cost: 2500,
          category: 'Management'
        }
      }),
      db.training.create({
        data: {
          title: 'Sécurité au travail',
          description: 'Formation aux normes de sécurité',
          provider: 'AFPA',
          duration: 14,
          cost: 800,
          category: 'Sécurité'
        }
      }),
      db.training.create({
        data: {
          title: 'Anglais professionnel',
          description: 'Anglais pour les affaires',
          provider: 'Berlitz',
          duration: 40,
          cost: 3000,
          category: 'Langues'
        }
      }),
      db.training.create({
        data: {
          title: 'Excel avancé',
          description: 'Maîtrise avancée d\'Excel',
          provider: 'Organisme interne',
          duration: 14,
          cost: 500,
          category: 'Informatique'
        }
      }),
      db.training.create({
        data: {
          title: 'Gestion de projet Agile',
          description: 'Méthodologie Agile et Scrum',
          provider: 'Scrum Alliance',
          duration: 21,
          cost: 2000,
          category: 'Gestion de projet'
        }
      })
    ]);

    // Assign some trainings to employees
    const trainingAssignments = [
      { empIndex: 1, trainingIndex: 0, status: TrainingStatus.COMPLETED, hours: 21 },
      { empIndex: 2, trainingIndex: 0, status: TrainingStatus.IN_PROGRESS, hours: 10 },
      { empIndex: 4, trainingIndex: 2, status: TrainingStatus.COMPLETED, hours: 40 },
      { empIndex: 15, trainingIndex: 4, status: TrainingStatus.COMPLETED, hours: 21 },
      { empIndex: 16, trainingIndex: 4, status: TrainingStatus.IN_PROGRESS, hours: 15 },
      { empIndex: 19, trainingIndex: 1, status: TrainingStatus.COMPLETED, hours: 14 },
      { empIndex: 20, trainingIndex: 1, status: TrainingStatus.COMPLETED, hours: 14 },
      { empIndex: 22, trainingIndex: 1, status: TrainingStatus.COMPLETED, hours: 14 }
    ];

    for (const assignment of trainingAssignments) {
      await db.employeeTraining.create({
        data: {
          employeeId: employees[assignment.empIndex].id,
          trainingId: trainings[assignment.trainingIndex].id,
          status: assignment.status,
          hoursCompleted: assignment.hours,
          startDate: new Date(2024, Math.floor(Math.random() * 6), 1),
          endDate: assignment.status === TrainingStatus.COMPLETED ? new Date(2024, Math.floor(Math.random() * 6) + 6, 28) : null
        }
      });
    }

    // Create Absences for 2024
    const absenceTypes = [AbsenceType.PAID_LEAVE, AbsenceType.SICK_LEAVE, AbsenceType.RTT];
    
    for (const employee of employees) {
      // Each employee has some absences
      const numAbsences = Math.floor(Math.random() * 4) + 1;
      
      for (let i = 0; i < numAbsences; i++) {
        const type = absenceTypes[Math.floor(Math.random() * absenceTypes.length)];
        const month = Math.floor(Math.random() * 12);
        const day = Math.floor(Math.random() * 20) + 1;
        const days = Math.floor(Math.random() * 5) + 1;
        
        const startDate = new Date(2024, month, day);
        const endDate = new Date(2024, month, day + days - 1);
        
        await db.absence.create({
          data: {
            employeeId: employee.id,
            type,
            startDate,
            endDate,
            days,
            status: AbsenceStatus.APPROVED,
            reason: type === AbsenceType.SICK_LEAVE ? 'Certificat médical' : 'Congé planifié',
            approvedAt: new Date(2024, month, day - 3)
          }
        });
      }
    }

    // Create Salaries for 2024
    const currentYear = new Date().getFullYear();
    
    for (const employee of employees) {
      const contract = await db.contract.findFirst({
        where: { employeeId: employee.id, isActive: true }
      });
      
      if (!contract) continue;
      
      for (let month = 0; month < 12; month++) {
        const baseSalary = contract.monthlySalary;
        const bonus = Math.random() > 0.8 ? Math.floor(Math.random() * 500) : 0;
        const overtime = Math.random() > 0.7 ? Math.floor(Math.random() * 300) : 0;
        const deductions = Math.random() > 0.9 ? Math.floor(Math.random() * 200) : 0;
        const socialCharges = baseSalary * 0.22; // ~22% charges sociales
        
        const grossSalary = baseSalary + bonus + overtime;
        const netSalary = grossSalary - deductions - socialCharges;
        
        await db.salary.create({
          data: {
            employeeId: employee.id,
            month: new Date(currentYear, month, 1),
            baseSalary,
            bonus,
            overtime,
            deductions,
            socialCharges,
            grossSalary,
            netSalary,
            status: month < 11 ? SalaryStatus.PAID : SalaryStatus.PENDING,
            paidAt: month < 11 ? new Date(currentYear, month, 28) : null
          }
        });
      }
    }

    // Create some terminations for turnover demo
    const terminatedEmployees = [
      { firstName: 'Julien', lastName: 'Mercier', email: 'j.mercier@company.fr', dept: 3, pos: 9, salary: 3800, hireDate: '2022-01-15', termDate: '2024-03-31' },
      { firstName: 'Aurélie', lastName: 'Colin', email: 'a.colin@company.fr', dept: 4, pos: 12, salary: 3000, hireDate: '2021-06-01', termDate: '2024-06-30' }
    ];

    for (const emp of terminatedEmployees) {
      const employee = await db.employee.create({
        data: {
          employeeNumber: `EMP${String(employees.length + terminatedEmployees.indexOf(emp) + 100).padStart(4, '0')}`,
          firstName: emp.firstName,
          lastName: emp.lastName,
          email: emp.email,
          hireDate: new Date(emp.hireDate),
          terminationDate: new Date(emp.termDate),
          departmentId: departments[emp.dept].id,
          positionId: positions[emp.pos].id,
          status: EmployeeStatus.TERMINATED
        }
      });

      await db.contract.create({
        data: {
          employeeId: employee.id,
          type: ContractType.CDI,
          startDate: new Date(emp.hireDate),
          endDate: new Date(emp.termDate),
          monthlySalary: emp.salary,
          workHours: 35,
          isActive: false
        }
      });

      await db.movement.create({
        data: {
          employeeId: employee.id,
          type: MovementType.HIRE,
          effectiveDate: new Date(emp.hireDate),
          toDepartment: departments[emp.dept].name,
          toPosition: positions[emp.pos].title
        }
      });

      await db.movement.create({
        data: {
          employeeId: employee.id,
          type: MovementType.TERMINATION,
          effectiveDate: new Date(emp.termDate),
          reason: 'Démission volontaire',
          fromDepartment: departments[emp.dept].name,
          fromPosition: positions[emp.pos].title
        }
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Base de données initialisée avec succès',
      stats: {
        departments: departments.length,
        positions: positions.length,
        employees: employees.length + terminatedEmployees.length,
        trainings: trainings.length
      }
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de l\'initialisation de la base de données' },
      { status: 500 }
    );
  }
}

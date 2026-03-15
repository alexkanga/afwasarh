import { PrismaClient, ContractType, EmployeeStatus, AbsenceType, AbsenceStatus, TrainingStatus, SalaryStatus, MovementType } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://neondb_owner:npg_SB1HejDT3ypP@ep-bold-fog-ang2b68d-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require"
});

// French first names and last names
const firstNames = ['Marie', 'Jean', 'Sophie', 'Pierre', 'Claire', 'Michel', 'Isabelle', 'Philippe', 'Catherine', 'Alain', 'Nathalie', 'Christophe', 'Sylvie', 'Marc', 'Françoise', 'Laurent', 'Monique', 'Dominique', 'Brigitte', 'Thierry', 'Sandrine', 'Olivier', 'Valérie', 'Sébastien', 'Karoline', 'Nicolas', 'Émilie', 'Frédéric', 'Céline', 'Thomas', 'Amélie', 'David', 'Julie', 'Éric', 'Laura', 'Vincent', 'Camille', 'Stéphane', 'Hélène', 'Raphaël', 'Manon', 'Antoine', 'Pauline', 'Julien', 'Élise', 'Mathieu', 'Charlotte', 'Baptiste', 'Chloé', 'Alexandre'];

const lastNames = ['Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Simon', 'Laurent', 'Lefebvre', 'Michel', 'Garcia', 'Bertrand', 'David', 'Roux', 'Vincent', 'Fournier', 'Morel', 'Girard', 'André', 'Lefèvre', 'Mercier', 'Dupont', 'Lambert', 'Bonnet', 'François', 'Martinez', 'Legrand', 'Garnier', 'Faure', 'Rousseau', 'Blanc', 'Guerin', 'Muller', 'Henry', 'Roussel', 'Gautier'];

const departments = [
  { name: 'Direction', description: 'Direction générale de l\'entreprise' },
  { name: 'Ressources Humaines', description: 'Gestion des ressources humaines' },
  { name: 'Finance & Comptabilité', description: 'Gestion financière et comptable' },
  { name: 'Technique / IT', description: 'Développement et infrastructure technique' },
  { name: 'Marketing', description: 'Stratégie marketing et communication' },
  { name: 'Commercial', description: 'Équipe commerciale' },
  { name: 'Production', description: 'Production et fabrication' },
  { name: 'Logistique', description: 'Gestion des flux logistiques' },
];

const positions = [
  { title: 'Directeur Général', baseSalary: 8500, dept: 'Direction' },
  { title: 'Directeur RH', baseSalary: 5500, dept: 'Ressources Humaines' },
  { title: 'Chargé RH', baseSalary: 3200, dept: 'Ressources Humaines' },
  { title: 'Assistant RH', baseSalary: 2800, dept: 'Ressources Humaines' },
  { title: 'Directeur Financier', baseSalary: 6000, dept: 'Finance & Comptabilité' },
  { title: 'Comptable', baseSalary: 3500, dept: 'Finance & Comptabilité' },
  { title: 'Assistant Comptable', baseSalary: 2600, dept: 'Finance & Comptabilité' },
  { title: 'DSI', baseSalary: 5800, dept: 'Technique / IT' },
  { title: 'Développeur Senior', baseSalary: 4500, dept: 'Technique / IT' },
  { title: 'Développeur Junior', baseSalary: 3200, dept: 'Technique / IT' },
  { title: 'Technicien IT', baseSalary: 2800, dept: 'Technique / IT' },
  { title: 'Directeur Marketing', baseSalary: 5200, dept: 'Marketing' },
  { title: 'Chef de Produit', baseSalary: 4200, dept: 'Marketing' },
  { title: 'Chargé de Communication', baseSalary: 3000, dept: 'Marketing' },
  { title: 'Directeur Commercial', baseSalary: 5500, dept: 'Commercial' },
  { title: 'Commercial Senior', baseSalary: 3800, dept: 'Commercial' },
  { title: 'Commercial', baseSalary: 3000, dept: 'Commercial' },
  { title: 'Directeur Production', baseSalary: 5200, dept: 'Production' },
  { title: 'Ingénieur Production', baseSalary: 4000, dept: 'Production' },
  { title: 'Technicien Production', baseSalary: 2800, dept: 'Production' },
  { title: 'Opérateur', baseSalary: 2300, dept: 'Production' },
  { title: 'Responsable Logistique', baseSalary: 4200, dept: 'Logistique' },
  { title: 'Gestionnaire Stocks', baseSalary: 2800, dept: 'Logistique' },
  { title: 'Préparateur de Commandes', baseSalary: 2200, dept: 'Logistique' },
  { title: 'Chef de Projet', baseSalary: 4000, dept: 'Technique / IT' },
  { title: 'Stagiaire IT', baseSalary: 800, dept: 'Technique / IT' },
  { title: 'Apprenti Comptable', baseSalary: 1200, dept: 'Finance & Comptabilité' },
  { title: 'Intérimaire Production', baseSalary: 2500, dept: 'Production' },
];

const trainings = [
  { title: 'Management d\'équipe', description: 'Formation au management et leadership', provider: 'CEGOS', duration: 21, cost: 2500, category: 'Management' },
  { title: 'Gestion de projet Agile', description: 'Méthodologie Agile et Scrum', provider: 'Scrum Alliance', duration: 21, cost: 2000, category: 'Gestion de projet' },
  { title: 'Anglais professionnel', description: 'Anglais des affaires', provider: 'Wall Street English', duration: 40, cost: 3000, category: 'Langues' },
  { title: 'Excel avancé', description: 'Fonctions avancées et macros Excel', provider: 'Organisme Formation', duration: 14, cost: 800, category: 'Informatique' },
  { title: 'Secourisme au travail', description: 'Formation SST', provider: 'Croix Rouge', duration: 14, cost: 400, category: 'Sécurité' },
  { title: 'Negociation commerciale', description: 'Techniques de vente et négociation', provider: 'Formation Pro', duration: 16, cost: 1500, category: 'Commercial' },
  { title: 'Comptabilité générale', description: 'Les bases de la comptabilité', provider: 'Expert Compta', duration: 24, cost: 1800, category: 'Finance' },
  { title: 'Développement personnel', description: 'Gestion du stress et efficacité personnelle', provider: 'Coach Pro', duration: 8, cost: 600, category: 'Personnel' },
];

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail(firstName: string, lastName: string, index: number): string {
  const cleanFirst = firstName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const cleanLast = lastName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return `${cleanFirst}.${cleanLast}${index}@company.fr`;
}

function generatePhone(): string {
  return `+33${randomInt(600000000, 799999999)}`;
}

async function main() {
  console.log('🔄 Début du seed complet...');

  // Create departments
  console.log('🏢 Création des départements...');
  const deptMap: Record<string, string> = {};
  for (const dept of departments) {
    const created = await prisma.department.create({ data: dept });
    deptMap[dept.name] = created.id;
  }

  // Create positions
  console.log('💼 Création des postes...');
  const posMap: Record<string, { id: string; baseSalary: number }> = {};
  for (const pos of positions) {
    const created = await prisma.position.create({
      data: {
        title: pos.title,
        baseSalary: pos.baseSalary,
        description: `Poste de ${pos.title} dans le département ${pos.dept}`
      }
    });
    posMap[pos.title] = { id: created.id, baseSalary: pos.baseSalary };
  }

  // Create employees with different contract types
  console.log('👥 Création des employés...');
  const employees: { id: string; dept: string; position: string; status: EmployeeStatus; hireDate: Date; terminationDate?: Date }[] = [];

  // Active employees with varied contracts
  const contractDistribution = [
    { type: ContractType.CDI, count: 32 },
    { type: ContractType.CDD, count: 5 },
    { type: ContractType.INTERIM, count: 2 },
    { type: ContractType.APPRENTICESHIP, count: 2 },
    { type: ContractType.PART_TIME, count: 4 },
  ];

  let empIndex = 0;
  
  for (const dist of contractDistribution) {
    for (let i = 0; i < dist.count; i++) {
      const firstName = firstNames[empIndex % firstNames.length];
      const lastName = lastNames[(empIndex + 5) % lastNames.length];
      const dept = departments[empIndex % departments.length].name;
      const deptPositions = positions.filter(p => p.dept === dept);
      const pos = deptPositions.length > 0 ? deptPositions[i % deptPositions.length] : positions[empIndex % positions.length];
      
      const hireDate = randomDate(new Date('2025-01-01'), new Date('2026-02-15'));
      
      const employee = await prisma.employee.create({
        data: {
          employeeNumber: `EMP${String(empIndex + 1).padStart(4, '0')}`,
          firstName,
          lastName,
          email: generateEmail(firstName, lastName, empIndex),
          phone: generatePhone(),
          birthDate: randomDate(new Date('1970-01-01'), new Date('2000-12-31')),
          hireDate,
          status: EmployeeStatus.ACTIVE,
          departmentId: deptMap[dept],
          positionId: posMap[pos.title]?.id,
        }
      });

      // Create contract
      const baseSalary = posMap[pos.title]?.baseSalary || 3000;
      const salaryVar = baseSalary * (0.9 + Math.random() * 0.2);
      let endDate: Date | null = null;
      let workHours = 35;

      if (dist.type === ContractType.CDD) {
        endDate = new Date('2026-08-31');
      } else if (dist.type === ContractType.INTERIM) {
        endDate = new Date('2026-04-30');
      } else if (dist.type === ContractType.APPRENTICESHIP) {
        endDate = new Date('2027-08-31');
        workHours = 28;
      } else if (dist.type === ContractType.PART_TIME) {
        workHours = 24;
      }

      await prisma.contract.create({
        data: {
          employeeId: employee.id,
          type: dist.type,
          startDate: hireDate,
          endDate,
          monthlySalary: Math.round(salaryVar),
          workHours,
          isActive: true,
        }
      });

      // Create hire movement
      await prisma.movement.create({
        data: {
          employeeId: employee.id,
          type: MovementType.HIRE,
          effectiveDate: hireDate,
          toDepartment: dept,
          toPosition: pos.title,
        }
      });

      employees.push({ id: employee.id, dept, position: pos.title, status: EmployeeStatus.ACTIVE, hireDate });
      empIndex++;
    }
  }

  // Terminated employees
  for (let i = 0; i < 5; i++) {
    const firstName = firstNames[(empIndex + i) % firstNames.length];
    const lastName = lastNames[(empIndex + i + 3) % lastNames.length];
    const dept = departments[i % departments.length].name;
    const deptPositions = positions.filter(p => p.dept === dept);
    const pos = deptPositions.length > 0 ? deptPositions[0] : positions[0];
    
    const hireDate = randomDate(new Date('2023-01-01'), new Date('2025-06-30'));
    const terminationDate = randomDate(new Date('2025-09-01'), new Date('2026-02-28'));
    
    const employee = await prisma.employee.create({
      data: {
        employeeNumber: `EMP${String(empIndex + i + 1).padStart(4, '0')}`,
        firstName,
        lastName,
        email: generateEmail(firstName, lastName, empIndex + i),
        phone: generatePhone(),
        birthDate: randomDate(new Date('1970-01-01'), new Date('2000-12-31')),
        hireDate,
        terminationDate,
        status: EmployeeStatus.TERMINATED,
        departmentId: deptMap[dept],
        positionId: posMap[pos.title]?.id,
      }
    });

    await prisma.contract.create({
      data: {
        employeeId: employee.id,
        type: ContractType.CDI,
        startDate: hireDate,
        endDate: terminationDate,
        monthlySalary: Math.round((posMap[pos.title]?.baseSalary || 3000) * 0.95),
        workHours: 35,
        isActive: false,
      }
    });

    await prisma.movement.create({
      data: {
        employeeId: employee.id,
        type: MovementType.HIRE,
        effectiveDate: hireDate,
        toDepartment: dept,
        toPosition: pos.title,
      }
    });

    await prisma.movement.create({
      data: {
        employeeId: employee.id,
        type: MovementType.TERMINATION,
        effectiveDate: terminationDate,
        reason: randomElement(['Démission', 'Fin de contrat', 'Licenciement', 'Départ à la retraite']),
      }
    });
  }

  console.log(`✅ ${empIndex + 5} employés créés`);

  // Create trainings
  console.log('🎓 Création des formations...');
  const trainingMap: Record<string, string> = {};
  for (const train of trainings) {
    const startDate = randomDate(new Date('2026-01-15'), new Date('2026-06-15'));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + train.duration);

    const created = await prisma.training.create({
      data: {
        ...train,
        startDate,
        endDate,
        location: randomElement(['Paris', 'Lyon', 'Marseille', 'En ligne', 'Toulouse']),
      }
    });
    trainingMap[train.title] = created.id;
  }

  // Assign trainings to employees
  console.log('📚 Assignation formations...');
  const trainingTitles = Object.keys(trainingMap);
  for (const emp of employees) {
    const numTrainings = randomInt(0, 2);
    for (let i = 0; i < numTrainings; i++) {
      const title = trainingTitles[randomInt(0, trainingTitles.length - 1)];
      const training = trainings.find(t => t.title === title)!;
      const status = randomElement([TrainingStatus.REGISTERED, TrainingStatus.IN_PROGRESS, TrainingStatus.COMPLETED]);
      
      await prisma.employeeTraining.create({
        data: {
          employeeId: emp.id,
          trainingId: trainingMap[title],
          status,
          hoursCompleted: status === TrainingStatus.COMPLETED ? training.duration : status === TrainingStatus.IN_PROGRESS ? training.duration / 2 : 0,
          startDate: status !== TrainingStatus.REGISTERED ? new Date('2026-01-15') : null,
          endDate: status === TrainingStatus.COMPLETED ? new Date('2026-03-01') : null,
        }
      });
    }
  }

  // Create absences
  console.log('🏖️ Création des absences...');
  const absenceTypes = Object.values(AbsenceType);
  const reasons: Record<AbsenceType, string> = {
    [AbsenceType.PAID_LEAVE]: 'Vacances',
    [AbsenceType.SICK_LEAVE]: 'Maladie',
    [AbsenceType.RTT]: 'RTT',
    [AbsenceType.UNPAID_LEAVE]: 'Congé sans solde',
    [AbsenceType.MATERNITY]: 'Maternité',
    [AbsenceType.PATERNITY]: 'Paternité',
    [AbsenceType.FAMILY_EVENT]: 'Événement familial',
    [AbsenceType.OTHER]: 'Autre',
  };

  for (const emp of employees) {
    const numAbsences = randomInt(1, 4);
    for (let i = 0; i < numAbsences; i++) {
      const type = randomElement(absenceTypes);
      const startDate = randomDate(new Date('2025-01-01'), new Date('2026-03-10'));
      const days = type === AbsenceType.MATERNITY ? randomInt(90, 112) : type === AbsenceType.SICK_LEAVE ? randomInt(2, 10) : randomInt(1, 5);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + days);

      await prisma.absence.create({
        data: {
          employeeId: emp.id,
          type,
          startDate,
          endDate,
          days,
          reason: reasons[type],
          status: Math.random() > 0.2 ? AbsenceStatus.APPROVED : AbsenceStatus.PENDING,
          approvedBy: 'Directeur RH',
          approvedAt: new Date(startDate.getTime() - 86400000),
        }
      });
    }
  }

  // Create salaries for recent months only (2026)
  console.log('💰 Création des salaires (2026)...');
  const months = [new Date('2026-01-01'), new Date('2026-02-01'), new Date('2026-03-01')];

  for (const emp of employees) {
    const baseSalary = posMap[emp.position]?.baseSalary || 3000;
    
    for (const month of months) {
      if (month >= emp.hireDate) {
        const bonus = Math.random() > 0.7 ? Math.round(baseSalary * 0.1) : 0;
        const overtime = Math.random() > 0.8 ? Math.round(baseSalary * 0.05) : 0;
        const socialCharges = Math.round(baseSalary * 0.22);
        const grossSalary = baseSalary + bonus + overtime;
        const netSalary = grossSalary - socialCharges;
        const isPaid = month < new Date('2026-03-01');

        await prisma.salary.create({
          data: {
            employeeId: emp.id,
            month,
            baseSalary,
            bonus,
            overtime,
            deductions: 0,
            socialCharges,
            grossSalary,
            netSalary,
            status: isPaid ? SalaryStatus.PAID : SalaryStatus.PENDING,
            paidAt: isPaid ? new Date(month.getFullYear(), month.getMonth() + 1, 5) : null,
          }
        });
      }
    }
  }

  console.log('✅ Seed terminé avec succès !');
  
  // Summary
  console.log('\n📊 Résumé:');
  console.log(`   - Départements: ${await prisma.department.count()}`);
  console.log(`   - Postes: ${await prisma.position.count()}`);
  console.log(`   - Employés: ${await prisma.employee.count()}`);
  console.log(`     - Actifs: ${await prisma.employee.count({ where: { status: EmployeeStatus.ACTIVE } })}`);
  console.log(`     - Terminés: ${await prisma.employee.count({ where: { status: EmployeeStatus.TERMINATED } })}`);
  console.log(`   - Contrats: ${await prisma.contract.count()}`);
  console.log(`     - CDI: ${await prisma.contract.count({ where: { type: ContractType.CDI } })}`);
  console.log(`     - CDD: ${await prisma.contract.count({ where: { type: ContractType.CDD } })}`);
  console.log(`     - Intérim: ${await prisma.contract.count({ where: { type: ContractType.INTERIM } })}`);
  console.log(`     - Apprentissage: ${await prisma.contract.count({ where: { type: ContractType.APPRENTICESHIP } })}`);
  console.log(`     - Temps partiel: ${await prisma.contract.count({ where: { type: ContractType.PART_TIME } })}`);
  console.log(`   - Formations: ${await prisma.training.count()}`);
  console.log(`   - Absences: ${await prisma.absence.count()}`);
  console.log(`   - Salaires: ${await prisma.salary.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

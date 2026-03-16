'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  Users, UserPlus, UserMinus, TrendingUp, Calendar, GraduationCap, 
  Euro, Building2, Briefcase, FileText, Download, Plus, Edit, Trash2,
  Eye, Search, Filter, RefreshCw, ChevronDown, ChevronUp, X, Check,
  AlertCircle, Clock, Award, Target, Activity, PieChart as PieChartIcon,
  BarChart3, TrendingDown, UserCheck, UserX, Ban, MoreHorizontal, Upload
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Types
interface Employee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthDate?: string;
  hireDate: string;
  terminationDate?: string;
  status: string;
  department?: { id: string; name: string };
  position?: { id: string; title: string };
  contracts?: Contract[];
}

interface Department {
  id: string;
  name: string;
  description?: string;
  manager?: { firstName: string; lastName: string };
  _count?: { employees: number };
}

interface Position {
  id: string;
  title: string;
  description?: string;
  baseSalary?: number;
  _count?: { employees: number };
}

interface Contract {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate?: string;
  monthlySalary: number;
  workHours: number;
  isActive: boolean;
  employee?: { firstName: string; lastName: string; employeeNumber: string };
}

interface Absence {
  id: string;
  employeeId: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  reason?: string;
  status: string;
  employee?: { 
    firstName: string; 
    lastName: string; 
    employeeNumber: string;
    department?: { name: string };
  };
}

interface Training {
  id: string;
  title: string;
  description?: string;
  provider?: string;
  duration?: number;
  cost?: number;
  category?: string;
  _count?: { employeeTrainings: number };
}

interface EmployeeTraining {
  id: string;
  employeeId: string;
  trainingId: string;
  status: string;
  hoursCompleted: number;
  startDate?: string;
  endDate?: string;
  employee?: { 
    firstName: string; 
    lastName: string; 
    employeeNumber: string;
    department?: { name: string };
  };
  training?: Training;
}

interface Salary {
  id: string;
  employeeId: string;
  month: string;
  baseSalary: number;
  bonus: number;
  overtime: number;
  deductions: number;
  socialCharges: number;
  grossSalary: number;
  netSalary: number;
  status: string;
  paidAt?: string;
  employee?: { 
    firstName: string; 
    lastName: string; 
    employeeNumber: string;
    department?: { name: string };
    position?: { title: string };
  };
}

interface DashboardData {
  totalEmployees: number;
  newHires: number;
  terminations: number;
  turnoverRate: number;
  avgTenure: number;
  totalAbsentDays: number;
  totalSalaryCost: number;
  totalGrossSalaries: number;
  totalSocialCharges: number;
  totalTrainingCost: number;
  totalTrainingHours: number;
  departmentStats: { department: string; count: number }[];
  contractStats: { type: string; count: number }[];
  absencesByType: Record<string, number>;
  monthlyEvolution: { month: string; hired: number; left: number }[];
  deptSalaryStats: Record<string, number>;
  recentAbsences: Absence[];
}

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const CONTRACT_TYPES: Record<string, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  INTERIM: 'Intérim',
  APPRENTICESHIP: 'Apprentissage',
  PART_TIME: 'Temps partiel'
};

const ABSENCE_TYPES: Record<string, string> = {
  PAID_LEAVE: 'Congés payés',
  SICK_LEAVE: 'Arrêt maladie',
  RTT: 'RTT',
  UNPAID_LEAVE: 'Sans solde',
  MATERNITY: 'Maternité',
  PATERNITY: 'Paternité',
  FAMILY_EVENT: 'Événement familial',
  OTHER: 'Autre'
};

const TRAINING_STATUS: Record<string, string> = {
  REGISTERED: 'Inscrit',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminé',
  CANCELLED: 'Annulé',
  FAILED: 'Échoué'
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  PAID: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  TERMINATED: 'bg-gray-100 text-gray-800',
  ON_LEAVE: 'bg-blue-100 text-blue-800',
  PROBATION: 'bg-orange-100 text-orange-800'
};

export default function HRDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [employeeTrainings, setEmployeeTrainings] = useState<EmployeeTraining[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAbsenceModal, setShowAbsenceModal] = useState(false);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);
  const [showTrainingCatalogModal, setShowTrainingCatalogModal] = useState(false);
  
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editingAbsence, setEditingAbsence] = useState<Absence | null>(null);
  const [editingTraining, setEditingTraining] = useState<EmployeeTraining | null>(null);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string } | null>(null);
  
  const { toast } = useToast();

  // Fetch functions
  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`/api/dashboard?year=${selectedYear}`);
      const data = await response.json();
      if (data.success) {
        setDashboardData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    }
  }, [selectedYear]);

  const fetchEmployees = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterDepartment !== 'all') params.append('departmentId', filterDepartment);
      
      const response = await fetch(`/api/employees?${params}`);
      const data = await response.json();
      if (data.success) {
        setEmployees(data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  }, [filterStatus, filterDepartment]);

  const fetchDepartments = useCallback(async () => {
    try {
      const response = await fetch('/api/departments');
      const data = await response.json();
      if (data.success) {
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  }, []);

  const fetchPositions = useCallback(async () => {
    try {
      const response = await fetch('/api/positions');
      const data = await response.json();
      if (data.success) {
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    try {
      const response = await fetch('/api/contracts?isActive=true');
      const data = await response.json();
      if (data.success) {
        setContracts(data.data);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
    }
  }, []);

  const fetchAbsences = useCallback(async () => {
    try {
      const response = await fetch(`/api/absences?year=${selectedYear}`);
      const data = await response.json();
      if (data.success) {
        setAbsences(data.data);
      }
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  }, [selectedYear]);

  const fetchTrainings = useCallback(async () => {
    try {
      const response = await fetch('/api/trainings');
      const data = await response.json();
      if (data.success) {
        setTrainings(data.data);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    }
  }, []);

  const fetchEmployeeTrainings = useCallback(async () => {
    try {
      const response = await fetch('/api/employee-trainings');
      const data = await response.json();
      if (data.success) {
        setEmployeeTrainings(data.data);
      }
    } catch (error) {
      console.error('Error fetching employee trainings:', error);
    }
  }, []);

  const fetchSalaries = useCallback(async () => {
    try {
      const response = await fetch(`/api/salaries?year=${selectedYear}`);
      const data = await response.json();
      if (data.success) {
        setSalaries(data.data);
      }
    } catch (error) {
      console.error('Error fetching salaries:', error);
    }
  }, [selectedYear]);

  const seedDatabase = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/seed');
      const data = await response.json();
      if (data.success) {
        toast({
          title: 'Succès',
          description: data.message
        });
        // Refresh all data
        await Promise.all([
          fetchDashboardData(),
          fetchEmployees(),
          fetchDepartments(),
          fetchPositions(),
          fetchContracts(),
          fetchAbsences(),
          fetchTrainings(),
          fetchEmployeeTrainings(),
          fetchSalaries()
        ]);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      toast({
        title: 'Erreur',
        description: 'Erreur lors de l\'initialisation',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        fetchEmployees(),
        fetchDepartments(),
        fetchPositions(),
        fetchContracts(),
        fetchAbsences(),
        fetchTrainings(),
        fetchEmployeeTrainings(),
        fetchSalaries()
      ]);
      setLoading(false);
    };
    loadData();
  }, [fetchDashboardData, fetchEmployees, fetchDepartments, fetchPositions, fetchContracts, fetchAbsences, fetchTrainings, fetchEmployeeTrainings, fetchSalaries]);

  // Refresh employees when filters change
  useEffect(() => {
    fetchEmployees();
  }, [filterStatus, filterDepartment, fetchEmployees]);

  // Delete handler
  const handleDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      const response = await fetch(`/api/${deleteConfirm.type}?id=${deleteConfirm.id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      
      if (data.success) {
        toast({ title: 'Succès', description: 'Élément supprimé' });
        // Refresh appropriate data
        switch (deleteConfirm.type) {
          case 'employees':
            fetchEmployees();
            break;
          case 'absences':
            fetchAbsences();
            break;
          case 'trainings':
            fetchTrainings();
            fetchEmployeeTrainings();
            break;
          case 'employee-trainings':
            fetchEmployeeTrainings();
            break;
          case 'salaries':
            fetchSalaries();
            break;
          case 'contracts':
            fetchContracts();
            break;
        }
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Erreur lors de la suppression', variant: 'destructive' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  // Filter employees by search
  const filteredEmployees = employees.filter(emp => 
    `${emp.firstName} ${emp.lastName} ${emp.employeeNumber} ${emp.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
  };

  // Format date
  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM yyyy', { locale: fr });
    } catch {
      return date;
    }
  };

  // Calculate age from birthdate
  const calculateAge = (birthDate?: string) => {
    if (!birthDate) return '-';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Export data to CSV
  const exportData = () => {
    // Prepare employees data
    const employeesData = employees.map(emp => ({
      'N° Employé': emp.employeeNumber,
      'Prénom': emp.firstName,
      'Nom': emp.lastName,
      'Email': emp.email,
      'Téléphone': emp.phone || '',
      'Département': emp.department?.name || '',
      'Poste': emp.position?.title || '',
      'Date d\'entrée': formatDate(emp.hireDate),
      'Statut': emp.status === 'ACTIVE' ? 'Actif' : emp.status === 'TERMINATED' ? 'Parti' : emp.status === 'ON_LEAVE' ? 'En congé' : emp.status
    }));

    // Convert to CSV
    const headers = Object.keys(employeesData[0] || {});
    const csvContent = [
      headers.join(';'),
      ...employeesData.map(row => headers.map(h => `"${row[h as keyof typeof row] || ''}"`).join(';'))
    ].join('\n');

    // Download file
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `export_rh_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({ title: 'Succès', description: 'Données exportées avec succès' });
  };

  // Import data from CSV
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          toast({ title: 'Erreur', description: 'Le fichier est vide ou mal formaté', variant: 'destructive' });
          return;
        }

        // Parse header
        const headers = lines[0].split(';').map(h => h.replace(/"/g, '').trim());
        
        // Map headers to indices
        const headerMap: Record<string, number> = {};
        headers.forEach((h, i) => {
          if (h.includes('N°') || h.includes('Employé')) headerMap['employeeNumber'] = i;
          else if (h === 'Prénom') headerMap['firstName'] = i;
          else if (h === 'Nom') headerMap['lastName'] = i;
          else if (h === 'Email') headerMap['email'] = i;
          else if (h === 'Téléphone') headerMap['phone'] = i;
          else if (h === 'Département') headerMap['department'] = i;
          else if (h === 'Poste') headerMap['position'] = i;
          else if (h.includes('Date d\'entrée') || h.includes("Date d'entrée")) headerMap['hireDate'] = i;
          else if (h === 'Statut') headerMap['status'] = i;
        });

        let imported = 0;
        let errors = 0;

        // Process each row
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(';').map(v => v.replace(/"/g, '').trim());
          
          if (values.length < Object.keys(headerMap).length) continue;

          const employeeNumber = values[headerMap['employeeNumber']] || `EMP${Date.now()}${i}`;
          const firstName = values[headerMap['firstName']] || '';
          const lastName = values[headerMap['lastName']] || '';
          const email = values[headerMap['email']] || '';
          const phone = values[headerMap['phone']] || '';
          const departmentName = values[headerMap['department']] || '';
          const positionTitle = values[headerMap['position']] || '';
          const hireDateStr = values[headerMap['hireDate']] || '';
          const statusStr = values[headerMap['status']] || 'Actif';

          // Skip if missing required fields
          if (!firstName || !lastName || !email) {
            errors++;
            continue;
          }

          try {
            // Find or create department
            let departmentId: string | null = null;
            if (departmentName) {
              let dept = departments.find(d => d.name.toLowerCase() === departmentName.toLowerCase());
              if (!dept) {
                const response = await fetch('/api/departments', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ name: departmentName })
                });
                const data = await response.json();
                if (data.success) {
                  departmentId = data.data.id;
                  await fetchDepartments();
                }
              } else {
                departmentId = dept.id;
              }
            }

            // Find or create position
            let positionId: string | null = null;
            if (positionTitle) {
              let pos = positions.find(p => p.title.toLowerCase() === positionTitle.toLowerCase());
              if (!pos) {
                const response = await fetch('/api/positions', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: positionTitle })
                });
                const data = await response.json();
                if (data.success) {
                  positionId = data.data.id;
                  await fetchPositions();
                }
              } else {
                positionId = pos.id;
              }
            }

            // Parse hire date (format: dd MMM yyyy or yyyy-MM-dd)
            let hireDate = new Date();
            if (hireDateStr) {
              try {
                // Try parsing as ISO format first
                if (hireDateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                  hireDate = new Date(hireDateStr);
                } else {
                  // Try parsing French format (dd MMM yyyy)
                  const parts = hireDateStr.split(' ');
                  if (parts.length === 3) {
                    const months: Record<string, number> = {
                      'janv': 0, 'févr': 1, 'mars': 2, 'avr': 3, 'mai': 4, 'juin': 5,
                      'juil': 6, 'août': 7, 'sept': 8, 'oct': 9, 'nov': 10, 'déc': 11,
                      'jan': 0, 'fev': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
                      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
                    };
                    const day = parseInt(parts[0]);
                    const month = months[parts[1].toLowerCase()] ?? 0;
                    const year = parseInt(parts[2]);
                    hireDate = new Date(year, month, day);
                  }
                }
              } catch {
                hireDate = new Date();
              }
            }

            // Map status
            let status = 'ACTIVE';
            if (statusStr.toLowerCase().includes('parti') || statusStr.toLowerCase().includes('terminé')) {
              status = 'TERMINATED';
            } else if (statusStr.toLowerCase().includes('congé') || statusStr.toLowerCase().includes('conge')) {
              status = 'ON_LEAVE';
            } else if (statusStr.toLowerCase().includes('essai') || statusStr.toLowerCase().includes('probation')) {
              status = 'PROBATION';
            }

            // Create employee
            const response = await fetch('/api/employees', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                employeeNumber,
                firstName,
                lastName,
                email,
                phone: phone || null,
                hireDate: hireDate.toISOString().split('T')[0],
                departmentId,
                positionId,
                status
              })
            });

            const data = await response.json();
            if (data.success) {
              imported++;
            } else {
              // If employee already exists, try to update
              if (data.error?.includes('existe déjà')) {
                errors++;
              }
            }
          } catch (err) {
            errors++;
            console.error('Error importing row:', err);
          }
        }

        // Refresh data
        await Promise.all([
          fetchEmployees(),
          fetchDepartments(),
          fetchPositions(),
          fetchDashboardData()
        ]);

        toast({ 
          title: 'Import terminé', 
          description: `${imported} employé(s) importé(s). ${errors > 0 ? `${errors} erreur(s).` : ''}`
        });
      } catch (error) {
        console.error('Error parsing file:', error);
        toast({ title: 'Erreur', description: 'Erreur lors de la lecture du fichier', variant: 'destructive' });
      }
    };

    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-lg text-slate-600">Chargement du tableau de bord RH...</p>
        </div>
      </div>
    );
  }

  // Check if no data
  const hasNoData = employees.length === 0;

  if (hasNoData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Tableau de Bord RH</CardTitle>
            <CardDescription>Initialisation de la base de données</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Database className="h-16 w-16 mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 mb-6">
              La base de données est vide. Cliquez sur le bouton ci-dessous pour initialiser 
              avec des données de démonstration.
            </p>
            <Button onClick={seedDatabase} className="w-full" size="lg">
              <Database className="h-4 w-4 mr-2" />
              Initialiser les données de démonstration
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tableau de Bord RH</h1>
                <p className="text-sm text-slate-500">Gestion des Ressources Humaines</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2023, 2022].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={() => fetchDashboardData()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto p-1">
            <TabsTrigger value="dashboard" className="flex items-center gap-2 py-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Tableau de bord</span>
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2 py-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Effectifs</span>
            </TabsTrigger>
            <TabsTrigger value="absences" className="flex items-center gap-2 py-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Absences</span>
            </TabsTrigger>
            <TabsTrigger value="trainings" className="flex items-center gap-2 py-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Formations</span>
            </TabsTrigger>
            <TabsTrigger value="salaries" className="flex items-center gap-2 py-2">
              <Euro className="h-4 w-4" />
              <span className="hidden sm:inline">Salaires</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 py-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Rapports</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Total Effectifs</p>
                      <p className="text-3xl font-bold">{dashboardData?.totalEmployees || 0}</p>
                    </div>
                    <Users className="h-10 w-10 text-emerald-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Nouveaux Recrutements</p>
                      <p className="text-3xl font-bold">{dashboardData?.newHires || 0}</p>
                    </div>
                    <UserPlus className="h-10 w-10 text-blue-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-100 text-sm">Départs</p>
                      <p className="text-3xl font-bold">{dashboardData?.terminations || 0}</p>
                    </div>
                    <UserMinus className="h-10 w-10 text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Turnover</p>
                      <p className="text-3xl font-bold">{dashboardData?.turnoverRate || 0}%</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-purple-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Jours d'absence</p>
                      <p className="text-2xl font-bold">{dashboardData?.totalAbsentDays || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <Euro className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Masse salariale</p>
                      <p className="text-xl font-bold">{formatCurrency(dashboardData?.totalSalaryCost || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Heures formation</p>
                      <p className="text-2xl font-bold">{dashboardData?.totalTrainingHours || 0}h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-cyan-100 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Ancienneté moy.</p>
                      <p className="text-2xl font-bold">{dashboardData?.avgTenure || 0} ans</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 1 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Effectifs par département
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData?.departmentStats || []} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis dataKey="department" type="category" width={100} fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#22c55e" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Types de contrats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData?.contractStats || []}
                          dataKey="count"
                          nameKey="type"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ type, count }) => `${CONTRACT_TYPES[type] || type}: ${count}`}
                        >
                          {dashboardData?.contractStats?.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Évolution mensuelle des effectifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashboardData?.monthlyEvolution || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="hired" name="Recrutements" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.6} />
                        <Area type="monotone" dataKey="left" name="Départs" stackId="2" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Absences par type
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={Object.entries(dashboardData?.absencesByType || {}).map(([type, days]) => ({
                          type: ABSENCE_TYPES[type] || type,
                          days
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="type" fontSize={10} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="days" name="Jours" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Salary by Department */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="h-5 w-5" />
                  Masse salariale par département
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={Object.entries(dashboardData?.deptSalaryStats || {}).map(([dept, amount]) => ({
                        department: dept,
                        amount
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" fontSize={12} />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Bar dataKey="amount" name="Masse salariale" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-1 gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Rechercher un employé..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Département" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les départements</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="ACTIVE">Actif</SelectItem>
                    <SelectItem value="ON_LEAVE">En congé</SelectItem>
                    <SelectItem value="TERMINATED">Parti</SelectItem>
                    <SelectItem value="PROBATION">Essai</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => { setEditingEmployee(null); setShowEmployeeModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvel employé
                </Button>
                <Button variant="outline" onClick={() => setShowDepartmentModal(true)}>
                  <Building2 className="h-4 w-4 mr-2" />
                  Départements
                </Button>
                <Button variant="outline" onClick={() => setShowPositionModal(true)}>
                  <Briefcase className="h-4 w-4 mr-2" />
                  Postes
                </Button>
              </div>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>N°</TableHead>
                        <TableHead>Département</TableHead>
                        <TableHead>Poste</TableHead>
                        <TableHead>Date d'entrée</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((employee) => (
                        <TableRow key={employee.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={employee.photo} />
                                <AvatarFallback className="bg-emerald-100 text-emerald-700">
                                  {employee.firstName[0]}{employee.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{employee.firstName} {employee.lastName}</p>
                                <p className="text-sm text-slate-500">{employee.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{employee.employeeNumber}</Badge>
                          </TableCell>
                          <TableCell>{employee.department?.name || '-'}</TableCell>
                          <TableCell>{employee.position?.title || '-'}</TableCell>
                          <TableCell>{formatDate(employee.hireDate)}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[employee.status]}>
                              {employee.status === 'ACTIVE' ? 'Actif' : 
                               employee.status === 'TERMINATED' ? 'Parti' :
                               employee.status === 'ON_LEAVE' ? 'En congé' :
                               employee.status === 'PROBATION' ? 'Essai' : employee.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingEmployee(employee); setShowEmployeeModal(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingContract(null); setShowContractModal(true); }}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteConfirm({ type: 'employees', id: employee.id })}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Absences Tab */}
          <TabsContent value="absences" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Gestion des absences et congés</h2>
              <Button onClick={() => { setEditingAbsence(null); setShowAbsenceModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle absence
              </Button>
            </div>

            {/* Absence Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(dashboardData?.absencesByType || {}).map(([type, days]) => (
                <Card key={type}>
                  <CardContent className="pt-6">
                    <p className="text-sm text-slate-500">{ABSENCE_TYPES[type] || type}</p>
                    <p className="text-2xl font-bold">{days} jours</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Début</TableHead>
                        <TableHead>Fin</TableHead>
                        <TableHead>Jours</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {absences.map((absence) => (
                        <TableRow key={absence.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{absence.employee?.firstName} {absence.employee?.lastName}</p>
                              <p className="text-sm text-slate-500">{absence.employee?.department?.name}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{ABSENCE_TYPES[absence.type] || absence.type}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(absence.startDate)}</TableCell>
                          <TableCell>{formatDate(absence.endDate)}</TableCell>
                          <TableCell>{absence.days}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[absence.status]}>
                              {absence.status === 'PENDING' ? 'En attente' :
                               absence.status === 'APPROVED' ? 'Approuvé' :
                               absence.status === 'REJECTED' ? 'Refusé' : absence.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => { setEditingAbsence(absence); setShowAbsenceModal(true); }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setDeleteConfirm({ type: 'absences', id: absence.id })}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trainings Tab */}
          <TabsContent value="trainings" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Suivi des formations</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowTrainingCatalogModal(true)}>
                  <GraduationCap className="h-4 w-4 mr-2" />
                  Catalogue formations
                </Button>
                <Button onClick={() => { setEditingTraining(null); setShowTrainingModal(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Inscrire à une formation
                </Button>
              </div>
            </div>

            {/* Training Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Formations disponibles</p>
                      <p className="text-2xl font-bold">{trainings.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Formations terminées</p>
                      <p className="text-2xl font-bold">{employeeTrainings.filter(et => et.status === 'COMPLETED').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">En cours</p>
                      <p className="text-2xl font-bold">{employeeTrainings.filter(et => et.status === 'IN_PROGRESS').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Euro className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Coût total</p>
                      <p className="text-xl font-bold">{formatCurrency(dashboardData?.totalTrainingCost || 0)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Trainings Catalog */}
            <Card>
              <CardHeader>
                <CardTitle>Catalogue des formations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Formation</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Organisme</TableHead>
                        <TableHead>Durée (h)</TableHead>
                        <TableHead>Coût</TableHead>
                        <TableHead>Participants</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trainings.map((training) => (
                        <TableRow key={training.id}>
                          <TableCell className="font-medium">{training.title}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{training.category || '-'}</Badge>
                          </TableCell>
                          <TableCell>{training.provider || '-'}</TableCell>
                          <TableCell>{training.duration || '-'}</TableCell>
                          <TableCell>{training.cost ? formatCurrency(training.cost) : '-'}</TableCell>
                          <TableCell>{training._count?.employeeTrainings || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Employee Trainings */}
            <Card>
              <CardHeader>
                <CardTitle>Inscriptions aux formations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Formation</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Heures complétées</TableHead>
                        <TableHead>Date début</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employeeTrainings.map((et) => (
                        <TableRow key={et.id}>
                          <TableCell>
                            <p className="font-medium">{et.employee?.firstName} {et.employee?.lastName}</p>
                            <p className="text-sm text-slate-500">{et.employee?.department?.name}</p>
                          </TableCell>
                          <TableCell>{et.training?.title}</TableCell>
                          <TableCell>
                            <Badge className={et.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                           et.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                           et.status === 'REGISTERED' ? 'bg-yellow-100 text-yellow-800' :
                                           'bg-gray-100 text-gray-800'}>
                              {TRAINING_STATUS[et.status] || et.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={(et.hoursCompleted / (et.training?.duration || 1)) * 100} className="w-16 h-2" />
                              <span className="text-sm">{et.hoursCompleted}/{et.training?.duration || 0}h</span>
                            </div>
                          </TableCell>
                          <TableCell>{et.startDate ? formatDate(et.startDate) : '-'}</TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteConfirm({ type: 'employee-trainings', id: et.id })}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Salaries Tab */}
          <TabsContent value="salaries" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Masse salariale</h2>
              <Button onClick={() => { setEditingSalary(null); setShowSalaryModal(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau bulletin
              </Button>
            </div>

            {/* Salary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500">Total salaires bruts</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalGrossSalaries || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500">Charges sociales</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalSocialCharges || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500">Coût total</p>
                  <p className="text-2xl font-bold">{formatCurrency(dashboardData?.totalSalaryCost || 0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-slate-500">Bulletins générés</p>
                  <p className="text-2xl font-bold">{salaries.length}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Employé</TableHead>
                        <TableHead>Mois</TableHead>
                        <TableHead className="text-right">Salaire base</TableHead>
                        <TableHead className="text-right">Prime</TableHead>
                        <TableHead className="text-right">Heures sup.</TableHead>
                        <TableHead className="text-right">Brut</TableHead>
                        <TableHead className="text-right">Charges</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {salaries.slice(0, 50).map((salary) => (
                        <TableRow key={salary.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{salary.employee?.firstName} {salary.employee?.lastName}</p>
                              <p className="text-sm text-slate-500">{salary.employee?.position?.title}</p>
                            </div>
                          </TableCell>
                          <TableCell>{format(parseISO(salary.month), 'MMMM yyyy', { locale: fr })}</TableCell>
                          <TableCell className="text-right">{formatCurrency(salary.baseSalary)}</TableCell>
                          <TableCell className="text-right">{salary.bonus > 0 ? formatCurrency(salary.bonus) : '-'}</TableCell>
                          <TableCell className="text-right">{salary.overtime > 0 ? formatCurrency(salary.overtime) : '-'}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(salary.grossSalary)}</TableCell>
                          <TableCell className="text-right text-red-600">-{formatCurrency(salary.socialCharges)}</TableCell>
                          <TableCell className="text-right font-bold text-green-600">{formatCurrency(salary.netSalary)}</TableCell>
                          <TableCell>
                            <Badge className={STATUS_COLORS[salary.status]}>
                              {salary.status === 'PAID' ? 'Payé' : salary.status === 'PENDING' ? 'En attente' : salary.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setDeleteConfirm({ type: 'salaries', id: salary.id })}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Rapports RH</h2>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Importer les données
                    <input
                      type="file"
                      accept=".csv"
                      onChange={importData}
                      className="hidden"
                    />
                  </label>
                </Button>
                <Button onClick={exportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter les données
                </Button>
              </div>
            </div>

            {/* Turnover Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse du turnover</CardTitle>
                <CardDescription>Taux de rotation du personnel et tendances</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-2">Taux de turnover {selectedYear}</p>
                    <p className="text-4xl font-bold text-purple-600">{dashboardData?.turnoverRate || 0}%</p>
                    <div className="mt-4 flex justify-center gap-2">
                      {dashboardData && dashboardData.turnoverRate < 10 ? (
                        <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                      ) : dashboardData && dashboardData.turnoverRate < 20 ? (
                        <Badge className="bg-yellow-100 text-yellow-800">Acceptable</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">À surveiller</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-2">Recrutements</p>
                    <p className="text-4xl font-bold text-blue-600">{dashboardData?.newHires || 0}</p>
                    <p className="text-sm text-slate-400 mt-2">nouvelles embauches</p>
                  </div>
                  <div className="text-center p-6 bg-slate-50 rounded-lg">
                    <p className="text-sm text-slate-500 mb-2">Départs</p>
                    <p className="text-4xl font-bold text-amber-600">{dashboardData?.terminations || 0}</p>
                    <p className="text-sm text-slate-400 mt-2">départs cette année</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par département</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData?.departmentStats || []).map((dept, index) => (
                      <div key={dept.department} className="flex items-center gap-3">
                        <div className="w-24 font-medium truncate">{dept.department}</div>
                        <div className="flex-1">
                          <Progress 
                            value={(dept.count / (dashboardData?.totalEmployees || 1)) * 100} 
                            className="h-3"
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-medium">{dept.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types de contrats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(dashboardData?.contractStats || []).map((contract) => (
                      <div key={contract.type} className="flex items-center gap-3">
                        <div className="w-24 font-medium">{CONTRACT_TYPES[contract.type] || contract.type}</div>
                        <div className="flex-1">
                          <Progress 
                            value={(contract.count / contracts.length) * 100} 
                            className="h-3"
                          />
                        </div>
                        <div className="w-12 text-right text-sm font-medium">{contract.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Analyse des coûts RH</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { name: 'Salaires bruts', value: dashboardData?.totalGrossSalaries || 0 },
                      { name: 'Charges sociales', value: dashboardData?.totalSocialCharges || 0 },
                      { name: 'Formations', value: dashboardData?.totalTrainingCost || 0 },
                      { name: 'Coût total', value: dashboardData?.totalSalaryCost || 0 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`} />
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                      <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="container mx-auto px-4 text-center text-sm text-slate-500">
          <p>Tableau de Bord RH - Gestion des Ressources Humaines © {new Date().getFullYear()}</p>
        </div>
      </footer>

      {/* Employee Modal */}
      <EmployeeModal
        open={showEmployeeModal}
        onOpenChange={setShowEmployeeModal}
        employee={editingEmployee}
        departments={departments}
        positions={positions}
        onSuccess={() => {
          setShowEmployeeModal(false);
          fetchEmployees();
          fetchDashboardData();
        }}
      />

      {/* Absence Modal */}
      <AbsenceModal
        open={showAbsenceModal}
        onOpenChange={setShowAbsenceModal}
        absence={editingAbsence}
        employees={employees}
        onSuccess={() => {
          setShowAbsenceModal(false);
          fetchAbsences();
          fetchDashboardData();
        }}
      />

      {/* Training Modal */}
      <TrainingModal
        open={showTrainingModal}
        onOpenChange={setShowTrainingModal}
        employees={employees}
        trainings={trainings}
        onSuccess={() => {
          setShowTrainingModal(false);
          fetchEmployeeTrainings();
          fetchDashboardData();
        }}
      />

      {/* Salary Modal */}
      <SalaryModal
        open={showSalaryModal}
        onOpenChange={setShowSalaryModal}
        salary={editingSalary}
        employees={employees}
        onSuccess={() => {
          setShowSalaryModal(false);
          fetchSalaries();
          fetchDashboardData();
        }}
      />

      {/* Contract Modal */}
      <ContractModal
        open={showContractModal}
        onOpenChange={setShowContractModal}
        contract={editingContract}
        employees={employees}
        onSuccess={() => {
          setShowContractModal(false);
          fetchContracts();
        }}
      />

      {/* Department Modal */}
      <DepartmentModal
        open={showDepartmentModal}
        onOpenChange={setShowDepartmentModal}
        departments={departments}
        employees={employees}
        onSuccess={() => {
          setShowDepartmentModal(false);
          fetchDepartments();
        }}
      />

      {/* Position Modal */}
      <PositionModal
        open={showPositionModal}
        onOpenChange={setShowPositionModal}
        positions={positions}
        onSuccess={() => {
          setShowPositionModal(false);
          fetchPositions();
        }}
      />

      {/* Training Catalog Modal */}
      <TrainingCatalogModal
        open={showTrainingCatalogModal}
        onOpenChange={setShowTrainingCatalogModal}
        trainings={trainings}
        onSuccess={() => {
          setShowTrainingCatalogModal(false);
          fetchTrainings();
        }}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Import Database icon
import { Database } from 'lucide-react';

// Modal Components
function EmployeeModal({ 
  open, 
  onOpenChange, 
  employee, 
  departments, 
  positions, 
  onSuccess 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  departments: Department[];
  positions: Position[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthDate: '',
    hireDate: '',
    departmentId: '',
    positionId: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (employee) {
      setFormData({
        employeeNumber: employee.employeeNumber,
        firstName: employee.firstName,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone || '',
        birthDate: employee.birthDate ? employee.birthDate.split('T')[0] : '',
        hireDate: employee.hireDate.split('T')[0],
        departmentId: employee.departmentId || '',
        positionId: employee.positionId || '',
        address: employee.address || ''
      });
    } else {
      setFormData({
        employeeNumber: `EMP${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        birthDate: '',
        hireDate: new Date().toISOString().split('T')[0],
        departmentId: '',
        positionId: '',
        address: ''
      });
    }
  }, [employee, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/employees';
      const method = employee ? 'PUT' : 'POST';
      const body = employee 
        ? { id: employee.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: employee ? 'Employé mis à jour' : 'Employé créé' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{employee ? 'Modifier l\'employé' : 'Nouvel employé'}</DialogTitle>
          <DialogDescription>
            Remplissez les informations de l'employé
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="employeeNumber">N° Employé</Label>
              <Input
                id="employeeNumber"
                value={formData.employeeNumber}
                onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="hireDate">Date d'entrée</Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="birthDate">Date de naissance</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="departmentId">Département</Label>
              <Select value={formData.departmentId} onValueChange={(v) => setFormData({ ...formData, departmentId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="positionId">Poste</Label>
              <Select value={formData.positionId} onValueChange={(v) => setFormData({ ...formData, positionId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  {positions.map(pos => (
                    <SelectItem key={pos.id} value={pos.id}>{pos.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="address">Adresse</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AbsenceModal({
  open,
  onOpenChange,
  absence,
  employees,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  absence: Absence | null;
  employees: Employee[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'PAID_LEAVE',
    startDate: '',
    endDate: '',
    days: '1',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (absence) {
      setFormData({
        employeeId: absence.employeeId,
        type: absence.type,
        startDate: absence.startDate.split('T')[0],
        endDate: absence.endDate.split('T')[0],
        days: absence.days.toString(),
        reason: absence.reason || ''
      });
    } else {
      setFormData({
        employeeId: '',
        type: 'PAID_LEAVE',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        days: '1',
        reason: ''
      });
    }
  }, [absence, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = '/api/absences';
      const method = absence ? 'PUT' : 'POST';
      const body = absence 
        ? { id: absence.id, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: absence ? 'Absence mise à jour' : 'Absence créée' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>{absence ? 'Modifier l\'absence' : 'Nouvelle absence'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employé</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'ACTIVE').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeNumber})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type d'absence</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ABSENCE_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <Label>Nombre de jours</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.days}
                onChange={(e) => setFormData({ ...formData, days: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Motif</Label>
              <Input
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function TrainingModal({
  open,
  onOpenChange,
  employees,
  trainings,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employees: Employee[];
  trainings: Training[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    trainingId: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      employeeId: '',
      trainingId: ''
    });
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/employee-trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Inscription créée' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Inscrire à une formation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employé</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'ACTIVE').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Formation</Label>
              <Select value={formData.trainingId} onValueChange={(v) => setFormData({ ...formData, trainingId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une formation" />
                </SelectTrigger>
                <SelectContent>
                  {trainings.map(training => (
                    <SelectItem key={training.id} value={training.id}>
                      {training.title} ({training.duration}h - {training.cost ? `${training.cost}€` : 'Gratuit'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Inscription...' : 'Inscrire'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SalaryModal({
  open,
  onOpenChange,
  salary,
  employees,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salary: Salary | null;
  employees: Employee[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    month: new Date().toISOString().slice(0, 7),
    baseSalary: '',
    bonus: '0',
    overtime: '0',
    deductions: '0',
    socialCharges: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (salary) {
      setFormData({
        employeeId: salary.employeeId,
        month: salary.month.slice(0, 7),
        baseSalary: salary.baseSalary.toString(),
        bonus: salary.bonus.toString(),
        overtime: salary.overtime.toString(),
        deductions: salary.deductions.toString(),
        socialCharges: salary.socialCharges.toString()
      });
    } else {
      setFormData({
        employeeId: '',
        month: new Date().toISOString().slice(0, 7),
        baseSalary: '',
        bonus: '0',
        overtime: '0',
        deductions: '0',
        socialCharges: ''
      });
    }
  }, [salary, open]);

  const selectedEmployee = employees.find(e => e.id === formData.employeeId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          month: `${formData.month}-01`
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Bulletin de salaire créé' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Nouveau bulletin de salaire</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employé</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.filter(e => e.status === 'ACTIVE').map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} - {emp.position?.title || 'Pas de poste'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Mois</Label>
              <Input
                type="month"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                required
              />
            </div>
            <div>
              <Label>Salaire de base</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.baseSalary}
                onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                placeholder={selectedEmployee?.contracts?.[0]?.monthlySalary?.toString() || '0'}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prime</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                />
              </div>
              <div>
                <Label>Heures supplémentaires</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.overtime}
                  onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Déductions</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                />
              </div>
              <div>
                <Label>Charges sociales (~22%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.socialCharges}
                  onChange={(e) => setFormData({ ...formData, socialCharges: e.target.value })}
                  placeholder={selectedEmployee?.contracts?.[0]?.monthlySalary ? (selectedEmployee.contracts[0].monthlySalary * 0.22).toFixed(2) : '0'}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le bulletin'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ContractModal({
  open,
  onOpenChange,
  contract,
  employees,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract: Contract | null;
  employees: Employee[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'CDI',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    monthlySalary: '',
    workHours: '35'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contract) {
      setFormData({
        employeeId: contract.employeeId,
        type: contract.type,
        startDate: contract.startDate.split('T')[0],
        endDate: contract.endDate?.split('T')[0] || '',
        monthlySalary: contract.monthlySalary.toString(),
        workHours: contract.workHours.toString()
      });
    } else {
      setFormData({
        employeeId: '',
        type: 'CDI',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        monthlySalary: '',
        workHours: '35'
      });
    }
  }, [contract, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Contrat créé' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Nouveau contrat</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label>Employé</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({ ...formData, employeeId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type de contrat</Label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONTRACT_TYPES).map(([key, value]) => (
                    <SelectItem key={key} value={key}>{value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Date de début</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Date de fin (si CDD)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Salaire mensuel</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.monthlySalary}
                  onChange={(e) => setFormData({ ...formData, monthlySalary: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Heures de travail</Label>
                <Input
                  type="number"
                  value={formData.workHours}
                  onChange={(e) => setFormData({ ...formData, workHours: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création...' : 'Créer le contrat'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DepartmentModal({
  open,
  onOpenChange,
  departments,
  employees,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
  employees: Employee[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ name: '', description: '', managerId: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Département créé' });
        onSuccess();
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Gestion des départements</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Add new department form */}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Manager</Label>
                <Select value={formData.managerId} onValueChange={(v) => setFormData({ ...formData, managerId: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.firstName} {emp.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>

          <Separator />

          {/* Departments list */}
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Département</TableHead>
                  <TableHead>Manager</TableHead>
                  <TableHead>Employés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map(dept => (
                  <TableRow key={dept.id}>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell>
                      {dept.manager ? `${dept.manager.firstName} ${dept.manager.lastName}` : '-'}
                    </TableCell>
                    <TableCell>{dept._count?.employees || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PositionModal({
  open,
  onOpenChange,
  positions,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  positions: Position[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ title: '', description: '', baseSalary: '' });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/positions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Poste créé' });
        onSuccess();
        setFormData({ title: '', description: '', baseSalary: '' });
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Gestion des postes</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6">
          {/* Add new position form */}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-2">
                <Label>Titre du poste</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Salaire base</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </form>

          <Separator />

          {/* Positions list */}
          <ScrollArea className="h-64">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Poste</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Salaire base</TableHead>
                  <TableHead>Employés</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map(pos => (
                  <TableRow key={pos.id}>
                    <TableCell className="font-medium">{pos.title}</TableCell>
                    <TableCell>{pos.description || '-'}</TableCell>
                    <TableCell>{pos.baseSalary ? `${pos.baseSalary.toLocaleString('fr-FR')} €` : '-'}</TableCell>
                    <TableCell>{pos._count?.employees || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TrainingCatalogModal({
  open,
  onOpenChange,
  trainings,
  onSuccess
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainings: Training[];
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    provider: '', 
    duration: '', 
    cost: '', 
    category: '' 
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/trainings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          provider: formData.provider,
          duration: formData.duration ? parseFloat(formData.duration) : null,
          cost: formData.cost ? parseFloat(formData.cost) : null,
          category: formData.category
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({ title: 'Succès', description: 'Formation créée avec succès' });
        onSuccess();
        setFormData({ title: '', description: '', provider: '', duration: '', cost: '', category: '' });
      } else {
        toast({ title: 'Erreur', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Erreur', description: 'Une erreur est survenue', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white">
        <DialogHeader>
          <DialogTitle>Gestion du catalogue des formations</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-6 bg-white">
          {/* Add new training form */}
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Titre de la formation *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Ex: Management d'équipe"
                />
              </div>
              <div>
                <Label>Organisme</Label>
                <Input
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="Ex: CEGOS"
                />
              </div>
              <div>
                <Label>Catégorie</Label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Management"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description courte"
                />
              </div>
              <div>
                <Label>Durée (heures)</Label>
                <Input
                  type="number"
                  step="0.5"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  placeholder="Ex: 14"
                />
              </div>
              <div>
                <Label>Coût (€)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  placeholder="Ex: 1500"
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={loading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </div>
          </form>

          <Separator />

          {/* Trainings list */}
          <ScrollArea className="h-64 bg-white rounded-lg border p-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Formation</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Organisme</TableHead>
                  <TableHead>Durée</TableHead>
                  <TableHead>Coût</TableHead>
                  <TableHead>Participants</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trainings.map(training => (
                  <TableRow key={training.id}>
                    <TableCell className="font-medium">{training.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{training.category || '-'}</Badge>
                    </TableCell>
                    <TableCell>{training.provider || '-'}</TableCell>
                    <TableCell>{training.duration ? `${training.duration}h` : '-'}</TableCell>
                    <TableCell>{training.cost ? `${training.cost.toLocaleString('fr-FR')} €` : '-'}</TableCell>
                    <TableCell>{training._count?.employeeTrainings || 0}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

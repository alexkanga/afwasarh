'use client';

import { useState, useEffect } from 'react';
import { Database, RefreshCw, CheckCircle, AlertCircle, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

interface SeedStats {
  departments: number;
  positions: number;
  employees: number;
  trainings: number;
}

export default function SeedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [stats, setStats] = useState<SeedStats | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [alreadySeeded, setAlreadySeeded] = useState(false);

  useEffect(() => {
    checkDatabase();
  }, []);

  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/employees');
      const data = await response.json();
      if (data.success && data.data.length > 0) {
        setAlreadySeeded(true);
        // Get full stats from dashboard
        const dashResponse = await fetch('/api/dashboard?year=2024');
        const dashData = await dashResponse.json();
        if (dashData.success) {
          setStats({
            departments: dashData.data.departmentStats?.length || 8,
            positions: 22,
            employees: dashData.data.totalEmployees || data.data.length,
            trainings: 5
          });
        }
      }
    } catch (err) {
      console.error('Error checking database:', err);
      setError('Impossible de vérifier la base de données');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/seed');
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        if (data.stats) {
          setStats(data.stats);
        }
        setAlreadySeeded(true);
      } else {
        setError(data.error || 'Erreur lors de l\'initialisation');
      }
    } catch (err) {
      console.error('Seed error:', err);
      setError('Erreur de connexion au serveur. Vérifiez que la base de données est accessible.');
    } finally {
      setSeeding(false);
    }
  };

  const handleResetAndSeed = async () => {
    setResetting(true);
    setError('');
    setMessage('');
    
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setMessage(data.message);
        if (data.stats) {
          setStats(data.stats);
        }
        setAlreadySeeded(true);
      } else {
        setError(data.error || 'Erreur lors de la réinitialisation');
      }
    } catch (err) {
      console.error('Reset error:', err);
      setError('Erreur de connexion au serveur. Vérifiez que la base de données est accessible.');
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-[#0A89C5] mx-auto mb-4" />
          <p className="text-lg text-slate-600">Vérification de la base de données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="h-16 w-16 rounded-full bg-[#0A89C5]/10 flex items-center justify-center mx-auto mb-4">
            <Database className="h-8 w-8 text-[#0A89C5]" />
          </div>
          <CardTitle className="text-2xl">Initialisation de la Base de Données</CardTitle>
          <CardDescription>
            Gestion des données de démonstration du Tableau de Bord RH
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p>{message}</p>
            </div>
          )}

          {stats && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A89C5]">{stats.employees}</p>
                <p className="text-sm text-slate-600">Employés</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#128A4C]">{stats.departments}</p>
                <p className="text-sm text-slate-600">Départements</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#372E6F]">{stats.positions}</p>
                <p className="text-sm text-slate-600">Postes</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0A89C5]">{stats.trainings}</p>
                <p className="text-sm text-slate-600">Formations</p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {!alreadySeeded ? (
              <Button 
                onClick={handleSeed} 
                className="w-full" 
                size="lg"
                disabled={seeding}
              >
                {seeding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Initialisation en cours...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Initialiser les données de démonstration
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="h-5 w-5" />
                  Base de données prête
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => router.push('/')} 
                    className="flex-1" 
                    size="lg"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Tableau de Bord
                  </Button>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="lg"
                        disabled={resetting}
                      >
                        {resetting ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Réinitialiser la base de données ?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Cette action va supprimer toutes les données existantes et les remplacer par de nouvelles données de démonstration. Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetAndSeed}>
                          Réinitialiser
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm text-slate-500 text-center">
              Cette page permet d&apos;initialiser la base de données PostgreSQL avec des données de démonstration pour tester toutes les fonctionnalités du tableau de bord RH.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

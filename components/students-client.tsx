'use client';

import { useState } from 'react';
import { Student, Plan } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Mail, Phone, Calendar, Trash2, Edit, ArrowLeft, Building2, CreditCard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBranch } from '@/lib/contexts/branch-context';

interface StudentsClientProps {
  initialStudents: Student[];
  availablePlans: Plan[];
}

export default function StudentsClient({ initialStudents, availablePlans }: StudentsClientProps) {
  const { selectedBranch } = useBranch();
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    membership_status: 'active',
    plan_id: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBranch) {
      alert('Debes seleccionar una sede primero');
      return;
    }

    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      const studentData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        membership_status: formData.membership_status,
        branch_id: selectedBranch.id,
        plan_id: formData.plan_id || null,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('students')
          .update(studentData)
          .eq('id', editingId)
          .select('*, branches(name), plans(id, name)')
          .single();

        if (error) throw error;

        setStudents(students.map(s => s.id === editingId ? data : s));
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('students')
          .insert([studentData])
          .select('*, branches(name), plans(id, name)')
          .single();

        if (error) throw error;

        setStudents([...students, data]);
        setIsAdding(false);
      }

      setFormData({ name: '', email: '', phone: '', membership_status: 'active', plan_id: '' });
      router.refresh();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Error al guardar el alumno');
    }
  };

  const handleEdit = (student: Student) => {
    setFormData({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      membership_status: student.membership_status,
      plan_id: student.plan_id || '',
    });
    setEditingId(student.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este alumno?')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStudents(students.filter(s => s.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Error al eliminar el alumno');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', membership_status: 'active', plan_id: '' });
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBranch = !selectedBranch || student.branch_id === selectedBranch.id;
    return matchesSearch && matchesBranch;
  });

  const getMembershipBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      active: 'default',
      inactive: 'secondary',
      suspended: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver
                  </Button>
                </Link>
                {selectedBranch ? (
                  <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    {selectedBranch.name}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    Todas las sedes
                  </div>
                )}
              </div>
              <h1 className="text-4xl font-bold text-slate-900">Gestión de Alumnos</h1>
              <p className="text-slate-600 mt-2">Administra la información de los alumnos registrados</p>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="lg" disabled={!selectedBranch}>
                <UserPlus className="w-5 h-5 mr-2" />
                Agregar Alumno
              </Button>
            )}
          </div>

          {!selectedBranch && isAdding && (
            <Card className="mb-8 bg-orange-50 border-orange-200">
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-3">
                  <Building2 className="w-6 h-6 text-orange-600" />
                  <div>
                    <h3 className="font-semibold text-orange-900">Sede no seleccionada</h3>
                    <p className="text-orange-700">Debes seleccionar una sede para agregar alumnos</p>
                  </div>
                </div>
                <Link href="/branches">
                  <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                    Seleccionar Sede
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {isAdding && selectedBranch && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingId ? 'Editar Alumno' : 'Nuevo Alumno'}</CardTitle>
                <CardDescription>
                  {editingId ? 'Actualiza la información del alumno' : 'Completa los datos del nuevo alumno'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Juan Pérez"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="juan@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+34 600 000 000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="membership">Estado de Membresía</Label>
                      <Select
                        value={formData.membership_status}
                        onValueChange={(value) => setFormData({ ...formData, membership_status: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="inactive">Inactivo</SelectItem>
                          <SelectItem value="suspended">Suspendido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="plan">Plan</Label>
                      <Select
                        value={formData.plan_id}
                        onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar plan..." />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlans.map((plan) => (
                            <SelectItem key={plan.id} value={plan.id}>
                              {plan.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingId ? 'Actualizar' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Lista de Alumnos ({students.length})</CardTitle>
              <div className="mt-4">
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-slate-500 py-8">
                    {searchTerm ? 'No se encontraron alumnos' : 'No hay alumnos registrados'}
                  </p>
                ) : (
                  filteredStudents.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{student.name}</h3>
                          <Badge variant={getMembershipBadge(student.membership_status)}>
                            {student.membership_status === 'active' && 'Activo'}
                            {student.membership_status === 'inactive' && 'Inactivo'}
                            {student.membership_status === 'suspended' && 'Suspendido'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          {student.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-4 h-4" />
                              {student.email}
                            </div>
                          )}
                          {student.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {student.phone}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Registrado: {new Date(student.registration_date).toLocaleDateString('es-ES')}
                          </div>
                          {student.branches && (
                            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full text-xs">
                              <Building2 className="w-3 h-3" />
                              {student.branches.name}
                            </div>
                          )}
                          {student.plans && (
                            <div className="flex items-center gap-1 text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full text-xs">
                              <CreditCard className="w-3 h-3" />
                              {student.plans.name}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(student)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(student.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

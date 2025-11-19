'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Building2, MapPin, Phone, Check, Pencil } from 'lucide-react';
import { useBranch } from '@/lib/contexts/branch-context';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '', phone: '' });
  const { selectedBranch, setSelectedBranch } = useBranch();
  const supabase = createBrowserClient();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('branches')
      .select('*')
      .eq('active', true)
      .order('name');

    if (error) {
      console.error('Error fetching branches:', error);
    } else {
      setBranches(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingBranch) {
      // Update existing branch
      const { data, error } = await supabase
        .from('branches')
        .update(formData)
        .eq('id', editingBranch.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating branch:', error);
        alert('Error al actualizar la sede');
      } else {
        setBranches(branches.map(b => b.id === data.id ? data : b));
        // Update selected branch if it was the one being edited
        if (selectedBranch?.id === data.id) {
          setSelectedBranch(data);
        }
        setFormData({ name: '', address: '', phone: '' });
        setEditingBranch(null);
        setShowForm(false);
      }
    } else {
      // Create new branch
      const { data, error } = await supabase
        .from('branches')
        .insert([formData])
        .select()
        .single();

      if (error) {
        console.error('Error creating branch:', error);
        alert('Error al crear la sede');
      } else {
        setBranches([...branches, data]);
        setFormData({ name: '', address: '', phone: '' });
        setShowForm(false);
      }
    }
  };

  const handleEditBranch = (branch: Branch, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection
    setEditingBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address || '',
      phone: branch.phone || ''
    });
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setEditingBranch(null);
    setFormData({ name: '', address: '', phone: '' });
    setShowForm(false);
  };

  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <p className="text-lg text-slate-600">Cargando sedes...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-slate-900">Gestión de Sedes</h1>
              <p className="text-slate-600 mt-2">
                Selecciona la sede donde estás trabajando
              </p>
            </div>
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : 'Nueva Sede'}
            </Button>
          </div>

          {selectedBranch && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Check className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Sede Seleccionada</p>
                      <p className="font-semibold text-lg text-slate-900">{selectedBranch.name}</p>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedBranch(null)}>
                    Cambiar Sede
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>{editingBranch ? 'Editar Sede' : 'Nueva Sede'}</CardTitle>
                <CardDescription>
                  {editingBranch ? 'Actualiza la información de la sede' : 'Crea una nueva sede para tu gimnasio'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre de la Sede *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="Ej: Sede Central"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Ej: Av. Principal 123"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ej: +1234567890"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      {editingBranch ? 'Actualizar Sede' : 'Crear Sede'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {branches.map((branch) => (
              <Card
                key={branch.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedBranch?.id === branch.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:border-blue-200'
                }`}
                onClick={() => handleSelectBranch(branch)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
                      <Building2 className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleEditBranch(branch, e)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      {selectedBranch?.id === branch.id && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardTitle className="text-xl">{branch.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {branch.address && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4" />
                      <span>{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Phone className="w-4 h-4" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {branches.length === 0 && !showForm && (
            <Card>
              <CardContent className="py-12 text-center">
                <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">No hay sedes registradas</p>
                <Button onClick={() => setShowForm(true)}>Crear Primera Sede</Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Plan } from '@/lib/types';
import { createBrowserClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Trash2, Edit, ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';

interface PlansClientProps {
  initialPlans: Plan[];
}

export default function PlansClient({ initialPlans }: PlansClientProps) {
  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    active: true,
  });
  const router = useRouter();

  const supabase = createBrowserClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('El nombre es obligatorio');
      return;
    }

    try {
      const planData = {
        name: formData.name,
        description: formData.description || null,
        price: parseFloat(formData.price) || 0,
        active: formData.active,
      };

      if (editingId) {
        const { data, error } = await supabase
          .from('plans')
          .update(planData)
          .eq('id', editingId)
          .select()
          .single();

        if (error) throw error;

        setPlans(plans.map(p => p.id === editingId ? data : p));
        setEditingId(null);
      } else {
        const { data, error } = await supabase
          .from('plans')
          .insert([planData])
          .select()
          .single();

        if (error) throw error;

        setPlans([...plans, data]);
        setIsAdding(false);
      }

      setFormData({ name: '', description: '', price: '', active: true });
      router.refresh();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Error al guardar el plan');
    }
  };

  const handleEdit = (plan: Plan) => {
    setFormData({
      name: plan.name,
      description: plan.description || '',
      price: plan.price.toString(),
      active: plan.active,
    });
    setEditingId(plan.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este plan?')) return;

    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPlans(plans.filter(p => p.id !== id));
      router.refresh();
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Error al eliminar el plan');
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: '', active: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <h1 className="text-4xl font-bold text-slate-900">Gestión de Planes</h1>
              <p className="text-slate-600 mt-2">Administra los planes y membresías del gimnasio</p>
            </div>
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)} size="lg">
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Plan
              </Button>
            )}
          </div>

          {isAdding && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>{editingId ? 'Editar Plan' : 'Nuevo Plan'}</CardTitle>
                <CardDescription>
                  {editingId ? 'Actualiza la información del plan' : 'Crea un nuevo plan de membresía'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre del Plan *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej: Plan Mensual"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">Precio</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalles del plan..."
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={formData.active}
                        onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
                      />
                      <Label htmlFor="active">Plan Activo</Label>
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4">
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

          <div className="grid gap-4">
            {plans.map((plan) => (
              <Card key={plan.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{plan.name}</h3>
                        {!plan.active && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">{plan.description}</p>
                      {plan.price > 0 && (
                        <p className="text-slate-900 font-medium mt-1">
                          ${plan.price.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(plan)}
                    >
                      <Edit className="w-4 h-4 text-slate-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

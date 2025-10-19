import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { PropertiesApi, UnitsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Plus, Home, DollarSign, User, Phone, Edit, Trash2, X, CheckCircle, XCircle } from 'lucide-react';

interface Unit {
  id: number | string;
  property: number | string;
  code: string;
  unit_type: string;
  rent_amount: number;
  deposit: number;
  area?: number | null;
  status: 'vacant' | 'occupied';
  tenant_name?: string | null; // backend not defined, keep optional local
  tenant_phone?: string | null; // optional local
}

interface Property {
  id: number | string;
  name: string;
}

export function Units() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    property: '',
    code: '',
    unit_type: 'shop',
    rent_amount: 0,
    deposit: 0,
    area: 0,
    status: 'vacant' as 'vacant' | 'occupied',
    tenant_name: '',
    tenant_phone: '',
  });

  const { data: properties = [] } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      const data = (await PropertiesApi.list()) as Property[];
      return data as Property[];
    },
    enabled: !!user,
  });

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', user?.id],
    queryFn: async () => {
      if (properties.length === 0) return [];
      const data = (await UnitsApi.list()) as Unit[];
      return data as Unit[];
    },
    enabled: !!user && properties.length > 0,
  });

  const createMutation = useMutation({
    mutationFn: async (unit: typeof formData) => {
      const payload = { ...unit, property: unit.property } as any;
      await UnitsApi.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...unit }: typeof formData & { id: number | string }) => {
      const payload = { ...unit, property: unit.property } as any;
      await UnitsApi.update(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await UnitsApi.remove(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ ...formData, id: editingId });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (unit: Unit) => {
    setFormData({
      property: unit.property,
      code: unit.code,
      unit_type: unit.unit_type,
      rent_amount: unit.rent_amount,
      deposit: unit.deposit,
      area: unit.area || 0,
      status: unit.status,
      tenant_name: unit.tenant_name || '',
      tenant_phone: unit.tenant_phone || '',
    });
    setEditingId(unit.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      property: '',
      code: '',
      unit_type: 'shop',
      rent_amount: 0,
      deposit: 0,
      area: 0,
      status: 'vacant',
      tenant_name: '',
      tenant_phone: '',
    });
    setEditingId(null);
    setShowForm(false);
  };

  const getPropertyName = (propertyId: number | string) => {
    return properties.find(p => p.id === propertyId)?.name || '';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('units')}</h1>
          <Button onClick={() => setShowForm(true)} disabled={properties.length === 0}>
            <Plus className="h-4 w-4 mr-2" />
            {t('add_unit')}
          </Button>
        </div>

        {properties.length === 0 && (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-gray-600">Please add a property first</p>
              </div>
            </CardBody>
          </Card>
        )}

        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingId ? t('edit') : t('add_unit')}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('properties')}</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.property}
                    onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                    required
                  >
                    <option value="">Select Property</option>
                    {properties.map((property) => (
                      <option key={property.id} value={property.id}>
                        {property.name}
                      </option>
                    ))}
                  </select>
                </div>
                <Input label={t('unit_number')} value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} required />
                <Input label={t('unit_type')} value={formData.unit_type} onChange={(e) => setFormData({ ...formData, unit_type: e.target.value })} required />
                <Input
                  label={t('rent_amount')}
                  type="number"
                  value={formData.rent_amount}
                  onChange={(e) => setFormData({ ...formData, rent_amount: Number(e.target.value) })}
                  required
                  min={0}
                />
                <Input label={t('deposit')} type="number" value={formData.deposit} onChange={(e) => setFormData({ ...formData, deposit: Number(e.target.value) })} min={0} />
                <Input label={t('area')} type="number" value={formData.area} onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })} min={0} />
                <div className="flex items-center gap-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('status')}</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}>
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                  </select>
                </div>
                {formData.status === 'occupied' && (
                  <>
                    <Input
                      label={t('tenant_name')}
                      value={formData.tenant_name}
                      onChange={(e) => setFormData({ ...formData, tenant_name: e.target.value })}
                    />
                    <Input
                      label={t('tenant_phone')}
                      type="tel"
                      value={formData.tenant_phone}
                      onChange={(e) => setFormData({ ...formData, tenant_phone: e.target.value })}
                    />
                  </>
                )}
                <div className="flex gap-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {t('save')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm}>
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        ) : units.length === 0 ? (
          properties.length > 0 && (
            <Card>
              <CardBody>
                <div className="text-center py-8">
                  <p className="text-gray-600">{t('no_units')}</p>
                </div>
              </CardBody>
            </Card>
          )
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {units.map((unit) => (
              <Card key={unit.id}>
                <CardBody>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{unit.code}</h3>
                        <p className="text-sm text-gray-600">{getPropertyName(unit.property)}</p>
                      </div>
                      {unit.status === 'occupied' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-1" />
                      {t('ksh')} {unit.rent_amount.toLocaleString()}
                    </div>
                    {unit.status === 'occupied' && unit.tenant_name && (
                      <>
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-1" />
                          {unit.tenant_name}
                        </div>
                        {unit.tenant_phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-1" />
                            {unit.tenant_phone}
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex gap-2 pt-3">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(unit)}>
                        <Edit className="h-4 w-4 mr-1" />
                        {t('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteMutation.mutate(unit.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        {t('delete')}
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

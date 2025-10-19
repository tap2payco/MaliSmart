import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { PropertiesApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import { Plus, MapPin, Home, Edit, Trash2, X } from 'lucide-react';

interface Property {
  id: number | string;
  name: string;
  type: string;
  address: string;
  currency: string;
}

export function Properties() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'shop',
    address: '',
    currency: 'TZS',
  });

  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      const data = (await PropertiesApi.list()) as Property[];
      return data;
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (property: typeof formData) => {
      await PropertiesApi.create(property);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...property }: typeof formData & { id: number | string }) => {
      await PropertiesApi.update(id, property);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await PropertiesApi.remove(id);
    },
    onSuccess: () => {
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

  const handleEdit = (property: Property) => {
    setFormData({
      name: property.name,
      type: (property as any).type || 'shop',
      address: property.address,
      currency: property.currency,
    });
    setEditingId(property.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'shop', address: '', currency: 'TZS' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{t('properties')}</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t('add_property')}
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                  {editingId ? t('edit') : t('add_property')}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label={t('property_name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('type')}</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="mall">Mall</option>
                    <option value="shop">Shop</option>
                    <option value="office">Office</option>
                    <option value="hall">Hall</option>
                  </select>
                </div>
                <Input
                  label={t('address')}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
                <Input
                  label={t('currency')}
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  required
                />
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
        ) : properties.length === 0 ? (
          <Card>
            <CardBody>
              <div className="text-center py-8">
                <p className="text-gray-600">{t('no_properties')}</p>
              </div>
            </CardBody>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardBody>
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900">{property.name}</h3>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Home className="h-4 w-4 mr-1" />
                      {property.currency}
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(property)}>
                        <Edit className="h-4 w-4 mr-1" />
                        {t('edit')}
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => {
                          if (confirm('Are you sure?')) {
                            deleteMutation.mutate(property.id);
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

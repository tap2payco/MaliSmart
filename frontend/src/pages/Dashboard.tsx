import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '../components/Layout';
import { PropertiesApi, UnitsApi } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Home, Users, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: properties = [], isLoading: loadingProperties } = useQuery({
    queryKey: ['properties', user?.id],
    queryFn: async () => {
      const data = await PropertiesApi.list();
      return data || [];
    },
    enabled: !!user,
  });

  const { data: units = [], isLoading: loadingUnits } = useQuery({
    queryKey: ['units', user?.id],
    queryFn: async () => {
      const data = await UnitsApi.list();
      return data || [];
    },
    enabled: !!user,
  });

  const totalProperties = properties.length;
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: any) => u.status === 'occupied').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const monthlyIncome = units
    .filter((u: any) => u.status === 'occupied')
    .reduce((sum: number, u: any) => sum + Number(u.rent_amount), 0);

  const isLoading = loadingProperties || loadingUnits;

  const stats = [
    {
      icon: Building2,
      label: t('total_properties'),
      value: totalProperties,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      icon: Home,
      label: t('total_units'),
      value: totalUnits,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      icon: Users,
      label: t('occupied_units'),
      value: occupiedUnits,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      icon: TrendingUp,
      label: t('occupancy_rate'),
      value: `${occupancyRate}%`,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>

        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">{t('loading')}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`${stat.bg} p-3 rounded-lg`}>
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('monthly_income')}</h2>
              <p className="text-3xl font-bold text-green-600">
                {t('ksh')} {monthlyIncome.toLocaleString()}
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

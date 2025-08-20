import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Database, ListOrdered } from 'lucide-react';

const AdminHeader = () => {
  const location = useLocation();

  return (
    <header className="bg-white shadow-sm border-b mb-8">
      <div className="container mx-auto py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={location.pathname === '/admin' ? 'default' : 'outline'}
              asChild
            >
              <Link to="/admin">
                <ListOrdered size={16} className="mr-2" />
                Verifikasi Pesanan
              </Link>
            </Button>
            <Button
              variant={location.pathname === '/admin/cms' ? 'default' : 'outline'}
              asChild
            >
              <Link to="/admin/cms">
                <Database size={16} className="mr-2" />
                Manajemen Konten
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
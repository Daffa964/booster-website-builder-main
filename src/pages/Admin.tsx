// src/pages/Admin.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Upload } from 'lucide-react';
import AdminHeader from '@/components/AdminHeader';

const API_BASE_URL = 'http://localhost:3001/api';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  is_verified: boolean;
  has_paid: boolean;
}

interface Order {
  id: string;
  packageName: string;
  price: string;
  status: string;
  createdAt: string;
  template_name: string;
  User: User;
}

const Admin = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [verifiedOrders, setVerifiedOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState<string | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [templateUrls, setTemplateUrls] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/pending`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOrders(data.orders || []);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat pesanan pending", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/verified`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVerifiedOrders(data.orders || []);
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat pesanan terverifikasi", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchVerifiedOrders();
  }, []);

  const verifyPayment = async (userId: string, orderId: string) => {
    setVerifying(orderId);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/orders/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, orderId }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      toast({ title: "Berhasil", description: "Pembayaran berhasil diverifikasi" });
      fetchPendingOrders(); // Refresh list
      fetchVerifiedOrders(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: "Gagal memverifikasi pembayaran", variant: "destructive" });
    } finally {
      setVerifying(null);
    }
  };

  const sendTemplate = async (orderId: string) => {
    const url = templateUrls[orderId];
    if (!url) {
      toast({ title: "Error", description: "Masukkan URL template terlebih dahulu", variant: "destructive" });
      return;
    }

    setUploading(orderId);
    try {
        const response = await fetch(`${API_BASE_URL}/admin/orders/complete`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, templatePath: url }),
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        toast({ title: "Berhasil", description: "Template berhasil dikirim" });
        setTemplateUrls(prev => ({ ...prev, [orderId]: '' }));
        fetchVerifiedOrders(); // Refresh list
    } catch (error) {
        toast({ title: "Error", description: "Gagal mengirim template", variant: "destructive" });
    } finally {
        setUploading(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader><CardTitle className="text-2xl font-bold text-foreground">Admin Dashboard</CardTitle></CardHeader>
          <CardContent>
            <Tabs defaultValue="verification" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="verification">Verifikasi Pembayaran</TabsTrigger>
                <TabsTrigger value="templates">Kelola Template</TabsTrigger>
              </TabsList>
              <TabsContent value="verification">
                {loading ? <p>Loading...</p> : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">Tidak ada pesanan menunggu verifikasi</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Template</TableHead>
                          <TableHead>Paket</TableHead>
                          <TableHead>Harga</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order.id}>
                            <TableCell>{formatDate(order.createdAt)}</TableCell>
                            <TableCell>{order.User.name}</TableCell>
                            <TableCell>{order.User.email}</TableCell>
                            <TableCell>{order.template_name}</TableCell>
                            <TableCell>{order.packageName}</TableCell>
                            <TableCell>{order.price}</TableCell>
                            <TableCell><Badge variant="secondary">{order.status}</Badge></TableCell>
                            <TableCell>
                              {order.User.is_verified && order.User.has_paid ? (
                                <Badge className="bg-green-500"><CheckCircle className="w-4 h-4 mr-1" />Terverifikasi</Badge>
                              ) : (
                                <Button onClick={() => verifyPayment(order.User.id, order.id)} disabled={verifying === order.id} size="sm" className="bg-green-600 hover:bg-green-700">
                                  {verifying === order.id ? 'Memverifikasi...' : 'Verifikasi'}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="templates">
                {verifiedOrders.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">Tidak ada pesanan terverifikasi</div>
                ) : (
                  <div className="space-y-6">
                    {verifiedOrders.map((order) => (
                      <Card key={order.id} className="border-l-4 border-l-primary">
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{order.User.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{order.User.email} • {order.User.phone}</p>
                              <p className="text-sm font-medium mt-1">Template: {order.template_name} • Paket: {order.packageName}</p>
                            </div>
                            <Badge variant={order.status === 'completed' ? 'default' : 'secondary'}>{order.status}</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           <div>
                              <Label htmlFor={`url-${order.id}`}>Masukkan URL Template (Google Drive, dll)</Label>
                              <Input
                                id={`url-${order.id}`}
                                type="url"
                                placeholder="https://..."
                                value={templateUrls[order.id] || ''}
                                onChange={(e) => setTemplateUrls(prev => ({ ...prev, [order.id]: e.target.value }))}
                              />
                            </div>
                          <Button onClick={() => sendTemplate(order.id)} disabled={uploading === order.id || order.status === 'completed'}>
                            <Upload className="w-4 h-4 mr-2" />
                            {uploading === order.id ? 'Mengirim...' : 'Kirim Template'}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
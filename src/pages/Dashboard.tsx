// src/pages/Dashboard.tsx

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { 
  BookOpen, 
  Users, 
  Award, 
  Play, 
  Lock,
  LogOut,
  User,
  Package,
  Video,
  FileText,
  Settings,
  ExternalLink,
  Book, // Menambahkan ikon buku
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// --- TAMBAHAN: Daftar Link Buku ---
const bookLinks: { [key: string]: string } = {
  "BAB 1": "https://drive.google.com/file/d/1j87dMtqehno-yeh9Zz6tb_9q4aUomgEO/view?usp=drive_link",
  "BAB 2": "https://drive.google.com/file/d/1bqBpA-Z_XRCN3R2y2TFUenEcaQLlbQKJ/view?usp=drive_link",
  "BAB 3": "https://drive.google.com/file/d/1CCu8BZrex1CDEPvctO3vAMPp_TYXrsEu/view?usp=drive_link",
  "BAB 4": "https://drive.google.com/file/d/1jAlD8F0Pszr9Vx-wGRfbU2XfF3QwcRjG/view?usp=drive_link",
  "BAB 5": "https://drive.google.com/file/d/1xE7i4iEU7De_rF9SIapgtAnAcNOCbMNF/view?usp=drive_link",
  "BAB 6": "https://drive.google.com/file/d/1bPbNO11CSjskHesxvFx552JCpU6_lwbR/view?usp=drive_link",
  "BAB 7": "https://drive.google.com/file/d/1PK3vrstFhR84gUquG_mnDDrYFxlT6hl1/view?usp=drive_link",
  "BAB 8": "https://drive.google.com/file/d/1UH-xsGtmF1qNGrahKwDaoOFE0mEBb7B5/view?usp=drive_link",
  "BAB 9": "https://drive.google.com/file/d/1NGYJEMtbbXLU-qQRKohiMYbDDGAMKHao/view?usp=drive_link",
  "BAB 10": "https://drive.google.com/file/d/186P4YSoURxIPXuDYHSuKas8KF7NSDm7A/view?usp=drive_link",
  "BAB 11": "https://drive.google.com/file/d/1h-qITrYzltaZQfz8lqksHWpmv88tKqoP/view?usp=drive_link",
  "BAB 12": "https://drive.google.com/file/d/1j36kVpy3cd6jmr3EFfseW4EPXso2CsIV/view?usp=drive_link",
};
// --- AKHIR TAMBAHAN ---

interface UserSession {
  id: string;
  name: string;
  email: string;
  package_access: string;
}
interface Lesson {
  id: string; title: string; description: string; difficulty: 'basic' | 'medium' | 'large';
  video_url?: string; content?: string; materials_url?: string; duration_minutes?: number;
  is_published: boolean; required_package: string[];
}
interface Chapter {
  id: string; title: string; description: string; is_published: boolean; lessons: Lesson[];
}
interface Module {
  id: string; title: string; description: string; is_published: boolean; chapters: Chapter[];
}
interface UserProgress {
  lesson_id: string; completed: boolean;
}
interface Order {
    id: string;
    template_name: string;
    template_path: string | null;
    status: string;
    createdAt: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [activeTab, setActiveTab] = useState('learning');
  const [modules, setModules] = useState<Module[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (session) {
      const parsedSession = JSON.parse(session);
      setUser(parsedSession);
      fetchDashboardData(parsedSession.id);
    } else {
      window.location.href = '/auth';
    }
  }, []);

  const fetchDashboardData = async (userId: string) => {
    setLoading(true);
    try {
      const [modulesRes, progressRes, ordersRes] = await Promise.all([
        fetch(`${API_BASE_URL}/lms/content`),
        fetch(`${API_BASE_URL}/lms/progress/${userId}`),
        fetch(`${API_BASE_URL}/orders/user/${userId}`)
      ]);

      const modulesData = await modulesRes.json();
      if (!modulesRes.ok) throw new Error('Gagal memuat modul');
      modulesData.forEach((module: Module) => {
        module.chapters.forEach(chapter => {
          chapter.lessons.forEach(lesson => {
            if (typeof lesson.required_package === 'string') {
              try {
                lesson.required_package = JSON.parse(lesson.required_package);
              } catch (e) {
                lesson.required_package = ['small'];
              }
            }
          });
        });
      });
      setModules(modulesData || []);

      const progressData = await progressRes.json();
      if (!progressRes.ok) throw new Error('Gagal memuat progres');
      setUserProgress(progressData || []);

      const ordersData = await ordersRes.json();
      if (!ordersRes.ok) throw new Error('Gagal memuat pesanan');
      setOrders(ordersData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Gagal memuat data dashboard",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.href = '/';
  };

  const getPackageBadgeColor = (pkg: string) => {
    switch (pkg) {
      case 'small': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'large': return 'bg-purple-100 text-purple-800';
      case 'enterprise': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPackageName = (pkg: string) => {
    switch (pkg) {
      case 'small': return 'Paket Small';
      case 'medium': return 'Paket Medium';
      case 'large': return 'Paket Large';
      case 'enterprise': return 'Paket Enterprise';
      default: return 'Paket Dasar';
    }
  };

  const getLessonProgress = (lessonId: string) => userProgress.find(p => p.lesson_id === lessonId);

  const calculateChapterProgress = (chapter: Chapter) => {
    if (!user || !chapter.lessons || chapter.lessons.length === 0) return 0;
    const accessibleLessons = chapter.lessons.filter(lesson => hasLessonAccess(lesson));
    if (accessibleLessons.length === 0) return 0;
    const completedLessons = accessibleLessons.filter(lesson => getLessonProgress(lesson.id)?.completed).length;
    return Math.round((completedLessons / accessibleLessons.length) * 100);
  };

  const getChapterStatus = (chapter: Chapter) => {
    if (!user) return 'locked';
    if (user.email === 'admin@bibooster.com') return 'available'; 
    const progress = calculateChapterProgress(chapter);
    const hasAccess = chapter.lessons.some(lesson => hasLessonAccess(lesson));
    if (!hasAccess) return 'locked';
    if (progress === 100) return 'completed';
    if (progress > 0) return 'in-progress';
    return 'available';
  };

  const hasLessonAccess = (lesson: Lesson) => {
    if (!user) return false;
    if (user.email === 'admin@bibooster.com') return true;
    return lesson.required_package?.includes(user.package_access);
  };

  // --- TAMBAHAN: Fungsi untuk mendapatkan link buku ---
  const getBookLink = (chapterTitle: string) => {
    const chapterNumber = chapterTitle.match(/BAB (\d+)/);
    if (chapterNumber && bookLinks[`BAB ${chapterNumber[1]}`]) {
      return bookLinks[`BAB ${chapterNumber[1]}`];
    }
    return "#"; // Fallback link
  };
  // --- AKHIR TAMBAHAN ---

  if (!user || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-600 font-medium">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-orange-500 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">B.I Booster Dashboard</h1>
            {user.email === 'admin@bibooster.com' ? (
              <Badge className="bg-red-500 text-white rounded-full px-3 py-1 shadow-sm">Admin</Badge>
            ) : (
              <Badge className={`${getPackageBadgeColor(user.package_access)} rounded-full px-3 py-1 shadow-sm`}>
                {getPackageName(user.package_access)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
              <User size={16} />
              <span>{user.name}</span>
            </div>
            {user.email === 'admin@bibooster.com' && (
              <Button variant="secondary" asChild className="bg-white/20 hover:bg-white/30 text-white">
                <Link to="/admin"><Settings size={16} className="mr-2" />Admin Panel</Link>
              </Button>
            )}
            <Button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white">
              <LogOut size={16} className="mr-2" />Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit rounded-full bg-gray-100 p-1">
            <TabsTrigger value="learning" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"><BookOpen size={16}/> Pembelajaran</TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"><Package size={16}/> Template</TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"><Users size={16}/> Komunitas</TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2 rounded-full px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all"><Award size={16}/> Sertifikat</TabsTrigger>
          </TabsList>

          <TabsContent value="learning" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.flatMap(module => module.chapters.map(chapter => {
                const status = getChapterStatus(chapter);
                const progress = calculateChapterProgress(chapter);
                const bookLink = getBookLink(chapter.title);

                return (
                  <div key={chapter.id} className={`course__item w-full rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl flex flex-col ${status === 'locked' ? 'bg-gray-100' : 'bg-white'}`}>
                    <div className="course__thumb w-full h-48 bg-cover bg-center" style={{ backgroundImage: `url(https://via.placeholder.com/300x180?text=${encodeURIComponent(chapter.title)})` }}>
                    </div>
                    <div className="course__content p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPackageBadgeColor(user.package_access)}`}>
                          {getPackageName(user.package_access)}
                        </span>
                        <Badge variant={status === 'completed' ? 'default' : status === 'in-progress' ? 'secondary' : 'outline'}>{status}</Badge>
                      </div>
                      <h3 className="course__title text-xl font-bold mb-3 h-14 overflow-hidden">{chapter.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 h-10 overflow-hidden flex-grow">{chapter.description}</p>
                      
                      {progress > 0 && (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2 rounded-full"/>
                        </div>
                      )}

                      {/* --- PERUBAHAN BAGIAN BUTTON --- */}
                      <div className="mt-auto flex flex-col sm:flex-row gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button className="w-full flex-1 rounded-full bg-blue-600 hover:bg-blue-700 text-white" disabled={status === 'locked'}>
                              {status === 'locked' ? <Lock size={16} className="mr-2"/> : <Video size={16} className="mr-2"/>}
                              {status === 'locked' ? 'Terkunci' : 'Modul Video'}
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl">
                            <DialogHeader><DialogTitle>{chapter.title}</DialogTitle></DialogHeader>
                            <div className="space-y-4 divide-y">
                              {chapter.lessons.map(lesson => {
                                const hasAccess = hasLessonAccess(lesson);
                                return (
                                  <Card key={lesson.id} className={`rounded-xl shadow-sm ${!hasAccess ? 'bg-gray-50 opacity-70' : 'bg-white'}`}>
                                    <CardHeader>
                                      <CardTitle className="text-lg flex items-center justify-between">
                                        <span className="flex items-center gap-2">
                                          {!hasAccess && <Lock size={16} />} {lesson.title}
                                        </span>
                                        <Badge>{lesson.difficulty}</Badge>
                                      </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <p className="text-sm text-gray-600 mb-4">{lesson.description}</p>
                                      <div className="flex gap-2">
                                        {hasAccess ? (
                                          <>
                                            <Button asChild variant="outline" size="sm"><a href={lesson.video_url} target="_blank" rel="noopener noreferrer"><Video size={16} className="mr-2"/>Tonton Video</a></Button>
                                            <Button asChild variant="outline" size="sm"><a href={lesson.materials_url || '#'} target="_blank" rel="noopener noreferrer"><FileText size={16} className="mr-2"/>Materi</a></Button>
                                          </>
                                        ) : (
                                          <div className="text-sm text-red-600">Upgrade paket Anda untuk mengakses materi ini.</div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                )
                              })}
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button asChild className="w-full flex-1 rounded-full" variant="outline" disabled={status === 'locked'}>
                          <a href={bookLink} target="_blank" rel="noopener noreferrer">
                            {status === 'locked' ? <Lock size={16} className="mr-2"/> : <Book size={16} className="mr-2"/>}
                            Modul Buku
                          </a>
                        </Button>
                      </div>
                       {/* --- AKHIR PERUBAHAN --- */}
                    </div>
                  </div>
                )
              }))}
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <Card className="rounded-2xl shadow-md">
              <CardHeader>
                <CardTitle>Template Website Anda</CardTitle>
                <CardDescription>Akses dan kelola template yang telah Anda pesan</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition">
                        <div className="flex items-center gap-3">
                          <Package className="text-blue-600" size={24}/>
                          <div>
                            <h3 className="font-medium">{order.template_name}</h3>
                            <p className="text-sm text-gray-600">Dipesan pada: {new Date(order.createdAt).toLocaleDateString('id-ID')}</p>
                          </div>
                        </div>
                        {order.status === 'completed' && order.template_path ? (
                          <Button asChild className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                            <a href={order.template_path} target="_blank" rel="noopener noreferrer">
                              <ExternalLink size={16} className="mr-2" />Buka Template
                            </a>
                          </Button>
                        ) : (
                          <Badge variant="secondary">Sedang Diproses</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-400 mb-4"/>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Anda Belum Memiliki Template</h3>
                    <p className="text-gray-600 mb-4">Jelajahi galeri template kami dan mulai bangun kehadiran online Anda.</p>
                    <Button variant="default" asChild className="rounded-full bg-orange-500 hover:bg-orange-600 text-white">
                      <Link to="/templates">Lihat Template</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
// src/pages/AdminCMS.tsx

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Save, X, Video, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import AdminHeader from '@/components/AdminHeader';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Definisikan tipe data agar lebih mudah dikelola
interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  chapters: Chapter[];
}

interface Chapter {
  id: string;
  module_id: string;
  title: string;
  description: string;
  order_index: number;
  is_published: boolean;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  difficulty: 'basic' | 'medium' | 'large';
  order_index: number;
  video_url?: string;
  content?: string;
  materials_url?: string;
  duration_minutes?: number;
  is_published: boolean;
  required_package: string[];
}

// Tipe data untuk form
type NewModulePayload = Omit<Module, 'id' | 'chapters' | 'order_index'>;
type NewChapterPayload = Omit<Chapter, 'id' | 'lessons' | 'order_index'>;

const AdminCMS = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showAddDialog, setShowAddDialog] = useState<'module' | 'chapter' | 'lesson' | null>(null);
  const { toast } = useToast();

  const fetchLmsData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lms/content`);
      const data = await response.json();
      if (!response.ok) throw new Error('Gagal memuat data LMS');
      setModules(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLmsData();
  }, []);

  const saveLesson = async (lesson: Partial<Lesson>) => {
    try {
      let response;
      if (editingLesson?.id) {
        response = await fetch(`${API_BASE_URL}/lms/lessons/${editingLesson.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(lesson)
        });
      } else {
        response = await fetch(`${API_BASE_URL}/lms/lessons`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...lesson, chapter_id: selectedChapter })
        });
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      
      toast({ title: "Berhasil", description: result.message });
      setEditingLesson(null);
      setShowAddDialog(null);
      fetchLmsData();

    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const addEntity = async (type: 'module' | 'chapter', payload: NewModulePayload | NewChapterPayload) => {
    try {
        const response = await fetch(`${API_BASE_URL}/lms/${type}s`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        toast({ title: 'Berhasil', description: result.message });
        setShowAddDialog(null);
        fetchLmsData();
    } catch (error: any) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';  
      case 'large': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const selectedModuleData = modules.find(m => m.id === selectedModule);
  const selectedChapterData = selectedModuleData?.chapters?.find(c => c.id === selectedChapter);

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-between">
              CMS - Kelola Konten LMS
              <div className="space-x-2">
                <Dialog open={showAddDialog === 'module'} onOpenChange={(open) => setShowAddDialog(open ? 'module' : null)}>
                  <DialogTrigger asChild><Button size="sm"><Plus className="w-4 h-4 mr-2" />Tambah Modul</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Tambah Modul Baru</DialogTitle></DialogHeader>
                    <AddForm type="module" onSubmit={(payload) => addEntity('module', payload as NewModulePayload)} onCancel={() => setShowAddDialog(null)} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? <p>Loading...</p> : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Modul</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    {modules.map((module) => (
                      <div key={module.id} className={`p-3 rounded border cursor-pointer ${selectedModule === module.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                        onClick={() => { setSelectedModule(module.id); setSelectedChapter(''); }}>
                          <h4 className="font-medium">{module.title}</h4>
                          <p className="text-sm text-muted-foreground">{module.chapters?.length || 0} BAB</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      BAB
                      {selectedModule && (
                        <Dialog open={showAddDialog === 'chapter'} onOpenChange={(open) => setShowAddDialog(open ? 'chapter' : null)}>
                          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4" /></Button></DialogTrigger>
                          <DialogContent>
                            <DialogHeader><DialogTitle>Tambah BAB Baru</DialogTitle></DialogHeader>
                            <AddForm type="chapter" onSubmit={(payload) => addEntity('chapter', { ...payload, module_id: selectedModule } as NewChapterPayload)} onCancel={() => setShowAddDialog(null)} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedModuleData?.chapters?.map((chapter) => (
                      <div key={chapter.id} className={`p-3 rounded border cursor-pointer ${selectedChapter === chapter.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'}`}
                        onClick={() => setSelectedChapter(chapter.id)}>
                        <h4 className="font-medium">{chapter.title}</h4>
                        <p className="text-sm text-muted-foreground">{chapter.lessons?.length || 0} Materi</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      Materi
                      {selectedChapter && (
                        <Dialog open={showAddDialog === 'lesson'} onOpenChange={(open) => setShowAddDialog(open ? 'lesson' : null)}>
                          <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="w-4 h-4" /></Button></DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader><DialogTitle>Tambah Materi Baru</DialogTitle></DialogHeader>
                            <LessonForm onSave={saveLesson} onCancel={() => setShowAddDialog(null)} />
                          </DialogContent>
                        </Dialog>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {selectedChapterData?.lessons?.map((lesson) => (
                      <div key={lesson.id} className="p-3 rounded border hover:bg-muted flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <Badge className={getDifficultyColor(lesson.difficulty)}>{lesson.difficulty}</Badge>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setEditingLesson(lesson)}><Edit className="w-4 h-4" /></Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={!!editingLesson} onOpenChange={(open) => !open && setEditingLesson(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader><DialogTitle>Edit Materi: {editingLesson?.title}</DialogTitle></DialogHeader>
            {editingLesson && <LessonForm lesson={editingLesson} onSave={saveLesson} onCancel={() => setEditingLesson(null)} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// --- Form Components ---
interface AddFormProps {
    type: 'module' | 'chapter';
    onSubmit: (payload: NewModulePayload | Omit<NewChapterPayload, 'module_id'>) => void;
    onCancel: () => void;
}

const AddForm: React.FC<AddFormProps> = ({ onSubmit, onCancel }) => {
    const [formData, setFormData] = useState({ title: '', description: '', is_published: false });
    return (
        <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-4">
            <div>
                <Label>Judul</Label>
                <Input value={formData.title} onChange={(e) => setFormData(f => ({...f, title: e.target.value}))} required />
            </div>
            <div>
                <Label>Deskripsi</Label>
                <Textarea value={formData.description} onChange={(e) => setFormData(f => ({...f, description: e.target.value}))} />
            </div>
            <div className="flex items-center space-x-2">
                <Switch checked={formData.is_published} onCheckedChange={(c) => setFormData(f => ({...f, is_published: c}))} />
                <Label>Publish</Label>
            </div>
            <div className="flex gap-2">
                <Button type="submit">Simpan</Button>
                <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
            </div>
        </form>
    );
};

interface LessonFormProps {
    lesson?: Lesson;
    onSave: (payload: Partial<Lesson>) => void;
    onCancel: () => void;
}

const LessonForm: React.FC<LessonFormProps> = ({ lesson, onSave, onCancel }) => {
  const [formState, setFormState] = useState<Partial<Lesson>>(lesson || {
    title: '', description: '', difficulty: 'basic', content: '', duration_minutes: 0, is_published: false, required_package: ['small'], video_url: '', materials_url: ''
  });

  const handleChange = (field: keyof typeof formState, value: any) => {
    setFormState(prev => ({...prev, [field]: value}));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(formState); }} className="space-y-4">
      <Input placeholder="Judul Materi" value={formState.title} onChange={e => handleChange('title', e.target.value)} required />
      <Textarea placeholder="Deskripsi" value={formState.description} onChange={e => handleChange('description', e.target.value)} />
      <Textarea placeholder="Konten Materi" value={formState.content || ''} onChange={e => handleChange('content', e.target.value)} rows={5} />
      <Select value={formState.difficulty} onValueChange={(v: any) => handleChange('difficulty', v)}>
        <SelectTrigger><SelectValue/></SelectTrigger>
        <SelectContent>
            <SelectItem value="basic">Basic</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="large">Large</SelectItem>
        </SelectContent>
      </Select>
      <Input type="number" placeholder="Durasi (menit)" value={formState.duration_minutes || ''} onChange={e => handleChange('duration_minutes', Number(e.target.value))} />
      <Input placeholder="URL Video" value={formState.video_url || ''} onChange={e => handleChange('video_url', e.target.value)} />
      <Input placeholder="URL Materi" value={formState.materials_url || ''} onChange={e => handleChange('materials_url', e.target.value)} />
      <div className="flex items-center space-x-2">
        <Switch checked={formState.is_published} onCheckedChange={(c) => handleChange('is_published', c)} />
        <Label>Publish</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit"><Save className="w-4 h-4 mr-2" />Simpan</Button>
        <Button type="button" variant="outline" onClick={onCancel}><X className="w-4 h-4 mr-2" />Batal</Button>
      </div>
    </form>
  );
};

export default AdminCMS;
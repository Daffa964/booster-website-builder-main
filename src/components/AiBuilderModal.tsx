// src/components/AiBuilderModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Sparkles,
  Loader2,
  Clock,
  Copy,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AiBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  onStartNewBuild: () => void;
  currentView: 'input' | 'processing' | 'completed' | 'error';
  professionalPrompt: string | null;
  timeLeft: number | null;
  isLoading: boolean;
  jobId: string | null;
  websiteUrl: string | null;
  errorMessage: string | null;
  onStatusUpdate: (status: 'completed' | 'failed', data?: any) => void;
}

// === Komponen Timer ===
const TimerDisplay: React.FC<{ currentTime: number | null }> = ({ currentTime }) => {
  if (currentTime === null || currentTime < 0) {
    return (
      <div className="text-center font-mono text-4xl font-bold text-gray-400 my-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        --:--
      </div>
    );
  }
  const minutes = Math.floor(currentTime / 60);
  const seconds = currentTime % 60;
  return (
    <div className="text-center font-mono text-4xl font-bold text-blue-600 my-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};

const AiBuilderModal: React.FC<AiBuilderModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onStartNewBuild,
  currentView,
  professionalPrompt,
  timeLeft,
  isLoading,
  jobId,
  websiteUrl,
  errorMessage,
  onStatusUpdate,
}) => {
  const [prompt, setPrompt] = useState('');
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // === Fungsi Submit ===
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  // === Fungsi Close ===
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setPrompt('');
        onClose();
      }, 300);
    }
  };

  // === Fungsi Copy Prompt ===
  const handleCopyPrompt = () => {
    if (!professionalPrompt) return;
    navigator.clipboard.writeText(professionalPrompt);
    toast({ title: 'Prompt berhasil disalin ✨' });
  };

  // === Polling Job Status ===
  useEffect(() => {
    const stopPolling = () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };

    const checkStatus = async () => {
      if (!jobId) return;
      try {
        const response = await fetch(`${API_BASE_URL}/ai-builder/status/${jobId}`);
        const result = await response.json();

        if (!response.ok) {
          if (response.status === 404) {
            onStatusUpdate('failed', { message: 'Proses tidak ditemukan.' });
          } else {
            throw new Error(result.error);
          }
          stopPolling();
          return;
        }

        if (result.status === 'completed' || result.status === 'failed') {
          onStatusUpdate(result.status, result);
          stopPolling();
        }
      } catch (error: any) {
        console.error(`[Polling] Error job ${jobId}:`, error);
        stopPolling();
        onStatusUpdate('failed', { message: 'Gagal memeriksa status proses.' });
      }
    };

    if (currentView === 'processing' && jobId && !pollingIntervalRef.current) {
      checkStatus();
      pollingIntervalRef.current = setInterval(checkStatus, 5000); // 5 detik sekali
    } else if (currentView !== 'processing') {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [currentView, jobId, onStatusUpdate]);

  // === Render ===
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="text-purple-500" />
            AI Website Builder
          </DialogTitle>

          {currentView === 'input' && (
            <DialogDescription>Jelaskan ide website Anda secara singkat dan jelas.</DialogDescription>
          )}
          {currentView === 'processing' && (
            <DialogDescription>AI sedang memproses prompt Anda. Mohon tunggu...</DialogDescription>
          )}
          {currentView === 'completed' && (
            <DialogDescription>Website Anda telah berhasil dibuat! 🎉</DialogDescription>
          )}
          {currentView === 'error' && (
            <DialogDescription>Terjadi kesalahan saat memproses website Anda.</DialogDescription>
          )}
        </DialogHeader>

        {/* === VIEW: INPUT === */}
        {currentView === 'input' && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="prompt">Ide Website Anda</Label>
                <Textarea
                  id="prompt"
                  placeholder="Contoh: buatkan website untuk bisnis kopi modern..."
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Semakin detail ide Anda, semakin baik hasil yang dibuat AI.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Batal
              </Button>
              <Button type="submit" disabled={isLoading || !prompt.trim()}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...
                  </>
                ) : (
                  'Generate ✨'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}

        {/* === VIEW: PROCESSING === */}
        {currentView === 'processing' && professionalPrompt && (
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <Label>Prompt yang Disempurnakan oleh AI:</Label>
                <Button variant="ghost" size="sm" onClick={handleCopyPrompt}>
                  <Copy size={14} className="mr-1" /> Salin
                </Button>
              </div>
              <div className="bg-gray-100 p-3 rounded-md border text-sm max-h-40 overflow-y-auto">
                {professionalPrompt}
              </div>
            </div>

            <div className="text-center space-y-2">
              <Label className="flex items-center justify-center gap-2 text-muted-foreground">
                <Clock size={16} /> Estimasi Waktu Pembuatan
              </Label>
              <TimerDisplay currentTime={timeLeft} />
              <p className="text-xs text-muted-foreground">
                Website akan tampil otomatis setelah proses selesai.
              </p>
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-500 mt-4" />
            </div>

            <DialogFooter className="justify-between">
              <Button variant="ghost" onClick={onStartNewBuild}>
                Buat Baru
              </Button>
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* === VIEW: COMPLETED === */}
        {currentView === 'completed' && websiteUrl && (
          <div className="py-4 space-y-4">
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Berhasil!</AlertTitle>
              <AlertDescription className="text-green-700">
                Website Anda telah berhasil dibuat oleh AI.
              </AlertDescription>
            </Alert>

            <div className="aspect-video border rounded-md overflow-hidden bg-gray-100">
              <iframe
                src={websiteUrl}
                title="Preview Website AI"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin"
              />
            </div>

            <DialogFooter className="justify-between">
              <Button variant="outline" asChild>
                <a href={websiteUrl} target="_blank" rel="noopener noreferrer">
                  Buka di Tab Baru <ExternalLink size={16} className="ml-2" />
                </a>
              </Button>
              <Button onClick={onStartNewBuild}>Buat Baru Lagi</Button>
            </DialogFooter>
          </div>
        )}

        {/* === VIEW: ERROR === */}
        {currentView === 'error' && (
          <div className="py-4 space-y-4 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="text-red-700 font-medium">Gagal Membuat Website</p>
            <p className="text-sm text-muted-foreground">
              {errorMessage || 'Terjadi kesalahan yang tidak diketahui.'}
            </p>
            <DialogFooter className="justify-center">
              <Button variant="outline" onClick={onClose}>
                Tutup
              </Button>
              <Button onClick={onStartNewBuild}>Coba Lagi</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AiBuilderModal;

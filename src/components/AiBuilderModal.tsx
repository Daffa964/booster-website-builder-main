// src/components/AiBuilderModal.tsx
import React, { useState, useEffect } from 'react';
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
import { Sparkles, Loader2, Clock } from 'lucide-react';

interface AiBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  onStartNewBuild: () => void;
  currentView: 'input' | 'processing';
  professionalPrompt: string | null;
  timeLeft: number | null;
  isLoading: boolean;
}

const TimerDisplay: React.FC<{ currentTime: number | null }> = ({ currentTime }) => {
  if (currentTime === null || currentTime < 0) {
      return ( <div className="text-center font-mono text-4xl font-bold text-gray-400 my-4 p-4 bg-gray-50 rounded-lg border border-gray-200"> --:-- </div> );
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
  professionalPrompt, // <-- Prop ini harusnya ada isinya saat view='processing'
  timeLeft,
  isLoading,
}) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onSubmit(prompt);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setTimeout(() => {
        setPrompt('');
        onClose();
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
             <Sparkles className="text-purple-500" />
             AI Website Builder
          </DialogTitle>
           {currentView === 'input' && ( <DialogDescription> Jelaskan ide website Anda...</DialogDescription> )}
           {currentView === 'processing' && ( <DialogDescription> AI sedang memproses prompt Anda...</DialogDescription> )}
        </DialogHeader>

        {/* --- KONTEN INPUT --- */}
        {currentView === 'input' && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid w-full gap-1.5">
                <Label htmlFor="prompt">Ide Website Anda</Label>
                <Textarea id="prompt" placeholder="Contoh: buatkan website..." rows={4} value={prompt} onChange={(e) => setPrompt(e.target.value)} required disabled={isLoading} />
                 <p className="text-xs text-muted-foreground"> Semakin detail ide Anda...</p>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}> Batal </Button>
              <Button type="submit" disabled={isLoading || !prompt.trim()}> {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : 'Generate ✨'} </Button>
            </DialogFooter>
          </form>
        )}

        {/* --- KONTEN PROCESSING --- */}
        {/* Pastikan professionalPrompt ada sebelum render blok ini */}
        {currentView === 'processing' && professionalPrompt && (
          <div className="py-4 space-y-4">
             {/* === BAGIAN PENTING UNTUK MENAMPILKAN PROMPT === */}
             <div className="space-y-2">
                <Label>Prompt yang Disempurnakan oleh AI:</Label>
                <div className="bg-gray-100 p-3 rounded-md border text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {professionalPrompt} {/* <-- PASTIKAN INI ADA */}
                </div>
                <p className="text-xs text-muted-foreground"> Salin prompt ini dan gunakan di Lovable secara manual.</p>
             </div>
             {/* ============================================== */}

             <div className="space-y-2 text-center">
                <Label className="flex items-center justify-center gap-2 text-muted-foreground"> <Clock size={16}/> Estimasi Waktu Tunggu (Manual): </Label>
                 <TimerDisplay currentTime={timeLeft} />
                 <p className="text-xs text-muted-foreground"> Timer ini hanya sebagai indikasi...</p>
             </div>
              <DialogFooter className="justify-between">
                 <Button type="button" variant="ghost" onClick={onStartNewBuild}> Buat Baru </Button>
                 <Button type="button" variant="outline" onClick={onClose}> Tutup </Button>
             </DialogFooter>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
};

export default AiBuilderModal;
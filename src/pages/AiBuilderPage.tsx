// src/pages/AiBuilderPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Send, Sparkles, Bot, User, Loader2, Timer } from 'lucide-react';
import { toast } from '@/components/ui/sonner'; // Menggunakan sonner toast
import Header from '@/components/Header'; //
import Footer from '@/components/Footer'; //

// --- PENTING: GANTI DENGAN URL PRODUKSI N8N ANDA ---
const N8N_PRODUCTION_URL = 'https://n8n.bibooster.agency/webhook/53cc061b-4963-478b-8e96-35878d8ef365';
// (Ini adalah URL dari node Webhook Anda yang sudah AKTIF)
// -----------------------------------------------------

// URL Backend B.I. Booster Anda
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'; //

interface Message {
  id: number;
  sender: 'user' | 'bot';
  text: React.ReactNode;
}

// Fungsi untuk memformat detik menjadi MM:SS
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const AiBuilderPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, sender: 'bot', text: 'Selamat datang di AI Builder! ✨ Cukup deskripsikan bisnis Anda (misal: "toko bunga segar di Pati"), dan saya akan mulai merancangnya.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Untuk submit prompt awal
  const [isPolling, setIsPolling] = useState(false); // Untuk menunggu hasil 30 menit
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(30 * 60); // 30 menit
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fungsi untuk auto-scroll ke pesan terbaru
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Hentikan semua interval saat komponen di-unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  // --- EFEK UNTUK POLLING ---
  useEffect(() => {
    if (isPolling && currentRequestId) {
      // Mulai polling
      pollingIntervalRef.current = setInterval(async () => {
        try {
          // 2. Panggil backend Anda untuk cek status
          const response = await fetch(`${API_BASE_URL}/ai/check-status/${currentRequestId}`);
          if (!response.ok) {
            // Biarkan polling berlanjut jika 404 (belum siap) atau 500
            console.warn(`Polling... status: ${response.status}`);
            return;
          }

          const result = await response.json();

          // 3. Jika backend bilang "ready"
          if (result.status === 'ready' && result.resultUrl) {
            setIsPolling(false);
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            
            // Tampilkan hasil!
            setMessages(prev => [...prev, {
              id: Date.now(),
              sender: 'bot',
              text: (
                <span>
                  🎉 Website Anda sudah siap! Silakan lihat hasilnya di sini: <a href={result.resultUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{result.resultUrl}</a>
                </span>
              )
            }]);
          }
          // Jika statusnya masih "processing", biarkan interval berlanjut...

        } catch (error) {
          console.error("Polling error:", error);
          // Biarkan polling berlanjut
        }
      }, 15000); // Cek setiap 15 detik

      // Mulai countdown timer visual
      setCountdown(30 * 60); // Reset timer
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    }

    // Cleanup function
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isPolling, currentRequestId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const userPrompt = inputValue.trim();
    if (!userPrompt || isLoading || isPolling) return;

    setIsLoading(true);
    setMessages(prev => [...prev, { id: Date.now(), sender: 'user', text: userPrompt }]);
    setInputValue('');

    const loadingMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: loadingMessageId,
      sender: 'bot',
      text: (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin h-4 w-4" />
          Menganalisis dan menyempurnakan prompt Anda...
        </div>
      )
    }]);

    try {
      // 1. Panggil n8n untuk dapatkan prompt profesional
      const response = await fetch(N8N_PRODUCTION_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userPrompt })
      });

      if (!response.ok) {
        throw new Error(`Gagal terhubung ke n8n (Status: ${response.status}). Coba lagi nanti.`);
      }

      const result = await response.json();
      
      // Hapus pesan "Menganalisis..."
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

      if (result.success && result.status === 'processing' && result.requestId) {
        // Simpan requestId
        setCurrentRequestId(result.requestId);
        
        // Tampilkan prompt profesional
        setMessages(prev => [...prev, {
          id: Date.now() + 2,
          sender: 'bot',
          text: (
            <div>
              <p className="font-semibold mb-2">Prompt Anda telah disempurnakan:</p>
              <p className="text-sm italic p-2 bg-gray-200 rounded">"{result.enhancedPrompt}"</p>
            </div>
          )
        }]);

        // Tampilkan timer dan mulai polling
        setMessages(prev => [...prev, {
          id: Date.now() + 3,
          sender: 'bot',
          text: (
            <div className="flex items-center gap-2 text-gray-500">
              <Timer className="animate-pulse h-4 w-4" />
              Kami sedang membuat website Anda. Mohon tunggu, halaman ini akan diperbarui otomatis...
            </div>
          )
        }]);
        setIsPolling(true); // Ini akan memicu useEffect polling

        // TODO: Panggil backend B.I. Booster untuk menyimpan data awal
        // Ini adalah "fire-and-forget", kita tidak menunggu balasannya
        fetch(`${API_BASE_URL}/ai/initiate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            requestId: result.requestId, 
            enhancedPrompt: result.enhancedPrompt 
          })
        }).catch(err => console.error("Gagal inisiasi request di backend:", err));

      } else {
        throw new Error(result.error || 'Gagal memproses prompt di n8n.');
      }

    } catch (error: any) {
      console.error('Error sending message:', error);
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId)); // Hapus loading
      setMessages(prev => [...prev, {
        id: Date.now() + 2,
        sender: 'bot',
        text: `Maaf, terjadi kesalahan: ${error.message}`
      }]);
      toast({
        title: "Gagal Memproses Prompt",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Selesai submit prompt awal
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />

      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-3xl shadow-2xl rounded-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              AI Website Builder (Demo KMI)
            </CardTitle>
            <CardDescription className="text-blue-100">
              Jelaskan bisnis Anda, dan biarkan AI merancang draf website untuk Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex flex-col" style={{ height: '65vh' }}>
            <ScrollArea className="flex-grow p-6 space-y-4" ref={scrollAreaRef}>
              {messages.map((message) => (
                <div key={message.id} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  {message.sender === 'bot' && (
                    <Avatar className="h-8 w-8 border-2 border-blue-200">
                      <AvatarFallback className="bg-blue-500 text-white"><Bot size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`max-w-[75%] p-3 rounded-lg shadow-sm ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    {message.text}
                  </div>
                   {message.sender === 'user' && (
                    <Avatar className="h-8 w-8 border-2 border-gray-200">
                      <AvatarFallback className="bg-gray-500 text-white"><User size={16} /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {/* Menampilkan timer countdown jika sedang polling */}
              {isPolling && (
                <div className="flex justify-center items-center gap-2 text-lg font-mono text-gray-500 sticky bottom-0 py-2 bg-gradient-to-t from-white to-transparent">
                  <Timer className="h-5 w-5" />
                  Waktu Tunggu: {formatTime(countdown)}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder={isPolling ? "Harap tunggu, website sedang dibuat..." : "Deskripsikan bisnis Anda di sini..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  disabled={isLoading || isPolling}
                  className="flex-grow rounded-full px-4 py-2 focus-visible:ring-blue-500"
                />
                <Button
                  type="submit"
                  disabled={isLoading || isPolling || inputValue.trim() === ''}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                  size="icon"
                >
                  {isLoading || isPolling ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default AiBuilderPage;
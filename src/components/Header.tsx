import React, { useState, useEffect } from 'react';
import { Menu, X, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AiBuilderModal from './AiBuilderModal'; // <-- Pastikan path import ini benar
import { useToast } from "@/components/ui/use-toast"; // <-- Import useToast

// URL backend API (ambil dari environment variable Vite)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiBuilderModalOpen, setIsAiBuilderModalOpen] = useState(false);
  // State view sekarang lebih sederhana: 'input' atau 'processing'
  const [aiBuilderState, setAiBuilderState] = useState<'input' | 'processing'>('input');
  const [professionalPrompt, setProfessionalPrompt] = useState<string | null>(null);
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Tetap perlu untuk feedback tombol
  const [timeLeft, setTimeLeft] = useState<number | null>(null); // <-- State timer di sini
  // Error message tidak perlu state global lagi
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const navItems = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Tentang Kami', href: '#tentang' },
    { name: 'Kategori Template', href: '#kategori' },
    { name: 'Cara Kerja', href: '#cara-kerja' },
    { name: 'Kontak', href: '#kontak' },
  ];

  // --- Efek untuk mengelola interval timer ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (aiBuilderState === 'processing' && timeLeft !== null && timeLeft > 0) {
      console.log("Memulai interval timer...");
      intervalId = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime !== null && prevTime > 0) {
            return prevTime - 1;
          } else {
            // Waktu habis, hentikan interval
            if (intervalId) clearInterval(intervalId);
            // Anda bisa tambahkan logika lain di sini jika waktu habis
             console.log("Timer Selesai!");
            // setAiBuilderState('completed'); // Pindah ke state 'completed' jika ada
            return 0;
          }
        });
      }, 1000); // Setiap 1 detik
    }

    // Cleanup function: Hentikan interval jika state berubah atau komponen unmount
    return () => {
      if (intervalId) {
        console.log("Membersihkan interval timer...");
        clearInterval(intervalId);
      }
    };
  }, [aiBuilderState, timeLeft]); // Jalankan efek saat state ini berubah
  // ------------------------------------------

  const handleOpenAiBuilder = () => {
    // Hanya membuka modal, tidak mereset state
    setIsAiBuilderModalOpen(true);
  };

  // --- Fungsi untuk menutup modal ---
  const handleCloseAiBuilder = () => {
     setIsAiBuilderModalOpen(false);
  };

  // --- Buat fungsi baru untuk mereset/memulai dari awal ---
  const handleStartNewBuild = () => {
    setAiBuilderState('input');
    setProfessionalPrompt(null);
    setEstimatedDuration(null);
    setIsLoading(false);
    setTimeLeft(null);
  };

  const handleAiBuilderSubmit = async (rawPrompt: string) => {
    console.log("Prompt mentah diterima, mengirim ke backend:", rawPrompt);
    setIsLoading(true); // Mulai loading
    // setErrorMessage(null); // Tidak perlu

    try {
      const response = await fetch(`${API_BASE_URL}/ai-builder/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_prompt: rawPrompt }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      console.log("Respons dari backend:", result);

      // Sukses! Update state untuk menampilkan view 'processing'
      setProfessionalPrompt(result.professional_prompt);
      setEstimatedDuration(result.estimated_duration_minutes);
      setTimeLeft(result.estimated_duration_minutes * 60);
      setAiBuilderState('processing'); // <-- Ganti view modal

      // Tidak perlu trigger background job atau polling lagi

    } catch (error: any) {
      console.error("Gagal memanggil API AI Builder:", error);
      // Tampilkan error langsung via toast, tidak perlu state view 'error'
      toast({
        title: "Gagal Memproses Prompt",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
      // Tetap di view 'input' jika error
      setAiBuilderState('input');
      setTimeLeft(null);
    } finally {
      setIsLoading(false); // Selesai loading
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="text-2xl font-bold text-blue-600">
              B.I <span className="text-blue-800">Booster</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium"
              >
                {item.name}
              </a>
            ))}
            <div className="flex items-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/auth" className="flex items-center gap-2">
                  <User size={16} />
                  Login
                </Link>
              </Button>

              {/* Tombol AI Builder */}
              <Button
                variant="secondary"
                onClick={handleOpenAiBuilder}
                className="transition-all duration-200 hover:scale-105 bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:from-purple-500 hover:to-blue-600"
              >
                <Sparkles size={16} className="mr-2"/>
                AI Builder
              </Button>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:scale-105" asChild>
                <Link to="/templates">Mulai Sekarang</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile menu button */}
           <div className="md:hidden flex items-center gap-2">
             <Button
                variant="ghost"
                size="icon"
                onClick={handleOpenAiBuilder} // onClick untuk ikon mobile
                className="text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Sparkles size={20} />
                 <span className="sr-only">AI Builder</span>
              </Button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4 animate-fade-in">
            <nav className="flex flex-col space-y-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 transition-colors duration-200 font-medium px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              <div className="flex flex-col gap-2 mx-2 mt-4">
                 <Button
                  variant="secondary"
                  onClick={() => { handleOpenAiBuilder(); setIsMenuOpen(false); }}
                  className="bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:from-purple-500 hover:to-blue-600"
                 >
                   <Sparkles size={16} className="mr-2"/>
                  AI Builder
                 </Button>
                 <Button variant="outline" asChild>
                   <Link to="/auth" className="flex items-center gap-2">
                     <User size={16} />
                     Login
                   </Link>
                 </Button>
                 <Button className="bg-orange-500 hover:bg-orange-600 text-white" asChild>
                   <Link to="/templates">Mulai Sekarang</Link>
                 </Button>
              </div>
            </nav>
          </div>
        )}
      </div>

       {/* Render Modal */}
       <AiBuilderModal
            isOpen={isAiBuilderModalOpen}
            onClose={handleCloseAiBuilder}
            onSubmit={handleAiBuilderSubmit}
            onStartNewBuild={handleStartNewBuild}
            currentView={aiBuilderState} // Hanya 'input' atau 'processing'
            professionalPrompt={professionalPrompt}
            // estimatedDuration tidak perlu dikirim lagi ke modal
            timeLeft={timeLeft} // <-- Kirim state timeLeft
            isLoading={isLoading}
          />
    </header>
  );
};

export default Header;
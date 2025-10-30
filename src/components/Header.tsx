// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import { Menu, X, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AiBuilderModal from './AiBuilderModal';
import { useToast } from "@/components/ui/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAiBuilderModalOpen, setIsAiBuilderModalOpen] = useState(false);

  // Sekarang state AI Builder mendukung lebih banyak status
  const [aiBuilderState, setAiBuilderState] = useState<'input' | 'processing' | 'completed' | 'error'>('input');

  const [professionalPrompt, setProfessionalPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const navItems = [
    { name: 'Beranda', href: '#beranda' },
    { name: 'Tentang Kami', href: '#tentang' },
    { name: 'Kategori Template', href: '#kategori' },
    { name: 'Cara Kerja', href: '#cara-kerja' },
    { name: 'Kontak', href: '#kontak' },
  ];

  // --- Efek Timer ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (aiBuilderState === 'processing' && timeLeft !== null && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev && prev > 1) return prev - 1;
          if (intervalId) clearInterval(intervalId);
          return 0;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [aiBuilderState, timeLeft]);

  // --- Fungsi Handler Modal ---
  const handleOpenAiBuilder = () => {
    if (aiBuilderState === 'input' || aiBuilderState === 'completed' || aiBuilderState === 'error') {
      handleStartNewBuild();
    }
    setIsAiBuilderModalOpen(true);
  };

  const handleCloseAiBuilder = () => {
    setIsAiBuilderModalOpen(false);
  };

  const handleStartNewBuild = () => {
    setAiBuilderState('input');
    setProfessionalPrompt(null);
    setIsLoading(false);
    setTimeLeft(null);
    setJobId(null);
    setWebsiteUrl(null);
    setErrorMessage(null);
  };

  // --- Fungsi Submit Prompt ke Backend ---
  const handleAiBuilderSubmit = async (rawPrompt: string) => {
    console.log("Mengirim prompt ke backend:", rawPrompt);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/ai-builder/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_prompt: rawPrompt }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Gagal memulai proses.');

      setProfessionalPrompt(result.professional_prompt);
      setTimeLeft(result.estimated_duration_minutes * 60);
      setJobId(result.jobId);
      setAiBuilderState('processing');
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "Gagal Memproses Prompt",
        description: error.message || "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
      setAiBuilderState('input');
      setTimeLeft(null);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fungsi Callback dari Modal untuk Update Status ---
  const handleStatusUpdate = (status: 'completed' | 'failed', data?: any) => {
    console.log(`Status job diperbarui: ${status}`, data);
    if (status === 'completed' && data?.resultUrl) {
      setWebsiteUrl(data.resultUrl);
      setAiBuilderState('completed');
      setTimeLeft(0);
      toast({ title: "✅ Website berhasil dibuat!" });
    } else if (status === 'failed') {
      setErrorMessage(data?.message || data?.error || 'Proses gagal.');
      setAiBuilderState('error');
      setTimeLeft(0);
      toast({
        title: "❌ Proses Gagal",
        description: data?.message || "Terjadi kesalahan saat membangun website.",
        variant: "destructive",
      });
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
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
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

              <Button
                variant="secondary"
                onClick={handleOpenAiBuilder}
                className="bg-gradient-to-r from-purple-400 to-blue-500 text-white hover:from-purple-500 hover:to-blue-600 transition-all duration-200 hover:scale-105"
              >
                <Sparkles size={16} className="mr-2" />
                AI Builder
              </Button>

              <Button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg hover:scale-105 transition-all duration-200" asChild>
                <Link to="/templates">Mulai Sekarang</Link>
              </Button>
            </div>
          </nav>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleOpenAiBuilder}
              className="text-gray-600 hover:text-blue-600"
            >
              <Sparkles size={20} />
              <span className="sr-only">AI Builder</span>
            </Button>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-blue-600 transition-colors"
              aria-label={isMenuOpen ? "Tutup menu" : "Buka menu"}
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
                  className="text-gray-600 hover:text-blue-600 font-medium px-2"
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
                  <Sparkles size={16} className="mr-2" />
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

      {/* Modal AI Builder */}
      <AiBuilderModal
        isOpen={isAiBuilderModalOpen}
        onClose={handleCloseAiBuilder}
        onSubmit={handleAiBuilderSubmit}
        onStartNewBuild={handleStartNewBuild}
        currentView={aiBuilderState}
        professionalPrompt={professionalPrompt}
        timeLeft={timeLeft}
        isLoading={isLoading}
        jobId={jobId}
        websiteUrl={websiteUrl}
        errorMessage={errorMessage}
        onStatusUpdate={handleStatusUpdate}
      />
    </header>
  );
};

export default Header;

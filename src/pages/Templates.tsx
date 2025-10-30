// src/pages/Templates.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Filter } from 'lucide-react';

const Templates = () => {
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const templatesPerPage = 12;

  // --- PERUBAHAN 1: Data Kategori Baru (Sesuai Home) ---
  const categories = [
    { value: 'all', label: 'Semua Kategori' },
    { value: 'Makanan & Minuman (F&B)', label: 'Makanan & Minuman (F&B)' },
    { value: 'Fashion & Kecantikan', label: 'Fashion & Kecantikan' },
    { value: 'Jasa Profesional & Bisnis', label: 'Jasa Profesional & Bisnis' },
    { value: 'Teknologi, Kreatif & Portofolio', label: 'Teknologi, Kreatif & Portofolio' },
    { value: 'Jasa Hunian & Perbaikan', label: 'Jasa Hunian & Perbaikan' },
    { value: 'Kesehatan, Pendidikan & Gaya Hidup', label: 'Kesehatan, Pendidikan & Gaya Hidup' },
  ];

  // --- PERUBAHAN 2: Pemetaan Kategori ke Gambar (Sesuai Home) ---
  // Gunakan path /public/ Anda
  const categoryImageMapping: { [key: string]: string } = {
    'Makanan & Minuman (F&B)': '/makanan-minuman-fnb.webp', // Ganti dengan nama file Anda
    'Fashion & Kecantikan': '/fashion-kecantikan.webp',
    'Jasa Profesional & Bisnis': '/jasaprofesional-bisnis.webp', // Ganti dengan nama file Anda
    'Teknologi, Kreatif & Portofolio': '/teknologi-kreatif.webp',
    'Jasa Hunian & Perbaikan': '/jasa-perbaikan-rumah.webp',
    'Kesehatan, Pendidikan & Gaya Hidup': '/kesehatan-pendidikan.webp',
    'default': '/teknologi-kreatif.webp'
  };

  const getTemplateImage = (category: string) => {
    return categoryImageMapping[category] || categoryImageMapping['default'];
  };

  // --- Data Mapping 63 Prototipe Anda (Sudah Benar) ---
  const templateCategoryMapping: { [key: string]: string } = {
    'prototipe1': 'Jasa Hunian & Perbaikan',
    'prototipe2': 'Teknologi, Kreatif & Portofolio',
    'prototipe3': 'Teknologi, Kreatif & Portofolio',
    'prototipe4': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe5': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe6': 'Teknologi, Kreatif & Portofolio',
    'prototipe7': 'Fashion & Kecantikan',
    'prototipe8': 'Teknologi, Kreatif & Portofolio',
    'prototipe9': 'Teknologi, Kreatif & Portofolio',
    'prototipe10': 'Jasa Profesional & Bisnis',
    'prototipe11': 'Fashion & Kecantikan',
    'prototipe12': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe13': 'Makanan & Minuman (F&B)',
    'prototipe14': 'Jasa Profesional & Bisnis',
    'prototipe15': 'Fashion & Kecantikan',
    'prototipe16': 'Jasa Hunian & Perbaikan',
    'prototipe17': 'Teknologi, Kreatif & Portofolio',
    'prototipe18': 'Teknologi, Kreatif & Portofolio',
    'prototipe19': 'Jasa Hunian & Perbaikan',
    'prototipe20': 'Jasa Hunian & Perbaikan',
    'prototipe21': 'Jasa Profesional & Bisnis',
    'prototipe22': 'Jasa Profesional & Bisnis',
    'prototipe23': 'Teknologi, Kreatif & Portofolio',
    'prototipe24': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe25': 'Jasa Hunian & Perbaikan',
    'prototipe26': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe27': 'Jasa Hunian & Perbaikan',
    'prototipe28': 'Jasa Profesional & Bisnis',
    'prototipe29': 'Jasa Hunian & Perbaikan',
    'prototipe30': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe31': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe32': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe33': 'Teknologi, Kreatif & Portofolio',
    'prototipe34': 'Jasa Profesional & Bisnis',
    'prototipe35': 'Jasa Profesional & Bisnis',
    'prototipe36': 'Makanan & Minuman (F&B)',
    'prototipe37': 'Jasa Profesional & Bisnis',
    'prototipe38': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe39': 'Jasa Profesional & Bisnis',
    'prototipe40': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe41': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe42': 'Jasa Hunian & Perbaikan',
    'prototipe43': 'Jasa Profesional & Bisnis',
    'prototipe44': 'Jasa Profesional & Bisnis',
    'prototipe45': 'Jasa Profesional & Bisnis',
    'prototipe46': 'Teknologi, Kreatif & Portofolio',
    'prototipe47': 'Teknologi, Kreatif & Portofolio',
    'prototipe48': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe49': 'Teknologi, Kreatif & Portofolio',
    'prototipe50': 'Teknologi, Kreatif & Portofolio',
    'prototipe51': 'Teknologi, Kreatif & Portofolio',
    'prototipe52': 'Teknologi, Kreatif & Portofolio',
    'prototipe53': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe54': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe55': 'Teknologi, Kreatif & Portofolio',
    'prototipe56': 'Teknologi, Kreatif & Portofolio',
    'prototipe57': 'Jasa Hunian & Perbaikan',
    'prototipe58': 'Kesehatan, Pendidikan & Gaya Hidup',
    'prototipe59': 'Jasa Profesional & Bisnis',
    'prototipe60': 'Fashion & Kecantikan',
    'prototipe61': 'Jasa Profesional & Bisnis',
    'prototipe62': 'Jasa Profesional & Bisnis',
    'prototipe63': 'Kesehatan, Pendidikan & Gaya Hidup',
  };

  // --- PERUBAHAN 3: Logika Generasi allTemplates ---
  const allTemplates = Array.from({ length: 63 }, (_, i) => {
    const templateIndex = i + 1;
    const templateKey = `prototipe${templateIndex}`;
    const category = templateCategoryMapping[templateKey] || 'Lainnya'; 
    const simpleCategoryName = category.split(' ')[0].replace(',', '');

    return {
      id: `template-${templateIndex}`,
      name: `Template ${templateIndex}`, 
      category: category,
      description: `Template profesional untuk ${simpleCategoryName.toLowerCase()}`,
      // --- PERUBAHAN KUNCI ---
      // Ambil gambar berdasarkan KATEGORI, bukan ID individual
      image: getTemplateImage(category),
      // --- AKHIR PERUBAHAN KUNCI ---
      prototypeUrl: `https://prototipe-p2mw.barikliahmada.my.id/prototipe${templateIndex}`,
      featured: i < 6 
    };
  });

  // --- Atur Kategori Terpilih dari URL (Sudah Benar) ---
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      const isValidCategory = categories.some(c => c.value === categoryFromUrl);
      if (isValidCategory) {
        setSelectedCategory(categoryFromUrl);
      }
    }
  }, [searchParams]);

  // Filter templates (Sudah Benar)
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return allTemplates;
    }
    return allTemplates.filter(template => template.category === selectedCategory);
  }, [selectedCategory, allTemplates]);

  // Pagination logic (Sudah Benar)
  const totalPages = Math.ceil(filteredTemplates.length / templatesPerPage);
  const startIndex = (currentPage - 1) * templatesPerPage;
  const currentTemplates = filteredTemplates.slice(startIndex, startIndex + templatesPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1); 
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">
                ← Kembali ke Beranda
              </Link>
              <h1 className="text-3xl font-bold text-gray-900 mt-2">Template Website</h1>
              <p className="text-gray-600 mt-1">
                Pilih dari {filteredTemplates.length} template yang tersedia
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section (Sudah Benar) */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-5 w-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter berdasarkan:</span>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedCategory !== 'all' && (
            <Badge variant="secondary" className="text-sm">
              {categories.find(c => c.value === selectedCategory)?.label}
            </Badge>
          )}
        </div>

        {/* Templates Grid (Sudah Benar) */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {currentTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="relative">
                <img
                  src={template.image} // Ini sekarang akan menggunakan gambar kategori
                  alt={template.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className="absolute top-3 left-3 bg-white px-2 py-1 rounded-full">
                  <span className="text-blue-600 font-semibold text-xs">{template.category}</span>
                </div>
                {template.featured && (
                  <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full">
                    <span className="text-xs font-semibold">Unggulan</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <div className="flex gap-2">
                  <Link to={`/preview/${template.id}`} className="flex-1">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200 text-sm">
                      Preview
                    </Button>
                  </Link>
                  <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white transition-all duration-200 text-sm">
                    Pesan
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination (Sudah Benar) */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) handlePageChange(currentPage - 1);
                    }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(pageNum);
                        }}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) handlePageChange(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates; 
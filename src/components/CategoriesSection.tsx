// src/components/CategoriesSection.tsx

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CategoriesSection = () => {
  // --- PERUBAHAN: Kategori baru Anda ---
  const categories = [
    {
      name: 'Makanan & Minuman (F&B)',
      image: './makanan-minuman-fnb.webp',
      description: 'Template untuk bisnis kuliner, F&B, dan hasil bumi.',
      templateCount: 2, // Berdasarkan data Anda (prototipe13, prototipe36)
      categoryQuery: 'Makanan & Minuman (F&B)' // Teks untuk URL query
    },
    {
      name: 'Fashion & Kecantikan',
      image: './fashion-kecantikan.webp',
      description: 'Template untuk toko pakaian, salon, dan produk perawatan.',
      templateCount: 4, // Berdasarkan data Anda
      categoryQuery: 'Fashion & Kecantikan'
    },
    {
      name: 'Jasa Profesional & Bisnis',
      image: './jasaprofesional-bisnis.webp', // Gambar baru untuk Jasa
      description: 'Layanan B2B, konsultan, agensi, keuangan, dan industri.',
      templateCount: 12, // Berdasarkan data Anda
      categoryQuery: 'Jasa Profesional & Bisnis'
    },
    {
      name: 'Teknologi, Kreatif & Portofolio',
      image: './teknologi-kreatif.webp',
      description: 'Untuk bisnis digital, IT, agensi kreatif, dan portofolio.',
      templateCount: 15, // Berdasarkan data Anda
      categoryQuery: 'Teknologi, Kreatif & Portofolio'
    },
    {
      name: 'Jasa Hunian & Perbaikan',
      image: './jasa-perbaikan-rumah.webp', 
      description: 'Konstruksi, real estate, kebersihan, dan jasa reparasi.',
      templateCount: 9, // Berdasarkan data Anda
      categoryQuery: 'Jasa Hunian & Perbaikan'
    },
    {
      name: 'Kesehatan, Pendidikan & Gaya Hidup',
      image: './kesehatan-pendidikan.webp', 
      description: 'Klinik, pendidikan (LMS), kebugaran, hobi, dan pariwisata.',
      templateCount: 16, // Berdasarkan data Anda
      categoryQuery: 'Kesehatan, Pendidikan & Gaya Hidup'
    }
  ];
  // --- AKHIR PERUBAHAN ---

  return (
    <section id="kategori" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Kategori Template
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Pilih template yang sesuai dengan jenis bisnis UMKM Anda. Semua template dirancang khusus untuk kebutuhan bisnis lokal.
          </p>
          <Link to="/templates">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
              Lihat Semua Template (60+)
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category, index) => (
            <Card key={category.name} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 group">
              <div className="relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-30 transition-all duration-300"></div>
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded-full">
                  <span className="text-blue-600 font-semibold text-sm">{category.name}</span>
                </div>
                <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full">
                  <span className="text-white font-semibold text-sm">{category.templateCount} Template</span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex gap-3">
                  <Link to={`/templates?category=${encodeURIComponent(category.categoryQuery)}`} className="w-full">
                    <Button variant="outline" className="w-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-200">
                      Lihat Template
                    </Button>
                  </Link>
                  {/* Tombol Konsultasi Dihilangkan */}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
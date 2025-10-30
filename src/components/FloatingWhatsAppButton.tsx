// src/components/FloatingWhatsAppButton.tsx

import React from 'react';

// --- PERUBAHAN: Gunakan link WhatsApp AI baru Anda ---
// Kita tidak lagi membutuhkan nomor telepon, langsung gunakan URL lengkap
const WHATSAPP_AI_URL = 'https://wa.me/ais/793604520014862?s=5';
// ----------------------------------------------------

const FloatingWhatsAppButton = () => {
  return (
    <a
      href={WHATSAPP_AI_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center
                 bg-green-500 hover:bg-green-600 text-white
                 rounded-full shadow-lg
                 h-14 w-auto min-w-14 px-5 py-2
                 transition-all duration-300 ease-in-out
                 hover:scale-105 group"
    >
      {/* Ikon WhatsApp SVG (Tetap sama) */}
      <svg
        viewBox="0 0 32 32"
        className="w-6 h-6 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M16.003 0C7.17 0 0 7.17 0 16.003c0 3.034.84 5.86 2.348 8.41L.02 32l7.84-2.31c2.446 1.39 5.17 2.158 8.14 2.158 8.83 0 16.003-7.17 16.003-16.003S24.832 0 16.003 0zm0 29.35c-2.73 0-5.323-.74-7.6-2.064l-.546-.324-5.64 1.66 1.68-5.502-.358-.568c-1.42-2.28-2.17-4.96-2.17-7.79 0-7.36 5.973-13.33 13.33-13.33 7.36 0 13.33 5.97 13.33 13.33 0 7.36-5.97 13.33-13.33 13.33zM23.23 18.018c-.37-.184-2.175-1.072-2.51-1.196s-.58-.184-.826.184c-.246.37-.95.1.07-.1.18-.168 1.14-.946 1.226-1.04s.168-.184.25-.37c.08-.184.04-.34-.02-.524s-.826-.99-.1.358-1.71-.056-1.98-.1c-.27-.04-.58-.02-.826-.02-.246 0-.65.09-.99.46s-1.325 1.294-1.62 1.56c-.3.27-.597.31-.99.184-.39-.12-1.68-.617-3.2-1.97-.18-.21-.31-.38-.45-.58-.1-.13-.21-.28-.32-.45-.1-.17-.1-.28-.05-.4.04-.1.1-.25.2-.37.09-.13.15-.22.22-.3.07-.08.1-.14.15-.2.05-.07.03-.13-.02-.2-.05-.07-.826-.99-.1.358-1.71-.056-1.98-.1z" />
      </svg>
      
      {/* Teks (Tetap sama) */}
      <span className="ml-2 font-medium hidden sm:inline">Tanya Coach</span>
    </a>
  );
};

export default FloatingWhatsAppButton;
// server/src/controllers/aiBuilderController.ts
import { Request, Response } from 'express';
import { CohereClient } from "cohere-ai";

// Ambil API Key Cohere dari environment variable
const COHERE_API_KEY = process.env.COHERE_API_KEY;

if (!COHERE_API_KEY) {
  console.error("❌ COHERE_API_KEY environment variable is not set.");
  // process.exit(1); // Pertimbangkan exit di production
}

// Inisialisasi klien Cohere (hanya jika API Key ada)
let cohere: CohereClient | null = null;
if (COHERE_API_KEY) {
  cohere = new CohereClient({
    token: COHERE_API_KEY,
  });
}

// Hanya butuh fungsi ini (mirip sebelumnya)
export const startAiBuildProcess = async (req: Request, res: Response) => {
    const { raw_prompt } = req.body;

    if (!raw_prompt || typeof raw_prompt !== 'string' || raw_prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt tidak boleh kosong.' });
    }
    // Pastikan klien Cohere sudah diinisialisasi
    if (!cohere) {
       console.error("Cohere client is not initialized. Check API Key.");
       return res.status(500).json({ error: 'Konfigurasi AI server bermasalah.' });
    }

    console.log('Backend menerima prompt mentah:', raw_prompt);

    try {
        // --- MEMPROSES PROMPT DENGAN OPENAI ---

        // 1. Siapkan System Prompt (sama seperti sebelumnya)
        const systemPromptInstruction = `
[PERAN DAN TUJUAN]
Anda adalah AI Prompt Engineer ahli yang berspesialisasi dalam desain dan pengembangan website. Tugas Anda adalah mengubah permintaan mentah dan sederhana dari pengguna menjadi sebuah prompt yang sangat detail, komprehensif, dan profesional. Prompt hasil buatan Anda akan digunakan oleh AI generator website (bernama Lovable) untuk membuat sebuah website yang fungsional dan lengkap.

[INPUT]
Anda akan menerima satu baris input mentah dari pengguna.
Contoh Input Mentah: "buatkan web untuk jualan kopi"

[TUGAS]
1.  Tangkap ide inti dari input mentah.
2.  Perluas ide tersebut secara kreatif. Jika pengguna tidak memberikan detail, ANDA HARUS MENCIPTAKAN detail yang masuk akal (seperti nama bisnis imajiner, fitur spesifik, dan gaya desain) agar website yang dihasilkan terasa unik dan lengkap.
3.  Pastikan prompt profesional yang Anda hasilkan mencakup elemen-elemen berikut:
    * **Nama Bisnis & Identitas:** Ciptakan nama bisnis yang terdengar profesional.
    * **Gaya Desain & Nuansa (Mood):** Jelaskan estetika visual (misal: "modern dan minimalis", "hangat dan rustic", "elegan dan korporat").
    * **Palet Warna Utama:** Sarankan 2-3 warna utama.
    * **Struktur Halaman (Sitemap):** Tentukan halaman utama yang harus ada (misal: Home, Tentang Kami, Produk/Layanan, Kontak, Galeri).
    * **Detail Konten per Halaman:**
        * **Home:** Apa yang harus ada di hero section (misal: "gambar kopi resolusi tinggi", "CTA: Pesan Sekarang").
        * **Tentang Kami:** Cerita singkat (misro: "misi kami menyajikan kopi terbaik").
        * **Produk/Layanan:** Daftar beberapa contoh produk/layanan (misal: "Arabika, Robusta, Es Kopi Susu").
        * **Kontak:** Informasi apa yang harus ada (misal: "Formulir kontak, Peta Lokasi, No. WhatsApp").
    * **Call-to-Action (CTA) Utama:** Tentukan satu aksi utama yang diinginkan dari pengunjung.
    * **Target Audiens:** Jelaskan secara singkat siapa target pasarnya.

[FORMAT OUTPUT]
Hasilkan HANYA satu paragraf deskriptif yang mengalir dengan lancar, menggabungkan semua elemen di atas. JANGAN gunakan poin-poin atau format list. Tulis dalam Bahasa Indonesia yang profesional.
`; // <-- System prompt berakhir di sini

// 2. Panggil API Cohere Chat (Gunakan .chat() non-streaming)
            console.log("Mengirim prompt ke Cohere (non-streaming)...");
            const response = await cohere.chat({ // <--- GANTI ke cohere.chat()
                model: "command-r-plus-08-2024", // <--- Pastikan model ini
                preamble: systemPromptInstruction,
                message: raw_prompt,
                 // Opsi tambahan (opsional)
                 // temperature: 0.7,
                 // max_tokens: 500,
            });

            // Hapus loop 'for await' karena kita tidak streaming lagi
            /*
            let professional_prompt = "";
            for await (const event of chatStream) {
                if (event.eventType === "text-generation" && event.text) {
                   professional_prompt += event.text;
                }
            }
            */

            // Langsung ambil hasil dari response.text
            const professional_prompt = response.text?.trim(); // Tambahkan ?. untuk safety

            if (!professional_prompt || professional_prompt === "") { // Cek string kosong juga
                 throw new Error("Respons dari Cohere kosong atau tidak valid.");
            }
            console.log("Menerima prompt profesional dari Cohere.");
            // Tidak perlu trim lagi karena sudah di atas

        // 3. Langsung Kirim Hasil ke Frontend
        const estimated_duration_minutes = 30; // Estimasi untuk Lovable
        res.status(200).json({
            professional_prompt: professional_prompt,
            estimated_duration_minutes: estimated_duration_minutes,
        });

    } catch (error: any) {
        console.error('Error saat memanggil OpenAI API:', error);
        // Tangani berbagai jenis error OpenAI jika perlu
        res.status(500).json({ error: error.message || 'Gagal menghasilkan prompt profesional dari OpenAI.' });
    }
};

// Fungsi getAiBuildStatus tidak diperlukan untuk alur ini
// server/src/controllers/aiBuilderController.ts
import { Request, Response } from 'express';
import { CohereClient } from "cohere-ai";
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// --- Inisialisasi Cohere Client ---
const COHERE_API_KEY = process.env.COHERE_API_KEY;
let cohere: CohereClient | null = null;
if (COHERE_API_KEY) {
  cohere = new CohereClient({ token: COHERE_API_KEY });
} else {
  console.error("❌ COHERE_API_KEY tidak ditemukan di .env.");
}

// --- Struktur Status Job ---
interface JobStatus {
  status: 'processing' | 'completed' | 'failed';
  professional_prompt: string;
  resultUrl?: string | null;
  error?: string;
  createdAt: number;
  updatedAt?: number;
}
const jobStatuses: { [key: string]: JobStatus } = {};

// --- Konfigurasi Nodemailer ---
const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;
const emailService = process.env.EMAIL_SERVICE?.toLowerCase();
const operatorEmail = process.env.OPERATOR_EMAIL;

let transporter: nodemailer.Transporter | null = null;

console.log("📧 Membaca konfigurasi email dari .env:");
console.log(`- EMAIL_SERVICE: ${emailService}`);
console.log(`- EMAIL_USER: ${emailUser ? '*** (ada)' : 'Tidak ada'}`);
console.log(`- EMAIL_PASS: ${emailPass ? '*** (ada)' : 'Tidak ada'}`);
console.log(`- OPERATOR_EMAIL: ${operatorEmail || 'Tidak ada'}`);

if (emailUser && emailPass && operatorEmail) {
  if (emailService === 'gmail') {
    console.log("➡️ Mengkonfigurasi transporter Gmail...");
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: emailUser, pass: emailPass },
    });
  } else {
    console.warn(`⚠️ EMAIL_SERVICE '${emailService}' tidak dikenal.`);
  }

  if (transporter) {
    transporter.verify((error) => {
      if (error) {
        console.error("❌ Verifikasi Nodemailer gagal:", error);
        transporter = null;
      } else {
        console.log("✅ Nodemailer siap mengirim email ke", operatorEmail);
      }
    });
  }
} else {
  console.warn("⚠️ Kredensial email tidak lengkap, pengiriman email dinonaktifkan.");
}

// --- Helper: Kirim Email ke Operator ---
async function sendPromptToOperator(jobId: string, prompt: string) {
  console.log(`[Email Job ${jobId}] Memulai pengiriman prompt ke operator.`);

  if (!transporter) {
    console.warn(`[Email Job ${jobId}] ❌ Transporter tidak aktif.`);
    return;
  }
  if (!operatorEmail) {
    console.warn(`[Email Job ${jobId}] ❌ OPERATOR_EMAIL tidak diatur.`);
    return;
  }

  const mailOptions = {
    from: `"B.I Booster AI" <${emailUser}>`,
    to: operatorEmail,
    subject: `[BI Booster] Prompt Siap untuk Job: ${jobId}`,
    text: `Prompt profesional untuk Job ID ${jobId}:\n\n${prompt}`,
    html: `<p>Prompt profesional untuk Job ID <b>${jobId}</b>:</p><pre>${prompt}</pre>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log(`[Email Job ${jobId}] ✅ Email terkirim: ${info.messageId}`);
  } catch (error) {
    console.error(`[Email Job ${jobId}] ❌ Gagal mengirim email:`, error);
  }
}

// --- Controller: Mulai Proses AI ---
export const startAiBuildProcess = async (req: Request, res: Response) => {
  const { raw_prompt } = req.body;
  if (!raw_prompt || typeof raw_prompt !== 'string' || !cohere) {
    return res.status(400).json({ error: 'Input tidak valid atau AI belum siap.' });
  }

  console.log('📩 Prompt diterima:', raw_prompt);

  try {
    const systemPromptInstruction = `[PERAN DAN TUJUAN]
Kamu adalah AI Builder yang akan mengubah prompt kasar menjadi brief profesional... (isi sesuai kebutuhan)`;

    console.log("🚀 Mengirim prompt ke Cohere...");
    const response = await cohere.chat({
      model: "command-r-plus-08-2024",
      preamble: systemPromptInstruction,
      message: raw_prompt,
    });

    const professional_prompt = response.text?.trim();
    if (!professional_prompt) throw new Error("Respons Cohere kosong.");

    const jobId = uuidv4();
    jobStatuses[jobId] = {
      status: 'processing',
      professional_prompt,
      createdAt: Date.now(),
    };
    console.log(`[Job ${jobId}] Status awal: processing`);

    res.status(200).json({
      professional_prompt,
      estimated_duration_minutes: 30,
      jobId,
    });

    console.log(`[Job ${jobId}] Mengirim prompt ke operator...`);
    sendPromptToOperator(jobId, professional_prompt);

  } catch (error: any) {
    console.error('❌ Error di startAiBuildProcess:', error);
    res.status(500).json({ error: error.message || 'Gagal memproses prompt awal.' });
  }
};

// --- Controller: Ambil Status Job ---
export const getAiBuildStatus = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  if (!jobId) return res.status(400).json({ error: 'Job ID diperlukan.' });

  const job = jobStatuses[jobId];
  if (!job) return res.status(404).json({ status: 'not_found' });

  console.log(`[Status Check] Job ${jobId}: ${job.status}`);
  res.status(200).json({ status: job.status, resultUrl: job.resultUrl || null, error: job.error || null });
};

// --- Controller: Tandai Job Selesai ---
export const completeAiBuildProcess = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { websiteUrl } = req.body;

  if (!jobId || !websiteUrl) {
    return res.status(400).json({ error: 'Job ID dan websiteUrl diperlukan.' });
  }

  const job = jobStatuses[jobId];
  if (!job) return res.status(404).json({ error: 'Job tidak ditemukan.' });

  job.status = 'completed';
  job.resultUrl = websiteUrl;
  job.updatedAt = Date.now();

  console.log(`[Complete] ✅ Job ${jobId} selesai dengan URL: ${websiteUrl}`);
  res.status(200).json({ success: true, message: `Job ${jobId} selesai.` });
};

// --- Controller: Tandai Job Gagal ---
export const failAiBuildProcess = async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { errorMessage } = req.body;

  if (!jobId) return res.status(400).json({ error: 'Job ID diperlukan.' });

  const job = jobStatuses[jobId];
  if (!job) return res.status(404).json({ error: 'Job tidak ditemukan.' });

  job.status = 'failed';
  job.error = errorMessage || 'Proses gagal.';
  job.resultUrl = null;
  job.updatedAt = Date.now();

  console.log(`[Fail] ❌ Job ${jobId} gagal: ${job.error}`);
  res.status(200).json({ success: true, message: `Job ${jobId} gagal.` });
};

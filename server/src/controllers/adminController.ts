// server/src/controllers/adminController.ts
import { Request, Response } from 'express';
import pool from '../config/db';

// Mengambil pesanan yang statusnya 'pending'
export const getPendingOrders = async (req: Request, res: Response) => {
    try {
        const [rows]: any[] = await pool.execute(`
            SELECT o.*, u.id as userId, u.name, u.email, u.phone, u.is_verified, u.has_paid
            FROM \`Order\` o
            JOIN User u ON o.userId = u.id
            WHERE o.status = 'pending'
            ORDER BY o.createdAt DESC
        `);
        // Perbaikan: Tambahkan tipe 'any' pada parameter 'row'
        const orders = rows.map((row: any) => ({
            ...row,
            User: {
                id: row.userId,
                name: row.name,
                email: row.email,
                phone: row.phone,
                is_verified: row.is_verified,
                has_paid: row.has_paid
            }
        }));
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil pesanan pending.' });
    }
};

// Mengambil pesanan yang sudah lunas atau terverifikasi
export const getVerifiedOrders = async (req: Request, res: Response) => {
    try {
        const [rows]: any[] = await pool.execute(`
            SELECT o.*, u.id as userId, u.name, u.email, u.phone
            FROM \`Order\` o
            JOIN User u ON o.userId = u.id
            WHERE o.status IN ('paid', 'verified')
            ORDER BY o.createdAt DESC
        `);
         // Perbaikan: Tambahkan tipe 'any' pada parameter 'row'
        const orders = rows.map((row: any) => ({
            ...row,
            User: {
                id: row.userId,
                name: row.name,
                email: row.email,
                phone: row.phone,
            }
        }));
        res.json({ orders });
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil pesanan terverifikasi.' });
    }
};

// Memverifikasi pembayaran
export const verifyPayment = async (req: Request, res: Response) => {
    const { userId, orderId } = req.body;
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        // Update status User
        await connection.execute(
            'UPDATE User SET has_paid = ?, is_verified = ? WHERE id = ?',
            [true, true, userId]
        );
        
        // Update status Order
        await connection.execute(
            'UPDATE `Order` SET status = ? WHERE id = ?',
            ['paid', orderId]
        );

        await connection.commit();
        connection.release();

        res.json({ success: true, message: 'Pembayaran berhasil diverifikasi' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal memverifikasi pembayaran.' });
    }
};

// Menyelesaikan pesanan (mengirim template)
export const completeOrder = async (req: Request, res: Response) => {
    const { orderId, templatePath } = req.body;
    try {
        await pool.execute(
            'UPDATE `Order` SET status = ?, template_path = ? WHERE id = ?',
            ['completed', templatePath, orderId]
        );
        res.json({ success: true, message: 'Template berhasil dikirim dan pesanan selesai.' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menyelesaikan pesanan.' });
    }
};
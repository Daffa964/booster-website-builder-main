// server/src/controllers/orderController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const createOrder = async (req: Request, res: Response) => {
    const { name, email, password, phone, selectedPackage, templateName, price, packageName } = req.body;

    if (!name || !email || !password || !selectedPackage || !templateName) {
        return res.status(400).json({ error: 'Data pesanan tidak lengkap.' });
    }

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        const [userRows]: any[] = await connection.execute('SELECT * FROM User WHERE email = ?', [email]);
        let userId: string;
        
        // Enkripsi password di sini, sekali saja
        const hashedPassword = await bcrypt.hash(password, 10);

        if (userRows.length > 0) {
            userId = userRows[0].id;
            // PERBAIKAN: Gunakan hashedPassword saat update
            await connection.execute(
                'UPDATE User SET name = ?, phone = ?, password = ?, accessTier = ? WHERE id = ?',
                [name, phone, hashedPassword, selectedPackage.id, userId]
            );
        } else {
            userId = uuidv4();
            // PERBAIKAN: Gunakan hashedPassword saat insert
            await connection.execute(
                'INSERT INTO User (id, name, email, phone, password, status, accessTier) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, name, email, phone, hashedPassword, 'pending', selectedPackage.id]
            );
        }

        const orderId = uuidv4();
        await connection.execute(
            'INSERT INTO `Order` (id, userId, packageName, package_id, template_name, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [orderId, userId, packageName, selectedPackage.id, templateName, price, 'pending']
        );
        
        await connection.commit();
        connection.release();

        res.status(201).json({ success: true, orderId: orderId });

    } catch (error: any) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Gagal membuat pesanan di server.' });
    }
};

export const getOrderStatus = async (req: Request, res: Response) => {
    const { orderId } = req.params; // Ambil orderId dari URL

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID tidak ditemukan.' });
    }

    try {
        const [rows]: any[] = await pool.execute('SELECT status FROM `Order` WHERE id = ?', [orderId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pesanan tidak ditemukan.' });
        }

        const order = rows[0];
        res.json({ status: order.status });

    } catch (error) {
        console.error('Error fetching order status:', error);
        res.status(500).json({ error: 'Gagal mengambil status pesanan.' });
    }
};

export const getOrdersByUserId = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID tidak ditemukan.' });
    }

    try {
        const [rows]: any[] = await pool.execute(
            'SELECT * FROM `Order` WHERE userId = ? ORDER BY createdAt DESC',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error('Error fetching orders by user ID:', error);
        res.status(500).json({ error: 'Gagal mengambil data pesanan.' });
    }
};
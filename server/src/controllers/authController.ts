import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export const register = async (req: Request, res: Response) => {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Data tidak lengkap.' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidv4();
        await pool.execute(
            'INSERT INTO User (id, name, email, phone, password, accessTier) VALUES (?, ?, ?, ?, ?, ?)',
            [id, name, email, phone, hashedPassword, 'none']
        );
        res.status(201).json({ success: true, message: 'Registrasi berhasil!' });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Email sudah terdaftar.' });
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(404).json({ error: 'Email tidak ditemukan.' });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Password salah.' });
        
        delete user.password;
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};
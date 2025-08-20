// server/src/controllers/lmsController.ts
import { Request, Response } from 'express';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

// Mengambil semua modul beserta chapter dan lesson
export const getLmsContent = async (req: Request, res: Response) => {
    try {
        const [modules]: any[] = await pool.execute(
            'SELECT * FROM modules ORDER BY order_index'
        );
        const [chapters]: any[] = await pool.execute(
            'SELECT * FROM chapters ORDER BY order_index'
        );
        const [lessons]: any[] = await pool.execute(
            'SELECT * FROM lessons ORDER BY order_index'
        );

        // Gabungkan data secara manual
        const structuredModules = modules.map((module: any) => ({
            ...module,
            chapters: chapters
                .filter((chapter: any) => chapter.module_id === module.id)
                .map((chapter: any) => ({
                    ...chapter,
                    lessons: lessons.filter((lesson: any) => lesson.chapter_id === chapter.id)
                }))
        }));

        res.json(structuredModules);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil konten LMS.' });
    }
};

// Menambah Modul baru
export const addModule = async (req: Request, res: Response) => {
    const { title, description, is_published } = req.body;
    const id = uuidv4();
    try {
        await pool.execute(
            'INSERT INTO modules (id, title, description, is_published) VALUES (?, ?, ?, ?)',
            [id, title, description, is_published]
        );
        res.status(201).json({ success: true, message: 'Modul berhasil ditambahkan.' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menambah modul.' });
    }
};

// Menambah Chapter baru
export const addChapter = async (req: Request, res: Response) => {
    const { module_id, title, description, is_published } = req.body;
    const id = uuidv4();
    try {
        await pool.execute(
            'INSERT INTO chapters (id, module_id, title, description, is_published) VALUES (?, ?, ?, ?, ?)',
            [id, module_id, title, description, is_published]
        );
        res.status(201).json({ success: true, message: 'Bab berhasil ditambahkan.' });
    } catch (error) {
        res.status(500).json({ error: 'Gagal menambah bab.' });
    }
};

// Menambah Lesson baru
export const addLesson = async (req: Request, res: Response) => {
    const { chapter_id, title, description, difficulty, content, duration_minutes, is_published, required_package, video_url, materials_url } = req.body;
    const id = uuidv4();
    try {
        await pool.execute(
            'INSERT INTO lessons (id, chapter_id, title, description, difficulty, content, duration_minutes, is_published, required_package, video_url, materials_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, chapter_id, title, description, difficulty, content, duration_minutes, is_published, JSON.stringify(required_package), video_url, materials_url]
        );
        res.status(201).json({ success: true, message: 'Materi berhasil ditambahkan.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menambah materi.' });
    }
};

// Update Lesson
export const updateLesson = async (req: Request, res: Response) => {
    const { id } = req.params;
    const fields = req.body;
    
    // Hapus field yang tidak boleh diupdate
    delete fields.id; 
    delete fields.chapter_id;

    const fieldNames = Object.keys(fields);
    const fieldValues = Object.values(fields);
    const setClause = fieldNames.map(name => `${name} = ?`).join(', ');

    try {
        await pool.execute(
            `UPDATE lessons SET ${setClause} WHERE id = ?`,
            [...fieldValues, id]
        );
        res.json({ success: true, message: 'Materi berhasil diupdate.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal mengupdate materi.' });
    }
};

export const getUserProgress = async (req: Request, res: Response) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'User ID dibutuhkan.' });
    }

    try {
        const [rows]: any[] = await pool.execute('SELECT * FROM user_progress WHERE user_id = ?', [userId]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Gagal mengambil progres pengguna.' });
    }
};
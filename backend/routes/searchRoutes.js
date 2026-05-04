const express = require('express');
const router = express.Router();
const db = require('../db');

// Advanced public search API - News, Trades, Kwiga Notes
router.get('/', async (req, res) => {
    const { q, page = 1, limit = 10 } = req.query;
    const searchTerm = q?.trim();
    
    if (!searchTerm) {
        return res.json({ results: [], total: 0 });
    }

    try {
        const offset = (page - 1) * parseInt(limit);
        
        // Search news (published)
        const [news] = await db.query(`
            SELECT id, title_rw as title, COALESCE(title_en, title_rw) as title_en,
                   LEFT(content_rw, 120) as excerpt_rw, image_url, created_at
            FROM news 
            WHERE is_published = 1 
              AND (title_rw LIKE ? OR title_en LIKE ? OR content_rw LIKE ? OR content_en LIKE ?)
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit, offset]);

        // Search kwiga notes  
        const [kwiga] = await db.query(`
            SELECT id, title as title_rw, title_en, description as excerpt_rw, 
                   image_url, created_at
            FROM kwiga_notes
            WHERE title LIKE ? OR title_en LIKE ? OR description LIKE ?
            ORDER BY created_at DESC
            LIMIT ?
        `, [`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, limit]);

        const results = [
            ...news.map(n => ({ ...n, type: 'news' })),
            ...kwiga.map(k => ({ ...k, type: 'kwiga' }))
        ].slice(0, parseInt(limit));

        res.json({
            results,
            total: results.length,
            pagination: { page: parseInt(page), limit: parseInt(limit), hasMore: results.length === parseInt(limit) }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ results: [], error: 'Search failed' });
    }
});
    try {
        const { q, type, trade, page = 1, limit = 10 } = req.query;
        const searchTerm = (q || '').trim().toLowerCase();
        if (!searchTerm) return res.json({ results: [], total: 0 });

        const offset = (page - 1) * limit;
        const conditions = [];
        const params = [];

        // Multi-table search
        let newsQuery = `
            SELECT 'news' as type, id, title_rw as title, title_en as title_en, 
                   content_rw as content, LEFT(content_rw, 150) as excerpt_rw, 
                   LEFT(content_en, 150) as excerpt_en, image_url,
                   created_at, is_published, category
            FROM news WHERE is_published = 1
        `;
        let tradesQuery = `
            SELECT 'trade' as type, id, name as title, description as content, 
                   image_url, '' as excerpt_rw, '' as excerpt_en
            FROM trades WHERE 1=1
        `;
        let kwigaQuery = `
            SELECT 'kwiga' as type, id, title as title_rw, title_en, 
                   description as content, '' as excerpt_en, image_url
            FROM kwiga_notes WHERE 1=1
        `;

        // News search
        if (searchTerm) {
            newsQuery += ` AND (LOWER(title_rw) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(content_rw) LIKE ? OR LOWER(content_en) LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        if (type === 'news') newsQuery += ' AND is_published = 1';
        newsQuery += ` ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

        // Trades search
        if (searchTerm) {
            tradesQuery += ` AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`);
        }
        tradesQuery += ` LIMIT ${limit}`;

        // Kwiga search  
        if (searchTerm) {
            kwigaQuery += ` AND (LOWER(title) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(description) LIKE ?)`;
            params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
        }
        kwigaQuery += ` LIMIT ${limit}`;

        const [news] = await db.query(newsQuery, params);
        params.length = 0; // Reset for next query
        const [trades] = await db.query(tradesQuery, params);
        params.length = 0;
        const [kwiga] = await db.query(kwigaQuery, params);

        const results = [...news, ...trades, ...kwiga];
        
        // Total count
        const [total] = await db.query(`
            SELECT COUNT(*) as total FROM (
                SELECT id FROM news WHERE is_published = 1 AND (LOWER(title_rw) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(content_rw) LIKE ? OR LOWER(content_en) LIKE ?)
                UNION 
                SELECT id FROM trades WHERE LOWER(name) LIKE ? OR LOWER(description) LIKE ?
                UNION 
                SELECT id FROM kwiga_notes WHERE LOWER(title) LIKE ? OR LOWER(title_en) LIKE ? OR LOWER(description) LIKE ?
            ) combined
        `, Array(9).fill(`%${searchTerm}%`));

        res.json({
            results,
            total: total[0].total,
            pagination: { page: parseInt(page), limit: parseInt(limit), hasMore: offset + results.length < total[0].total }
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed', results: [] });
    }
});

module.exports = router;
</xai:function_call name="edit_file">
<parameter name="path">backend/server.js

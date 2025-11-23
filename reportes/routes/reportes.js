
var express = require('express');
var router = express.Router();
const Reporte = require('../models/reporte.model');

// GET /api/reportes - Obtener todos
router.get('/', async (req, res) => {
    try {

        const { tipo } = req.query;
        const filtro = tipo ? { tipo } : {};
        const reportes = await Reporte.find(filtro).sort({ fecha: -1 });

        console.info(reportes);

        res.json(reportes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /api/reportes/:id - Obtener uno noma ps
router.get('/:id', async (req, res) => {
    try {
        const reporte = await Reporte.findById(req.params.id);
        if (!reporte) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json(reporte);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/reportes - Crear manual
router.post('/', async (req, res) => {
    try {
        const nuevoReporte = new Reporte(req.body);
        const guardado = await nuevoReporte.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /api/reportes/:id - Actualizar
router.patch('/:id', async (req, res) => {
    try {
        const actualizado = await Reporte.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!actualizado) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json(actualizado);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /api/reportes/:id - Eliminar
router.delete('/:id', async (req, res) => {
    try {
        const eliminado = await Reporte.findByIdAndDelete(req.params.id);
        if (!eliminado) return res.status(404).json({ error: 'Reporte no encontrado' });
        res.json({ message: 'Reporte eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
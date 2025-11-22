
var express = require('express');
var router = express.Router();
const SemaforoModel = require('../models/SemaforoModel');
const { semaforos } = require('../store/semaforosStore'); // Acceso al mapa en memoria
const SemaforoDomain = require('../domain/Semaforo'); // La clase con la lógica de estado

// --- CREAR SEMÁFORO (POST) ---
router.post('/', async (req, res) => {
    try {
        const { description, latitude, longitude } = req.body;

        // 1. Guardar en MongoDB
        const nuevoSemaforo = new SemaforoModel({
            description,
            position: { latitude, longitude }
        });
        const doc = await nuevoSemaforo.save();

        // 2. Agregar a la memoria (HashMap) para que el scheduler lo tome
        const id = doc._id.toString();
        const semaforoInstancia = new SemaforoDomain(id);
        semaforos.set(id, semaforoInstancia);

        console.log(`[API] Semáforo creado y cargado en memoria: ${id}`);
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ACTUALIZAR SEMÁFORO (PUT) ---
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, latitude, longitude } = req.body;

        // 1. Actualizar en MongoDB
        const doc = await SemaforoModel.findByIdAndUpdate(
            id,
            { description, position: { latitude, longitude } },
            { new: true } // Retorna el documento actualizado
        );

        if (!doc) return res.status(404).json({ error: 'Semáforo no encontrado' });

        // 2. Actualizar en memoria (si existe, reiniciamos su instancia)
        if (semaforos.has(id)) {
            // Nota: Al recrear la instancia, el estado vuelve a 'verde'.

            const semaforoInstancia = new SemaforoDomain(id);
            semaforos.set(id, semaforoInstancia);
        }

        console.log(`[API] Semáforo actualizado: ${id}`);
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ELIMINAR SEMÁFORO (DELETE) ---
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Eliminar de MongoDB
        const doc = await SemaforoModel.findByIdAndDelete(id);

        if (!doc) return res.status(404).json({ error: 'Semáforo no encontrado' });

        // 2. Eliminar de la memoria (detiene el ciclo para este semáforo)
        if (semaforos.has(id)) {
            semaforos.delete(id);
        }

        console.log(`[API] Semáforo eliminado de DB y memoria: ${id}`);
        res.json({ message: 'Eliminado correctamente', id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- LISTAR TODOS (GET) ---
router.get('/', async (req, res) => {
    try {
        const docs = await SemaforoModel.find();
        res.json(docs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
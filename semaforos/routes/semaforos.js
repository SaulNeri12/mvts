
var express = require('express');
var router = express.Router();
const SemaforoModel = require('../models/SemaforoModel');
const { semaforos } = require('../store/semaforosStore'); // Memoria
const SemaforoDomain = require('../domain/Semaforo');
const { publishStateChange } = require('../messaging/rabbit'); // Para notificar el cambio manual

// --- CREAR SEMÁFORO (POST) ---
router.post('/', async (req, res) => {
    try {
        const { description, latitude, longitude } = req.body;
        const nuevoSemaforo = new SemaforoModel({
            description,
            position: { latitude, longitude }
        });
        const doc = await nuevoSemaforo.save();

        // Cargar en memoria para el scheduler
        const id = doc._id.toString();
        semaforos.set(id, new SemaforoDomain(id));

        console.log(`[API] Semáforo creado: ${id}`);
        res.status(201).json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- ACTUALIZAR INFO ESTÁTICA (PATCH) ---
// Ruta: /api/semaforos/:id
router.patch('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, latitude, longitude } = req.body;

        // Solo actualizamos MongoDB. La memoria no cambia porque el objeto en memoria
        // solo maneja el estado (luces), no la descripción ni posición.
        const doc = await SemaforoModel.findByIdAndUpdate(
            id,
            { description, position: { latitude, longitude } },
            { new: true }
        );

        if (!doc) return res.status(404).json({ error: 'Semáforo no encontrado en BD' });

        console.log(`[API] Info estática actualizada para: ${id}`);
        res.json(doc);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- CAMBIAR ESTADO MANUALMENTE (POST) ---
// Ruta: /api/semaforos/:id/estado
router.post('/:id/estado', (req, res) => {
    try {
        const { id } = req.params;
        const { estado } = req.body; // Espera "verde", "rojo", 0, 1, etc.

        // Verificar si existe en memoria (el semáforo debe estar vivo)
        const semaforo = semaforos.get(id);
        if (!semaforo) {
            return res.status(404).json({ error: 'El semáforo no está activo en memoria.' });
        }

        // Forzar el cambio de estado
        const nuevoEstado = semaforo.forceState(estado);

        // Notificar a RabbitMQ inmediatamente (para que los otros servicios se enteren ya)
        publishStateChange(id, nuevoEstado);

        console.log(`[API-MANUAL] Semáforo ${id} forzado a: ${nuevoEstado}`);
        res.json({
            id,
            estado_anterior: "...",
            nuevo_estado: nuevoEstado,
            mensaje: "Cambio manual aplicado exitosamente"
        });

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// --- ELIMINAR SEMÁFORO (DELETE) ---
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await SemaforoModel.findByIdAndDelete(id);

        if (semaforos.has(id)) {
            semaforos.delete(id);
        }

        res.json({ message: 'Semáforo eliminado correctamente' });
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
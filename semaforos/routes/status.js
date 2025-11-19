// mvts/semaforos/routes/status.js
var express = require('express');
var router = express.Router();
const { semaforos } = require('../store/semaforosStore');

/* GET estado dinámico de todos los semáforos. */
router.get('/dynamic', function(req, res, next) {
    const statusList = [];
    
    // Iterar sobre el mapa y obtener el ID y el estado actual de cada instancia
    semaforos.forEach((semaforo, id) => {
        statusList.push({
            id: id,
            state: semaforo.getState() // Obtiene 'verde', 'amarillo' o 'rojo'
        });
    });

    res.json(statusList);
});

module.exports = router;
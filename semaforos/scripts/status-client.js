// mvts/semaforos/public/scripts/status-client.js
const API_URL = '/api/status/dynamic';
const container = document.getElementById('semaforos-status');

async function fetchAndRenderStatus() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const semaforos = await response.json();
        
        // Limpiar contenido anterior
        container.innerHTML = '<h2>Estado Dinámico de Semáforos</h2>';

        if (semaforos.length === 0) {
            container.innerHTML += '<p>No hay semáforos cargados en memoria.</p>';
            return;
        }

        const list = document.createElement('ul');
        semaforos.forEach(sem => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <span class="semaforo-id">${sem.id}</span>: 
                <span class="semaforo-state state-${sem.state}">${sem.state.toUpperCase()}</span>
            `;
            list.appendChild(listItem);
        });
        container.appendChild(list);

    } catch (error) {
        container.innerHTML = `<h2>Error al cargar datos</h2><p>${error.message}</p>`;
        console.error("Error al obtener el estado:", error);
    }
}

// Actualizar cada 3 segundos (sincronizado con el scheduler del backend)
fetchAndRenderStatus();
setInterval(fetchAndRenderStatus, 3000);
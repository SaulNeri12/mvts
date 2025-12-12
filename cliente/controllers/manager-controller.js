import ReportsClient from "../client/reports.client.js";

// Instancia del cliente
const reportsClient = new ReportsClient();

// --- Referencias al DOM ---
const btnLogout = document.getElementById('logout-button');
const dialogConfirmBtn = document.getElementById('dialog-confirm-button');
const logoutModal = document.getElementById('logout-dialog');

// Filtros y Botón de búsqueda
const searchBtn = document.getElementById('search-button');
const inputTipo = document.getElementById('tipo-mensaje');
const inputFechaInicio = document.getElementById('fecha-inicio');
const inputFechaFin = document.getElementById('fecha-fin');

// Tabla
const tableBody = document.querySelector('#reports-table tbody');

// --- Event Listeners ---

// Logout Logic
btnLogout.addEventListener('click', () => {
    logoutModal.showModal();
});

dialogConfirmBtn.addEventListener('click', () => {
    // Aquí deberías limpiar sessionStorage si lo usas
    sessionStorage.clear();
    window.location.href = 'Index.html';
});

// Search Logic
searchBtn.addEventListener('click', async (e) => {
    e.preventDefault(); // Evitar recarga si está dentro de un form
    await handleSearch();
});

// --- Funciones Principales ---

async function handleSearch() {
    // 1. Obtener valores
    const tipo = inputTipo.value;
    const inicio = inputFechaInicio.value;
    const fin = inputFechaFin.value;

    // 2. Validaciones básicas
    if (!tipo) {
        alert("Por favor selecciona un tipo de reporte.");
        return;
    }
    if (!inicio || !fin) {
        alert("Por favor selecciona ambas fechas.");
        return;
    }
    if (new Date(inicio) > new Date(fin)) {
        alert("La fecha de inicio no puede ser mayor a la fecha fin.");
        return;
    }

    // Limpiar tabla antes de buscar
    tableBody.innerHTML = '<tr><td colspan="3">Cargando datos...</td></tr>';

    try {
        let data = [];

        // 3. Llamar a la API según el tipo seleccionado
        if (tipo === 'alerta') {
            // Alerta = Congestión
            data = await reportsClient.getCongestions(inicio, fin);
        } else if (tipo === 'exito') {
            // Exito = Entregas / Viajes Completados
            data = await reportsClient.getCompletedTravels(inicio, fin);
        }

        // 4. Renderizar resultados
        renderTable(data);

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${error.message}</td></tr>`;
    }
}

/**
 * Renderiza los datos en la tabla (Sin columna Tramo)
 * @param {Array} reports Array de objetos de alerta
 */
function renderTable(reports) {
    tableBody.innerHTML = ''; // Limpiar

    if (!reports || reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">No se encontraron resultados para este rango.</td></tr>';
        return;
    }

    // Ordenar por fecha descendente (opcional, pero recomendado)
    reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    reports.forEach(report => {
        const dateObj = new Date(report.timestamp);
        
        // Formatear fecha y hora
        const dateStr = dateObj.toLocaleDateString();
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Crear fila
        const row = document.createElement('tr');
        
        // Determinar color del mensaje basado en el tipo (Visual)
        const msgColor = report.type === 'congestion' ? '#d9534f' : '#5cb85c'; // Rojo o Verde

        row.innerHTML = `
            <td>${dateStr}</td>
            <td>${timeStr}</td>
            <td style="text-align: left; padding-left: 20px;">
                <span style="color: ${msgColor}; font-weight: 500;">
                    ${report.title}
                </span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}
import ReportsClient from "../client/reports.client.js";

// Instancia del cliente
const reportsClient = new ReportsClient();

// --- Estado Global ---
let currentReports = [];

// --- Referencias al DOM ---
const btnLogout = document.getElementById('logout-button');
const dialogConfirmBtn = document.getElementById('dialog-confirm-button');
const logoutModal = document.getElementById('logout-dialog');

// Filtros y Botones
const searchBtn = document.getElementById('search-button');
const btnCsv = document.getElementById('btn-csv');
const btnXls = document.getElementById('btn-xls');

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
    sessionStorage.clear();
    window.location.href = 'Index.html';
});

// Search Logic
searchBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    await handleSearch();
});

// Export Logic
btnCsv.addEventListener('click', () => exportData('csv'));
btnXls.addEventListener('click', () => exportData('xls'));

// --- Funciones Principales ---

async function handleSearch() {
    const tipo = inputTipo.value;
    const inicio = inputFechaInicio.value;
    const fin = inputFechaFin.value;

    if (!validateInputs(tipo, inicio, fin)) return;

    tableBody.innerHTML = '<tr><td colspan="3">Cargando datos...</td></tr>';

    try {
        let data = [];

        if (tipo === 'alerta') {
            data = await reportsClient.getCongestions(inicio, fin);
        } else if (tipo === 'exito') {
            data = await reportsClient.getCompletedTravels(inicio, fin);
        }

        currentReports = data || [];
        renderTable(currentReports);

    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${error.message}</td></tr>`;
        currentReports = []; 
    }
}

function validateInputs(tipo, inicio, fin) {
    if (!tipo) {
        alert("Por favor selecciona un tipo de reporte.");
        return false;
    }
    if (!inicio || !fin) {
        alert("Por favor selecciona ambas fechas.");
        return false;
    }
    if (new Date(inicio) > new Date(fin)) {
        alert("La fecha de inicio no puede ser mayor a la fecha fin.");
        return false;
    }
    return true;
}

function renderTable(reports) {
    tableBody.innerHTML = ''; 

    if (!reports || reports.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3">No se encontraron resultados para este rango.</td></tr>';
        return;
    }

    reports.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    reports.forEach(report => {
        const { dateStr, timeStr } = formatDateTime(report.timestamp);
        const row = document.createElement('tr');
        
        const msgColor = report.type === 'congestion' ? '#d9534f' : '#5cb85c'; 

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

// --- Funciones de Exportación ---

function exportData(format) {
    if (!currentReports || currentReports.length === 0) {
        alert("No hay datos para exportar. Realiza una búsqueda primero.");
        return;
    }

    const generationDate = new Date().toISOString().split('T')[0];
    
    // CAMBIO: Formato de nombre solicitado (Espacios, mayúscula inicial, resto minúsculas)
    const fileName = `Reporte mvts ${generationDate}`;

    if (format === 'csv') {
        downloadCSV(currentReports, `${fileName}.csv`);
    } else {
        downloadXLS(currentReports, `${fileName}.xls`);
    }
}

function downloadCSV(data, filename) {
    let csvContent = "Fecha,Hora,Tipo,Mensaje\n";

    data.forEach(row => {
        const { dateStr, timeStr } = formatDateTime(row.timestamp);
        const cleanTitle = row.title ? row.title.replace(/"/g, '""') : ""; 
        
        const csvRow = [
            dateStr,
            timeStr,
            row.type,
            `"${cleanTitle}"` 
        ].join(",");
        
        csvContent += csvRow + "\r\n";
    });

    // CAMBIO: Se agrega el BOM (\uFEFF) al inicio para que Excel reconozca los acentos (UTF-8)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function downloadXLS(data, filename) {
    // CAMBIO: Se agrega estructura HTML completa con meta charset UTF-8 para acentos
    let tableContent = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
            <meta charset="utf-8" />
            </head>
        <body>
            <table border="1">
                <thead>
                    <tr>
                        <th style="background-color:#2c3e50; color:white;">Fecha</th>
                        <th style="background-color:#2c3e50; color:white;">Hora</th>
                        <th style="background-color:#2c3e50; color:white;">Tipo</th>
                        <th style="background-color:#2c3e50; color:white;">Mensaje</th>
                    </tr>
                </thead>
                <tbody>
    `;

    data.forEach(row => {
        const { dateStr, timeStr } = formatDateTime(row.timestamp);
        tableContent += `
            <tr>
                <td>${dateStr}</td>
                <td>${timeStr}</td>
                <td>${row.type}</td>
                <td>${row.title}</td>
            </tr>
        `;
    });

    tableContent += `</tbody></table></body></html>`;

    const blob = new Blob([tableContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function formatDateTime(isoString) {
    const dateObj = new Date(isoString);
    return {
        dateStr: dateObj.toLocaleDateString(),
        timeStr: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}
import LightsClient from "../client/lights.client.js";
import NotificationClient from "../client/notification.client.js";

const lightsClient = new LightsClient();
const notificationClient = new NotificationClient();

//declarations for the dialog and the button
let btnLogout = document.getElementById('logout-button'); 
let btnLightsFilters = document.getElementById('lights-filters-button');
let btnNotificationsFilters = document.getElementById('notifications-filter-button');

//Dialogs declarations
let logautModal = document.getElementById('logout-dialog');
let dialogConfirmBtn = document.getElementById('dialog-confirm-button');
let dialogLightsFilter = document.getElementById('lights-filter-dialog');
let dialogNotificationsFilter = document.getElementById('notification-filter-dialog');

let map;
let vehicleIcon;
let lightsIcon;
let vehicleMarkers = {};    
let lightsMarkers = {};

(async() => {
    initMap();
    initWebSocket();
    await initlights();
    await initNotifications();
})();

/**
 * Initialize the map using Leaflet.js
 */
function initMap() {
    map = L.map('map').setView([30.96806429872676, -110.3536511309730], 15);

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
    attribution: 'Tiles © Esri — Source: Esri, Earthstar Geographics'
    }).addTo(map);

    vehicleIcon = L.icon({
        iconUrl: '/cliente/resources/optimus-prime.png',
        iconSize: [35, 30],
        popupAnchor: [0, -20],
        //iconAnchor: [22, 94],
        //shadowUrl: 'my-icon-shadow.png',
        //shadowSize: [68, 95],
        //shadowAnchor: [22, 94]
    });

    lightsIcon = L.icon({
        iconUrl: '/cliente/resources/semaphore.png',
        iconSize: [23, 45],
        popupAnchor: [0, -20],
    });
}

/**
 * initialize socket.io connection and listen for events
 */
function initWebSocket(){   
    const socket = io('http://localhost:8080');

    socket.on('telemetry_update', (message)=> {
        handletelemetryUpdate(message);
    });

    socket.on('viaje_completado', (message)=>{
        handleTravelCompletedUpdate(message);
    });

    socket.on('lights_update', (message)=> {
        handlelightsUpdate(message);
    });
}

async function initlights(){
    try{
        const lights = await lightsClient.getAllLights();
        addLightsToTable(lights);
        addLightsToMap(lights);
    }
    catch(error){
        console.error('Error al cargar los semaforos:', error);
    }
}

function addLightsToTable(lights) {
    if (!lights) return;

    const $lightsTable = $('#lights-table');
    lights.forEach(light => {
        const row = 
        `<tr id="light-${light.code}">
            <td>${light.section}</td>
            <td>${light.code}</td>
            <td>
                <div id="light-state-${light.code}" 
                    style="width:20px; height:20px; border-radius:50%; background-color: gray">
                </div>
            </td>
            <td>
                <button class="primary-button" title="Tomar control manual">
                    Tomar control
                </button>
            </td>
        </tr>`;

        $lightsTable.append(row);
    });
}

function addLightsToMap(lights) {
    if(!lights) return;
    
    lights.forEach(light => {
        removeLightFromMap(light);
        addLightToMap(light);
    });
}

async function initNotifications(){
    try{
        const notifications = await notificationClient.getAllNotifications();
        if(!notifications) return;

        addNotificationsToTable(notifications);
    }
    catch(error){
        console.error('Error al cargar las notificaciones:', error);
    }
}

function addNotificationsToTable(notifications) {
    notifications.forEach(notification => {
        addNotificationToTable(notification)
    });
}

function handletelemetryUpdate(message){
    const vehicle = JSON.parse(message);
    removeVehicleFromMap(vehicle);
    addVehicleToMap(vehicle);
}

function removeVehicleFromMap(vehicle) {
    if (vehicleMarkers[vehicle.code]) {
        map.removeLayer(vehicleMarkers[vehicle.code]);
        delete vehicleMarkers[vehicle.code];
    }
}

function addVehicleToMap(vehicle) {
    const marker = L.marker([vehicle.latitude, vehicle.longitude], { icon: vehicleIcon })
    .bindPopup(vehicle.code)
    .addTo(map);
    vehicleMarkers[vehicle.code] = marker;
}

function handlelightsUpdate(message){
    const light = JSON.parse(message);
    updateLightState(light.id, light.estado);
}

function updateLightState(code, color) {
    const $state = $(`#light-state-${code}`);
    if ($state.length === 0) return;
    
    const colors = {
        "rojo": "#fa3d3dff",
        "amarillo": "#f5e727ff",
        "verde": "#089e08"
    }

    $state.css("background-color",  colors[color] || "gray");
}

function removeLightFromMap(light) {
    if (lightsMarkers[light.code]) {
        map.removeLayer(lightsMarkers[light.code]);
        delete lightsMarkers[light.code];
    }
}

function addLightToMap(light) {
    const marker = L.marker([light.position.latitude, light.position.longitude], { icon: lightsIcon, riseOnHover: true, riseOffset: 250 })
    .bindPopup(light.code)
    .addTo(map);
    lightsMarkers[light.code] = marker;
}

function handleTravelCompletedUpdate(message) {
    const notification = message
    addNotificationToTable(notification);
    showNotification({text: notification.title});
}

function addNotificationToTable(notification){
    const $notificationsTable = $('#notifications-table');
    const date = new Date(notification.timestamp);
    const localDate = date.toLocaleDateString();
    const localTime = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const color = {
        "viaje_completado": "green",
        "congestion": "red"
    }
    const row = `
        <tr>
            <td>${localDate}</td>
            <td>${localTime}</td>
            <td style="color: ${color[notification.type] || 'black' }">
                ${notification.title}
            </td>
        </tr>
    `
    $notificationsTable.prepend(row);
}

function showNotification(opt = {}){
    Toastify({
    text: opt.text,
    duration: 4000,
    //destination: "https://github.com/apvarun/toastify-js",
    //newWindow: true,
    close: true,
    gravity: "top", // `top` or `bottom`
    position: "right", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover
    style: {
        background: "linear-gradient(to right, #00b09b, #96c93d)",  
    }
    }).showToast();
}



//open the logaut modal
btnLogout.addEventListener('click', () => {
    logautModal.showModal();
});

/**
 * Open the lights filter dialog
 */
btnLightsFilters.addEventListener('click', () => {
    dialogLightsFilter.showModal();
});

btnNotificationsFilters.addEventListener('click', () => {
    dialogNotificationsFilter.showModal();
});

//log out the user
dialogConfirmBtn.addEventListener('click', () => {
    window.location.href = 'Index.html';
});

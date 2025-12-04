
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
let myIcon;
let layerVehicles;
let layerLights;


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


    layerVehicles = L.layerGroup().addTo(map);
    layerLights = L.layerGroup().addTo(map);

    myIcon = L.icon({
        iconUrl: '/cliente/resources/loading-truck.png',
        iconSize: [25, 20],
        popupAnchor: [0, -20],
        //iconAnchor: [22, 94],
        //shadowUrl: 'my-icon-shadow.png',
        //shadowSize: [68, 95],
        //shadowAnchor: [22, 94]
    });
}

/**
 * initialize socket.io connection and listen for events
 */
function initWebSocket(){
    const socket = io('http://localhost:8080');

    socket.on('telemetry_update', (message)=>{
        handletelemetryUpdate(message);
    });

    socket.on()('alert_update', (message)=>{
        console.log('New alert received')
    });

    socket.on('light_update', (message)=> {
        console.log('Light status updated');
    });
}

async function initlights(){

}

async function initNotifications(){

}

function handletelemetryUpdate(message){
    const telemetryData = JSON.parse(message);

    layerVehicles.clearLayers();

    let lat = telemetryData.latitude;
    let lon = telemetryData.longitude;

    L.marker([lat, lon], { icon: myIcon })
    .bindPopup(telemetryData.code)
    .addTo(layerVehicles);
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

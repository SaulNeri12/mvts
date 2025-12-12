import LightsClient from "../client/lights.client.js";
import NotificationClient from "../client/notification.client.js";
import UserClient from "../client/user.client.js";

let userClient = new UserClient();
const lightsClient = new LightsClient();
const notificationClient = new NotificationClient();
const user = JSON.parse(sessionStorage.getItem('userInfo'));
const refreshToken = sessionStorage.getItem('refreshToken');

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
let lightsIcon;
let vehicleIcon;
let lightsMarkers = {};
let vehicleMarkers = {};

(async() => {
    initMap();
    initWebSocket();
    initManualLights();
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

async function initManualLights(){
    try{
        const userManualLights = await lightsClient.getManualLights(user.id);
        if(!userManualLights || userManualLights.length === 0) return;

        const colors = {
            "gray": "gray",
            "rojo": "#fa3d3dff",
            "amarillo": "#c4b703ff",
            "verde": "#089e08"
        }

        userManualLights.forEach((light)=> {
            const state = colors[light.status];
            insertManualControllLightRow(light.code, light.section, state);
        });
    }catch(error){

    }
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

    socket.on('light_taken_update', (message)=> {
        handlelightTakenUpdate(message);
    });

    socket.on('light_freed_update', (message)=> {
        handlelightFreedUpdate(message);
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
        const disabled = (light.taken == true) ? "disabled" : "";
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
                <button id="take-controll-${light.code}" class="primary-button ${disabled}" title="Tomar control manual">
                    Tomar control
                </button>
            </td>
        </tr>`;

        $lightsTable.append(row);

        $(`#light-${light.code}`).find(`#take-controll-${light.code}`).click( async (event)=>{
            event.preventDefault();
            await handleTakeLightControll(light.code, light.section);
        });

        if(light.taken){
            $(`#take-controll-${light.code}`).addClass('disabled');
            $(`#take-controll-${light.code}`).prop('disabled', true);
        }
    });
}

function addLightsToMap(lights) {
    if(!lights) return;
    
    lights.forEach(light => {
        updateMapLights(light);
    });
}

function updateMapLights(light) {
    let code = light.code || light.id
    let estado;
    if(light.estado){
        estado = light.estado.charAt(0).toUpperCase() + light.estado.slice(1) || 'None';
    }

    const markerPopUpHTMl = `
        <div class="popup-container">
            <span class="light-popup-code ">${code}</span>
            <span class="light-popup-state ${light.estado}">
                ${estado} 
            </span>
        </div>
    `
    if(lightsMarkers[code]){
        lightsMarkers[code].setPopupContent(markerPopUpHTMl);
        return
    }

    lightsMarkers[code] = L.marker([light.position.latitude, light.position.longitude], 
        { 
            icon: lightsIcon,
            riseOnHover: true,
            riseOffset: 250
        })
    .bindPopup(markerPopUpHTMl)
    .addTo(map);
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

function updateVehicleInMap(vehicle) {
    
    const markerPopUpHTMl = `
        <div class="popup-container">
            <span class="light-popup-code ">${vehicle.code}</span>
            <span class="light-popup-state ">
            ${new Date(vehicle.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
        </div>
    `

    if (vehicleMarkers[vehicle.code]) {
        // update marker position
        return vehicleMarkers[vehicle.code]
            .setLatLng([vehicle.latitude, vehicle.longitude])
            .setPopupContent(markerPopUpHTMl);
    }

    // create marker if doesnt exist
    vehicleMarkers[vehicle.code] = L.marker(
        [vehicle.latitude, vehicle.longitude],
        { icon: vehicleIcon }
    )
    .bindPopup(markerPopUpHTMl)
    .addTo(map);
}

function updateLightState(light) {
    const $state = $(`#light-state-${light.id || light.code}`);
    if ($state.length === 0) return;
    
    const colors = {
        "rojo": "#fa3d3dff",
        "amarillo": "#c4b703ff",
        "verde": "#089e08"
    }

    $state.css("background-color",  colors[light.estado]);
}

function updateLastUpdateCounter(){
    const time = new Date().toLocaleTimeString();
    $('#last-update-time').text(time);
}

function insertManualControllLightRow(lightCode, section, state){
    const $manualLightsTable = $('#manual-lights-table');
    const manualLightRow = `
        <tr id="manual-light-row-${lightCode}">
            <td>${section}</td>
            <td>${lightCode}</td>
            <td>
                <div id="manual-light-state-${lightCode}"
                    style="background-color: ${state};"
                    class="manual-light-state"
                    data-state="${state}">
                </div>
            </td>
            <td>
                <button
                    id="change-light-${lightCode}"
                    class="primary-button"
                    title="Cambiar estado del semaforo"
                >
                Cambiar
                </button>
            </td>
                <td>
                <button
                    id="free-light-${lightCode}"
                    class="secondary-button-icon"
                    title="Liberar control manual del semaforo"
                >
                    <span class="material-symbols-outlined">lock_open_right</span>
                </button>
            </td>
        </tr>
    `
    $manualLightsTable.append(manualLightRow);

    $(`#manual-light-row-${lightCode}`).find(`#change-light-${lightCode}`).click( async ()=>{
        await handleChangeLightState(lightCode, state);
    });

    $(`#manual-light-row-${lightCode}`).find(`#free-light-${lightCode}`).click( async ()=>{
        await handleFreeManualControll(lightCode);
    });
}


// -- HANDLERS -- 

function handletelemetryUpdate(message){
    const vehicle = JSON.parse(message);
    updateVehicleInMap(vehicle);
}

function handlelightsUpdate(message){
    const light = JSON.parse(message);
    updateLightState(light);
    updateMapLights(light);
    updateLastUpdateCounter();
}

function handleTravelCompletedUpdate(notification) {
    addNotificationToTable(notification);
    showNotification({text: notification.title});
}

function handleUserLogout(){
    try{
        // Call the rest api to log out
        console.log(user.id, refreshToken);
        userClient.singleLogout(user.id, refreshToken);

        // redirect the user to the log in
        window.location.replace('Index.html');
    }
    catch(error){
        showErrorNotification(opt = {})
    }
}

function handlelightTakenUpdate(lightTaken){
    const lightCode = lightTaken.lightCode;
    $(`#take-controll-${lightCode}`).addClass('disabled');
    $(`#take-controll-${lightCode}`).prop('disabled', true);
}

function handlelightFreedUpdate(lightFreed){
    const lightCode = lightFreed.lightCode;
    $(`#take-controll-${lightCode}`).removeClass('disabled');
    $(`#take-controll-${lightCode}`).prop('disabled', false);
}

async function handleTakeLightControll(lightCode, section, state = "gray") {
    try{
        await lightsClient.takeManualLightControll(user.id, lightCode, section, state);
        insertManualControllLightRow(lightCode, section, state);
    }
    catch(error){
        showErrorNotification({text: error.message})
    }
}

async function handleFreeManualControll(lightCode) {
    try {
        await lightsClient.freeLightManualControll(user.id, lightCode);
        $(`#manual-light-row-${lightCode}`).remove();
    }
    catch(error){
        showErrorNotification({ text: error.message });
    }
}

async function handleChangeLightState(lightCode) {
    const states = {
        "gray": "verde",
        "verde": "amarillo",
        "amarillo": "rojo",
        "rojo": "verde"
    };

    const colors = {
        "rojo": "#fa3d3dff",
        "amarillo": "#c4b703ff",
        "verde": "#089e08"
    }
    
    //get the current state
    const $lightState = $(`#manual-light-state-${lightCode}`);
    const state = $lightState.data('state');

    //assing new state
    const newState = states[state];
    $lightState.data('state', newState);
    
    try{
        $(`#change-light-${lightCode}`).prop('disabled', true);

        await lightsClient.changeLightState(user.id, lightCode, newState)

        //assing the new color
        $lightState.css('background-color', colors[newState]);

        setTimeout(()=>{
            $(`#change-light-${lightCode}`).prop('disabled', false);
        }, 1000)
    }catch(error){
        showErrorNotification({ text: error.message });
    }
}

// --- NOTIFICATIONS ---
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

function showErrorNotification(opt = {}){
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
        background: "linear-gradient(to right, #ee7238ff, #e72424ff)",
    }
    }).showToast();
}



// -- DIALOGS -- 

/**
 * open the logaut modal
 */
btnLogout.addEventListener('click', () => {
    logautModal.showModal();
});

/**
 * Open the lights filter dialog
 */
btnLightsFilters.addEventListener('click', () => {
    dialogLightsFilter.showModal();
});

/**
 * 
 */
btnNotificationsFilters.addEventListener('click', () => {
    dialogNotificationsFilter.showModal();
});

/**
 * log out the user
 */
dialogConfirmBtn.addEventListener('click', () => {
    handleUserLogout();
});

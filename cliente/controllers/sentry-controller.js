
//declarations for the dialog and the button
let btnLogout = document.getElementById('logout-button');
let btnLightsFilters = document.getElementById('lights-filters-button');
let btnNotificationsFilters = document.getElementById('notifications-filter-button');

//Dialogs declarations
let logautModal = document.getElementById('logout-dialog');
let dialogConfirmBtn = document.getElementById('dialog-confirm-button');
let dialogLightsFilter = document.getElementById('lights-filter-dialog');
let dialogNotificationsFilter = document.getElementById('notification-filter-dialog');


let map = L.map('map').setView([19.4326, -99.1332], 13);

L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

L.marker([19.4326, -99.1332]).addTo(map)
    .bindPopup("Vehículo 🚜")
    .openPopup();


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

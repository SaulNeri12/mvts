//declarations for the dialog and the button
let btnLogout = document.getElementById('logout-button');
let dialogConfirmBtn = document.getElementById('dialog-confirm-button');

//Dialogs declarations
let logautModal = document.getElementById('logout-dialog');

//open the logaut modal
btnLogout.addEventListener('click', () => {
    console.log("si presione el correcto")
    logautModal.showModal();
});

//log out the user
dialogConfirmBtn.addEventListener('click', () => {
    window.location.href = 'Index.html';
});
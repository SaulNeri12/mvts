import UserClient from "../client/user.client.js";

let userClient = new UserClient();

const form = document.querySelector("form");
let eField = form.querySelector(".email");
let eInput = eField.querySelector("input");
let pField = form.querySelector(".password");
let pInput = pField.querySelector("input");
const $err = $('#loginError');

form.onsubmit = (e)=>{

  $err.text('') // hide the error text

  e.preventDefault(); //preventing from form submitting

  checkId(); //calling checkEmail function
  checkPass(); //calling checkPass function

  //if eField and pField doesn't contains error class that mean user filled details properly
  if(!eField.classList.contains("error") && !pField.classList.contains("error")){
    handleLogin(); //calling login function
  }
}

/**
 * checkEmail function
*/
function checkId(){
  if(eInput.value === ""){ //if email is empty then add error and remove valid class
    eField.classList.add("shake", "error")
    setTimeout(()=>{ //remove shake class after 500ms
      eField.classList.remove("shake");
    }, 500);
    return;
  }

  let pattern = /^[0-9]{11}$/; //pattern for ten digit number
  if(!eInput.value.match(pattern)){ // si NO coincide
    eField.classList.add("shake", "error")
    eField.classList.remove("valid");

    setTimeout(()=>{ //remove shake class after 500ms
      eField.classList.remove("shake");
    }, 500);

    let errorTxt = eField.querySelector(".error-txt");
    errorTxt.innerText = "Inserte un ID valido";
  } else {
    eField.classList.remove("error");
    eField.classList.add("valid");
  }
}

/**
  * checkPass function
  */
function checkPass() {
  if(pInput.value === ""){ //if pass is empty then add error and remove valid class
    pField.classList.add("error");
    pField.classList.remove("valid");
    setTimeout(()=>{ //remove shake class after 500ms
      pField.classList.remove("shake");
    }, 500);
  }else{ //if pass is not empty then remove error and add valid class
    pField.classList.remove("error");
    pField.classList.add("valid");
  }
}

/**
 * handleLogin the logic for user login and redirection based on role
 * @returns {void} handleLogin function
 */
async function handleLogin() {
  try {
    let email = eInput.value;
    let password = pInput.value;
    const user = await userClient.login(email, password)

    // Store tokens in localStorage
    sessionStorage.setItem("accessToken", JSON.stringify(user.tokens.access));
    sessionStorage.setItem("refreshToken", JSON.stringify(user.tokens.refresh));
    sessionStorage.setItem("userInfo", JSON.stringify(user.user));

    redirectToMainPage(user.user.rol);

  } catch (error) {
    $err.text(error.message)
    $err.show()
    console.error(error);
  }
}

function redirectToMainPage(rol) {
  if (rol === "SENTINEL") {
    window.location.replace("sentry-view.html"); // Redirect to user page
  } else {
    window.location.replace("manager-view.html"); // Redirect to manager page
  }
}

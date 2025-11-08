import { UserService } from "../Services/UserService.js";

let userService = new UserService();

const form = document.querySelector("form");
let eField = form.querySelector(".email");
let eInput = eField.querySelector("input");
let pField = form.querySelector(".password");
let pInput = pField.querySelector("input");

form.onsubmit = (e)=>{

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

  let pattern = /^[0-9]{10}$/; //pattern for ten digit number
  if(!eInput.value.match(pattern)){ // si NO coincide
    eField.classList.add("shake", "error")
    eField.classList.remove("valid");

    setTimeout(()=>{ //remove shake class after 500ms
      eField.classList.remove("shake");
    }, 500);

    let errorTxt = eField.querySelector(".error-txt");
    errorTxt.innerText = "Enter a valid ID";
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
function handleLogin() {
  try {
    let email = eInput.value;
    let password = pInput.value;

    // For debugging purposes
    console.log("Email:", email);
    console.log("Password:", password);

    userService.loginUser(email, password);
    let user = userService.getCurrentUser();
    console.log("Logged in user:", user);
    redirectToMainPage(user['role']);  

  } catch (error) {
    alert(error.message);
    console.error("Login error:", error);
  }
}

function redirectToMainPage(rol) {
  if (rol === "ADMINISTRATOR") {
    window.location.href = "ManagerView.html"; // Redirect to admin page
  } else {
    window.location.href = "SentryView.html"; // Redirect to user page
  }
}

const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

var signin_password = document.getElementById("signin_pass")
,signin_confirmpass = document.getElementById("signin_confirmpass");

function validatePassword(){
  if(signin_password.value != signin_confirmpass.value) {
    signin_confirmpass.setCustomValidity("Passwords Don't Match");
  } else {
    signin_confirmpass.setCustomValidity('');
  }
}

signin_password.onchange = validatePassword;
signin_confirmpass.onkeyup = validatePassword;


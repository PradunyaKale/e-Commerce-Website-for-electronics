document.addEventListener("DOMContentLoaded", function () {
    const passIcons = document.querySelectorAll(".pass-icon");
  
    passIcons.forEach((icon) => {
      icon.addEventListener("click", () => {
        icon.classList.toggle("fa-eye-slash");
        icon.classList.toggle("fa-eye");
  
        const passwordField = icon.parentElement.querySelector("input");
        const currentType = passwordField.getAttribute("type");
        const newType = currentType === "password" ? "text" : "password";
        passwordField.setAttribute("type", newType);
      });
    });
  });
  
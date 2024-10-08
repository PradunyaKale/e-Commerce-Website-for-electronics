document.querySelector(".fa").addEventListener("click",()=>{
    document.querySelector(".fa").classList.toggle("fa-eye-slash")
    document.querySelector(".fa").classList.toggle("fa-eye")

    let value = document.querySelector(".password").getAttribute("type");
    
    if(value==="password")
        document.querySelector(".password").setAttribute("type", "text")
    else
        document.querySelector(".password").setAttribute("type", "password")
});
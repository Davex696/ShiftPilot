const form = document.querySelector("form");

form.addEventListener("submit", function(event){
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

        if (username === "admin" && password === "admin123") {
            window.location.href = "dashboard.html"
        } 
        else if (username === "staff" && password === "staff123"){
            window.location.href = "staff.html"
        }
        else{
            errorMsg.textContent = "PLease enter  Valid credentials"
        }

})
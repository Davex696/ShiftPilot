const shifts = JSON.parse(localStorage.getItem("shifts")) || [];

function displayShifts(){
    const scheduleTable = document.getElementById("scheduleTable");
    scheduleTable.innerHTML = "";

    shifts.forEach(function(shift, index){
        const isMatch = shift.staffName.toLowerCase() === "staff";
        scheduleTable.innerHTML += `<tr class="${isMatch ? "highlighted" : ""}">
            <td>${shift.staffName}</td>
            <td>${shift.day}</td>
            <td>${shift.time}</td>
        </tr>`;

    })
} 

function logout(){
    window.location.href = "index.html";
}

displayShifts();
const Shifts = [];
const staffNameInput = document.getElementById("staffName");
const dayInput = document.getElementById("day");
const timeInput = document.getElementById("time");
const form = document.querySelector("form")
const Totalshifts = document.getElementById("totalShifts");
const Busiestday = document.getElementById("busiestDay");
const Mostscheduled = document.getElementById("mostScheduled")

form.addEventListener("submit", function(event) {
    event.preventDefault();
 
    const staffName = staffNameInput.value;
    const day = dayInput.value;
    const time = timeInput.value;

          if(staffName === "" || day === "" || time === ""){
        alert("Please fill in all fields");
        return;
    }


    console.log(staffName, day, time);

    const shift = {
    staffName,
    day,
    time 
}

Shifts.push(shift);
displayShifts();
console.log(Shifts);
updateStats();
updateChart();


staffNameInput.value = "";
dayInput.value = "";
timeInput.value = "";
});

function displayShifts(){
    const scheduleTable = document.getElementById("scheduleTable");
    scheduleTable.innerHTML = "";

    Shifts.forEach(function(shift, index){
        scheduleTable.innerHTML += `<tr>
            <td>${shift.staffName}</td>
            <td>${shift.day}</td>
            <td>${shift.time}</td>
            <td><button onclick="deleteShift(${index})">Delete</button></td>
        </tr>`

    })
}

function deleteShift(index){
    Shifts.splice(index, 1);
    displayShifts();
    updateStats()
    updateChart();
}
function updateStats(){
    let busiestDay = "";
    let maxCount = 0;
    let mostScheduled = ""
     const staffCount={};
     const dayCount = {};
    
Shifts.forEach(function(shift){
    if(dayCount[shift.day] === undefined){
        dayCount[shift.day] = 1;
    }
    else{
        dayCount[shift.day]++;
    }
})
    for (let day in dayCount){
        if (dayCount[day] > maxCount){
            maxCount = dayCount[day];
            busiestDay = day;
        }
    }

    Shifts.forEach(function(shift){
        if(staffCount[shift.staffName] === undefined){
            staffCount[shift.staffName] = 1;
        }
        else{
            staffCount[shift.staffName]++;
        }
    })
    maxCount = 0;

    for (let staffName in staffCount){
        if (staffCount[staffName] > maxCount){
            maxCount = staffCount[staffName];
            mostScheduled = staffName

        }
    }
    
Totalshifts.textContent = Shifts.length;
Busiestday.textContent = busiestDay;
Mostscheduled.textContent = mostScheduled;

}

function updateChart(){
    const chart = document.getElementById("chart")
    chart.innerHTML = ""

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


    const dayCounts = {};
    Shifts.forEach(function(shift){
        if(dayCounts[shift.day] === undefined){
            dayCounts[shift.day] = 1;
        }
        else{
            dayCounts[shift.day]++;
        }
    });

    const max = Math.max(...Object.values(dayCounts), 1);

    days.forEach(function(day){
        const count = dayCounts[day] || 0;
        const barHeight = (count / max) * 150;

        chart.innerHTML +=`
        <div class ="bar-group">
            <div class="bar-count"> ${count}</div>
            <div class="bar" style ="height: ${barHeight}px"></div>
            <div class="bar-label"> ${day.slice(0, 3)}</div>
        </div>`;

    });
}



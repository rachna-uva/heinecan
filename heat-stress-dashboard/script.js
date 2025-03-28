document.addEventListener("DOMContentLoaded", function () {
    function loadCSV() {
        fetch("data.csv")
            .then(response => response.text())
            .then(csvText => {
                let rows = csvText.trim().split("\n").slice(1); // Remove headers
                let randomRow = rows[Math.floor(Math.random() * rows.length)]; // Pick a random row
                let [temp, humidity, windSpeed, utci, heatStress, condition, mitigation] = randomRow.split(",");

                // Update Dashboard Data
                document.getElementById("temperature").innerText = `${temp} °C`;
                document.getElementById("humidity").innerText = `${humidity} %`;
                document.getElementById("wind-speed").innerText = `${windSpeed} km/h`;
                document.getElementById("utci-value").innerText = utci;
                document.getElementById("utci-description").innerText = heatStress;

                // Apply background color based on UTCI category
                let utciCard = document.querySelector(".bg-danger");
                utciCard.classList.remove("bg-success", "bg-warning", "bg-orange", "bg-danger", "bg-dark");
                
                if (heatStress.includes("No Thermal Stress")) {
                    utciCard.classList.add("bg-success");
                } else if (heatStress.includes("Moderate Thermal Stress")) {
                    utciCard.classList.add("bg-warning");
                } else if (heatStress.includes("Strong Thermal Stress")) {
                    utciCard.classList.add("bg-orange");
                } else if (heatStress.includes("Very Strong Thermal Stress")) {
                    utciCard.classList.add("bg-danger");
                } else if (heatStress.includes("Extreme Thermal Stress")) {
                    utciCard.classList.add("bg-dark");
                }

                // Update mitigation table
                let tableBody = document.getElementById("mitigation-table");
                tableBody.innerHTML = `<tr><td>${heatStress}</td><td>${mitigation}</td></tr>`;
            })
            .catch(error => console.error("Error loading CSV:", error));
    }

    loadCSV();
});

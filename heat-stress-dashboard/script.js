// Updated dashboard script using forecasted UTCI input data
function loadCSV() {
    fetch("monterrey_utci_results.csv")
        .then(response => response.text())
        .then(csvText => {
            let rows = csvText.trim().split("\n");
            let headers = rows[0].split(",");
            let dataRows = rows.slice(1).map(row => {
                const values = row.split(",");
                const rowData = {};
                headers.forEach((h, i) => rowData[h.trim()] = values[i]);
                return rowData;
            });

            // Sort by datetime and select first 7 entries (hourly forecast)
            dataRows.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            const forecastRows = dataRows.slice(0, 7);

            const now = forecastRows[0];
            document.getElementById("temperature").innerText = `${now.temp} °C`;
            document.getElementById("humidity").innerText = `${now.humidity} %`;

            const utciValue = parseFloat(now.utci);
            let utciGroup = "";
            if (utciValue <= 26) utciGroup = "1";
            else if (utciValue <= 32) utciGroup = "2";
            else if (utciValue <= 38) utciGroup = "3";
            else if (utciValue <= 46) utciGroup = "4";
            else utciGroup = "5";

            document.getElementById("utci-group").innerText = utciGroup;

            const utciCard = document.getElementById("utci-card");
            utciCard.classList.remove("bg-success", "bg-info", "bg-warning", "bg-danger");
            if (utciGroup === "1") utciCard.classList.add("bg-success");
            else if (utciGroup === "2") utciCard.classList.add("bg-info");
            else if (utciGroup === "3") utciCard.classList.add("bg-warning");
            else if (utciGroup === "4") utciCard.classList.add("bg-danger");

            document.getElementById("mitigation-table").innerHTML =
                `<tr><td>Forecasted</td><td>Stay hydrated and avoid prolonged sun exposure</td></tr>`;

            const labels = forecastRows.map(r => {
                const [date, time] = r.datetime.split(" ");
                return `${date} ${time.slice(0, 5)}`; // e.g., "2025-05-16 06:00"
            });

            const utciGroups = forecastRows.map(r => {
                const utci = parseFloat(r.utci);
                if (utci <= 26) return 1;
                if (utci <= 32) return 2;
                if (utci <= 38) return 3;
                if (utci <= 46) return 4;
                return 5;
            });

            const temps = forecastRows.map(r => parseFloat(r.temp));
            const humidities = forecastRows.map(r => parseFloat(r.humidity));

            // Heat Stress Group Chart
            const ctx = document.getElementById('utciChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Heat Stress Group',
                        data: utciGroups,
                        borderColor: 'rgba(255, 99, 132, 1)',
                        tension: 0.3,
                        borderWidth: 2,
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            min: 1,
                            max: 5,
                            ticks: { stepSize: 1 },
                            title: { display: true, text: 'Heat Stress Group' }
                        },
                        x: {
                            title: { display: true, text: 'Forecast Hour' }
                        }
                    }
                }
            });

            // Temperature and Humidity Chart
            const ctx2 = document.getElementById('tempHumidityChart').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: temps,
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.4
                        },
                        {
                            label: 'Humidity (%)',
                            data: humidities,
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: { title: { display: true, text: 'Value' } },
                        x: { title: { display: true, text: 'Forecast Hour' } }
                    }
                }
            });
        })
        .catch(error => console.error("Error loading CSV:", error));
}
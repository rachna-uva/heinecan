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

            // Sort by datetime and select first 7 entries
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
            utciCard.className = "dashboard-card text-white";
            if (utciGroup === "1") utciCard.classList.add("bg-success");
            else if (utciGroup === "2") utciCard.classList.add("bg-info");
            else if (utciGroup === "3") utciCard.classList.add("bg-warning");
            else if (utciGroup === "4") utciCard.classList.add("bg-danger");
            else utciCard.classList.add("bg-dark");


            // Add help icon
            const helpIcon = document.createElement("div");
            helpIcon.innerText = "?";
            helpIcon.title = "Explanation of UTCI goes here...";
            helpIcon.style.cssText = `
            position: absolute;
            bottom: 8px;
            right: 8px;
            background: white;
            color: black;
            border: 1px solid #ccc;
            border-radius: 50%;
            width: 22px;
            height: 22px;
            text-align: center;
            line-height: 22px;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            z-index: 10;
            `;
            utciCard.style.position = "relative";
            utciCard.appendChild(helpIcon);

            // Create a floating explanation popup (hidden by default)
            const tooltip = document.createElement("div");
            tooltip.innerText = "UTCI explanation goes here...";
            tooltip.style.cssText = `
            position: absolute;
            bottom: 40px;
            right: 10px;
            background: #fff;
            color: black;
            border: 1px solid #ccc;
            padding: 8px 10px;
            border-radius: 5px;
            font-size: 13px;
            width: 220px;
            display: none;
            box-shadow: 0 2px 6px rgba(0,0,0,0.1);
            `;
            utciCard.appendChild(tooltip);

            // Toggle tooltip on click
            helpIcon.addEventListener("click", () => {
            tooltip.style.display = (tooltip.style.display === "none") ? "block" : "none";
            });

            // Mitigations
            const mitigationMap = {
                "1": "No specific measures needed. Normal conditions.",
                "2": "Drink water regularly. Wear light clothing.",
                "3": "Limit direct sun exposure. Seek shade when possible.",
                "4": "Reduce outdoor activity. Stay hydrated and rest frequently.",
                "5": "Avoid outdoor activity. Use cooling shelters if available."
            };

            const mitigationMessage = mitigationMap[utciGroup] || "No data available";

            document.getElementById("mitigation-table").innerHTML =
                `<tr><td>Forecasted</td><td>${mitigationMessage}</td></tr>`;

            const chartlabels = forecastRows.map(r => {
                const [date, time] = r.datetime.split(" ");
                return `${date} ${time.slice(0, 5)}`;
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

            // UTCI Chart
            const ctx = document.getElementById('utciChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartlabels,
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
                    labels: chartlabels,
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

            // Switch chart
            let currentChart = 'utci';
            document.getElementById('toggle-chart').addEventListener('click', () => {
                if (currentChart === 'utci') {
                    document.getElementById('utci-chart-container').style.display = 'none';
                    document.getElementById('temp-humid-chart-container').style.display = 'block';
                    currentChart = 'temp';
                } else {
                    document.getElementById('temp-humid-chart-container').style.display = 'none';
                    document.getElementById('utci-chart-container').style.display = 'block';
                    currentChart = 'utci';
                }
            });
        })
        .catch(error => console.error("Error loading CSV:", error));
}

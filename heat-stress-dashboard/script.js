document.addEventListener("DOMContentLoaded", function () {
    function loadCSV() {
        fetch("data.csv")
            .then(response => response.text())
            .then(csvText => {
                let rows = csvText.trim().split("\n").slice(1); // Remove headers
                let randomRow = rows[Math.floor(Math.random() * rows.length)];
                let [temp, humidity, , utci, heatStress, condition, mitigation] = randomRow.split(",");

                // Update Dashboard Data
                document.getElementById("temperature").innerText = `${temp} °C`;
                document.getElementById("humidity").innerText = `${humidity} %`;

                // Determine UTCI Group
                let utciValue = parseFloat(utci);
                let utciGroup = "";
                if (utciValue <= 20) {
                    utciGroup = "1";
                } else if (utciValue <= 30) {
                    utciGroup = "2";
                } else if (utciValue <= 40) {
                    utciGroup = "3";
                } else {
                    utciGroup = "5";
                }

                document.getElementById("utci-group").innerText = utciGroup;

                // Apply background color based on UTCI category
                let utciCard = document.getElementById("utci-card");
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

                // UTCI Trend Chart with Bar + Line for Days of the Week
                const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
                let trendRows = [];
                let usedIndices = new Set();

                while (trendRows.length < 7 && usedIndices.size < rows.length) {
                    let i = Math.floor(Math.random() * rows.length);
                    if (!usedIndices.has(i)) {
                        usedIndices.add(i);
                        trendRows.push(rows[i]);
                    }
                }

                let utciValues = trendRows.map(row => parseFloat(row.split(",")[3]));

                const ctx = document.getElementById('utciChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: daysOfWeek,
                        datasets: [
                            {
                                label: 'UTCI (Bar)',
                                data: utciValues,
                                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                borderWidth: 1
                            },
                            {
                                label: 'UTCI (Line)',
                                data: utciValues,
                                type: 'line',
                                fill: false,
                                borderColor: 'rgba(255, 99, 132, 1)',
                                tension: 0.3,
                                borderWidth: 2,
                                pointRadius: 4
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: false,
                                title: {
                                    display: true,
                                    text: 'UTCI Value'
                                }
                            },
                            x: {
                                title: {
                                    display: true,
                                    text: 'Day of the Week'
                                }
                            }
                        }
                    }
                });
            })
            .catch(error => console.error("Error loading CSV:", error));
    }

    loadCSV();
});

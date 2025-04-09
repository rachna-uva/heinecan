function loadCSV() {
    fetch("data.csv")
        .then(response => response.text())
        .then(csvText => {
            let rows = csvText.trim().split("\n").slice(1);
            let randomRow = rows[Math.floor(Math.random() * rows.length)];
            let [temp, humidity, , utci, heatStress, condition, mitigation] = randomRow.split(",");

            document.getElementById("temperature").innerText = `${temp} °C`;
            document.getElementById("humidity").innerText = `${humidity} %`;

            let utciValue = parseFloat(utci);
            let utciGroup = "";
            if (utciValue <= 20) {
                utciGroup = "1";
            } else if (utciValue <= 30) {
                utciGroup = "2";
            } else if (utciValue <= 40) {
                utciGroup = "3";
            } else {
                utciGroup = "4";
            }

            document.getElementById("utci-group").innerText = utciGroup;

            let utciCard = document.getElementById("utci-card");
            utciCard.classList.remove("bg-success", "bg-info", "bg-warning", "bg-danger");

            if (utciGroup === "1") {
                utciCard.classList.add("bg-success");
            } else if (utciGroup === "2") {
                utciCard.classList.add("bg-info");
            } else if (utciGroup === "3") {
                utciCard.classList.add("bg-warning");
            } else if (utciGroup === "4") {
                utciCard.classList.add("bg-danger");
            }

            let tableBody = document.getElementById("mitigation-table");
            tableBody.innerHTML = `<tr><td>${heatStress}</td><td>${mitigation}</td></tr>`;

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

            let utciGroups = trendRows.map(row => {
                const utci = parseFloat(row.split(",")[3]);
                if (utci <= 20) return 1;
                if (utci <= 30) return 2;
                if (utci <= 40) return 3;
                return 4;
            });
            // UTCI Chart
            const ctx = document.getElementById('utciChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: daysOfWeek,
                    datasets :[
                        {
                            label: 'Heat Risk (Line)',
                            data: utciGroups,
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
                            min : 1,
                            max: 4, 
                            ticks: {
                                stepSize: 1,
                                callback : value => `${value}`
                            },
                            title: {
                                display: true,
                                text: 'Heat Risk Value'
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

            // Temp & Humidity Chart
            const ctx2 = document.getElementById('tempHumidityChart').getContext('2d');
            new Chart(ctx2, {
                type: 'line',
                data: {
                    labels: daysOfWeek,
                    datasets: [
                        {
                            label: 'Temperature (°C)',
                            data: trendRows.map(row => parseFloat(row.split(",")[0])),
                            borderColor: 'rgba(255, 99, 132, 1)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            tension: 0.4
                        },
                        {
                            label: 'Humidity (%)',
                            data: trendRows.map(row => parseFloat(row.split(",")[1])),
                            borderColor: 'rgba(54, 162, 235, 1)',
                            backgroundColor: 'rgba(54, 162, 235, 0.2)',
                            tension: 0.4
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
                                text: 'Values'
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

// Toggle Chart Button Logic
document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'toggle-chart') {
        const utciContainer = document.getElementById('utci-chart-container');
        const tempContainer = document.getElementById('temp-humid-chart-container');

        const isUTCIVisible = utciContainer.style.display !== 'none';

        utciContainer.style.display = isUTCIVisible ? 'none' : 'block';
        tempContainer.style.display = isUTCIVisible ? 'block' : 'none';

        e.target.innerText = isUTCIVisible ? 'Switch Graph':'Switch Graph';
    }
});

// Notifications logic
function initNotifications() {
    const mitigationBox = document.getElementById('mitigation-message');
    const sendBtn = document.getElementById('send-mitigation');
    const notificationList = document.getElementById('notification-list');
    const badge = document.getElementById("notif-badge");
    let currentMitigation = "";

    Papa.parse("data.csv", {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            const data = results.data;
            const randomRow = data[Math.floor(Math.random() * data.length)];
            currentMitigation = randomRow["Mitigation"] || "No mitigation found.";
            mitigationBox.textContent = currentMitigation;
        },
        error: function(err) {
            mitigationBox.classList.replace("alert-info", "alert-danger");
            mitigationBox.textContent = "Failed to load mitigation suggestion.";
            console.error("PapaParse error:", err);
        }
    });

    function displayNotification(message) {
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning';
        alert.textContent = message;
        notificationList.prepend(alert);
    }

    sendBtn.addEventListener('click', () => {
        if (currentMitigation) {
            let existing = JSON.parse(localStorage.getItem('notifications')) || [];
            existing.push(currentMitigation);
            localStorage.setItem('notifications', JSON.stringify(existing));
            displayNotification(currentMitigation);

            const count = parseInt(localStorage.getItem("notifications_sent") || "0");
            localStorage.setItem("notifications_sent", (count + 1).toString());

            // Clear notifications and hide badge
            localStorage.removeItem("notifications");
            if (badge) badge.style.display = "none";
        }
    });

    const saved = JSON.parse(localStorage.getItem('notifications')) || [];
    saved.forEach(displayNotification);
}

// Rewards logic
function initRewards() {
    const countEl = document.getElementById("notification-count");
    const rewardEl = document.getElementById("reward-badge");
    const badge = document.getElementById("notif-badge");

    const count = parseInt(localStorage.getItem("notifications_sent") || "0");
    countEl.textContent = count;

    if (count > 0 && rewardEl) {
        rewardEl.style.display = "block";
    }

    const saved = JSON.parse(localStorage.getItem('notifications')) || [];
    if (saved.length > 0 && badge) {
        badge.style.display = 'inline-block';
    }
}


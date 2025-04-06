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
                utciGroup = "5";
            }

            document.getElementById("utci-group").innerText = utciGroup;

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


    function initNotifications() {
        const mitigationBox = document.getElementById('mitigation-message');
        const sendBtn = document.getElementById('send-mitigation');
        const notificationList = document.getElementById('notification-list');
        const badge = document.getElementById("notif-badge");
        let currentMitigation = "";
    
        //Load CSV mitigation suggestion
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
    
        //Display a message in the UI
        function displayNotification(message) {
            const alert = document.createElement('div');
            alert.className = 'alert alert-warning';
            alert.textContent = message;
            notificationList.prepend(alert);
        }
    
        sendBtn.addEventListener('click', () => {
            if (currentMitigation) {
                //Save and display
                let existing = JSON.parse(localStorage.getItem('notifications')) || [];
                existing.push(currentMitigation);
                localStorage.setItem('notifications', JSON.stringify(existing));
                displayNotification(currentMitigation);
        
                //Track for rewards
                const count = parseInt(localStorage.getItem("notifications_sent") || "0");
                localStorage.setItem("notifications_sent", (count + 1).toString());
        
                //Immediately clear the saved notifications
                localStorage.removeItem('notifications');
        
                // Hide the badge after sending
                if (badge) badge.style.display = "none";
            }
        });
        
    
        // Load existing saved notifications
        const saved = JSON.parse(localStorage.getItem('notifications')) || [];
        saved.forEach(displayNotification);
    }
    

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

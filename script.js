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

            // Sort by datetime and shift
            dataRows.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
            const filteredRows = filterByShift(dataRows);
            const forecastRows = filterByShift(dataRows);
            
            const now = forecastRows[0];
            document.getElementById("temperature").innerText  = `${Math.round(now.temp)} °C`;
            document.getElementById("humidity").innerText = `${now.humidity} %`;
            const utciValue = parseFloat(now.utci);
            let utciGroup = "";
            if (utciValue <= 26) utciGroup = "1";
            else if (utciValue <= 32) utciGroup = "2";
            else if (utciValue <= 38) utciGroup = "3";
            else if (utciValue <= 46) utciGroup = "4";
            else utciGroup = "5";

            // Show both number and name
            const riskLabels = {
              1: "No Risk",
              2: "Moderate Risk",
              3: "Strong Risk",
              4: "Very Strong Risk",
              5: "Extreme Risk"
            };
            const riskLabel = riskLabels[utciGroup] || "--";

            // Set label and number separately
            document.getElementById("utci-label").innerText = riskLabel;
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

            const tableBody = document.getElementById("mitigation-table");
            if (tableBody) {
              tableBody.innerHTML = `<tr><td>Forecasted</td><td>${mitigationMessage}</td></tr>`;
            }


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
                        label: 'Heat Stress Risk',
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
                            title: { display: true, text: 'Heat Stress Risk' }
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
function initNotifications() {
  Papa.parse("monterrey_utci_with_measures.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const data = results.data;
      const table = document.getElementById('measures-table')?.getElementsByTagName('tbody')[0];
      const list = document.getElementById('notification-list');
      if (!table || !list) return;

      const now = new Date();

      // Filter to show only next 7 hours
      //const filtered = filterByShift(data);
      const filtered = filterByShift(data); // 


      // Load existing from localStorage
      const saved = JSON.parse(localStorage.getItem('notifications')) || [];

      // Display a notification
      function displayNotification(message) {
        const div = document.createElement('div');
        div.className = "alert alert-warning mt-2";
        div.innerText = message;
        div.dataset.key = message;
        list.prepend(div);
      }

      // Remove a notification from UI and storage
      function removeNotification(message) {
        const alerts = [...list.querySelectorAll('.alert')];
        alerts.forEach(alert => {
          if (alert.dataset.key === message) {
            alert.remove();
          }
        });
        const updated = saved.filter(msg => msg !== message);
        localStorage.setItem('notifications', JSON.stringify(updated));
      }

      // Restore saved
      saved.forEach(displayNotification);

      function toggleNotification(message, button) {
        const current = JSON.parse(localStorage.getItem('notifications')) || [];
        const isSent = current.includes(message);

        if (isSent) {
          removeNotification(message);
          button.classList.remove("btn-success");
          button.classList.add("btn-primary");
          button.innerText = message.split('] ')[1];
        } else {
          current.push(message);
          localStorage.setItem('notifications', JSON.stringify(current));
          displayNotification(message);
          button.classList.remove("btn-primary");
          button.classList.add("btn-success");
          button.innerText = "✔ " + message.split('] ')[1];
        }
      }

      filtered.forEach(row => {
        const datetime = row['datetime'] || '';
        const time = datetime ? new Date(datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const m1 = row['Measure 1'] || '';
        const m2 = row['Measure 2'] || '';
        const m3 = row['Measure 3'] || '';

        function makeButton(text) {
          const btn = document.createElement('button');
          btn.className = "btn btn-sm btn-primary";
          btn.textContent = text;
          const message = `[${time}] ${text}`;
          if (saved.includes(message)) {
            btn.classList.replace("btn-primary", "btn-success");
            btn.textContent = "✔ " + text;
          }
          btn.onclick = () => toggleNotification(message, btn);
          return btn;
        }

        const tr = document.createElement('tr');
        const tdTime = document.createElement('td');
        tdTime.textContent = time;

        const td1 = document.createElement('td');
        const td2 = document.createElement('td');
        const td3 = document.createElement('td');

        if (m1) td1.appendChild(makeButton(m1));
        if (m2) td2.appendChild(makeButton(m2));
        if (m3) td3.appendChild(makeButton(m3));

        tr.appendChild(tdTime);
        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        table.appendChild(tr);
      });
    }
  });
}
function filterByShift(dataRows) {
  const shift = localStorage.getItem("selectedShift");
  if (!shift) return dataRows;

  const parsedRows = dataRows.map(row => ({
    ...row,
    dt: new Date(row.datetime),
    hour: new Date(row.datetime).getHours(),
    date: row.datetime.split(" ")[0]
  }));

  if (shift === "day") {
    // Filter only 08:00–17:59
    const dayRows = parsedRows.filter(r => r.hour >= 8 && r.hour <= 18);
    const latestDate = [...new Set(dayRows.map(r => r.date))].sort().pop();
    return dayRows.filter(r => r.date === latestDate);
  }

  if (shift === "night") {
    // Get all rows with hour >= 18 or < 3
    const nightRows = parsedRows.filter(r => r.hour >= 18 || r.hour <= 3);

    // Find latest base date with at least one entry >= 18
    const baseDates = [...new Set(
      nightRows
        .filter(r => r.hour >= 18)
        .map(r => r.date)
    )].sort();
    const baseDate = baseDates[0];
    // Include from baseDate: 18–23, and nextDate: 00–02
    const nextDate = new Date(baseDate);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateStr = nextDate.toISOString().split("T")[0];

    return nightRows.filter(r =>
      (r.date === baseDate && r.hour >= 18) ||
      (r.date === nextDateStr && r.hour <= 3)
    );
  }

  return [];
}


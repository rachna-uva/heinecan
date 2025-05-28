let utciChart, tempHumidityChart;

function filterByShift(dataRows) {
  const shift = localStorage.getItem("selectedShift");
  if (!shift) return dataRows;

  const parsedRows = dataRows.map(row => {
    const dt = new Date(row.datetime);
    return {
      ...row,
      dt,
      hour: dt.getHours(),
      date: row.datetime.split(" ")[0]
    };
  });

  const groupedByDate = {};
  for (const row of parsedRows) {
    if (!groupedByDate[row.date]) groupedByDate[row.date] = [];
    groupedByDate[row.date].push(row);
  }

  const validDates = Object.entries(groupedByDate).filter(([date, rows]) => {
    const hours = rows.map(r => r.hour);
    if (shift === "day") {
      const required = [...Array(10).keys()].map(h => h + 8); // 08–17
      return required.every(hr => hours.includes(hr));
    }
    if (shift === "night") {
      const required = [18, 19, 20, 21, 22, 23, 0, 1, 2]; // 18–02
      return required.every(hr => hours.includes(hr));
    }
    return false;
  });

  if (validDates.length === 0) return [];

  const latestValidDate = validDates.map(([d]) => d).sort().pop();

  return parsedRows.filter(r => {
    if (r.date !== latestValidDate) return false;
    if (shift === "day") return r.hour >= 8 && r.hour < 18;
    if (shift === "night") return r.hour >= 18 || r.hour <= 2;
    return true;
  });
}

function loadCSV() {
  const city = localStorage.getItem("selectedCity") || "monterrey";
  const file = `${city}_utci_with_measures.csv`;

  Papa.parse(file, {
    header: true,
    download: true,
    complete: function (results) {
      try {
        const data = results.data;
        const selectedShift = localStorage.getItem("selectedShift") || "day";
        const filteredData = filterByShift(data, selectedShift);

        if (document.getElementById("temperature")) {
          updateCards(filteredData);
          drawCharts(filteredData);
        }
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }
  });
}

function updateCards(data) {
  if (!data || data.length === 0) return;

  const latest = data[0];
  const temperature = Math.round(parseFloat(latest.temp));
  const humidity = parseFloat(latest.humidity);

  document.getElementById("temperature").textContent = isNaN(temperature) ? "--" : `${temperature} °C`;
  document.getElementById("humidity").textContent = isNaN(humidity) ? "--" : `${humidity} %`;

  const riskNum = parseInt(latest["heat_risk_score"]);
  const label = getHeatStressLabel(riskNum);

  document.getElementById("utci-group").textContent = riskNum;
  document.getElementById("utci-label").textContent = `${label} Risk`;
  document.getElementById("utci-card").style.backgroundColor = getRiskColor(riskNum);
}

function getHeatStressLabel(score) {
  if (score === 1) return "None";
  if (score === 2) return "Moderate";
  if (score === 3) return "Strong";
  if (score === 4) return "Very Strong";
  if (score === 5) return "Extreme";
  return "-";
}

function getRiskColor(score) {
  switch (score) {
    case 1: return "#28a745";
    case 2: return "#ffc107";
    case 3: return "#fd7e14";
    case 4: return "#dc3545";
    case 5: return "#6c2bd9";
    default: return "#adb5bd";
  }
}

function drawCharts(data) {
  const grouped = {};
  data.forEach(d => {
    const dt = new Date(d.datetime);
    const hourKey = dt.toISOString().slice(0, 13); // hour
    if (!grouped[hourKey]) grouped[hourKey] = [];
    grouped[hourKey].push(parseFloat(d.heat_risk_score));
  });

  const labels = Object.keys(grouped).map(k => {
    const date = new Date(k + ":00:00Z");
    return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  const utciValues = Object.values(grouped).map(scores =>
    scores.reduce((a, b) => a + b, 0) / scores.length
  );

  const temps = labels.map((label, i) => parseFloat(data[i]?.temp) || null);
  const humidities = labels.map((label, i) => parseFloat(data[i]?.humidity) || null);

  if (utciChart) utciChart.destroy();
  if (tempHumidityChart) tempHumidityChart.destroy();

  const ctx1 = document.getElementById("utciChart").getContext("2d");
  utciChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Heat Stress Risk",
        data: utciValues,
        borderColor: "#e83e8c",
        backgroundColor: "rgba(232, 62, 140, 0.2)",
        fill: false,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7
      }]
    },
    options: {
      elements: {
        point: { radius: 5, hitRadius: 10, hoverRadius: 7 }
      },
      scales: {
        y: { beginAtZero: true, min: 1, max: 5 },
        x: { ticks: { maxRotation: 60, minRotation: 60 } }
      }
    }
  });

  const ctx2 = document.getElementById("tempHumidityChart").getContext("2d");
  tempHumidityChart = new Chart(ctx2, {
    type: "line",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Temperature (°C)",
          data: temps,
          borderColor: "#007bff",
          fill: false,
          yAxisID: "y1"
        },
        {
          label: "Humidity (%)",
          data: humidities,
          borderColor: "#28a745",
          fill: false,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      elements: {
        point: { radius: 4 }
      },
      scales: {
        y1: { type: "linear", position: "left", beginAtZero: true },
        y2: { type: "linear", position: "right", beginAtZero: true },
        x: { ticks: { maxRotation: 60, minRotation: 60 } }
      }
    }
  });
}

function initNotifications() {
  const city = localStorage.getItem("selectedCity") || "monterrey";
  const shift = localStorage.getItem("selectedShift") || "day";
  const file = `${city}_utci_with_measures.csv`;

  Papa.parse(file, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      const allData = results.data;
      const now = new Date();
      const table = document.getElementById('measures-table')?.getElementsByTagName('tbody')[0];
      const list = document.getElementById('notification-list');
      if (!table || !list) return;

      table.innerHTML = ""; // Clear previous rows

      // Filter upcoming data based on shift
      const upcoming = allData.filter(row => {
        const rowTime = new Date(row['datetime'].replace(" ", "T")); // Ensure proper parsing
        const hour = rowTime.getHours();
        const isFuture = rowTime >= now;

        const inDay = hour >= 8 && hour < 18;
        const inNight = hour >= 18 || hour < 3;

        if (!isFuture) return false;
        if (shift === "day") return inDay;
        if (shift === "night") return inNight;
        console.log("DEBUG ---");
        console.log("Raw:", row['datetime']);
        console.log("Parsed:", rowTime.toString());
        console.log("Hour:", hour);
        console.log("Now:", now.toString());
        console.log("isFuture:", isFuture);
        console.log("inDay:", inDay);
        console.log("inNight:", inNight);

        return false;
      }).slice(0, ); // Limit to next 7 entries

      const saved = JSON.parse(localStorage.getItem('notifications')) || [];

      function displayNotification(message) {
        const div = document.createElement('div');
        div.className = "alert alert-warning mt-2";
        div.innerText = message;
        div.dataset.key = message;
        list.prepend(div);
      }

      function removeNotification(message) {
        const alerts = [...list.querySelectorAll('.alert')];
        alerts.forEach(alert => {
          if (alert.dataset.key === message) alert.remove();
        });
        const updated = saved.filter(msg => msg !== message);
        localStorage.setItem('notifications', JSON.stringify(updated));
      }

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

      upcoming.forEach(row => {
        const rowTime = new Date(row['datetime'].replace(" ", "T"));
        const time = rowTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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





document.addEventListener("DOMContentLoaded", () => {
  const dayBtn = document.getElementById("dayShiftBtn");
  const nightBtn = document.getElementById("nightShiftBtn");
  const citySelector = document.getElementById("citySelector");
  const toggleButton = document.getElementById("toggle-chart");

  const refreshCurrentPageData = () => {
    const currentPage = document.querySelector("#sidebar a.active")?.getAttribute("data-page") || "dashboard";
    if (currentPage === "dashboard") loadCSV();
    if (currentPage === "notifications") initNotifications();
  };

  // City selector
  if (citySelector) {
    citySelector.value = localStorage.getItem("selectedCity") || "monterrey";
    citySelector.addEventListener("change", () => {
      localStorage.setItem("selectedCity", citySelector.value);
      refreshCurrentPageData();
    });
  }

  // Shift selector
  if (dayBtn && nightBtn) {
    const updateShift = (shift) => {
      localStorage.setItem("selectedShift", shift);
      dayBtn.classList.toggle("active", shift === "day");
      nightBtn.classList.toggle("active", shift === "night");
      refreshCurrentPageData();
    };

    dayBtn.addEventListener("click", () => updateShift("day"));
    nightBtn.addEventListener("click", () => updateShift("night"));

    updateShift(localStorage.getItem("selectedShift") || "day");
  }

  // Switch Graph Button
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const utciChartContainer = document.getElementById("utci-chart-container");
      const tempChartContainer = document.getElementById("temp-humid-chart-container");

      if (!utciChartContainer || !tempChartContainer) return;

      const isUTCIVisible = utciChartContainer.style.display !== "none";
      utciChartContainer.style.display = isUTCIVisible ? "none" : "block";
      tempChartContainer.style.display = isUTCIVisible ? "block" : "none";
    });
  }

  // Sidebar nav links
  document.querySelectorAll('#sidebar a[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      document.querySelectorAll('#sidebar a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      loadPage(page);
    });
  });

  // Initial page load
  loadPage("dashboard");
});

function loadPage(page) {
  fetch(`${page}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("dynamic-content").innerHTML = html;

      if (page === "dashboard") {
        loadCSV();

        // Reattach toggle button event
        const toggleButton = document.getElementById("toggle-chart");
        if (toggleButton) {
          toggleButton.addEventListener("click", () => {
            const utciChartContainer = document.getElementById("utci-chart-container");
            const tempChartContainer = document.getElementById("temp-humid-chart-container");

            if (!utciChartContainer || !tempChartContainer) return;

            const isUTCIVisible = utciChartContainer.style.display !== "none";
            utciChartContainer.style.display = isUTCIVisible ? "none" : "block";
            tempChartContainer.style.display = isUTCIVisible ? "block" : "none";
          });
        }
      }

      if (page === "notifications") initNotifications();
    });
}



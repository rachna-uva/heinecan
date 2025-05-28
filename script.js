let utciChart, tempHumidityChart;
let showingUTCIGraph = true;

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
    const dayRows = parsedRows.filter(r => r.hour >= 8 && r.hour < 18);
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



function loadCSV() {
  Papa.parse("monterrey_utci_with_measures.csv", {
    header: true,
    download: true,
    complete: function (results) {
      try {
        const data = results.data;
        const selectedShift = localStorage.getItem("selectedShift") || "day";
        const filteredData = filterByShift(data, selectedShift);

        updateCards(filteredData);
        drawCharts(filteredData);
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }
  });
  document.getElementById("toggle-chart").addEventListener("click", function () {
  showingUTCIGraph = !showingUTCIGraph;

  document.getElementById("utci-chart-container").style.display = showingUTCIGraph ? "block" : "none";
  document.getElementById("temp-humid-chart-container").style.display = showingUTCIGraph ? "none" : "block";
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
  const timeLabels = data.map(d => {
    const date = new Date(d.datetime);
    return date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false });
  });

  const utciValues = data.map(d => +d.heat_risk_score);
  const temps = data.map(d => +d.temp);
  const humidities = data.map(d => +d.humidity);

  if (utciChart) utciChart.destroy();
  if (tempHumidityChart) tempHumidityChart.destroy();

  const ctx1 = document.getElementById("utciChart").getContext("2d");
  utciChart = new Chart(ctx1, {
    type: "line",
    data: {
      labels: timeLabels,
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
      labels: timeLabels,
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
      scales: {
        y1: { type: "linear", position: "left", beginAtZero: true },
        y2: { type: "linear", position: "right", beginAtZero: true },
        x: { ticks: { maxRotation: 60, minRotation: 60 } }
      }
    }
  });
}

function initNotifications() {
  Papa.parse("monterrey_utci_with_measures.csv", {
    header: true,
    download: true,
    complete: function (results) {
      try {
        const data = results.data;
        const selectedShift = localStorage.getItem("selectedShift") || "day";
        const filtered = filterByShift(data, selectedShift);

        const table = document.getElementById("measures-table").getElementsByTagName("tbody")[0];
        table.innerHTML = "";

        filtered.forEach(row => {
          const time = new Date(row.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td>${time}</td>
            <td><button class="btn btn-primary btn-sm w-100">${row["Measure 1"]}</button></td>
            <td><button class="btn btn-primary btn-sm w-100">${row["Measure 2"]}</button></td>
            <td><button class="btn btn-primary btn-sm w-100">${row["Measure 3"]}</button></td>
          `;
          table.appendChild(tr);
        });
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("toggle-chart");
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      const utciChartContainer = document.getElementById("utci-chart-container");
      const tempChartContainer = document.getElementById("temp-humid-chart-container");
      const isUTCIVisible = utciChartContainer.style.display !== "none";
      utciChartContainer.style.display = isUTCIVisible ? "none" : "block";
      tempChartContainer.style.display = isUTCIVisible ? "block" : "none";
    });
  }

  // Shift toggle
  const dayBtn = document.getElementById("dayShiftBtn");
  const nightBtn = document.getElementById("nightShiftBtn");

  const updateShift = (shift) => {
    localStorage.setItem("selectedShift", shift);
    dayBtn.classList.toggle("active", shift === "day");
    nightBtn.classList.toggle("active", shift === "night");

    const currentPage = document.querySelector("#sidebar .nav-link.active")?.getAttribute("data-page") || "dashboard";
    loadPage(currentPage);
  };

  if (dayBtn && nightBtn) {
    dayBtn.addEventListener("click", () => updateShift("day"));
    nightBtn.addEventListener("click", () => updateShift("night"));

    const savedShift = localStorage.getItem("selectedShift") || "day";
    updateShift(savedShift);
  }

})

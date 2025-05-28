let utciChart, tempHumidityChart;
let showingUTCIGraph = true;
const translations = {
  en: {
    title: "Health and Safety Dashboard",
    heatStress: "Heat Stress",
    temperature: "Temperature",
    humidity: "Humidity",
    switchGraph: "Switch Graph",
    dashboard: "Dashboard",
    notifications: "Notifications",
    dayShift: "Day Shift",
    nightShift: "Night Shift",
    measuresToday: "Measures for Today",
    sentNotifications: "Sent Notifications",
    time: "Time",
    measure1: "Measure 1",
    measure2: "Measure 2",
    measure3: "Measure 3",
    heatStressGraph: "Heat Stress Risk",
    temperatureGraph: "Temperature (°C)",
    humidityGraph: "Humidity (%)"
  },
  es: {
    title: "Panel de Salud y Seguridad",
    heatStress: "Estrés por Calor",
    temperature: "Temperatura",
    humidity: "Humedad",
    switchGraph: "Cambiar Gráfico",
    dashboard: "Panel",
    notifications: "Notificaciones",
    dayShift: "Turno de Día",
    nightShift: "Turno de Noche",
    measuresToday: "Medidas para Hoy",
    sentNotifications: "Notificaciones Enviadas",
    time: "Hora",
    measure1: "Medida 1",
    measure2: "Medida 2",
    measure3: "Medida 3",
    heatStressGraph: "Riesgo de Estrés por Calor",
    temperatureGraph: "Temperatura (°C)",
    humidityGraph: "Humedad (%)"
  }
};
const measureTranslations = {
  "No measures required": "No se requieren medidas",
  "Drink at least 1 glass of water during this hour": "Beber al menos 1 vaso de agua durante esta hora",
  "Drink at least 2 glasses of water during this hour": "Beber al menos 2 vasos de agua durante esta hora",
  "Make use of shade": "Hacer uso de la sombra",
  "Reduce physical activity during this hour": "Reducir la actividad física durante esta hora",
  "No physical activity": "Sin actividad física",
  "Cool your body with a shower": "Enfría tu cuerpo con una ducha"
};

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });

  // Update shift buttons if they exist
  const dayBtn = document.getElementById('dayShiftBtn');
  const nightBtn = document.getElementById('nightShiftBtn');
  if (dayBtn && nightBtn) {
    dayBtn.textContent = translations[lang].dayShift;
    nightBtn.textContent = translations[lang].nightShift;
  }
}

function getSelectedShift() {
  return localStorage.getItem("selectedShift") || "day";
}

function getSelectedCity() {
  return localStorage.getItem("selectedCity") || "monterrey";
}

function filterByShift(dataRows) {
  const shift = getSelectedShift();
  if (!shift) return dataRows;

  const parsedRows = dataRows.map(row => {
    const dt = new Date(row.datetime);
    let hour = dt.getHours();
    let shiftDate = row.datetime.split(" ")[0];
    let displayHour = hour;

    if (shift === "night" && hour <= 2) {
      // Early morning → belongs to previous night shift
      const adjusted = new Date(dt);
      adjusted.setDate(adjusted.getDate() - 1);
      shiftDate = adjusted.toISOString().split("T")[0];
      displayHour += 24;
    }

    const sortKey = `${shiftDate} ${String(displayHour).padStart(2, "0")}:00`;
    return { ...row, dt, hour, shiftDate, sortKey };
  });

  // Group rows by shiftDate instead of regular date
  const groupedByShiftDate = {};
  for (const row of parsedRows) {
    if (!groupedByShiftDate[row.shiftDate]) groupedByShiftDate[row.shiftDate] = [];
    groupedByShiftDate[row.shiftDate].push(row);
  }

  // Determine if shift is "valid" (contains all expected hours)
  const validDates = Object.entries(groupedByShiftDate).filter(([_, rows]) => {
    const hours = rows.map(r => r.hour);
    const required = shift === "day"
      ? Array.from({ length: 10 }, (_, i) => i + 8) // 08–17
      : [18, 19, 20, 21, 22, 23, 0, 1, 2];          // night
    return required.every(h => hours.includes(h));
  });

  if (validDates.length === 0) return [];

  const latestValidShiftDate = validDates.map(([d]) => d).sort().pop();

  return groupedByShiftDate[latestValidShiftDate]
    .filter(r => {
      if (shift === "day") return r.hour >= 8 && r.hour < 18;
      return r.hour >= 18 || r.hour <= 2;
    })
    .sort((a, b) => a.sortKey.localeCompare(b.sortKey));
}


function loadCSV() {
  const file = `${getSelectedCity()}_utci_with_measures.csv`;

  Papa.parse(file, {
    header: true,
    download: true,
    complete: function ({ data }) {
      try {
        const filteredData = filterByShift(data);
        if (document.getElementById("temperature")) {
          updateCards(filteredData);
          drawCharts(filteredData);

          // Wait until button exists before attaching listener
          setTimeout(() => {
            attachToggleChartListener();
          }, 10);
        }
      } catch (error) {
        console.error("Error loading CSV:", error);
      }
    }
  });
}



function updateCards(data) {
  console.log("updateCards called with language:", localStorage.getItem("selectedLanguage"));

  if (!data.length) return;
  const latest = data[0];
  const temperature = Math.round(parseFloat(latest.temp));
  const humidity = parseFloat(latest.humidity);

  document.getElementById("temperature").textContent = isNaN(temperature) ? "--" : `${temperature} °C`;
  document.getElementById("humidity").textContent = isNaN(humidity) ? "--" : `${humidity} %`;

  const riskNum = parseInt(latest.heat_risk_score);
  const lang = localStorage.getItem("selectedLanguage") || "en";
  const label = getHeatStressLabel(riskNum);

  const localizedLabel = lang === "en"
    ? `${label} Risk`
    : {
        "None": "Sin Riesgo",
        "Moderate": "Riesgo Moderado",
        "Strong": "Riesgo Fuerte",
        "Very Strong": "Riesgo Muy Fuerte",
        "Extreme": "Riesgo Extremo",
        "-": "-"
      }[label] || "-";

  document.getElementById("utci-group").textContent = riskNum;
  document.getElementById("utci-label").textContent = localizedLabel;
  document.getElementById("utci-card").style.backgroundColor = getRiskColor(riskNum);
}


function getHeatStressLabel(score) {
  return ["-", "None", "Moderate", "Strong", "Very Strong", "Extreme"][score] || "-";
}

function getRiskColor(score) {
  return ["#adb5bd", "#28a745", "#ffc107", "#fd7e14", "#dc3545", "#6c2bd9"][score] || "#adb5bd";
}

function drawCharts(data) {
  const lang = localStorage.getItem("selectedLanguage") || "en";
  const t = translations[lang];

  const grouped = {};
  data.forEach(d => {
    const dt = new Date(d.datetime);
    const hourKey = dt.toISOString().slice(0, 13);
    if (!grouped[hourKey]) grouped[hourKey] = [];
    grouped[hourKey].push(parseFloat(d.heat_risk_score));
  });

  const labels = Object.keys(grouped).map(k =>
    new Date(k + ":00:00Z").toLocaleTimeString("en-GB", {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  );
  const utciValues = Object.values(grouped).map(scores =>
    scores.reduce((a, b) => a + b, 0) / scores.length
  );

  const temps = data.map(d => parseFloat(d.temp) || null);
  const humidities = data.map(d => parseFloat(d.humidity) || null);

  if (utciChart) utciChart.destroy();
  if (tempHumidityChart) tempHumidityChart.destroy();

  utciChart = new Chart(document.getElementById("utciChart").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: t.heatStressGraph,
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
        y: {
          beginAtZero: true,
          min: 1,
          max: 5
        },
        x: {
          ticks: {
            maxRotation: 60,
            minRotation: 60
          }
        }
      }
    }
  });

  tempHumidityChart = new Chart(document.getElementById("tempHumidityChart").getContext("2d"), {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: t.temperatureGraph,
          data: temps,
          borderColor: "#007bff",
          fill: false,
          yAxisID: "y1"
        },
        {
          label: t.humidityGraph,
          data: humidities,
          borderColor: "#28a745",
          fill: false,
          yAxisID: "y2"
        }
      ]
    },
    options: {
      elements: { point: { radius: 4 } },
      scales: {
        y1: {
          type: "linear",
          position: "left",
          beginAtZero: true
        },
        y2: {
          type: "linear",
          position: "right",
          beginAtZero: true
        },
        x: {
          ticks: {
            maxRotation: 60,
            minRotation: 60
          }
        }
      }
    }
  });
}

function attachToggleChartListener() {
  const toggleButton = document.getElementById("toggle-chart");
  if (!toggleButton) return;

  if (toggleButton.dataset.listenerAttached) return;

  toggleButton.addEventListener("click", () => {
    const utciChartContainer = document.getElementById("utci-chart-container");
    const tempChartContainer = document.getElementById("temp-humid-chart-container");
    if (!utciChartContainer || !tempChartContainer) return;

    const isUTCIVisible = utciChartContainer.style.display !== "none";
    utciChartContainer.style.display = isUTCIVisible ? "none" : "block";
    tempChartContainer.style.display = isUTCIVisible ? "block" : "none";
  });

  toggleButton.dataset.listenerAttached = "true"; 
}


function initNotifications() {
  const file = `${getSelectedCity()}_utci_with_measures.csv`;

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

      table.innerHTML = ""; // Clear table

      const filteredByShift = filterByShift(allData);

      const upcoming = filteredByShift.filter(row => {
        const rowTime = new Date(row.datetime);
        return rowTime.getTime() >= now.getTime(); // consistent comparison
      })
      const saved = JSON.parse(localStorage.getItem('notifications')) || [];

      function displayNotification(message) {
        if (!list.querySelector(`[data-key="${message}"]`)) {
          const div = document.createElement('div');
          div.className = "alert alert-warning mt-2";
          div.innerText = message;
          div.dataset.key = message;
          list.prepend(div);
        }
      }

      function removeNotification(message) {
        const alerts = [...list.querySelectorAll('.alert')];
        alerts.forEach(alert => {
          if (alert.dataset.key === message) alert.remove();
        });

        const updated = saved.filter(msg => msg !== message);
        localStorage.setItem('notifications', JSON.stringify(updated));
      }

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

      saved.forEach(displayNotification);

      upcoming.forEach(row => {
        const rowTime = new Date(row.datetime);
        const time = rowTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        const lang = localStorage.getItem("selectedLanguage") || "en";
        const measures = [row['Measure 1'], row['Measure 2'], row['Measure 3']].map(m => {
          if (!m) return "";
          return lang === "es" ? (measureTranslations[m] || m) : m;
        });
        const tr = document.createElement('tr');

        const tdTime = document.createElement('td');
        tdTime.textContent = time;
        tr.appendChild(tdTime);

        for (const m of measures) {
          const td = document.createElement('td');
          if (m) {
            const btn = document.createElement('button');
            btn.className = "btn btn-sm btn-primary";
            btn.textContent = m;

            const message = `[${time}] ${m}`;
            if (saved.includes(message)) {
              btn.classList.replace("btn-primary", "btn-success");
              btn.textContent = "✔ " + m;
            }

            btn.onclick = () => toggleNotification(message, btn);
            td.appendChild(btn);
          }
          tr.appendChild(td);
        }

        table.appendChild(tr);
      });
    }
  });
}

// Load initial page
function loadPage(page) {
  fetch(`${page}.html`)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("dynamic-content");
      container.innerHTML = html;

      // Wait for DOM to be updated before applying translations
      setTimeout(() => {
        const currentLang = localStorage.getItem("selectedLanguage") || "en";
        applyTranslations(currentLang); // Apply translations to newly loaded content

        if (page === "dashboard" && typeof loadCSV === 'function') {
          loadCSV();
        } else if (page === "notifications" && typeof initNotifications === 'function') {
          initNotifications();
        } else if (page === "rewards" && typeof initRewards === 'function') {
          initRewards();
        }
      }, 10); // Delay ensures DOM is fully rendered
    });
}



document.addEventListener("DOMContentLoaded", () => {
  const dayBtn = document.getElementById("dayShiftBtn");
  const nightBtn = document.getElementById("nightShiftBtn");
  const citySelector = document.getElementById("citySelector");

  const refreshCurrentPageData = () => {
    const currentPage = document.querySelector("#sidebar a.active")?.getAttribute("data-page") || "dashboard";
    if (currentPage === "dashboard"){ loadCSV();
        attachToggleChartListener();
    }
    else if (currentPage === "notifications") initNotifications();
  };

  if (citySelector) {
    citySelector.value = getSelectedCity();
    citySelector.addEventListener("change", () => {
      localStorage.setItem("selectedCity", citySelector.value);
      refreshCurrentPageData();
    });
  }

  if (dayBtn && nightBtn) {
    const updateShift = shift => {
      localStorage.setItem("selectedShift", shift);
      dayBtn.classList.toggle("active", shift === "day");
      nightBtn.classList.toggle("active", shift === "night");
      refreshCurrentPageData();
    };
    dayBtn.addEventListener("click", () => updateShift("day"));
    nightBtn.addEventListener("click", () => updateShift("night"));
    updateShift(getSelectedShift());
  }

  document.querySelectorAll('#sidebar a[data-page]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const page = link.getAttribute("data-page");
      document.querySelectorAll('#sidebar a').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
      loadPage(page);
    });
  });

  loadPage("dashboard");
});

//language change
const langTabs = document.querySelectorAll('.lang-tab');
const currentLang = localStorage.getItem('selectedLanguage') || 'en';
applyTranslations(currentLang);
langTabs.forEach(tab => {
  if (tab.dataset.lang === currentLang) tab.classList.add('active');
  else tab.classList.remove('active');
});

langTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const selectedLang = tab.dataset.lang;
    localStorage.setItem('selectedLanguage', selectedLang);
    applyTranslations(selectedLang);

    langTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const currentPage = document.querySelector('#sidebar a.active')?.getAttribute('data-page') || "dashboard";
    if (currentPage === "dashboard") loadCSV();
  });
});


let utciChart, tempHumidityChart;
let showingUTCIGraph = true;
let workerDisplayLoaded = false;
let currentPage = null;

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
    measure1: "Hydration",
    measure2: "Cooling",
    measure3: "Activity",
    heatStressGraph: "Heat Stress Risk",
    temperatureGraph: "Temperature (°C)",
    humidityGraph: "Humidity (%)",
    workerDisplay: "Worker Display",
    awareness: "Awareness",
    healthReminders: "Health Reminders",
    every30Min: "Every 30 minutes",
    every1Hour: "Every 1 hour",
    lightBreathable: "Light, breathable",
    workerDisplay: "Worker Display Dashboard",
    takeaction: "Take Action",
    legend: "Legend",
    clearWorkerDisplay: "Clear Worker Display",
    confirmNotifications: "Confirm and Send to Worker Display"
  },
  es: {
    title: "Panel de Gestió de Estrés por Calor", 
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
    measure1: "Hidratación",
    measure2: "Enfriamiento",
    measure3: "Actividad",
    heatStressGraph: "Riesgo de Estrés por Calor",
    temperatureGraph: "Temperatura (°C)",
    humidityGraph: "Humedad (%)",
    workerDisplay: "Pantalla del Trabajador",
    awareness: "Concienciación",
    understanding_heat_stress: "Comprender el Estrés Térmico en el Trabajo",
    heat_stress_description: "El estrés térmico ocurre cuando el cuerpo no puede disipar suficiente calor para mantener una temperatura central segura. Puede causar fatiga, mareos, enfermedades relacionadas con el calor y afectar negativamente la productividad y la seguridad.",
    what_is_heat_stress: "Que es el Estrés Térmico",
    heat_stress: "El estrés térmico es la respuesta del cuerpo al calor excesivo. Puede causar agotamiento físico, deshidratación e incluso condiciones potencialmente mortales como el golpe de calor. El Índice Universal del Clima Térmico (UTCI) se utiliza para evaluar este riesgo combinando la temperatura, la humedad y la velocidad del viento.",
    risk_levels: "Niveles de Riesgo Explicados",
    risk_level: "Nivel de riesgo",
    meaning: "Significado",
    no_risk: "Sin riesgo",
    no_risk_desc: "Las condiciones son seguras. No se requieren medidas especiales.",
    moderate_risk: "Riesgo moderado",
    moderate_risk_desc: "Puede haber molestias. Mantente hidratado.",
    strong_risk: "Riesgo fuerte",
    strong_risk_desc: "Toma precauciones. Usa sombra y períodos de descanso.",
    very_strong_risk: "Riesgo muy fuerte",
    very_strong_risk_desc: "Alta probabilidad de estrés térmico. Aplica todas las medidas de mitigación.",
    extreme_risk: "Riesgo extremo",
    extreme_risk_desc: "Condiciones peligrosas. Evita la actividad física. Activa el protocolo de emergencia.",
    how_to_stay_safe: "Cómo Mantenerse Seguro",
    hydration_tip: "Hidratación: Bebe una taza de agua (250 ml) cada 15 a 20 minutos. No es seguro consumir más de 6 tazas (aprox. 1.5 litros) por hora.",
    cooling_tip: "Enfriamiento: Toma descansos en áreas sombreadas o frescas, y usa ventiladores o compresas frías.",
    clothing_tip: "Ropa: Usa ropa ligera y transpirable.",
    monitoring_tip: "Monitoreo: Usa el panel de HSMD para vigilar las condiciones y seguir las pautas de mitigación.",
    common_symptoms_title: "Síntomas Comunes a Vigilar",
    condition: "Condición",
    symptoms: "Síntomas",
    severity: "Gravedad",
    treatment: "Tratamiento",
    heat_rash: "Sarpullido por calor",
    heat_rash_symptoms: "Grupos de granitos rojos o pequeñas ampollas (cuello, pecho, ingle)",
    heat_rash_severity: "Molestia leve",
    heat_rash_treatment: "Mantén el área afectada seca y fresca; usa lociones secantes suaves y limpia la piel para evitar infecciones; evita la ropa ajustada",
    heat_cramps: "Calambres por calor",
    heat_cramps_symptoms: "Espasmos musculares dolorosos (piernas, brazos, abdomen), a menudo tras sudoración excesiva",
    heat_cramps_severity: "Moderado",
    heat_cramps_treatment: "Descansa en un área fresca, bebe agua o bebida isotónica, estira suavemente los músculos afectados",
    heat_exhaustion: "Agotamiento por calor",
    heat_exhaustion_symptoms: "Sudoración intensa, mareos, fatiga, náuseas, piel húmeda, pulso rápido",
    heat_exhaustion_severity: "Grave – requiere descanso e hidratación",
    heat_exhaustion_treatment: "Muévete a un área con sombra o aire acondicionado, hidrátate con bebidas frías, aplica toallas húmedas, descansa hasta recuperarte por completo o vete a casa",
    heat_stroke: "Golpe de calor",
    heat_stroke_symptoms: "Confusión, inconsciencia, piel caliente y seca, convulsiones, temperatura corporal > 40 °C",
    heat_stroke_severity: "Emergencia médica – se requiere respuesta inmediata",
    heat_stroke_treatment: "Llama a emergencias, traslada a un lugar fresco, quita la ropa, usa ventiladores o agua con hielo para enfriar rápidamente",
    emergency_text: "Los trabajadores que experimenten síntomas deben detener el trabajo de inmediato y notificar a un supervisor. Un retraso en la respuesta puede agravar rápidamente los síntomas.",
    select_shift:"Selecciona Turno",
    site_location: "Ubicación de Trabajo",
    healthReminders: "Recordatorios de Salud",
    every30Min: "Cada 30 minutos",
    every1Hour: "Cada 1 hora",
    lightBreathable: "Ligera, transpirable",
    sentNotifications: "Notificaciones Enviadas",
    workerDisplay: "Pantalla del Trabajador",
    takeaction: "Tomar Medidas",
    legend: "Leyenda",
    measure1: "Hidratación",
    measure2: "Enfriamiento",
    measure3: "Actividad",
    clearWorkerDisplay: "Limpiar Pantalla del Trabajador",
    confirmNotifications: "Confirmar y enviar a la pantalla del trabajador"
  }
};
const measureTranslations = {
  en: {
    "No measures required": "No measures required",
    "Drink at least 1 glass of water during this hour": "Drink at least 1 glass of water during this hour",
    "Drink at least 2 glasses of water during this hour": "Drink at least 2 glasses of water during this hour",
    "Make use of shade": "Make use of shade",
    "Reduce physical activity during this hour": "Reduce physical activity during this hour",
    "No physical activity": "No physical activity",
    "Cool your body with a shower": "Cool your body with a shower"
  },
  es: {
    "No measures required": "No se requieren medidas",
    "Drink at least 1 glass of water during this hour": "Beber al menos 1 vaso de agua durante esta hora",
    "Drink at least 2 glasses of water during this hour": "Beber al menos 2 vasos de agua durante esta hora",
    "Make use of shade": "Hacer uso de la sombra",
    "Reduce physical activity during this hour": "Reducir la actividad física durante esta hora",
    "No physical activity": "Sin actividad física",
    "Cool your body with a shower": "Enfría tu cuerpo con una ducha"
  }
};


function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
    el.innerHTML = translations[lang][key];
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
    let dt;
    let originalFormat = "iso"; // default
    if (row.datetime.includes('/')) {
      originalFormat = "local"; // Monterrey
      const [datePart, timePart] = row.datetime.split(' ');
      const [day, month, year] = datePart.split('/');
      dt = new Date(`${year}-${month}-${day}T${timePart}`);
    } else {
      dt = new Date(row.datetime.replace(" ", "T"));
    }

    let hour = dt.getHours();
    let shiftDate;

    if (shift === "night" && hour <= 2) {
      const adjusted = new Date(dt);
      adjusted.setDate(adjusted.getDate() - 1);
      if (originalFormat === "local") {
        const d = String(adjusted.getDate()).padStart(2, '0');
        const m = String(adjusted.getMonth() + 1).padStart(2, '0');
        const y = adjusted.getFullYear();
        shiftDate = `${d}/${m}/${y}`;
      } else {
        shiftDate = adjusted.toISOString().split("T")[0];
      }
    } else {
      shiftDate = row.datetime.split(" ")[0]; // use original format
    }

    let displayHour = hour;
    if (shift === "night" && hour <= 2) {
      displayHour += 24; 
    }

    const sortKey = `${shiftDate} ${String(displayHour).padStart(2, "0")}:00`;
    return { ...row, dt, hour, shiftDate, sortKey };
  });

  // Group by shiftDate
  const groupedByShiftDate = {};
  for (const row of parsedRows) {
    if (!groupedByShiftDate[row.shiftDate]) groupedByShiftDate[row.shiftDate] = [];
    groupedByShiftDate[row.shiftDate].push(row);
  }

  // Identify valid shift dates
  const validDates = Object.entries(groupedByShiftDate).filter(([_, rows]) => {
    const hours = rows.map(r => r.hour);
    const required = shift === "day"
      ? Array.from({ length: 10 }, (_, i) => i + 8)  // 08 to 17
      : [18, 19, 20, 21, 22, 23, 0, 1, 2];           // 18 to 02 (next day)
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
        if (window.location.pathname.includes("worker_display.html")) {
          updateWorkerDisplay(filteredData);
        }
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
  const card = document.getElementById("utci-card");


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
  console.log("heat_risk_score raw:", latest.heat_risk_score);

}


function getHeatStressLabel(score) {
  return ["-", "None", "Moderate", "Strong", "Very Strong", "Extreme"][score] || "-";
}

function getRiskColor(score) {
  const colors = {
    1: "#28a745", 
    2: "#ffc107", 
    3: "#fd7e14", 
    4: "#dc3545", 
    5: "#f5c6cb" 
  };
  const index = parseInt(score);
  console.log("getRiskColor(): parsed index =", index, "→ color =", colors[index]);
  return colors[index] || "#adb5bd";
}


function drawCharts(data) {
  const lang = localStorage.getItem("selectedLanguage") || "en";
  const t = translations[lang];

  const grouped = {};
  data.forEach(d => {
    let dt;
    if (d.datetime.includes('/')) {
      // Format: DD/MM/YYYY HH:mm
      const [datePart, timePart] = d.datetime.split(' ');
      const [day, month, year] = datePart.split('/');
      dt = new Date(`${year}-${month}-${day}T${timePart}`);
    } else {
      // Format: YYYY-MM-DD HH:mm:ss
      dt = new Date(d.datetime.replace(" ", "T"));
    }
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
          max: 5.2,
          ticks: {
            stepSize: 1,
            callback: function(value) {
              return [1, 2, 3, 4, 5].includes(value) ? value : '';
            }
          }
        },
        x: {
            offset: true,
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
  const city = getSelectedCity();
  const shift = getSelectedShift();
  const file = `${city}_utci_with_measures.csv`;
  const notifKey = `notifications_${city}_${shift}`;

  Papa.parse(file, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {
      console.log("First data row:", results.data[0]);
      console.log("All loaded rows:", results.data.length); 

      const allData = results.data;
      const now = new Date();

      const table = document.getElementById('measures-table')?.getElementsByTagName('tbody')[0];
      const list = document.getElementById('notification-list');
      if (!table || !list) return;

      table.innerHTML = ""; // Clear table

      const filteredByShift = filterByShift(results.data);
      console.log("Filtered rows for selected shift:", filteredByShift.length);

      const upcoming = filteredByShift; 

      const saved = JSON.parse(localStorage.getItem(notifKey)) || [];

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
        localStorage.setItem(notifKey, JSON.stringify(updated));
      }

      function toggleNotification(message, button) {
        const isSent = tempNotifications.includes(message);

        if (isSent) {
          tempNotifications = tempNotifications.filter(msg => msg !== message);
          button.classList.remove("btn-success");
          button.classList.add("btn-primary");
          button.innerText = message.split('] ')[1];
        } else {
          tempNotifications.push(message);
          button.classList.remove("btn-primary");
          button.classList.add("btn-success");
          button.innerText = "✔ " + message.split('] ')[1];
        }

        localStorage.setItem(tempKey, JSON.stringify(tempNotifications));
      }

      saved.forEach(displayNotification);

      upcoming.forEach(row => {
        console.log("Rendering row:", row);
        let rowTime;
        if (row.datetime.includes('/')) {
          const [datePart, timePart] = row.datetime.split(' ');
          const [day, month, year] = datePart.split('/');
          rowTime = new Date(`${year}-${month}-${day}T${timePart}`);
        } else {
          rowTime = new Date(row.datetime.replace(" ", "T"));
        }

        const time = rowTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false });

        const lang = localStorage.getItem("selectedLanguage") || "en";
        const measures = [row['Measure 1'], row['Measure 2'], row['Measure 3']].map(m => {
          if (!m) return "";
          return measureTranslations[lang]?.[m] || m;
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
      const tempKey = `temp_notifications_${city}_${shift}`;
      let tempNotifications = JSON.parse(localStorage.getItem(tempKey)) || [];

      document.getElementById("confirmNotificationsBtn")?.addEventListener("click", () => {
        if (!tempNotifications.length) {
          alert("No notifications selected to confirm.");
          return;
        }

        // Save the confirmed notifications
        localStorage.setItem(notifKey, JSON.stringify(tempNotifications));

        // Clear the Sent Notifications section
        list.innerHTML = "";

        // Re-render the new confirmed notifications
        tempNotifications.forEach(message => {
          const div = document.createElement('div');
          div.className = "alert alert-warning mt-2";
          div.innerText = message;
          div.dataset.key = message;
          list.prepend(div);
        });

        alert("Notifications confirmed and sent to Worker Display.");
      });

      const clearBtn = document.getElementById("clearWorkerDisplayBtn");
      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          const confirmClear = confirm("Are you sure you want to clear all actions from the worker display?");
          if (!confirmClear) return;

          localStorage.removeItem(notifKey);
          list.innerHTML = "";

          const buttons = document.querySelectorAll("#measures-table button.btn-success");
          buttons.forEach(btn => {
            btn.classList.remove("btn-success");
            btn.classList.add("btn-primary");
            const originalText = btn.textContent.replace("✔ ", "");
            btn.textContent = originalText;
          });

          if (typeof loadWorkerDisplay === "function") {
            loadWorkerDisplay();
          }
        });
      }
    }
  });
}




// Load initial page

function loadPage(page) {
  const lang = localStorage.getItem("selectedLanguage") || "en";
  fetch(`${page}_${lang}.html`)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById("dynamic-content");
      if (!container) {
        console.warn("'#dynamic-content' not found. Skipping page load.");
        return;
      }

      container.innerHTML = html;
      if (page !== "worker_display") {
      workerDisplayLoaded = false;
      }


      // Wait for DOM to be updated before applying logic
      setTimeout(() => {
        const currentLang = localStorage.getItem("selectedLanguage") || "en";
        applyTranslations(currentLang); 
        if (page === "dashboard" && typeof loadCSV === 'function') {
          loadCSV();
        } else if (page === "notifications" && typeof initNotifications === 'function') {
          initNotifications();      
        } else if (page === "worker_display" && typeof loadWorkerDisplay === 'function') {
        if (!workerDisplayLoaded) {
          loadWorkerDisplay();
        } else {
          console.log("🔁 Skipping redundant worker_display reload.");
        }
      }else if (page === "awareness") {
          applyTranslations(currentLang);
        }
      }, 10); // Slight delay ensures DOM is painted
    })
    .catch(err => {
      console.error(`Failed to load ${page}.html:`, err);
    });
}


document.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("selectedCity")) {
  localStorage.setItem("selectedCity", "monterrey");
  }
  const dayBtn = document.getElementById("dayShiftBtn");
  const nightBtn = document.getElementById("nightShiftBtn");
  const citySelector = document.getElementById("citySelector");

  const refreshCurrentPageData = () => {
    const currentPage = document.querySelector("#sidebar a.active")?.getAttribute("data-page") || "dashboard";
    
    if (currentPage === "dashboard") {
      loadCSV();
      attachToggleChartListener();
    } else if (currentPage === "notifications") {
      initNotifications();
    } else if (currentPage === "worker_display") {
      loadWorkerDisplay(); 
    }
  };


  if (citySelector) {
    citySelector.value = getSelectedCity();
    citySelector.addEventListener("change", () => {
      localStorage.setItem("selectedCity", citySelector.value);

      const currentPage = document.querySelector('#sidebar a.active')?.getAttribute("data-page") || "dashboard";

      if (currentPage === "dashboard") {
        loadCSV(); // refresh charts
        attachToggleChartListener(); // ensure toggle still works
      } else if (currentPage === "notifications") {
        initNotifications(); // refresh measure table
      } else if (currentPage === "worker_display") {
        loadWorkerDisplay();      
      } else if (currentPage === "awareness") {
        // call update logic for this page
      }
    const lang = localStorage.getItem("selectedLanguage") || "en";
    applyTranslations(lang);
    });


  }


  if (dayBtn && nightBtn) {
    const updateShift = shift => {
      localStorage.setItem("selectedShift", shift);
      dayBtn.classList.toggle("active", shift === "day");
      nightBtn.classList.toggle("active", shift === "night");
      refreshCurrentPageData();  // ✅ This line triggers the update
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
    loadPage(currentPage);
    if (currentPage === "dashboard"){ 
      loadCSV();
    } else if (currentPage === "notifications") {
      initNotifications();
    } else if (currentPage === "awareness") {
      applyTranslations(selectedLang);
    } else if (currentPage === "worker_display") {
      loadWorkerDisplay(); 
    }

  });
});
//worker
function getHeatStressIcon(score) {
  return {
    1: "✅",
    2: "🌤️",
    3: "☀️",
    4: "🔥",
    5: "⚠️"
  }[score] ;
}

function getRiskColor(score) {
  return {
    1: "#28a745", // Green
    2: "#ffc107", // Yellow
    3: "#fd7e14", // Orange
    4: "#dc3545", // Red
    5: "#b21f1f"  // Dark red
  }[score] || "#adb5bd";
}

function getHeatRiskLabel(score, lang) {
  const labels = {
    en: {
      1: "No Risk",
      2: "Moderate Risk",
      3: "Strong Risk",
      4: "Very Strong Risk",
      5: "Extreme Risk"
    },
    es: {
      1: "Sin Riesgo",
      2: "Riesgo Moderado",
      3: "Riesgo Fuerte",
      4: "Riesgo Muy Fuerte",
      5: "Riesgo Extremo"
    }
  };
  return labels[lang]?.[score] || "-";
}

function loadWorkerDisplay() {
  const city = getSelectedCity();
  const shift = getSelectedShift();
  const file = `${city}_utci_with_measures.csv`;
  const notifKey = `notifications_${city}_${shift}`;

  Papa.parse(file, {
    header: true,
    download: true,
    complete: function ({ data }) {
      try {
        const filteredData = filterByShift(data);
        if (!filteredData.length) {
          console.warn("No valid data for selected shift.");
          return;
        }

        const latest = filteredData[0];
        const score = parseInt(latest["heat_risk_score"]);
        const lang = localStorage.getItem("selectedLanguage") || "en";

        const color = getRiskColor(score);
        const label = getHeatStressLabel(score);
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

        const utciCard = document.getElementById("utci-card");
        const utciLabel = document.getElementById("utci-label");
        const utciGroup = document.getElementById("utci-group");

        if (utciCard && utciLabel && utciGroup) {
          utciLabel.textContent = localizedLabel;
          utciGroup.textContent = score;
          utciCard.style.backgroundColor = color;
        } else {
          console.warn("UTCI elements missing in DOM.");
        }

        // Show saved notifications for current city+shift
        const notifListEl = document.getElementById("notification-list");
        if (notifListEl) {
          notifListEl.innerHTML = "";
          const ul = document.getElementById("notification-list");
          ul.innerHTML = "";

          const notifications = JSON.parse(localStorage.getItem(notifKey)) || [];

          for (const message of notifications) {
            const li = document.createElement("li");
            li.style.listStyle = "none";
            li.style.marginBottom = "12px";

            const div = document.createElement("div");
            div.className = "notification-card";
            div.textContent = message.replace(/^\[(\d{2}:\d{2})\]\s*/, '$1 ');

            const msg = message.toLowerCase();

            if (msg.includes("water") || msg.includes("beber")) {
              div.style.backgroundColor = "rgba(125, 210, 218, 0.4)"; // Hydration
            } else if (msg.includes("shade") || msg.includes("sombra") || msg.includes("ducha")) {
              div.style.backgroundColor = "rgba(159, 230, 108, 0.4)"; // Cooling
            } else if (msg.includes("activity") || msg.includes("actividad física")) {
              div.style.backgroundColor = "rgba(232, 157, 95, 0.4)"; // Activity
            }

            li.appendChild(div);
            ul.appendChild(li);
          }
        }
      } catch (err) {
        console.error("Error in loadWorkerDisplay():", err);
      }
    }
  });
}



if (window.location.pathname.includes("worker_display.html")) {
  loadCSV();
}



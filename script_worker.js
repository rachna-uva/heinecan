function loadWorkerDisplay() {
  const defaultCity = "monterrey";

  // Set default city if not present
  if (!localStorage.getItem("selectedCity")) {
    localStorage.setItem("selectedCity", defaultCity);
  }

  const city = localStorage.getItem("selectedCity");
  const lang = localStorage.getItem("selectedLanguage") || "en";
  const csvFile = `${city}_utci_with_measures.csv`;

  Papa.parse(csvFile, {
    download: true,
    header: true,
    complete: function (results) {
      const rows = results.data.filter(row => row.datetime?.trim());
      if (!rows.length) {
        console.warn("⚠️ No valid data found in CSV.");
        return;
      }

      const latest = rows[rows.length - 1];
      const score = parseInt(latest["heat_risk_score"] || latest["Heat_Risk_Score"]);
      const label = getHeatStressLabel(score);

      const translated = lang === "en"
        ? label
        : {
            "None": "Sin Riesgo",
            "Moderate": "Riesgo Moderado",
            "Strong": "Riesgo Fuerte",
            "Very Strong": "Riesgo Muy Fuerte",
            "Extreme": "Riesgo Extremo"
          }[label] || "-";

      const colorMap = {
        "None": "#d4edda",
        "Moderate": "#fff3cd",
        "Strong": "#ffe8a1",
        "Very Strong": "#f8d7da",
        "Extreme": "#f5c6cb"
      };

      const iconMap = {
        "None": "✅",
        "Moderate": "🌤️",
        "Strong": "☀️",
        "Very Strong": "🔥",
        "Extreme": "⚠️"
      };

      const icon = iconMap[label] || "🌡️";
      const color = colorMap[label] || "#f0f0f0";

      // Update DOM
      document.getElementById("utci-label").textContent = translated;
      document.getElementById("heat-icon").textContent = icon;
      document.getElementById("heat-card").style.backgroundColor = color;
    },
    error: function (err) {
      console.error("❌ Failed to load CSV:", err);
    }
  });
}

// Map heat score to label
function getHeatStressLabel(score) {
  return ["-", "None", "Moderate", "Strong", "Very Strong", "Extreme"][score] || "-";
}

// When DOM is ready, load everything
document.addEventListener("DOMContentLoaded", () => {
  loadWorkerDisplay();

  // ✅ Also reuse initNotifications from script.js
  if (typeof initNotifications === 'function') {
    initNotifications();
  } else {
    console.warn("initNotifications is not defined. Make sure script.js is loaded first.");
  }
});


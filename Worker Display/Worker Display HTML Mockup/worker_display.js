function loadWorkerDisplay() {
  Papa.parse("heat_risk_database.csv", {
    download: true,
    header: true,
    complete: function (results) {
      const data = results.data;

      const latestRisk = getLatestRiskLevel(); // Temporary static risk level
      const row = data.find(r => r["Heat_Risk_Score"] === latestRisk.toString());

      if (!row) {
        document.getElementById("reminders-list").innerHTML = `
          <li class='list-group-item text-danger'>
            ❌ No data found for risk level ${latestRisk}.
          </li>
        `;
        console.error("No matching row found for Heat_Risk_Score:", latestRisk);
        console.table(data); // Show the CSV content
        return;
      }


      const labelEl = document.getElementById("heat-label");
      const iconEl = document.getElementById("heat-icon");
      const cardEl = document.querySelector(".heat-card");

      // Update icon and label
      labelEl.textContent = getRiskLabel(latestRisk);
      iconEl.textContent = getRiskIcon(latestRisk);

      // Apply color coding using CSS classes
      cardEl.classList.remove("risk-low", "risk-moderate", "risk-high", "risk-extreme");

      if (latestRisk === 3) cardEl.classList.add("risk-moderate");
      else if (latestRisk === 4) cardEl.classList.add("risk-high");
      else if (latestRisk === 5) cardEl.classList.add("risk-extreme");
      else cardEl.classList.add("risk-low");


      // Update reminders list
      const list = document.getElementById("reminders-list");
      list.innerHTML = "";

      for (let i = 1; i <= 5; i++) {
        const measure = row[`Measure ${i}`];
        if (measure && measure.trim()) {
          const li = document.createElement("li");
          li.className = "list-group-item";
          li.textContent = measure;
          list.appendChild(li);
        }
      }
    }
  });
}

function getLatestRiskLevel() {
  // 🔧 TEMPORARY: replace with dynamic logic later
  return 3; // Moderate
}

function getRiskLabel(score) {
  return ["Low", "Low", "Moderate", "High", "Extreme"][score - 1] || "Unknown";
}

function getRiskIcon(score) {
  return ["✅", "💧", "🌤️", "🌞", "⚠️"][score - 1] || "❓";
}

window.addEventListener("DOMContentLoaded", loadWorkerDisplay);

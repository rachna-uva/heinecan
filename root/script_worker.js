const fs = require('fs');
const path = require('path');

// Read the CSV file
const csvFile = path.join(__dirname, 'monterrey_utci_results.csv');
const csvText = fs.readFileSync(csvFile, 'utf8');

// Parse CSV manually
const rows = csvText.trim().split("\n");
const headers = rows[0].split(",");
const data = rows.slice(1).map(row => {
    const values = row.split(",");
    const obj = {};
    headers.forEach((h, i) => obj[h.trim()] = values[i]);
    return obj;
});

// Convert datetime, sort descending, and get latest row
data.forEach(r => r.datetime = new Date(r.datetime));
data.sort((a, b) => b.datetime - a.datetime);
const latest = data[0];

const utci = parseFloat(latest.utci);
let utciGroup = 1;
if (utci <= 26) utciGroup = 1;
else if (utci <= 32) utciGroup = 2;
else if (utci <= 38) utciGroup = 3;
else if (utci <= 46) utciGroup = 4;
else utciGroup = 5;

const riskLabels = {
  1: "No Risk",
  2: "Moderate Risk",
  3: "Strong Risk",
  4: "Very Strong Risk",
  5: "Extreme Risk"
};
const riskLabel = riskLabels[utciGroup] || "--";

const content = `utciGroup,riskLabel\n${utciGroup},${riskLabel}`;
fs.writeFileSync(path.join(__dirname, 'current_risk.csv'), content);
console.log(`✔️ current_risk.csv updated with utciGroup=${utciGroup} and riskLabel="${riskLabel}"`);

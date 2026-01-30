const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
const container = document.getElementById("container");

// ==========================
// COLLECT GDTC
// ==========================
let gdtcByDay = {};
weekdays.forEach(d => gdtcByDay[d] = new Set());

Object.entries(data).forEach(([cls, sch]) => {
  Object.entries(sch).forEach(([day, sessions]) => {
    if (!gdtcByDay[day]) return;

    Object.values(sessions).forEach(arr => {
      arr.forEach(item => {
        if (item.mon && item.mon.toUpperCase().includes("GDTC")) {
          gdtcByDay[day].add(cls);
        }
      });
    });
  });
});

// ==========================
// DESKTOP TABLE
// ==========================
const maxRows = Math.max(
  ...weekdays.map(d => gdtcByDay[d].size)
);

let tableHTML = `<div class="table-wrapper"><table>
<thead><tr>`;
weekdays.forEach(d => tableHTML += `<th>${d}</th>`);
tableHTML += `</tr></thead><tbody>`;

for (let i = 0; i < maxRows; i++) {
  tableHTML += `<tr>`;
  weekdays.forEach(day => {
    const list = [...gdtcByDay[day]].sort();
    tableHTML += `<td>`;
    if (list[i]) {
      tableHTML += `<span class="class">${list[i]}</span>`;
    } else {
      tableHTML += `<span class="empty">–</span>`;
    }
    tableHTML += `</td>`;
  });
  tableHTML += `</tr>`;
}

tableHTML += `</tbody></table></div>`;

// ==========================
// MOBILE CARDS
// ==========================
let mobileHTML = `<div class="mobile">`;

weekdays.forEach(day => {
  const list = [...gdtcByDay[day]].sort();
  mobileHTML += `
    <div class="day-card">
      <div class="day-title">${day}</div>
      <div class="day-classes">
        ${list.length
      ? list.map(c => `<span class="class">${c}</span>`).join("")
      : `<span class="empty">Không có GDTC</span>`
    }
      </div>
    </div>
  `;
});

mobileHTML += `</div>`;

// ==========================
// RENDER
// ==========================
container.innerHTML = tableHTML + mobileHTML;

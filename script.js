// ==========================
//  DATA & CONSTANTS
// ==========================
let schedules = {};
let teachers = new Set();
const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

// ==========================
//  MAIN ENTRY
// ==========================
loadSchedule().then(() => {
  handleQuery();  // Trang hoạt động hoàn toàn dựa vào query
});

// ==========================
//  LOAD DATA
// ==========================
async function loadSchedule() {
  try {
    // Nếu muốn dùng BE thì thay dòng dưới bằng fetch
    schedules = data;
    parseTeachers();
  } catch (err) {
    console.error("Lỗi tải dữ liệu:", err);
  }
}

// ==========================
//  PARSE TEACHERS
// ==========================
function parseTeachers() {
  Object.keys(schedules).forEach(cls => {
    const days = schedules[cls];
    Object.keys(days).forEach(day => {
      const sessions = days[day];
      Object.keys(sessions).forEach(sess => {
        sessions[sess].forEach(item => {
          if (item.gv && item.gv.trim()) teachers.add(item.gv.trim());
        });
      });
    });
  });
}

// ==========================
//  QUERY HANDLER
// ==========================
function handleQuery() {
  const params = new URLSearchParams(window.location.search);
  const teacherParam = params.get("teacher");
  const classParam = params.get("class");

  if (teacherParam) {
    enterViewOnlyMode();
    renderTeacherDirect(teacherParam);
    return;
  }

  if (classParam) {
    enterViewOnlyMode();
    renderClassDirect(classParam);
    return;
  }

  // Không có query → ẩn toàn bộ UI
  hideAllUI();
}

// ==========================
//  VIEW-ONLY MODE
// ==========================
function enterViewOnlyMode() {
  hide(".tabs");
  hide("#teacherSelect");
  hide("#classSelect");
}

// Ẩn toàn bộ giao diện nếu không có query
function hideAllUI() {
  hide(".tabs");
  hide("#teacherSelect");
  hide("#classSelect");
  hide("#teacherResult");
  hide("#classResult");
}

// Hàm hide tiện dụng
function hide(selector) {
  const el = document.querySelector(selector);
  if (el) el.style.display = "none";
}

// ==========================
//  RENDER CLASS (direct)
// ==========================
function renderClassDirect(className) {
  const result = document.getElementById("classResult");
  result.style.display = "block";

  if (!schedules[className]) {
    result.innerHTML = `<p>Không tìm thấy lớp "${className}".</p>`;
    return;
  }

  const sch = schedules[className];

  // Tìm số tiết cao nhất
  let maxTiet = 0;
  weekdays.forEach(day => {
    if (sch[day]) {
      Object.values(sch[day]).forEach(arr => {
        arr.forEach(item => {
          const t = parseInt(item.tiet, 10);
          if (t > maxTiet) maxTiet = t;
        });
      });
    }
  });

  let html = `<h3>Thời khoá biểu lớp ${className}</h3>`;
  html += `<table><thead><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  for (let t = 1; t <= maxTiet; t++) {
    const rowClass = t === 5 ? "afternoon" : "";
    html += `<tr class="${rowClass}"><td>${t}</td>`;

    weekdays.forEach(day => {
      let cell = "";
      if (sch[day]) {
        Object.values(sch[day]).forEach(arr => {
          const found = arr.find(x => Number(x.tiet) === t);
          if (found) cell = found.gv ? `${found.mon} (${found.gv})` : found.mon;
        });
      }
      html += `<td>${cell}</td>`;
    });

    html += `</tr>`;
  }

  html += `</tbody></table>`;
  result.innerHTML = html;
}

// ==========================
//  RENDER TEACHER (direct)
// ==========================
function renderTeacherDirect(teacherName) {
  const result = document.getElementById("teacherResult");
  result.style.display = "block";

  let teacherSchedule = {};
  let maxTiet = 0;
  let subjects = new Set();

  Object.keys(schedules).forEach(cls => {
    const sch = schedules[cls];

    Object.keys(sch).forEach(day => {
      Object.keys(sch[day]).forEach(sess => {
        sch[day][sess].forEach(item => {

          if (item.gv && item.gv.toLowerCase() === teacherName.toLowerCase()) {
            if (!teacherSchedule[day]) teacherSchedule[day] = {};
            if (!teacherSchedule[day][sess]) teacherSchedule[day][sess] = [];

            teacherSchedule[day][sess].push({
              tiet: item.tiet,
              mon: item.mon,
              cls
            });

            const t = parseInt(item.tiet, 10);
            if (t > maxTiet) maxTiet = t;

            if (item.mon && item.mon !== "HĐTN 2") subjects.add(item.mon);
          }

        });
      });
    });
  });

  if (Object.keys(teacherSchedule).length === 0) {
    result.innerHTML = `<p>Không tìm thấy giáo viên "${teacherName}".</p>`;
    return;
  }

  const subjectCount = subjects.size;

  let html = `<h3>Thời khoá biểu ${teacherName}</h3>`;
  html += `<table><thead><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  for (let t = 1; t <= maxTiet; t++) {
    const rowClass = t === 5 ? "afternoon" : "";
    html += `<tr class="${rowClass}"><td>${t}</td>`;

    weekdays.forEach(day => {
      let cell = "";

      if (teacherSchedule[day]) {
        Object.values(teacherSchedule[day]).forEach(arr => {
          const found = arr.find(x => Number(x.tiet) === t);
          if (found) {
            if (found.mon === "HĐTN 2") {
              cell = `${found.cls}`;
            } else if (subjectCount === 1) {
              cell = `${found.cls}`;
            } else {
              cell = `${found.cls} (${found.mon})`;
            }
          }
        });
      }

      html += `<td>${cell}</td>`;
    });

    html += `</tr>`;
  }

  html += `</tbody></table>`;
  result.innerHTML = html;
}

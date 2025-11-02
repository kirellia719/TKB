let schedules = {};   // JSON từ BE
let teachers = new Set();
const BE_URL = `https://tkb-be.vercel.app`

// --- Tabs ---
document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.target).classList.add('active');
  });
});

// --- Lấy dữ liệu từ BE ---
async function loadSchedule() {
  try {
    // const res = await fetch(`${BE_URL}/schedule`);
    // const data = await res.json();
    schedules = data;

    // Lấy danh sách lớp
    const classes = Object.keys(schedules);

    // Lấy danh sách giáo viên (loại trùng)
    classes.forEach(cls => {
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

    // Dropdown lớp
    const selClass = document.getElementById("classSelect");
    selClass.innerHTML = classes.map(c => `<option value="${c}">${c}</option>`).join("");
    selClass.addEventListener("change", showScheduleByClass);
    if (classes.length > 0) showScheduleByClass();

    // Dropdown giáo viên (sắp xếp alphabet)
    const selTeacher = document.getElementById("teacherSelect");
    const arrTeachers = Array.from(teachers).sort((a, b) =>
      a.localeCompare(b, "vi", { sensitivity: "base" })
    );
    selTeacher.innerHTML = arrTeachers.map(t => `<option value="${t}">${t}</option>`).join("");
    selTeacher.addEventListener("change", showScheduleByTeacher);
    if (arrTeachers.length > 0) showScheduleByTeacher();

  } catch (err) {
    console.error("Không tải được dữ liệu", err);
  }
}

// --- Hiển thị theo lớp ---
function showScheduleByClass() {
  const cls = document.getElementById("classSelect").value;
  const result = document.getElementById("classResult");
  if (!cls || !schedules[cls]) {
    result.innerHTML = "<p>Chưa có dữ liệu cho lớp này.</p>";
    return;
  }

  const sch = schedules[cls];
  const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];

  // Tìm số tiết lớn nhất
  let maxTiet = 0;
  weekdays.forEach(day => {
    if (sch[day]) {
      Object.keys(sch[day]).forEach(sess => {
        sch[day][sess].forEach(item => {
          const t = parseInt(item.tiet, 10);
          if (!isNaN(t) && t > maxTiet) maxTiet = t;
        });
      });
    }
  });

  let html = `<h3>Thời khoá biểu lớp ${cls}</h3>`;
  html += `<table><thead><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  for (let t = 1; t <= maxTiet; t++) {
    const rowClass = (t === 5) ? "afternoon" : "";
    html += `<tr class="${rowClass}"><td>${t}</td>`;
    weekdays.forEach(day => {
      let cell = "";
      if (sch[day]) {
        Object.keys(sch[day]).forEach(sess => {
          const found = sch[day][sess].find(x => x.tiet == t);
          // if (found) cell = found.gv ? `${found.mon} (${found.gv})` : found.mon;
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

// --- Hiển thị theo giáo viên ---
function showScheduleByTeacher() {
  const teacher = document.getElementById("teacherSelect").value;
  const result = document.getElementById("teacherResult");
  if (!teacher) {
    result.innerHTML = "<p>Chưa có dữ liệu cho giáo viên này.</p>";
    return;
  }

  let teacherSchedule = {};
  const classes = Object.keys(schedules);
  let maxTiet = 0;
  let subjects = new Set();

  // Gom thời khoá biểu của GV
  classes.forEach(cls => {
    const sch = schedules[cls];
    Object.keys(sch).forEach(day => {
      Object.keys(sch[day]).forEach(sess => {
        sch[day][sess].forEach(item => {
          if (item.gv === teacher) {
            if (!teacherSchedule[day]) teacherSchedule[day] = {};
            if (!teacherSchedule[day][sess]) teacherSchedule[day][sess] = [];
            teacherSchedule[day][sess].push({ tiet: item.tiet, mon: item.mon, cls });

            const t = parseInt(item.tiet, 10);
            if (!isNaN(t) && t > maxTiet) maxTiet = t;

            // Lưu môn (trừ HĐTN 2)
            if (item.mon && item.mon !== "HĐTN 2") {
              subjects.add(item.mon);
            }
          }
        });
      });
    });
  });

  // Xem GV có bao nhiêu môn (không tính HĐTN 2)
  const subjectCount = subjects.size;

  const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
  let html = `<h3>Thời khoá biểu của GV ${teacher}</h3>`;
  html += `<table><thead><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr></thead><tbody>`;

  for (let t = 1; t <= maxTiet; t++) {
    const rowClass = (t === 5) ? "afternoon" : "";
    html += `<tr class="${rowClass}"><td>${t}</td>`;
    weekdays.forEach(day => {
      let cell = "";
      if (teacherSchedule[day]) {
        Object.keys(teacherSchedule[day]).forEach(sess => {
          const found = teacherSchedule[day][sess].find(x => x.tiet == t);
          if (found) {
            if (found.mon === "HĐTN 2") {
              cell = `${found.cls}`; // chỉ hiển thị lớp
            } else if (subjectCount === 1) {
              cell = `${found.cls}`; // chỉ hiển thị lớp
            } else {
              cell = `${found.cls} (${found.mon})`; // lớp + môn
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

// --- Xử lý query string ---
function checkQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const teacherParam = params.get("teacher");

  if (teacherParam) {
    // Chuyển sang tab "Theo giáo viên"
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
    document.querySelector('[data-target="teacherTab"]').classList.add("active");
    document.getElementById("teacherTab").classList.add("active");

    // Chờ dữ liệu load xong rồi mới chọn giáo viên
    const checkInterval = setInterval(() => {
      const selTeacher = document.getElementById("teacherSelect");
      if (selTeacher.options.length > 0) {
        clearInterval(checkInterval);

        // Tìm đúng tên giáo viên (so sánh không phân biệt hoa thường)
        const found = Array.from(selTeacher.options).find(
          opt => opt.value.toLowerCase() === teacherParam.toLowerCase()
        );

        if (found) {
          selTeacher.value = found.value;
          showScheduleByTeacher();
        } else {
          document.getElementById("teacherResult").innerHTML =
            `<p>Không tìm thấy giáo viên "${teacherParam}".</p>`;
        }
      }
    }, 200);
  }
}

// Gọi sau khi tải xong dữ liệu
loadSchedule().then(checkQueryParams);

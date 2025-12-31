const weekdays = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6"];
const schedulesView = data;

const classSelect = document.getElementById("classSelect");
const teacherSelect = document.getElementById("teacherSelect");
const viewResult = document.getElementById("viewResult");

function initViewModule() {
  const teachers = new Set();

  Object.values(schedulesView).forEach(cls =>
    Object.values(cls).forEach(day =>
      Object.values(day).forEach(arr =>
        arr.forEach(i => i.gv && teachers.add(i.gv))
      )
    )
  );

  classSelect.innerHTML = Object.keys(schedulesView)
    .map(c => `<option>${c}</option>`).join("");

  teacherSelect.innerHTML = [...teachers]
    .sort((a, b) => a.localeCompare(b, "vi", { sensitivity: "base" }))
    .map(t => `<option>${t}</option>`).join("");

  renderClass(classSelect.value);
}

document.querySelectorAll(".tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    if (tab.dataset.tab === "class") {
      classSelect.classList.remove("hidden");
      teacherSelect.classList.add("hidden");
      renderClass(classSelect.value);
    } else {
      teacherSelect.classList.remove("hidden");
      classSelect.classList.add("hidden");
      renderTeacher(teacherSelect.value);
    }
  };
});

classSelect.onchange = () => renderClass(classSelect.value);
teacherSelect.onchange = () => renderTeacher(teacherSelect.value);

function renderClass(cls) {
  let html = `<table><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr>`;

  for (let t = 1; t <= 8; t++) {
    html += `<tr class="${t === 5 ? 'afternoon' : ''}"><td>${t}</td>`;
    weekdays.forEach(day => {
      let cell = "";
      Object.values(schedulesView[cls][day] || {}).forEach(arr => {
        const f = arr.find(x => x.tiet == t);
        if (f) cell = `${f.mon}${f.gv ? ` (${f.gv})` : ""}`;
      });
      html += `<td>${cell}</td>`;
    });
    html += `</tr>`;
  }
  html += `</table>`;
  viewResult.innerHTML = html;
}

function renderTeacher(gv) {
  // 1. Thu thập các môn giáo viên này dạy
  const subjectSet = new Set();

  Object.values(schedulesView).forEach(cls => {
    Object.values(cls).forEach(day => {
      Object.values(day).forEach(arr => {
        arr.forEach(i => {
          if (i.gv === gv && i.mon) subjectSet.add(i.mon);
        });
      });
    });
  });

  const onlyOneSubject = subjectSet.size === 1;

  // 2. Render bảng
  let html = `<table><tr><th>Tiết</th>`;
  weekdays.forEach(d => html += `<th>${d}</th>`);
  html += `</tr>`;

  for (let t = 1; t <= 8; t++) {
    html += `<tr class="${t === 5 ? 'afternoon' : ''}"><td>${t}</td>`;

    weekdays.forEach(day => {
      let cell = "";

      Object.entries(schedulesView).forEach(([cls, sch]) => {
        Object.values(sch[day] || {}).forEach(arr => {
          const f = arr.find(x => x.gv === gv && x.tiet == t);
          if (f) {
            cell = onlyOneSubject
              ? `${cls}`
              : `${cls} (${f.mon})`;
          }
        });
      });

      html += `<td>${cell}</td>`;
    });

    html += `</tr>`;
  }

  html += `</table>`;
  viewResult.innerHTML = html;
}

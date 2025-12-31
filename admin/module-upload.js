let uploadSchedules = {};

document.getElementById("uploadBtn").onclick = () => {
  const f = document.getElementById("fileInput").files[0];
  if (!f) return;

  const reader = new FileReader();
  reader.onload = e => {
    const wb = XLSX.read(new Uint8Array(e.target.result), { type: "array" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

    uploadSchedules = parseScheduleMatrix(raw);
    document.getElementById("jsonBox").value =
      JSON.stringify(uploadSchedules, null, 2);
  };
  reader.readAsArrayBuffer(f);
};

document.getElementById("copyBtn").onclick = () => {
  navigator.clipboard.writeText(document.getElementById("jsonBox").value);
};

document.getElementById("downloadBtn").onclick = () => {
  const content =
    "const data = " + JSON.stringify(uploadSchedules, null, 2) + ";";
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "data.js";
  a.click();
};

/* ===== PARSE ===== */
function parseScheduleMatrix(matrix) {
  let schedules = {};
  let classes = [];

  let headerRow = matrix.findIndex(r =>
    r.some(c => /^thứ/i.test((c || "").toString()))
  );
  if (headerRow === -1) headerRow = 2;

  classes = matrix[headerRow].slice(3)
    .map(c => c.toString().trim()).filter(Boolean);

  classes.forEach(c => schedules[c] = {});

  let last = ["", "", ""];
  for (let i = headerRow + 1; i < matrix.length; i++) {
    const row = matrix[i];
    for (let j = 0; j < 3; j++) {
      row[j] = row[j] || last[j];
      last[j] = row[j];
    }

    const [day, session, tiet] = row;
    if (!day || !session || !tiet) continue;

    classes.forEach((cls, idx) => {
      const cell = (row[3 + idx] || "").trim();
      if (!schedules[cls][day]) schedules[cls][day] = {};
      if (!schedules[cls][day][session]) schedules[cls][day][session] = [];

      let mon = "", gv = "";
      if (cell.includes("-")) {
        const p = cell.split("-");
        mon = p[0].trim();
        gv = p.slice(1).join("-").trim();
      } else mon = cell;

      schedules[cls][day][session].push({ tiet: String(tiet), mon, gv });
    });
  }
  return schedules;
}

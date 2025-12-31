// ==========================
// CONFIG
// ==========================
const PASSWORD = "123";

// ==========================
// DOM
// ==========================
const loginWrapper = document.getElementById("loginWrapper");
const adminBox = document.getElementById("adminBox");
const loginMsg = document.getElementById("loginMsg");

const viewModule = document.getElementById("viewModule");
const uploadModule = document.getElementById("uploadModule");

// ==========================
// LOGIN
// ==========================
document.getElementById("loginBtn").onclick = () => {
  const pass = document.getElementById("pass").value;

  if (pass === PASSWORD) {
    // Ẩn login
    loginWrapper.style.display = "none";

    // Hiện admin
    adminBox.classList.remove("hidden");

    // 👉 TỰ ĐỘNG VÀO MODULE VIEW
    openViewModule();
  } else {
    loginMsg.textContent = "Sai mật khẩu!";
  }
};

// ==========================
// MODULE SWITCH
// ==========================
document.getElementById("btnView").onclick = openViewModule;
document.getElementById("btnUpload").onclick = openUploadModule;

function openViewModule() {
  viewModule.classList.remove("hidden");
  uploadModule.classList.add("hidden");

  // Khởi tạo dữ liệu VIEW
  if (typeof initViewModule === "function") {
    initViewModule();
  }
}

function openUploadModule() {
  uploadModule.classList.remove("hidden");
  viewModule.classList.add("hidden");
}

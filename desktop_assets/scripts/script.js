const desktop = document.getElementById("desktop");
const windowsLayer = document.getElementById("windows");
const ctxMenu = document.getElementById("ctxMenu");
const toast = document.getElementById("toast");

const clockBtn = document.getElementById("clockBtn");
const termInput = document.getElementById("termInput");
const termOutput = document.getElementById("termOutput");

let zTop = 60;
let wallpaperIndex = 1;

// ---------- Utilities ----------
function bringToFront(win){
  zTop += 1;
  win.style.zIndex = String(zTop);
}

function showToast(msg){
  toast.textContent = msg;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1400);
}

function openWindow(appName){
  const win = document.querySelector(`.window[data-app="${appName}"]`);
  if (!win) return;
  win.classList.remove("hidden");
  bringToFront(win);

  if (appName === "terminal") {
    setTimeout(() => termInput?.focus(), 50);
  }
}

function closeWindow(win){ win.classList.add("hidden"); }
function minimizeWindow(win){ win.classList.add("hidden"); }
function toggleMaximize(win){ win.classList.toggle("maximized"); bringToFront(win); }

// ---------- Clock ----------
function updateClock(){
  const now = new Date();
  const opts = { weekday:"short", month:"short", day:"2-digit", hour:"2-digit", minute:"2-digit" };
  clockBtn.textContent = now.toLocaleString(undefined, opts).replace(",", "");
}
updateClock();
setInterval(updateClock, 1000 * 10);

// ---------- Openers ----------
document.querySelectorAll("[data-open]").forEach(el => {
  el.addEventListener("click", () => openWindow(el.dataset.open));
});

// ---------- Titlebar controls ----------
document.querySelectorAll(".window").forEach(win => {
  win.addEventListener("mousedown", () => bringToFront(win));

  win.querySelectorAll(".win-dot").forEach(dot => {
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const action = dot.dataset.action;
      if (action === "close") closeWindow(win);
      if (action === "min") minimizeWindow(win);
      if (action === "max") toggleMaximize(win);
    });
  });
});

// ---------- Dragging ----------
let dragState = null;

windowsLayer.addEventListener("mousedown", (e) => {
  const titlebar = e.target.closest(".titlebar");
  const win = e.target.closest(".window");
  if (!win) return;

  bringToFront(win);

  if (titlebar && !win.classList.contains("maximized")) {
    const rect = win.getBoundingClientRect();
    dragState = {
      win,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    };
    e.preventDefault();
  }
});

window.addEventListener("mousemove", (e) => {
  if (!dragState) return;
  const { win, offsetX, offsetY } = dragState;

  const dockPad = 12;
  const minX = (64 + 24); 
  const minY = 52;      
  const maxX = window.innerWidth - win.offsetWidth - dockPad;
  const maxY = window.innerHeight - win.offsetHeight - dockPad;

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  x = Math.min(Math.max(x, minX), maxX);
  y = Math.min(Math.max(y, minY), maxY);

  win.style.left = `${x}px`;
  win.style.top = `${y}px`;
});

window.addEventListener("mouseup", () => { dragState = null; });

// ---------- Resizing ----------
let resizeState = null;

document.querySelectorAll(".resize-handle").forEach(handle => {
  handle.addEventListener("mousedown", (e) => {
    const win = e.target.closest(".window");
    if (!win || win.classList.contains("maximized")) return;

    bringToFront(win);

    const rect = win.getBoundingClientRect();
    resizeState = {
      win,
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height
    };
    e.preventDefault();
    e.stopPropagation();
  });
});

window.addEventListener("mousemove", (e) => {
  if (!resizeState) return;
  const { win, startX, startY, startW, startH } = resizeState;

  const w = Math.max(320, startW + (e.clientX - startX));
  const h = Math.max(220, startH + (e.clientY - startY));

  win.style.width = `${w}px`;
  win.style.height = `${h}px`;
});

window.addEventListener("mouseup", () => { resizeState = null; });

// ---------- Context menu ----------
function closeCtx(){
  ctxMenu.classList.remove("open");
  ctxMenu.setAttribute("aria-hidden", "true");
}

desktop.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  closeCtx();

  const x = Math.min(e.clientX, window.innerWidth - 220);
  const y = Math.min(e.clientY, window.innerHeight - 180);

  ctxMenu.style.left = `${x}px`;
  ctxMenu.style.top = `${y}px`;
  ctxMenu.classList.add("open");
  ctxMenu.setAttribute("aria-hidden", "false");
});

desktop.addEventListener("mousedown", (e) => {
  if (!e.target.closest(".ctx-menu")) closeCtx();
});

document.getElementById("ctxNewFolder").addEventListener("click", () => {
  closeCtx();
  if (typeof addPlaceholderFile === "function") addPlaceholderFile();
});

document.getElementById("ctxRefresh").addEventListener("click", () => {
  closeCtx();
  showToast("Refreshed");
});

document.getElementById("ctxWallpaper").addEventListener("click", () => {
  closeCtx();
  cycleWallpaper();
});

// ---------- Files app (virtual file system as links) ----------
const FILE_SYSTEM = {
  home: [
    { type: "folder", name: "Projects", open: "projects" },
    { type: "folder", name: "Reciepts", open: "reciepts" },
    { type: "folder", name: "Passwords", open: "passwords" },
    { type: "folder", name: "Logs", open: "logs" },

    { type: "file", name: "notes.txt", icon: "📄", url: "./files/home/notes.html" },
    { type: "file", name: "readme.txt", icon: "📄", url: "./files/home/readme.html" },
    { type: "file", name: "todo.txt", icon: "📄", url: "./files/home/todo.html" },
    { type: "file", name: "config.json", icon: "⚙️", url: "./files/home/config.html" },
    { type: "file", name: "wallpaper.png", icon: "🖼️", url: "./files/home/wallpaper.html" },
    { type: "file", name: "archive.zip", icon: "🗜️", url: "./files/home/archive.html" },
    { type: "file", name: "backup.tar.gz", icon: "📦", url: "./files/home/backup.html" },
  ],

  documents: [
    { type: "file", name: "incident_report.txt", icon: "📄", url: "./files/documents/incident_report.html" },
    { type: "file", name: "employee_notes.txt", icon: "📄", url: "./files/documents/employee_notes.html" },
    { type: "file", name: "auth.log", icon: "📄", url: "./files/documents/auth_log.html" },
    { type: "file", name: "staff_directory.txt", icon: "📄", url: "./files/documents/staff_directory.html" },
    { type: "file", name: "meeting_minutes.txt", icon: "📄", url: "./files/documents/meeting_minutes.html" },
    { type: "file", name: "budget.xlsx", icon: "📊", url: "./files/documents/budget.html" },
    { type: "file", name: "presentation.pptx", icon: "📊", url: "./files/documents/presentation.html" },
  ],

  downloads: [
    { type: "file", name: "installer.exe", icon: "💿", url: "./files/downloads/installer.html" },
    { type: "file", name: "leaks.zip", icon: "🗜️", url: "./files/downloads/leaks.html" },
    { type: "file", name: "music.mp3", icon: "🎵", url: "./files/downloads/music.html" },
    { type: "file", name: "video.mp4", icon: "🎬", url: "./files/downloads/video.html" },
    { type: "file", name: "report.pdf", icon: "📄", url: "./files/downloads/report.html" },
  ],

  pictures: [
    { type: "file", name: "selfie.png", icon: "🖼️", url: "./files/pictures/selfie.html" },
    { type: "file", name: "office.jpg", icon: "🖼️", url: "./files/pictures/office.html" },
    { type: "file", name: "whiteboard.png", icon: "🖼️", url: "./files/pictures/whiteboard.html" },
    { type: "file", name: "diagram.png", icon: "🖼️", url: "./files/pictures/diagram.html" },
  ],

  trash: [
    { type: "file", name: "old_passwords.txt", icon: "📄", url: "./files/trash/old_passwords.html" },
    { type: "file", name: "deleted_log.txt", icon: "📄", url: "./files/trash/deleted_log.html" },
    { type: "file", name: "temp.txt", icon: "📄", url: "./files/trash/temp.html" },
  ],

  // Subfolders
  projects: [
    { type: "file", name: "todo.txt", icon: "📄", url: "./files/projects/todo.html" },
    { type: "file", name: "prototype.fig", icon: "📦", url: "./files/projects/prototype.html" },
  ],

  reciepts: [
    { type: "file", name: "receipt_001.txt", icon: "📄", url: "./files/reciepts/receipt_001.html" },
    { type: "file", name: "receipt_002.txt", icon: "📄", url: "./files/reciepts/receipt_002.html" },
  ],

  passwords: [
    { type: "file", name: "admin_password.txt", icon: "📄", url: "./files/passwords/admin_password.html" },
    { type: "file", name: "user_password.txt", icon: "📄", url: "./files/passwords/user_password.html" },
  ],

  logs: [
    { type: "file", name: "system.log", icon: "📄", url: "./files/logs/system.html" },
    { type: "file", name: "network.log", icon: "📄", url: "./files/logs/network.html" },
  ],
};

const fileGrid = document.getElementById("fileGrid");
const filesWin = document.getElementById("win-files");
const btnNewFolder = document.getElementById("btnNewFolder");
const btnSort = document.getElementById("btnSort");

let currentFolderKey = "home";

function iconFor(item){
  if (item.icon) return item.icon;
  return item.type === "folder" ? "📁" : "📄";
}

function setFilesHint(text){
  const hint = document.querySelector("#win-files .titlebar .title-right .hint");
  if (hint) hint.textContent = text;
}

function setActiveSidebar(folderKey){
  const items = Array.from(document.querySelectorAll("#win-files .sidebar .side-item"));
  items.forEach(el => el.classList.remove("active"));
  const match = items.find(el => el.dataset.folder === folderKey);
  if (match) match.classList.add("active");
}

function openInNewTab(url){
  const w = window.open(url, "_blank", "noopener,noreferrer");
  if (!w) showToast("Pop-up blocked — allow pop-ups for this site.");
}

function renderFiles(folderKey){
  if (!fileGrid) return;

  currentFolderKey = folderKey;
  const items = FILE_SYSTEM[folderKey] || [];

  fileGrid.innerHTML = items.map((item) => {
    const safeName = String(item.name).replaceAll('"', "&quot;");
    const safeOpen = item.open ? String(item.open).replaceAll('"', "&quot;") : "";
    return `
      <button class="file-card" type="button"
        data-type="${item.type}"
        data-name="${safeName}"
        data-open="${safeOpen}">
        <div class="fc-ico">${iconFor(item)}</div>
        <div class="fc-name">${safeName}</div>
      </button>
    `;
  }).join("");

  Array.from(fileGrid.querySelectorAll(".file-card")).forEach((btn) => {
    btn.addEventListener("click", () => {
  const type = btn.dataset.type;
  const name = btn.dataset.name;
  const open = btn.dataset.open;

  if (type === "folder" && open) {
    setActiveSidebar(null);
    setFilesHint(`/home/arch/${open}`);
    renderFiles(open);
    return;
  }

  const item = (FILE_SYSTEM[folderKey] || []).find(x => x.name === name);
  if (!item) return;

  openInNewTab(item.url || "./files/placeholder.html");
});
  });
}

function addPlaceholderFile(){
  const name = `New File ${Math.floor(Math.random()*90 + 10)}.txt`;
  FILE_SYSTEM[currentFolderKey] = FILE_SYSTEM[currentFolderKey] || [];
  FILE_SYSTEM[currentFolderKey].unshift({
    type: "file",
    name,
    icon: "📄",
    url: "./files/placeholder.html"
  });
  renderFiles(currentFolderKey);
  showToast("Created file");
}

function sortFolder(){
  FILE_SYSTEM[currentFolderKey] = FILE_SYSTEM[currentFolderKey] || [];
  FILE_SYSTEM[currentFolderKey].sort((a, b) => a.name.localeCompare(b.name));
  renderFiles(currentFolderKey);
  showToast("Sorted");
}

function wireFilesApp(){
  if (!filesWin) return;

  Array.from(filesWin.querySelectorAll(".sidebar .side-item")).forEach((btn) => {
    btn.addEventListener("click", () => {
      const folderKey = btn.dataset.folder;
      if (!folderKey) return;
      setActiveSidebar(folderKey);

      const label = folderKey === "home" ? "" : `/${folderKey}`;
      setFilesHint(`/home/arch${label}`);
      renderFiles(folderKey);
    });
  });

btnNewFolder?.addEventListener("click", addPlaceholderFile);
btnSort?.addEventListener("click", sortFolder);


  setActiveSidebar("home");
  setFilesHint("/home/arch");
  renderFiles("home");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", wireFilesApp);
} else {
  wireFilesApp();
}

// ---------- Settings ----------
document.querySelectorAll("[data-wallpaper]").forEach(btn => {
  btn.addEventListener("click", () => setWallpaper(Number(btn.dataset.wallpaper)));
});

document.getElementById("btnAccent").addEventListener("click", () => {
  desktop.classList.toggle("accent-alt");
  showToast("Accent toggled");
});

function setWallpaper(n){
  wallpaperIndex = n;
  desktop.classList.remove("wallpaper-1","wallpaper-2","wallpaper-3");
  desktop.classList.add(`wallpaper-${n}`);
  showToast(`Wallpaper ${n}`);
}
function cycleWallpaper(){
  wallpaperIndex = (wallpaperIndex % 3) + 1;
  setWallpaper(wallpaperIndex);
}

// ---------- Fake terminal ----------
const fakeFiles = {
  "notes.txt": "Remember: pacman -Syu\nAlso: read the Arch Wiki.\n",
  "pkglist.txt": "base linux linux-firmware networkmanager firefox\n"
};

function appendTerm(lineHtml){
  const div = document.createElement("div");
  div.innerHTML = lineHtml;
  termOutput.appendChild(div);
  termOutput.scrollTop = termOutput.scrollHeight;
}

function neofetchText(){
  return `
<pre class="neo" style="margin:0">
      /\\
     /  \\       <b>arch@desktop</b>
    /\\   \\      ------------
   /      \\     OS: Arch Linux (HTML)
  /   ,,   \\    Kernel: 6.x (pretend)
 /   |  |  -\\   Uptime: ${Math.floor(performance.now()/1000)}s
/_-''    ''-_\\  Packages: 1337 (pretend)
               Shell: JS
               Theme: Arch-Cyan
</pre>`;
}

function runCommand(cmdRaw){
  const cmd = cmdRaw.trim();

  if (!cmd) return;

  appendTerm(`<span style="color:rgba(0,199,255,.9)">arch@desktop:~$</span> ${escapeHtml(cmd)}`);

  const lower = cmd.toLowerCase();

  if (lower === "help") {
    appendTerm(`Commands: <code>help</code>, <code>neofetch</code>, <code>ls</code>, <code>cat &lt;file&gt;</code>, <code>whoami</code>, <code>uname -a</code>, <code>clear</code>`);
    return;
  }

  if (lower === "clear") {
    termOutput.innerHTML = "";
    return;
  }

  if (lower === "neofetch") {
    appendTerm(neofetchText());
    openWindow("neofetch");
    return;
  }

  if (lower === "ls") {
    appendTerm(Object.keys(fakeFiles).join("&nbsp;&nbsp;"));
    return;
  }

  if (lower.startsWith("cat ")) {
    const file = cmd.slice(4).trim();
    if (fakeFiles[file]) {
      appendTerm(`<pre style="margin:0; white-space:pre-wrap">${escapeHtml(fakeFiles[file])}</pre>`);
    } else {
      appendTerm(`cat: ${escapeHtml(file)}: No such file`);
    }
    return;
  }

  if (lower === "whoami") {
    appendTerm("arch");
    return;
  }

  if (lower === "uname -a") {
    appendTerm("Linux arch-desktop 6.x.x-arch1-1 #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux (pretend)");
    return;
  }

  appendTerm(`${escapeHtml(cmd)}: command not found`);
}

function escapeHtml(s){
  return s.replaceAll("&","&amp;")
          .replaceAll("<","&lt;")
          .replaceAll(">","&gt;")
          .replaceAll('"',"&quot;")
          .replaceAll("'","&#039;");
}

termInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    runCommand(termInput.value);
    termInput.value = "";
  }
});

// ---------- Start state ----------
["files","firefox","settings","neofetch"].forEach(app => {
  document.querySelector(`.window[data-app="${app}"]`)?.classList.add("hidden");
});
openWindow("terminal");
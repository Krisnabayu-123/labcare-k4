document.addEventListener("DOMContentLoaded", () => {
  // Navigasi seluler
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.textContent = open ? "×" : "☰";
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.textContent = "☰";
    }));
  }

  // --- GENERATE OTOMATIS 30 PC PER LAB & KOSONGKAN LAB 10 ---
  const deviceGrid = document.querySelector("#device-grid");
  const labSelect = document.querySelector("#lab-select");
  const categorySelect = document.querySelector("#category-select");

  const labNamesList = [
    "LK 1",
    "LK 2: Rekayasa Perangkat Lunak",
    "LK 3: Multimedia & Animasi",
    "LK 4: Hardware & Jaringan Dasar",
    "LK 5: Pemrograman Web",
    "LK 6: Basis Data",
    "LK 7: Keamanan Siber",
    "LK 8: Internet of Things (IoT)",
    "LK 9: Kecerdasan Buatan (AI)",
    "LK 10: Laboratorium Kosong"
  ];

  const statuses = ["Baik", "Baik", "Baik", "Perlu cek", "Rusak"];
  const visuals = ["visual-purple", "visual-mint", "visual-blue", "visual-peach", "visual-yellow", "visual-pink"];

  function generateDevices() {
    if (!deviceGrid) return;
    let htmlContent = "";
    
    for (let i = 1; i <= 10; i++) {
      const labName = `Lab ${i}`;
      
      // Jika Lab 10, kosongkan bagian PC-nya
      if (i === 10) continue;

      // Buat minimal 30 PC untuk Lab 1 sampai 9
      for (let j = 1; j <= 30; j++) {
        const pcNum = j < 10 ? `0${j}` : `${j}`;
        const code = `LC-L${i}-${pcNum}`;
        const status = statuses[(i + j) % statuses.length];
        const visualClass = visuals[(i + j) % visuals.length];
        const statusClass = status === "Baik" ? "status-good" : (status === "Perlu cek" ? "status-check" : "status-broken");

        htmlContent += `
          <article class="inventory-card" data-name="PC ${labName} PC-${pcNum}" data-room="${labName}" data-status="${status}" data-number="${code}" data-lab="${labName}">
              <div class="device-visual ${visualClass}"><span>▣</span><i>${pcNum}</i></div>
              <div class="inventory-card-body">
                  <div class="card-meta"><span>${code}</span><span class="status ${statusClass}">${status}</span></div>
                  <h3>PC ${labName} - ${pcNum}</h3>
                  <p>${labNamesList[i-1]}</p>
                  <div class="device-spec"><span>▤ Desktop</span><span>◷ 2024</span></div>
                  <button class="detail-btn" data-detail="PC ${labName} - ${pcNum}">Lihat detail <span>↗</span></button>
              </div>
          </article>
        `;
      }
    }
    deviceGrid.innerHTML = htmlContent;
  }

  generateDevices();

  // Pencarian, filter lab, dan filter kategori
  const search = document.querySelector("#device-search");
  const count = document.querySelector("#device-count");
  const empty = document.querySelector("#empty-state");

  function filterDevicesDynamic() {
    const keyword = (search?.value || "").toLowerCase().trim();
    const selectedLab = labSelect ? labSelect.value : "Lab 1";
    const selectedCategory = categorySelect ? categorySelect.value : "Semua";
    
    let visible = 0;
    const updatedCards = [...document.querySelectorAll(".inventory-card")];

    updatedCards.forEach(card => {
      const matchesLab = card.dataset.room === selectedLab;
      const matchesCategory = selectedCategory === "Semua" || card.dataset.status === selectedCategory;
      const matchesText = `${card.dataset.name} ${card.dataset.room} ${card.dataset.number}`.toLowerCase().includes(keyword);
      
      const show = matchesLab && matchesCategory && matchesText;
      card.hidden = !show;
      if (show) visible++;
    });

    if (count) count.textContent = visible;
    if (empty) empty.hidden = visible > 0;
  }

  search?.addEventListener("input", filterDevicesDynamic);
  labSelect?.addEventListener("change", filterDevicesDynamic);
  categorySelect?.addEventListener("change", filterDevicesDynamic);

  // Jalankan filter awal saat halaman dimuat
  filterDevicesDynamic();

  // Modal Detail Perangkat
  const modal = document.querySelector("#detail-modal");
  const closeModal = () => { if (modal) modal.hidden = true; };
  
  document.addEventListener("click", event => {
    const detailBtn = event.target.closest("[data-detail]");
    if (detailBtn) {
      const card = detailBtn.closest(".inventory-card");
      if (!card || !modal) return;
      const title = card.dataset.name;
      const status = card.dataset.status;
      document.querySelector("#modal-title").textContent = title;
      document.querySelector("#modal-description").textContent = `Informasi contoh untuk perangkat ${title}. Hubungi petugas lab jika kondisi perangkat membutuhkan pemeriksaan.`;
      document.querySelector("#modal-info").innerHTML = `
        <div><span>Kode perangkat</span><strong>${escapeHTML(card.dataset.number)}</strong></div>
        <div><span>Laboratorium</span><strong>${escapeHTML(card.dataset.room)}</strong></div>
        <div><span>Kondisi</span><strong>${escapeHTML(status)}</strong></div>`;
      modal.hidden = false;
    }
  });

  modal?.querySelector(".modal-close")?.addEventListener("click", closeModal);
  modal?.addEventListener("click", event => { if (event.target === modal) closeModal(); });
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeModal(); });

  // Form laporan: disimpan di localStorage, hanya untuk demo di browser ini
  const reportForm = document.querySelector("#report-form");
  const reportsList = document.querySelector("#reports-list");
  const reportMessage = document.querySelector("#form-message");
  const reportKey = "labcare_demo_reports_v1";
  
  const getReports = () => {
    try { return JSON.parse(localStorage.getItem(reportKey) || "[]"); }
    catch { return []; }
  };
  
  const saveReports = reports => {
    try { localStorage.setItem(reportKey, JSON.stringify(reports)); return true; }
    catch { return false; }
  };

  function renderReports() {
    if (!reportsList) return;
    const reports = getReports();
    if (!reports.length) {
      reportsList.innerHTML = '<p class="empty-report">Belum ada laporan tersimpan di browser ini.</p>';
      return;
    }
    reportsList.innerHTML = reports.map(report => `
      <article class="report-item">
        <div><h3>${escapeHTML(report.perangkat)} · ${escapeHTML(report.kategori)}</h3>
        <p>${escapeHTML(report.deskripsi)}</p><small>Pelapor: ${escapeHTML(report.nama)} · ${escapeHTML(report.waktu)}</small></div>
        <span class="status status-check">Menunggu cek</span>
      </article>`).join("");
  }

  reportForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!reportForm.reportValidity()) return;
    const formData = new FormData(reportForm);
    const newReport = {
      nama: String(formData.get("nama")).trim(),
      perangkat: String(formData.get("perangkat")).trim(),
      kategori: String(formData.get("kategori")).trim(),
      deskripsi: String(formData.get("deskripsi")).trim(),
      waktu: new Date().toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })
    };
    if (!newReport.nama || !newReport.perangkat || !newReport.kategori || newReport.deskripsi.length < 8) {
      reportMessage.textContent = "Periksa kembali isian laporan.";
      return;
    }
    const reports = getReports();
    reports.unshift(newReport);
    if (!saveReports(reports)) {
      reportMessage.textContent = "Browser tidak mengizinkan penyimpanan.";
      reportMessage.style.color = "#d84d5d";
      return;
    }
    reportMessage.textContent = "Laporan berhasil disimpan di browser ini!";
    reportMessage.style.color = "#29966c";
    reportForm.reset();
    renderReports();
    reportsList?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });

  document.querySelector("#clear-reports")?.addEventListener("click", () => {
    if (!getReports().length) return;
    if (confirm("Hapus semua laporan demo yang tersimpan di browser ini?")) {
      saveReports([]);
      renderReports();
      if (reportMessage) reportMessage.textContent = "Riwayat demo berhasil dibersihkan.";
    }
  });
  renderReports();

  // Form masukan tim
  const feedbackForm = document.querySelector("#feedback-form");
  feedbackForm?.addEventListener("submit", event => {
    event.preventDefault();
    if (!feedbackForm.reportValidity()) return;
    const name = feedbackForm.querySelector("#feedback-name").value.trim();
    const message = feedbackForm.querySelector("#feedback-message").value.trim();
    let feedbacks = [];
    try { feedbacks = JSON.parse(localStorage.getItem("labcare_demo_feedback_v1") || "[]"); } catch {}
    feedbacks.unshift({ name, message, time: new Date().toLocaleString("id-ID") });
    try {
      localStorage.setItem("labcare_demo_feedback_v1", JSON.stringify(feedbacks));
      document.querySelector("#feedback-status").textContent = "Terima kasih! Masukan tersimpan di browser ini.";
      feedbackForm.reset();
    } catch {
      document.querySelector("#feedback-status").textContent = "Penyimpanan tidak tersedia di browser ini.";
    }
  });

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[char]);
  }
});
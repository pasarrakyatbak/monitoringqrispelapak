const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let masterData = [];
let chartInstance;

// Fungsi Menampilkan/Sembunyikan Loading Utama
function toggleLoader(show) {
    document.getElementById("loading-overlay").style.display = show ? "flex" : "none";
}

async function init() {
    toggleLoader(true);
    try {
        await Promise.all([fetchData(), fetchStats()]);
    } catch (e) {
        alert("Gagal memuat data. Periksa koneksi internet.");
    } finally {
        toggleLoader(false);
    }
}

async function refreshData() {
    await init();
}

async function fetchData() {
    const res = await fetch(`${API_URL}?action=listQRIS`);
    const json = await res.json();
    masterData = json.data;
    renderData(masterData);
}

async function fetchStats() {
    const res = await fetch(`${API_URL}?action=statistikQRIS`);
    const d = await res.json();

    document.getElementById("jmlSudah").innerText = d.sudah;
    document.getElementById("jmlBelum").innerText = d.belum;
    const p = Math.round((d.sudah / d.totalPelapak) * 100) || 0;
    document.getElementById("persenQRIS").innerText = p + "%";

    drawChart(d.sudah, d.belum);
}

// Render data menggunakan format KARTU (bukan tabel) agar tidak geser kanan kiri
function renderData(data) {
    const container = document.getElementById("listPelapak");
    if (data.length === 0) {
        container.innerHTML = `<p style="text-align:center; padding:20px;">Nama tidak ditemukan...</p>`;
        return;
    }

    container.innerHTML = data.map(d => `
        <div class="pelapak-item">
            <span class="p-name">${d.nama}</span>
            
            <label class="label-hint">Nomor Lapak:</label>
            <input type="text" class="input-big" id="lapak-${d.no}" value="${d.nomorLapak || ''}" placeholder="Contoh: A-01">
            
            <label class="label-hint">Status Pengambilan QRIS:</label>
            <select class="input-big" id="status-${d.no}">
                <option value="Belum" ${d.statusQRIS === 'Belum' ? 'selected' : ''}>❌ BELUM AMBIL QRIS</option>
                <option value="Sudah" ${d.statusQRIS === 'Sudah' ? 'selected' : ''}>✅ SUDAH AMBIL QRIS</option>
            </select>
            
            <button class="btn-simpan" id="btn-${d.no}" onclick="updateData(${d.no})">
                <i class="fas fa-save"></i> SIMPAN PERUBAHAN
            </button>
        </div>
    `).join('');
}

async function updateData(no) {
    const btn = document.getElementById(`btn-${no}`);
    const lp = document.getElementById(`lapak-${no}`).value;
    const st = document.getElementById(`status-${no}`).value;

    // Loading pada tombol
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> MENYIMPAN...`;

    try {
        await fetch(`${API_URL}?action=updateQRISPelapak&no=${no}&nomorLapak=${encodeURIComponent(lp)}&statusQRIS=${st}`, { method: "POST" });
        showToast();
        await Promise.all([fetchData(), fetchStats()]); // Refresh data tanpa overlay full
    } catch (e) {
        alert("Gagal menyimpan data.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function drawChart(s, b) {
    const ctx = document.getElementById("chartQRIS");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sudah', 'Belum'],
            datasets: [{
                data: [s, b],
                backgroundColor: ['#2563eb', '#f43f5e'],
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { font: { size: 14, weight: 'bold', family: 'Plus Jakarta Sans' }, padding: 20 }
                }
            }
        }
    });
}

function filterLapak() {
    const val = document.getElementById("searchLapak").value.toLowerCase();
    const filtered = masterData.filter(x => x.nama.toLowerCase().includes(val));
    renderData(filtered);
}

function showToast() {
    const t = document.getElementById("toast");
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 3000);
}

document.addEventListener("DOMContentLoaded", init);
// Fungsi Buka-Tutup Panduan
function toggleGuide() {
    const content = document.getElementById("guide-content");
    const panel = document.querySelector(".guide-panel");

    if (content.style.display === "none") {
        content.style.display = "block";
        panel.classList.add("guide-open");
    } else {
        content.style.display = "none";
        panel.classList.remove("guide-open");
    }
}

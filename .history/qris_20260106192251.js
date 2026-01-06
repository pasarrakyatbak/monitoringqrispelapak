const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let semuaData = [];
let chartInstance;

async function init() {
    await Promise.all([loadData(), loadStatistik()]);
}

async function loadData() {
    const res = await fetch(`${API_URL}?action=listQRIS`);
    const json = await res.json();
    semuaData = json.data;
    renderTable(semuaData);
}

async function loadStatistik() {
    const res = await fetch(`${API_URL}?action=statistikQRIS`);
    const d = await res.json();

    document.getElementById("jmlSudah").innerText = d.sudah;
    document.getElementById("jmlBelum").innerText = d.belum;
    const persen = Math.round((d.sudah / d.totalPelapak) * 100) || 0;
    document.getElementById("persenQRIS").innerText = persen + "%";

    // Update Progress Bars
    document.getElementById("barSudah").style.width = persen + "%";
    document.getElementById("barBelum").style.width = (100 - persen) + "%";

    renderChart(d.sudah, d.belum);
}

function renderTable(data) {
    const tbody = document.getElementById("dataQRIS");
    tbody.innerHTML = data.map(d => `
        <tr>
            <td>${d.no}</td>
            <td>
                <div style="font-weight: 600;">${d.nama}</div>
                <div style="font-size: 11px; color: #94a3b8">Pelapak Aktif</div>
            </td>
            <td>
                <input class="input-field" id="lapak-${d.no}" value="${d.nomorLapak || ''}" placeholder="Cth: A-01">
            </td>
            <td>
                <span class="badge ${d.statusQRIS === 'Sudah' ? 'badge-sudah' : 'badge-belum'}">
                    ${d.statusQRIS}
                </span>
            </td>
            <td style="text-align: right; min-width: 140px;">
                <select class="input-field" style="margin-bottom: 4px;" id="status-${d.no}">
                    <option value="Belum" ${d.statusQRIS === "Belum" ? "selected" : ""}>Belum</option>
                    <option value="Sudah" ${d.statusQRIS === "Sudah" ? "selected" : ""}>Sudah</option>
                </select>
                <button class="btn btn-save" onclick="simpan(${d.no}, this)">
                    <i class="fas fa-check"></i> Simpan
                </button>
            </td>
        </tr>
    `).join('');
}

async function simpan(no, btn) {
    const originalContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i>`;

    const nomorLapak = document.getElementById(`lapak-${no}`).value;
    const statusQRIS = document.getElementById(`status-${no}`).value;

    try {
        await fetch(`${API_URL}?action=updateQRISPelapak&no=${no}&nomorLapak=${encodeURIComponent(nomorLapak)}&statusQRIS=${statusQRIS}`, { method: "POST" });
        showToast();
        await Promise.all([loadData(), loadStatistik()]);
    } catch (e) {
        alert("Gagal menyimpan data.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
}

function showToast() {
    const t = document.getElementById("toast");
    t.style.display = "block";
    setTimeout(() => { t.style.display = "none"; }, 3000);
}

function renderChart(sudah, belum) {
    const ctx = document.getElementById("chartQRIS");
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sudah", "Belum"],
            datasets: [{
                data: [sudah, belum],
                backgroundColor: ["#2563eb", "#e2e8f0"],
                hoverOffset: 4,
                borderWidth: 0
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '80%',
            plugins: {
                legend: { position: "bottom", labels: { usePointStyle: true, padding: 25, font: { family: 'Inter', size: 12 } } }
            }
        }
    });
}

function filterLapak() {
    const kw = document.getElementById("searchLapak").value.toLowerCase();
    renderTable(semuaData.filter(d => d.nama.toLowerCase().includes(kw)));
}

function resetFilter() {
    document.getElementById("searchLapak").value = "";
    renderTable(semuaData);
}

document.addEventListener("DOMContentLoaded", init);
const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let masterData = [];
let chart;

async function init() {
    await Promise.all([fetchData(), fetchStats()]);
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

function renderData(data) {
    const container = document.getElementById("dataQRIS");
    container.innerHTML = data.map(d => `
        <tr>
            <td data-label="Pelapak">
                <div>${d.nama}</div>
                <span class="status-badge ${d.statusQRIS === 'Sudah' ? 'bg-s' : 'bg-b'}">${d.statusQRIS}</span>
            </td>
            <td data-label="No. Lapak">
                <input type="text" class="input-group" style="padding: 6px 10px" id="lapak-${d.no}" value="${d.nomorLapak || ''}">
            </td>
            <td data-label="Aksi">
                <div class="action-row">
                    <select id="status-${d.no}" style="padding: 6px; border-radius: 6px; border: 1px solid #ddd">
                        <option value="Belum" ${d.statusQRIS === 'Belum' ? 'selected' : ''}>Belum QRIS</option>
                        <option value="Sudah" ${d.statusQRIS === 'Sudah' ? 'selected' : ''}>Sudah QRIS</option>
                    </select>
                    <button class="btn-save" id="btn-${d.no}" onclick="updateData(${d.no})">Simpan</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function updateData(no) {
    const btn = document.getElementById(`btn-${no}`);
    const lp = document.getElementById(`lapak-${no}`).value;
    const st = document.getElementById(`status-${no}`).value;

    btn.disabled = true;
    btn.innerText = "Processing...";

    try {
        await fetch(`${API_URL}?action=updateQRISPelapak&no=${no}&nomorLapak=${encodeURIComponent(lp)}&statusQRIS=${st}`, { method: "POST" });
        showToast();
        await init();
    } catch (e) {
        alert("Terjadi kesalahan");
    } finally {
        btn.disabled = false;
        btn.innerText = "Simpan";
    }
}

function drawChart(s, b) {
    const ctx = document.getElementById("chartQRIS");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Sudah QRIS', 'Belum QRIS'],
            datasets: [{
                data: [s, b],
                backgroundColor: ['#4338ca', '#f43f5e'],
                hoverOffset: 10,
                borderWidth: 0,
                borderRadius: 5
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 12, weight: '600' } } }
            }
        }
    });
}

function filterLapak() {
    const val = document.getElementById("searchLapak").value.toLowerCase();
    renderData(masterData.filter(x => x.nama.toLowerCase().includes(val)));
}

function filterBelumQRIS() {
    renderData(masterData.filter(x => x.statusQRIS !== 'Sudah'));
}

function showToast() {
    const t = document.getElementById("toast");
    t.style.display = "block";
    setTimeout(() => t.style.display = "none", 2500);
}

document.addEventListener("DOMContentLoaded", init);
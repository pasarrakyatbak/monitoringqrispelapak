const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let semuaData = [];
let dataAktif = [];
let chart;

async function loadData() {
    try {
        const res = await fetch(`${API_URL}?action=listQRIS`);
        const json = await res.json();
        semuaData = json.data;
        dataAktif = semuaData;
        renderTable(dataAktif);
    } catch (err) {
        console.error("Gagal memuat data", err);
    }
}

async function loadStatistik() {
    try {
        const res = await fetch(`${API_URL}?action=statistikQRIS`);
        const d = await res.json();

        document.getElementById("jmlSudah").innerText = d.sudah;
        document.getElementById("jmlBelum").innerText = d.belum;

        const persen = Math.round((d.sudah / d.totalPelapak) * 100) || 0;
        document.getElementById("persenQRIS").innerText = persen + "%";

        renderChart(d.sudah, d.belum);
    } catch (err) {
        console.error("Gagal memuat statistik", err);
    }
}

function renderTable(data) {
    const tbody = document.getElementById("dataQRIS");
    tbody.innerHTML = "";

    data.forEach(d => {
        const tr = document.createElement("tr");
        const badgeClass = d.statusQRIS === "Sudah" ? "badge-sudah" : "badge-belum";

        tr.innerHTML = `
            <td data-label="No">${d.no}</td>
            <td data-label="Nama Lapak"><strong>${d.nama}</strong></td>
            <td data-label="Nomor Lapak">
                <input class="input-inline" id="lapak-${d.no}" value="${d.nomorLapak || ''}">
            </td>
            <td data-label="Status">
                <span class="badge ${badgeClass}">${d.statusQRIS}</span>
            </td>
            <td data-label="Aksi">
                <select class="input-inline" id="status-${d.no}">
                    <option value="Belum" ${d.statusQRIS === "Belum" ? "selected" : ""}>Belum</option>
                    <option value="Sudah" ${d.statusQRIS === "Sudah" ? "selected" : ""}>Sudah</option>
                </select>
                <button class="btn btn-primary" id="btn-${d.no}" onclick="simpan(${d.no})">
                    <i class="fas fa-save"></i> Simpan
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function simpan(no) {
    const btn = document.getElementById(`btn-${no}`);
    const originalText = btn.innerHTML;

    // Loading State
    btn.disabled = true;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i>...`;

    const nomorLapak = document.getElementById(`lapak-${no}`).value;
    const statusQRIS = document.getElementById(`status-${no}`).value;

    try {
        await fetch(`${API_URL}?action=updateQRISPelapak&no=${no}&nomorLapak=${encodeURIComponent(nomorLapak)}&statusQRIS=${statusQRIS}`, {
            method: "POST"
        });

        // Refresh data
        await Promise.all([loadData(), loadStatistik()]);
        alert("Data berhasil diperbarui!");
    } catch (err) {
        alert("Gagal menyimpan data");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function filterLapak() {
    const keyword = document.getElementById("searchLapak").value.toLowerCase();
    const filtered = semuaData.filter(d => d.nama.toLowerCase().includes(keyword));
    renderTable(filtered);
}

function filterBelumQRIS() {
    const filtered = semuaData.filter(d => d.statusQRIS !== "Sudah");
    renderTable(filtered);
}

function resetFilter() {
    document.getElementById("searchLapak").value = "";
    renderTable(semuaData);
}

function renderChart(sudah, belum) {
    const ctx = document.getElementById("chartQRIS");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sudah", "Belum"],
            datasets: [{
                data: [sudah, belum],
                backgroundColor: ["#10b981", "#ef4444"],
                borderWidth: 0,
                hoverOffset: 10
            }]
        },
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: { position: "bottom", labels: { usePointStyle: true, padding: 20 } }
            },
            cutout: '70%'
        }
    });
}

// Initial Load
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    loadStatistik();
});
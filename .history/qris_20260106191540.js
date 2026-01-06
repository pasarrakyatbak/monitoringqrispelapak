const API_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let semuaData = [];
let dataAktif = [];
let chart;

/* ================= LOAD DATA ================= */

function loadData() {
    fetch(`${API_URL}?action=listQRIS`)
        .then(res => res.json())
        .then(json => {
            semuaData = json.data;
            dataAktif = semuaData;
            renderTable(dataAktif);
        });
}

function loadStatistik() {
    fetch(`${API_URL}?action=statistikQRIS`)
        .then(res => res.json())
        .then(d => {
            document.getElementById("jmlSudah").innerText = d.sudah;
            document.getElementById("jmlBelum").innerText = d.belum;
            document.getElementById("persenQRIS").innerText =
                Math.round((d.sudah / d.totalPelapak) * 100) + "%";

            renderChart(d.sudah, d.belum);
        });
}

/* ================= TABLE ================= */

function renderTable(data) {
    const tbody = document.getElementById("dataQRIS");
    tbody.innerHTML = "";

    data.forEach(d => {
        const tr = document.createElement("tr");

        if (d.statusQRIS !== "Sudah") tr.classList.add("belum-qris");

        const badge = d.statusQRIS === "Sudah"
            ? `<span class="badge badge-sudah">Sudah</span>`
            : `<span class="badge badge-belum">Belum</span>`;

        tr.innerHTML = `
            <td>${d.no}</td>
            <td>${d.nama}</td>
            <td><input id="lapak-${d.no}" value="${d.nomorLapak || ''}"></td>
            <td>${badge}</td>
            <td>
                <select id="status-${d.no}">
                    <option ${d.statusQRIS === "Belum" ? "selected" : ""}>Belum</option>
                    <option ${d.statusQRIS === "Sudah" ? "selected" : ""}>Sudah</option>
                </select>
                <button onclick="simpan(${d.no})">Simpan</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/* ================= FILTER ================= */

function filterLapak() {
    const keyword = document.getElementById("searchLapak").value.toLowerCase();
    renderTable(
        dataAktif.filter(d => d.nama.toLowerCase().includes(keyword))
    );
}

function filterBelumQRIS() {
    dataAktif = semuaData.filter(d => d.statusQRIS !== "Sudah");
    renderTable(dataAktif);
}

function resetFilter() {
    document.getElementById("searchLapak").value = "";
    dataAktif = semuaData;
    renderTable(dataAktif);
}

/* ================= SAVE ================= */

function simpan(no) {
    const nomorLapak = document.getElementById(`lapak-${no}`).value;
    const statusQRIS = document.getElementById(`status-${no}`).value;

    fetch(`${API_URL}?action=updateQRISPelapak&no=${no}&nomorLapak=${encodeURIComponent(nomorLapak)}&statusQRIS=${statusQRIS}`, {
        method: "POST"
    })
        .then(() => {
            loadData();
            loadStatistik();
        });
}

/* ================= CHART ================= */

function renderChart(sudah, belum) {
    const ctx = document.getElementById("chartQRIS");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sudah QRIS", "Belum QRIS"],
            datasets: [{
                data: [sudah, belum]
            }]
        },
        options: {
            plugins: {
                legend: { position: "bottom" }
            }
        }
    });
}

/* ================= INIT ================= */

loadData();
loadStatistik();

// ===================================
// KONFIGURASI
// ===================================
const BASE_URL = "https://script.google.com/macros/s/AKfycby4z2qZ24SrJkcyGpybH29lSUC_3_z1LG-7wSmTzpaOEXrwjXf0Cl3hqkg95qAxPj1-/exec";

let chartQRIS = null;

// ===================================
// INIT
// ===================================
document.addEventListener("DOMContentLoaded", () => {
    loadDataQRIS();
    loadStatistikQRIS();
});

// ===================================
// STATISTIK & GRAFIK
// ===================================
function loadStatistikQRIS() {
    fetch(`${BASE_URL}?action=statistikQRIS`)
        .then(res => res.json())
        .then(drawChartQRIS)
        .catch(err => console.error("Statistik error:", err));
}

function drawChartQRIS(stat) {
    const ctx = document.getElementById("chartQRIS");

    if (chartQRIS) chartQRIS.destroy();

    chartQRIS = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Sudah QRIS", "Belum QRIS"],
            datasets: [{
                data: [stat.sudah, stat.belum]
            }]
        },
        options: {
            plugins: {
                legend: { position: "bottom" },
                title: {
                    display: true,
                    text: `Progress QRIS (${stat.totalPelapak} Pelapak)`
                }
            }
        }
    });
}

// ===================================
// LOAD DATA TABEL
// ===================================
function loadDataQRIS() {
    fetch(`${BASE_URL}?action=listQRIS`)
        .then(res => res.json())
        .then(res => {
            const tbody = document.getElementById("dataQRIS");
            tbody.innerHTML = "";

            res.data.forEach(d => {
                tbody.innerHTML += `
          <tr>
            <td>${d.no}</td>
            <td>${d.nama}</td>
            <td>
              <input id="lapak-${d.no}" value="${d.nomorLapak || ""}">
            </td>
            <td>
              <select id="qris-${d.no}">
                <option value="">-- Pilih --</option>
                <option ${d.statusQRIS === "Sudah" ? "selected" : ""}>Sudah</option>
                <option ${d.statusQRIS === "Belum" ? "selected" : ""}>Belum</option>
              </select>
            </td>
            <td>
              <button onclick="simpanQRIS(${d.no})">Simpan</button>
            </td>
          </tr>
        `;
            });
        })
        .catch(err => console.error("Load data error:", err));
}

// ===================================
// SIMPAN DATA
// ===================================
function simpanQRIS(no) {
    const params = new URLSearchParams();
    params.append("action", "updateQRISPelapak");
    params.append("no", no);
    params.append("nomorLapak", document.getElementById(`lapak-${no}`).value);
    params.append("statusQRIS", document.getElementById(`qris-${no}`).value);

    fetch(BASE_URL, {
        method: "POST",
        body: params
    })
        .then(res => res.json())
        .then(() => {
            loadDataQRIS();
            loadStatistikQRIS();
        })
        .catch(err => console.error("Simpan error:", err));
}

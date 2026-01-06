let chartQRIS = null;

// ================================
// LOAD DATA
// ================================
document.addEventListener("DOMContentLoaded", () => {
    loadDataQRIS();
    loadStatistikQRIS();
});

// ================================
// STATISTIK & GRAFIK
// ================================
function loadStatistikQRIS() {
    fetch("?action=statistikQRIS")
        .then(res => res.json())
        .then(drawChartQRIS);
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

// ================================
// LOAD TABLE DATA
// ================================
function loadDataQRIS() {
    fetch("?action=listQRIS")
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
        });
}

// ================================
// SIMPAN DATA
// ================================
function simpanQRIS(no) {
    const params = new URLSearchParams();
    params.append("action", "updateQRISPelapak");
    params.append("no", no);
    params.append("nomorLapak", document.getElementById(`lapak-${no}`).value);
    params.append("statusQRIS", document.getElementById(`qris-${no}`).value);

    fetch("", {
        method: "POST",
        body: params
    }).then(() => {
        loadDataQRIS();
        loadStatistikQRIS();
    });
}

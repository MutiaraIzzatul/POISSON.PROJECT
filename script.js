document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inputForm");
  const lambdaOut = document.getElementById("lambdaOut");
  const poissonOut = document.getElementById("poissonOut");
  const defectRateOut = document.getElementById("defectRateOut");
  const statTableBody = document.getElementById("statTableBody");
  const clearBtn = document.getElementById("clearData");

  const STORAGE_KEY = "defectData";
  let defectData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // fungsi factorial
  function factorial(n) {
    if (n === 0 || n === 1) return 1;
    let f = 1;
    for (let i = 2; i <= n; i++) f *= i;
    return f;
  }

  // fungsi poisson
  function poisson(k, lambda) {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
  }

  // format probabilitas
  function formatProb(p) {
    if (p === 0) return "0";
    if (p < 0.0001) return p.toExponential(4);
    return p.toFixed(4);
  }

  // render tabel statistik
  function renderTable() {
    if (!statTableBody) return;
    statTableBody.innerHTML = "";
    defectData.forEach((item, idx) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${idx + 1}</td>
        <td>${item.date}</td>
        <td>${item.unitTotal}</td>
        <td>${item.defectTotal}</td>
        <td>${item.unitPerBatch}</td>
        <td>${item.k}</td>
        <td>${item.lambda.toFixed(4)}</td>
        <td>${formatProb(item.pK)}</td>
        <td>${item.defectRate.toFixed(2)}%</td>
      `;
      statTableBody.appendChild(row);
    });
  }

  // event submit form
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const date = document.getElementById("date").value;
      const unitTotal = Number(document.getElementById("unitTotal").value);
      const defectTotal = Number(document.getElementById("defectTotal").value);
      const unitPerBatch = Number(document.getElementById("unitPerBatch").value);
      const k = Number(document.getElementById("kValue").value);

      const batchCount = Math.floor(unitTotal / unitPerBatch);
      const lambda = defectTotal / batchCount;
      const pK = poisson(k, lambda);
      const defectRate = (defectTotal / unitTotal) * 100;

      defectData.push({ date, unitTotal, defectTotal, unitPerBatch, k, lambda, pK, defectRate });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defectData));

      // langsung pindah ke halaman results
      window.location.href = "results.html";
    });
  }

  // tampilkan ringkasan di results
  if (lambdaOut && poissonOut && defectRateOut) {
    if (defectData.length > 0) {
      const last = defectData[defectData.length - 1];
      lambdaOut.textContent = last.lambda.toFixed(4);
      poissonOut.textContent = formatProb(last.pK);
      defectRateOut.textContent = last.defectRate.toFixed(2) + "%";
    }
  }

  // render tabel di results
  renderTable();

  // tombol hapus semua data
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      defectData = [];
      renderTable();
      if (lambdaOut) lambdaOut.textContent = "";
      if (poissonOut) poissonOut.textContent = "";
      if (defectRateOut) defectRateOut.textContent = "";
      alert("Data statistik berhasil dihapus!");
    });
  }

  const exportBtn = document.getElementById("exportExcel");

if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    if (defectData.length === 0) {
      alert("Tidak ada data untuk diexport!");
      return;
    }

    // Header CSV
    let csvContent =
      "Tanggal Produksi,Jumlah Unit,Jumlah Cacat,Unit per Batch,k,Lambda,Probabilitas Poisson,Defect Rate (%)\n";

    // Isi data
    defectData.forEach(item => {
      csvContent +=
        `${item.date},${item.unitTotal},${item.defectTotal},${item.unitPerBatch},${item.k},` +
        `${item.lambda.toFixed(4)},${formatProb(item.pK)},${item.defectRate.toFixed(2)}\n`;
    });

    // Buat file CSV
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    // Download otomatis
    const link = document.createElement("a");
    link.href = url;
    link.download = "data_cacat_produksi.csv";
    link.click();

    URL.revokeObjectURL(url);
  });
}

});

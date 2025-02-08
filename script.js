document.addEventListener("DOMContentLoaded", () => {
    const spinner = document.querySelector(".indicator");
    const resultDiv = document.getElementById("result");
    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");

    // ✅ Spinner tetap berputar saat idle (sebelum scan)
    spinner.classList.add("spinning");

    // ✅ Event saat tombol Scan ditekan
    scanButton.addEventListener("click", async () => {
        const tokenAddress = tokenInput.value.trim();
        if (!tokenAddress) {
            resultDiv.innerHTML = "<p>❌ Please enter a token address.</p>";
            return;
        }

        // Reset UI saat scanning dimulai
        resultDiv.innerHTML = "<p>🔍 Scanning...</p>";
        scanButton.disabled = true; // Hindari spam klik
        spinner.classList.add("scanning"); // Tambah efek scan

        try {
            console.log(`🔎 Fetching data for token: ${tokenAddress}`);

            // ✅ Pastikan fetch API menggunakan URL yang benar
            const response = await fetch(`https://micinscore.vercel.app/api/audit/${tokenAddress}`);

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log("📊 API Response:", data);

            // ✅ Pastikan API mengembalikan data yang valid
            if (!data || !data.audit || typeof data.audit.score === "undefined") {
                throw new Error("Invalid API response or missing data.");
            }

            // Ambil skor dari API
            const score = data.audit.score;
            let rotationAngle = 0;

            // ✅ Tentukan rotasi berdasarkan skor yang didapat
            if (score >= 76) {
                rotationAngle = 0; // Buy (atas)
            } else if (score >= 51) {
                rotationAngle = 270; // Potential (kanan)
            } else if (score >= 26) {
                rotationAngle = 180; // Sell (bawah)
            } else {
                rotationAngle = 90; // Looking (kiri)
            }

            // ✅ Jalankan animasi spinner
            spinner.classList.remove("spinning"); // Hentikan idle spin
            spinner.style.transition = "transform 2s ease-out";
            spinner.style.transform = `rotate(${rotationAngle}deg)`;

            // ✅ Tampilkan hasil scanning dengan lebih informatif
            let detailsHTML = `<h3>🔍 Token Audit Result</h3>`;
            detailsHTML += `<p><strong>Score:</strong> ${score}</p>`;
            detailsHTML += `<p><strong>Risk Level:</strong> ${data.audit.risk}</p>`;
            detailsHTML += `<ul>`;

            data.audit.details.forEach((detail) => {
                const icon = detail.deduction > 0 ? "❌" : "✅";
                detailsHTML += `<li>${icon} <strong>${detail.factor}:</strong> ${detail.status}</li>`;
            });

            detailsHTML += `</ul>`;
            resultDiv.innerHTML = detailsHTML;

        } catch (error) {
            console.error("🚨 Error fetching audit data:", error);
            resultDiv.innerHTML = `<p>❌ Error scanning token: ${error.message}</p>`;
        }

        // ✅ Aktifkan kembali tombol scan setelah selesai
        scanButton.disabled = false;
    });
});

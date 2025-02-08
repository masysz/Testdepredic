document.addEventListener("DOMContentLoaded", () => {
    const scanButton = document.getElementById("scanButton");
    const tokenInput = document.getElementById("tokenInput");
    const resultDiv = document.getElementById("result");
    const spinner = document.querySelector(".indicator");

    // ✅ Spinner harus selalu berputar saat website dibuka
    spinner.classList.add("spinning");

    scanButton.addEventListener("click", async () => {
        const tokenAddress = tokenInput.value.trim();
        if (!tokenAddress) {
            resultDiv.innerHTML = "<p>❌ Please enter a token address.</p>";
            return;
        }

        resultDiv.innerHTML = "<p>🔍 Scanning...</p>";
        scanButton.disabled = true;
        spinner.classList.add("scanning");

        try {
            console.log(`🔎 Fetching data for token: ${tokenAddress}`);
            const response = await fetch(`https://micinscore.vercel.app/api/audit/${tokenAddress}`);

            // ✅ Periksa apakah response dalam format JSON
            const contentType = response.headers.get("content-type");
            if (!response.ok || !contentType || !contentType.includes("application/json")) {
                throw new Error("Invalid API response format.");
            }

            const data = await response.json();
            console.log("📊 API Response:", data);

            if (!data || !data.audit || typeof data.audit.score === "undefined") {
                throw new Error("Invalid API response or missing data.");
            }

            const score = data.audit.score;
            let rotationAngle = 0;

            // ✅ Tentukan posisi jarum berdasarkan skor
            if (score >= 76) rotationAngle = 0; // Buy (Atas)
            else if (score >= 51) rotationAngle = 270; // Potential (Kanan)
            else if (score >= 26) rotationAngle = 180; // Hold (Bawah)
            else rotationAngle = 90; // Looking (Kiri)

            // ✅ Animasi Spinner
            spinner.classList.remove("spinning");
            spinner.style.transition = "transform 2s ease-out";
            spinner.style.transform = `rotate(${rotationAngle}deg)`;

            // ✅ Buat tampilan hasil parameter audit
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

        scanButton.disabled = false;
    });
});

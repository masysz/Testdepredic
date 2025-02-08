// Fungsi untuk mengambil data dari API dan mengontrol pergerakan jarum spinner
async function analyzeToken() {
    const contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Masukkan Contract Address!");
        return;
    }

    const apiUrl = `https://micinscore.vercel.app/api/audit/${contractAddress}`;
    try {
        console.log("Fetching API:", apiUrl);

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Parsed API Data:", data);

        if (!data || !data.audit || typeof data.audit.score === "undefined") {
            document.getElementById("result").innerHTML = "❌ Token tidak ditemukan! (Invalid API response)";
            return;
        }

        const score = data.audit.score;
        let finalRotation = 0;
        let category = "";
        let color = "";

        // **Tentukan rotasi berdasarkan score**
        if (score >= 76) {
            finalRotation = 0; // BUY (atas)
            category = "BUY 🟢";
            color = "#28a745";
        } else if (score >= 51) {
            finalRotation = -90; // POTENTIAL (kiri)
            category = "POTENTIAL 🟠";
            color = "#fd7e14";
        } else if (score >= 26) {
            finalRotation = 180; // SELL (bawah)
            category = "SELL 🔴";
            color = "#dc3545";
        } else {
            finalRotation = -270; // LOOKING (kanan)
            category = "LOOKING 🟡";
            color = "#ffc107";
        }

        // **Stop Idle Spin & Mulai Efek Scanning**
        document.querySelector(".indicator").classList.remove("spinning");

        // **Putar Cepat 2 Kali**
        document.querySelector(".indicator").style.transition = "transform 0.6s ease-in-out";
        document.querySelector(".indicator").style.transform = "rotate(720deg)"; // 2 putaran cepat
        await new Promise(resolve => setTimeout(resolve, 600));

        // **Putar Perlahan 1 Kali**
        document.querySelector(".indicator").style.transition = "transform 1.5s ease-out";
        document.querySelector(".indicator").style.transform = "rotate(1080deg)"; // 1 putaran perlahan
        await new Promise(resolve => setTimeout(resolve, 1500));

        // **Berhenti di Skor yang Sesuai**
        document.querySelector(".indicator").style.transition = "transform 1s ease-out";
        document.querySelector(".indicator").style.transform = `rotate(${finalRotation}deg)`;
        await new Promise(resolve => setTimeout(resolve, 1000));

        // **Tampilkan Hasil**
        document.getElementById("result").innerHTML = `<strong style="color:${color};">${category}</strong> (Score: ${score})`;

    } catch (error) {
        document.getElementById("result").innerHTML = `❌ Error: ${error.message}`;
        console.error("Error fetching API:", error);
    }
}

// **Fungsi untuk Idle Spin sebelum scanning dilakukan**
function startIdleSpin() {
    let indicator = document.querySelector(".indicator");
    if (indicator) {
        indicator.classList.add("spinning");
    }
}

// **Panggil fungsi Idle Spin saat halaman dimuat**
window.onload = startIdleSpin;

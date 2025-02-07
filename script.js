let spinning = true; // Status animasi idle
let indicator = document.querySelector(".indicator");

// **1️⃣ Animasi Jarum Berputar Saat Idle**
function startIdleSpin() {
    let angle = 0;
    setInterval(() => {
        if (spinning) {
            angle = (angle + 2) % 360; // Perputaran konstan
            indicator.style.transform = `rotate(${angle}deg)`;
        }
    }, 50); // Putaran lambat terus-menerus
}

// **2️⃣ Fungsi Scanning dengan Efek Berputar**
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

        if (score >= 76) {
            finalRotation = 0;
            category = "BUY 🟢";
            color = "#28a745";
        } else if (score >= 51) {
            finalRotation = -90;
            category = "POTENTIAL 🟠";
            color = "#fd7e14";
        } else if (score >= 26) {
            finalRotation = -180;
            category = "SELL 🔴";
            color = "#dc3545";
        } else {
            finalRotation = -270;
            category = "LOOKING 🟡";
            color = "#ffc107";
        }

        // **Stop Idle Spin & Mulai Efek Scanning**
        spinning = false;

        // **Putar Cepat 2 Kali**
        indicator.style.transition = "transform 0.6s ease-in-out";
        indicator.style.transform = "rotate(720deg)"; // 2 putaran cepat
        await new Promise(resolve => setTimeout(resolve, 600));

        // **Putar Perlahan 1 Kali**
        indicator.style.transition = "transform 1.5s ease-out";
        indicator.style.transform = "rotate(1080deg)"; // 1 putaran perlahan
        await new Promise(resolve => setTimeout(resolve, 1500));

        // **Berhenti di Skor yang Sesuai**
        indicator.style.transition = "transform 1s ease-out";
        indicator.style.transform = `rotate(${finalRotation}deg)`;
        await new Promise(resolve => setTimeout(resolve, 1000));

        // **Tampilkan Hasil**
        document.getElementById("result").innerHTML = `<strong style="color:${color};">${category}</strong> (Score: ${score})`;

    } catch (error) {
        document.getElementById("result").innerHTML = `❌ Error: ${error.message}`;
        console.error("Error fetching API:", error);
    }
}

// **Mulai Animasi Idle Saat Halaman Dibuka**
startIdleSpin();

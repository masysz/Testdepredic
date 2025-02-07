async function analyzeToken() {
    const contractAddress = document.getElementById("contractAddress").value.trim();
    if (!contractAddress) {
        alert("Masukkan Contract Address!");
        return;
    }

    // Panggil API DexPredictor
    const apiUrl = `https://micinscore.vercel.app/api/audit/${contractAddress}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || data.score === undefined) {
            document.getElementById("result").innerHTML = "❌ Token tidak ditemukan!";
            return;
        }

        // Tentukan derajat rotasi berdasarkan skor
        let rotation = 0;
        let category = "";
        let color = "";

        if (data.score >= 76) {
            rotation = 0;
            category = "BUY 🟢";
            color = "#28a745";
        } else if (data.score >= 51) {
            rotation = -90;
            category = "POTENTIAL 🟠";
            color = "#fd7e14";
        } else if (data.score >= 26) {
            rotation = -180;
            category = "SELL 🔴";
            color = "#dc3545";
        } else {
            rotation = -270;
            category = "LOOKING 🟡";
            color = "#ffc107";
        }

        // Putar spinner ke posisi yang sesuai
        document.querySelector(".spinner").style.transform = `rotate(${rotation}deg)`;

        // Tampilkan hasil dengan warna sesuai
        document.getElementById("result").innerHTML = `<strong style="color:${color};">${category}</strong> (Score: ${data.score})`;
        
    } catch (error) {
        document.getElementById("result").innerHTML = "❌ Error mengambil data!";
        console.error("Error fetching data:", error);
    }
}

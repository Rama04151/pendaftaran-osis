exports.handler = async function(event) {

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                message: "Method tidak diizinkan."
            })
        };
    }

    try {

        const data = JSON.parse(event.body);

        const {
            namaKetua,
            kelasKetua,
            waKetua,
            namaWakil,
            kelasWakil,
            waWakil,
            pernyataan
        } = data;

        if (
            !namaKetua ||
            !kelasKetua ||
            !waKetua ||
            !namaWakil ||
            !kelasWakil ||
            !waWakil ||
            !pernyataan
        ) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Semua data wajib diisi."
                })
            };
        }

        const pesan = `
<b>📋 PENDAFTARAN PASANGAN CALON OSIS</b>

<b>SMAN 3 TEBAS</b>
Tahun Pelajaran 2026/2027

━━━━━━━━━━━━━━━━━━

<b>👤 KETUA OSIS</b>

Nama:
${escapeHTML(namaKetua)}

Kelas:
${escapeHTML(kelasKetua)}

WhatsApp:
${escapeHTML(waKetua)}

━━━━━━━━━━━━━━━━━━

<b>👥 WAKIL KETUA OSIS</b>

Nama:
${escapeHTML(namaWakil)}

Kelas:
${escapeHTML(kelasWakil)}

WhatsApp:
${escapeHTML(waWakil)}

━━━━━━━━━━━━━━━━━━

<b>📝 PERNYATAAN KESEDIAAN</b>

${escapeHTML(pernyataan)}

━━━━━━━━━━━━━━━━━━

<b>🕐 Waktu Pendaftaran</b>
${new Date().toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta"
})}

<b>📌 Status:</b> Pendaftaran diterima
`;

        const token = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!token || !chatId) {
            throw new Error(
                "Environment variable Telegram belum diatur."
            );
        }

        const telegramURL =
            `https://api.telegram.org/bot${token}/sendMessage`;

        const response = await fetch(telegramURL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                chat_id: chatId,
                text: pesan,
                parse_mode: "HTML"
            })
        });

        const telegramResult = await response.json();

        if (!telegramResult.ok) {

            throw new Error(
                telegramResult.description ||
                "Gagal mengirim ke Telegram."
            );

        }

        return {
            statusCode: 200,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                success: true,
                message: "Pendaftaran berhasil dikirim."
            })
        };

    } catch (error) {

        console.error(error);

        return {
            statusCode: 500,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                success: false,
                message: "Terjadi kesalahan pada server."
            })
        };
    }
};


function escapeHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
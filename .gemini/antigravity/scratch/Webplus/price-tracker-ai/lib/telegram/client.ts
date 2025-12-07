
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export async function sendTelegramMessage(text: string, chatId?: string): Promise<boolean> {
    const token = TELEGRAM_BOT_TOKEN;
    const targetChatId = chatId || TELEGRAM_CHAT_ID;

    if (!token) {
        console.error("Telegram Error: TELEGRAM_BOT_TOKEN is missing");
        return false;
    }

    if (!targetChatId) {
        console.error("Telegram Error: TELEGRAM_CHAT_ID is missing and no chatId provided");
        return false;
    }

    try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: targetChatId,
                text: text,
                parse_mode: 'Markdown', // Optional: allows bold/italic
            }),
        });

        const data = await response.json();

        if (!data.ok) {
            console.error("Telegram API Error:", data);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Telegram Send Error:", error);
        return false;
    }
}

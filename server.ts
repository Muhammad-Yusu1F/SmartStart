import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const DATA_FILE = path.resolve(__dirname, 'data', 'certificates.json');
const APPS_FILE = path.resolve(__dirname, 'data', 'applications.json');
const BOT_CONFIG_FILE = path.resolve(__dirname, 'data', 'bot_config.json');
const BOT_SESSIONS_FILE = path.resolve(__dirname, 'data', 'bot_sessions.json');

export interface AdmissionApplication {
  id: string;
  parentName: string;
  studentName: string;
  phone: string;
  grade: string;
  notes?: string;
  createdAt: string;
  status: 'yangi' | 'boglanildi' | 'qabul_qilindi' | 'rad_etildi';
}

export interface BotConfig {
  botToken: string;
  chatId: string;
  botEnabled: boolean;
  botUsername?: string;
}

// Interface matching CertificateItem
export interface CertificateItem {
  id: number;
  name: string;
  grade: number;
  type: 'IELTS' | 'CEFR' | 'SAT' | 'Olimpiada';
  score: string;
  subScores?: {
    listening?: string;
    reading?: string;
    writing?: string;
    speaking?: string;
    math?: string;
    ebrw?: string;
  };
  subject?: string;
  level?: 'tuman' | 'shahar' | 'viloyat' | 'respublika';
  year: number;
  date?: string;
  consent: boolean;
  featured: boolean;
  fileName?: string;
  imagePath?: string;
  certNumber?: string;
  teacher?: string;
  isNew?: boolean;
}

// Fallback seed certificates
const DEFAULT_SEED: CertificateItem[] = [
  {
    id: 101,
    name: 'Muhammadzoxir Abdusattarov',
    grade: 10,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '56', reading: '54', writing: '52', speaking: '61' },
    year: 2024,
    date: '11.03.2024',
    consent: true,
    featured: true,
    certNumber: '24BBA1141177AM',
    imagePath: '/assets/aistudio/image_3702dd0d.png',
    teacher: 'Ms. Dilnoza Rahimova',
    isNew: true
  },
  {
    id: 102,
    name: 'Zarnigor Rustamjonova',
    grade: 11,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '60', reading: '49', writing: '50', speaking: '51' },
    year: 2024,
    date: '20.06.2024',
    consent: true,
    featured: true,
    certNumber: '24BBA1219483RZ',
    imagePath: '/assets/aistudio/image_9856351e.png',
    teacher: 'Mr. John Miller',
    isNew: true
  },
  {
    id: 103,
    name: 'Dinara Boborahmatova',
    grade: 11,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '62', reading: '62', writing: '61', speaking: '49' },
    year: 2024,
    date: '11.03.2024',
    consent: true,
    featured: true,
    certNumber: '24BBA1141879BD',
    imagePath: '/assets/aistudio/image_7143507e.png',
    teacher: 'Ms. Malika Azizova',
    isNew: true
  },
  {
    id: 104,
    name: 'Azamat Turdialiyev',
    grade: 9,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '68', reading: '56', writing: '47', speaking: '43' },
    year: 2024,
    date: '02.10.2024',
    consent: true,
    featured: true,
    certNumber: '26BBA1880194TA',
    imagePath: '/assets/aistudio/image_4440ff14.png',
    teacher: 'Mr. Alisher Saidov',
    isNew: true
  },
  {
    id: 105,
    name: 'Ozodbek Ziyadullayev',
    grade: 10,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '60', reading: '51', writing: '45', speaking: '46' },
    year: 2024,
    date: '02.10.2024',
    consent: true,
    featured: true,
    certNumber: '26BBA1889063ZO',
    imagePath: '/assets/aistudio/image_ddf99ba4.png',
    teacher: 'Dr. Rustam Karimov',
    isNew: true
  },
  {
    id: 16,
    name: 'asad begimov',
    grade: 10,
    type: 'CEFR',
    score: 'C1',
    subScores: { listening: '68', reading: '70', writing: '65', speaking: '71' },
    year: 2026,
    date: 'Fevral, 2026',
    consent: true,
    featured: true,
    certNumber: 'SS-2026-16',
    fileName: 'asad_begimov_cefr.jpg',
    teacher: 'Mr. Alisher Saidov',
    isNew: true
  },
  {
    id: 1,
    name: 'Aziza Karimova',
    grade: 11,
    type: 'IELTS',
    score: '8.0',
    subScores: { listening: '8.5', reading: '8.5', writing: '7.5', speaking: '7.5' },
    year: 2026,
    date: 'Yanvar, 2026',
    consent: true,
    featured: true,
    certNumber: 'IELTS-26UZ00842AK',
    fileName: 'aziza_karimova_ielts8.jpg',
    teacher: 'Mr. John Miller'
  },
  {
    id: 2,
    name: 'Jasur Toshmatov',
    grade: 10,
    type: 'IELTS',
    score: '7.5',
    subScores: { listening: '8.0', reading: '8.0', writing: '7.0', speaking: '7.0' },
    year: 2026,
    date: 'Fevral, 2026',
    consent: true,
    featured: true,
    certNumber: 'IELTS-26UZ00913JT',
    fileName: 'jasur_toshmatov_ielts75.jpg',
    teacher: 'Ms. Dilnoza Rahimova'
  },
  {
    id: 3,
    name: 'Madina Rahimova',
    grade: 9,
    type: 'CEFR',
    score: 'C1',
    subScores: { listening: '68', reading: '71', writing: '65', speaking: '72' },
    year: 2026,
    date: 'Fevral, 2026',
    consent: true,
    featured: true,
    certNumber: 'CEFR-2026-9041MR',
    fileName: 'madina_rahimova_cefrc1.jpg',
    teacher: 'Mr. Alisher Saidov'
  },
  {
    id: 4,
    name: 'Sardor Aliyev',
    grade: 11,
    type: 'SAT',
    score: '1450',
    subScores: { math: '780', ebrw: '670' },
    year: 2025,
    date: 'Noyabr, 2025',
    consent: true,
    featured: true,
    certNumber: 'SAT-2025-1450SA',
    fileName: 'sardor_aliyev_sat1450.jpg',
    teacher: 'Dr. Rustam Karimov'
  },
  {
    id: 5,
    name: 'Dilnoza Usmonova',
    grade: 8,
    type: 'Olimpiada',
    score: '1',
    subject: 'Matematika',
    level: 'viloyat',
    year: 2026,
    date: 'Yanvar, 2026',
    consent: false,
    featured: true,
    certNumber: 'OLIMP-2026-MATH01',
    fileName: 'dilnoza_olimpiada_1urin.jpg',
    teacher: 'Olimpiada murabbiyi'
  },
  {
    id: 6,
    name: 'Bekzod Ergashev',
    grade: 7,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '58', reading: '62', writing: '55', speaking: '60' },
    year: 2026,
    date: 'Yanvar, 2026',
    consent: true,
    featured: false,
    certNumber: 'CEFR-2026-8812BE',
    fileName: 'bekzod_ergashev_cefrb2.jpg',
    teacher: 'Ms. Dilnoza Rahimova'
  },
  {
    id: 7,
    name: 'Kamola Yusupova',
    grade: 10,
    type: 'IELTS',
    score: '7.0',
    subScores: { listening: '7.5', reading: '7.0', writing: '6.5', speaking: '7.0' },
    year: 2025,
    date: 'Dekabr, 2025',
    consent: true,
    featured: true,
    certNumber: 'IELTS-25UZ00774KY',
    fileName: 'kamola_yusupova_ielts7.jpg',
    teacher: 'Mr. John Miller'
  },
  {
    id: 8,
    name: 'Otabek Nazarov',
    grade: 9,
    type: 'Olimpiada',
    score: '2',
    subject: 'Ingliz tili',
    level: 'shahar',
    year: 2025,
    date: 'Oktyabr, 2025',
    consent: true,
    featured: false,
    certNumber: 'OLIMP-2025-ENG02',
    fileName: 'otabek_olimpiada_eng.jpg',
    teacher: 'Ms. Malika Azizova'
  },
  {
    id: 9,
    name: 'Nilufar Saidova',
    grade: 11,
    type: 'SAT',
    score: '1380',
    subScores: { math: '740', ebrw: '640' },
    year: 2026,
    date: 'Fevral, 2026',
    consent: true,
    featured: true,
    certNumber: 'SAT-2026-1380NS',
    fileName: 'nilufar_saidova_sat1380.jpg',
    teacher: 'Dr. Rustam Karimov'
  },
  {
    id: 10,
    name: 'Shohruh Qodirov',
    grade: 10,
    type: 'IELTS',
    score: '6.5',
    subScores: { listening: '7.0', reading: '6.5', writing: '6.0', speaking: '6.5' },
    year: 2024,
    date: 'Noyabr, 2024',
    consent: false,
    featured: false,
    certNumber: 'IELTS-24UZ00551SQ',
    fileName: 'shohruh_qodirov_ielts65.jpg',
    teacher: 'Mr. Alisher Saidov'
  },
  {
    id: 11,
    name: 'Malika Abdullayeva',
    grade: 8,
    type: 'CEFR',
    score: 'B2',
    subScores: { listening: '56', reading: '59', writing: '54', speaking: '58' },
    year: 2025,
    date: 'Sentyabr, 2025',
    consent: true,
    featured: false,
    certNumber: 'CEFR-2025-7721MA',
    fileName: 'malika_cefr_b2.jpg',
    teacher: 'Ms. Dilnoza Rahimova'
  },
  {
    id: 12,
    name: 'Jamshid Murodov',
    grade: 11,
    type: 'IELTS',
    score: '7.5',
    subScores: { listening: '8.0', reading: '8.0', writing: '7.0', speaking: '7.0' },
    year: 2024,
    date: 'Avgust, 2024',
    consent: true,
    featured: true,
    certNumber: 'IELTS-24UZ00412JM',
    fileName: 'jamshid_murodov_ielts75.jpg',
    teacher: 'Mr. John Miller'
  },
  {
    id: 13,
    name: 'Zarina Holmatova',
    grade: 9,
    type: 'Olimpiada',
    score: '1',
    subject: 'Kimyo',
    level: 'tuman',
    year: 2024,
    date: 'Dekabr, 2024',
    consent: true,
    featured: false,
    certNumber: 'OLIMP-2024-CHEM01',
    fileName: 'zarina_olimpiada_chem.jpg',
    teacher: 'Ustoz Nodira Karimova'
  },
  {
    id: 14,
    name: 'Akmal Rustamov',
    grade: 11,
    type: 'SAT',
    score: '1290',
    subScores: { math: '690', ebrw: '600' },
    year: 2024,
    date: 'Oktyabr, 2024',
    consent: true,
    featured: false,
    certNumber: 'SAT-2024-1290AR',
    fileName: 'akmal_rustamov_sat1290.jpg',
    teacher: 'Dr. Rustam Karimov'
  },
  {
    id: 15,
    name: 'Sevara Ismoilova',
    grade: 10,
    type: 'CEFR',
    score: 'C1',
    subScores: { listening: '66', reading: '68', writing: '62', speaking: '70' },
    year: 2023,
    date: 'Dekabr, 2023',
    consent: true,
    featured: false,
    certNumber: 'CEFR-2023-5590SI',
    fileName: 'sevara_cefr_c1.jpg',
    teacher: 'Mr. Alisher Saidov'
  }
];

function readCertificates(): CertificateItem[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.error('Error reading certificates from disk:', err);
  }
  // If missing or corrupt, save and return default seed
  writeCertificates(DEFAULT_SEED);
  return DEFAULT_SEED;
}

function writeCertificates(certs: CertificateItem[]): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(certs, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing certificates to disk:', err);
  }
}

function readApplications(): AdmissionApplication[] {
  try {
    if (fs.existsSync(APPS_FILE)) {
      const content = fs.readFileSync(APPS_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data)) return data;
    }
  } catch (err) {
    console.error('Error reading applications file:', err);
  }
  return [];
}

function writeApplications(apps: AdmissionApplication[]): void {
  try {
    const dir = path.dirname(APPS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(APPS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing applications file:', err);
  }
}

function readBotConfig(): BotConfig {
  try {
    if (fs.existsSync(BOT_CONFIG_FILE)) {
      const content = fs.readFileSync(BOT_CONFIG_FILE, 'utf-8');
      const data = JSON.parse(content);
      return {
        botToken: data.botToken || process.env.TELEGRAM_BOT_TOKEN || '',
        chatId: data.chatId || cachedChatId || process.env.TELEGRAM_CHAT_ID || '',
        botEnabled: data.botEnabled !== false,
        botUsername: data.botUsername || ''
      };
    }
  } catch (err) {
    console.error('Error reading bot config:', err);
  }
  return {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
    chatId: cachedChatId || process.env.TELEGRAM_CHAT_ID || '',
    botEnabled: true,
    botUsername: ''
  };
}

function writeBotConfig(cfg: BotConfig): void {
  try {
    const dir = path.dirname(BOT_CONFIG_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BOT_CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing bot config:', err);
  }
}

let cachedChatId = '';

function readBotSessions(): { authenticatedChats: string[] } {
  try {
    if (fs.existsSync(BOT_SESSIONS_FILE)) {
      const parsed = JSON.parse(fs.readFileSync(BOT_SESSIONS_FILE, 'utf-8'));
      if (Array.isArray(parsed.authenticatedChats)) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return { authenticatedChats: [] };
}

function writeBotSessions(sessions: { authenticatedChats: string[] }) {
  try {
    const dir = path.dirname(BOT_SESSIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BOT_SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing bot sessions:', e);
  }
}

function isChatAuthenticated(chatId: string): boolean {
  const sessions = readBotSessions();
  return sessions.authenticatedChats.includes(String(chatId));
}

function authenticateChat(chatId: string) {
  const sessions = readBotSessions();
  const idStr = String(chatId);
  if (!sessions.authenticatedChats.includes(idStr)) {
    sessions.authenticatedChats.push(idStr);
    writeBotSessions(sessions);
  }
  // Also register in bot_config.json so website applications are sent to this admin
  const cfg = readBotConfig();
  const currentList = (cfg.chatId || '')
    .split(/[,;\n\r]+/)
    .map((c) => c.trim())
    .filter(Boolean);
  if (!currentList.includes(idStr)) {
    currentList.push(idStr);
    cfg.chatId = currentList.join(', ');
    cachedChatId = cfg.chatId;
    writeBotConfig(cfg);
  }
}

function deauthenticateChat(chatId: string) {
  const sessions = readBotSessions();
  const idStr = String(chatId);
  sessions.authenticatedChats = sessions.authenticatedChats.filter((id) => id !== idStr);
  writeBotSessions(sessions);
}

// Memory states for conversations (login steps, search queries)
const chatLoginStates: Record<
  string,
  { step: 'waiting_login' | 'waiting_password' | 'waiting_search'; tempLogin?: string }
> = {};

// Keyboards
const guestKeyboard = {
  keyboard: [
    [{ text: '🔐 Admin panelga kirish' }],
    [{ text: 'ℹ️ Maktab haqida' }]
  ],
  resize_keyboard: true
};

const cancelKeyboard = {
  keyboard: [
    [{ text: '❌ Bekor qilish' }]
  ],
  resize_keyboard: true
};

const adminKeyboard = {
  keyboard: [
    [{ text: "📋 Arizalarni ko'rish" }, { text: '📊 Statistika' }],
    [{ text: '🟡 Yangi arizalar' }, { text: '🔍 Qidirish' }],
    [{ text: '🚪 Admin paneldan chiqish' }]
  ],
  resize_keyboard: true
};

async function answerCallbackQuery(token: string, callbackQueryId: string, text: string, showAlert = false) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert
      })
    });
  } catch (e) {
    // ignore
  }
}

async function editTelegramMessage(token: string, chatId: string, messageId: number, text: string, replyMarkup?: any) {
  try {
    const payload: any = {
      chat_id: chatId,
      message_id: messageId,
      text,
      parse_mode: 'HTML'
    };
    if (replyMarkup) {
      payload.reply_markup = replyMarkup;
    }
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // ignore
  }
}

async function sendTelegramMessage(token: string, chatId: string, text: string, replyMarkup?: any) {
  if (!token || !chatId) {
    return { success: false, reason: 'missing_credentials' };
  }
  const chatIds = chatId
    .split(/[,;\n\r]+/)
    .map((c) => c.trim())
    .filter(Boolean);

  if (chatIds.length === 0) {
    return { success: false, reason: 'missing_chat_id' };
  }

  let atLeastOneSuccess = false;
  let lastData: any = null;
  let lastError: any = null;

  for (const cid of chatIds) {
    try {
      const payload: any = {
        chat_id: cid,
        text,
        parse_mode: 'HTML'
      };
      if (replyMarkup) {
        payload.reply_markup = replyMarkup;
      }
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (response.ok && result.ok) {
        atLeastOneSuccess = true;
        lastData = result;
        console.log(`[Telegram Bot] ✅ Xabar muvaffaqiyatli yuborildi: chat ${cid}`);
      } else {
        lastError = result;
        const desc = (result && result.description) || '';
        console.warn(`[Telegram Bot] ⚠️ Xabar yuborishda xatolik (${cid}): ${desc}`);
      }
    } catch (err: any) {
      console.error(`[Telegram Bot] ❌ Xatolik (${cid}):`, err.message);
      lastError = err.message;
    }
  }

  return { success: atLeastOneSuccess, data: lastData, error: lastError };
}

let lastTelegramUpdateId = 0;
async function pollTelegramUpdates(): Promise<{ newChats: string[]; totalUpdates: number }> {
  const cfg = readBotConfig();
  if (!cfg.botToken) return { newChats: [], totalUpdates: 0 };

  const newDetectedChats: string[] = [];

  try {
    const url = `https://api.telegram.org/bot${cfg.botToken}/getUpdates?offset=${lastTelegramUpdateId + 1}&limit=20&timeout=5`;
    const res = await fetch(url);
    if (!res.ok) return { newChats: [], totalUpdates: 0 };
    const data = await res.json();

    if (data.ok && Array.isArray(data.result) && data.result.length > 0) {
      for (const update of data.result) {
        if (update.update_id > lastTelegramUpdateId) {
          lastTelegramUpdateId = update.update_id;
        }

        // 1. Handle Inline Callback Queries (Action buttons clicked in Telegram)
        if (update.callback_query) {
          const cb = update.callback_query;
          const cbChatId = String(cb.message?.chat?.id || cb.from?.id);
          const isAuth = isChatAuthenticated(cbChatId);

          if (!isAuth) {
            await answerCallbackQuery(cfg.botToken, cb.id, "🔒 Avval admin sifatida kiring: /login", true);
            continue;
          }

          const actionData = String(cb.data || '');
          if (actionData.startsWith('status:')) {
            const parts = actionData.split(':');
            const newStatus = parts[1] as AdmissionApplication['status'];
            const appId = parts[2];

            const apps = readApplications();
            const targetApp = apps.find((a) => a.id === appId);

            if (targetApp) {
              targetApp.status = newStatus;
              writeApplications(apps);

              const statusBadge =
                newStatus === 'qabul_qilindi'
                  ? '🟢 Qabul qilindi'
                  : newStatus === 'boglanildi'
                  ? "🔵 Bog'lanildi"
                  : '🟡 Yangi';

              await answerCallbackQuery(cfg.botToken, cb.id, `✅ Holat yangilandi: ${statusBadge}`);

              if (cb.message) {
                const currentText = cb.message.text || '';
                const updatedText =
                  `🔔 <b>QABUL ARIZASI: ${targetApp.studentName}</b>\n` +
                  `🏫 <b>Smart Start Xususiy Maktabi</b>\n\n` +
                  `👤 <b>Ota-ona:</b> ${targetApp.parentName}\n` +
                  `🎓 <b>O'quvchi:</b> ${targetApp.studentName}\n` +
                  `📞 <b>Telefon:</b> ${targetApp.phone}\n` +
                  `🏫 <b>Sinf:</b> ${targetApp.grade}-sinf\n` +
                  `📝 <b>Izoh:</b> ${targetApp.notes || "Yo'q"}\n` +
                  `📅 <b>Vaqt:</b> ${targetApp.createdAt}\n` +
                  `🆔 <b>Ariza raqami:</b> <code>${targetApp.id}</code>\n\n` +
                  `📌 <b>Yangilangan holat:</b> ${statusBadge}`;

                await editTelegramMessage(cfg.botToken, cbChatId, cb.message.message_id, updatedText);
              }
            } else {
              await answerCallbackQuery(cfg.botToken, cb.id, '❌ Ariza topilmadi');
            }
          }
          continue;
        }

        // 2. Handle Messages
        const msg = update.message || update.channel_post;
        if (!msg || !msg.chat) continue;

        const currentChatId = String(msg.chat.id);
        const senderTitle =
          msg.chat.title ||
          (msg.from
            ? `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim() ||
              msg.from.username ||
              'Foydalanuvchi'
            : 'Foydalanuvchi');

        const textTrim = (msg.text || '').trim();
        const textLower = textTrim.toLowerCase();
        const isAuth = isChatAuthenticated(currentChatId);
        const userState = chatLoginStates[currentChatId];

        // Global: Cancel command
        if (textTrim === '❌ Bekor qilish' || textLower === '/cancel') {
          delete chatLoginStates[currentChatId];
          await sendTelegramMessage(
            cfg.botToken,
            currentChatId,
            `❌ <b>Jarayon bekor qilindi.</b>`,
            isAuth ? adminKeyboard : guestKeyboard
          );
          continue;
        }

        // Global: Logout command
        if (textTrim === '🚪 Admin paneldan chiqish' || textTrim === '🚪 Chiqish' || textLower === '/logout') {
          deauthenticateChat(currentChatId);
          delete chatLoginStates[currentChatId];
          await sendTelegramMessage(
            cfg.botToken,
            currentChatId,
            `🚪 <b>Admin paneldan muvaffaqiyatli chiqdingiz.</b>\n\n` +
            `Qaytadan kirish uchun pastdagi <b>🔐 Admin panelga kirish</b> tugmasini bosing yoki <code>/login</code> buyrug'ini bering.`,
            guestKeyboard
          );
          continue;
        }

        // ================= UNAUTHENTICATED STATE =================
        if (!isAuth) {
          // A) Waiting for Admin Login
          if (userState?.step === 'waiting_login') {
            if (textLower === 'smartstart') {
              chatLoginStates[currentChatId] = {
                step: 'waiting_password',
                tempLogin: 'smartstart'
              };
              await sendTelegramMessage(
                cfg.botToken,
                currentChatId,
                `✅ <b>Login to'g'ri (smartstart).</b>\n\n` +
                `🔑 Endi <b>Admin Paroli</b>ni kiriting:\n<i>(yashirin parol)</i>`,
                cancelKeyboard
              );
            } else {
              await sendTelegramMessage(
                cfg.botToken,
                currentChatId,
                `❌ <b>Login noto'g'ri!</b>\n\n` +
                `Iltimos, to'g'ri admin loginini kiriting yoki <b>❌ Bekor qilish</b> tugmasini bosing:`,
                cancelKeyboard
              );
            }
            continue;
          }

          // B) Waiting for Admin Password
          if (userState?.step === 'waiting_password') {
            if (textTrim === 'smartschool') {
              authenticateChat(currentChatId);
              delete chatLoginStates[currentChatId];
              newDetectedChats.push(currentChatId);

              await sendTelegramMessage(
                cfg.botToken,
                currentChatId,
                `🎉 <b>Xush kelibsiz, Hurmatli Admin!</b>\n\n` +
                `✅ <b>Smart Start Xususiy Maktabi</b> Admin paneliga muvaffaqiyatli kirdingiz!\n\n` +
                `📋 <b>Sizning imkoniyatlaringiz:</b>\n` +
                `• Saytdan tushgan barcha qabul arizalarini ko'rish\n` +
                `• Real vaqt statistikasini tahlil qilish\n` +
                `• O'quvchilar va ota-onalarni ismi/telefoni orqali qidirish\n` +
                `• Yangi arizalar kelganda darhol shu yerda bildirishnoma olish\n\n` +
                `👇 Kerakli bo'limni tanlang:`,
                adminKeyboard
              );
            } else {
              await sendTelegramMessage(
                cfg.botToken,
                currentChatId,
                `❌ <b>Parol noto'g'ri!</b>\n\n` +
                `Iltimos, to'g'ri parolni kiriting yoki <b>❌ Bekor qilish</b> tugmasini bosing:`,
                cancelKeyboard
              );
            }
            continue;
          }

          // C) One-line login command support: "/login smartstart smartschool" or "smartstart smartschool"
          if (
            (textLower.includes('smartstart') && textLower.includes('smartschool')) ||
            textLower === '/login smartstart smartschool'
          ) {
            authenticateChat(currentChatId);
            delete chatLoginStates[currentChatId];
            newDetectedChats.push(currentChatId);

            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🎉 <b>Xush kelibsiz, Hurmatli Admin!</b>\n\n` +
              `✅ <b>Smart Start Xususiy Maktabi</b> Admin paneliga muvaffaqiyatli kirdingiz!\n\n` +
              `👇 Kerakli bo'limni tanlang:`,
              adminKeyboard
            );
            continue;
          }

          // D) Request to start login process
          if (textTrim === '🔐 Admin panelga kirish' || textLower === '/login') {
            chatLoginStates[currentChatId] = { step: 'waiting_login' };
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🔐 <b>Smart Start — Admin Panelga Kirish</b>\n\n` +
              `👤 Iltimos, <b>Admin Login</b>ni yozing:`,
              cancelKeyboard
            );
            continue;
          }

          // E) Start greeting for non-authenticated user
          if (textLower === '/start' || textLower.startsWith('/start')) {
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🎓 <b>Assalomu alaykum, ${senderTitle}!</b>\n\n` +
              `🏫 <b>Smart Start Xususiy Maktabi — Qabul Boti</b>ga xush kelibsiz.\n\n` +
              `🔒 <b>Admin Panel:</b> Saytdan tushgan qabul arizalari va statistika maktab ma'muriyati uchun yopiq.\n\n` +
              `Arizalar bazasini ko'rish uchun avval tizimga kiring:\n` +
              `👉 Pastdagi <b>🔐 Admin panelga kirish</b> tugmasini bosing:`,
              guestKeyboard
            );
            continue;
          }

          // F) About school
          if (textTrim === 'ℹ️ Maktab haqida' || textLower === '/haqida') {
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🏫 <b>Smart Start Xususiy Maktabi</b>\n\n` +
              `📍 <b>Manzil:</b> Toshkent sh., Yakkasaroy t., Bobur ko'chasi 45-uy\n` +
              `📞 <b>Telefon:</b> +998 (71) 205-00-55\n` +
              `🌐 <b>Rasmiy sayt:</b> https://smartstart.uz\n\n` +
              `🔒 <i>Admin panelga kirish uchun: /login</i>`,
              guestKeyboard
            );
            continue;
          }

          // G) Any other command attempted without authentication
          await sendTelegramMessage(
            cfg.botToken,
            currentChatId,
            `🔒 <b>Kirish taqiqlangan!</b>\n\n` +
            `Arizalar va statistikani ko'rish uchun avval admin tizimiga kirishingiz kerak.\n\n` +
            `👉 Kirish uchun pastdagi <b>🔐 Admin panelga kirish</b> tugmasini bosing yoki <code>/login</code> deb yozing.`,
            guestKeyboard
          );
          continue;
        }

        // ================= AUTHENTICATED ADMIN ACTIONS =================

        // 1. /start when already authenticated
        if (textLower === '/start' || textLower.startsWith('/start')) {
          await sendTelegramMessage(
            cfg.botToken,
            currentChatId,
            `🎓 <b>Assalomu alaykum, Hurmatli Admin (${senderTitle})!</b>\n\n` +
            `✅ Siz <b>Smart Start Admin Paneli</b>dasiz.\n\n` +
            `Barcha arizalar va statistika siz uchun ochiq. Quyidagi bo'limlardan birini tanlang:`,
            adminKeyboard
          );
          continue;
        }

        // 2. View All Applications
        if (
          textTrim === "📋 Arizalarni ko'rish" ||
          textTrim === "📋 So'nggi arizalar" ||
          textLower === '/arizalar'
        ) {
          const apps = readApplications();
          if (apps.length === 0) {
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `📭 Hozircha bazada qabul arizalari yo'q.`,
              adminKeyboard
            );
          } else {
            const recent = apps.slice(0, 8);
            let msgText = `📋 <b>QABUL ARIZALARI (Jami: ${apps.length} ta):</b>\n\n`;
            recent.forEach((a, idx) => {
              const statusBadge =
                a.status === 'yangi'
                  ? '🟡 Yangi'
                  : a.status === 'qabul_qilindi'
                  ? '🟢 Qabul qilindi'
                  : "🔵 Bog'lanildi";
              msgText +=
                `<b>${idx + 1}. ${a.studentName}</b> (${a.grade}-sinf)\n` +
                `👤 Ota-ona: ${a.parentName}\n` +
                `📞 Tel: <code>${a.phone}</code>\n` +
                `📝 Izoh: ${a.notes || "Yo'q"}\n` +
                `📅 Vaqt: ${a.createdAt}\n` +
                `📌 Holat: ${statusBadge}\n` +
                `🆔 Kod: <code>${a.id}</code>\n` +
                `──────────────────\n`;
            });
            if (apps.length > 8) {
              msgText += `<i>(Qolgan ${apps.length - 8} ta arizani sayt admin panelida ko'rishingiz mumkin)</i>`;
            }
            await sendTelegramMessage(cfg.botToken, currentChatId, msgText, adminKeyboard);
          }
          continue;
        }

        // 3. View Only New Applications
        if (textTrim === '🟡 Yangi arizalar' || textLower === '/yangi') {
          const apps = readApplications();
          const newApps = apps.filter((a) => a.status === 'yangi');
          if (newApps.length === 0) {
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🎉 <b>Barcha arizalar ko'rib chiqilgan!</b>\n\nHozircha yangi (ko'rilmagan) ariza mavjud emas.`,
              adminKeyboard
            );
          } else {
            let msgText = `🟡 <b>KO'RILMAGAN YANGI ARIZALAR (${newApps.length} ta):</b>\n\n`;
            newApps.slice(0, 10).forEach((a, idx) => {
              msgText +=
                `<b>${idx + 1}. ${a.studentName}</b> (${a.grade}-sinf)\n` +
                `👤 Ota-ona: ${a.parentName}\n` +
                `📞 Tel: <code>${a.phone}</code>\n` +
                `📝 Izoh: ${a.notes || "Yo'q"}\n` +
                `📅 Sana: ${a.createdAt}\n` +
                `🆔 Kod: <code>${a.id}</code>\n` +
                `──────────────────\n`;
            });
            await sendTelegramMessage(cfg.botToken, currentChatId, msgText, adminKeyboard);
          }
          continue;
        }

        // 4. Statistics
        if (textTrim === '📊 Statistika' || textLower === '/statistika' || textLower === '/stat') {
          const apps = readApplications();
          const total = apps.length;
          const yangi = apps.filter((a) => a.status === 'yangi').length;
          const boglanildi = apps.filter((a) => a.status === 'boglanildi').length;
          const qabul = apps.filter((a) => a.status === 'qabul_qilindi').length;

          const gradeCounts: Record<string, number> = {};
          apps.forEach((a) => {
            const g = a.grade || "Noma'lum";
            gradeCounts[g] = (gradeCounts[g] || 0) + 1;
          });

          let gradeStats = '';
          Object.keys(gradeCounts)
            .sort((a, b) => (parseInt(a, 10) || 0) - (parseInt(b, 10) || 0))
            .forEach((g) => {
              gradeStats += `  • ${g}-sinf: ${gradeCounts[g]} ta\n`;
            });

          const statText =
            `📊 <b>Smart Start Maktabi — Qabul Statistikasi:</b>\n\n` +
            `📁 <b>Jami arizalar:</b> ${total} ta\n` +
            `🟡 <b>Yangi (kutilayotgan):</b> ${yangi} ta\n` +
            `📞 <b>Bog'lanilgan:</b> ${boglanildi} ta\n` +
            `🟢 <b>Qabul qilingan:</b> ${qabul} ta\n\n` +
            `🎓 <b>Sinflar bo'yicha taqsimot:</b>\n` +
            (gradeStats || "  • Hozircha ma'lumot yo'q\n") +
            `\n⚡ <i>Saytdan ariza kelishi bilanoq ushbu botga darhol bildirishnoma yetib keladi.</i>`;

          await sendTelegramMessage(cfg.botToken, currentChatId, statText, adminKeyboard);
          continue;
        }

        // 5. Search applications
        if (textTrim === '🔍 Qidirish' || textLower === '/qidirish' || textLower === '/search') {
          chatLoginStates[currentChatId] = { step: 'waiting_search' };
          await sendTelegramMessage(
            cfg.botToken,
            currentChatId,
            `🔍 <b>Arizani qidirish</b>\n\n` +
            `Qidirmoqchi bo'lgan o'quvchi ismi, ota-ona ismi yoki telefon raqamini yozing:`,
            cancelKeyboard
          );
          continue;
        }

        // Handle Search Query input
        if (userState?.step === 'waiting_search') {
          delete chatLoginStates[currentChatId];
          const query = textLower;
          const apps = readApplications();
          const matches = apps.filter(
            (a) =>
              a.studentName.toLowerCase().includes(query) ||
              a.parentName.toLowerCase().includes(query) ||
              a.phone.replace(/[^0-9]/g, '').includes(query.replace(/[^0-9]/g, '')) ||
              a.id.toLowerCase().includes(query)
          );

          if (matches.length === 0) {
            await sendTelegramMessage(
              cfg.botToken,
              currentChatId,
              `🔍 <i>"${textTrim}"</i> bo'yicha hech qanday ariza topilmadi.`,
              adminKeyboard
            );
          } else {
            let msgText = `🔍 <b>QIDIRUV NATIJALARI (${matches.length} ta):</b>\n\n`;
            matches.slice(0, 8).forEach((a, idx) => {
              const statusBadge =
                a.status === 'yangi'
                  ? '🟡 Yangi'
                  : a.status === 'qabul_qilindi'
                  ? '🟢 Qabul qilindi'
                  : "🔵 Bog'lanildi";
              msgText +=
                `<b>${idx + 1}. ${a.studentName}</b> (${a.grade}-sinf)\n` +
                `👤 Ota-ona: ${a.parentName}\n` +
                `📞 Tel: <code>${a.phone}</code>\n` +
                `📝 Izoh: ${a.notes || "Yo'q"}\n` +
                `📅 Sana: ${a.createdAt} | ${statusBadge}\n` +
                `🆔 Kod: <code>${a.id}</code>\n` +
                `──────────────────\n`;
            });
            await sendTelegramMessage(cfg.botToken, currentChatId, msgText, adminKeyboard);
          }
          continue;
        }

        // Default admin response
        await sendTelegramMessage(
          cfg.botToken,
          currentChatId,
          `🎓 <b>Smart Start Admin Paneli</b>\n\n` +
          `Quyidagi tugmalardan birini tanlang:`,
          adminKeyboard
        );
      }
    }
  } catch (err: any) {
    // transient error, ignore
  }

  return { newChats: newDetectedChats, totalUpdates: lastTelegramUpdateId };
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // CORS headers for all requests
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // REST API ENDPOINTS

  // 1. GET /api/certificates - list all certificates
  app.get('/api/certificates', (_req, res) => {
    const certs = readCertificates();
    res.json(certs);
  });

  // 2. POST /api/certificates - create a new certificate
  app.post('/api/certificates', (req, res) => {
    const body = req.body;
    if (!body || !body.name || !body.type || !body.score) {
      res.status(400).json({ error: "Ism, sertifikat turi va ball kiritilishi shart" });
      return;
    }

    const certs = readCertificates();
    const maxId = certs.length > 0 ? Math.max(...certs.map((c) => c.id || 0)) : 0;
    const nextId = maxId + 1;

    const newCert: CertificateItem = {
      id: nextId,
      name: body.name.trim(),
      grade: Number(body.grade) || 10,
      type: body.type,
      score: String(body.score).trim(),
      subScores: body.subScores,
      subject: body.subject ? String(body.subject).trim() : undefined,
      level: body.level,
      year: Number(body.year) || new Date().getFullYear(),
      date: body.date ? String(body.date).trim() : `${body.year || 2026}-yil`,
      consent: body.consent !== false,
      featured: Boolean(body.featured),
      fileName: body.fileName || `${body.name.toLowerCase().replace(/\s+/g, '_')}_${body.type.toLowerCase()}.jpg`,
      imagePath: body.imagePath || undefined,
      certNumber: body.certNumber || `SS-${body.year || 2026}-${String(nextId).padStart(2, '0')}`,
      teacher: body.teacher ? String(body.teacher).trim() : undefined,
      isNew: true
    };

    const updated = [newCert, ...certs];
    writeCertificates(updated);
    res.status(201).json(newCert);
  });

  // 3. PUT /api/certificates/:id - update existing certificate
  app.put('/api/certificates/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Noto'g'ri ID" });
      return;
    }

    const certs = readCertificates();
    const index = certs.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Sertifikat topilmadi" });
      return;
    }

    const current = certs[index];
    const body = req.body;

    const updatedItem: CertificateItem = {
      ...current,
      ...body,
      id // preserve ID
    };

    certs[index] = updatedItem;
    writeCertificates(certs);
    res.json(updatedItem);
  });

  // 4. DELETE /api/certificates/:id - delete certificate
  app.delete('/api/certificates/:id', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Noto'g'ri ID" });
      return;
    }

    const certs = readCertificates();
    const filtered = certs.filter((c) => c.id !== id);

    if (filtered.length === certs.length) {
      res.status(404).json({ error: "Sertifikat topilmadi" });
      return;
    }

    writeCertificates(filtered);
    res.json({ success: true, deletedId: id });
  });

  // 5. PATCH /api/certificates/:id/featured - toggle or update featured status
  app.patch('/api/certificates/:id/featured', (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Noto'g'ri ID" });
      return;
    }

    const certs = readCertificates();
    const index = certs.findIndex((c) => c.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Sertifikat topilmadi" });
      return;
    }

    const target = certs[index];
    const newFeatured = typeof req.body.featured === 'boolean' ? req.body.featured : !target.featured;
    target.featured = newFeatured;

    writeCertificates(certs);
    res.json(target);
  });

  // 6. POST /api/certificates/reset - restore initial seed database
  app.post('/api/certificates/reset', (_req, res) => {
    writeCertificates(DEFAULT_SEED);
    res.json({ success: true, certificates: DEFAULT_SEED });
  });

  // ================= APPLICATIONS & TELEGRAM BOT API =================

  // 7. POST /api/applications - submit new admission application
  app.post('/api/applications', async (req, res) => {
    const { parentName, studentName, phone, grade, notes } = req.body;
    if (!parentName || !studentName || !phone) {
      res.status(400).json({ error: "F.I.SH. va telefon raqami kiritilishi shart" });
      return;
    }

    const apps = readApplications();
    const count = apps.length + 1;
    const newId = `APP-2026-${String(count).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate =
      now.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) +
      ', ' +
      now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

    const newApp: AdmissionApplication = {
      id: newId,
      parentName: String(parentName).trim(),
      studentName: String(studentName).trim(),
      phone: String(phone).trim(),
      grade: String(grade || '8').trim(),
      notes: notes ? String(notes).trim() : undefined,
      createdAt: formattedDate,
      status: 'yangi'
    };

    apps.unshift(newApp);
    writeApplications(apps);

    // Telegram Bot Notification Dispatch to authenticated admins and configured chat IDs
    const botCfg = readBotConfig();
    const botSessions = readBotSessions();
    const recipientSet = new Set<string>();
    if (botCfg.chatId) {
      botCfg.chatId
        .split(/[,;\n\r]+/)
        .map((c) => c.trim())
        .filter(Boolean)
        .forEach((c) => recipientSet.add(c));
    }
    botSessions.authenticatedChats.forEach((c) => recipientSet.add(c));
    const recipientChats = Array.from(recipientSet);

    let telegramResult: { success: boolean; error?: string; reason?: string } = {
      success: false,
      reason: 'bot_disabled'
    };

    if (botCfg.botEnabled && botCfg.botToken && recipientChats.length > 0) {
      const msg =
        `🔔 <b>YANGI QABUL ARIZASI!</b>\n` +
        `🏫 <b>Smart Start Xususiy Maktabi</b>\n\n` +
        `👤 <b>Ota-ona:</b> ${newApp.parentName}\n` +
        `🎓 <b>O'quvchi:</b> ${newApp.studentName}\n` +
        `📞 <b>Telefon:</b> <code>${newApp.phone}</code>\n` +
        `🏫 <b>Sinf:</b> ${newApp.grade}-sinf\n` +
        `📝 <b>Izoh:</b> ${newApp.notes || "Kiritilmagan"}\n` +
        `📅 <b>Vaqt:</b> ${newApp.createdAt}\n` +
        `🆔 <b>Ariza raqami:</b> <code>${newApp.id}</code>\n` +
        `📌 <b>Holat:</b> 🟡 Yangi`;

      const inlineKeyboard = {
        inline_keyboard: [
          [
            { text: "📞 Bog'lanildi", callback_data: `status:boglanildi:${newApp.id}` },
            { text: "🟢 Qabul qilindi", callback_data: `status:qabul_qilindi:${newApp.id}` }
          ]
        ]
      };

      telegramResult = await sendTelegramMessage(botCfg.botToken, recipientChats.join(','), msg, inlineKeyboard);
    }

    res.status(201).json({
      success: true,
      application: newApp,
      telegramSent: telegramResult.success
    });
  });

  // 8. GET /api/applications - list all applications
  app.get('/api/applications', (_req, res) => {
    const apps = readApplications();
    res.json(apps);
  });

  // 9. PATCH /api/applications/:id - update application status/notes
  app.patch('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const apps = readApplications();
    const index = apps.findIndex((a) => a.id === id);
    if (index === -1) {
      res.status(404).json({ error: "Ariza topilmadi" });
      return;
    }

    apps[index] = { ...apps[index], ...req.body, id };
    writeApplications(apps);
    res.json(apps[index]);
  });

  // 10. DELETE /api/applications/:id - delete application
  app.delete('/api/applications/:id', (req, res) => {
    const { id } = req.params;
    const apps = readApplications();
    const filtered = apps.filter((a) => a.id !== id);

    if (filtered.length === apps.length) {
      res.status(404).json({ error: "Ariza topilmadi" });
      return;
    }

    writeApplications(filtered);
    res.json({ success: true, deletedId: id });
  });

  // 11. GET /api/bot-config - get bot setup details
  app.get('/api/bot-config', (_req, res) => {
    const cfg = readBotConfig();
    const maskedToken = cfg.botToken
      ? cfg.botToken.slice(0, 6) + '...' + cfg.botToken.slice(-4)
      : '';

    res.json({
      hasToken: Boolean(cfg.botToken),
      maskedToken,
      chatId: cfg.chatId,
      botEnabled: cfg.botEnabled,
      botUsername: cfg.botUsername
    });
  });

  // 12. POST /api/bot-config - save bot credentials
  app.post('/api/bot-config', (req, res) => {
    const { botToken, chatId, botEnabled, botUsername } = req.body;
    const current = readBotConfig();

    const updated: BotConfig = {
      botToken:
        botToken !== undefined && botToken !== ''
          ? String(botToken).trim()
          : current.botToken,
      chatId: chatId !== undefined ? String(chatId).trim() : current.chatId,
      botEnabled: typeof botEnabled === 'boolean' ? botEnabled : current.botEnabled,
      botUsername: botUsername !== undefined ? String(botUsername).trim() : current.botUsername
    };

    writeBotConfig(updated);
    res.json({
      success: true,
      hasToken: Boolean(updated.botToken),
      chatId: updated.chatId,
      botEnabled: updated.botEnabled,
      botUsername: updated.botUsername
    });
  });

  // 13. POST /api/bot-config/test - send test message to Telegram
  app.post('/api/bot-config/test', async (req, res) => {
    const { botToken, chatId } = req.body;
    const current = readBotConfig();
    const token = botToken || current.botToken;
    const chat = chatId || current.chatId;

    if (!token || !chat) {
      res.status(400).json({ error: "Bot token va Chat ID kiritilishi shart!" });
      return;
    }

    const testMsg =
      `✅ <b>Smart Start Xususiy Maktabi</b>\n\n` +
      `Telegram bot muvaffaqiyatli ulandi! 🎉\n` +
      `Endi sayt orqali yuborilgan barcha yangi qabul arizalari ushbu chatga darhol kelib tushadi.`;

    const result = await sendTelegramMessage(token, chat, testMsg);

    if (result.success) {
      res.json({ success: true, message: "Test xabari Telegramga muvaffaqiyatli yuborildi!" });
    } else {
      let friendlyError = "Telegramga xabar yuborib bo'lmadi. Token yoki Chat ID ni tekshiring.";
      const desc =
        (result as any).error?.description ||
        (result as any).data?.description ||
        (result as any).error ||
        '';

      if (typeof desc === 'string') {
        if (desc.toLowerCase().includes('chat not found')) {
          friendlyError = `Kiritilgan Chat ID (${chat}) Telegramda topilmadi. Avval Telegramda @stmartstartt_bot ga kirib START tugmasini bosing yoki o'z shaxsiy Chat ID'ingizni kiriting.`;
        } else if (desc.toLowerCase().includes('blocked')) {
          friendlyError = `Bot ushbu foydalanuvchi tomonidan bloklangan. Telegramda botni ochib, blokdan chiqaring.`;
        } else if (desc.toLowerCase().includes('unauthorized')) {
          friendlyError = `Bot tokeni noto'g'ri. Tokenni tekshiring.`;
        } else if (desc) {
          friendlyError = desc;
        }
      }

      res.status(400).json({
        success: false,
        error: friendlyError
      });
    }
  });

  // 14. POST /api/bot-config/sync - immediately poll updates and return detected chat IDs
  app.post('/api/bot-config/sync', async (_req, res) => {
    try {
      const syncResult = await pollTelegramUpdates();
      const currentCfg = readBotConfig();
      res.json({
        success: true,
        chatId: currentCfg.chatId,
        newChats: syncResult.newChats,
        hasToken: Boolean(currentCfg.botToken),
        botUsername: currentCfg.botUsername
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // VITE OR STATIC SERVING
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Start Server running at http://0.0.0.0:${PORT}`);
    // Start background Telegram updates poller every 3.5 seconds
    setInterval(pollTelegramUpdates, 3500);
    // Run an initial poll
    pollTelegramUpdates().catch(() => {});
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

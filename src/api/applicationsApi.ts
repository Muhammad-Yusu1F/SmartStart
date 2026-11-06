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

export interface BotConfigResponse {
  hasToken: boolean;
  maskedToken: string;
  chatId: string;
  botEnabled: boolean;
  botUsername: string;
}

export async function apiSubmitApplication(data: {
  parentName: string;
  studentName: string;
  phone: string;
  grade: string;
  notes?: string;
}): Promise<{ success: boolean; application: AdmissionApplication; telegramSent: boolean }> {
  const res = await fetch('/api/applications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Server xatosi: ${res.status}`);
  }

  return res.json();
}

export async function apiFetchApplications(): Promise<AdmissionApplication[]> {
  try {
    const res = await fetch('/api/applications', {
      headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
    });
    if (!res.ok) throw new Error('Failed to fetch applications');
    return res.json();
  } catch (err) {
    console.warn('Applications fetch failed:', err);
    return [];
  }
}

export async function apiUpdateApplicationStatus(
  id: string,
  status: AdmissionApplication['status']
): Promise<AdmissionApplication> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ status })
  });

  if (!res.ok) throw new Error('Statusni yangilashda xatolik');
  return res.json();
}

export async function apiDeleteApplication(id: string): Promise<void> {
  const res = await fetch(`/api/applications/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json' }
  });

  if (!res.ok) throw new Error("Arizani o'chirishda xatolik");
}

export async function apiGetBotConfig(): Promise<BotConfigResponse> {
  const res = await fetch('/api/bot-config', {
    headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache' }
  });
  if (!res.ok) throw new Error('Failed to get bot config');
  return res.json();
}

export async function apiSaveBotConfig(data: {
  botToken?: string;
  chatId?: string;
  botEnabled?: boolean;
  botUsername?: string;
}): Promise<{ success: boolean }> {
  const res = await fetch('/api/bot-config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Bot sozlamalarini saqlashda xatolik');
  }

  return res.json();
}

export async function apiTestBotConfig(
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch('/api/bot-config/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ botToken, chatId })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Test xabari yuborilmadi');
  }

  return data;
}

export async function apiSyncBotUpdates(): Promise<{
  success: boolean;
  chatId: string;
  newChats: string[];
  hasToken: boolean;
  botUsername: string;
}> {
  const res = await fetch('/api/bot-config/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
  });

  if (!res.ok) {
    throw new Error('Bot xabarlarini tekshirishda xatolik yuz berdi');
  }

  return res.json();
}


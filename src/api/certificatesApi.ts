import { CertificateItem } from '../types';
import { INITIAL_CERTIFICATES } from '../data/initialData';

const CACHE_KEY = 'smart_start_certificates_v1';

// Read local cache for immediate render or offline fallback
export function getCachedCertificates(): CertificateItem[] {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read certificates cache:', err);
  }
  return INITIAL_CERTIFICATES;
}

// Write local cache
export function setCachedCertificates(items: CertificateItem[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Failed to write certificates cache:', err);
  }
}

// 1. Fetch certificates from real shared server
export async function apiFetchCertificates(): Promise<CertificateItem[]> {
  try {
    const res = await fetch('/api/certificates', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      throw new Error(`Server returned HTTP ${res.status}`);
    }

    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      setCachedCertificates(data);
      return data;
    }
  } catch (err) {
    console.warn('API fetch failed, falling back to local cache:', err);
  }
  return getCachedCertificates();
}

// 2. Create new certificate on server
export async function apiCreateCertificate(
  item: Omit<CertificateItem, 'id'>
): Promise<CertificateItem> {
  const res = await fetch('/api/certificates', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    throw new Error(`Failed to create certificate: ${res.statusText}`);
  }

  const created: CertificateItem = await res.json();
  return created;
}

// 3. Update existing certificate on server
export async function apiUpdateCertificate(
  id: number,
  item: Partial<CertificateItem>
): Promise<CertificateItem> {
  const res = await fetch(`/api/certificates/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(item)
  });

  if (!res.ok) {
    throw new Error(`Failed to update certificate: ${res.statusText}`);
  }

  const updated: CertificateItem = await res.json();
  return updated;
}

// 4. Delete certificate on server
export async function apiDeleteCertificate(id: number): Promise<void> {
  const res = await fetch(`/api/certificates/${id}`, {
    method: 'DELETE',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to delete certificate: ${res.statusText}`);
  }
}

// 5. Toggle featured status on server
export async function apiToggleFeatured(id: number, featured?: boolean): Promise<CertificateItem> {
  const res = await fetch(`/api/certificates/${id}/featured`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ featured })
  });

  if (!res.ok) {
    throw new Error(`Failed to toggle featured: ${res.statusText}`);
  }

  const updated: CertificateItem = await res.json();
  return updated;
}

// 6. Reset to seed database on server
export async function apiResetCertificates(): Promise<CertificateItem[]> {
  const res = await fetch('/api/certificates/reset', {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to reset certificates: ${res.statusText}`);
  }

  const data = await res.json();
  const certs: CertificateItem[] = data.certificates || INITIAL_CERTIFICATES;
  setCachedCertificates(certs);
  return certs;
}

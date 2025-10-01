/**
 * Google Drive yardımcı fonksiyonları
 * - Klasör bul/oluştur
 * - Multipart küçük dosya yükleme
 * Not: Bu istemci tarafı kullanım için sade tutuldu; access token zaten BackupMenu içinde alınıyor.
 */

export interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  parents?: string[];
  size?: string;
}

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

function authHeaders(token: string): HeadersInit {
  return { Authorization: `Bearer ${token}` };
}

/** Drive API'de bir klasörü ada göre arar */
export async function findFolder(token: string, name: string): Promise<DriveFileMetadata | null> {
  const q = encodeURIComponent(`name='${name.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  const res = await fetch(`${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name,mimeType)&pageSize=1`, { headers: authHeaders(token) });
  if (!res.ok) {
    let body: any = '';
    try { body = await res.text(); } catch {}
    console.warn('Drive findFolder error', res.status, body);
    throw new Error(`findFolder failed: ${res.status}`);
  }
  const data = await res.json();
  return data.files?.[0] || null;
}

/** Yeni bir klasör oluşturur */
export async function createFolder(token: string, name: string, parentId?: string): Promise<DriveFileMetadata> {
  const body: any = { name, mimeType: 'application/vnd.google-apps.folder' };
  if (parentId) body.parents = [parentId];
  const res = await fetch(`${DRIVE_API_BASE}/files?fields=id,name,mimeType`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    let txt = '';
    try { txt = await res.text(); } catch {}
    console.warn('Drive createFolder error', res.status, txt);
    throw new Error(`createFolder failed: ${res.status}`);
  }
  return res.json();
}

/**
 * Ada göre klasörü bulur, yoksa oluşturur. (Basit cache dışarıda yönetilebilir.)
 */
export async function ensureFolder(token: string, name: string): Promise<DriveFileMetadata> {
  const existing = await findFolder(token, name).catch(() => null);
  if (existing) return existing;
  return createFolder(token, name);
}

/** Küçük dosya (yaklaşık < 5MB) için multipart upload */
export async function uploadFileMultipart(params: {
  token: string;
  file: File;
  parentId?: string;
  onProgress?: (percent: number) => void;
}): Promise<DriveFileMetadata> {
  const { token, file, parentId, onProgress } = params;
  // Progress polyfill: Fetch API progress takibi için ReadableStream kullanıyoruz
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelim = `\r\n--${boundary}--`;

  const metadata: any = { name: file.name };
  if (parentId) metadata.parents = [parentId];

  const metadataPart = `Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`;
  const headerPart = `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;

  const fileBuffer = new Uint8Array(await file.arrayBuffer());
  const bodyParts: (Uint8Array | string)[] = [delimiter, metadataPart, delimiter, headerPart, fileBuffer, closeDelim];

  // Toplam uzunluğu hesapla
  const encoder = new TextEncoder();
  const sizeCalc = bodyParts.reduce((acc, part) => acc + (typeof part === 'string' ? encoder.encode(part).length : part.length), 0);

  let uploaded = 0;
  const stream = new ReadableStream({
    start(controller) {
      for (const part of bodyParts) {
        const chunk = typeof part === 'string' ? encoder.encode(part) : part;
        uploaded += chunk.length;
        controller.enqueue(chunk);
        if (onProgress) onProgress(Math.round((uploaded / sizeCalc) * 100));
      }
      controller.close();
    }
  });

  const res = await fetch(`${DRIVE_UPLOAD_BASE}/files?uploadType=multipart&fields=id,name,mimeType,size`, {
    method: 'POST',
    headers: {
      ...authHeaders(token),
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    // fetch'e ReadableStream body verdiğimiz için bazı tarayıcılarda (Chrome 110+) streaming
    // isteklerde 'duplex' alanının belirtilmesi gerekiyor; aksi halde
    // "The `duplex` member must be specified for a request with a streaming body" hatası alınır.
    // TypeScript henüz (standart tamamlanmadığı için) RequestInit üzerinde 'duplex' tanımını içermeyebilir.
    // Bu nedenle alanı ts-ignore ile ekliyoruz.
    body: stream as any,
    // @ts-ignore - Deneysel fetch streaming özelliği
    duplex: 'half'
  });
  if (!res.ok) throw new Error(`uploadFileMultipart failed: ${res.status}`);
  return res.json();
}

/** Basit dosya var mı kontrolü (aynı isim ve parent altında) */
export async function findExistingFile(token: string, name: string, parentId?: string): Promise<DriveFileMetadata | null> {
  const nameEsc = name.replace(/'/g, "\\'");
  const parentClause = parentId ? ` and '${parentId}' in parents` : '';
  const q = encodeURIComponent(`name='${nameEsc}' and trashed=false${parentClause}`);
  const res = await fetch(`${DRIVE_API_BASE}/files?q=${q}&fields=files(id,name,mimeType,size)&pageSize=1`, { headers: authHeaders(token) });
  if (!res.ok) {
    let body: any = '';
    try { body = await res.text(); } catch {}
    console.warn('Drive findExistingFile error', res.status, body);
    throw new Error(`findExistingFile failed: ${res.status}`);
  }
  const data = await res.json();
  return data.files?.[0] || null;
}

/** Kullanıcının Drive'ındaki klasörleri listeler; nameContains verilirse basit ad filtresi uygular */
export async function listFolders(token: string, options?: { pageSize?: number; pageToken?: string; parentId?: string | null; all?: boolean; }): Promise<{ files: DriveFileMetadata[]; nextPageToken?: string; }> {
  const { pageSize = 20, pageToken, parentId = 'root', all = false } = options || {};
  // all=true veya parentId==='__ALL__' ise kullanıcı Drive'ındaki tüm klasörleri (trashed=false) listeler.
  // Not: Büyük Drive hesaplarında bu çok fazla sonuç getirebilir; bu yüzden sayfalama zorunlu.
  let qBase = all || parentId === '__ALL__'
    ? `mimeType='application/vnd.google-apps.folder' and trashed=false`
    : `mimeType='application/vnd.google-apps.folder' and '${parentId || 'root'}' in parents and trashed=false`;
  const params = new URLSearchParams();
  params.set('q', qBase);
  params.set('fields', 'files(id,name,mimeType),nextPageToken');
  params.set('pageSize', String(pageSize));
  if (pageToken) params.set('pageToken', pageToken);
  const res = await fetch(`${DRIVE_API_BASE}/files?${params.toString()}`, { headers: authHeaders(token) });
  if (!res.ok) {
    let body: any = '';
    try { body = await res.text(); } catch {}
    console.warn('Drive listFolders error', res.status, body);
    throw new Error(`listFolders failed: ${res.status}`);
  }
  return res.json();
}

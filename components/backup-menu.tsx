"use client";
import { useEffect, useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { CloudUpload } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ensureFolder, uploadFileMultipart, findExistingFile, listFolders, createFolder } from '@/lib/drive';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';

interface BackupMenuProps { chats: { id: string; fileName: string; originalZip?: File }[]; }

type TokenState = {
  accessToken: string | null;
  expiresAt: number | null;
};

interface UserInfo {
  email?: string;
  name?: string;
  picture?: string;
}

// Tek bir sabit client id (env üzerinden). Kullanıcıdan artık custom ID alınmıyor.
const CURRENT_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID';
const isLikelyInvalidClientId = !CURRENT_CLIENT_ID || CURRENT_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID';
// Basit mod (Drive içeriğini listeleme yok) için env toggle
// .env.local -> NEXT_PUBLIC_SIMPLE_BACKUP=1 yaparsanız metadata scope'u istemez ve doğrulama riski azalır.
const SIMPLE_BACKUP_MODE = process.env.NEXT_PUBLIC_SIMPLE_BACKUP === '1';
// Gerekli scope'lar:
// drive.file -> Yalnızca uygulamanın oluşturduğu / açtığı dosyalara erişim (yeterli)
// drive.metadata.readonly -> (Opsiyonel) Var olan klasörleri listelemek / hiyerarşi gezinmek için
// openid email profile -> userinfo profil bilgileri için
const DRIVE_SCOPE = SIMPLE_BACKUP_MODE
  ? 'https://www.googleapis.com/auth/drive.file openid email profile'
  : 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly openid email profile';

declare global { interface Window { google?: any; } }

export function BackupMenu({ chats }: BackupMenuProps) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [folderId, setFolderId] = useState<string | null>(null);
  const [folderStatus, setFolderStatus] = useState<string | null>(null);
  const [folderName, setFolderName] = useState<string>('WhatsApp Chat Backups');
  const [folderDirty, setFolderDirty] = useState(false);
  const abortRef = useRef<{ canceled: boolean }>({ canceled: false });
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const refreshTimerRef = useRef<number | null>(null);
  const [tokenState, setTokenState] = useState<TokenState>({ accessToken: null, expiresAt: null });
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const isAuthed = !!tokenState.accessToken && !!tokenState.expiresAt && tokenState.expiresAt > Date.now();
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [remoteFolders, setRemoteFolders] = useState<{ id: string; name: string; }[]>([]);
  const [currentParent, setCurrentParent] = useState<string | null>('root');
  const [breadcrumb, setBreadcrumb] = useState<{ id: string | null; name: string; }[]>([{ id: 'root', name: t('backup.root', 'Drive') }]);
  const [folderLoading, setFolderLoading] = useState(false);
  const [folderPageToken, setFolderPageToken] = useState<string | undefined>(undefined);
  const [folderListError, setFolderListError] = useState<string | null>(null);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);
  const [globalMode, setGlobalMode] = useState(false); // Tüm Drive klasörlerini listeleme modu
  const [autoGlobalApplied, setAutoGlobalApplied] = useState(false);
  const [tokenScopes, setTokenScopes] = useState<string[] | null>(null);
  const hasMetadataScope = tokenScopes?.some(s => s === 'https://www.googleapis.com/auth/drive.metadata.readonly' || s === 'https://www.googleapis.com/auth/drive' || s === 'https://www.googleapis.com/auth/drive.readonly');

  const zips = chats.filter(c => c.originalZip && c.originalZip instanceof File);

  // Kayıtlı klasör adını yükle
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gdrive_backup_folder_name');
      if (stored && stored.trim().length > 0) setFolderName(stored);
    } catch {}
  }, []);

  // Google Identity Services script yükleme
  useEffect(() => {
    if (window.google) { setScriptLoaded(true); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true; s.defer = true;
    s.onload = () => setScriptLoaded(true);
    s.onerror = () => console.error('Google Identity script yüklenemedi');
    document.head.appendChild(s);
    return () => { /* kaldırmaya gerek yok */ };
  }, []);

  // localStorage'dan token geri yükle
  useEffect(() => {
    try {
      const raw = localStorage.getItem('gdrive_token');
      if (raw) {
        const parsed: TokenState = JSON.parse(raw);
        if (parsed.expiresAt && parsed.expiresAt > Date.now()) setTokenState(parsed);
      }
    } catch {}
  }, []);

  const saveToken = (tkn: TokenState) => {
    setTokenState(tkn);
    try { localStorage.setItem('gdrive_token', JSON.stringify(tkn)); } catch {}
  };

  const clearToken = () => {
    saveToken({ accessToken: null, expiresAt: null });
    setUserInfo(null);
    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  };

  const requestToken = useCallback(() => {
    if (isLikelyInvalidClientId) return;
    if (!scriptLoaded || !window.google) return;
    setLoadingAuth(true);
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CURRENT_CLIENT_ID,
        scope: DRIVE_SCOPE,
        callback: (resp: any) => {
          if (resp && resp.access_token) {
            const expiresAt = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 3600_000);
            saveToken({ accessToken: resp.access_token, expiresAt });
            scheduleRefresh(expiresAt);
            fetchUserInfo(resp.access_token).catch(err => console.warn('userinfo fetch after login failed', err));
          }
          setLoadingAuth(false);
        }
      });
      client.requestAccessToken();
    } catch (e) {
      console.error(e);
      setLoadingAuth(false);
    }
  }, [scriptLoaded]);

  // Kullanıcı profilini çek
  const fetchUserInfo = async (accessToken: string) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        // 401 gelirse token scope yetersiz veya süre aşımı olabilir.
        console.warn('userinfo request failed', res.status, await res.text());
        if (res.status === 401) {
          // Token expired scenario: temizleyip yeniden login isteyebiliriz.
          clearToken();
        }
        return;
      }
      const data = await res.json();
      setUserInfo({ email: data.email, name: data.name, picture: data.picture });
      // Token scope'larını ayrıca al
      fetchTokenInfo(accessToken).catch(()=>{});
    } catch (err) {
      console.warn('userinfo exception', err);
    }
  };

  const fetchTokenInfo = async (accessToken: string) => {
    try {
      const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.scope) setTokenScopes(String(data.scope).split(/\s+/));
    } catch {}
  };

  // Token süresi bitmeden silent refresh (prompt: '')
  const scheduleRefresh = (expiresAt: number) => {
    if (!window.google) return;
    const delta = expiresAt - Date.now();
    // 60sn önce yenile
    const timeout = Math.max(0, delta - 60000);
    if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = window.setTimeout(() => {
      try {
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: CURRENT_CLIENT_ID,
          scope: DRIVE_SCOPE,
          prompt: '', // silent
          callback: (resp: any) => {
            if (resp && resp.access_token) {
              const newExp = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 3600_000);
              saveToken({ accessToken: resp.access_token, expiresAt: newExp });
              scheduleRefresh(newExp);
              fetchUserInfo(resp.access_token).catch(err => console.warn('userinfo fetch after silent refresh failed', err));
            } else if (resp && resp.error) {
              console.warn('silent refresh error', resp.error);
            }
          }
        });
        client.requestAccessToken();
      } catch (e) { console.error('silent refresh failed', e); }
    }, timeout) as any;
  };

  // Uygulama yeniden açıldığında geçerli token varsa profil çek ve refresh ayarla
  useEffect(() => {
    if (isAuthed && tokenState.accessToken && tokenState.expiresAt) {
      fetchUserInfo(tokenState.accessToken).catch(()=>{});
      scheduleRefresh(tokenState.expiresAt);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthed]);

  const revokeAccess = () => {
    if (!tokenState.accessToken || !window.google) { clearToken(); return; }
    try {
      window.google.accounts.oauth2.revoke(tokenState.accessToken, () => {
        clearToken();
      });
    } catch {
      clearToken();
    }
  };

  const handleBackup = async () => {
    if (zips.length === 0) return;
    if (!isAuthed) { requestToken(); return; }
    abortRef.current.canceled = false;
    setUploading(true);
    setStatus(null);
    setFolderStatus(null);
    setProgress(0);
    try {
      const token = tokenState.accessToken!;
      let activeFolderId = folderId;
      if (!activeFolderId) {
        setFolderStatus(t('backup.creatingFolder', 'Creating folder...'));
        const effectiveFolderName = folderName && folderName.trim().length > 0 ? folderName.trim() : 'WhatsApp Chat Backups';
        const folder = await ensureFolder(token, effectiveFolderName);
        activeFolderId = folder.id;
        setFolderId(activeFolderId);
        setFolderStatus(t('backup.folderReady', 'Folder ready'));
      } else {
        setFolderStatus(t('backup.folderReadyExisting', 'Existing folder will be used'));
      }

      // Byte bazlı toplam ilerleme
      const totalBytes = zips.reduce((acc, c) => acc + (c.originalZip ? c.originalZip.size : 0), 0);
      let uploadedBytes = 0;
      for (let i = 0; i < zips.length; i++) {
        if (abortRef.current.canceled) { setStatus(t('backup.canceled', 'Canceled')); break; }
        const file = zips[i].originalZip as File;
        setStatus(t('backup.uploadingFile', { file: file.name }));
        // Var mı kontrolü
  const existing = await findExistingFile(token, file.name, activeFolderId!).catch(()=>null);
        if (existing) {
          uploadedBytes += file.size; // zaten var say progress'e ekle
          const percentExisting = Math.round((uploadedBytes / totalBytes) * 100);
          setProgress(percentExisting);
          continue;
        }
        await uploadFileMultipart({
            token,
            file,
            parentId: activeFolderId!,
            onProgress: (p) => {
              // Dosya özelinde p%'yi toplam byte ilerlemesine yansıtmak için tahmini yaklaşım
              const previousBytes = zips.slice(0, i).reduce((acc, c) => acc + (c.originalZip ? c.originalZip.size : 0), 0);
              const currentBytes = (file.size * p) / 100;
              const total = previousBytes + currentBytes;
              setProgress(Math.min(100, Math.round((total / totalBytes) * 100)));
            }
        });
        uploadedBytes += file.size;
        setProgress(Math.round((uploadedBytes / totalBytes) * 100));
      }
      if (!abortRef.current.canceled) setStatus(t('backup.completed'));
    } catch (e: any) {
      console.error(e);
      if (e?.message?.includes('401')) {
        clearToken();
        setStatus(t('backup.retryAuth', 'Auth expired, please sign in again'));
      } else if (e?.message?.includes('403')) {
        setStatus(t('backup.permissionDenied', 'Permission denied (403). Check Drive scope and user authorization.'));
      } else {
        setStatus(t('backup.error'));
      }
    } finally {
      setUploading(false);
    }
  };

  // Uzak klasörleri yükle
  const loadRemoteFolders = useCallback(async (reset = false) => {
    if (!isAuthed || !tokenState.accessToken) return;
    setFolderLoading(true);
    if (reset) setFolderListError(null);
    try {
      const res = await listFolders(tokenState.accessToken, {
        pageSize: 50,
        pageToken: reset ? undefined : folderPageToken,
        parentId: globalMode ? '__ALL__' : currentParent,
        all: globalMode
      });
      setRemoteFolders(prev => reset ? res.files : [...prev, ...res.files]);
      setFolderPageToken(res.nextPageToken);
      // Root'ta hiç klasör yoksa ve daha önce global fallback uygulanmadıysa otomatik geçiş yap.
      if (!globalMode && currentParent === 'root' && (reset ? res.files.length === 0 : remoteFolders.length + res.files.length === 0) && !autoGlobalApplied) {
        setGlobalMode(true);
        setAutoGlobalApplied(true);
        // Global moda geçtiğimizde yeniden yükle
        setTimeout(()=>{
          setRemoteFolders([]);
          setFolderPageToken(undefined);
          loadRemoteFolders(true);
        }, 0);
      }
    } catch (e: any) {
      console.warn('remote folder list failed', e);
      const msg = String(e?.message || '');
      if (msg.includes('403')) {
        if (msg.includes('SERVICE_DISABLED') || msg.includes('accessNotConfigured')) {
          setFolderListError(t('backup.folderListServiceDisabled', 'Drive API etkin değil veya yeni etkinleştirildi. Cloud Console üzerinden Drive API’yı açın ve birkaç dakika sonra tekrar deneyin.'));
        } else {
          setFolderListError(t('backup.folderListPermission', 'Klasörleri listelemek için ek izin gerekiyor. Lütfen yeniden oturum açın ve gerekli izinleri onaylayın.'));
        }
      } else {
        setFolderListError(t('backup.folderListGenericError', 'Klasörler alınırken bir hata oluştu.'));
      }
    } finally {
      setFolderLoading(false);
    }
  }, [isAuthed, tokenState.accessToken, folderPageToken, currentParent]);

  // Dialog açılınca ilk yükleme
  useEffect(() => {
    if (folderPickerOpen) {
      setRemoteFolders([]);
      setFolderPageToken(undefined);
      loadRemoteFolders(true);
    }
  }, [folderPickerOpen, currentParent, loadRemoteFolders]);

  const enterFolder = (id: string, name: string) => {
    setCurrentParent(id);
    setBreadcrumb(prev => [...prev, { id, name }]);
  };

  const goUp = (targetIndex: number) => {
    const target = breadcrumb[targetIndex];
    setBreadcrumb(prev => prev.slice(0, targetIndex + 1));
    setCurrentParent(target.id);
  };

  const cancelUpload = () => {
    abortRef.current.canceled = true;
    setUploading(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('backup.title')} className="text-[var(--wa-bubble-meta)] hover:text-[var(--wa-accent)]">
          <CloudUpload className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
          <CloudUpload className="h-4 w-4" /> {t('backup.title')}
        </h3>
        <div className="space-y-3">
          <div className="text-xs text-[var(--wa-bubble-meta)] space-y-1">
            <p>{t('backup.description')}</p>
            {!isAuthed && !isLikelyInvalidClientId && (
              <p className="text-[var(--wa-accent)]">{loadingAuth ? t('backup.auth.loading') : t('backup.auth.notSigned')}</p>
            )}
            {isLikelyInvalidClientId && (
              <div className="text-[var(--wa-accent)] space-y-1">
                <p>{t('backup.auth.invalidClient')}</p>
                <p className="text-[var(--wa-bubble-meta)]">{t('backup.auth.configureHint')}</p>
              </div>
            )}
            {isAuthed && (
              <div className="text-[var(--wa-bubble-meta)] flex flex-col gap-0.5">
                <span>{t('backup.auth.signed')}</span>
                {userInfo?.email && <span className="truncate text-[10px] opacity-80" title={userInfo.email}>{userInfo.email}</span>}
                {isAuthed && tokenScopes && !hasMetadataScope && (
                  <span className="text-red-400 text-[10px] mt-1">{t('backup.missingMetadataScope','Klasörleri görmek için yeniden izin verin')}</span>
                )}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="text-xs">
              <label className="block mb-1 font-medium text-[var(--wa-bubble-meta)]" htmlFor="gdrive-folder-name">
                {t('backup.folderNameLabel', 'Klasör Adı')}
              </label>
              <div className="flex gap-2">
                <input
                  id="gdrive-folder-name"
                  value={folderName}
                  disabled={uploading}
                  onChange={e => { setFolderName(e.target.value); setFolderDirty(true); setFolderId(null); setFolderStatus(null); }}
                  onBlur={() => {
                    try { localStorage.setItem('gdrive_backup_folder_name', folderName.trim()); } catch {}
                    setFolderDirty(false);
                  }}
                  placeholder={t('backup.folderNamePlaceholder', 'Örn: WhatsApp Chat Backups')}
                  className="flex-1 rounded border bg-[var(--wa-search-bg)] border-[var(--wa-search-border)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--wa-accent)]"
                />
                {folderDirty && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploading || !folderName.trim()}
                    onClick={() => { try { localStorage.setItem('gdrive_backup_folder_name', folderName.trim()); } catch {}; setFolderDirty(false); }}
                  >
                    {t('save', 'Kaydet')}
                  </Button>
                )}
                  {isAuthed && !SIMPLE_BACKUP_MODE && (
                    <Button type="button" size="sm" variant="outline" disabled={uploading} onClick={() => {
                      setFolderPickerOpen(true);
                      setCurrentParent('root');
                      setBreadcrumb([{ id: 'root', name: t('backup.root', 'Drive') }]);
                    }}>
                      {t('backup.chooseRemote', 'Uzak Seç')}
                    </Button>
                  )}
              </div>
            </div>
            <div className="rounded border border-[var(--wa-panel-border)] max-h-32 overflow-auto divide-y">
            {zips.length === 0 && (
              <div className="p-2 text-xs text-[var(--wa-bubble-meta)]">{t('backup.noFiles')}</div>
            )}
            {zips.map(c => (
              <div key={c.id} className="p-2 text-xs flex items-center justify-between gap-2">
                <span className="truncate" title={c.fileName}>{c.fileName}</span>
                <span className="text-[var(--wa-bubble-meta)]">{Math.round((c.originalZip!.size/1024/1024)*10)/10}MB</span>
              </div>
            ))}
            </div>
          </div>
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex items-center justify-between">
              <span>{progress !== null ? `${progress}%` : ''}</span>
              {status && <span className="text-[var(--wa-bubble-meta)] truncate max-w-[140px]" title={status}>{status}</span>}
            </div>
            {folderStatus && <div className="text-[var(--wa-bubble-meta)] truncate" title={folderStatus}>{folderStatus}</div>}
            {uploading && (
              <div className="h-1 w-full bg-[var(--wa-hover)] rounded overflow-hidden">
                <div className="h-full bg-[var(--wa-accent)] transition-all" style={{width: `${progress||0}%`}} />
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>{t('close')}</Button>
            {!isAuthed && !isLikelyInvalidClientId && (
              <Button size="sm" onClick={requestToken} disabled={loadingAuth} className="bg-[var(--wa-accent)] hover:bg-[var(--wa-accent-strong)] text-white">
                {loadingAuth ? t('backup.auth.loading') : t('backup.auth.signIn')}
              </Button>
            )}
            {isAuthed && tokenScopes && !hasMetadataScope && !SIMPLE_BACKUP_MODE && (
              <Button size="sm" variant="destructive" onClick={() => {
                if (!window.google) return;
                const client = window.google.accounts.oauth2.initTokenClient({
                  client_id: CURRENT_CLIENT_ID,
                  scope: DRIVE_SCOPE,
                  prompt: 'consent',
                  callback: (resp: any) => {
                    if (resp && resp.access_token) {
                      const expiresAt = Date.now() + (resp.expires_in ? resp.expires_in * 1000 : 3600_000);
                      saveToken({ accessToken: resp.access_token, expiresAt });
                      scheduleRefresh(expiresAt);
                      fetchUserInfo(resp.access_token).catch(()=>{});
                    }
                  }
                });
                client.requestAccessToken();
              }}>{t('backup.reconsent','İzinleri Güncelle')}</Button>
            )}
            {!isAuthed && isLikelyInvalidClientId && (
              <Button size="sm" variant="secondary" disabled title={CURRENT_CLIENT_ID}>⚠</Button>
            )}
            {isAuthed && (
              <>
                <Button size="sm" variant="secondary" onClick={revokeAccess} disabled={uploading}>{t('backup.auth.signOut')}</Button>
                {!uploading && (
                  <Button size="sm" onClick={handleBackup} disabled={zips.length===0 || !folderName.trim()} className="bg-[var(--wa-accent)] hover:bg-[var(--wa-accent-strong)] text-white">
                    {t('backup.startShort', 'Başlat')}
                  </Button>
                )}
                {uploading && (
                  <Button size="sm" variant="destructive" onClick={cancelUpload}>
                    {t('backup.cancel', 'Cancel')}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </PopoverContent>
      {!SIMPLE_BACKUP_MODE && (
      <Dialog open={folderPickerOpen} onOpenChange={setFolderPickerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('backup.remoteFolderTitle', 'Drive Klasörünü Seç')}</DialogTitle>
            <DialogDescription>{t('backup.remoteFolderDesc', 'Yüklemek istediğiniz klasörü seçin veya içindeki alt klasörlere girin.')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-1 text-xs">
              {breadcrumb.map((b, idx) => (
                <span key={idx} className="flex items-center gap-1">
                  <button type="button" className="hover:underline" onClick={() => goUp(idx)} disabled={idx === breadcrumb.length-1}>
                    {b.name}
                  </button>
                  {idx < breadcrumb.length -1 && <span>/</span>}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {!creatingFolder && (
                <Button size="sm" variant="outline" type="button" onClick={() => { setCreatingFolder(true); setTimeout(()=>{ try { (document.getElementById('new-drive-folder') as HTMLInputElement)?.focus(); } catch{} }, 50); }}>
                  {t('backup.newFolder', 'Yeni Klasör')}
                </Button>
              )}
              {creatingFolder && (
                <form className="flex items-center gap-2" onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newFolderName.trim() || !tokenState.accessToken) return;
                  setCreateError(null);
                  try {
                    const f = await createFolder(tokenState.accessToken, newFolderName.trim(), currentParent || undefined);
                    // Listeyi yenile ve yeni klasörü seç
                    setNewFolderName('');
                    setCreatingFolder(false);
                    setFolderId(f.id);
                    setFolderName(f.name);
                    setFolderStatus(t('backup.folderSelected', 'Folder selected'));
                    // Klasör eklendiği parent altında yeniden listele
                    setRemoteFolders([]);
                    setFolderPageToken(undefined);
                    loadRemoteFolders(true);
                  } catch (err: any) {
                    const msg = String(err?.message || '');
                    if (msg.includes('403')) setCreateError(t('backup.createFolderPermission', 'Klasör oluşturma izni reddedildi (403).'));
                    else setCreateError(t('backup.createFolderError', 'Klasör oluşturulamadı.'));
                  }
                }}>
                  <input id="new-drive-folder" value={newFolderName} onChange={e=>setNewFolderName(e.target.value)} placeholder={t('backup.newFolderPlaceholder','Klasör adı')} className="px-2 py-1 text-xs rounded border bg-[var(--wa-search-bg)] border-[var(--wa-search-border)] focus:outline-none focus:ring-1 focus:ring-[var(--wa-accent)]" />
                  <Button size="sm" type="submit" disabled={!newFolderName.trim()} className="bg-[var(--wa-accent)] hover:bg-[var(--wa-accent-strong)] text-white">{t('create','Oluştur')}</Button>
                  <Button size="sm" type="button" variant="ghost" onClick={() => { setCreatingFolder(false); setNewFolderName(''); }}>{t('cancel','İptal')}</Button>
                </form>
              )}
              <Button size="sm" variant={globalMode ? 'default' : 'outline'} type="button" onClick={() => {
                setGlobalMode(m => !m);
                setRemoteFolders([]);
                setFolderPageToken(undefined);
                loadRemoteFolders(true);
              }}>
                {globalMode ? t('backup.root','Drive') : t('backup.allFolders','Tüm Klasörler')}
              </Button>
            </div>
            {createError && <div className="text-xs text-red-400">{createError}</div>}
            <div className="max-h-80 overflow-auto rounded border border-[var(--wa-panel-border)] divide-y">
              {currentParent !== 'root' && (
                <button type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--wa-hover)]" onClick={() => goUp(breadcrumb.length-2)}>
                  ..
                </button>
              )}
              {remoteFolders.map(f => (
                <div key={f.id} className="flex items-center">
                  <button
                    type="button"
                    onClick={() => enterFolder(f.id, f.name)}
                    className="flex-1 text-left px-3 py-2 text-sm hover:bg-[var(--wa-hover)]"
                  >
                    {f.name}
                  </button>
                  <Button
                    type="button"
                    size="sm"
                    variant={folderId===f.id ? 'default' : 'outline'}
                    className="m-1"
                    onClick={() => { setFolderId(f.id); setFolderName(f.name); setFolderStatus(t('backup.folderSelected', 'Folder selected')); }}
                  >
                    {folderId===f.id ? t('selected', 'Seçildi') : t('choose', 'Seç')}
                  </Button>
                </div>
              ))}
              {remoteFolders.length===0 && !folderLoading && !folderListError && (
                <div className="p-3 text-xs text-[var(--wa-bubble-meta)]">
                  {t('backup.noRemoteFolders', 'Klasör bulunamadı')}
                  {globalMode && autoGlobalApplied && <span className="block mt-1 opacity-70">{t('backup.listingAllFallback','Root boş olduğu için tüm klasörler listeleniyor.')}</span>}
                  {isAuthed && tokenScopes && !hasMetadataScope && <span className="block mt-1 text-red-400">{t('backup.missingMetadataScope','drive.metadata.readonly izni eklenmedi. Yeniden izin verin.')}</span>}
                </div>
              )}
              {folderListError && (
                <div className="p-3 text-xs text-red-400 whitespace-pre-wrap">{folderListError}</div>
              )}
              {folderLoading && (
                <div className="p-3 text-xs text-[var(--wa-bubble-meta)]">{t('loading', 'Yükleniyor...')}</div>
              )}
            </div>
            {folderPageToken && !folderLoading && (
              <Button size="sm" variant="outline" onClick={() => loadRemoteFolders(false)}>{t('more', 'Daha Fazla')}</Button>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" size="sm" onClick={() => { /* close */ }}>{t('close', 'Kapat')}</Button>
            </DialogClose>
            <Button size="sm" disabled={!folderId} onClick={() => { setFolderPickerOpen(false); }}>{t('apply', 'Uygula')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      )}
      {SIMPLE_BACKUP_MODE && isAuthed && (
        <div className="px-3 pb-2 text-[10px] text-[var(--wa-bubble-meta)]">
          {t('backup.simpleModeInfo','Basit mod: Drive içeriği listelenmez, dosyalar tek hedef klasörde (adıyla otomatik) oluşturulur.')}
        </div>
      )}
    </Popover>
  );
}

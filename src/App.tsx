import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ResultsView } from './components/ResultsView';
import { FeaturedShowcase } from './components/FeaturedShowcase';
import { CertificateModal } from './components/CertificateModal';
import { AdmissionModal } from './components/AdmissionModal';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CertificateFormModal } from './components/admin/CertificateFormModal';
import { DeleteConfirmModal } from './components/admin/DeleteConfirmModal';
import { Toast, ToastMessage } from './components/Toast';
import { AppProvider, useApp } from './context/AppContext';

import { HomeView } from './components/HomeView';
import { CertificateItem, ActiveScreen } from './types';
import {
  apiFetchCertificates,
  apiCreateCertificate,
  apiUpdateCertificate,
  apiDeleteCertificate,
  apiToggleFeatured,
  apiResetCertificates,
  getCachedCertificates,
  setCachedCertificates
} from './api/certificatesApi';
import confetti from 'canvas-confetti';

function AppContent() {
  const { t, language } = useApp();
  const [certificates, setCertificates] = useState<CertificateItem[]>(() => {
    return getCachedCertificates();
  });

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('home');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('smart_start_admin_auth') === 'true';
  });

  // Modal inspection item
  const [inspectItem, setInspectItem] = useState<CertificateItem | null>(null);

  // Form (Add / Edit) item
  const [editingItem, setEditingItem] = useState<CertificateItem | null>(null);

  // Delete item
  const [deleteCandidate, setDeleteCandidate] = useState<CertificateItem | null>(null);

  // Admission inquiry modal
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Real-time server fetch & sync: ensures all users & devices immediately see added certificates
  useEffect(() => {
    let isMounted = true;

    const syncWithServer = async () => {
      try {
        const remote = await apiFetchCertificates();
        if (isMounted && remote && remote.length > 0) {
          setCertificates(remote);
        }
      } catch (e) {
        console.warn('Sync failed:', e);
      }
    };

    // Immediate initial sync
    syncWithServer();

    // Check if URL has ?cert=ID to open modal directly from shared link
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const targetCertId = urlParams.get('cert');
      if (targetCertId) {
        apiFetchCertificates().then((data) => {
          const match = data.find((c) => String(c.id) === targetCertId);
          if (match && isMounted) {
            setInspectItem(match);
          }
        });
      }
    } catch (e) {
      // ignore
    }

    // Periodic sync every 4 seconds so any new certificate created by admin appears live for all visitors
    const timer = setInterval(syncWithServer, 4000);

    // Sync when tab gets focus
    const onFocus = () => syncWithServer();
    window.addEventListener('focus', onFocus);

    return () => {
      isMounted = false;
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  // Sync active modal certificate to browser URL (?cert=ID) so sharing opens this exact certificate
  useEffect(() => {
    try {
      const url = new URL(window.location.href);
      if (inspectItem) {
        url.searchParams.set('cert', String(inspectItem.id));
      } else {
        url.searchParams.delete('cert');
      }
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      // ignore
    }
  }, [inspectItem]);

  // Sync to local cache
  useEffect(() => {
    setCachedCertificates(certificates);
  }, [certificates]);

  const showToast = (text: string, actionText?: string, onAction?: () => void) => {
    setToast({
      id: String(Date.now()),
      text,
      actionText,
      onAction
    });
  };

  // Admin login handlers
  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    sessionStorage.setItem('smart_start_admin_auth', 'true');
    setCurrentScreen('admin');
    showToast(
      language === 'ru'
        ? 'Добро пожаловать в портал сотрудников!'
        : language === 'en'
        ? 'Welcome to Staff Portal!'
        : "Xodimlar tizimiga xush kelibsiz!"
    );
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    sessionStorage.removeItem('smart_start_admin_auth');
    showToast(t.logoutBtn);
  };

  // Certificate CRUD with persistent backend storage
  const handleSaveCertificate = async (itemData: Omit<CertificateItem, 'id'> & { id?: number }) => {
    try {
      if (itemData.id) {
        // Edit existing certificate
        const targetId = itemData.id;
        setCertificates((prev) =>
          prev.map((c) => (c.id === targetId ? ({ ...c, ...itemData } as CertificateItem) : c))
        );

        const updated = await apiUpdateCertificate(targetId, itemData);
        setCertificates((prev) =>
          prev.map((c) => (c.id === targetId ? updated : c))
        );

        showToast("Sertifikat saqlandi!", t.navResults, () => {
          setCurrentScreen('results');
        });
      } else {
        // Add new certificate to server database
        const newCert = await apiCreateCertificate(itemData);
        setCertificates((prev) => [newCert, ...prev.filter((c) => c.id !== newCert.id)]);

        // Trigger celebratory confetti
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.7 }
        });

        showToast("Yangi sertifikat qo'shildi va barcha foydalanuvchilarga ko'rinadi!", t.navResults, () => {
          setCurrentScreen('results');
        });
      }
    } catch (err) {
      console.error("Save certificate failed:", err);
      showToast("Xatolik yuz berdi, qaytadan urinib ko'ring.");
    }

    setEditingItem(null);
    setCurrentScreen('admin');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    const removedName = deleteCandidate.name;
    const deleteId = deleteCandidate.id;
    setDeleteCandidate(null);

    // Optimistic delete
    setCertificates((prev) => prev.filter((c) => c.id !== deleteId));

    try {
      await apiDeleteCertificate(deleteId);
      showToast(`${removedName} sertifikati o'chirildi.`);
    } catch (err) {
      console.error("Delete failed:", err);
      const remote = await apiFetchCertificates();
      setCertificates(remote);
      showToast("O'chirishda xatolik yuz berdi.");
    }
  };

  const handleToggleFeatured = async (id: number) => {
    const currentItem = certificates.find((c) => c.id === id);
    const willBeFeatured = currentItem ? !currentItem.featured : false;

    // Optimistic toggle
    setCertificates((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          showToast(
            willBeFeatured
              ? `"${c.name}" bosh sahifaga qo'shildi!`
              : `"${c.name}" bosh sahifadan olib tashlandi.`
          );
          return { ...c, featured: willBeFeatured };
        }
        return c;
      })
    );

    try {
      await apiToggleFeatured(id, willBeFeatured);
    } catch (err) {
      console.error("Toggle featured failed:", err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm(t.resetConfirm)) {
      try {
        const reset = await apiResetCertificates();
        setCertificates(reset);
        showToast("Ma'lumotlar qayta yuklandi.");
      } catch (err) {
        console.error("Reset failed:", err);
      }
    }
  };

  // Inspect Modal Navigation
  const inspectIndex = inspectItem ? certificates.findIndex((c) => c.id === inspectItem.id) : -1;
  const handlePrevInspect = () => {
    if (inspectIndex > 0) {
      setInspectItem(certificates[inspectIndex - 1]);
    } else {
      setInspectItem(certificates[certificates.length - 1]);
    }
  };
  const handleNextInspect = () => {
    if (inspectIndex < certificates.length - 1) {
      setInspectItem(certificates[inspectIndex + 1]);
    } else {
      setInspectItem(certificates[0]);
    }
  };

  const scrollToFilter = () => {
    const el = document.getElementById('natijalar-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const featuredCount = certificates.filter((c) => c.featured).length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Navbar (only for public views) */}
      {currentScreen !== 'admin' && currentScreen !== 'admin-form' && (
        <Navbar
          currentScreen={currentScreen}
          onNavigate={(screen) => setCurrentScreen(screen)}
          onOpenAdmission={() => setIsAdmissionOpen(true)}
          featuredCount={featuredCount}
        />
      )}

      {/* Screen Routing */}
      {currentScreen === 'admin' ? (
        !isAdminLoggedIn ? (
          <AdminLogin
            onLoginSuccess={handleAdminLogin}
            onGoBack={() => setCurrentScreen('home')}
          />
        ) : (
          <AdminDashboard
            certificates={certificates}
            onSaveCertificate={handleSaveCertificate}
            onDeleteRequest={(item) => setDeleteCandidate(item)}
            onToggleFeatured={handleToggleFeatured}
            onPreview={(item) => setInspectItem(item)}
            onGoToSite={() => setCurrentScreen('home')}
            onLogout={handleAdminLogout}
            onResetData={handleResetData}
          />
        )
      ) : currentScreen === 'admin-form' ? (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
          <CertificateFormModal
            initialItem={editingItem}
            onSave={handleSaveCertificate}
            onCancel={() => {
              setEditingItem(null);
              setCurrentScreen('admin');
            }}
          />
        </div>
      ) : currentScreen === 'results' ? (
        <main className="flex-1">
          {/* Header Bar for Results Search Portal */}
          <div className="bg-[#13294B] text-white py-8 px-4 sm:px-6 border-b border-slate-800">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => setCurrentScreen('home')}
                  className="text-xs text-amber-400 hover:underline mb-2 font-bold flex items-center gap-1 cursor-pointer"
                >
                  {t.backToHome}
                </button>
                <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
                  {t.resultsPageTitle}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {t.resultsPageDesc}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAdmissionOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#CF9E2E] hover:bg-[#b88c27] text-[#13294B] font-extrabold text-sm transition-all shadow-md self-start sm:self-center cursor-pointer"
              >
                {t.applyBtn}
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <ResultsView
              certificates={certificates}
              onOpenCertificate={(item) => setInspectItem(item)}
              onOpenAdmission={() => setIsAdmissionOpen(true)}
            />
          </div>

          <Footer
            onOpenAdmin={() => setCurrentScreen('admin')}
            onGoResults={() => setCurrentScreen('results')}
          />
        </main>
      ) : currentScreen === 'featured' ? (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full py-8">
          <FeaturedShowcase
            certificates={certificates}
            onOpenCertificate={(item) => setInspectItem(item)}
            onGoAllResults={() => setCurrentScreen('results')}
            onOpenAdmission={() => setIsAdmissionOpen(true)}
          />
          <Footer
            onOpenAdmin={() => setCurrentScreen('admin')}
            onGoResults={() => setCurrentScreen('results')}
          />
        </main>
      ) : (
        /* Default: Complete Official Home Page matching all 9 wireframe images */
        <main className="flex-1">
          <HomeView
            certificates={certificates}
            onOpenCertificate={(item) => setInspectItem(item)}
            onGoAllResults={() => setCurrentScreen('results')}
            onOpenAdmissionModal={() => setIsAdmissionOpen(true)}
          />
        </main>
      )}

      {/* Certificate Detailed Lightbox Modal */}
      <CertificateModal
        item={inspectItem}
        onClose={() => setInspectItem(null)}
        onPrev={handlePrevInspect}
        onNext={handleNextInspect}
        currentIndex={inspectIndex >= 0 ? inspectIndex : 0}
        totalCount={certificates.length}
        allCertificates={certificates}
        onSelectIndex={(idx) => setInspectItem(certificates[idx])}
      />

      {/* Admission Inquiry Modal */}
      <AdmissionModal
        isOpen={isAdmissionOpen}
        onClose={() => setIsAdmissionOpen(false)}
      />

      {/* Admin Delete Confirmation Modal */}
      <DeleteConfirmModal
        item={deleteCandidate}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteCandidate(null)}
      />

      {/* Toast Notification Container */}
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

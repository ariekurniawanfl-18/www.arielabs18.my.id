import React, { useState, useEffect } from "react";
import { 
  Upload, User, Edit3, Check, RefreshCw, Briefcase, Award, 
  ShieldCheck, Lock, Unlock, FileCode, Database, AlertCircle, 
  LogOut, Eye, EyeOff, HelpCircle 
} from "lucide-react";

export default function About() {
  // State for loaded details or fallback defaults
  const [aboutData, setAboutData] = useState({
    name: "Harry Ledoh",
    title: "PORTAL ENGINE DESIGNER & FOUNDER ARIELABS18",
    bio: "Saya adalah seseorang yang concern dalam pengembangan Simple Software dan Simple Admin System. Saya fokus dalam pengembangan pelayanan digital, berusaha membantu semua pihak dengan menghadirkan inovasi otomasi administrasi modern untuk berbagai keperluan/kegiatan dengan cepat, praktis dan tanpa ribet.",
    photoUrl: "https://res.cloudinary.com/dhcquhxeu/image/upload/v1781182023/sketsarie_hzngok.jpg" as string | null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Login Protection States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // PHP/MySQL Blueprint Helper Tab State
  const [showBlueprintHelp, setShowBlueprintHelp] = useState(false);

  // Edit fields temp state
  const [editName, setEditName] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editBio, setEditBio] = useState("");

  // Fetch from official database endpoint on mount, with localStorage as immediate cache fallback
  useEffect(() => {
    // 1. Initial local cache check
    let savedName = localStorage.getItem("arielabs_about_name");
    let savedTitle = localStorage.getItem("arielabs_about_title");
    let savedBio = localStorage.getItem("arielabs_about_bio");
    let savedPhoto = localStorage.getItem("arielabs_profile_photo");
    const savedToken = sessionStorage.getItem("arielabs_admin_token");

    // Self-correcting cache migration if the visitor has old name or old bio stored in browser
    if (savedName === "Arie Kurniawan FL" || (savedBio && savedBio.includes("Software Engineer"))) {
      localStorage.removeItem("arielabs_about_name");
      localStorage.removeItem("arielabs_about_title");
      localStorage.removeItem("arielabs_about_bio");
      localStorage.removeItem("arielabs_profile_photo");
      savedName = null;
      savedTitle = null;
      savedBio = null;
      savedPhoto = null;
    }

    if (savedToken) {
      setSessionToken(savedToken);
      setIsLoggedIn(true);
    }

    setAboutData({
      name: savedName || "Harry Ledoh",
      title: savedTitle || "PORTAL ENGINE DESIGNER & FOUNDER ARIELABS18",
      bio: savedBio || "Saya adalah seseorang yang concern dalam pengembangan Simple Software dan Simple Admin System. Saya fokus dalam pengembangan pelayanan digital, berusaha membantu semua pihak dengan menghadirkan inovasi otomasi administrasi modern untuk berbagai keperluan/kegiatan dengan cepat, praktis dan tanpa ribet.",
      photoUrl: savedPhoto || "https://res.cloudinary.com/dhcquhxeu/image/upload/v1781182023/sketsarie_hzngok.jpg",
    });

    // 2. Refresh from actual persistent server-side file database (MySQL simulation)
    fetch("/api/admin/profile")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal terhubung dengan server database");
        return res.json();
      })
      .then((data) => {
        if (data && data.name) {
          setAboutData((prev) => ({
            ...prev,
            name: data.name,
            title: data.title,
            bio: data.bio,
          }));
          // Sync cache
          localStorage.setItem("arielabs_about_name", data.name);
          localStorage.setItem("arielabs_about_title", data.title);
          localStorage.setItem("arielabs_about_bio", data.bio);
        }
      })
      .catch((err) => console.log("Menggunakan data profil lokal cache offline:", err));
  }, []);

  // Sync edit states when editing mode changes
  useEffect(() => {
    setEditName(aboutData.name);
    setEditTitle(aboutData.title);
    setEditBio(aboutData.bio);
  }, [aboutData, isEditing]);

  // Handle Login submission to backend API
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsSubmittingLogin(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: usernameInput,
          password: passwordInput
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        setSessionToken(result.token);
        sessionStorage.setItem("arielabs_admin_token", result.token);
        setIsLoggedIn(true);
        setShowLoginModal(false);
        setIsEditing(true); // Auto-open edit mode upon successful authentication
        triggerSuccess("Autentikasi Berhasil! Mode Admin Aktif.");
        // Reset login inputs
        setUsernameInput("");
        setPasswordInput("");
      } else {
        setLoginError(result.error || "Data login salah atau tidak dikenali.");
      }
    } catch (err) {
      setLoginError("Koneksi gagal! Silakan periksa jaringan server backend Anda.");
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Perform logout action
  const handleLogout = () => {
    setSessionToken(null);
    sessionStorage.removeItem("arielabs_admin_token");
    setIsLoggedIn(false);
    setIsEditing(false);
    triggerSuccess("Sesi admin ditutup secara aman.");
  };

  // Handle Photo upload (FileReader to Base64) with admin permission check
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      setLoginError("Silakan masuk log admin terlebih dahulu untuk memelihara aset foto.");
      return;
    }

    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Ukuran file tidak boleh melebihi 2MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError("Format berkas harus berupa gambar.");
        return;
      }

      setUploadError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          localStorage.setItem("arielabs_profile_photo", result);
          setAboutData((prev) => ({ ...prev, photoUrl: result }));
          triggerSuccess("Foto berhasil diperbarui di cloud lokal!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag-and-drop handlers with admin protection
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginModal(true);
      setLoginError("Autentikasi Admin diperlukan untuk memperbarui foto profil.");
      return;
    }

    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setUploadError("Ukuran file tidak boleh melebihi 2MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setUploadError("Hanya file gambar yang didukung");
        return;
      }
      setUploadError("");
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) {
          localStorage.setItem("arielabs_profile_photo", result);
          setAboutData((prev) => ({ ...prev, photoUrl: result }));
          triggerSuccess("Foto berhasil diunggah!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save changes to database API on the backend
  const saveTextChanges = async () => {
    try {
      const response = await fetch("/api/admin/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          name: editName,
          title: editTitle,
          bio: editBio
        })
      });

      const result = await response.json();
      if (response.ok && result.success) {
        // Match state changes
        setAboutData((prev) => ({
          ...prev,
          name: editName,
          title: editTitle,
          bio: editBio,
        }));

        // Keep local storage safe
        localStorage.setItem("arielabs_about_name", editName);
        localStorage.setItem("arielabs_about_title", editTitle);
        localStorage.setItem("arielabs_about_bio", editBio);

        setIsEditing(false);
        triggerSuccess("Rincian database admin berhasil dimutakhirkan!");
      } else {
        alert(result.error || "Gagal memperbarui database.");
      }
    } catch (e) {
      alert("Gagal terhubung ke modul database. Perubahan disimpan secara lokal sementara.");
      // Client offline fallback editing
      setAboutData((prev) => ({
        ...prev,
        name: editName,
        title: editTitle,
        bio: editBio,
      }));
      setIsEditing(false);
    }
  };

  // Reset to initial original profile details (Protected)
  const resetProfile = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      setLoginError("Autentikasi admin diperlukan untuk mereset data.");
      return;
    }

    if (window.confirm("Apakah Anda ingin mereset profil ke bawaan pabrik di database server?")) {
      const defaults = {
        name: "Harry Ledoh",
        title: "PORTAL ENGINE DESIGNER & FOUNDER ARIELABS18",
        bio: "Saya adalah seseorang yang concern dalam pengembangan Simple Software dan Simple Admin System. Saya fokus dalam pengembangan pelayanan digital, berusaha membantu semua pihak dengan menghadirkan inovasi otomasi administrasi modern untuk berbagai keperluan/kegiatan dengan cepat, praktis dan tanpa ribet."
      };

      fetch("/api/admin/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: sessionToken,
          ...defaults
        })
      }).then(() => {
        localStorage.removeItem("arielabs_about_name");
        localStorage.removeItem("arielabs_about_title");
        localStorage.removeItem("arielabs_about_bio");
        localStorage.removeItem("arielabs_profile_photo");

        setAboutData({
          ...defaults,
          photoUrl: null,
        });
        triggerSuccess("Data profil berhasil direset sepenuhnya!");
      }).catch(() => {
        alert("Gagal memperbarui reset di server database.");
      });
    }
  };

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleEditClick = () => {
    if (isLoggedIn) {
      setIsEditing(true);
    } else {
      setShowLoginModal(true);
    }
  };

  return (
    <section id="tentang-saya" className="py-20 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header section title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono tracking-widest text-brand-red font-bold uppercase">
            Mengenal Lebih Dekat
          </h2>
          <p className="text-3xl sm:text-4xl font-sans font-extrabold tracking-tight text-brand-black mt-2">
            Tentang Founder Arielabs18
          </p>
          <div className="w-16 h-1 bg-brand-gold mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* PHOTO UPLOADER COLUMN */}
          <div className="lg:col-span-5 flex flex-col items-center">
            
            <div className="relative group w-full max-w-[320px]">
              
              {/* Outer Golden Framed Box with animations */}
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-red to-brand-gold rounded-[2rem] blur-sm opacity-50 group-hover:opacity-80 transition duration-300" />
              
              <div className="relative bg-white border border-brand-gold p-4 rounded-[1.85rem] shadow-xl flex flex-col items-center">
                
                {/* Profile Image View */}
                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`w-64 h-64 bg-gray-50 rounded-2xl border-2 border-dashed border-brand-gold/45 relative overflow-hidden flex items-center justify-center transition group/view ${isLoggedIn ? 'cursor-pointer hover:bg-gray-100/60' : 'cursor-default'}`}
                >
                  {aboutData.photoUrl ? (
                    <img
                      src={aboutData.photoUrl}
                      alt="Harry Ledoh"
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-center p-6 text-gray-400">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-brand-gold border border-brand-gold/30 mb-3">
                        <User size={30} />
                      </div>
                      <span className="text-xs font-bold text-gray-700">Arielabs18 Profile</span>
                    </div>
                  )}

                  {/* Drag overlay on hover - Only visible when logged in as admin */}
                  {isLoggedIn && (
                    <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover/view:opacity-100 transition duration-300 flex items-center justify-center text-white text-xs font-bold gap-1">
                      <Upload size={14} className="animate-bounce text-brand-gold" />
                      Seret Gambar ke Sini
                    </div>
                  )}
                </div>

                {/* Upload Action buttons */}
                {isLoggedIn && (
                  <div className="w-full mt-4 flex flex-col space-y-2">
                    <label className="w-full py-2 bg-brand-black text-brand-gold hover:bg-brand-red hover:text-white border border-brand-gold rounded-xl text-center text-xs font-bold uppercase tracking-wider cursor-pointer transition duration-300 flex items-center justify-center gap-2">
                      <Upload size={14} />
                      Unggah / Ganti Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                    </label>
                    
                    {uploadError && (
                      <p className="text-[11px] text-brand-red text-center font-bold mt-1">
                        ⚠️ {uploadError}
                      </p>
                    )}
                    <p className="text-[10px] text-gray-400 text-center font-mono">
                      Maks ukuran: 2MB (Bentuk Persegi optimal)
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Quick credentials badges */}
            <div className="grid grid-cols-2 gap-3 mt-6 w-full max-w-[320px]">
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center space-x-2">
                <Briefcase size={16} className="text-brand-red shrink-0" />
                <div className="text-left">
                  <span className="block text-[10px] font-mono text-gray-400 font-bold uppercase">PROYEK</span>
                  <span className="text-xs font-bold text-brand-black">20+ Selesai</span>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-100 p-3 rounded-xl flex items-center space-x-2">
                <Award size={16} className="text-brand-gold shrink-0" />
                <div className="text-left">
                  <span className="block text-[10px] font-mono text-gray-400 font-bold uppercase">ALUR</span>
                  <span className="text-xs font-bold text-brand-black">100% Otomatis</span>
                </div>
              </div>
            </div>

          </div>

          {/* BIO DETAILS COLUMN */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-4">
            
            {/* Status alerts */}
            {successMsg && (
              <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-r-xl text-sm font-semibold flex items-center space-x-2 animate-fadeIn">
                <Check size={16} className="text-emerald-500 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {!isEditing ? (
              // Normal View Mode
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-2xl font-extrabold font-sans text-brand-black">
                      {aboutData.name}
                    </h3>
                    <div className="flex items-center space-x-2.5 mt-0.5">
                      <p className="text-sm text-brand-red font-bold font-mono uppercase tracking-wider">
                        {aboutData.title}
                      </p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                        isLoggedIn 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300 animate-pulse" 
                          : "bg-amber-50 text-brand-gold border-brand-gold/30"
                      }`}>
                        {isLoggedIn ? "🔓 unlocked" : "🔒 locked"}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2.5">
                    {isLoggedIn && (
                      <button
                        onClick={handleLogout}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-brand-red hover:bg-red-50 rounded-full transition-all border border-gray-100 flex items-center justify-center"
                        title="Tutup Sesi Admin"
                      >
                        <LogOut size={16} />
                      </button>
                    )}
                    <button
                      id="edit-bio-button"
                      onClick={handleEditClick}
                      className={`p-2.5 rounded-full transition-all border flex items-center justify-center ${
                        isLoggedIn 
                          ? "bg-brand-red text-white hover:bg-brand-red-dark border-brand-red" 
                          : "bg-gray-50 text-gray-600 hover:text-brand-red hover:bg-gray-100 border-gray-150"
                      }`}
                      title={isLoggedIn ? "Ubah Rincian Profil" : "Minta Akses Admin Untuk Mengubah"}
                    >
                      {isLoggedIn ? <Edit3 size={16} /> : <Lock size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-gray-600 leading-relaxed font-sans text-base">
                  <p>{aboutData.bio}</p>
                </div>

                {/* Values columns list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-brand-gold/5 border border-brand-gold/20 rounded-xl space-y-1.5">
                    <h4 className="font-sans font-bold text-brand-black text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-red" />
                      Portal Engine Custom
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Layanan instalasi portal yang terstandardisasi untuk kebutuhan data, pendaftaran ibadah, pengumuman sekolah, absensi, dsb.
                    </p>
                  </div>
                  <div className="p-4 bg-brand-black/5 border border-brand-black/10 rounded-xl space-y-1.5">
                    <h4 className="font-sans font-bold text-brand-black text-sm flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-brand-gold" />
                      Administrative Automation
                    </h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Sistem automasi surat baptis/sidi gereja, sistem rekap absensi otomatis, invoice berkala UMKM, dan generator surat otomatis.
                    </p>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4 justify-start">
                  <button
                    onClick={resetProfile}
                    className="text-[11px] font-mono text-gray-400 hover:text-brand-red font-bold uppercase transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={11} />
                    Reset Ke Bawaan Pabrik
                  </button>
                </div>

              </div>
            ) : (
              // Editable Mode (Unlocked via Server-side session verification)
              <div className="space-y-5 bg-gray-50 border-2 border-brand-gold rounded-3xl p-6 sm:p-8 shadow-inner animate-fadeIn relative">
                <div className="absolute top-4 right-4 bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                  ● Admin Terverifikasi
                </div>

                <div className="flex items-center space-x-2 pb-2 border-b border-gray-150">
                  <Unlock size={16} className="text-brand-gold" />
                  <span className="text-sm font-bold font-mono uppercase text-brand-black">Ubah Informasi Diri</span>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Nama Lengkap / Tim
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl font-semibold text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Jabatan / Spesialisasi
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl font-semibold text-brand-black focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Biografi / Deskripsi Diri
                    </label>
                    <textarea
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      rows={6}
                      className="w-full px-3.5 py-2 border border-gray-300 rounded-xl text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold bg-white leading-relaxed"
                    />
                  </div>
                </div>

                <div className="flex space-x-3 pt-2 justify-end">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold uppercase text-xs tracking-wider rounded-xl transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={saveTextChanges}
                    className="px-5 py-2 bg-brand-red text-white hover:bg-brand-red-dark font-bold uppercase text-xs tracking-wider rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check size={14} />
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* GORGEOUS HIGH-CONTRAST GOLD & BLACK SECURITY MODAL WINDOW */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-brand-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-[#18181A] border-2 border-brand-gold/60 w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden relative font-sans text-left">
            
            {/* Modal Header inside block */}
            <div className="px-6 py-5 bg-gradient-to-r from-brand-charcoal to-[#18181A] border-b border-brand-gold/15 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold shrink-0">
                  <Lock size={18} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-extrabold text-sm text-gray-150 leading-tight">
                    Sistem Autentikasi Admin Portal
                  </h3>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#A68D4C] mt-0.5">
                    Secure Administrative Access
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowLoginModal(false);
                  setLoginError("");
                }}
                className="text-gray-400 hover:text-white font-bold text-xs font-mono uppercase bg-brand-charcoal px-3 py-1.5 rounded-lg border border-gray-800 transition cursor-pointer"
              >
                Tutup [X]
              </button>
            </div>

            {/* Inner Content Block */}
            <div className="p-6 sm:p-8 space-y-6">

              {loginError && (
                <div className="bg-red-950/40 border border-brand-red/35 p-3 rounded-xl flex items-center space-x-2 text-xs text-red-300">
                  <AlertCircle size={15} className="text-brand-red shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              {/* Login Active Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    User ID / Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masukkan username admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#111] border border-gray-850 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-gray-400 mb-1.5">
                    Kata Sandi (Password)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Masukkan password rahasia"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-4 py-3 bg-[#111] border border-gray-850 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-gold pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-gray-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingLogin}
                    className="w-full py-3.5 bg-brand-red text-white hover:bg-brand-red-dark font-extrabold uppercase tracking-wide rounded-xl text-xs transition duration-300 flex items-center justify-center gap-2 border border-brand-red cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingLogin ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <>
                        <Unlock size={13} className="text-brand-gold" />
                        Validasi Log Masuk Admin
                      </>
                    )}
                  </button>
                </div>
              </form>

            </div>

          </div>
        </div>
      )}

    </section>
  );
}

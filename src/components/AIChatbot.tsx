import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, X, Send, User, Sparkles, ExternalLink, Phone, Shield, SendHorizontal } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showNotificationBadge, setShowNotificationBadge] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    setMessages([
      {
        id: "initial-greet",
        role: "assistant",
        content: `Halo! Selamat datang di **Arielabs18 Support Desk** 👋.

Kami siap membantu mendiskusikan kebutuhan digitalisasi dan otomasi administrasi instansi Anda secara langsung. Anda dapat berkonsultasi mengenai beberapa hal utama berikut:
*   💰 **Pernyataan Anggaran (Pricing)** & paket pengembangan.
*   ⚙️ **Fokus Solusi Integrasi** (sekolah, pelayanan gereja, yayasan, UMKM kustom).
*   🛠️ **Rancang Spesifikasi & Kustomisasi Fitur**.
*   📍 **Lokasi Kantor & Kontak Kerja Utama**.

*Bila rancangan sistem Anda cukup detail atau memiliki spesifikasi yang kompleks, kami sangat menyarankan Anda mengisi formulir **Rancang Blueprint** di halaman **Sewa Framework** di menu navigasi atas agar rancangan Anda kami pelajari secara matang. Pilihan lainnya, silakan klik tombol **WhatsApp Admin** untuk langsung terhubung ke jalur koordinasi utama kami!*`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  // Scroll to bottom on updates
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const userMessage: Message = {
      id: userMsgId,
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setShowNotificationBadge(false);

        try {
      // Jalur baru langsung menembak infrastruktur cloud 21st Agents yang anti-timeout
      const res = await fetch("https://21st.dev", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_API_KEY_21ST || "21st_sk_10ffaba3d7d0f29425f97d97e5faa2dd0c1dc0c34991b13fd8f8f91447ea1535"}`
        },
        body: JSON.stringify({ 
          agent: "agent", // Nama slug agen Anda yang berstatus ready di cloud
          message: text   // Perintah cetak biru kustomisasi dari pengguna
        }),
      });

      const data = await res.json();

      if (res.ok && data.output) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: "assistant",
            content: data.output, // Jawaban cerdas langsung dari Agen kustom Anda
            timestamp: new Date(),
          },
        ]);
      } else {
        throw new Error(data.error || "Gagal mendapatkan respons dari Agen 21st.");
      }
    } catch (err) {
      console.error("Support desk chat error:", err);
      // Fallback response on error
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: "assistant",
          content: `Maaf, kami mengalami kendala jaringan singkat saat memproses data kustomisasi Anda. 🥺

Silakan langsung tanyakan pesan Anda via Chat WhatsApp Utama kami ke nomor **+62 821 4414 0837** untuk tanggapan kilat administrasi harian bersama tim pengembang Arielabs18!`,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentYear = new Date().getFullYear();

  // Helper to parse mild markdown style directly within React without extra libraries
  const renderMessageContent = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let trimmed = line.trim();

      // Check header level 3
      if (trimmed.startsWith("###")) {
        const headerText = trimmed.replace(/^###\s*/, "");
        return (
          <h4 key={idx} className="text-[#A68D4C] font-extrabold text-sm mt-3 mb-2 font-sans tracking-tight border-b border-brand-gold/10 pb-1">
            {parseInlineStyle(headerText)}
          </h4>
        );
      }

      // Check bullet point
      if (trimmed.startsWith("*") || trimmed.startsWith("-")) {
        const bulletText = trimmed.replace(/^[*+-]\s*/, "");
        return (
          <div key={idx} className="flex items-start space-x-1.5 ml-1 my-1">
            <span className="text-[#A68D4C] font-bold select-none mt-0.5">•</span>
            <span className="text-xs text-gray-700 leading-relaxed font-sans">
              {parseInlineStyle(bulletText)}
            </span>
          </div>
        );
      }

      // Standard empty line
      if (!line) {
        return <div key={idx} className="h-2" />;
      }

      // Regular line
      return (
        <p key={idx} className="text-xs text-gray-700 leading-relaxed my-1 font-sans">
          {parseInlineStyle(line)}
        </p>
      );
    });
  };

  // Safe inline formatter for links [Label](URL) and strong words **bold text**
  const parseInlineStyle = (text: string) => {
    // 1. Matches links pattern [label](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    // 2. Matches bold pattern **bold**
    const boldRegex = /\*\*([^*]+)\*\*/g;

    let parts: React.ReactNode[] = [text];

    // Simple replacement technique for safety
    // Parse Bold tags
    let result: React.ReactNode[] = [];
    parts.forEach((part) => {
      if (typeof part !== "string") {
        result.push(part);
        return;
      }

      const subparts = part.split(boldRegex);
      subparts.forEach((sub, subIdx) => {
        if (subIdx % 2 === 1) {
          result.push(<strong key={`b-${subIdx}`} className="font-extrabold text-brand-black">{sub}</strong>);
        } else {
          result.push(sub);
        }
      });
    });

    parts = result;

    // Parse Link tags
    result = [];
    parts.forEach((part, idx) => {
      if (typeof part !== "string") {
        result.push(part);
        return;
      }

      // Parse with simple manual splitting to construct clickable inline anchor buttons
      const subparts = [];
      let lastIndex = 0;
      let match;

      // Reset regex index
      linkRegex.lastIndex = 0;

      while ((match = linkRegex.exec(part)) !== null) {
        const before = part.substring(lastIndex, match.index);
        if (before) subparts.push(before);

        const label = match[1];
        const url = match[2];

        subparts.push(
          <a
            key={`a-${match.index}`}
            href={url}
            target="_blank"
            rel="noreferrer"
            className="text-brand-red font-bold underline inline-flex items-center gap-0.5 hover:text-brand-gold transition duration-200"
          >
            {label}
            <ExternalLink size={10} className="inline" />
          </a>
        );

        lastIndex = linkRegex.lastIndex;
      }

      const rest = part.substring(lastIndex);
      if (rest) subparts.push(rest);

      if (subparts.length > 0) {
        result.push(...subparts);
      } else {
        result.push(part);
      }
    });

    return result.length > 0 ? result : text;
  };

  const suggestionChips = [
    { label: "💰 Berapa harga sewa?", query: "Berapa estimasi biaya sewa framework di Arielabs18?" },
    { label: "🛠️ Cara rancang blueprint", query: "Bagaimana cara merancang blueprint sistem di halaman Sewa?" },
    { label: "⚙️ Pilihan fokus otomasi", query: "Bisa jelaskan apa saja pilihan fokus layanan otomatisasi di Arielabs18?" },
    { label: "📞 Hubungi WhatsApp Admin", query: "Minta informasi kontak WhatsApp utama dan platform resmi Arielabs18." },
    { label: "📍 Alamat kantor resmi", query: "Di mana alamat lokasi kantor resmi Arielabs18?" },
  ];

  return (
    <div id="support-desk-chat-root" className="fixed bottom-6 left-4 sm:left-6 z-50 select-none">
      
      {/* TRIGGER FLOATING CHAT BUTTON */}
      <button
        id="support-chat-trigger-btn"
        onClick={() => {
          setIsOpen(!isOpen);
          setShowNotificationBadge(false);
        }}
        className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-full shadow-2xl transition-all duration-300 border border-emerald-400 cursor-pointer focus:outline-none group hover:scale-105 active:scale-95"
        title="Konsultasi & Tanya Jawab"
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare size={20} className="text-white group-hover:rotate-12 transition-transform duration-300" />
          {showNotificationBadge && (
            <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-red border border-white"></span>
            </span>
          )}
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 text-xs font-mono font-bold tracking-wider block whitespace-nowrap">
          DISKUSI PORTAL & CHAT
        </span>
      </button>

      {/* CHAT WINDOW INTERFACE OVERLAY */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="support-chat-window-container"
            initial={{ opacity: 0, y: 50, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-16 left-0 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] max-h-[calc(100vh-120px)] bg-white rounded-2xl shadow-2xl border-2 border-brand-gold/35 overflow-hidden flex flex-col z-50"
          >
            
            {/* CARD HEADER */}
            <div className="bg-brand-black px-4 py-3.5 border-b-2 border-brand-gold/40 flex justify-between items-center relative">
              <div className="flex items-center space-x-2.5">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-brand-gold/15 border border-brand-gold flex items-center justify-center text-brand-gold">
                    <Shield size={16} />
                  </div>
                  <div className="absolute right-0 bottom-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-brand-black" title="Support Desk Aktif" />
                </div>
                <div className="text-left">
                  <h3 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono">
                    Arielabs18 Support
                    <Sparkles size={11} className="text-brand-gold animate-bounce" />
                  </h3>
                  <p className="text-[10px] text-emerald-400 font-mono font-bold">● RESPONDEN KONSULTASI ONLINE</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* DIRECT ESCALATION TO OFFICIAL WHATSAPP */}
                <a
                  href="https://wa.me/6282144140837"
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 transition shadow-md border border-emerald-400 cursor-pointer text-center"
                  title="Hubungi WhatsApp Admin Utama"
                >
                  <Phone size={10} />
                  WA Admin
                </a>

                {/* CLOSE WINDOW */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-lg transition cursor-pointer focus:outline-none"
                  aria-label="Tutup form diskusi"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* MESSAGE CHRONOLOGY WATERFALL */}
            <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/70 space-y-3 scrollbar-thin">
              {messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-2.5 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-7 h-7 rounded-full bg-brand-black/90 border border-brand-gold flex items-center justify-center text-brand-gold flex-shrink-0 mt-0.5">
                        <Shield size={12} />
                      </div>
                    )}
                    
                    <div
                      className={`max-w-[80%] rounded-xl px-3.5 py-2.5 shadow-sm ${
                        isUser
                          ? "bg-brand-red text-white rounded-tr-none text-xs leading-relaxed font-sans"
                          : "bg-white text-gray-800 border border-gray-150 rounded-tl-none font-sans"
                      }`}
                    >
                      {isUser ? (
                        <p className="text-xs break-words">{msg.content}</p>
                      ) : (
                        <div className="space-y-1">{renderMessageContent(msg.content)}</div>
                      )}
                      <span className={`block text-[8px] mt-1.5 text-right font-mono ${isUser ? "text-red-200" : "text-gray-400"}`}>
                        {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    {isUser && (
                      <div className="w-7 h-7 rounded-full bg-brand-red text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 shadow">
                        <User size={13} />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex items-start space-x-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-black/90 border border-brand-gold flex items-center justify-center text-brand-gold flex-shrink-0 mt-0.5">
                    <Shield size={12} />
                  </div>
                  <div className="bg-white text-gray-700 border border-gray-150 rounded-xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 bg-[#A68D4C] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#A68D4C] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-[#A68D4C] rounded-full animate-bounce"></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* SHOPEE-STYLE CLICKABLE SUGGESTIONS DRAWER */}
            <div className="bg-white border-t border-gray-150 px-3 py-2 scrollbar-none overflow-x-auto flex space-x-2 items-center flex-shrink-0">
              <span className="text-[9px] text-[#A68D4C] uppercase tracking-wider font-mono font-extrabold whitespace-nowrap mr-1 select-none flex items-center gap-0.5">
                <Sparkles size={9} /> Panduan:
              </span>
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.query)}
                  disabled={isLoading}
                  className="px-2.5 py-1 bg-gray-50 hover:bg-brand-red/10 border border-gray-200 hover:border-brand-red text-gray-700 hover:text-brand-red text-[10px] font-semibold rounded-full whitespace-nowrap transition cursor-pointer focus:outline-none disabled:opacity-50"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* MASSIVE DIRECT WHATSAPP PROMOTION DRAWER */}
            <div className="bg-[#eafaf1] px-3.5 py-2 border-t border-emerald-150/50 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center space-x-1.5">
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                <p className="text-[10px] text-emerald-800 font-semibold font-sans leading-none">
                  Ingin beralih langsung ke WhatsApp utama admin?
                </p>
              </div>
              <a
                href="https://wa.me/6282144140837"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-emerald-700 hover:text-emerald-900 font-extrabold underline uppercase inline-flex items-center gap-0.5 cursor-pointer animate-pulse"
              >
                Chat WA
                <ExternalLink size={9} />
              </a>
            </div>

            {/* INPUT FOUL AREA CONTAINER */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="p-3 bg-white border-t border-gray-150 flex items-center space-x-2 flex-shrink-0"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder="Diskusikan rancangan atau pertanyaan Anda harian disini..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:bg-white focus:outline-none focus:ring-1 focus:ring-brand-gold transition text-gray-800 font-sans"
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-brand-black hover:bg-brand-red text-white p-2.5 rounded-xl border border-brand-gold/45 hover:border-brand-red shadow flex items-center justify-center transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none"
                aria-label="Kirim pesan"
              >
                <SendHorizontal size={14} className="text-[#A68D4C]" />
              </button>
            </form>

            {/* FOOTER COOP PORTAL */}
            <div className="bg-gray-50 px-3 py-1.5 text-center text-[8px] text-gray-400 border-t border-gray-100 font-mono">
              Arielabs18 Support Desk • © {currentYear} Kupang - NTT
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

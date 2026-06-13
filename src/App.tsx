import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import About from "./components/About";
import Services from "./components/Services";
import Portfolio from "./components/Portfolio";
import OrderForm from "./components/OrderForm";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import AIChatbot from "./components/AIChatbot";
import { ArrowUp, Sparkles, MessageSquare } from "lucide-react";

export default function App() {
  const [activeSection, setActiveSection] = useState("beranda");
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor simple scroll position for the Back to Top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const changeSection = (sectionId: string) => {
    setActiveSection(sectionId);
    // Smooth scroll back to top of the screen on tab change
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between selection:bg-brand-gold selection:text-brand-black">
      {/* Sticky Header Nav */}
      <Header activeSection={activeSection} onSectionChange={changeSection} />

      {/* Main Container rendering individual view routes dynamically */}
      <main className="flex-1">
        {activeSection === "beranda" && (
          <motion.div
            key="beranda"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Hero onNavigate={changeSection} />
          </motion.div>
        )}

        {activeSection === "tentang-saya" && (
          <motion.div
            key="tentang-saya"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <About />
          </motion.div>
        )}

        {activeSection === "layanan" && (
          <motion.div
            key="layanan"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Services />
          </motion.div>
        )}

        {activeSection === "portfolio" && (
          <motion.div
            key="portfolio"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Portfolio />
          </motion.div>
        )}

        {activeSection === "order" && (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <OrderForm />
          </motion.div>
        )}

        {activeSection === "kontak" && (
          <motion.div
            key="kontak"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Contact />
          </motion.div>
        )}
      </main>

      {/* Footer System with required copyright info */}
      <Footer onNavigate={changeSection} />

      {/* SCROLL-TO-TOP FLOATING ACTION BUTTON */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          id="scroll-to-top-button"
          className="fixed bottom-6 right-6 z-40 bg-brand-black text-[#A68D4C] border border-brand-gold/60 p-3.5 rounded-full select-none cursor-pointer hover:bg-brand-red hover:text-white transition duration-300 shadow-xl flex items-center justify-center animate-fadeIn"
          title="Kembali ke Atas"
        >
          <ArrowUp size={18} />
        </button>
      )}

      {/* PORTAL AI CHATBOT COPILOT 1x24 JAM (WITH INTEGRATED WHATSAPP HANDOVER) */}
      <AIChatbot />

    </div>
  );
}

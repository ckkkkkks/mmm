import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionTemplate } from 'framer-motion';

// --- CUSTOM COMPONENTS ---

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

const ScrambleIn = ({ text, delay, triggered }: { text: string, delay: number, triggered: boolean }) => {
  const [displayText, setDisplayText] = useState('\u00A0');

  useEffect(() => {
    if (!triggered) return;
    let progress = 0;
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        progress += 0.5;
        if (progress >= text.length) {
          setDisplayText(text);
          clearInterval(interval);
        } else {
          let out = '';
          for (let i = 0; i < text.length; i++) {
            if (text[i] === ' ') { out += ' '; continue; }
            if (i < progress) out += text[i];
            else if (i < Math.floor(progress + 3)) out += CHARS[Math.floor(Math.random() * CHARS.length)];
            else out += '';
          }
          setDisplayText(out || '\u00A0');
        }
      }, 25);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [triggered, text, delay]);

  return <span>{displayText}</span>;
};

const ScrambleText = ({ text, isHovered, className }: { text: string, isHovered: boolean, className?: string }) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    if (!isHovered) {
      setDisplayText(text);
      return;
    }
    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.25;
      if (progress >= text.length) {
        setDisplayText(text);
        clearInterval(interval);
      } else {
        let out = '';
        for (let i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          if (i < progress) out += text[i];
          else out += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
        setDisplayText(out);
      }
    }, 25);
    return () => clearInterval(interval);
  }, [isHovered, text]);

  return <span className={className}>{displayText}</span>;
};

const SynapseXLogo = ({ className }: { className?: string }) => (
  <svg viewBox="-50 -50 100 100" className={className} fill="currentColor">
    <path d="M 1.5,23 L 1.5,33 C 1.5,38.5 6,43 11.5,43 L 16.5,43 C 22,43 26.5,38.5 26.5,33 Q 28,28 33,26.5 C 38.5,26.5 43,22 43,16.5 L 43,11.5 C 43,6 38.5,1.5 33,1.5 L 23,1.5 Q 12,12 1.5,23 Z" />
    <path d="M -1.5,23 L -1.5,33 C -1.5,38.5 -6,43 -11.5,43 L -16.5,43 C -22,43 -26.5,38.5 -26.5,33 Q -28,28 -33,26.5 C -38.5,26.5 -43,22 -43,16.5 L -43,11.5 C -43,6 -38.5,1.5 -33,1.5 L -23,1.5 Q -12,12 -1.5,23 Z" transform="rotate(90)" />
    <path d="M -1.5,-23 L -1.5,-33 C -1.5,-38.5 -6,-43 -11.5,-43 L -16.5,-43 C -22,-43 -26.5,-38.5 -26.5,-33 Q -28,-28 -33,-26.5 C -38.5,-26.5 -43,-22 -43,-16.5 L -43,-11.5 C -43,-6 -38.5,-1.5 -33,-1.5 L -23,-1.5 Q -12,-12 -1.5,-23 Z" transform="rotate(180)" />
    <path d="M 1.5,-23 L 1.5,-33 C 1.5,-38.5 6,-43 11.5,-43 L 16.5,-43 C 22,-43 26.5,-38.5 26.5,-33 Q 28,-28 33,-26.5 C 38.5,-26.5 43,-22 43,-16.5 L 43,-11.5 C 43,-6 38.5,-1.5 33,-1.5 L 23,-1.5 Q 12,-12 1.5,-23 Z" transform="rotate(270)" />
  </svg>
);

const SquashHamburger = ({ isOpen }: { isOpen: boolean }) => {
  return (
    <div className="relative w-[15px] h-[10px] md:w-[18px] md:h-[12px] flex flex-col justify-between">
      <motion.span 
        animate={isOpen ? { rotate: 45, y: '4px' } : { rotate: 0, y: 0 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-full bg-white block rounded-full" style={{ height: '1.5px' }} />
      <motion.span 
        animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }} 
        className="w-full bg-white block rounded-full" style={{ height: '1.5px' }} />
      <motion.span 
        animate={isOpen ? { rotate: -45, y: '-4px' } : { rotate: 0, y: 0 }} 
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="w-full bg-white block rounded-full" style={{ height: '1.5px' }} />
    </div>
  );
};

// --- APP MAIN ---

export default function App() {
  const [entranceComplete, setEntranceComplete] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [aboutHover, setAboutHover] = useState(false);
  const [metricsHover, setMetricsHover] = useState(false);
  
  const heroVideoRef = useRef<HTMLVideoElement>(null);
  const lastX = useRef(0);
  const targetTime = useRef(0);
  const isSeeking = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => setEntranceComplete(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Hero Video Scrubbing Logic
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (lastX.current === 0) { lastX.current = e.clientX; return; }
      const deltaX = e.clientX - lastX.current;
      lastX.current = e.clientX;

      if (heroVideoRef.current && heroVideoRef.current.duration) {
        const sensitivity = 0.8;
        let newTime = targetTime.current + (deltaX * sensitivity * 0.01);
        newTime = Math.max(0, Math.min(newTime, heroVideoRef.current.duration));
        targetTime.current = newTime;

        if (!isSeeking.current) {
          isSeeking.current = true;
          heroVideoRef.current.currentTime = targetTime.current;
        }
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleHeroSeeked = () => {
    if (heroVideoRef.current && Math.abs(heroVideoRef.current.currentTime - targetTime.current) > 0.05) {
      heroVideoRef.current.currentTime = targetTime.current;
    } else {
      isSeeking.current = false;
    }
  };

  // Section 2 Scroll Parallax
  const section2Ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: section2Ref, offset: ["start end", "end start"] });
  const springY = useSpring(useTransform(scrollYProgress, [0, 1], [60, -120]), { stiffness: 15, damping: 32, mass: 1.8 });
  const rotateTransform = useMotionTemplate`rotateX(24deg) translateY(${springY}px) translateZ(15px)`;
  const opacityTransform = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);

  return (
    <div className="w-full bg-black min-h-screen font-[var(--font-space-mono)]">
      
      {/* NAVBAR */}
      <motion.nav 
        initial={{ opacity: 0 }} animate={{ opacity: entranceComplete ? 1 : 0 }} transition={{ duration: 0.8 }}
        className="fixed top-0 left-0 w-full h-20 z-50 px-4 sm:px-6 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {/* Logo Pill */}
          <motion.div 
            className={`glass-panel h-9 sm:h-12 px-3.5 sm:px-5 flex items-center justify-center gap-2 overflow-hidden ${menuOpen ? 'w-0 opacity-0 px-0 sm:w-auto sm:opacity-100 sm:px-5' : 'rounded-[10px] sm:rounded-[14px]'}`}
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.22)' }}
            whileTap={{ scale: 0.98 }}
            style={{ originX: 0 }}
            animate={{ width: menuOpen && window.innerWidth < 640 ? 0 : 'auto', opacity: menuOpen && window.innerWidth < 640 ? 0 : 1 }}
          >
            <SynapseXLogo className="w-[14px] h-[14px] sm:w-[18px] sm:h-[18px] text-white" />
            <span className="text-[13px] sm:text-[16px] font-medium tracking-tight text-white">SynapseX</span>
          </motion.div>

          {/* Menu Capsule */}
          <motion.div 
            initial={false}
            animate={{ width: menuOpen ? (window.innerWidth < 640 ? 'calc(100vw - 120px)' : 290) : (window.innerWidth < 640 ? 36 : 48) }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={`h-9 sm:h-12 bg-white/15 backdrop-blur-md flex items-center overflow-hidden ${menuOpen ? 'rounded-[10px] sm:rounded-[14px]' : 'rounded-[10px] sm:rounded-[14px] justify-center'}`}
          >
            <button 
              onClick={() => setMenuOpen(!menuOpen)}
              className={`flex-shrink-0 flex items-center justify-center ${menuOpen ? 'w-7 h-7 sm:w-9 sm:h-9 bg-white/10 hover:bg-white/20 ml-1 sm:ml-1.5 rounded-[8px] sm:rounded-[11px]' : 'w-9 h-9 sm:w-12 sm:h-12'}`}
            >
              <SquashHamburger isOpen={menuOpen} />
            </button>
            {menuOpen && (
              <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} className="flex gap-6 ml-4 sm:ml-6 whitespace-nowrap">
                <a href="#about" onMouseEnter={() => setAboutHover(true)} onMouseLeave={() => setAboutHover(false)} onClick={() => window.scrollTo({top: window.innerHeight, behavior: 'smooth'})} className="text-[13px] sm:text-[16px] text-white/85 hover:text-white cursor-pointer">
                  <ScrambleText text="About" isHovered={aboutHover} />
                </a>
                <a href="#metrics" onMouseEnter={() => setMetricsHover(true)} onMouseLeave={() => setMetricsHover(false)} onClick={() => window.scrollTo({top: window.innerHeight*2, behavior: 'smooth'})} className="text-[13px] sm:text-[16px] text-white/85 hover:text-white cursor-pointer">
                  <ScrambleText text="Metrics" isHovered={metricsHover} />
                </a>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Download Button */}
        <motion.button 
          onMouseEnter={() => setBtnHover(true)} onMouseLeave={() => setBtnHover(false)}
          whileHover={{ scale: 1.03, backgroundColor: '#e2e2e6' }} whileTap={{ scale: 0.97 }}
          className="h-9 sm:h-12 px-3.5 sm:px-6 bg-white rounded-full flex items-center gap-2 text-black"
        >
          <i className="bi bi-apple text-[14px] sm:text-[16px]"></i>
          <span className="text-[13px] sm:text-[16px] font-medium"><ScrambleText text="Download" isHovered={btnHover} /></span>
        </motion.button>
      </motion.nav>

      {/* SECTION 1: Hero */}
      <section className="relative w-full h-[100dvh] flex flex-col px-4 sm:px-6 md:px-8 pt-20 sm:pt-24 pb-8 sm:pb-12 overflow-hidden">
        <video 
          ref={heroVideoRef} onSeeked={handleHeroSeeked}
          className="absolute inset-0 w-full h-full object-cover z-0"
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_083515_290e5a10-0b95-41af-a5e2-32b6389baa4d.mp4" 
          muted playsInline preload="auto"
        />
        <div className="absolute inset-0 z-0 pointer-events-none opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        
        {/* Watermark */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none translate-y-[50px]">
          <h1 style={{ fontFamily: 'var(--font-anton)', fontSize: 'clamp(120px, 30vw, 521px)', letterSpacing: '-4px', background: 'radial-gradient(circle, rgba(142,127,148,0) 0%, #8E7F94 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', opacity: 0.10 }} className="uppercase leading-none select-none">
            TRANSCENDENCE
          </h1>
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: entranceComplete ? 1 : 0 }} transition={{ duration: 1 }} className="flex-1 flex flex-col justify-end z-20">
          <div className="pointer-events-none absolute inset-0 z-10">
            <div className="absolute right-[-10%] top-[10%] h-64 w-64 rounded-full bg-violet-500/20 blur-[120px]" />
            <div className="absolute left-[-8%] bottom-[8%] h-64 w-64 rounded-full bg-cyan-500/15 blur-[120px]" />
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between relative z-20">
            <div className="flex flex-col gap-4">
              <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)]">
                <ScrambleIn text="Brain" delay={200} triggered={entranceComplete} /><br/>
                <ScrambleIn text="And Body" delay={500} triggered={entranceComplete} />
              </h1>
              {entranceComplete && (
                <motion.p initial={{ y: 25, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: [0.215, 0.610, 0.355, 1.000] }} className="max-w-sm text-[13px] sm:text-[15px] text-white/60 leading-relaxed font-sans">
                  Built at the intersection of neuroscience and artificial intelligence. SynapseX continuously maps neural pathways, cognitive load, and physiological states into a single adaptive intelligence layer.
                </motion.p>
              )}

              {entranceComplete && (
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex flex-wrap gap-3 pt-2">
                  <a href="#about" className="glass-panel rounded-full px-4 py-2 text-[12px] sm:text-[13px] font-medium text-white hover:bg-white/10 transition-colors">
                    Explore system
                  </a>
                  <a href="#metrics" className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[12px] sm:text-[13px] font-medium text-white/80 hover:text-white transition-colors">
                    View metrics
                  </a>
                </motion.div>
              )}
            </div>
            <h1 className="text-white font-light leading-[0.95] tracking-[-0.03em] text-[clamp(40px,10vw,100px)] text-left md:text-right">
              <ScrambleIn text="One" delay={700} triggered={entranceComplete} /><br/>
              <ScrambleIn text="Network" delay={1000} triggered={entranceComplete} />
            </h1>
          </div>
        </motion.div>
      </section>

      {/* SECTION 2: Cinematic Text */}
      <section ref={section2Ref} id="about" className="relative w-full h-[100dvh] flex items-center justify-center overflow-hidden">
        <video className="absolute inset-0 w-full h-full object-cover z-0" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_092455_089c54f8-3b03-4966-9df1-e9746063d0ef.mp4" autoPlay muted loop playsInline />
        <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-b from-[#010103] to-transparent z-10"></div>
        <motion.div
          style={{
            transform: rotateTransform,
            opacity: opacityTransform,
            perspective: '400px',
          }}
          className="relative z-20 max-w-5xl px-6 sm:px-12"
        >
          <motion.p style={{ transform: rotateTransform }} className="font-sans font-normal text-[22px] sm:text-[30px] md:text-[36px] lg:text-[42px] text-white leading-[1.35] tracking-[-0.02em] select-none text-center">
            A neural-AI interface built on the architecture of the human nervous system. SynapseX translates synaptic activity into computational intelligence. Every signal becomes measurable, structured, and visible. It continuously reconstructs internal state as a dynamic neural map. Biological noise is filtered into actionable cognitive patterns.
          </motion.p>
        </motion.div>
      </section>

      {/* SECTION 3: Metrics */}
      <section id="metrics" className="relative w-full min-h-screen flex flex-col items-center pt-32 pb-32 px-6">
        <video className="absolute inset-0 w-full h-full object-cover z-0" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095810_ecea3dd2-fc5e-4e41-8696-4219290b6589.mp4" autoPlay muted loop playsInline />
        <div className="relative z-10 w-full max-w-6xl">
          <motion.h4 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.2 }} viewport={{ once: true, amount: 0.3 }} className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-20 text-center">
            Performance Metrics
          </motion.h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 text-center">
            {[
              { val: "2.4ms", label: "Synaptic Latency" },
              { val: "99.7%", label: "Signal Accuracy" },
              { val: "140B", label: "Neural Parameters" }
            ].map((m, i) => (
              <motion.div key={i} initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: i * 0.15 }} viewport={{ once: true }}>
                <div className="text-white text-[clamp(48px,10vw,96px)] font-light tracking-[-0.04em] leading-none">{m.val}</div>
                <div className="text-white/40 text-[13px] sm:text-[15px] mt-4 tracking-wide">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: Technology */}
      <section className="relative w-full h-[100dvh] flex flex-col px-8 sm:px-12 md:px-16 py-12 sm:py-16">
        <video className="absolute inset-0 w-full h-full object-cover z-0" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_095750_32a52ce0-2005-45c9-9093-41f03fde9530.mp4" autoPlay muted loop playsInline />
        
        <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-start gap-6">
          <motion.h2 initial={{ y: 40, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1.0 }} viewport={{ once: true, amount: 0.3 }} className="text-white font-light text-[clamp(36px,8vw,72px)] leading-[0.95] tracking-[-0.03em]">
            Adaptive /<br/>Intelligence
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1.0, delay: 0.2 }} viewport={{ once: true }} className="text-white/50 text-[13px] sm:text-[15px] leading-relaxed max-w-xs md:text-right md:pt-2">
            The system learns your neural baseline within 72 hours. From there, every cognitive state is mapped, predicted, and optimized in real time.
          </motion.p>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-6">
          {[
            { t: "Cortical Mapping", d: "Real-time spatial reconstruction of active neural regions." },
            { t: "Signal Isolation", d: "Separates cognitive intent from biological noise." },
            { t: "State Prediction", d: "Anticipates cognitive transitions before they occur." },
            { t: "Loop Feedback", d: "Closed-loop adjustment based on outcome correlation." }
          ].map((item, i) => (
            <motion.div key={i} initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 + (i * 0.1) }} viewport={{ once: true }}>
              <h4 className="text-white text-[14px] sm:text-[16px] font-normal mb-2">{item.t}</h4>
              <p className="text-white/40 text-[12px] sm:text-[14px] leading-relaxed">{item.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 5: Architecture */}
      <section className="relative w-full min-h-screen bg-black flex flex-col items-center justify-center px-6 py-32">
        <motion.div initial={{ y: 30, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1.0 }} viewport={{ once: true, amount: 0.4 }} className="max-w-3xl text-center">
          <h4 className="text-white/40 text-[13px] sm:text-[14px] tracking-[0.2em] uppercase mb-8">Architecture</h4>
          <h2 className="text-white font-light text-[clamp(28px,6vw,56px)] leading-[1.15] tracking-[-0.02em] mb-10">
            Three layers. Zero friction.
          </h2>
          <p className="text-white/45 text-[15px] sm:text-[17px] leading-relaxed max-w-xl mx-auto">
            Sensor layer captures raw bioelectric signals. Processing layer isolates intent. Interface layer delivers structured output to any connected system.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.2, delay: 0.4 }} viewport={{ once: true, amount: 0.4 }} className="mt-20 flex flex-col items-center gap-4 w-full">
          {[
            { l: "Layer 1", t: "Capture" },
            { l: "Layer 2", t: "Process" },
            { l: "Layer 3", t: "Interface" }
          ].map((card, i) => (
            <div key={i} className="w-full max-w-md h-[72px] border border-white/10 rounded-lg flex items-center justify-between px-6 bg-black hover:bg-white/5 transition-colors">
              <span className="text-white/30 text-[12px] tracking-[0.15em] uppercase">{card.l}</span>
              <span className="text-white text-[16px] sm:text-[18px] font-light">{card.t}</span>
            </div>
          ))}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-black overflow-hidden flex flex-col md:flex-row min-h-[400px]">
        <div className="w-full md:w-1/2 h-[300px] md:h-auto relative">
          <video className="absolute inset-0 w-full h-full object-cover" src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260622_080203_fd7f4f85-3a86-4837-8192-85e7bfe68e75.mp4" autoPlay muted loop playsInline />
        </div>
        <div className="w-full md:w-1/2 flex flex-col justify-between p-10 sm:p-16">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <SynapseXLogo className="w-[18px] h-[18px] text-white/70" />
              <span className="text-[15px] font-medium text-white/70 tracking-tight">SynapseX</span>
            </div>
            <p className="text-white/40 text-[14px] sm:text-[15px] leading-relaxed max-w-sm">
              The next evolution of human-machine interaction. Built for those who refuse to be limited by biology alone.
            </p>
          </div>
          <div className="text-white/25 text-[12px] mt-12">
            (c) 2026 SynapseX Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
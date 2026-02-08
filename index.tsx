import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import { 
  Send, 
  Search, 
  Shield, 
  Terminal, 
  X, 
  ExternalLink, 
  Loader2, 
  Zap,
  Globe,
  Bot,
  User, 
  Activity,
  Cpu,
  Database,
  Wifi,
  HardDrive,
  AlertTriangle,
  TrendingUp,
  Maximize2,
  ChevronRight,
  Plane,
  Code,
  Users,
  Lock,
  MessageSquare,
  ChevronLeft,
  Settings,
  Key,
  Webhook,
  RefreshCw,
  Eye,
  Radar,
  Home,
  Info,
  CreditCard,
  Briefcase,
  Layers,
  Phone,
  LayoutGrid,
  Menu,
  CheckCircle2,
  FileText
} from 'lucide-react';

// Initialize the AI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface Message {
  role: 'user' | 'model';
  content: string;
  sources?: { uri: string; title: string }[];
  timestamp: string;
}

interface LogEntry {
  id: string;
  type: 'info' | 'warn' | 'success' | 'danger';
  text: string;
  time: string;
}

const AYFJ_SYSTEM_INSTRUCTION = `
You are the AYFJ NEXUS Core (v6.0-ULTRA).
AYFJ Group is an elite cybersecurity collective and professional services provider.

Motto: "Secure. Collaborative. Future-Focused."

ETHICAL MANDATE:
This project is strictly for ETHICAL, EDUCATIONAL, and DEFENSIVE purposes.
AYFJ Group supports GitHub Community Guidelines and promotes responsible disclosure.

CAPABILITIES:
1. Cybersecurity Intelligence: Provide real-time data on vulnerabilities and threats (use Google Search).
2. Urban Innovation: Information on AYFJ City Tours in NYC, Paris, and Tokyo.
3. Tech Consultation: Expert advice on software architecture and digital protection.
4. Logistics Security: VIP travel, hotel, and flight security protocols.

When a user asks to "visit" a site or find "news", use your search tool. 
Always provide grounding sources as clickable links.
Maintain a professional, highly intelligent, "command-center" persona.
`;

const App = () => {
  const [isNexusOpen, setIsNexusOpen] = useState(false);
  const [isNetBotOpen, setIsNetBotOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'model', 
      content: 'NEXUS ONLINE. Uplink stable. Secure channel established for AYFJ Group operations. [ETHICAL PROTOCOLS ENGAGED]', 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNetBotLoading, setIsNetBotLoading] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [threatLevel, setThreatLevel] = useState(12);
  const [navSearch, setNavSearch] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Advanced System Log Simulation
  useEffect(() => {
    const logTypes: LogEntry['type'][] = ['info', 'info', 'success', 'info', 'warn'];
    const logMessages = [
      "Packet handshake protocol v6.2 initiated",
      "Nodes in Tokyo synchronized",
      "SSL handshakes validated on node-09",
      "Neural stack allocated for Search Grounding",
      "Encrypted tunnel via AYFJ-Proxy-X",
      "DB query optimized: threat_index_v4",
      "Firewall updated for Layer 7 protection",
      "Scanning decentralized assets...",
      "Ethical compliance check: PASSED"
    ];

    const interval = setInterval(() => {
      const newLog: LogEntry = {
        id: Math.random().toString(36).substr(2, 9),
        type: logTypes[Math.floor(Math.random() * logTypes.length)],
        text: logMessages[Math.floor(Math.random() * logMessages.length)],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
      setThreatLevel(prev => Math.max(5, Math.min(95, prev + (Math.random() * 2 - 1))));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const fetchWithRetry = async (contents: any[], retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: contents,
          config: {
            systemInstruction: AYFJ_SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
          },
        });
        return response;
      } catch (error: any) {
        console.warn(`Attempt ${i + 1} failed:`, error);
        const isInternalError = error.message?.includes('500') || error.message?.includes('INTERNAL');
        if (i === retries - 1 || !isInternalError) throw error;
        await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
      }
    }
    throw new Error('Retries exhausted');
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    
    setIsNexusOpen(true);
    const userMessage = text.trim();
    setInput('');
    
    const newUserMsg: Message = { role: 'user', content: userMessage, timestamp: new Date().toLocaleTimeString() };
    const currentMessagesSnapshot = [...messages];
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const historyForApi = currentMessagesSnapshot
        .filter((m, idx) => !(idx === 0 && m.role === 'model'))
        .map(m => ({ role: m.role, parts: [{ text: m.content }] }));
      
      const contents = [...historyForApi, { role: 'user', parts: [{ text: userMessage }] }];
      const response = await fetchWithRetry(contents);

      const textOutput = response.text || "PROTOCOL_ERROR: Null response from Nexus Core.";
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const sources = groundingChunks?.map((chunk: any) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title
      })).filter((s: any) => s.uri && s.title) || [];

      setMessages(prev => [...prev, { 
        role: 'model', 
        content: textOutput,
        sources,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.message?.includes('500') || error.message?.includes('INTERNAL')
        ? "CORE_STALL: Nexus is experiencing heavy load. Please re-initiate uplink in a few seconds."
        : "CRITICAL FAILURE: Neural connection disrupted. Please check your uplink.";
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: errorMsg,
        timestamp: new Date().toLocaleTimeString() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const simulateNetBotAction = () => {
    setIsNetBotLoading(true);
    setTimeout(() => {
      setIsNetBotLoading(false);
    }, 3500);
  };

  const handleNavSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = navSearch.trim().toLowerCase();
    if (!query) return;

    const targets = [
      { id: 'home', keywords: ['home', 'main', 'intro', 'welcome', 'start'] },
      { id: 'tours', keywords: ['tour', 'city', 'nyc', 'paris', 'tokyo', 'travel', 'trip', 'urban'] },
      { id: 'consultation', keywords: ['consult', 'service', 'expert', 'advice', 'strategic', 'help'] },
      { id: 'software', keywords: ['software', 'code', 'app', 'nexus', 'suite', 'develop', 'os'] },
      { id: 'vip', keywords: ['vip', 'price', 'member', 'cost', 'matrix', 'elite', 'pricing', 'membership'] },
      { id: 'testimonials', keywords: ['testim', 'review', 'client', 'signal', 'feedback', 'say'] },
      { id: 'contact', keywords: ['contact', 'email', 'mail', 'comm', 'broadcast', 'signal', 'message', 'talk'] },
      { id: 'about', keywords: ['about', 'company', 'mission', 'vision', 'who', 'group', 'ethical', 'legal'] }
    ];

    const match = targets.find(t => t.keywords.some(k => query.includes(k)));

    if (match) {
      const element = document.getElementById(match.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        setNavSearch('');
        element.classList.add('glow-border');
        setTimeout(() => element.classList.remove('glow-border'), 2000);
        setIsMobileMenuOpen(false);
        return;
      }
    }

    sendMessage(navSearch);
    setNavSearch('');
    setIsMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", href: "#home", icon: <Home size={18} /> },
    { label: "About", href: "#about", icon: <Info size={18} /> },
    { label: "Consultation", href: "#consultation", icon: <Briefcase size={18} /> },
    { label: "City Tours", href: "#tours", icon: <Globe size={18} /> },
    { label: "Software", href: "#software", icon: <Code size={18} /> },
    { label: "VIP Matrix", href: "#vip", icon: <CreditCard size={18} /> },
    { label: "Membership", href: "#membership", icon: <Users size={18} /> },
    { label: "Contact", href: "#contact", icon: <Phone size={18} /> },
  ];

  return (
    <div className="bg-[#04140d] text-[#e4fff2] min-h-screen font-sans selection:bg-[#3dff9e22] selection:text-[#3dff9e] flex">
      
      {/* LEFT SIDEBAR - Vertical Navigation */}
      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-[#020a06] border-r border-[#3dff9e15] z-[1100] transition-transform duration-300 xl:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
        <div className="p-8 flex flex-col gap-10 h-full overflow-y-auto scrollbar-hide">
          <div className="flex items-center gap-3">
            <div className="bg-[#3dff9e10] p-2 rounded border border-[#3dff9e30] shadow-[0_0_15px_#3dff9e10]">
              <Shield size={24} className="text-[#3dff9e]" />
            </div>
            <span className="font-black tracking-tighter text-2xl uppercase leading-none">AYFJ <br /><span className="text-[#3dff9e] text-lg">NEXUS</span></span>
          </div>

          <nav className="flex-1">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.label}>
                  <a 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-[#3dff9e] hover:bg-[#3dff9e05] transition-all group"
                  >
                    <span className="text-slate-600 group-hover:text-[#3dff9e] transition-colors">{item.icon}</span>
                    {item.label}
                  </a>
                </li>
              ))}
              <div className="my-6 border-t border-[#3dff9e08]"></div>
              <li>
                <button 
                  onClick={() => { setIsNetBotOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#ff4d4d] hover:bg-[#ff4d4d05] transition-all w-full text-left"
                >
                  <Bot size={18} />
                  Net Bot <span className="text-[8px] bg-[#ff4d4d20] px-1.5 py-0.5 rounded ml-auto">ACTIVE</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => { setIsNexusOpen(true); setIsMobileMenuOpen(false); }}
                  className="flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-[#3dff9e] hover:bg-[#3dff9e05] transition-all w-full text-left"
                >
                  <Terminal size={18} />
                  Nexus AI
                </button>
              </li>
            </ul>
          </nav>

          {/* Ethical Disclosure Badge in Sidebar */}
          <div className="bg-[#3dff9e05] border border-[#3dff9e10] p-4 rounded-2xl space-y-2 mt-4">
            <div className="flex items-center gap-2 text-[#3dff9e]">
              <CheckCircle2 size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Ethical Use Certified</span>
            </div>
            <p className="text-[9px] text-slate-500 leading-relaxed font-mono">
              All signals and tools on this portal are for authorized educational & defensive audits.
            </p>
          </div>

          <div className="mt-auto space-y-4 pt-6 border-t border-[#3dff9e08]">
             <form onSubmit={handleNavSearch} className="relative group">
                <input 
                  type="text" 
                  value={navSearch}
                  onChange={(e) => setNavSearch(e.target.value)}
                  placeholder="Global Query..." 
                  className="w-full bg-black/40 border border-[#3dff9e10] rounded-xl px-4 py-2.5 text-[10px] outline-none focus:border-[#3dff9e40] transition-all font-mono"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#3dff9e]"><Search size={14} /></button>
             </form>
             <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-[#3dff9e] rounded-full animate-pulse"></div>
                  <span className="text-[8px] font-mono font-bold text-slate-600 uppercase tracking-widest">Signal Stable</span>
                </div>
                <span className="text-[8px] text-slate-700 font-bold">V6.0.4</span>
             </div>
          </div>
        </div>
      </aside>

      {/* MOBILE MENU TRIGGER */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed top-6 left-6 z-[1200] xl:hidden bg-[#020a06] border border-[#3dff9e30] p-3 rounded-xl text-[#3dff9e] shadow-xl"
      >
        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Main Content Area */}
      <div className="flex-1 xl:ml-[280px] relative transition-all duration-300">
        
        {/* Status Ticker Footer */}
        <footer className="fixed bottom-0 left-0 xl:left-[280px] right-0 h-8 bg-[#020a06] border-t border-[#3dff9e15] flex items-center overflow-hidden z-[1001] px-4 font-mono text-[9px]">
          <div className="flex items-center gap-2 mr-6 shrink-0 text-[#3dff9e]">
            <div className="w-1.5 h-1.5 bg-[#3dff9e] rounded-full animate-ping"></div>
            <span className="font-bold tracking-widest">LIVE_SIGNAL</span>
          </div>
          <div className="flex gap-12 animate-scroll-text whitespace-nowrap text-slate-500">
            <span>// AYFJ_CORE: STABLE</span>
            <span>// ETHICAL_COMPLIANCE: ACTIVE</span>
            <span>// THREAT_LVL: {Math.round(threatLevel)}%</span>
            <span>// ASSET_PROTECTION: ARMED</span>
            <span>// UPLINK: 4.2GBps</span>
            <span>// LOCATION_ENCRYPTION: ACTIVE</span>
            <span>// DB_SYNC: 100%</span>
            <span>// FIREWALL: ENABLED</span>
          </div>
        </footer>

        <div className="flex max-w-[1400px] mx-auto px-6 gap-6 py-6 min-h-screen">
          
          {/* Main Feed */}
          <main className="flex-1 space-y-12 pb-24">
            <section id="home" className="relative h-[500px] rounded-3xl overflow-hidden border border-[#3dff9e15] group shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-30"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-[#04140d] via-transparent to-[#3dff9e08]"></div>
              <div className="relative h-full flex flex-col items-center justify-center text-center p-8">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-1.5 bg-[#3dff9e10] rounded-full border border-[#3dff9e20] animate-fade-in">
                  <Zap size={14} className="text-[#3dff9e]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#3dff9e]">Ethical Intelligence Uplink</span>
                </div>
                <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 animate-fade-in leading-none">
                  AYFJ <br /><span className="text-[#3dff9e] glow-text">NEXUS</span>
                </h1>
                <p className="max-w-2xl text-slate-400 text-lg mb-8 animate-fade-in delay-100 leading-relaxed">
                  Advanced cybersecurity research and urban innovation. This platform operates strictly for defensive audits and professional consultation.
                </p>
                <div className="flex gap-4 animate-fade-in delay-200">
                  <button onClick={() => sendMessage("Inquire about ethical research protocols")} className="cta-button">Initiate Nexus</button>
                  <button onClick={() => setIsNexusOpen(true)} className="px-8 py-4 rounded-full border border-[#3dff9e30] hover:bg-[#3dff9e10] transition-all font-bold text-sm">Security Logs</button>
                </div>
              </div>
            </section>

            <section id="about" className="transition-all duration-500 rounded-3xl p-8 bg-[#3dff9e02] border border-[#3dff9e05]">
              <div className="max-w-4xl space-y-10">
                <div>
                  <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">About <span className="text-[#3dff9e]">AYFJ Group</span></h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-4 text-slate-400 leading-relaxed text-sm">
                      <p>
                        AYFJ Group is a decentralized collective of cybersecurity professionals, urban planners, and strategic innovators. We bridge the gap between digital safety and physical urban experiences.
                      </p>
                      <p>
                        Our mission is to create a secure, collaborative environment for high-stakes information exchange and elite urban discovery, grounded in ethical research.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/40 border border-[#3dff9e10] rounded-2xl text-center">
                        <div className="text-3xl font-black text-[#3dff9e] mb-1">250+</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Defensive Nodes</div>
                      </div>
                      <div className="p-4 bg-black/40 border border-[#3dff9e10] rounded-2xl text-center">
                        <div className="text-3xl font-black text-[#3dff9e] mb-1">100%</div>
                        <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Ethical Alignment</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GitHub Ethical Disclosure Section */}
                <div className="p-8 bg-[#3dff9e05] border border-[#3dff9e15] rounded-3xl space-y-4">
                  <div className="flex items-center gap-3 text-[#3dff9e]">
                    <Shield size={24} />
                    <h3 className="text-xl font-black uppercase tracking-widest">Ethical Mandate & GitHub Compliance</h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed italic">
                    "This project and all associated research are conducted for ethical, educational, and defensive purposes only. We strictly follow the GitHub Community Guidelines and advocate for responsible security disclosure."
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-[#3dff9e]" /> No Malicious Intent
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-[#3dff9e]" /> Defensive Audits Only
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <CheckCircle2 size={12} className="text-[#3dff9e]" /> Professional Standards
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section id="consultation" className="transition-all duration-500 rounded-3xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Strategic <span className="text-[#3dff9e]">Consultation</span></h2>
                <div className="h-px bg-[#3dff9e10] flex-1 mx-8 hidden sm:block"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                 {[
                   { icon: "🎯", title: "Risk Architecture", desc: "Strategic system hardening and defensive vulnerability management." },
                   { icon: "🏨", title: "Secure Logistics", desc: "VIP travel security and encrypted communication protocols." },
                   { icon: "🎫", title: "Member Ops", desc: "Priority support for our elite membership network." },
                   { icon: "🗺️", title: "Threat Maps", desc: "Global geopolitical and digital threat assessments." }
                 ].map((f) => (
                   <div key={f.title} className="p-6 bg-[#062117]/30 border border-[#3dff9e05] rounded-2xl hover:border-[#3dff9e20] transition-all text-center">
                     <div className="text-4xl mb-4">{f.icon}</div>
                     <h3 className="font-bold mb-2 text-[#3dff9e] uppercase text-xs tracking-widest">{f.title}</h3>
                     <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                   </div>
                 ))}
              </div>
            </section>

            <section id="tours" className="transition-all duration-500 rounded-3xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Urban <span className="text-[#3dff9e]">Tech</span> Tours</h2>
                <div className="h-px bg-[#3dff9e10] flex-1 mx-8 hidden sm:block"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Silicon NYC", icon: "🗽", desc: "Manhattan tech hub exploration with our defensive researchers." },
                  { title: "Network Paris", icon: "🗼", desc: "Discover Europe's largest digital art and startup ecosystems." },
                  { title: "Hardware Tokyo", icon: "🏯", desc: "Expert navigation through the heart of electronic innovation." }
                ].map((tour) => (
                  <div key={tour.title} className="card group">
                    <div className="card-image group-hover:scale-110 transition-transform duration-700">{tour.icon}</div>
                    <div className="card-content">
                      <h3 className="text-xl font-bold mb-3">{tour.title}</h3>
                      <p className="text-sm text-slate-400 mb-6">{tour.desc}</p>
                      <button onClick={() => sendMessage(`I want to book ${tour.title} tour`)} className="w-full py-3 bg-[#3dff9e10] border border-[#3dff9e20] rounded-xl font-bold text-xs hover:bg-[#3dff9e] hover:text-[#04140d] transition-all">Book Protocol</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="software" className="transition-all duration-500 rounded-3xl">
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Software <span className="text-[#3dff9e]">Suite</span></h2>
                <div className="h-px bg-[#3dff9e10] flex-1 mx-8 hidden sm:block"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="card">
                  <div className="card-image"><Plane size={64} className="text-[#3dff9e]" /></div>
                  <div className="card-content">
                    <h3 className="text-xl font-bold mb-2">AeroGuard</h3>
                    <p className="text-sm text-slate-400 mb-4">Secured flight tracking and logistics for VIP members.</p>
                    <div className="flex gap-2"><span className="badge">Beta</span><span className="badge">Logistics</span></div>
                  </div>
                </div>
                <div className="card border-2 border-[#3dff9e20]">
                  <div className="card-image"><Code size={64} className="text-[#3dff9e]" /></div>
                  <div className="card-content">
                    <h3>Nexus OS</h3>
                    <p className="text-sm text-slate-400 mb-4">Hardened operating system for critical hardware nodes.</p>
                    <div className="flex gap-2"><span className="badge">Encrypted</span><span className="badge">Stable</span></div>
                  </div>
                </div>
                <div className="card">
                  <div className="card-image"><Users size={64} className="text-[#3dff9e]" /></div>
                  <div className="card-content">
                    <h3>Collaborative X</h3>
                    <p className="text-sm text-slate-400 mb-4">Encrypted team environment for decentralized research.</p>
                    <div className="flex gap-2"><span className="badge">Global</span><span className="badge">P2P</span></div>
                  </div>
                </div>
              </div>
            </section>

            <section id="vip" className="bg-[#3dff9e05] border border-[#3dff9e10] rounded-3xl p-8 transition-all duration-500">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-center mb-10">Membership <span className="text-[#3dff9e]">Matrix</span></h2>
              <div className="overflow-x-auto">
                <table className="pricing-table">
                  <thead>
                    <tr>
                      <th>Feature Set</th>
                      <th>Silver</th>
                      <th>Gold</th>
                      <th>Platinum</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>Nexus Intelligence</td><td>Standard</td><td>High Priority</td><td>Neural Uplink</td></tr>
                    <tr><td>Global Support</td><td>Email</td><td>Concierge</td><td>24/7 Red Line</td></tr>
                    <tr><td>Travel Discounts</td><td>5%</td><td>15%</td><td>Unlimited Credits</td></tr>
                    <tr><td>Asset Credits</td><td>$100</td><td>$500</td><td>Custom</td></tr>
                  </tbody>
                </table>
              </div>
              <div className="text-center mt-8">
                 <button onClick={() => sendMessage("Inquire about Platinum Membership")} className="cta-button">Initiate Application</button>
              </div>
            </section>

            <section id="contact" className="transition-all duration-500 rounded-3xl pb-20">
               <div className="flex items-center justify-between mb-10">
                <h2 className="text-3xl font-black uppercase tracking-tighter">Broadcast <span className="text-[#3dff9e]">Signal</span></h2>
                <div className="h-px bg-[#3dff9e10] flex-1 mx-8 hidden sm:block"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                 <div className="bg-[#062117]/20 p-8 rounded-3xl border border-[#3dff9e05]">
                    <h3 className="font-bold uppercase tracking-widest text-[#3dff9e] text-sm mb-6">Neural Input</h3>
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <input type="text" placeholder="CALLSIGN" className="bg-black/40 border border-[#3dff9e10] p-4 rounded-xl outline-none focus:border-[#3dff9e40] text-xs font-mono" />
                          <input type="email" placeholder="UPLINK_ADDR" className="bg-black/40 border border-[#3dff9e10] p-4 rounded-xl outline-none focus:border-[#3dff9e40] text-xs font-mono" />
                       </div>
                       <textarea rows={4} placeholder="TRANSMISSION_DATA..." className="w-full bg-black/40 border border-[#3dff9e10] p-4 rounded-xl outline-none focus:border-[#3dff9e40] text-xs font-mono"></textarea>
                       <button onClick={() => sendMessage("Sending secure broadcast...")} className="w-full py-4 bg-[#3dff9e] text-[#04140d] rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] transition-all">Initiate Broadcast</button>
                    </div>
                 </div>
                 <div className="flex flex-col justify-center gap-6">
                    <div className="p-6 bg-black/40 border border-[#3dff9e10] rounded-2xl">
                       <div className="flex items-center gap-4 mb-4">
                          <div className="bg-[#3dff9e10] p-3 rounded-xl border border-[#3dff9e20]"><Globe className="text-[#3dff9e]" size={24} /></div>
                          <div>
                             <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global HQ</div>
                             <div className="text-sm font-bold">AYFJ Distributed Node-01</div>
                          </div>
                       </div>
                       <div className="text-xs text-slate-500 font-mono">ENCRYPTED_SIGNAL_RELAY: NYC_DC_PARIS_TK</div>
                    </div>
                    <div className="p-6 bg-[#3dff9e05] border border-[#3dff9e10] rounded-2xl">
                       <div className="text-[10px] font-bold text-[#3dff9e] uppercase tracking-widest mb-2">Social Channels</div>
                       <div className="flex gap-4">
                          <a href="#" className="text-slate-400 hover:text-[#3dff9e] transition-all hover:scale-110 active:scale-95"><Terminal size={20} /></a>
                          <a href="#" className="text-slate-400 hover:text-[#3dff9e] transition-all hover:scale-110 active:scale-95"><Zap size={20} /></a>
                          <a href="#" className="text-slate-400 hover:text-[#3dff9e] transition-all hover:scale-110 active:scale-95"><Globe size={20} /></a>
                       </div>
                    </div>
                 </div>
              </div>
            </section>
          </main>

          {/* Right Sidebar - Analytics HUD */}
          <aside className="hidden 2xl:flex w-72 flex-col gap-6 shrink-0 mt-8">
             <div className="glass-panel p-5 rounded-2xl border border-[#3dff9e10] bg-[#04140d]/40 flex flex-col gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Diagnostics</h2>
                    <Activity size={12} className="text-[#3dff9e] animate-pulse" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-[#3dff9e05] border border-[#3dff9e08] p-2 rounded-lg">
                      <div className="text-[8px] text-slate-500 uppercase mb-1 flex items-center gap-1"><Cpu size={10} /> Load</div>
                      <div className="text-xs font-mono font-bold">14.2%</div>
                    </div>
                    <div className="bg-[#3dff9e05] border border-[#3dff9e08] p-2 rounded-lg">
                      <div className="text-[8px] text-slate-500 uppercase mb-1 flex items-center gap-1"><Database size={10} /> Sync</div>
                      <div className="text-xs font-mono font-bold text-[#3dff9e]">READY</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Traffic Monitoring</h2>
                  <div className="h-10 w-full bg-[#3dff9e05] rounded-lg border border-[#3dff9e10] p-2 flex items-center relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 bg-[#3dff9e10] transition-all duration-1000" style={{ width: `${threatLevel}%` }} />
                    <div className="z-10 flex flex-col justify-center">
                      <div className="text-[8px] text-slate-400 uppercase font-bold leading-none mb-1">Activity</div>
                      <div className="text-xs font-mono font-bold">{Math.round(threatLevel)}% <span className="text-[9px] opacity-40 italic">NOMINAL</span></div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h2 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500">Signal Traffic</h2>
                  <div className="bg-black/60 rounded-xl p-3 border border-[#3dff9e08] font-mono text-[8px] space-y-1.5 h-64 overflow-hidden">
                    {logs.map(log => (
                      <div key={log.id} className="flex gap-2 opacity-60 hover:opacity-100 transition-opacity">
                        <span className="text-slate-600">[{log.time}]</span>
                        <span className={`font-bold ${log.type === 'success' ? 'text-green-500' : log.type === 'warn' ? 'text-yellow-500' : 'text-blue-400'}`}>{log.type}</span>
                        <span className="text-slate-400 truncate">{log.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </aside>
        </div>
      </div>

      {/* Net Bot Sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full w-full max-w-xl bg-[#0a0505] z-[2000] shadow-2xl border-r border-[#ff4d4d20] transition-transform duration-500 ease-in-out transform ${
          isNetBotOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col overflow-hidden`}
      >
        <div className="p-6 border-b border-[#ff4d4d10] flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🦞</span>
            <div>
              <h2 className="font-bold text-[#ff4d4d] tracking-widest uppercase text-xs flex items-center gap-2">
                Net Bot <span className="text-[8px] bg-[#ff4d4d20] px-1.5 py-0.5 rounded text-[#ff4d4d]">BETA</span>
              </h2>
              <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Moltbook mascot protocol</p>
            </div>
          </div>
          <button onClick={() => setIsNetBotOpen(false)} className="text-slate-500 hover:text-[#ff4d4d] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 font-sans scrollbar-hide space-y-10">
          {isNetBotLoading && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0505]/80 backdrop-blur-sm animate-fade-in">
              <div className="relative w-24 h-24 mb-6">
                <div className="absolute inset-0 border-4 border-[#ff4d4d20] rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#ff4d4d] border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center text-4xl animate-pulse">🦞</div>
              </div>
              <p className="text-[10px] font-bold text-[#ff4d4d] uppercase tracking-[0.4em] animate-pulse">Querying Moltbook Registry...</p>
            </div>
          )}

          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter leading-none mb-4">Build Apps for <span className="text-[#ff4d4d]">AI Agents</span></h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">Let bots authenticate with your service using their Moltbook identity. strictly ethical.</p>
            <div className="flex gap-4 pt-4">
               <button onClick={simulateNetBotAction} className="bg-[#ff4d4d] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-[#ff3333] transition-all shadow-lg shadow-[#ff4d4d20]">Get Access →</button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Authentication Flow</h3>
            <div className="bg-black/40 border border-[#ff4d4d10] p-6 rounded-2xl flex flex-col items-center gap-6">
              <div className="flex items-center justify-between w-full max-w-sm">
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">🤖</div>
                    <span className="text-[10px] font-bold">Bot</span>
                 </div>
                 <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#ff4d4d] to-transparent mx-4 relative"></div>
                 <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-[#ff4d4d10] rounded-2xl flex items-center justify-center border border-[#ff4d4d20]">🦞</div>
                    <span className="text-[10px] font-bold text-[#ff4d4d]">Moltbook</span>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* The Nexus AI Sidebar */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-[#04140d] z-[2000] shadow-2xl border-l border-[#3dff9e20] transition-transform duration-500 ease-in-out transform ${
          isNexusOpen ? 'translate-x-0' : 'translate-x-full'
        } flex flex-col`}
      >
        <div className="p-6 border-b border-[#3dff9e10] flex items-center justify-between bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#3dff9e] rounded-full animate-pulse shadow-[0_0_10px_#3dff9e]"></div>
            <h2 className="font-bold text-[#3dff9e] tracking-widest uppercase text-xs">Nexus Intelligence Core</h2>
          </div>
          <button onClick={() => setIsNexusOpen(false)} className="text-slate-500 hover:text-[#3dff9e] transition-colors">
            <X size={24} />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
              <div className={`max-w-[85%] p-5 rounded-2xl ${msg.role === 'user' ? 'bg-[#3dff9e10] border border-[#3dff9e20] text-white rounded-tr-none' : 'bg-slate-900/60 border border-white/5 text-slate-200 rounded-tl-none backdrop-blur-md'}`}>
                <div className="flex items-center gap-2 text-[10px] mb-3 font-bold opacity-40 uppercase tracking-widest">
                  {msg.role === 'user' ? <User size={12}/> : <Bot size={12}/>}
                  {msg.role === 'user' ? 'Operator' : 'Nexus'} — {msg.timestamp}
                </div>
                <div className="prose prose-invert prose-sm leading-relaxed">{msg.content}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/5 space-y-2">
                    {msg.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" className="flex items-center gap-2 p-2 bg-black/40 hover:bg-[#3dff9e10] border border-white/5 rounded-lg text-[10px] text-[#3dff9e] transition-all group truncate">
                        <ExternalLink size={10} className="shrink-0" /> 
                        <span className="truncate">{s.title}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="space-y-6 animate-fade-in">
              <div className="px-6 py-5 rounded-3xl bg-[#3dff9e05] border border-[#3dff9e20] backdrop-blur-xl shadow-2xl rounded-tl-none relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#3dff9e05] to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#3dff9e] rounded-full animate-bounce [animation-delay:-0.32s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#3dff9e] rounded-full animate-bounce [animation-delay:-0.16s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#3dff9e] rounded-full animate-bounce"></span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-[#3dff9e] uppercase tracking-[0.2em] animate-pulse">analyzing network...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#3dff9e10] bg-black/40 backdrop-blur-md">
          <form onSubmit={(e) => { e.preventDefault(); sendMessage(input); }} className="relative flex items-center">
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Execute command..."
              className="w-full bg-[#062117] border border-[#3dff9e20] p-4 pr-16 rounded-xl outline-none focus:border-[#3dff9e] text-white transition-all font-mono text-sm shadow-inner"
            />
            <button type="submit" disabled={!input.trim() || isLoading} className="absolute right-4 p-2 text-[#3dff9e] hover:scale-125 transition-transform disabled:opacity-20">
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @keyframes progress { 0% { transform: translateX(-100%); width: 20%; } 50% { width: 60%; } 100% { transform: translateX(300%); width: 20%; } }
      `}} />
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

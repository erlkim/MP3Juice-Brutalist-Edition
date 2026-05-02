```react
import React, { useState, useEffect } from 'react';

// --- KOMPONEN UTAMA MP3JUICE BRUTALIST ---
export default function App() {
  // --- State Jaringan & Konfigurasi ---
  const [view, setView] = useState('user'); 
  const [instances, setInstances] = useState([]);
  const [activeInstance, setActiveInstance] = useState(null);
  const [settings, setSettings] = useState({
    siteTitle: 'MP3JUICE',
    converterUrl: 'https://9xbuddy.com/process?url=',
    adminPassword: 'admin'
  });
  const [status, setStatus] = useState({ text: 'INISIALISASI', color: 'bg-yellow-400' });
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const [player, setPlayer] = useState({ visible: false, videoId: '', title: '', author: '', thumb: '', preview: false });
  const [dlModal, setDlModal] = useState({ visible: false, videoId: '', title: '' });
  const [loginModal, setLoginModal] = useState({ visible: false, password: '', error: false });

  // --- Efek Inisialisasi ---
  useEffect(() => {
    const savedInstances = localStorage.getItem('mp3juice_instances');
    const savedSettings = localStorage.getItem('mp3juice_settings');

    if (savedInstances) {
      setInstances(JSON.parse(savedInstances));
    } else {
      const defaultInstances = [
        'https://inv.tux.rs',
        'https://invidious.projectsegfau.lt',
        'https://iv.melmac.space',
        'https://vid.priv.au',
        'https://invidious.lunar.icu'
      ];
      setInstances(defaultInstances);
      localStorage.setItem('mp3juice_instances', JSON.stringify(defaultInstances));
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    if (instances.length > 0) {
      findHealthyInstance();
    }
  }, [instances]);

  // Mencari server yang aktif (Invidious)
  const findHealthyInstance = async () => {
    setStatus({ text: 'MENCARI SERVER...', color: 'bg-yellow-400' });
    const shuffled = [...instances].sort(() => Math.random() - 0.5);
    
    for (const url of shuffled) {
      try {
        const res = await fetch(`${url}/api/v1/stats`, { method: 'GET' });
        if (res.ok) {
          setActiveInstance(url);
          setStatus({ text: `ONLINE: ${new URL(url).hostname.toUpperCase()}`, color: 'bg-green-400' });
          return;
        }
      } catch (e) { continue; }
    }
    setStatus({ text: 'SERVER OFFLINE', color: 'bg-red-500 text-white' });
  };

  // Fungsi Pencarian YouTube
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || loading) return;

    setLoading(true);
    setError(null);
    setResults([]);

    let currentInst = activeInstance || instances[0];
    let attempts = 0;

    while (attempts < 3) {
      try {
        const res = await fetch(`${currentInst}/api/v1/search?q=${encodeURIComponent(searchQuery)}&type=video`);
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setLoading(false);
          return;
        }
        throw new Error();
      } catch (err) {
        attempts++;
        currentInst = instances[Math.floor(Math.random() * instances.length)];
        setActiveInstance(currentInst);
      }
    }
    setError(true);
    setLoading(false);
  };

  // Logika Login Admin
  const handleAdminLogin = () => {
    if (loginModal.password === settings.adminPassword) {
      setView('admin');
      setLoginModal({ visible: false, password: '', error: false });
    } else {
      setLoginModal({ ...loginModal, error: true });
    }
  };

  const updateSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('mp3juice_settings', JSON.stringify(newSettings));
  };

  // Update daftar server otomatis
  const fetchAutoInstances = async () => {
    setIsRefreshing(true);
    try {
      const response = await fetch('https://api.invidious.io/instances.json?sort_by=type,health');
      const data = await response.json();
      const newUrls = data
        .filter(item => item[1].type === 'https' && item[1].api === true)
        .map(item => item[1].uri.replace(/\/$/, ""));
      
      const combined = Array.from(new Set([...instances, ...newUrls]));
      setInstances(combined);
      localStorage.setItem('mp3juice_instances', JSON.stringify(combined));
      alert(`SUKSES! DITAMBAHKAN ${newUrls.length} SERVER BARU.`);
    } catch (err) {
      alert("GAGAL UPDATE OTOMATIS.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDur = (s) => {
    if(!s) return "0:00";
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${r < 10 ? '0' : ''}${r}`;
  };

  // --- Brutalist UI Elements ---
  const BrutalistCard = ({ children, className = "" }) => (
    <div className={`bg-white border-[6px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] ${className}`}>
      {children}
    </div>
  );

  const BrutalistButton = ({ children, onClick, color = "bg-sky-400", className = "" }) => (
    <button 
      onClick={onClick}
      className={`${color} border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[6px] active:translate-y-[6px] active:shadow-none transition-all px-8 py-3 font-black uppercase tracking-tighter ${className}`}
    >
      {children}
    </button>
  );

  const AdminPanel = () => {
    const [newUrl, setNewUrl] = useState('');
    return (
      <div className="space-y-12 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-[8px] border-black pb-6 gap-4">
          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-none">ADMIN <span className="text-sky-400">ZONE</span></h2>
          <BrutalistButton onClick={() => setView('user')} color="bg-red-500 text-white">KELUAR</BrutalistButton>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          <BrutalistCard className="p-10 space-y-8">
            <h3 className="text-3xl font-black underline decoration-sky-400 underline-offset-8 uppercase">Konfigurasi Situs</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black mb-2 uppercase">Judul Web</label>
                <input 
                  type="text" 
                  value={settings.siteTitle} 
                  onChange={(e) => updateSettings({...settings, siteTitle: e.target.value})}
                  className="w-full border-[4px] border-black p-4 font-black outline-none focus:bg-sky-50 text-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-black mb-2 uppercase">URL Konverter MP3</label>
                <input 
                  type="text" 
                  value={settings.converterUrl} 
                  onChange={(e) => updateSettings({...settings, converterUrl: e.target.value})}
                  className="w-full border-[4px] border-black p-4 font-black outline-none focus:bg-sky-50"
                />
              </div>
            </div>
          </BrutalistCard>

          <BrutalistCard className="p-10 space-y-8">
            <div className="flex justify-between items-center">
              <h3 className="text-3xl font-black underline decoration-green-400 underline-offset-8 uppercase">List Server</h3>
              <button 
                onClick={fetchAutoInstances}
                className="text-xs font-black bg-black text-white px-4 py-2 hover:bg-sky-500 transition-colors uppercase border-[2px] border-black"
              >
                {isRefreshing ? 'Memuat...' : 'Sync Server'}
              </button>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
              {instances.map(url => (
                <div key={url} className="flex justify-between items-center border-[3px] border-black p-3 font-black text-sm bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <span className="truncate w-full">{url}</span>
                  <button onClick={() => setInstances(instances.filter(i => i !== url))} className="text-red-600 hover:scale-150 transition-transform ml-4 font-black">✖</button>
                </div>
              ))}
            </div>
          </BrutalistCard>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] text-black selection:bg-sky-400 selection:text-white font-sans overflow-x-hidden">
      {/* Navbar */}
      <nav className="border-b-[8px] border-black p-8 bg-white sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => setView('user')}>
            <div className="bg-black text-white p-3 border-[4px] border-black rotate-[-4deg] group-hover:rotate-0 transition-transform duration-300">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <h1 className="text-5xl font-black tracking-tighter italic uppercase leading-none">
              {settings.siteTitle}
            </h1>
          </div>

          <div className="flex items-center gap-8">
            <div className={`hidden lg:block border-[4px] border-black px-6 py-2 font-black text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] ${status.color}`}>
              {status.text}
            </div>
            <button 
              onClick={() => setLoginModal({ ...loginModal, visible: true })}
              className="bg-white border-[4px] border-black p-3 shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto w-full px-8 pt-24 pb-60">
        {view === 'admin' ? <AdminPanel /> : (
          <>
            {/* Header Utama */}
            <header className="text-center mb-24">
              <div className="inline-block relative">
                <h2 className="text-8xl md:text-[11rem] font-black italic tracking-tighter leading-none mb-8 uppercase">
                  MUZIC <span className="text-sky-400">FREE</span>
                </h2>
                <div className="absolute -top-10 -right-10 bg-yellow-400 border-[6px] border-black p-4 font-black rotate-12 animate-pulse text-2xl uppercase">
                  High Quality!
                </div>
              </div>
              <p className="text-2xl font-black border-[6px] border-black inline-block bg-white px-10 py-4 rotate-[-1deg] uppercase shadow-[10px_10px_0_0_rgba(0,0,0,1)]">
                Cari, Dengar, & Download Lagu Favoritmu!
              </p>
            </header>

            {/* Form Pencarian */}
            <form onSubmit={handleSearch} className="relative max-w-5xl mx-auto mb-32">
              <div className="flex flex-col md:flex-row gap-0 border-[10px] border-black shadow-[20px_20px_0_0_rgba(0,0,0,1)]">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="KETIK JUDUL LAGU ATAU ARTIS..." 
                  className="flex-grow bg-white p-8 text-3xl font-black outline-none placeholder:text-slate-300 uppercase italic"
                />
                <button type="submit" className="bg-sky-400 text-white font-black text-4xl px-16 py-8 border-t-[10px] md:border-t-0 md:border-l-[10px] border-black hover:bg-black transition-colors uppercase tracking-tighter italic">
                  CARI!
                </button>
              </div>
            </form>

            {/* Area Hasil */}
            <div className="grid gap-16">
              {loading && (
                <div className="flex justify-center py-20">
                  <div className="text-6xl font-black animate-bounce uppercase italic tracking-tighter">Memproses...</div>
                </div>
              )}

              {error && (
                <BrutalistCard className="p-16 text-center bg-red-100">
                  <h3 className="text-6xl font-black mb-8 uppercase tracking-tighter italic">Jaringan Sibuk!</h3>
                  <BrutalistButton onClick={handleSearch} color="bg-white text-2xl">COBA ULANG</BrutalistButton>
                </BrutalistCard>
              )}

              {results.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                  {results.map(v => (
                    <BrutalistCard key={v.videoId} className="p-6 flex flex-col gap-6 group hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200">
                      <div className="relative border-[5px] border-black overflow-hidden aspect-video bg-slate-200">
                        <img src={v.videoThumbnails?.find(t => t.quality === 'medium')?.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={v.title} loading="lazy" />
                        <div className="absolute top-3 right-3 bg-black text-white px-3 py-1 font-black text-sm border-[2px] border-white">
                          {formatDur(v.lengthSeconds)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-black text-2xl truncate uppercase leading-none">{v.title}</h4>
                        <p className="text-sm font-black text-slate-500 uppercase tracking-widest">{v.author}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-auto">
                        <BrutalistButton 
                          onClick={() => setPlayer({ visible: true, videoId: v.videoId, title: v.title, author: v.author, thumb: v.videoThumbnails?.[0]?.url, preview: true })}
                          color="bg-white"
                          className="text-lg"
                        >PLAY</BrutalistButton>
                        <BrutalistButton 
                          onClick={() => setDlModal({ visible: true, videoId: v.videoId, title: v.title })}
                          color="bg-sky-400 text-white"
                          className="text-lg"
                        >UNDUH</BrutalistButton>
                      </div>
                    </BrutalistCard>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Login Admin Modal */}
      {loginModal.visible && (
        <div className="fixed inset-0 bg-sky-400/90 z-[200] flex items-center justify-center p-6 backdrop-blur-sm">
          <BrutalistCard className="max-w-md w-full p-12 space-y-10 animate-bounce-short">
            <div className="text-center">
              <h3 className="text-6xl font-black tracking-tighter italic uppercase leading-none">Admin?</h3>
              <p className="font-black text-slate-700 uppercase tracking-widest mt-2">Masukan Sandi</p>
            </div>
            
            <div className="space-y-5">
              <input 
                type="password" 
                placeholder="PASSWORD"
                autoFocus
                value={loginModal.password}
                onChange={(e) => setLoginModal({ ...loginModal, password: e.target.value, error: false })}
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                className={`w-full border-[6px] ${loginModal.error ? 'border-red-600 bg-red-50' : 'border-black'} p-5 font-black text-center text-3xl outline-none uppercase italic shadow-[6px_6px_0_0_rgba(0,0,0,1)]`}
              />
              <div className="grid grid-cols-2 gap-5 pt-4">
                <BrutalistButton onClick={() => setLoginModal({ visible: false, password: '', error: false })} color="bg-white">BATAL</BrutalistButton>
                <BrutalistButton onClick={handleAdminLogin} color="bg-black text-white">MASUK</BrutalistButton>
              </div>
            </div>
          </BrutalistCard>
        </div>
      )}

      {/* Floating Player */}
      {player.visible && (
        <div className="fixed bottom-0 left-0 right-0 z-[150] p-6 md:p-12 pointer-events-none">
          <BrutalistCard className="max-w-4xl mx-auto p-6 flex flex-col pointer-events-auto bg-white relative animate-slide-up">
            <button 
              onClick={() => setPlayer({...player, visible: false, preview: false})}
              className="absolute -top-8 -right-8 bg-red-600 text-white border-[6px] border-black w-16 h-16 flex items-center justify-center font-black text-3xl shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all"
            >✖</button>
            
            <div className="flex items-center gap-8 mb-6">
              <div className="w-24 h-24 border-[6px] border-black flex-shrink-0 bg-cover bg-center shadow-[6px_6px_0_0_rgba(0,0,0,1)]" style={{backgroundImage: `url(${player.thumb})`}}></div>
              <div className="min-w-0">
                <h4 className="font-black text-3xl truncate uppercase leading-none mb-1">{player.title}</h4>
                <p className="font-black text-sky-500 uppercase tracking-widest text-lg">{player.author}</p>
              </div>
            </div>
            
            {player.preview && (
              <div className="border-[8px] border-black aspect-video bg-black shadow-[15px_15px_0_0_rgba(0,0,0,1)]">
                <iframe 
                  className="w-full h-full" 
                  src={`${activeInstance}/embed/${player.videoId}?autoplay=1`} 
                  frameBorder="0" 
                  allow="autoplay; encrypted-media" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
          </BrutalistCard>
        </div>
      )}

      {/* Download Modal */}
      {dlModal.visible && (
        <div className="fixed inset-0 bg-black/80 z-[200] flex items-center justify-center p-6">
          <BrutalistCard className="max-w-xl w-full p-12 text-center space-y-10 bg-green-400">
            <div className="space-y-4">
              <h3 className="text-7xl font-black italic tracking-tighter uppercase leading-none">READY!</h3>
              <div className="font-black text-white border-[5px] border-black bg-black p-4 text-xl truncate uppercase shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
                {dlModal.title}.MP3
              </div>
            </div>
            <div className="space-y-6">
              <BrutalistButton 
                onClick={() => {
                  window.open(`${settings.converterUrl}https://www.youtube.com/watch?v=${dlModal.videoId}`, '_blank');
                  setDlModal({ visible: false, videoId: '', title: '' });
                }}
                color="bg-white w-full py-10 text-5xl italic"
              >
                DOWNLOAD!
              </BrutalistButton>
   

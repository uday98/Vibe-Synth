import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Sliders, Download, Play, Zap, Music, Sparkles, Image as ImageIcon, Heart, Trash2 } from 'lucide-react';

export default function VibeSynth() {
  const [prompt, setPrompt] = useState('');
  const [adsr, setAdsr] = useState({ attack: 0.1, decay: 0.3, sustain: 0.4, release: 0.8 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [gallery, setGallery] = useState([]); // Local Cache
  
  const audioCtx = useRef(null);

  // Initialize Audio Context on first interaction
  const initAudio = () => {
    if (!audioCtx.current) {
      audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.current.state === 'suspended') {
      audioCtx.current.resume();
    }
  };

  const synthesizeSound = async () => {
    initAudio();
    setIsGenerating(true);
    
    const ctx = audioCtx.current;
    const sampleRate = ctx.sampleRate;
    const duration = 2.0;
    const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
    const data = buffer.getChannelData(0);

    // Vibe Logic: Changes tone based on text prompt length/content
    const freq = prompt.toLowerCase().includes('dark') ? 55 : (prompt.length > 10 ? 220 : 440);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      const mainTone = Math.sin(2 * Math.PI * freq * t);
      const texture = (Math.random() * 2 - 1) * 0.08; // AI Noise
      
      let env = 0;
      if (t < adsr.attack) env = t / adsr.attack;
      else if (t < adsr.attack + adsr.decay) env = 1 - ((t - adsr.attack) / adsr.decay) * (1 - adsr.sustain);
      else env = adsr.sustain;
      
      if (t > duration - adsr.release) {
        const releaseTime = t - (duration - adsr.release);
        env *= Math.max(0, 1 - releaseTime / adsr.release);
      }
      data[i] = (mainTone + texture) * env;
    }

    setTimeout(() => {
      setAudioBuffer(buffer);
      setIsGenerating(false);
      playBuffer(buffer);
    }, 800);
  };

  const playBuffer = (buf) => {
    if (!buf) return;
    initAudio();
    const source = audioCtx.current.createBufferSource();
    source.buffer = buf;
    source.connect(audioCtx.current.destination);
    source.start();
  };

  const quickSave = () => {
    if (!audioBuffer) return;
    const id = Date.now();
    const newVibe = { id, buffer: audioBuffer, name: prompt || `Vibe ${gallery.length + 1}` };
    setGallery([newVibe, ...gallery]);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white p-4 font-sans text-sm pb-20">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header */}
        <div className="pt-6 border-b border-zinc-800 pb-4 flex justify-between items-center">
          <h1 className="text-xl font-black italic tracking-tighter text-indigo-400 uppercase">VibeSynth</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-zinc-900 rounded-lg text-zinc-500"><ImageIcon size={18}/></button>
          </div>
        </div>

        {/* PROMPT INPUT */}
        <div className="space-y-2">
          <input 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the sound (e.g. Dark Techno Kick)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm focus:ring-1 focus:ring-indigo-500 outline-none transition"
          />
        </div>

        {/* ADSR SLIDERS */}
        <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 space-y-4">
          <div className="flex justify-between items-center opacity-50 text-[10px] uppercase font-bold tracking-widest">
            <span>Envelope (ADSR)</span>
            <Sliders size={12} />
          </div>
          {Object.keys(adsr).map(key => (
            <div key={key} className="flex items-center gap-4">
              <span className="w-8 text-[10px] uppercase text-zinc-500">{key[0]}</span>
              <input 
                type="range" min="0.01" max="1.5" step="0.01" value={adsr[key]}
                onChange={(e) => setAdsr({...adsr, [key]: parseFloat(e.target.value)})}
                className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none accent-indigo-500"
              />
            </div>
          ))}
        </div>

        {/* MAIN ACTIONS */}
        <div className="grid grid-cols-5 gap-2">
          <button 
            onClick={synthesizeSound}
            className="col-span-4 py-4 bg-indigo-600 rounded-2xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-indigo-500/20"
          >
            {isGenerating ? 'Dreaming...' : 'Generate'} <Sparkles size={16}/>
          </button>
          <button 
            onClick={quickSave}
            disabled={!audioBuffer}
            className="col-span-1 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-rose-500 disabled:opacity-20"
          >
            <Heart size={20} fill={audioBuffer ? "currentColor" : "none"}/>
          </button>
        </div>

        {/* CACHED GALLERY */}
        <div className="space-y-3">
          <h3 className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Saved Vibes</h3>
          {gallery.length === 0 && <div className="text-zinc-700 italic text-xs">No saved vibes yet...</div>}
          {gallery.map(vibe => (
            <div key={vibe.id} className="flex items-center justify-between bg-zinc-900/80 p-3 rounded-xl border border-zinc-800">
              <div className="flex items-center gap-3">
                <button onClick={() => playBuffer(vibe.buffer)} className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center"><Play size={14} fill="currentColor"/></button>
                <span className="text-xs font-medium truncate w-32">{vibe.name}</span>
              </div>
              <button onClick={() => setGallery(gallery.filter(g => g.id !== vibe.id))} className="text-zinc-600 hover:text-red-400"><Trash2 size={14}/></button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

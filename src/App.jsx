import React, { useState, useEffect } from 'react';

const TCPIPJourney = () => {
  const [stage, setStage] = useState('idle'); 
  const [activeLayer, setActiveLayer] = useState(-1);
  const [packetPos, setPacketPos] = useState(0); 
  const [speed, setSpeed] = useState(800);
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectSource, setInspectSource] = useState(null); 
  const [clickedLayerIndex, setClickedLayerIndex] = useState(-1);

  const layers = [
    { 
      name: 'Application', 
      responsible: 'Web Browser / App Software',
      details: [
        { label: 'Method', value: 'GET' },
        { label: 'Path', value: '/index.html' },
        { label: 'Protocol', value: 'HTTP/1.1' },
        { label: 'Host', value: 'nyjc.edu.sg' }
      ]
    },
    { 
      name: 'Transport', 
      responsible: 'Operating System (OS)',
      details: [
        { label: 'Source Port', value: '52431' },
        { label: 'Dest Port', value: '80 (HTTP)' },
        { label: 'Seq Number', value: '101' },
        { label: 'Checksum', value: '0x8F4E' }
      ]
    },
    { 
      name: 'Internet', 
      responsible: 'Operating System (OS)',
      details: [
        { label: 'Source IP', value: '192.168.1.5' },
        { label: 'Dest IP', value: '172.217.194.94' },
        { label: 'Protocol', value: '6 (TCP)' },
        { label: 'TTL', value: '64' }
      ]
    },
    { 
      name: 'Link', 
      responsible: 'Network Interface Card (NIC)',
      details: [
        { label: 'Source MAC', value: '00:1A:C2:7B:00:41' },
        { label: 'Dest MAC', value: '00:0C:29:4F:8B:32' },
        { label: 'EtherType', value: '0x0800 (IPv4)' }
      ]
    }
  ];

  const handleInspect = (source, index = -1) => {
    setInspectSource(source);
    setClickedLayerIndex(index);
    setIsInspecting(true);
  };

  useEffect(() => {
    let timer;
    if (stage !== 'idle' && !isInspecting) {
      if (stage === 'start-data') {
        timer = setTimeout(() => { setStage('client-stack'); setActiveLayer(0); }, speed);
      } else if (stage === 'client-stack') {
        timer = setTimeout(() => {
          if (activeLayer < 3) setActiveLayer(prev => prev + 1);
          else setStage('traveling');
        }, speed);
      } else if (stage === 'traveling') {
        timer = setInterval(() => {
          setPacketPos(prev => {
            if (prev >= 100) {
              clearInterval(timer);
              setStage('server-stack');
              setActiveLayer(3); 
              return 100;
            }
            return prev + 2; 
          });
        }, Math.max(10, speed / 20));
      } else if (stage === 'server-stack') {
        timer = setTimeout(() => {
          if (activeLayer > 0) setActiveLayer(prev => prev - 1);
          else setStage('complete');
        }, speed);
      }
    }
    return () => { clearTimeout(timer); clearInterval(timer); };
  }, [stage, activeLayer, speed, isInspecting]);

  return (
    <div className="p-4 md:p-8 bg-slate-100 min-h-screen font-sans">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Section */}
        <div className="p-6 border-b flex justify-between items-center bg-white relative z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">TCP/IP Protocol Journey</h1>
            <p className="text-sm text-slate-500 font-medium">NYJC H2 Computing: Real-time Header Inspector</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Animation Speed</span>
              <input 
                type="range" min="100" max="2000" step="100" 
                value={2100 - speed} 
                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))} 
                className="w-24 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
              />
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStage('start-data'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); }} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-all">Start Journey</button>
              <button onClick={() => { setStage('idle'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); }} className="border border-slate-200 px-6 py-2 rounded-lg text-slate-600 font-bold hover:bg-slate-50 transition-all">Reset</button>
            </div>
          </div>
        </div>

        {/* Animation Stage */}
        <div className="relative h-[650px] flex flex-col items-center justify-center bg-slate-50 border-b overflow-hidden">
          
          <div className="flex w-full justify-between px-20 items-start mb-24">
            {/* SENDER */}
            <div className="flex flex-col items-center w-48 relative z-10">
              <div className={`mb-4 px-3 py-1.5 border-2 border-dashed rounded-lg text-[10px] font-bold uppercase ${stage === 'idle' ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                Raw Data
              </div>
              <div className="bg-blue-600 text-white p-3 rounded-t-lg w-full text-center font-black italic tracking-widest uppercase">Sender</div>
              <div className="w-full border-2 border-t-0 border-slate-200 rounded-b-lg p-1.5 bg-white space-y-1">
                {layers.map((l, i) => {
                  const isSent = (stage === 'client-stack' && activeLayer >= i) || ['traveling', 'server-stack', 'complete'].includes(stage);
                  const isBeingInspected = isInspecting && inspectSource === 'sender' && clickedLayerIndex === i;
                  return (
                    <div key={i} className={`h-14 border rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all ${isSent ? 'bg-blue-500 text-white border-blue-600' : 'bg-slate-50 text-slate-200 opacity-30'}`}>
                      <span>{l.name}</span>
                      {isSent && (
                        <button 
                          onClick={() => handleInspect('sender', i)} 
                          className={`px-3 py-0.5 rounded-full mt-1 text-[8px] font-black uppercase transition-all shadow-sm ${isBeingInspected ? 'bg-white text-blue-600 scale-110' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}>
                          {isBeingInspected ? '● Viewing' : '📦 Inspect'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECEIVER */}
            <div className="flex flex-col items-center w-48 relative z-10">
              <div className={`mb-4 px-3 py-1.5 border-2 border-dashed rounded-lg text-[10px] font-bold uppercase ${stage === 'complete' ? 'bg-green-50 border-green-400 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-300'}`}>
                Data Received
              </div>
              <div className="bg-slate-800 text-white p-3 rounded-t-lg w-full text-center font-black italic tracking-widest uppercase">Receiver</div>
              <div className="w-full border-2 border-t-0 border-slate-200 rounded-b-lg p-1.5 bg-white space-y-1">
                {layers.map((l, i) => {
                  const isReached = (stage === 'server-stack' && activeLayer <= i) || stage === 'complete';
                  const isBeingInspected = isInspecting && inspectSource === 'receiver' && clickedLayerIndex === i;
                  return (
                    <div key={i} className={`h-14 border rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all ${isReached ? 'bg-green-500 text-white border-green-600' : 'bg-slate-50 text-slate-200 opacity-30'}`}>
                      <span>{l.name}</span>
                      {isReached && (
                        <button 
                          onClick={() => handleInspect('receiver', i)} 
                          className={`px-3 py-0.5 rounded-full mt-1 text-[8px] font-black uppercase transition-all shadow-sm ${isBeingInspected ? 'bg-white text-green-600 scale-110' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}>
                          {isBeingInspected ? '● Viewing' : '📦 Inspect'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PHYSICAL WIRE */}
          <div className="absolute bottom-24 w-[70%] flex flex-col items-center">
             <div className="w-full h-1 bg-slate-300 rounded-full relative">
                {stage === 'traveling' && <div className="absolute inset-0 bg-blue-400/40 animate-pulse" />}
             </div>
             <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em]">Physical Network Link</p>
          </div>

          {/* INSPECTOR MODAL - Adjusted for background interactivity */}
          {isInspecting && (
            <div className="absolute inset-0 z-40 flex items-center justify-center p-6 pointer-events-none">
              <div className="bg-white rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.2)] w-full max-w-xl overflow-hidden border-4 border-yellow-400 pointer-events-auto animate-in fade-in zoom-in duration-200">
                <div className="bg-yellow-400 p-4 flex justify-between items-center cursor-move">
                  <div className="flex items-center gap-3">
                    <h2 className="font-black text-slate-900 uppercase tracking-tight">Packet Header Inspector</h2>
                    <span className={`px-2.5 py-0.5 text-[9px] font-black rounded-full uppercase text-white shadow-sm ${inspectSource === 'sender' ? 'bg-blue-600' : 'bg-green-700'}`}>
                      {inspectSource === 'sender' ? 'Sender Snapshot' : 'Receiver Snapshot'}
                    </span>
                  </div>
                  <button onClick={() => setIsInspecting(false)} className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold hover:scale-105 transition-transform">Close ×</button>
                </div>

                <div className="p-6 space-y-3 max-h-[450px] overflow-y-auto">
                   <div className="bg-slate-50 p-3 rounded-lg border-2 border-dashed border-slate-200 text-center">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Payload Content</span>
                      <div className="font-mono text-xs text-blue-600 font-bold">"Original Application Data"</div>
                   </div>

                   <div className="space-y-2">
                     {layers.map((l, i) => {
                       const isVisible = (inspectSource === 'sender' || inspectSource === 'receiver') ? i <= clickedLayerIndex : true;
                       return (
                        <div key={i} className={`p-2.5 rounded-lg border-l-4 transition-all duration-300 ${isVisible ? 'border-blue-500 bg-blue-50/50' : 'bg-slate-50 opacity-40'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-tight ${isVisible ? 'text-blue-700' : 'text-slate-400'}`}>{l.name} Header</p>
                                {isVisible && (
                                    <p className="text-[8px] font-bold text-slate-500 italic">Managed by: {l.responsible}</p>
                                )}
                            </div>
                            {!isVisible && <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Stripped/Waiting</span>}
                          </div>
                          {isVisible ? (
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
                              {l.details.map((d, idx) => (
                                <div key={idx} className="flex justify-between border-b border-blue-100/50">
                                  <span className="text-[8px] text-slate-400 font-medium">{d.label}:</span>
                                  <span className="text-[9px] font-mono font-bold text-slate-700">{d.value}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-2 bg-slate-100 rounded w-full mt-1"></div>
                          )}
                        </div>
                       );
                     })}
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TCPIPJourney;
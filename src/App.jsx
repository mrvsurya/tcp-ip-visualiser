import React, { useState, useEffect } from 'react';

const TCPIPJourney = () => {
  const [stage, setStage] = useState('idle'); 
  const [activeLayer, setActiveLayer] = useState(-1);
  const [packetPos, setPacketPos] = useState(0); 
  const [speed, setSpeed] = useState(1000); 
  const [protocol, setProtocol] = useState('TCP'); 
  const [medium, setMedium] = useState('Wired'); 
  const [isInspecting, setIsInspecting] = useState(false);
  const [inspectSource, setInspectSource] = useState(null); 
  const [clickedLayerIndex, setClickedLayerIndex] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);

  const networkContext = {
    sender: {
      srcMac: '00:1A:C2:7B:00:41',
      dstMac: '00:0C:29:4F:8B:32',
      managedByApp: protocol === 'TCP' 
        ? 'Web Browser / App Software (Decides to use TCP for reliable data transfer)' 
        : 'Competitive Game Engine (Decides to use UDP for low-latency state synchronization)'
    },
    receiver: {
      srcMac: 'E4:CE:8F:12:33:A1',
      dstMac: '70:8B:CD:4E:21:F5',
      managedByApp: protocol === 'TCP' ? 'Web Server (Processes HTTP requests)' : 'Dedicated Game Server (Processes real-time state updates)'
    }
  };

  const layers = [
    { 
      name: 'Application', 
      unit: 'DATA', 
      details: protocol === 'TCP' ? [ 
        { label: 'Method', value: 'GET' }, 
        { label: 'Path', value: '/index.html' }, 
        { label: 'Protocol', value: 'HTTP/1.1' },
        { label: 'Host', value: 'nyjc.edu.sg' } 
      ] : [ 
        { label: 'Action', value: 'Player_Move' }, 
        { label: 'Coords', value: 'X:142, Y:88' }, 
        { label: 'Input', value: 'Button_Fire' } 
      ] 
    },
    { 
      name: 'Transport', 
      unit: protocol === 'TCP' ? 'TCP Segment' : 'UDP Datagram', 
      managedBy: 'Operating System (OS)',
      details: protocol === 'TCP' ? [ 
        { label: 'Source Port', value: '52431' }, 
        { label: 'Dest Port', value: '80 (HTTP)' }, 
        { label: 'Seq Number', value: '101' }, 
        { label: 'Checksum', value: '0x8F4E' } 
      ] : [ 
        { label: 'Source Port', value: '52431' }, 
        { label: 'Dest Port', value: '27015 (Game)' }, 
        { label: 'Length', value: '64 bytes' }, 
        { label: 'Checksum', value: '0xE3A1' } 
      ] 
    },
    { 
      name: 'Internet', 
      unit: 'IP Packet', 
      managedBy: 'Operating System (OS)',
      getDetails: (side) => [ 
        { label: 'Source IP', value: '192.168.1.5' }, 
        { label: 'Dest IP', value: side === 'receiver' ? '192.168.1.10' : '172.217.194.94' }, 
        { label: 'Protocol', value: protocol === 'TCP' ? '6 (TCP)' : '17 (UDP)' }, 
        { label: 'TTL', value: side === 'sender' ? '64' : '58' },
        { label: 'Header Checksum', value: side === 'sender' ? '0x4B21' : '0x4E27' } 
      ] 
    },
    { 
      name: 'Link', 
      getUnit: (side) => (side === 'receiver' ? 'Ethernet Frame' : (medium === 'Wired' ? 'Ethernet Frame' : 'Wireless Frame')),
      getManagedBy: (side) => {
        if (side === 'receiver' || medium === 'Wired') {
          return 'Ethernet Adapter (A type of Network Interface Card (NIC) that follows the IEEE 802.3 standard)';
        }
        return 'Wireless Adapter (A specific type of NIC designed for the wireless standard (IEEE 802.11))';
      },
      getDetails: (side) => [ 
        { label: 'Source MAC', value: networkContext[side]?.srcMac || '---' }, 
        { label: 'Dest MAC', value: networkContext[side]?.dstMac || '---' }, 
        { label: 'EtherType', value: '0x0800 (IPv4)' },
        { label: 'FCS', value: '0xD82F1901' } 
      ] 
    }
  ];

  const handleInspect = (source, index) => {
    setInspectSource(source);
    setClickedLayerIndex(index);
    setIsInspecting(true);
  };

  useEffect(() => {
    let timer;
    if (stage !== 'idle' && !isInspecting && !isHovered) {
      if (stage === 'start-data') timer = setTimeout(() => { setStage('client-stack'); setActiveLayer(0); }, speed);
      else if (stage === 'client-stack') {
        timer = setTimeout(() => { if (activeLayer < 3) setActiveLayer(prev => prev + 1); else setStage('traveling'); }, speed);
      } else if (stage === 'traveling') {
        timer = setInterval(() => {
          setPacketPos(prev => {
            if (prev >= 100) { clearInterval(timer); setStage('server-stack'); setActiveLayer(3); return 100; }
            return prev + 1; 
          });
        }, Math.max(15, speed / 50)); 
      } else if (stage === 'server-stack') {
        timer = setTimeout(() => { if (activeLayer > 0) setActiveLayer(prev => prev - 1); else setStage('complete'); }, speed);
      }
    }
    return () => { clearTimeout(timer); clearInterval(timer); };
  }, [stage, activeLayer, speed, isInspecting, isHovered]);

  return (
    <div className="p-4 md:p-8 bg-slate-100 min-h-screen font-sans text-left">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header Controls */}
        <div className="p-6 border-b flex flex-wrap gap-6 justify-between items-center bg-white relative z-50">
          <div className="text-left">
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight text-left">TCP/IP Protocol Journey</h1>
            <p className="text-sm text-slate-500 font-medium text-left">Visualising Data Encapsulation and Decapsulation</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex flex-col gap-1 min-w-[150px]">
              <span className="text-[9px] font-black uppercase text-slate-400 text-left">Simulation Speed</span>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-slate-500">Slow</span>
                <input 
                  type="range" min="100" max="1500" step="50"
                  value={1600 - speed} 
                  onChange={(e) => setSpeed(1600 - Number(e.target.value))}
                  className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-[10px] font-bold text-slate-500">Fast</span>
              </div>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border items-center">
              <span className="text-[9px] font-black uppercase px-2 text-slate-400">Medium:</span>
              {['Wired', 'Wireless'].map(m => (
                <button key={m} onClick={() => setMedium(m)} className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${medium === m ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
              ))}
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border">
              {['TCP', 'UDP'].map(p => (
                <button key={p} onClick={() => setProtocol(p)} className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${protocol === p ? (p === 'TCP' ? 'bg-blue-600 text-white shadow-md' : 'bg-orange-500 text-white shadow-md') : 'text-slate-400 hover:text-slate-600'}`}>{p}</button>
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => { setStage('start-data'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); setIsHovered(false); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-blue-700 transition-all">Start</button>
              <button onClick={() => { setStage('idle'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); setIsHovered(false); }} className="border border-slate-200 px-5 py-2 rounded-lg text-slate-600 font-bold text-sm hover:bg-slate-50 transition-all">Reset</button>
            </div>
          </div>
        </div>

        <div className="relative h-[600px] flex flex-col items-center justify-center bg-slate-50 border-b overflow-hidden">
          <div className="flex w-full justify-between px-20 items-start mb-24">
            {['sender', 'receiver'].map((type) => (
              <div key={type} className="flex flex-col items-center w-48 relative z-10">
                <div className={`${type === 'sender' ? 'bg-blue-600' : 'bg-slate-800'} text-white p-3 rounded-t-lg w-full text-center font-black italic tracking-widest uppercase shadow-md`}>{type}</div>
                <div className="w-full border-2 border-t-0 border-slate-200 rounded-b-lg p-1.5 bg-white space-y-1">
                  {layers.map((l, i) => {
                    const active = type === 'sender' ? (stage === 'client-stack' && activeLayer >= i) || ['traveling', 'server-stack', 'complete'].includes(stage) : (stage === 'server-stack' && activeLayer <= i) || stage === 'complete';
                    const inspecting = isInspecting && inspectSource === type && clickedLayerIndex === i;
                    return (
                      <div key={i} className={`h-14 border rounded flex flex-col items-center justify-center text-[10px] font-bold transition-all ${active ? (type === 'sender' ? 'bg-blue-500 text-white border-blue-600' : 'bg-green-500 text-white border-green-600') : 'bg-slate-50 text-slate-200 opacity-30'}`}>
                        <span>{l.name}</span>
                        {active && <button onClick={() => handleInspect(type, i)} className={`px-3 py-0.5 rounded-full mt-1 text-[8px] font-black uppercase transition-all shadow-sm ${inspecting ? 'bg-white text-blue-600' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}>{inspecting ? '● Viewing' : '📦 Inspect'}</button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="absolute bottom-24 w-[70%] flex flex-col items-center">
             <div className="w-full h-1 bg-slate-300 rounded-full relative">
                {stage === 'traveling' && (
                  <div 
                    className={`absolute cursor-pointer transition-transform duration-200 ${isHovered ? 'scale-110 z-50' : 'animate-bounce'}`}
                    style={{ left: `${packetPos}%`, top: '-20px', transform: 'translateX(-50%)' }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={() => handleInspect('sender', 3)}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-lg shadow-xl border-2 transition-colors ${isHovered ? 'bg-red-500 border-red-700' : 'bg-yellow-400 border-yellow-600'}`}>
                      <span className="text-xl">{isHovered ? '⏸' : '📦'}</span>
                    </div>
                  </div>
                )}
             </div>
             <p className="text-[11px] font-black text-slate-500 mt-8 uppercase tracking-[0.4em]">The Internet</p>
          </div>

          {isInspecting && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none bg-slate-900/10">
              <div className={`rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border-4 border-yellow-400 pointer-events-auto animate-in fade-in zoom-in duration-200 max-h-[90%] ${inspectSource === 'sender' ? 'bg-blue-50' : 'bg-green-50'}`}>
                <div className="bg-yellow-400 p-4 flex justify-between items-center shrink-0 z-[110]">
                  <div className="flex items-center gap-3 text-left">
                    <h2 className="font-black text-slate-900 uppercase tracking-tight">Packet Header Inspector</h2>
                    <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase text-white ${inspectSource === 'sender' ? 'bg-blue-600' : 'bg-green-700'}`}>{inspectSource} Snapshot</span>
                  </div>
                  <button onClick={() => setIsInspecting(false)} className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-black hover:scale-105 transition-transform shadow-lg">Close ×</button>
                </div>
                <div className="p-6 space-y-3 overflow-y-auto">
                  {layers.map((l, i) => {
                    const isVisible = i <= clickedLayerIndex;
                    const currentDetails = l.name === 'Link' ? l.getDetails(inspectSource) : (l.name === 'Internet' ? l.getDetails(inspectSource) : l.details);
                    
                    let managedByText = l.managedBy;
                    if (l.name === 'Application') managedByText = networkContext[inspectSource].managedByApp;
                    if (l.name === 'Link') managedByText = l.getManagedBy(inspectSource);

                    return (isVisible &&
                      <div key={i} className="p-3 rounded-lg border-l-4 border-blue-500 bg-white shadow-sm mb-2 text-left">
                        <div className="flex flex-col mb-1 text-left">
                          <p className="text-[10px] font-black uppercase text-blue-700 text-left">{l.name} Header</p>
                          <p className="text-[8px] font-bold text-slate-500 italic tracking-tight text-left">Managed by: {managedByText}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2">
                          {currentDetails.map((d, idx) => (
                            <div key={idx} className="flex justify-between border-b border-slate-100 pb-0.5">
                              <span className="text-[8px] text-slate-400 font-medium">{d.label}:</span>
                              <span className="text-[9px] font-mono font-bold text-slate-700">{d.value}</span>
                            </div>
                          ))}
                        </div>
                        {l.name === 'Internet' && inspectSource === 'receiver' && (
                          <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-left space-y-1">
                            <p className="text-[8px] font-bold text-amber-800">
                              Note: The TTL has been decremented (64 → 58) to simulate traversal through multiple routers. This triggered a recalculation of the Header Checksum.
                            </p>
                            <p className="text-[8px] font-bold text-blue-800 italic">
                              After reviewing the IP header, the Internet layer dispatches the data to the correct Transport stack based on the Protocol ID.
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
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
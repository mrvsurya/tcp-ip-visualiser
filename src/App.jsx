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
  const [activeNote, setActiveNote] = useState(null);
  const [isResponseMode, setIsResponseMode] = useState(false);

  const notes = {
    macHop: "**NOTE:** The source and destination MAC addresses change at each hop in the link layer. This is because MAC addresses are only intended for local, physical delivery between directly connected nodes (hop-by-hop), whereas IP addresses are used for end-to-end routing across different networks.\n\nWhen a packet travels through routers, the link layer frame is stripped off and a new one is rebuilt at every hop to guide the packet to the next adjacent device.",
    ipEndToEndSender: "**NOTE:** The source and destination IP addresses generally remain constant at each hop in the internet layer. This is because IP addresses are designed for end-to-end delivery across the entire journey, identifying the original sender and the final recipient regardless of the path taken.\n\nWhile the internet layer is not stripped and rebuilt like the link layer, routers perform minor in-place modifications to the header at every hop; specifically, decrementing the TTL (Time to Live). Since the TTL has changed, the Header Checksum is no longer valid and must be recalculated to reflect the new TTL value.",
    ipEndToEndReceiver: "At this stage, after reviewing the IP header, the Internet layer dispatches the data to the correct Transport stack based on the Protocol ID.\n\n**NOTE:** The source and destination IP addresses generally remain constant at each hop in the internet layer. This is because IP addresses are designed for end-to-end delivery across the entire journey, identifying the original sender and the final recipient regardless of the path taken.\n\nWhile the internet layer is not stripped and rebuilt like the link layer, routers perform minor in-place modifications to the header at every hop; specifically, decrementing the TTL (Time to Live). Since the TTL has changed, the Header Checksum is no longer valid and must be recalculated to reflect the new TTL value.\n\n* Did you notice that the source IP is not that of an intranet? Why is that so, and what does it actually represent?",
    natInsight: "**NOTE:** From the receiver's perspective, the source port in the transport header reflects the public port assigned by the sender’s NAT gateway, not the original internal port used by the sender's host.\n\nAs the packet passes through a NAT gateway, the router performs Port Address Translation (PAT). It replaces the sender’s private IP and local source port with its own public IP and a unique port from its NAT table. The receiver perceives this translated port as the actual source and must use it as the destination port for its reply so the NAT device knows which internal device to route the return traffic back to."
  };

  const networkContext = {
    sender: {
      srcMac: isResponseMode ? 'E4:CE:8F:12:33:A1' : '00:1A:C2:7B:00:41',
      dstMac: isResponseMode ? '70:8B:CD:4E:21:F5' : '00:0C:29:4F:8B:32',
      managedByApp: isResponseMode 
        ? (protocol === 'TCP' ? 'Web Server (Generating HTTP Response)' : 'Game Server (Syncing Game State)')
        : (protocol === 'TCP' ? 'Web Browser (Decides to use TCP for reliability)' : 'Game Engine (Decides to use UDP for low-latency)')
    },
    receiver: {
      srcMac: isResponseMode ? '00:1A:C2:7B:00:41' : 'E4:CE:8F:12:33:A1',
      dstMac: isResponseMode ? '00:0C:29:4F:8B:32' : '70:8B:CD:4E:21:F5',
      managedByApp: isResponseMode 
        ? (protocol === 'TCP' ? 'Web Browser (Parsing HTML Content)' : 'Game Client (Rendering Video Frame)')
        : (protocol === 'TCP' ? 'Web Server (Processing HTTP Request)' : 'Dedicated Game Server')
    }
  };

  const layers = [
    { 
      name: 'Application', 
      unit: 'DATA', 
      getDetails: (side) => {
        if (!isResponseMode) {
          return protocol === 'TCP' ? [ 
            { label: 'Method', value: 'GET' }, 
            { label: 'Path', value: '/index.html' }, 
            { label: 'Version', value: 'HTTP/1.1' },
            { label: 'Host', value: 'nyjc.edu.sg' } 
          ] : [ 
            { label: 'Action', value: 'Player_Move' }, 
            { label: 'Coords', value: 'X:142, Y:88' },
            { label: 'Input', value: 'Button_A' }
          ];
        } else {
          return protocol === 'TCP' ? [ 
            { label: 'Status', value: '200 OK' }, 
            { label: 'Type', value: 'text/html' }, 
            { label: 'Server', value: 'nginx/1.18' },
            { label: 'Charset', value: 'UTF-8' }
          ] : [ 
            { label: 'Update', value: 'Pos_Verified' }, 
            { label: 'Ping', value: '32ms' },
            { label: 'Tick', value: '64' }
          ];
        }
      }
    },
    { 
      name: 'Transport', 
      getUnit: () => protocol === 'TCP' ? 'TCP Segment' : 'UDP Datagram', 
      managedBy: 'Operating System (OS Kernel Stack)',
      getDetails: (side) => {
        const clientPort = '52431';
        const natPort = '45362 (NAT)';
        const serverPort = protocol === 'TCP' ? '80' : '27015';
        
        let src, dst;

        if (!isResponseMode) {
          src = (side === 'sender') ? clientPort : natPort;
          dst = serverPort;
        } else {
          src = serverPort;
          dst = (side === 'sender') ? natPort : clientPort;
        }
        
        if (protocol === 'TCP') {
            return [ 
              { label: 'Source Port', value: src }, 
              { label: 'Dest Port', value: dst }, 
              { label: 'Seq Number', value: isResponseMode ? '802' : '101' },
              { label: 'Window Size', value: '64240' },
              { label: 'Checksum', value: side === 'receiver' ? '0x8A2F' : '0x4F2C' }
            ];
        } else {
            return [ 
              { label: 'Source Port', value: src }, 
              { label: 'Dest Port', value: dst }, 
              { label: 'Length', value: '64 bytes' }, 
              { label: 'Checksum', value: side === 'receiver' ? '0xB1E4' : '0xE3A1' } 
            ];
        }
      }
    },
    { 
      name: 'Internet', 
      unit: 'IP Packet', 
      managedBy: 'Operating System (OS Kernel Stack)',
      getDetails: (side) => {
        const clientIntranetIP = '192.168.1.5';
        const clientPublicIP = '121.7.144.22';
        const serverIntranetIP = '10.0.0.5';
        const serverPublicIP = '182.19.217.204';

        let src, dst;

        if (!isResponseMode) {
          src = (side === 'sender') ? clientIntranetIP : clientPublicIP;
          dst = (side === 'sender') ? serverPublicIP : serverIntranetIP;
        } else {
          src = (side === 'sender') ? serverIntranetIP : serverPublicIP;
          dst = (side === 'sender') ? clientPublicIP : clientIntranetIP;
        }
        
        return [ 
          { label: 'Source IP', value: src }, 
          { label: 'Dest IP', value: dst }, 
          { label: 'Protocol ID', value: protocol === 'TCP' ? '6 (TCP)' : '17 (UDP)' },
          { label: 'TTL', value: side === 'receiver' ? '58' : '64' },
          { label: 'Header Checksum', value: side === 'receiver' ? '0xE21B' : '0xBD4A' }
        ];
      }
    },
    { 
      name: 'Link', 
      getUnit: (side) => {
        const isServer = (isResponseMode && side === 'sender') || (!isResponseMode && side === 'receiver');
        return (isServer || medium === 'Wired' ? 'Ethernet Frame' : 'Wireless Frame');
      },
      getManagedBy: (side) => {
        const isServer = (isResponseMode && side === 'sender') || (!isResponseMode && side === 'receiver');
        return (isServer || medium === 'Wired') 
          ? 'Ethernet Network Interface Card (NIC) - Operates under IEEE 802.3 standards' 
          : 'Wireless Network Interface Card (WNIC) - Operates under IEEE 802.11 standards';
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
    setActiveNote(null);
  };

  useEffect(() => {
    let timer;
    if (stage !== 'idle' && !isInspecting) {
      if (stage === 'start-data') timer = setTimeout(() => { setStage('client-stack'); setActiveLayer(0); }, speed);
      else if (stage === 'client-stack') {
        timer = setTimeout(() => { if (activeLayer < 3) setActiveLayer(prev => prev + 1); else setStage('traveling'); }, speed);
      } else if (stage === 'traveling') {
        timer = setInterval(() => {
          setPacketPos(prev => {
            if (prev >= 100) { clearInterval(timer); setStage('server-stack'); setActiveLayer(3); return 100; }
            return prev + 1; 
          });
        }, 20); 
      } else if (stage === 'server-stack') {
        timer = setTimeout(() => { if (activeLayer > 0) setActiveLayer(prev => prev - 1); else setStage('complete'); }, speed);
      }
    }
    return () => { clearTimeout(timer); clearInterval(timer); };
  }, [stage, activeLayer, speed, isInspecting]);

  const renderFormattedNote = (text) => {
    const parts = text.split(/(\*\*NOTE:\*\*)/);
    return parts.map((part, i) => (
      part === '**NOTE:**' ? <strong key={i} className="text-amber-700 uppercase font-black tracking-wider text-[10px]">NOTE:</strong> : part
    ));
  };

  return (
    <div className="p-4 bg-slate-100 min-h-screen font-sans text-slate-900">
      <div className="max-w-[1400px] mx-auto bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[850px]">
        
        <div className="p-4 border-b flex justify-between items-center bg-white z-[100] shadow-sm">
          <div className="flex flex-col">
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">TCP/IP Journey</h1>
            <p className="text-[13px] font-bold text-slate-500">
              {isResponseMode ? 'Server → Client (Response Flow)' : 'Client → Server (Request Flow)'}
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex flex-col gap-1 w-32">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speed: {speed}ms</label>
              <input 
                type="range" min="200" max="2000" step="200" value={speed} 
                onChange={(e) => setSpeed(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border gap-1">
              {['Wired', 'Wireless'].map(m => (
                <button key={m} onClick={() => setMedium(m)} className={`px-3 py-1 rounded-md text-[10px] font-black transition-all ${medium === m ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{m}</button>
              ))}
            </div>

            <div className="flex bg-slate-100 p-1 rounded-lg border gap-1">
              {['TCP', 'UDP'].map(p => (
                <button key={p} onClick={() => setProtocol(p)} className={`px-4 py-1 rounded-md text-[10px] font-black transition-all ${protocol === p ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>{p}</button>
              ))}
            </div>

            <button 
              onClick={() => {
                setIsResponseMode(!isResponseMode);
                setStage('idle');
                setPacketPos(0);
                setIsInspecting(false);
              }}
              className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg font-black text-[10px] uppercase hover:scale-105 transition-all shadow-md active:bg-indigo-600"
            >
              <span>🔄 Swap Direction</span>
            </button>

            <div className="flex gap-2">
              <button onClick={() => { setStage('start-data'); setPacketPos(0); setIsInspecting(false); }} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-bold text-xs shadow-md hover:bg-blue-700">Start</button>
              <button onClick={() => { setStage('idle'); setPacketPos(0); setIsInspecting(false); }} className="border border-slate-200 px-5 py-2 rounded-lg text-slate-600 font-bold text-xs hover:bg-slate-50">Reset</button>
            </div>
          </div>
        </div>

        <div className={`flex-1 flex overflow-hidden relative ${isResponseMode ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className="w-72 border-r border-l bg-slate-50/50 p-6 flex flex-col items-center shrink-0">
            <div className={`w-full ${isResponseMode ? 'bg-slate-800' : 'bg-blue-600'} text-white p-4 rounded-t-xl text-center font-black uppercase tracking-wider`}>
              {isResponseMode ? 'Server' : 'Client'}
            </div>
            <div className="w-full border-2 border-t-0 bg-white rounded-b-xl p-3 space-y-4 shadow-inner">
              {layers.map((l, i) => {
                 const active = (stage === 'client-stack' && activeLayer >= i) || !['idle', 'start-data', 'client-stack'].includes(stage);
                 return (
                  <div key={i} className={`h-24 border rounded-xl flex flex-col items-center justify-center transition-all ${active ? (isResponseMode ? 'bg-slate-700' : 'bg-blue-500') + ' text-white shadow-md scale-105 border-white/20' : 'opacity-30 grayscale'}`}>
                    <span className="text-[12px] font-black uppercase tracking-widest">{l.name}</span>
                    {active && <button onClick={() => handleInspect('sender', i)} className="mt-3 px-4 py-1 rounded-full text-[10px] font-black bg-yellow-400 text-black hover:scale-110 transition-transform">INSPECT</button>}
                  </div>
                 );
              })}
            </div>
          </div>

          <div className="flex-1 flex flex-col relative bg-slate-50">
            <div className="h-32 border-b bg-white flex flex-col items-center justify-center relative shrink-0">
               <div className="w-[85%] h-1 bg-slate-200 rounded-full relative">
                 {stage === 'traveling' && (
                    <div className="absolute animate-bounce" style={{ [isResponseMode ? 'right' : 'left']: `${packetPos}%`, top: '-18px' }}>
                        <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-yellow-400 border-2 border-yellow-600 text-xl shadow-lg">
                            {isResponseMode ? '📂' : '📦'}
                        </div>
                    </div>
                 )}
               </div>
               <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                 Internet
               </p>
            </div>

            <div className="flex-1 p-6 overflow-y-auto">
              {isInspecting ? (
                <div className="w-full bg-white rounded-2xl shadow-xl border-4 border-yellow-400 overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                  <div className="bg-yellow-400 p-3 px-6 flex justify-between items-center shrink-0">
                    <span className="font-black text-slate-900 text-sm uppercase tracking-tight">Inspector: {inspectSource === 'sender' ? (isResponseMode ? 'Server' : 'Client') : (isResponseMode ? 'Client' : 'Server')} Headers</span>
                    <button onClick={() => setIsInspecting(false)} className="bg-slate-900 text-white px-4 py-1 rounded-full text-[10px] font-black hover:bg-slate-700 transition-colors">Close ×</button>
                  </div>
                  
                  <div className="p-6 space-y-6">
                    {layers.map((l, i) => (
                      i <= clickedLayerIndex && (
                        <div key={i} className="p-5 rounded-xl border-l-8 border-blue-500 bg-white shadow-md hover:shadow-lg transition-shadow">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex flex-col gap-1 max-w-[75%]">
                              <span className="text-[13px] font-black text-blue-700 uppercase tracking-tight">{l.name} Layer Header</span>
                              <span className="text-[11.5px] font-semibold text-slate-500 italic leading-tight">
                                Managed by: {l.name === 'Application' ? networkContext[inspectSource].managedByApp : (l.getManagedBy ? l.getManagedBy(inspectSource) : l.managedBy)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="bg-slate-50 border border-slate-200 px-3 py-1 rounded-md text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                {l.unit || l.getUnit(inspectSource)}
                              </span>
                              {(l.name === 'Link' || l.name === 'Internet' || (l.name === 'Transport' && inspectSource === 'receiver')) && (
                                <button onClick={() => setActiveNote(activeNote === i ? null : i)} className={`w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all ${activeNote === i ? 'bg-yellow-500 scale-110 ring-4 ring-yellow-100' : 'bg-slate-100 hover:bg-yellow-100'}`}>💡</button>
                              )}
                            </div>
                          </div>
                          
                          {activeNote === i && (
                            <div className="mb-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl text-[12.5px] text-amber-900 leading-relaxed animate-in slide-in-from-top-2 duration-200 whitespace-pre-line">
                              <span className="block font-black mb-2 uppercase text-[10px] text-amber-600 tracking-widest underline decoration-2 underline-offset-4 decoration-amber-200">Concept Insight:</span>
                              {l.name === 'Link' ? renderFormattedNote(notes.macHop) : l.name === 'Transport' ? renderFormattedNote(notes.natInsight) : renderFormattedNote(inspectSource === 'receiver' ? notes.ipEndToEndReceiver : notes.ipEndToEndSender)}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-x-10 gap-y-2 pt-2 border-t border-slate-100">
                            {l.getDetails(inspectSource).map((d, idx) => (
                              <div key={idx} className="flex justify-between border-b border-slate-50 pb-2">
                                <span className="text-[13px] text-slate-500 font-semibold uppercase">{d.label}:</span>
                                <span className="text-[13px] font-mono font-medium text-slate-800">{d.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center border-4 border-dashed rounded-3xl bg-white/50 border-slate-200">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center shadow-inner mb-4 text-2xl grayscale opacity-40">🔍</div>
                  <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.3em]">Select a layer to analyze active headers</p>
                </div>
              )}
            </div>
          </div>

          <div className="w-72 border-l border-r bg-slate-50/50 p-6 flex flex-col items-center shrink-0">
            <div className={`w-full ${isResponseMode ? 'bg-blue-600' : 'bg-slate-800'} text-white p-4 rounded-t-xl text-center font-black uppercase tracking-wider`}>
              {isResponseMode ? 'Client' : 'Server'}
            </div>
            <div className="w-full border-2 border-t-0 bg-white rounded-b-xl p-3 space-y-4 shadow-inner">
              {layers.map((l, i) => {
                 const active = (stage === 'server-stack' && activeLayer <= i) || stage === 'complete';
                 return (
                  <div key={i} className={`h-24 border rounded-xl flex flex-col items-center justify-center transition-all ${active ? 'bg-green-600 text-white shadow-md scale-105 border-white/20' : 'opacity-30 grayscale'}`}>
                    <span className="text-[12px] font-black uppercase tracking-widest">{l.name}</span>
                    {active && <button onClick={() => handleInspect('receiver', i)} className="mt-3 px-4 py-1 rounded-full text-[10px] font-black bg-yellow-400 text-black hover:scale-110 transition-transform shadow-sm">INSPECT</button>}
                  </div>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TCPIPJourney;
import React, { useState, useEffect } from 'react';
import './App.css'; // Make sure to import the CSS file

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
      details: ['Method: GET', 'Path: /index.html', 'Protocol: HTTP/1.1', 'Host: nyjc.edu.sg']
    },
    { 
      name: 'Transport', 
      details: ['Source Port: 52431', 'Dest Port: 80 (HTTP)', 'Seq Number: 101', 'Checksum: 0x8F4E']
    },
    { 
      name: 'Internet', 
      details: ['Source IP: 192.168.1.5', 'Dest IP: 172.217.194.94', 'Protocol: 6 (TCP)', 'TTL: 64', 'Header Checksum: 0x4B21']
    },
    { 
      name: 'Link', 
      details: [
        'Source MAC: 00:1A:C2:7B:00:41 (Host)', 
        'Dest MAC: 00:0C:29:4F:8B:32 (Gateway)', 
        'EtherType: 0x0800 (IPv4)',
        'Note: MACs change hop-by-hop'
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
    <div className="tcp-container">
      <div className="tcp-card">
        
        {/* Header */}
        <div className="tcp-header">
          <div>
            <h1 className="tcp-title">TCP/IP Protocol</h1>
            <p className="tcp-subtitle">Visualising Data Encapsulation and Decapsulation</p>
          </div>
          
          <div className="controls-group">
            <div className="speed-control">
              <label className="label-mini">Animation Speed</label>
              <input 
                type="range" min="100" max="2000" step="100" 
                value={2100 - speed} 
                onChange={(e) => setSpeed(2100 - parseInt(e.target.value))} 
                className="speed-slider" 
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => { setStage('start-data'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); }} className="btn-primary">Start Journey</button>
              <button onClick={() => { setStage('idle'); setActiveLayer(-1); setPacketPos(0); setIsInspecting(false); }} className="btn-outline">Reset</button>
            </div>
          </div>
        </div>

        {/* Stage Area */}
        <div className="animation-area">
          <div className="stack-container">
            
            {/* SENDER */}
            <div className="protocol-stack">
              <div className={`status-label ${stage === 'idle' ? 'idle' : 'active'}`}>Raw Data</div>
              <div className="stack-header sender">Sender</div>
              <div className="stack-body">
                {layers.map((l, i) => {
                  const isSent = (stage === 'client-stack' && activeLayer >= i) || ['traveling', 'server-stack', 'complete'].includes(stage);
                  return (
                    <div key={i} className={`layer-block ${isSent ? 'layer-active-sender' : 'layer-inactive'}`}>
                      <span>{l.name}</span>
                      {isSent && <button onClick={() => handleInspect('sender', i)} className="btn-inspect">📦 Inspect</button>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RECEIVER */}
            <div className="protocol-stack">
              <div className={`status-label ${stage === 'complete' ? 'received' : 'active'}`} style={{opacity: stage === 'complete' ? 1 : 0.3}}>Data Received</div>
              <div className="stack-header receiver">Receiver</div>
              <div className="stack-body">
                {layers.map((l, i) => {
                  const isReached = (stage === 'server-stack' && activeLayer <= i) || stage === 'complete';
                  return (
                    <div key={i} className={`layer-block ${isReached ? 'layer-active-receiver' : 'layer-inactive'}`}>
                      <span>{l.name}</span>
                      {isReached && <button onClick={() => handleInspect('receiver', i)} className="btn-inspect">📦 Inspect</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LINK */}
          <div className="physical-link-container">
             <div className="link-wire">
                {stage === 'traveling' && <div className="wire-pulse" />}
             </div>
             <p className="label-mini" style={{ marginTop: '0.5rem' }}>Physical Network Link (Signals/Waves)</p>
          </div>

          {/* PACKET */}
          {stage === 'traveling' && (
            <div className="packet" style={{ left: `${20 + (packetPos * 0.6)}%`, bottom: '135px' }} onClick={() => handleInspect('link')}>
              <div className="packet-box">📦</div>
            </div>
          )}

          {/* INSPECTOR */}
          {isInspecting && (
            <div className="overlay">
              <div className="modal">
                <div className="modal-header">
                  <h2 className="modal-title">Packet Header Inspector</h2>
                  <button onClick={() => setIsInspecting(false)} className="close-btn">Close ×</button>
                </div>
                <div style={{ padding: '1.5rem' }}>
                   <div className="payload-box">
                      <span className="label-mini">Payload Content</span>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#2563eb', fontWeight: 'bold', marginTop: '0.25rem' }}>"Original Application Data"</div>
                   </div>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                     {layers.map((l, i) => {
                       let isVisible = false;
                       if (inspectSource === 'sender') isVisible = i <= clickedLayerIndex;
                       else if (inspectSource === 'link') isVisible = true;
                       else if (inspectSource === 'receiver') isVisible = i <= clickedLayerIndex;

                       return (
                        <div key={i} className={`header-entry ${isVisible ? 'header-visible' : 'header-hidden'}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                            <p className="label-mini" style={{ color: '#1e40af' }}>{l.name} Header</p>
                            {!isVisible && <span className="label-mini" style={{ opacity: 0.5 }}>Stripped/Waiting</span>}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.25rem' }}>
                            {isVisible ? l.details.map((detail, idx) => (
                              <p key={idx} style={{ fontSize: '10px', fontFamily: 'monospace', color: detail.includes('Note:') ? '#60a5fa' : '#334155' }}>{detail}</p>
                            )) : <p style={{ fontSize: '10px', fontStyle: 'italic', gridColumn: 'span 2', color: '#94a3b8' }}>No data accessible.</p>}
                          </div>
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
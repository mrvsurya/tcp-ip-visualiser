# TCP/IP Protocol Journey 🚀

An interactive, high-fidelity React simulation built for **H2 Computing students**. This tool visualizes the lifecycle of a packet through the TCP/IP 4-layer model, contrasting real-world scenarios for reliable and time-sensitive data transmission.

### 🔗 **[View Live Demo](https://mrvsurya.github.io/tcp-ip-visualiser/)**

## 🚀 Key Features

* **Real-World Scenario Switching:** * **TCP Mode:** Simulates a **Web Browser** fetching data via HTTP/1.1 (Reliability focused).
    * **UDP Mode:** Simulates a **Competitive Game Engine** synchronizing player coordinates (Low-latency focused).
* **Packet Header Inspector:** Hover over the packet in transit to pause, or click 'Inspect' on any layer for a deep-dive snapshot of metadata.
* **Intelligent "Managed By" Context:** Dynamically identifies the component responsible for each layer:
    * **Application:** Web Browser vs. Game Engine logic.
    * **Transport & Internet:** Operating System (OS) management.
    * **Link:** Ethernet (IEEE 802.3) vs. Wireless (IEEE 802.11) adapters.
* **True Encapsulation Logic:** Visualizes the addition of headers at the Sender and the de-encapsulation (stripping) process at the Receiver.
* **Physical Medium Toggle:** Switch between **Wired** and **Wireless** transmission to see how Link layer units and NIC types adapt.
* **Granular Speed Control:** A refined slider allows students to slow down the logic to 100ms steps or speed it up for a continuous flow.

## 🧪 Technical Metadata Included

| Layer | Metadata Tracked |
| :--- | :--- |
| **Application** | HTTP Methods, Hostnames, Game Actions, and Coords. |
| **Transport** | Port Mapping (80 vs 27015), Seq Numbers, and UDP Lengths. |
| **Internet** | Source/Dest IP, Protocol IDs (6 for TCP, 17 for UDP), and TTL. |
| **Link** | MAC Addresses, EtherType, and Frame Check Sequence (FCS). |

## 🛠️ Technical Stack

* **Framework:** React.js (Hooks-based state management)
* **Styling:** Tailwind CSS (Utility-first responsive design)
* **Animations:** Framer Motion / CSS Keyframes for smooth packet travel and hover physics.
* **Deployment:** GitHub Pages
---
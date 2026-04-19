# TCP/IP Visualiser

An interactive React-based simulation designed for **H2 Computing students** to understand the step-by-step process of data moving through the TCP/IP 4-layer model. 

### 🔗 **[View Live Demo](https://mrvsurya.github.io/tcp-ip-visualiser/)**

This tool visualises how headers are added (**encapsulation**) at the Sender and stripped (**de-encapsulation**) at the Receiver, providing technical metadata at every stage.

## 🚀 Key Features

* **Persistent Snapshot Review:** Students can click 'Inspect' on any layer even after the process has finished to see a "frozen" snapshot of the packet headers at that specific moment.
* **Decoupled Logic:** The Sender side maintains its full encapsulation state while the Receiver side dynamically shows the stripping process, preventing technical confusion.
* **Technical Header Metadata:**
    * **Application:** HTTP/1.1 GET requests.
    * **Transport:** Source/Dest Ports, Seq numbers, and Checksums.
    * **Internet:** IP addressing, TTL, and Protocols.
    * **Link:** MAC addressing (Source Host to Default Gateway logic) and EtherType.
* **Physical Link Animation:** Visual representation of the transmission medium (Signals/Waves).
* **Speed Control:** Adjustable animation slider to follow the logic at a comfortable pace.

## 🛠️ Technical Stack

* **Framework:** React.js
* **Styling:** External CSS (`App.css`) with CSS Keyframe animations.
* **Deployment:** GitHub Pages
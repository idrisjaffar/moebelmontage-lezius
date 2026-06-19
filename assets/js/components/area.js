/* ==========================================================================
   RAPHAEL LEZIUS | AREA MODULE (PHASE 1: TOPOLOGICAL NETWORK CONTROLLER)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('tacticalTerrain');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Canvas Size Normalization Matrix
    const resizeCanvas = () => {
        canvas.width = canvas.parentElement.offsetWidth;
        canvas.height = canvas.parentElement.offsetHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Node Cluster Configuration Strategy
    const nodes = [];
    const nodeCount = 28;
    const maxDistance = 140;

    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.5 + 1
        });
    }

    // High-Efficiency Render Loop
    const drawNetworkTopology = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Node Vector Update Mapping
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            // Strict Bound Verification Checks
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            ctx.beginPath();
            ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0, 229, 255, 0.15)';
            ctx.fill();
        });

        // Neural Synchronization Interlink Lines
        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dx = nodes[i].x - nodes[j].x;
                const dy = nodes[i].y - nodes[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < maxDistance) {
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    
                    // Inverse Linear Proportional Opacity Scale
                    const alpha = (1 - (dist / maxDistance)) * 0.08;
                    ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        animationFrameId = requestAnimationFrame(drawNetworkTopology);
    };

    // Initialize Telemetry Loop
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        drawNetworkTopology();
    }

    // Performance Cleanup Stack Interface
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(animationFrameId);
    });
});

/* ==========================================================================
   RAPHAEL LEZIUS | AREA MODULE (PHASE 2: PROTOCOL INTERACTIVE PHYSICS INTERFACE)
   ========================================================================== */

const initProtocolCards = () => {
    const cards = document.querySelectorAll('.protocol-trust-card');
    if (cards.length === 0) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element
            const y = e.clientY - rect.top;  // y position within the element

            // Dynamically calibrate the reflective top gradient based on spatial vector input
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
};

// Mount inside running DOM wrapper logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProtocolCards);
} else {
    initProtocolCards();
}

/* ==========================================================================
   RAPHAEL LEZIUS | AREA MODULE (PHASE 3: INTERACTIVE SECTOR SYNAPSES)
   ========================================================================== */

const initSectorMapSynapses = () => {
    const zoneCards = document.querySelectorAll('.js-zone-card');
    const mapNodes = document.querySelectorAll('.map-node');
    const svgLinks = document.querySelectorAll('.svg-link');

    if (zoneCards.length === 0 || mapNodes.length === 0) return;

    zoneCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const targetZone = card.getAttribute('data-target');

            // 1. Reset all nodes and links
            mapNodes.forEach(node => node.classList.remove('is-active'));
            svgLinks.forEach(link => link.classList.remove('is-flowing'));

            // 2. Activate the corresponding node
            const targetNode = document.querySelector(`.map-node[data-node="${targetZone}"]`);
            if (targetNode) targetNode.classList.add('is-active');

            // 3. Activate the corresponding SVG data flow
            if (targetZone === 'zone-2') {
                const linkMuc = document.querySelector('.link-muc');
                if (linkMuc) linkMuc.classList.add('is-flowing');
            } else if (targetZone === 'zone-3') {
                const linkSta = document.querySelector('.link-sta');
                if (linkSta) linkSta.classList.add('is-flowing');
            }
        });

        card.addEventListener('mouseleave', () => {
            // Revert to default state (HQ active) when mouse leaves
            mapNodes.forEach(node => node.classList.remove('is-active'));
            svgLinks.forEach(link => link.classList.remove('is-flowing'));
            
            const hqNode = document.querySelector('.node-hq');
            if (hqNode) hqNode.classList.add('is-active');
        });
    });
};

// Mount inside running DOM wrapper logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectorMapSynapses);
} else {
    initSectorMapSynapses();
}

/* ==========================================================================
   RAPHAEL LEZIUS | AREA MODULE (PHASE 4: CLEARANCE SCANNER LOGIC)
   ========================================================================== */

const initClearanceScanner = () => {
    const scanBtn = document.querySelector('.js-verify-sector');
    const inputField = document.getElementById('sectorInput');
    const resultBox = document.getElementById('scanResult');

    if (!scanBtn || !inputField || !resultBox) return;

    // Set initial standby text
    resultBox.innerHTML = 'AWAITING_INPUT...';

    const triggerScan = () => {
        const query = inputField.value.trim();
        if (query.length < 4) {
            resultBox.innerHTML = '<span style="color: #ff5f56;">[ERR_01] UNGÜLTIGER_CODE: Bitte korrekte PLZ eingeben.</span>';
            resultBox.className = 'scan-result-container';
            resultBox.style.borderLeftColor = '#ff5f56';
            return;
        }

        // 1. Loading State
        const originalBtnText = scanBtn.innerHTML;
        scanBtn.innerHTML = '<span class="btn-text">SYNCING...</span> <i class="fas fa-spinner fa-spin"></i>';
        scanBtn.style.pointerEvents = 'none';
        
        resultBox.className = 'scan-result-container';
        resultBox.style.borderLeftColor = 'transparent';
        resultBox.innerHTML = 'Establishing uplink to logistics matrix...';

        // 2. Artificial Database Delay (1.5s for psychology)
        setTimeout(() => {
            scanBtn.innerHTML = originalBtnText;
            scanBtn.style.pointerEvents = 'auto';
            resultBox.classList.add('active-result');
            
            // 3. Logic Matrix Evaluation
            let responseHTML = '';
            let borderColor = '';

            // Check specific ZIP ranges
            if (query.startsWith('86')) {
                // Augsburg / Swabia
                borderColor = 'var(--price-gold, #d4af37)';
                responseHTML = `<span style="color: ${borderColor}">[ZONE_01 VERIFIED]</span> The Core. Keine Anfahrtspauschale. System-Readiness: 100%.`;
            } else if (query.startsWith('80') || query.startsWith('81') || query.startsWith('82') || query.startsWith('83') || query.startsWith('85')) {
                // Munich & Surroundings
                borderColor = 'var(--price-cyan, #00e5ff)';
                responseHTML = `<span style="color: ${borderColor}">[ZONE_02/03 VERIFIED]</span> Transit/Deep-Deployment. Flottenzugriff aktiv. SLA gewährt.`;
            } else if (query.startsWith('7') || query.startsWith('9')) {
                // Southern Germany (Extended)
                borderColor = 'var(--price-pink, #ff2a85)';
                responseHTML = `<span style="color: ${borderColor}">[B2B_SECTOR DETECTED]</span> Extended Range Protocol erforderlich. Bitte Anfrage starten.`;
            } else {
                // Unknown / National / International
                borderColor = '#ff5f56';
                responseHTML = `<span style="color: ${borderColor}">[SECTOR_UNKNOWN]</span> Reguläres Routing nicht möglich. Nationales B2B-Protokoll auf Anfrage.`;
            }

            // Apply typewriter effect wrapper
            resultBox.style.borderLeftColor = borderColor;
            resultBox.innerHTML = `<div class="typewriter-text">${responseHTML}</div>`;
            
        }, 1500);
    };

    // Event Listeners
    scanBtn.addEventListener('click', triggerScan);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') triggerScan();
    });
};

// Mount inside running DOM wrapper logic
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClearanceScanner);
} else {
    initClearanceScanner();
}
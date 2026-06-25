/* ==========================================================================
   COMPONENT: CINEMATIC DATA STREAM (BELT ENGINE v2.0)
   LOCATION: assets/js/components/belt.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    console.log("SYSTEM UPLINK: Visual Inventory Stream Initialized.");

    const track = document.getElementById('imageBelt');
    const items = document.querySelectorAll('.belt-item');
    const prevBtn = document.getElementById('prevBelt');
    const nextBtn = document.getElementById('nextBelt');
    const sectorBtns = document.querySelectorAll('.sector-btn');
    const pulseRail = document.getElementById('pulseRailIndicator');
    
    if (!track || items.length === 0) return;

    let currentIndex = 0;
    let currentSector = 'all';
    let visibleItems = Array.from(items); // Start with all items visible
    let autoDrift;

    // --- 1. SECTOR ROUTING (Filtering) ---
    function filterSector(sector) {
        currentSector = sector;
        visibleItems = [];
        let indexCounter = 0;

        items.forEach(item => {
            if (sector === 'all' || item.getAttribute('data-sector') === sector) {
                item.style.display = 'block';
                item.setAttribute('data-index', indexCounter); // Re-index for the rail
                visibleItems.push(item);
                indexCounter++;
            } else {
                item.style.display = 'none';
            }
        });

        // Reset to first image of new sector
        moveToIndex(0);
        updateSectorUI();
    }

    // --- 2. MAGNETIC MOVEMENT & FOCUS ---
    function moveToIndex(index) {
        if (visibleItems.length === 0) return;
        
        currentIndex = index;
        
        // Calculate Translation (moves track based on percentage)
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Apply Focus-Blur Effect (Cinematic Depth)
        visibleItems.forEach((item, i) => {
            if (i === currentIndex) {
                item.classList.add('in-focus');
            } else {
                item.classList.remove('in-focus');
            }
        });

        updatePulseRail();
        resetAutoDrift();
    }

    // --- 3. THE PULSE RAIL (Navigation UI) ---
    function updatePulseRail() {
        if (!pulseRail) return;
        // Calculate width of the glowing indicator based on how many items are visible
        const progressPercentage = (currentIndex / (visibleItems.length - 1)) * 100;
        const widthPercentage = 100 / visibleItems.length;
        
        pulseRail.style.width = `${widthPercentage}%`;
        pulseRail.style.left = `calc(${progressPercentage}% - (${progressPercentage}vw * 0.01))`; 
        // Math adjustment to keep it inside the rail bounds
        pulseRail.style.transform = `translateX(-${progressPercentage}%)`;
        pulseRail.style.left = `${progressPercentage}%`;
    }

    function updateSectorUI() {
        sectorBtns.forEach(btn => {
            if (btn.getAttribute('data-target') === currentSector) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    // --- 4. HARDWARE EVENT LISTENERS ---
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = (currentIndex > 0) ? currentIndex - 1 : visibleItems.length - 1;
            moveToIndex(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
            moveToIndex(newIndex);
        });
    }

    sectorBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const targetSector = e.currentTarget.getAttribute('data-target');
            filterSector(targetSector);
        });
    });

    // --- 5. DATA DRIFT (Auto-Scroll) ---
    function resetAutoDrift() {
        clearInterval(autoDrift);
        autoDrift = setInterval(() => {
            if (visibleItems.length > 1) {
                const newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
                moveToIndex(newIndex);
            }
        }, 6000); // Drifts every 6 seconds
    }

    // Initialize System
    filterSector('all');
});
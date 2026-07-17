/* ==========================================================================
   COMPONENT: PROJECT BELT CAROUSEL ENGINE (FIXED)
   LOCATION: assets/js/components/belt.js
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function() {
    console.log("🎞️ BELT ENGINE: Initializing...");

    var track = document.getElementById('imageBelt');
    if (!track) {
        console.error("❌ BELT ENGINE: 'imageBelt' not found!");
        return;
    }

    var items = document.querySelectorAll('.belt-item');
    var prevBtn = document.getElementById('prevBelt');
    var nextBtn = document.getElementById('nextBelt');
    var sectorBtns = document.querySelectorAll('.sector-btn');

    if (items.length === 0) {
        console.error("❌ BELT ENGINE: No .belt-item elements found!");
        return;
    }

    console.log("✅ BELT ENGINE: Found " + items.length + " items.");

    var currentIndex = 0;
    var currentSector = 'all';
    var visibleItems = [];

    // --- Helper: Get all visible items ---
    function getVisibleItems() {
        var visible = [];
        items.forEach(function(item) {
            if (item.style.display !== 'none') {
                visible.push(item);
            }
        });
        return visible;
    }

    // --- Move to specific index ---
    function moveToIndex(index) {
        visibleItems = getVisibleItems();
        if (visibleItems.length === 0) return;

        // Clamp index
        if (index < 0) index = visibleItems.length - 1;
        if (index >= visibleItems.length) index = 0;
        currentIndex = index;

        var offset = -currentIndex * 100;
        track.style.transform = 'translateX(' + offset + '%)';
        track.style.transition = 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)';

        console.log("➡️ BELT ENGINE: Moved to index " + currentIndex);
    }

    // --- Filter by sector ---
    function filterSector(sector) {
        currentSector = sector;
        var hasVisible = false;

        items.forEach(function(item) {
            var itemSector = item.getAttribute('data-sector');
            if (sector === 'all' || itemSector === sector) {
                item.style.display = 'block';
                hasVisible = true;
            } else {
                item.style.display = 'none';
            }
        });

        // Reset to first visible item
        visibleItems = getVisibleItems();
        currentIndex = 0;
        moveToIndex(0);

        // Update sector button UI
        sectorBtns.forEach(function(btn) {
            var target = btn.getAttribute('data-target');
            if (target === sector) {
                btn.classList.add('active');
                btn.style.background = '#00e5ff';
                btn.style.color = '#000';
                btn.style.border = 'none';
            } else {
                btn.classList.remove('active');
                btn.style.background = 'transparent';
                btn.style.color = '#fff';
                btn.style.border = '1px solid #333';
            }
        });

        console.log("🔍 BELT ENGINE: Filtered to sector: " + sector + " (" + visibleItems.length + " items)");
    }

    // --- Event Listeners ---
    if (prevBtn) {
        prevBtn.addEventListener('click', function() {
            visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;
            var newIndex = (currentIndex > 0) ? currentIndex - 1 : visibleItems.length - 1;
            moveToIndex(newIndex);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function() {
            visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;
            var newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
            moveToIndex(newIndex);
        });
    }

    sectorBtns.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            var targetSector = e.currentTarget.getAttribute('data-target');
            filterSector(targetSector);
        });
    });

    // --- Initialize ---
    filterSector('all');

    // --- Auto-advance every 6 seconds (optional) ---
    var autoAdvance = setInterval(function() {
        visibleItems = getVisibleItems();
        if (visibleItems.length > 1) {
            var newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
            moveToIndex(newIndex);
        }
    }, 6000);

    // Stop auto-advance when user interacts
    track.addEventListener('mouseenter', function() {
        clearInterval(autoAdvance);
    });
    track.addEventListener('mouseleave', function() {
        autoAdvance = setInterval(function() {
            visibleItems = getVisibleItems();
            if (visibleItems.length > 1) {
                var newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
                moveToIndex(newIndex);
            }
        }, 6000);
    });

    console.log("✅ BELT ENGINE: Fully initialized.");
});
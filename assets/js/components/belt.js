/* ==========================================================================
   COMPONENT: PROJECT BELT CAROUSEL ENGINE (v2 – FULLY FIXED)
   LOCATION: assets/js/components/belt.js
   ========================================================================== */

(function() {
    "use strict";

    function initBelt() {
        var track = document.getElementById('imageBelt');
        if (!track) {
            console.warn("BELT: No track found.");
            return;
        }

        var items = document.querySelectorAll('.belt-item');
        var prevBtn = document.getElementById('prevBelt');
        var nextBtn = document.getElementById('nextBelt');
        var sectorBtns = document.querySelectorAll('.sector-btn');

        if (items.length === 0) {
            console.warn("BELT: No items found.");
            return;
        }

        var currentIndex = 0;
        var currentSector = 'all';
        var visibleItems = Array.from(items);
        var autoSlideTimer = null;

        // ---------- Helper: get visible items ----------
        function getVisibleItems() {
            var visible = [];
            items.forEach(function(item) {
                if (item.style.display !== 'none') {
                    visible.push(item);
                }
            });
            return visible;
        }

        // ---------- Move to index ----------
        function moveToIndex(index) {
            visibleItems = getVisibleItems();
            if (visibleItems.length === 0) return;
            if (index < 0) index = visibleItems.length - 1;
            if (index >= visibleItems.length) index = 0;
            currentIndex = index;
            track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            track.style.transition = 'transform 0.7s cubic-bezier(0.2, 0.8, 0.2, 1)';
            console.log("BELT: Moved to index " + currentIndex);
        }

        // ---------- Filter by sector ----------
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
            visibleItems = getVisibleItems();
            currentIndex = 0;
            moveToIndex(0);

            // Update button styles
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
        }

        // ---------- Auto-slide ----------
        function startAutoSlide() {
            if (autoSlideTimer) clearInterval(autoSlideTimer);
            autoSlideTimer = setInterval(function() {
                var visible = getVisibleItems();
                if (visible.length > 1) {
                    var next = (currentIndex < visible.length - 1) ? currentIndex + 1 : 0;
                    moveToIndex(next);
                }
            }, 5000);
        }

        function stopAutoSlide() {
            if (autoSlideTimer) {
                clearInterval(autoSlideTimer);
                autoSlideTimer = null;
            }
        }

        // ---------- Event listeners ----------
        if (prevBtn) {
            prevBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoSlide();
                visibleItems = getVisibleItems();
                var newIndex = (currentIndex > 0) ? currentIndex - 1 : visibleItems.length - 1;
                moveToIndex(newIndex);
                startAutoSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoSlide();
                visibleItems = getVisibleItems();
                var newIndex = (currentIndex < visibleItems.length - 1) ? currentIndex + 1 : 0;
                moveToIndex(newIndex);
                startAutoSlide();
            });
        }

        sectorBtns.forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                stopAutoSlide();
                var sector = e.currentTarget.getAttribute('data-target');
                filterSector(sector);
                startAutoSlide();
            });
        });

        // ---------- Pause on hover ----------
        track.addEventListener('mouseenter', stopAutoSlide);
        track.addEventListener('mouseleave', startAutoSlide);

        // ---------- Initialize ----------
        filterSector('all');
        startAutoSlide();
        console.log("BELT: Initialized with " + items.length + " items.");
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initBelt);
    } else {
        initBelt();
    }
})();
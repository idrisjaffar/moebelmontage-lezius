/* ==========================================================================
   CAROUSEL ENGINE: AUTOMATED BELT NAVIGATOR
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('imageBelt');
    const items = document.querySelectorAll('.belt-item');
    const prevBtn = document.getElementById('prevBelt');
    const nextBtn = document.getElementById('nextBelt');
    const dotsContainer = document.getElementById('beltDots');
    
    let currentIndex = 0;
    let autoSlideInterval;

    // Safety Check: Stop if elements don't exist
    if (!track || items.length === 0) return;

    // 1. Generate Dots Dynamically
    dotsContainer.innerHTML = ''; // Clear previous
    items.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(i);
        });
        dotsContainer.appendChild(dot);
    });

    const dots = document.querySelectorAll('.dot');

    // 2. Navigation Core Engine
    function goToSlide(index) {
        // Bounds checking
        if (index < 0) index = items.length - 1;
        if (index >= items.length) index = 0;
        
        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        
        // Update Active Dot
        dots.forEach(d => d.classList.remove('active'));
        if (dots[currentIndex]) {
            dots[currentIndex].classList.add('active');
        }
    }

    // 3. Button Event Listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(currentIndex - 1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            stopAutoSlide();
            goToSlide(currentIndex + 1);
        });
    }

    // 4. Automated Infinite Rotation (Auto-Play)
    function startAutoSlide() {
        // Run every 5000ms (5 seconds)
        autoSlideInterval = setInterval(() => {
            goToSlide(currentIndex + 1);
        }, 5000);
    }

    function stopAutoSlide() {
        clearInterval(autoSlideInterval);
        // Optional: restart auto-slide after a period of inactivity could go here
    }

    // Initialize Auto-Play
    startAutoSlide();
});
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('missionOS');
    const steps = modal.querySelectorAll('.form-step');
    const progressBar = document.getElementById('osProgress');

    document.addEventListener('click', (e) => {
        // Open/Close logic
        if (e.target.closest('.js-open-os')) modal.classList.add('system-active');
        if (e.target.closest('.js-close-os')) modal.classList.remove('system-active');

        // Navigation logic
        if (e.target.classList.contains('btn-next')) {
            const currentStep = modal.querySelector('.form-step.is-active');
            const nextStep = currentStep.nextElementSibling;
            
            if (nextStep && nextStep.classList.contains('form-step')) {
                currentStep.classList.remove('is-active');
                nextStep.classList.add('is-active');
                
                // Update Progress (25% per step)
                const stepNum = nextStep.getAttribute('data-step');
                progressBar.style.width = (stepNum * 25) + '%';
            }
        }
    });
});

// Ensure smooth transitions when steps change
const currentStep = modal.querySelector('.form-step.is-active');
currentStep.style.opacity = '0';
setTimeout(() => {
    currentStep.classList.remove('is-active');
    nextStep.classList.add('is-active');
}, 300);

/* ==========================================================================
   COMPONENT: MISSION OS (REQUEST TERMINAL)
   ========================================================================== */

window.openMissionOS = function() {
    const osTerminal = document.getElementById('global-os');
    if (!osTerminal) return;

    // Display the terminal logic
    osTerminal.classList.add('active');
    
    // Aesthetic: Prevent body scroll when terminal is open
    document.body.style.overflow = 'hidden';
    
    console.log("SYSTEM UPLINK: MISSION OS INITIALIZED");
};

// Close logic
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.getElementById('global-os').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});
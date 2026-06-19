// Ensure functions are global so 'onclick' works in HTML
window.toggleModule = function(element) {
    const body = element.querySelector('.module-body');
    const icon = element.querySelector('.m-plus');
    const isOpen = element.classList.contains('open');

    document.querySelectorAll('.faq-module').forEach(mod => {
        mod.classList.remove('open');
        mod.querySelector('.module-body').style.maxHeight = null;
        mod.querySelector('.m-plus').style.transform = 'rotate(0deg)';
        mod.style.borderColor = 'transparent';
    });

    if (!isOpen) {
        element.classList.add('open');
        body.style.maxHeight = body.scrollHeight + "px";
        icon.style.transform = 'rotate(45deg)';
        element.style.borderColor = 'var(--neon-gold)';
    }
};

window.updateStep = function(id) {
    const content = document.getElementById('step-content');
    const steps = {
        1: { title: "01. Scan & Bodenanalyse", desc: "...", icon: "fa-project-diagram" },
        2: { title: "02. Foundation Core", desc: "...", icon: "fa-layer-group" },
        // ... (keep the rest of your step objects here)
    };
    
    content.style.opacity = '0';
    setTimeout(() => {
        content.innerHTML = `<h3>${steps[id].title}</h3><p>${steps[id].desc}</p>`;
        content.style.opacity = '1';
    }, 300);
};
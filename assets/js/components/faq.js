document.querySelectorAll('.js-faq-item').forEach(item => {
    item.querySelector('.faq-trigger').addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        
        // Schließe alle anderen
        document.querySelectorAll('.js-faq-item').forEach(el => {
            el.classList.remove('active');
            el.querySelector('.faq-content').style.maxHeight = null;
        });

        // Öffne aktuelles
        if (!isOpen) {
            item.classList.add('active');
            item.querySelector('.faq-content').style.maxHeight = item.querySelector('.faq-content').scrollHeight + "px";
        }
    });
});
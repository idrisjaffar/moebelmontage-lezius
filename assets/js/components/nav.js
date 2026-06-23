// Oben in Ihrer main.js: Importieren Sie die Engine
import NavigationEngine from './components/nav.js';

// ... (Ihre anderen Funktionen wie loadComponent etc.) ...

// Wenn Sie Ihre Navigation über fetch() in die Seite laden:
async function loadNavigation() {
    try {
        const response = await fetch('components/nav.html');
        const html = await response.text();
        document.getElementById('global-nav').innerHTML = html;
        
        // WICHTIG: Starten Sie die Engine ERST, wenn das HTML existiert!
        new NavigationEngine();
        
    } catch (error) {
        console.error('Fehler beim Laden der Navigation:', error);
    }
}

// Beim Start der Seite ausführen
document.addEventListener('DOMContentLoaded', () => {
    loadNavigation();
});
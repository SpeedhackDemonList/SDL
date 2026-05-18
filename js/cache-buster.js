/**
 * Cache Buster - Forces refresh when code is updated
 * Add this script BEFORE your main.js import
 */

(function() {
    const CURRENT_VERSION = '2.1.0'; // Increment this when you update JS files
    const STORED_VERSION = localStorage.getItem('app_version');
    
    if (STORED_VERSION !== CURRENT_VERSION) {
        console.log('New version detected. Clearing cache and reloading...');
        
        // Clear localStorage except for user preferences
        const darkMode = localStorage.getItem('dark');
        const roulette = localStorage.getItem('roulette');
        
        localStorage.clear();
        
        // Restore user data
        if (darkMode !== null) localStorage.setItem('dark', darkMode);
        if (roulette !== null) localStorage.setItem('roulette', roulette);
        
        // Set new version
        localStorage.setItem('app_version', CURRENT_VERSION);
        
        // Force hard reload from server (bypass cache)
        if (STORED_VERSION !== null) {
            // Clear all caches and reload
            if ('caches' in window) {
                caches.keys().then(function(names) {
                    for (let name of names) caches.delete(name);
                });
            }
            window.location.reload(true);
        }
    }
})();

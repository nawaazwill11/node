if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./js/service-worker.js')
        .then(() => {
            console.log('Service worker registered');
        })
        .catch(error => {
            console.error(error);
        });
    });
}
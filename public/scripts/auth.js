document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged(user => {
        if (user) {
            document.getElementById('main-container').style.display = 'flex';
            document.getElementById('login-container').style.display = 'none';
            loadScript('scripts/googleMaps.js');
        } else {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'flex';
        }
    });
});

function loadScript(url) {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    document.head.appendChild(script);
}

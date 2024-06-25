export function showElement(element) {
    element.style.display = 'flex';
}

export function hideElement(element) {
    element.style.display = 'none';
}

export function toggleNavMenu() {
    const navMenu = document.getElementById('nav-menu');
    if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
    } else {
        navMenu.style.display = 'flex';
    }
}

export function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
    } else {
        input.type = 'password';
    }
}

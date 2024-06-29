document.addEventListener('DOMContentLoaded', () => {
    const signOutButton = document.getElementById('sign-out-button');

    signOutButton.addEventListener('click', () => {
        auth.signOut().then(() => {
            document.getElementById('main-container').style.display = 'none';
            document.getElementById('login-container').style.display = 'flex';
        });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const deleteAccountButton = document.getElementById('delete-account-button');

    deleteAccountButton.addEventListener('click', () => {
        const user = auth.currentUser;
        const password = prompt('Please enter your password to confirm account deletion:');

        if (!password) {
            alert('Password is required to delete your account.');
            return;
        }

        const credential = firebase.auth.EmailAuthProvider.credential(user.email, password);

        user.reauthenticateWithCredential(credential)
            .then(() => {
                if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                    user.delete().then(() => {
                        alert('Account deleted successfully');
                        document.getElementById('main-container').style.display = 'none';
                        document.getElementById('login-container').style.display = 'flex';
                    }).catch(error => {
                        console.error('Error deleting account:', error);
                        alert('Failed to delete account');
                    });
                }
            })
            .catch(error => {
                console.error('Error re-authenticating:', error);
                alert('Failed to re-authenticate. Please check your password and try again.');
            });
    });
});

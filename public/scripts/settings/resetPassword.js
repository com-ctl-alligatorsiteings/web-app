document.addEventListener('DOMContentLoaded', () => {
    const resetPasswordButton = document.getElementById('reset-password-button');

    resetPasswordButton.addEventListener('click', () => {
        const email = auth.currentUser.email;
        auth.sendPasswordResetEmail(email).then(() => {
            alert('Password reset email sent. Please check your inbox.');
        }).catch(error => {
            console.error('Error sending password reset email:', error);
            alert('Failed to send password reset email');
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('error-message');

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      try {
        const formData = new FormData(loginForm);
        const response = await fetch('/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.get('email'),
            password: formData.get('password')
          })
        });

        const data = await response.json();
        
        if (data.error) {
          errorMessage.textContent = data.error;
          errorMessage.style.display = 'block';
        } else if (data.success) {
          window.location.href = data.redirect;
        }
      } catch (err) {
        console.error('Error:', err);
        errorMessage.textContent = 'An error occurred. Please try again.';
        errorMessage.style.display = 'block';
      }
    });
  }
});
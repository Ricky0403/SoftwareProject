document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = {
              email: this.querySelector('[name="email"]').value,
              password: this.querySelector('[name="password"]').value
          };

          try {
              const response = await fetch('/auth/login', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
              });

              const data = await response.json();
              
              if (data.success) {
                  window.location.href = data.redirect;
              } else {
                  const errorDiv = document.getElementById('error-message');
                  errorDiv.textContent = data.error;
                  errorDiv.style.display = 'block';
              }
          } catch (error) {
              console.error('Login error:', error);
          }
      });
  }

  if (registerForm) {
      registerForm.addEventListener('submit', async function(e) {
          e.preventDefault();
          
          const formData = {
              email: this.querySelector('[name="email"]').value,
              username: this.querySelector('[name="username"]').value,
              password: this.querySelector('[name="password"]').value,
              phone: this.querySelector('[name="phone"]').value,
              city: this.querySelector('[name="city"]').value
          };

          try {
              const response = await fetch('/auth/register', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(formData)
              });

              const data = await response.json();
              
              if (data.success) {
                  window.location.href = '/login';
              } else {
                  const errorDiv = document.createElement('div');
                  errorDiv.className = 'error-message';
                  errorDiv.textContent = data.error;
                  errorDiv.style.display = 'block';
                  this.insertBefore(errorDiv, this.firstChild);
              }
          } catch (error) {
              console.error('Registration error:', error);
          }
      });
  }
});
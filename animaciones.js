let selectedUserType = 'admin';
let sessionToken = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeUserTypeSelector();
    initializeLoginForm();
    initializeRecoveryForm();
    preventBackButton();
});

// User Type Selection
function initializeUserTypeSelector() {
    const userTypeCards = document.querySelectorAll('.user-type-card');
    
    userTypeCards.forEach(card => {
        card.addEventListener('click', function() {
            // Remove active class from all cards
            userTypeCards.forEach(c => c.classList.remove('active'));
            
            // Add active class to selected card
            this.classList.add('active');
            
            // Update selected type
            selectedUserType = this.dataset.type;
            
            // Update form placeholders
            updateFormPlaceholders();
        });
    });
    
    // Set default selection
    userTypeCards[0].classList.add('active');
    updateFormPlaceholders();
}

function updateFormPlaceholders() {
    const usernameInput = document.getElementById('username');
    const usernameLabel = usernameInput.nextElementSibling;
    
    if (selectedUserType === 'admin') {
        usernameInput.placeholder = 'Usuario administrador';
        usernameLabel.innerHTML = '<i class="fas fa-user-shield me-2"></i>Usuario';
    } else {
        usernameInput.placeholder = 'Número de documento';
        usernameLabel.innerHTML = '<i class="fas fa-id-card me-2"></i>Número de Documento';
    }
}

// Login Form
function initializeLoginForm() {
    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            showAlert('Por favor completa todos los campos', 'warning');
            return;
        }
        
        await performLogin(username, password);
    });
}

async function performLogin(username, password) {
    const btn = document.querySelector('.btn-login');
    const loginText = btn.querySelector('.login-text');
    const spinner = btn.querySelector('.loading-spinner');
    
    // Show loading state
    btn.disabled = true;
    loginText.style.display = 'none';
    spinner.style.display = 'inline';
    
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycby7NYD_Yt6rH5DBMY-H9tj91aJ6uoBFmf_t8JxXypFNByFP2zDwd7-janofBK23Pca3Iw/exec', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'login',
                username: username,
                password: password,
                userType: selectedUserType
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            sessionToken = result.data.sessionToken;
            localStorage.setItem('sessionToken', sessionToken);
            localStorage.setItem('userType', result.data.userType);
            localStorage.setItem('username', result.data.username);
            
            showAlert('Inicio de sesión exitoso. Redirigiendo...', 'success');
            
            setTimeout(() => {
                window.location.href = result.data.redirectUrl;
            }, 1500);
        } else {
            showAlert(result.message || 'Error en el inicio de sesión', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Inténtalo de nuevo.', 'danger');
    } finally {
        // Reset button state
        btn.disabled = false;
        loginText.style.display = 'inline';
        spinner.style.display = 'none';
    }
}

// Password Recovery
function initializeRecoveryForm() {
    const btnRecover = document.getElementById('btnRecoverPassword');
    
    btnRecover.addEventListener('click', async function() {
        const form = document.getElementById('recoveryForm');
        const formData = new FormData(form);
        
        const data = {
            docType: document.getElementById('recDocType').value,
            docNumber: document.getElementById('recDocNumber').value,
            fullName: document.getElementById('recFullName').value,
            phone: document.getElementById('recPhone').value,
            favoriteColor: document.getElementById('recFavoriteColor').value,
            favoriteAnimal: document.getElementById('recFavoriteAnimal').value
        };
        
        // Validate form
        if (!data.docType || !data.docNumber || !data.fullName || 
            !data.phone || !data.favoriteColor || !data.favoriteAnimal) {
            showAlert('Por favor completa todos los campos', 'warning');
            return;
        }
        
        await performPasswordRecovery(data);
    });
}

async function performPasswordRecovery(data) {
    const btn = document.getElementById('btnRecoverPassword');
    const originalText = btn.innerHTML;
    
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Verificando...';
    
    try {
        // CORREGIDO: Usar la misma URL que la función de login
        const response = await fetch('https://script.google.com/macros/s/AKfycbxoMvh8i01-6aYtSWtuQODde2GQe1y1OlDBBXOYIwhr0_3ntewGv5L2EtCgPqpbczgDfQ/exec', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'recoverPassword',
                ...data
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('recoveredUsername').textContent = result.data.username;
            document.getElementById('recoveredPassword').textContent = result.data.password;
            document.getElementById('recoveryResult').style.display = 'block';
            
            showAlert('Contraseña recuperada exitosamente', 'success');
        } else {
            showAlert(result.message || 'Información no válida', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        showAlert('Error de conexión. Inténtalo de nuevo.', 'danger');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Alert System
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-custom alert-dismissible fade show" role="alert">
            <div class="d-flex align-items-center">
                <i class="fas fa-${getAlertIcon(type)} me-2"></i>
                <div>${message}</div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

function getAlertIcon(type) {
    const icons = {
        success: 'check-circle',
        danger: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// Security Functions
function preventBackButton() {
    window.history.pushState(null, null, window.location.href);
    
    window.addEventListener('popstate', function() {
        window.history.pushState(null, null, window.location.href);
        showAlert('Por favor usa los controles de navegación del sistema', 'warning');
    });
}

// Session Management
function checkExistingSession() {
    const token = localStorage.getItem('sessionToken');
    const userType = localStorage.getItem('userType');
    
    if (token && userType) {
        // Redirect to appropriate dashboard
        const redirectUrl = userType === 'admin' ? '?page=admin' : '?page=client';
        window.location.href = redirectUrl;
    }
}

// Check for existing session on load
checkExistingSession();

// Handle browser refresh
window.addEventListener('beforeunload', function() {
    // Clear sensitive data if not properly logged in
    if (!sessionToken) {
        localStorage.removeItem('sessionToken');
        localStorage.removeItem('userType');
        localStorage.removeItem('username');
    }
});

// Security: Clear localStorage on tab close
window.addEventListener('unload', function() {
    if (!sessionToken) {
        localStorage.clear();
    }

});

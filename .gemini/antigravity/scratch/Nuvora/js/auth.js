// auth.js - Mobile or Email based Authentication

const Auth = {
    user: null,

    init() {
        console.log('Nuvora: Auth init started');
        const storedUser = localStorage.getItem('nuvora_user');
        if (storedUser) {
            this.user = JSON.parse(storedUser);
        }
        this.updateNavbar();
        this.renderLoginModal();
    },

    async login(input) {
        if (!input) {
            alert('Please enter a valid Mobile Number or Email.');
            return;
        }

        // Basic validation
        const isEmail = input.includes('@');
        const isMobile = /^[0-9]{10}$/.test(input);

        if (!isEmail && !isMobile) {
            alert('Please enter a valid Email (e.g., john@example.com) or 10-digit Mobile Number.');
            return;
        }

        try {
            // Check if user exists (search by mobile OR email)
            const { data: user, error } = await window.supabaseClient
                .from('users')
                .select('*')
                .or(`mobile.eq.${input},email.eq.${input}`)
                .maybeSingle();

            if (user) {
                this.setUser(user);
                alert(`Welcome back, ${user.first_name}!`);
                location.reload();
            } else {
                // New User Flow - Auto-register without prompt to keep it "Email/Mobile only"
                let firstName = 'Member';
                if (isEmail) {
                    // Extract name from email (e.g. john from john@example.com)
                    const namePart = input.split('@')[0];
                    // Capitalize first letter
                    firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
                }

                const newUserObj = {
                    first_name: firstName,
                    // If input is email, save to email. If mobile, save to mobile.
                    mobile: isMobile ? input : null,
                    email: isEmail ? input : null
                };

                const { data: newUser, error: createError } = await window.supabaseClient
                    .from('users')
                    .insert([newUserObj])
                    .select()
                    .single();

                if (createError) {
                    console.error("Reg Error", createError);
                    alert('Registration failed. Please try again.');
                } else {
                    this.setUser(newUser);
                    alert('Account created! Welcome.');
                    location.reload();
                }
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('Login failed. Please try again.');
        }
    },

    setUser(userData) {
        this.user = userData;
        localStorage.setItem('nuvora_user', JSON.stringify(userData));
        this.updateNavbar();
    },

    logout() {
        this.user = null;
        localStorage.removeItem('nuvora_user');
        alert('Logged out successfully.');
        window.location.href = 'index.html';
    },

    isAuthenticated() {
        return !!this.user;
    },

    // UI Updates
    updateNavbar() {
        // Target the specific ID we added to all pages
        const userIconContainer = document.getElementById('user-nav-link');
        if (!userIconContainer) return;

        if (this.isAuthenticated()) {
            // Check for Admin
            const isAdmin = ['mailtonuvora@gmail.com', 'saravanavenkatachalam@gmail.com'].includes(this.user.email);
            if (isAdmin) {
                sessionStorage.setItem('nuvora_admin', 'true');
            }

            // Change Icon Link to Dropdown or Account Page
            userIconContainer.innerHTML = `
                <div class="dropdown">
                    <a href="#" class="dropdown-toggle" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-user fa-2x text-primary"></i>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end p-3 border-0 shadow-lg rounded-4" aria-labelledby="userDropdown" style="min-width: 220px;">
                        <li class="mb-2 px-2"><span class="fw-bold d-block text-primary text-truncate">Hi, ${this.user.first_name}</span></li>
                        <li><hr class="dropdown-divider"></li>
                        ${isAdmin ? '<li><a class="dropdown-item py-2 rounded text-success" href="admin.html"><i class="fas fa-user-shield me-2"></i> Admin Panel</a></li>' : ''}
                        <li><a class="dropdown-item py-2 rounded" href="account.html?tab=profile"><i class="fas fa-user-circle me-2 text-secondary"></i> My Profile</a></li>
                        <li><a class="dropdown-item py-2 rounded" href="account.html?tab=orders"><i class="fas fa-box-open me-2 text-secondary"></i> My Orders</a></li>
                        <li><a class="dropdown-item py-2 rounded" href="order-tracking.html"><i class="fas fa-map-marker-alt me-2 text-secondary"></i> Track Order</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item py-2 rounded text-danger" href="javascript:void(0)" onclick="Auth.logout()"><i class="fas fa-sign-out-alt me-2"></i> Logout</a></li>
                    </ul>
                </div>
            `;
        } else {
            // Reset to Login Trigger
            userIconContainer.innerHTML = `
                <a href="javascript:void(0)" onclick="Auth.openLoginModal()">
                    <i class="fas fa-user fa-2x"></i>
                </a>
            `;
        }
    },

    openLoginModal() {
        const modalEl = document.getElementById('loginModal');
        if (modalEl) {
            const myModal = new bootstrap.Modal(modalEl);
            myModal.show();
        }
    },

    renderLoginModal() {
        if (document.getElementById('loginModal')) return;

        const modalHtml = `
            <div class="modal fade" id="loginModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content rounded-4 border-0" style="padding: 20px;">
                        <div class="modal-header border-0">
                            <h5 class="modal-title fw-bold">Login / Sign Up</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center">
                            <div class="mb-4">
                                <i class="fas fa-user-shield fa-3x text-primary mb-3"></i>
                                <p class="text-muted">Enter your Mobile or Email to continue.</p>
                            </div>
                            <div class="form-floating mb-3">
                                <input type="text" class="form-control rounded-pill px-4" id="loginInput" placeholder="Mobile or Email">
                                <label for="loginInput" class="px-4">Mobile or Email</label>
                            </div>
                            <button class="btn btn-primary w-100 rounded-pill py-3 fw-bold" onclick="Auth.login(document.getElementById('loginInput').value)">
                                Continue
                            </button>
                        </div>
                        <div class="modal-footer border-0 justify-content-center">
                            <small class="text-muted">By continuing, you agree to our Terms.</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', modalHtml);
    }
};
window.Auth = Auth;

document.addEventListener('DOMContentLoaded', () => {
    // Ensure Supabase is ready, retry if not (safety net)
    const checkSupabase = setInterval(() => {
        if (window.supabaseClient) {
            clearInterval(checkSupabase);
            Auth.init();
        } else if (document.readyState === 'complete') {
            // If page fully loaded and still no supabase, try init anyway (might fail gracefully)
            clearInterval(checkSupabase);
            console.error('Nuvora: Supabase client not found after load.');
            Auth.init();
        }
    }, 100);
});

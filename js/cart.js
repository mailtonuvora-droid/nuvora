const Cart = {
    get() {
        return JSON.parse(localStorage.getItem('nuvora_cart')) || [];
    },
    save(cart) {
        localStorage.setItem('nuvora_cart', JSON.stringify(cart));
        this.updateIcon();
    },
    add(product) {
        let cart = this.get();
        let existing = cart.find(item => item.id === product.id);
        if (existing) {
            existing.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        this.save(cart);
        this.openDrawer();
    },
    openDrawer() {
        this.renderDrawer();
        const drawer = document.getElementById('sideCartDrawer');
        const overlay = document.getElementById('cartOverlay');
        if (drawer) drawer.classList.add('open');
        if (overlay) overlay.classList.add('show');
    },
    closeDrawer() {
        const drawer = document.getElementById('sideCartDrawer');
        const overlay = document.getElementById('cartOverlay');
        if (drawer) drawer.classList.remove('open');
        if (overlay) overlay.classList.remove('show');
    },
    remove(id) {
        let cart = this.get().filter(item => item.id !== id);
        this.save(cart);
        this.renderDrawer();
        if (window.renderOrderSummary) window.renderOrderSummary();
    },
    updateQuantity(id, quantity) {
        let cart = this.get();
        let item = cart.find(item => item.id === id);
        if (item) {
            item.quantity = parseInt(quantity);
            if (item.quantity <= 0) return this.remove(id);
        }
        this.save(cart);
        this.renderDrawer();
        if (window.renderOrderSummary) window.renderOrderSummary();
    },
    updateIcon() {
        const count = this.get().reduce((sum, item) => sum + item.quantity, 0);
        const icon = document.querySelector('.fa-shopping-bag + span');
        if (icon) icon.innerText = count;
    },
    getTotal() {
        return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    getTotalSavings() {
        return this.get().reduce((sum, item) => {
            const mrp = item.original_price || item.price;
            return sum + ((mrp - item.price) * item.quantity);
        }, 0);
    },
    renderDrawer() {
        const cart = this.get();
        const container = document.getElementById('cartDrawerItems');
        if (!container) return;

        container.innerHTML = '';
        if (cart.length === 0) {
            container.innerHTML = '<div class="text-center py-5"><i class="fas fa-shopping-basket fa-3x text-muted mb-3"></i><p>Your cart is empty</p></div>';
            document.getElementById('drawerSubtotal').innerText = '₹0';
            document.getElementById('drawerSavings').style.display = 'none';
        } else {
            cart.forEach(item => {
                const mrp = item.original_price ? `<span class="cart-item-mrp">₹${item.original_price}</span>` : '';
                container.innerHTML += `
                    <div class="cart-item">
                        <img src="${item.img}" alt="${item.name}">
                        <div class="cart-item-info">
                            <span class="cart-item-name">${item.name}</span>
                            <span class="cart-item-price">₹${item.price}</span>${mrp}
                            <div class="drawer-qty">
                                <button type="button" onclick="Cart.updateQuantity('${item.id}', ${item.quantity - 1})"><i class="fa fa-minus"></i></button>
                                <span>${item.quantity}</span>
                                <button type="button" onclick="Cart.updateQuantity('${item.id}', ${item.quantity + 1})"><i class="fa fa-plus"></i></button>
                                <span class="cart-item-remove ms-auto" onclick="Cart.remove('${item.id}')"><i class="fa fa-trash"></i></span>
                            </div>
                        </div>
                    </div>
                `;
            });

            const subtotal = this.getTotal();
            const savings = this.getTotalSavings();
            document.getElementById('drawerSubtotal').innerText = `₹${subtotal.toFixed(2)}`;

            const savingsEl = document.getElementById('drawerSavings');
            if (savings > 0) {
                savingsEl.style.display = 'block';
                savingsEl.innerHTML = `💰 Total Savings of ₹${savings.toFixed(2)} From this order`;
            } else {
                savingsEl.style.display = 'none';
            }
        }
    },
    injectDrawer() {
        if (document.getElementById('sideCartDrawer')) return;

        const html = `
            <div id="cartOverlay" class="cart-overlay" onclick="Cart.closeDrawer()"></div>
            <div id="sideCartDrawer" class="cart-drawer">
                <div class="cart-header">
                    <h4 class="mb-0"><i class="fa fa-shopping-bag me-2"></i>View Cart</h4>
                    <button class="btn-close" onclick="Cart.closeDrawer()"></button>
                </div>
                <div id="cartDrawerItems" class="cart-items"></div>
                <div class="cart-footer">
                    <div class="d-flex justify-content-between mb-2">
                        <span>Subtotal</span>
                        <span id="drawerSubtotal" class="fw-bold">₹0</span>
                    </div>
                    <div id="drawerSavings" class="savings-label" style="display:none;"></div>
                    <button class="btn btn-primary w-100 mt-3 py-3 rounded-pill fw-bold" onclick="Cart.proceedToCheckout()">Checkout</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
        this.renderDrawer();
    },
    proceedToCheckout() {
        if (this.get().length === 0) {
            alert('Your cart is empty. Please add some products before checking out!');
            return;
        }
        window.location.href = 'checkout.html';
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    Cart.updateIcon();
    Cart.injectDrawer();
});

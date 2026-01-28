const Wishlist = {
    get() {
        return JSON.parse(localStorage.getItem('nuvora_wishlist')) || [];
    },
    save(wishlist) {
        localStorage.setItem('nuvora_wishlist', JSON.stringify(wishlist));
        this.updateIcon();
    },
    toggle(product) {
        let wishlist = this.get();
        const index = wishlist.findIndex(item => item.id === product.id);

        if (index > -1) {
            wishlist.splice(index, 1);
            this.showToast('Removed from wishlist');
        } else {
            wishlist.push(product);
            this.showToast('Added to wishlist');
        }

        this.save(wishlist);
        this.render();
    },
    remove(id) {
        let wishlist = this.get().filter(item => item.id !== id);
        this.save(wishlist);
        this.render();
    },
    updateIcon() {
        const count = this.get().length;
        const icon = document.querySelector('.fa-heart + span');
        if (icon) icon.innerText = count;
    },
    showToast(msg) {
        // Simple toast or alert
        console.log('Wishlist:', msg);
        // You could add a proper UI toast here
    },
    render() {
        const container = document.getElementById('wishlist-container');
        if (!container) return;

        const wishlist = this.get();
        if (wishlist.length === 0) {
            container.innerHTML = '<div class="col-12 text-center py-5"><h4>Your wishlist is empty.</h4><a href="shop.html" class="btn btn-primary mt-3">Go Shopping</a></div>';
            return;
        }

        container.innerHTML = '';
        wishlist.forEach(p => {
            container.innerHTML += `
                <div class="col-md-6 col-lg-4 col-xl-3">
                    <div class="rounded position-relative fruite-item d-flex flex-column h-100">
                        <div class="fruite-img">
                            <img src="${p.img}" class="img-fluid w-100 rounded-top" alt="${p.name}">
                        </div>
                        <div class="p-4 border border-secondary border-top-0 rounded-bottom text-center d-flex flex-column flex-grow-1">
                            <h4 class="mb-2">${p.name}</h4>
                            <p class="text-dark fs-5 fw-bold mb-3">₹${p.price}</p>
                            <div class="d-flex justify-content-between mt-auto">
                                <button onclick="Cart.add({id: '${p.id}', name: '${p.name}', price: ${p.price}, img: '${p.img}'})" class="btn btn-sm btn-outline-primary rounded-pill px-3">Add to Cart</button>
                                <button onclick="Wishlist.remove('${p.id}')" class="btn btn-sm btn-outline-danger rounded-pill px-3">Remove</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Wishlist.updateIcon();
    if (document.getElementById('wishlist-container')) {
        Wishlist.render();
    }
});

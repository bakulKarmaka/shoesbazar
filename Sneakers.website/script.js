document.addEventListener('DOMContentLoaded', function() {
    // Global cart state
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartIcon = document.querySelector('.cart');
    
    // 1. Initialize cart count display
    function updateCartCount() {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        let cartCount = cartIcon.querySelector('.cart-count');
        
        if (!cartCount) {
            cartCount = document.createElement('span');
            cartCount.className = 'cart-count';
            cartIcon.appendChild(cartCount);
        }
        
        cartCount.textContent = totalItems > 0 ? totalItems : '';
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
    updateCartCount();

    // 2. Product card interactions
    document.querySelectorAll('.card').forEach(card => {
        // Add to cart functionality
        const addButton = card.querySelector('.add-to-cart');
        if (addButton) {
            addButton.addEventListener('click', function(e) {
                e.preventDefault();
                
                const product = {
                    id: card.dataset.id || card.querySelector('img').src.split('/').pop().split('.')[0],
                    name: card.querySelector('.tittle').textContent,
                    price: parseFloat(card.querySelector('.Amount').textContent.replace('$', '')),
                    quantity: 1
                };
                
                // Update or add to cart
                const existingIndex = cart.findIndex(item => item.id === product.id);
                if (existingIndex > -1) {
                    cart[existingIndex].quantity += 1;
                } else {
                    cart.push(product);
                }
                
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartCount();
                
                // Visual feedback
                this.textContent = 'Added!';
                setTimeout(() => this.textContent = 'Add to cart', 1000);
            });
        }
    });

    // 3. Cart page management
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        function renderCart() {
            // Empty state
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <div class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Your cart is empty</p>
                        <a href="shop.html" class="btn">Continue Shopping</a>
                    </div>
                `;
                document.getElementById('cart-total').innerHTML = '';
                return;
            }
            
            // Render cart items
            cartItemsContainer.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <div class="cart-item-image">
                        <img src="img/${item.id}.jpeg" alt="${item.name}" onerror="this.src='img/default-product.jpg'">
                    </div>
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p class="price">$${item.price.toFixed(2)} each</p>
                        <div class="quantity-controls">
                            <button class="quantity-btn minus">-</button>
                            <input type="number" min="1" value="${item.quantity}" class="quantity-input">
                            <button class="quantity-btn plus">+</button>
                        </div>
                        <p class="item-total">$${(item.price * item.quantity).toFixed(2)}</p>
                        <button class="remove-from-cart">Remove</button>
                    </div>
                </div>
            `).join('');
            
            // Update order summary
            const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById('cart-total').innerHTML = `
                <div class="cart-summary">
                    <h3>Order Summary</h3>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>Free</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <button id="proceed-to-checkout" class="btn">Proceed to Checkout</button>
                </div>
            `;
            
            // Attach event listeners
            setupCartInteractions();
        }
        
        function setupCartInteractions() {
            // Quantity buttons
            document.querySelectorAll('.quantity-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const cartItem = this.closest('.cart-item');
                    const productId = cartItem.dataset.id;
                    const input = cartItem.querySelector('.quantity-input');
                    let quantity = parseInt(input.value);
                    const itemIndex = cart.findIndex(item => item.id === productId);
                    
                    if (this.classList.contains('plus')) {
                        quantity += 1;
                    } else {
                        quantity = Math.max(1, quantity - 1);
                    }
                    
                    updateCartItem(productId, quantity, itemIndex, cartItem);
                });
            });
            
            // Quantity input changes
            document.querySelectorAll('.quantity-input').forEach(input => {
                input.addEventListener('change', function() {
                    const cartItem = this.closest('.cart-item');
                    const productId = cartItem.dataset.id;
                    let quantity = parseInt(this.value);
                    const itemIndex = cart.findIndex(item => item.id === productId);
                    
                    quantity = isNaN(quantity) ? 1 : Math.max(1, quantity);
                    this.value = quantity;
                    
                    updateCartItem(productId, quantity, itemIndex, cartItem);
                });
            });
            
            // Remove buttons
            document.querySelectorAll('.remove-from-cart').forEach(button => {
                button.addEventListener('click', function() {
                    const productId = this.closest('.cart-item').dataset.id;
                    cart = cart.filter(item => item.id !== productId);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    renderCart();
                    updateCartCount();
                });
            });
            
            // Checkout button
            document.getElementById('proceed-to-checkout')?.addEventListener('click', function() {
                if (cart.length > 0) {
                    window.location.href = 'checkout.html';
                }
            });
        }
        
        function updateCartItem(productId, quantity, itemIndex, cartItem) {
            cart[itemIndex].quantity = quantity;
            localStorage.setItem('cart', JSON.stringify(cart));
            
            // Update UI
            const itemTotal = cartItem.querySelector('.item-total');
            itemTotal.textContent = `$${(cart[itemIndex].price * quantity).toFixed(2)}`;
            
            updateCartCount();
        }
        
        // Initial render
        renderCart();
    }

    // 4. Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
        
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }

    // 5. Product filtering
    const categoryButtons = document.querySelectorAll('.category button');
    const cards = document.querySelectorAll('.card');
    
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const category = button.textContent.trim().toLowerCase();
                
                let found = false;
                cards.forEach(card => {
                    const matches = card.querySelector('.tittle').textContent.toLowerCase().includes(category);
                    card.style.display = matches ? 'block' : 'none';
                    found = found || matches;
                });
                
                if (!found) alert(`No ${category} products found`);
            });
        });
    }

    // 6. Search functionality
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    if (searchBox && searchButton) {
        const performSearch = () => {
            const query = searchBox.value.trim().toLowerCase();
            if (!query) return;
            
            let found = false;
            cards.forEach(card => {
                const matches = card.querySelector('.tittle').textContent.toLowerCase().includes(query);
                card.style.display = matches ? 'block' : 'none';
                found = found || matches;
            });
            
            if (!found) alert("No matching products found");
        };
        
        searchButton.addEventListener('click', (e) => {
            e.preventDefault();
            performSearch();
        });
        
        searchBox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // 7. FAQ toggle
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            question.classList.toggle('active');
            question.nextElementSibling.classList.toggle('open');
        });
    });

    // 8. Form handling
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = loginForm.querySelector('#email').value;
            const password = loginForm.querySelector('#password').value;
            
            if (email && password) {
                alert('Login successful!');
                window.location.href = 'index.html';
            } else {
                alert('Please fill all fields');
            }
        });
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const password = registerForm.querySelector('#reg-password').value;
            const confirmPassword = registerForm.querySelector('#confirm-password').value;
            
            if (password !== confirmPassword) {
                alert("Passwords don't match");
                return;
            }
            
            alert('Registration successful!');
            window.location.href = 'index.html';
        });
    }

    // 9. Payment method toggle
    const paymentMethods = document.querySelectorAll('input[name="payment"]');
    if (paymentMethods.length > 0) {
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                document.querySelectorAll('.payment-form').forEach(form => {
                    form.classList.remove('active');
                });
                document.getElementById(`${method.id}-form`)?.classList.add('active');
            });
        });
    }
});



document.addEventListener('DOMContentLoaded', function() {
    // Function to set up mobile product display
    function setupMobileProductView() {
        const productContainer = document.querySelector('.card-container');
        if (!productContainer) return;

        // Only apply on mobile screens (less than 768px)
        if (window.innerWidth >= 768) {
            productContainer.classList.remove('mobile-view');
            return;
        }

        productContainer.classList.add('mobile-view');
    }

    // Initialize on load
    setupMobileProductView();

    // Update on window resize
    window.addEventListener('resize', setupMobileProductView);
});

document.addEventListener('DOMContentLoaded', function() {
    // Get all navigation links
    const navLinks = document.querySelectorAll('.navlist .link');
    
    // Set active link based on current page
    function setActiveLink() {
        const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
        
        navLinks.forEach(link => {
            const linkUrl = link.getAttribute('href').split('/').pop();
            link.classList.toggle('link-active', currentUrl === linkUrl);
        });
    }
    
    // Initialize active link
    setActiveLink();
    
    // Handle click events
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Only prevent default if it's not an external link
            if (!this.href.includes('http') && !this.href.includes('mailto')) {
                e.preventDefault();
                
                // Update active class
                navLinks.forEach(l => l.classList.remove('link-active'));
                this.classList.add('link-active');
                
                // Navigate to the page
                window.location.href = this.href;
            }
        });
    });
});
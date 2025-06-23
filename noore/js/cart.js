// Cart functionality

// Initialize cart from localStorage or create empty cart
let cart = JSON.parse(localStorage.getItem('nooreCart')) || [];

// Update cart count in header
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('.cart-count');
    if (cartCountElements.length > 0) {
        cartCountElements.forEach(element => {
            element.textContent = cart.reduce((total, item) => total + item.quantity, 0);
        });
    }
}

// Format price to standard format
function formatPrice(price) {
    // Remove non-numeric characters except decimal point
    let numericPrice = price.toString().replace(/[^\d.]/g, '');
    return parseFloat(numericPrice);
}

// Format currency for display
function formatCurrency(amount) {
    let num = Number(amount);
    if (!isFinite(num)) num = 0;
    return 'PKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Add item to cart
function addToCart(product) {
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => 
        item.name === product.name
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if product exists
        cart[existingItemIndex].quantity += product.quantity || 1;
    } else {
        // Ensure product has quantity property
        if (!product.quantity) product.quantity = 1;
        cart.push(product);
    }
    
    // Save to localStorage
    localStorage.setItem('nooreCart', JSON.stringify(cart));
    updateCartCount();
    
    // Show confirmation message
    const message = document.createElement('div');
    message.className = 'cart-message';
    message.innerHTML = `
        <div class="cart-message-content">
            <i class="fas fa-check-circle"></i>
            <p>${product.name} added to cart!</p>
        </div>
    `;
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        message.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(message);
        }, 300);
    }, 2000);
}

// Remove item from cart
function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('nooreCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Update item quantity
function updateQuantity(index, delta) {
    cart[index].quantity += delta;
    
    if (cart[index].quantity < 1) {
        cart[index].quantity = 1;
    }
    
    localStorage.setItem('nooreCart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Calculate cart total
function calculateTotal() {
    return cart.reduce((total, item) => {
        const price = formatPrice(item.price);
        return total + (price * item.quantity);
    }, 0);
}

// Delivery charge settings
const FIXED_DELIVERY_CHARGE = 150;
const FREE_DELIVERY_THRESHOLD = 1000; // Change this value for free delivery threshold

// Get delivery charge based on cart subtotal and product tags
async function getDeliveryCharge() {
    const subtotal = calculateTotal();

    // If cart is empty, no delivery charge
    if (cart.length === 0) return 0;

    // If all items have 'free' in their tags, delivery is free
    const allFree = cart.every(item => {
        // item.tags could be undefined, so fallback to empty string
        return (item.tags || '').split(' ').includes('free');
    });

    if (allFree) return 0;

    // If subtotal crosses threshold, delivery is free
    if (Math.round(subtotal * 100) / 100 >= FREE_DELIVERY_THRESHOLD) {
        return 0;
    }

    return FIXED_DELIVERY_CHARGE;
}

// Render cart items (async to await delivery charge)
async function renderCart() {
    const cartItemsContainer = document.querySelector('.cart-items');
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-bag"></i>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any jewelry to your cart yet.</p>
                <a href="collection.html" class="btn primary-btn">Shop Now</a>
            </div>`;
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) cartTotal.style.display = 'none';
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) continueShoppingBtn.style.display = 'none';
    } else {
        let cartHTML = '';
        cart.forEach((item, index) => {
            cartHTML += `
                <div class="cart-item">
                    <div class="item-image">
                        <img src="${item.image}" alt="${item.name}">
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">${item.name}</h3>
                        <p class="item-price">${item.price}</p>
                        <div class="item-quantity">
                            <button class="quantity-btn minus" data-index="${index}">-</button>
                            <span class="quantity-input">${item.quantity}</span>
                            <button class="quantity-btn plus" data-index="${index}">+</button>
                        </div>
                    </div>
                    <button class="remove-item" data-index="${index}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        });
        cartItemsContainer.innerHTML = cartHTML;

        const subtotal = calculateTotal();
        const deliveryCharge = await getDeliveryCharge();

        // Update subtotal and total
        const subtotalElem = document.getElementById('cart-subtotal');
        const deliveryElem = document.getElementById('cart-delivery-charge');
        const totalElem = document.getElementById('cart-total');
        if (subtotalElem) subtotalElem.textContent = formatCurrency(subtotal);
        if (deliveryElem) deliveryElem.textContent = formatCurrency(deliveryCharge);
        if (totalElem) totalElem.textContent = formatCurrency(subtotal + deliveryCharge);

        // Show cart total and checkout sections
        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) cartTotal.style.display = 'block';
        const continueShoppingBtn = document.querySelector('.continue-shopping');
        if (continueShoppingBtn) continueShoppingBtn.style.display = 'block';

        // Add event listeners for cart item buttons
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeCartItem(index);
            });
        });
        document.querySelectorAll('.quantity-btn').forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                if (this.classList.contains('minus')) {
                    updateQuantity(index, -1);
                } else {
                    updateQuantity(index, 1);
                }
            });
        });
    }
}

// Move handleAddToCart OUTSIDE DOMContentLoaded
function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    let productName, productPrice, productImage, quantityInput;

    // Handle product detail page
    if (document.querySelector('.product-title')) {
        productName = document.querySelector('.product-title').textContent;
        // Extract only the last PKR price (current price)
        const priceText = document.querySelector('#product-price').textContent;
        const priceMatches = priceText.match(/PKR\s*([\d,]+)/gi);
        if (priceMatches && priceMatches.length > 0) {
            // Get the last match (current price)
            productPrice = priceMatches[priceMatches.length - 1].replace(/PKR|\s|,/gi, '');
        } else {
            // fallback: remove non-numeric chars
            productPrice = priceText.replace(/[^\d.]/g, '');
        }
        productImage = document.querySelector('#main-product-image').src;
        quantityInput = document.querySelector('#product-quantity');
    }
    // Handle product card in collection page
    else {
        const productCard = this.closest('.product-card');
        if (productCard) {
            productName = productCard.querySelector('h3').textContent;
            // Extract only the last PKR price (current price)
            const priceText = productCard.querySelector('.price').textContent;
            // Match the last PKR price in the string
            const priceMatches = priceText.match(/PKR\s*([\d,]+)/gi);
            if (priceMatches && priceMatches.length > 0) {
                // Get the last match (current price)
                productPrice = priceMatches[priceMatches.length - 1].replace(/PKR|\s|,/gi, '');
            } else {
                // fallback: remove non-numeric chars
                productPrice = priceText.replace(/[^\d.]/g, '');
            }
            productImage = productCard.querySelector('img').src;
        }
    }

    // Only proceed if we have the basic product info
    if (productName && productPrice) {
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        // Try to get tags from product card or detail page
        let tags = '';
        // From product detail page
        const metaTags = document.querySelector('.product-meta li strong')?.textContent === 'Tags:'
            ? document.querySelector('.product-meta li strong').parentElement.textContent.replace('Tags:', '').trim()
            : '';
        // From product card
        if (!metaTags && this.closest) {
            const productCard = this.closest('.product-card');
            if (productCard) {
                tags = productCard.dataset.tags || '';
            }
        } else {
            tags = metaTags;
        }

        addToCart({
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: quantity,
            tags: tags
        });
    }
}

const DELIVERY_CHARGE = 250;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();

    // Add to cart buttons on product pages
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.removeEventListener('click', handleAddToCart); // Now this works as intended
        button.addEventListener('click', handleAddToCart);
    });

    // Render cart on cart page
    renderCart();
    
    // WhatsApp checkout
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async function() {
            if (cart.length === 0) return;
            
            let message = "Hello! I would like to place an order for:\n\n";
            
            cart.forEach(item => {
                message += `• ${item.quantity}x ${item.name} - PKR ${item.price}\n`;
            });
            
            const subtotal = calculateTotal();
            const deliveryCharge = await getDeliveryCharge();
            message += `\nSubtotal: ${formatCurrency(subtotal)}`;
            message += `\nDelivery Charges: ${deliveryCharge === 0 ? 'FREE' : 'PKR ' + deliveryCharge}`;
            message += `\nTotal: ${formatCurrency(subtotal + deliveryCharge)}`;
            
            const encodedMessage = encodeURIComponent(message);
            window.open(`https://wa.me/923238971628?text=${encodedMessage}`, '_blank');
        });
    }
    
    // Add cart message styles
    const styleEl = document.createElement('style');
    styleEl.textContent = `
        .cart-message {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
            transform: translateX(150%);
            transition: transform 0.3s ease;
        }
        
        .cart-message.show {
            transform: translateX(0);
        }
        
        .cart-message-content {
            background: #4CAF50;
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .cart-message-content i {
            font-size: 1.5rem;
        }
    `;
    document.head.appendChild(styleEl);
});
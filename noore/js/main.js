// Nooré Jewels - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // ========================
    // INITIALIZATION FUNCTIONS
    // ========================
    
    // Initialize loading animation
    initLoader();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize sticky header
    initStickyHeader();
    
    // Initialize animations
    initAnimations();
    
    // Initialize product filters if on collection page
    if (document.querySelector('.collection-filters')) {
        initProductFilters();
    }
    
    // Initialize quick view modal if on collection page
    if (document.getElementById('quick-view-modal')) {
        initQuickViewModal();
    }
    
    // Initialize product details functionality if on product page
    if (document.querySelector('.product-detail')) {
        initProductDetails();
    }
    
    // Initialize contact form if on contact page
    if (document.getElementById('contact-form')) {
        initContactForm();
    }
    
    // ========================
    // IMPLEMENTATION FUNCTIONS
    // ========================
    
    // Loader Animation
    function initLoader() {
        const loader = document.querySelector('.loader');
        if (!loader) return;
        
        // Check if user has seen loader before
        const hasSeenLoader = localStorage.getItem('hasSeenLoader') === 'true';
        
        if (!hasSeenLoader) {
            // First visit - show loader
            document.body.style.overflow = 'hidden';
            setTimeout(function() {
                loader.classList.add('hidden');
                document.body.style.overflow = 'auto';
                // Mark that user has seen the loader
                localStorage.setItem('hasSeenLoader', 'true');
            }, 1500);
        } else {
            // Return visitor - hide loader immediately
            loader.classList.add('hidden');
            document.body.style.overflow = 'auto';
        }
    }
    
    // Mobile Menu Toggle
    function initMobileMenu() {
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const mobileMenu = document.querySelector('.mobile-menu');
        const mobileMenuClose = document.querySelector('.mobile-menu-close');

        if (!mobileMenuToggle || !mobileMenu) return;

        // Helper to check if mobile menu should be visible
        function isMobile() {
            return window.innerWidth <= 900;
        }

        // Show/hide mobile menu based on screen size
        function handleMenuVisibility() {
            if (isMobile()) {
                mobileMenu.style.display = '';
            } else {
                mobileMenu.style.display = 'none';
                mobileMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('open');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        }

        // Initial check
        handleMenuVisibility();

        // Listen for resize
        window.addEventListener('resize', handleMenuVisibility);

        mobileMenuToggle.addEventListener('click', function () {
            this.classList.toggle('open');
            mobileMenu.classList.toggle('open');
            document.body.classList.toggle('menu-open');
            const expanded = this.classList.contains('open');
            this.setAttribute('aria-expanded', expanded);
        });

        // Close menu when clicking a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('open');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        // Close menu when clicking the close button
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function () {
                mobileMenu.classList.remove('open');
                mobileMenuToggle.classList.remove('open');
                document.body.classList.remove('menu-open');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        }

        // Accessibility
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Toggle navigation menu');
    }
    
    // Sticky Header
    function initStickyHeader() {
        const header = document.querySelector('.site-header');
        if (!header) return;
        
        window.addEventListener('scroll', function() {
            header.classList.toggle('sticky', window.scrollY > 50);
        });
    }
    
    // Fade-in Animation
    function initAnimations() {
        // Create observer for elements
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });
        
        // Observe all elements that need animation
        const animatedElements = [
            '.product-card', '.feature', '.insta-image', '.footer-column',
            '.copyright', '.fade-element', '.about-content', '.about-image',
            '.value-card', '.contact-form-container', '.contact-info-container'
        ].join(',');
        
        document.querySelectorAll(animatedElements).forEach(el => {
            observer.observe(el);
        });
    }
    
    // Product Filters and Sorting (Collection Page)
    function initProductFilters() {
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const productCount = document.getElementById('product-count');
        const noResults = document.getElementById('no-results');
        const resetButton = document.getElementById('reset-filters');
        const products = document.querySelectorAll('.product-card');
        const quickFilters = document.querySelectorAll('.quick-filter');
        const productsGrid = document.querySelector('.products-grid');
        const filtersSection = document.querySelector('.collection-filters');

        if (!categoryFilter || !products.length) return;

        // Sticky filters on scroll
        window.addEventListener('scroll', function() {
            if (!filtersSection) return;
            const stickyClass = 'sticky';
            const offset = filtersSection.offsetTop;
            if (window.scrollY > offset) {
                filtersSection.classList.add(stickyClass);
            } else {
                filtersSection.classList.remove(stickyClass);
            }
        });

        // Helper: Update product count with animation and show/hide no results
        function updateProductCount(count) {
            if (!productCount) return;
            productCount.classList.remove('pulse');
            void productCount.offsetWidth;
            productCount.textContent = count;
            productCount.classList.add('pulse');
            if (count === 0) {
                noResults.classList.add('visible');
                productsGrid.style.display = 'none';
            } else {
                noResults.classList.remove('visible');
                productsGrid.style.display = 'grid';
            }
        }

        // Main filter function
        function filterProducts(filterValue = null) {
            const selectedCategory = filterValue || categoryFilter.value;
            const selectedSort = sortFilter.value;
            let visibleProducts = [];

            // Filter by category or tag
            products.forEach(product => {
                const category = product.dataset.category;
                const tags = (product.dataset.tags || '').split(' ');
                let show = false;
                if (selectedCategory === 'all') show = true;
                else if (category === selectedCategory) show = true;
                else if (selectedCategory === 'new' && tags.includes('new')) show = true;
                else if (selectedCategory === 'bestseller' && tags.includes('bestseller')) show = true;
                else if (selectedCategory === 'sale' && tags.includes('sale')) show = true;
                if (show) {
                    product.classList.remove('hidden');
                    visibleProducts.push(product);
                } else {
                    product.classList.add('hidden');
                }
            });

            // Sort visible products
            switch (selectedSort) {
                case 'price-asc':
                    visibleProducts.sort((a, b) => parseFloat(a.dataset.price) - parseFloat(b.dataset.price));
                    break;
                case 'price-desc':
                    visibleProducts.sort((a, b) => parseFloat(b.dataset.price) - parseFloat(a.dataset.price));
                    break;
                case 'newest':
                    visibleProducts.sort((a, b) => {
                        const aNew = (a.dataset.tags || '').includes('new');
                        const bNew = (b.dataset.tags || '').includes('new');
                        return bNew - aNew;
                    });
                    break;
                default:
                    // Featured: bestsellers first
                    visibleProducts.sort((a, b) => {
                        const aBestseller = (a.dataset.tags || '').includes('bestseller');
                        const bBestseller = (b.dataset.tags || '').includes('bestseller');
                        return bBestseller - aBestseller;
                    });
                    break;
            }

            // Re-append sorted products
            visibleProducts.forEach(product => productsGrid.appendChild(product));

            updateProductCount(visibleProducts.length);

            // Sync dropdown with quick filter if used
            if (filterValue && filterValue !== categoryFilter.value) {
                categoryFilter.value = filterValue;
            }
        }

        // Dropdown filter events
        categoryFilter.addEventListener('change', () => {
            quickFilters.forEach(f => f.classList.remove('active'));
            document.querySelector(`.quick-filter[data-filter="${categoryFilter.value}"]`)?.classList.add('active');
            filterProducts();
        });
        sortFilter.addEventListener('change', () => filterProducts());

        // Quick filter events
        quickFilters.forEach(filter => {
            filter.addEventListener('click', function() {
                quickFilters.forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                filterProducts(this.dataset.filter);
            });
        });

        // Reset filters
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                categoryFilter.value = 'all';
                sortFilter.value = 'default';
                quickFilters.forEach(f => f.classList.remove('active'));
                document.querySelector('.quick-filter[data-filter="all"]')?.classList.add('active');
                filterProducts('all');
            });
        }

        // Initial count and filter
        filterProducts('all');
    }
    
    // Quick View Modal (Collection Page)
    function initQuickViewModal() {
        const modal = document.getElementById('quick-view-modal');
        const closeModal = document.getElementById('close-modal');
        const quickViewButtons = document.querySelectorAll('.quick-view-trigger');
        const modalImage = document.getElementById('modal-image');
        const modalCategory = document.getElementById('modal-category');
        const modalTitle = document.getElementById('modal-title');
        const modalPrice = document.getElementById('modal-price');
        const modalViewDetails = document.getElementById('modal-view-details');
        const modalWhatsapp = document.getElementById('modal-whatsapp');
        
        if (!modal || !quickViewButtons.length) return;
        
        // Open modal when clicking quick view
        quickViewButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const productId = this.closest('.product-card').id;
                const productCard = this.closest('.product-card');
                
                // Get product data directly from the card
                const productImage = productCard.querySelector('img').src;
                const productCategory = productCard.dataset.category;
                const productTitle = productCard.querySelector('h3').textContent;
                const productPrice = productCard.querySelector('.price').textContent;
                const detailsLink = productCard.dataset.detailsLink || '#';
                const whatsappLink = productCard.dataset.whatsappLink || 
                    `https://wa.me/1234567890?text=Hi%20Noor%C3%A9%20Jewels,%20I'm%20interested%20in%20${encodeURIComponent(productTitle)}`;
                
                modalImage.src = productImage;
                modalImage.alt = productTitle;
                modalCategory.textContent = productCategory;
                modalTitle.textContent = productTitle;
                modalPrice.textContent = productPrice;
                modalViewDetails.href = detailsLink;
                modalWhatsapp.href = whatsappLink;
                
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });
        
        // Close modal when clicking X
        if (closeModal) {
            closeModal.addEventListener('click', function() {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            });
        }
        
        // Close modal when clicking outside
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Product Details Page
    function initProductDetails() {
        // Product image gallery
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');
        
        if (thumbnails.length && mainImage) {
            thumbnails.forEach(thumb => {
                thumb.addEventListener('click', function() {
                    // Remove active class from all thumbnails
                    thumbnails.forEach(t => t.classList.remove('active'));
                    
                    // Add active class to clicked thumbnail
                    this.classList.add('active');
                    
                    // Update main image
                    mainImage.style.opacity = '0';
                    setTimeout(() => {
                        mainImage.src = this.dataset.image;
                        mainImage.alt = this.querySelector('img').alt;
                        mainImage.style.opacity = '1';
                    }, 100);
                });
            });
        }
        
        // Quantity selector
        const decreaseBtn = document.querySelector('.decrease-qty');
        const increaseBtn = document.querySelector('.increase-qty');
        const qtyInput = document.querySelector('.qty-input');
        
        if (decreaseBtn && increaseBtn && qtyInput) {
            decreaseBtn.addEventListener('click', function() {
                let value = parseInt(qtyInput.value);
                if (value > 1) {
                    qtyInput.value = value - 1;
                }
            });
            
            increaseBtn.addEventListener('click', function() {
                let value = parseInt(qtyInput.value);
                if (value < 10) {
                    qtyInput.value = value + 1;
                }
            });
        }
        
        // Tab functionality
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        if (tabBtns.length && tabContents.length) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    // Remove active class from all buttons and contents
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(c => c.classList.remove('active'));
                    
                    // Add active class to clicked button and corresponding content
                    this.classList.add('active');
                    document.getElementById(this.dataset.tab).classList.add('active');
                });
            });
        }
    }
    
    // Contact Form Validation
    function initContactForm() {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;
        
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form fields
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Validate fields
            let isValid = true;
            
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            } else {
                clearError(nameInput);
            }
            
            if (!emailInput.value.trim()) {
                showError(emailInput, 'Please enter your email');
                isValid = false;
            } else if (!isValidEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            } else {
                clearError(emailInput);
            }
            
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            } else {
                clearError(messageInput);
            }
            
            // If valid, show success message (in a real app, submit to server)
            if (isValid) {
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'form-success';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <p>Thank you for your message. We'll get back to you soon!</p>
                `;
                
                // Replace form with success message
                contactForm.style.opacity = '0';
                setTimeout(() => {
                    contactForm.parentNode.insertBefore(successMessage, contactForm);
                    contactForm.style.display = 'none';
                }, 300);
                
                // In a real implementation, you'd send the form data to a server here
            }
        });
        
        // Helper functions for form validation
        function showError(input, message) {
            const errorElement = document.getElementById(input.id + '-error');
            if (errorElement) {
                errorElement.textContent = message;
                input.classList.add('error');
            }
        }
        
        function clearError(input) {
            const errorElement = document.getElementById(input.id + '-error');
            if (errorElement) {
                errorElement.textContent = '';
                input.classList.remove('error');
            }
        }
        
        function isValidEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
    }
});


// ...existing code...

// Floating Chat Button & Modal Logic
document.addEventListener('DOMContentLoaded', function() {
    const chatBtn = document.getElementById('floating-chat-btn');
    const chatModal = document.getElementById('chat-modal');
    const chatClose = document.getElementById('chat-close-btn');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatBody = document.getElementById('chat-body');

    if (chatBtn && chatModal) {
        chatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            chatModal.classList.add('active');
            chatInput.focus();
        });
    }
    if (chatClose) {
        chatClose.addEventListener('click', function() {
            chatModal.classList.remove('active');
        });
    }
    // Close chat modal on outside click
    chatModal.addEventListener('click', function(e) {
        if (e.target === chatModal) chatModal.classList.remove('active');
    });

    // Simple chat logic (like help.html)
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const msg = chatInput.value.trim();
            if (!msg) return;
            // Show user message
            const userMsg = document.createElement('div');
            userMsg.className = 'chat-message user';
            userMsg.textContent = msg;
            chatBody.appendChild(userMsg);
            chatBody.scrollTop = chatBody.scrollHeight;
            chatInput.value = '';

            // Simple bot reply logic (customize as needed)
            setTimeout(() => {
                let reply = "Thank you for your message! We'll get back to you soon.";
                if (/order|buy|purchase/i.test(msg)) {
                    reply = "To place an order, please visit our Collection page or use the WhatsApp button for quick assistance.";
                } else if (/return|refund/i.test(msg)) {
                    reply = "For returns or refunds, please see our Help page or contact us on WhatsApp.";
                } else if (/contact|phone|email/i.test(msg)) {
                    reply = "You can contact us at +92 323 8971628 or noorejewelpk@gmail.com.";
                }
                const botMsg = document.createElement('div');
                botMsg.className = 'chat-message bot';
                botMsg.textContent = reply;
                chatBody.appendChild(botMsg);
                chatBody.scrollTop = chatBody.scrollHeight;
            }, 700);
        });
    }
});
// ...existing code...

document.addEventListener('DOMContentLoaded', function() {
    // Floating AI Chat logic (from help.html)
    const chatBtn = document.getElementById('floating-chat-btn');
    const chatModal = document.getElementById('floating-chat-modal');
    const chatClose = document.getElementById('floating-chat-close-btn');
    const chatContainer = document.getElementById('ai-chat-container');
    const userInput = document.getElementById('ai-user-input');
    const sendBtn = document.getElementById('ai-send-btn');
    const quickBtns = document.querySelectorAll('.ai-quick-questions button');
    const emptyMsg = document.getElementById('ai-empty-msg');
    let loading = false;
    let productsCache = null;

    if (!chatBtn || !chatModal) return;

    // Open chat
    chatBtn.addEventListener('click', function(e) {
        e.preventDefault();
        chatModal.classList.add('active');
        userInput.focus();
    });
    // Close chat
    chatClose.addEventListener('click', function() {
        chatModal.classList.remove('active');
    });
    chatModal.addEventListener('click', function(e) {
        if (e.target === chatModal) chatModal.classList.remove('active');
    });

    // --- AI logic from help.html ---
    function formatCurrency(amount) {
        let num = Number(amount);
        if (!isFinite(num)) num = 0;
        return 'PKR ' + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    function getCart() {
        try {
            return JSON.parse(localStorage.getItem('nooreCart')) || [];
        } catch {
            return [];
        }
    }
    function fetchProducts() {
        if (productsCache) return Promise.resolve(productsCache);
        return fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                productsCache = products;
                return products;
            });
    }
    function appendMessage(role, text) {
        if (emptyMsg) emptyMsg.style.display = 'none';
        const msgDiv = document.createElement('div');
        msgDiv.className = 'ai-message ' + (role === 'user' ? 'user' : 'assistant');
        msgDiv.innerHTML = text;
        chatContainer.appendChild(msgDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    function showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-typing';
        typingDiv.id = 'ai-typing';
        typingDiv.innerText = 'AI is typing...';
        chatContainer.appendChild(typingDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }
    function removeTyping() {
        const typingDiv = document.getElementById('ai-typing');
        if (typingDiv) typingDiv.remove();
    }
    function aiResponse(question) {
        question = question.toLowerCase();
        if (question.includes('cart') || question.includes('my order') || question.includes('shopping bag')) {
            const cart = getCart();
            if (!cart.length) {
                return "Your cart is currently empty. Browse our <a href='collection.html'>collection</a> to add beautiful jewelry!";
            }
            let msg = `<strong>Your Cart:</strong><ul style="margin:8px 0 0 18px;">`;
            let total = 0;
            cart.forEach(item => {
                const price = Number(item.price) * (item.quantity || 1);
                total += price;
                msg += `<li>${item.quantity || 1} × ${item.name} <span style="color:#888;">(${formatCurrency(price)})</span></li>`;
            });
            msg += `</ul><div style="margin-top:8px;"><strong>Subtotal:</strong> ${formatCurrency(total)}<br><strong>Shipping:</strong> PKR 250<br><strong>Total:</strong> ${formatCurrency(total + 250)}</div>`;
            msg += `<div style="margin-top:10px;"><a href="cart.html" class="btn outline-btn" style="font-size:0.95rem;">View Cart & Checkout</a></div>`;
            return msg;
        }
        if (question.includes('featured product') || question.includes('show me featured')) {
            return fetchProducts().then(products => {
                const featured = products.filter(p => (p.tags || '').includes('featured'));
                if (!featured.length) return "No featured products found at the moment.";
                let html = `<strong>Featured Products:</strong><ul style="margin:8px 0 0 18px;">`;
                featured.slice(0, 3).forEach(p => {
                    html += `<li>
                        <a href="${p.detailsLink}" target="_blank">${p.title}</a> – <span style="color:#888;">${formatCurrency(p.price)}</span>
                    </li>`;
                });
                html += `</ul><div style="margin-top:8px;"><a href="collection.html" class="btn outline-btn" style="font-size:0.95rem;">See All</a></div>`;
                return html;
            });
        }
        if (question.startsWith('show me ') || question.startsWith('find ') || question.includes('do you have')) {
            return fetchProducts().then(products => {
                let q = question.replace(/(show me|find|do you have|please|can you|tell me about)/gi, '').trim();
                if (!q) return "Please specify the product name or type.";
                const matches = products.filter(p =>
                    p.title.toLowerCase().includes(q) ||
                    (p.category && p.category.toLowerCase().includes(q)) ||
                    (p.tags && p.tags.toLowerCase().includes(q))
                );
                if (!matches.length) return `Sorry, I couldn't find any products matching "<b>${q}</b>".`;
                let html = `<strong>Products matching "${q}":</strong><ul style="margin:8px 0 0 18px;">`;
                matches.slice(0, 5).forEach(p => {
                    html += `<li>
                        <a href="${p.detailsLink}" target="_blank">${p.title}</a> – <span style="color:#888;">${formatCurrency(p.price)}</span>
                    </li>`;
                });
                html += `</ul>`;
                return html;
            });
        }
        const responses = {
            'delivery charges': 'Our delivery charges are <b>PKR 250</b> for Karachi and <b>PKR 300</b> for all other cities in Pakistan.',
            'place an order': 'To place an order, add your favorite jewelry to the cart and proceed to checkout, or order directly via WhatsApp.',
            'return policy': 'We do not offer any return or refund policy. All sales are final.',
            'refund policy': 'We do not offer any return or refund policy. All sales are final.',
            'custom jewelry': 'We do not offer custom jewelry at this time.',
            'contact support': 'You can contact our support via WhatsApp, email, or phone. All details are listed above.'
        };
        for (let key in responses) {
            if (question.includes(key)) return responses[key];
        }
        return "I'm here to help! Ask about our products, your cart, or anything Nooré Jewels.";
    }
    function sendMessage(msg) {
        if (!msg.trim() || loading) return;
        appendMessage('user', msg);
        userInput.value = '';
        loading = true;
        showTyping();
        const response = aiResponse(msg);
        if (typeof response === 'string') {
            setTimeout(() => {
                removeTyping();
                appendMessage('assistant', response);
                loading = false;
            }, 1000);
        } else if (response instanceof Promise) {
            response.then(res => {
                removeTyping();
                appendMessage('assistant', res);
                loading = false;
            });
        }
    }
    sendBtn.onclick = () => sendMessage(userInput.value);
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') sendMessage(userInput.value);
    });
    quickBtns.forEach(btn => {
        btn.onclick = () => sendMessage(btn.innerText);
    });
});

// Quick View Modal (Collection Page)
function initQuickViewModal() {
    // ...existing code for opening modal...

    // Add modal close logic (moved from index.html)
    const quickViewModal = document.getElementById('quick-view-modal');
    const closeModalBtn = document.getElementById('close-modal');
    if (quickViewModal && closeModalBtn) {
        closeModalBtn.onclick = function() {
            quickViewModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        };
        quickViewModal.onclick = function(e) {
            if (e.target === quickViewModal) {
                quickViewModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        };
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && quickViewModal.classList.contains('active')) {
                quickViewModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
}

// Delivery charges display logic
document.addEventListener('DOMContentLoaded', function() {
    const shippingTab = document.getElementById('shipping');
    const deliveryChargeElem = document.getElementById('delivery-charge-value');
    if (shippingTab && deliveryChargeElem) {
        const charge = shippingTab.dataset.deliveryCharge;
        if (charge) deliveryChargeElem.textContent = charge;
    }
});
function renderProducts(products) {
        const grid = document.getElementById('products-grid');
        const count = document.getElementById('product-count');
        grid.innerHTML = '';
        if (Array.isArray(products) && products.length > 0) {
            products.forEach(product => {
                const card = document.createElement('div');
                card.className = `product-card fade-element`;
                card.dataset.category = product.category;
                card.dataset.price = product.price;
                card.dataset.tags = product.tags || '';
                card.dataset.detailsLink = product.detailsLink || '#';
                card.dataset.whatsappLink = product.whatsappLink || '';
                card.dataset.description = product.description || '';
                card.dataset.details = product.details || '';
                card.dataset.shipping = product.shipping || '';
                card.innerHTML = `
    <div class="product-image">
        <img src="${product.image}" alt="${product.title}">
        <div class="product-overlay">
            <div class="product-actions">
                <button class="action-btn quick-view-trigger" title="Quick View"><i class="fas fa-eye"></i></button>
                <button class="action-btn add-to-cart" data-name="${product.title}" data-price="${product.price}" data-image="${product.image}" title="Add to Cart"><i class="fas fa-shopping-bag"></i></button>
            </div>
        </div>
    </div>
    <div class="product-info">
        <div class="product-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)}</div>
        <h3>${product.title}</h3>
        <div class="price">${product.original ? `<span class="original">PKR ${product.original}</span> ` : ''}PKR ${product.price}</div>
        <a href="${product.detailsLink}" class="btn outline-btn">View Details</a>
        <a href="${product.whatsappLink}" class="whatsapp-order" target="_blank"><i class="fab fa-whatsapp"></i> Order via WhatsApp</a>
    </div>
`;
                grid.appendChild(card);
                card.classList.add('fade-in');
            });

            window.allProducts = Array.from(grid.children);
            filterAndSortProducts('all');

            // Attach event listeners to dynamically created buttons
            grid.querySelectorAll('.quick-view-trigger').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const card = this.closest('.product-card');
                    if (!card) return;
                    const modal = document.getElementById('quick-view-modal');
                    if (!modal) return;
                    document.getElementById('modal-image').src = card.querySelector('img').src;
                    document.getElementById('modal-image').alt = card.querySelector('h3').textContent;
                    document.getElementById('modal-category').textContent = card.dataset.category;
                    document.getElementById('modal-title').textContent = card.querySelector('h3').textContent;
document.getElementById('modal-price').innerHTML = card.querySelector('.price').innerHTML;
                    document.getElementById('modal-view-details').href = card.dataset.detailsLink || '#';
                    document.getElementById('modal-whatsapp').href = card.dataset.whatsappLink || '#';

                    // Populate extra fields
                    document.getElementById('modal-description').textContent = card.dataset.description || '';

                    // Details (as list if possible)
                    const detailsSection = document.getElementById('modal-details-section');
                    const detailsList = document.getElementById('modal-details');
                    if (card.dataset.details) {
                        detailsSection.style.display = '';
                        // Try to parse as JSON array, else fallback to split by line or ;
                        let details = [];
                        try {
                            details = JSON.parse(card.dataset.details);
                        } catch {
                            details = card.dataset.details.split(/[\n;]+/).map(s => s.trim()).filter(Boolean);
                        }
                        detailsList.innerHTML = details.map(d => `<li>${d}</li>`).join('');
                    } else {
                        detailsSection.style.display = 'none';
                        detailsList.innerHTML = '';
                    }

                    // Shipping
                    const shippingSection = document.getElementById('modal-shipping-section');
                    const shippingText = document.getElementById('modal-shipping');
                    if (card.dataset.shipping) {
                        shippingSection.style.display = '';
                        shippingText.textContent = card.dataset.shipping;
                    } else {
                        shippingSection.style.display = 'none';
                        shippingText.textContent = '';
                    }

                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                });
            });
            grid.querySelectorAll('.add-to-cart').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Use the global handleAddToCart from cart.js if available
                    if (typeof handleAddToCart === 'function') {
                        handleAddToCart.call(this, e);
                    } else {
                        // Fallback: show alert
                        alert('Added to cart! (Implement cart logic)');
                    }
                });
            });
            grid.querySelectorAll('.whatsapp-order').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.open(this.href, '_blank');
                });
            });

            // Close modal logic
            const modal = document.getElementById('quick-view-modal');
            const closeModal = document.getElementById('close-modal');
            if (modal && closeModal) {
                closeModal.onclick = function() {
                    modal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                };
                modal.onclick = function(e) {
                    if (e.target === modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                };
                document.addEventListener('keydown', function(e) {
                    if (e.key === 'Escape' && modal.classList.contains('active')) {
                        modal.classList.remove('active');
                        document.body.style.overflow = 'auto';
                    }
                });
            }
        } else {
            count.textContent = 0;
            document.getElementById('no-results').style.display = 'block';
        }
    }

    // Filtering and sorting
    function filterAndSortProducts(filterValue = null) {
        const categoryFilter = document.getElementById('category-filter');
        const sortFilter = document.getElementById('sort-filter');
        const productCount = document.getElementById('product-count');
        const noResults = document.getElementById('no-results');
        const productsGrid = document.getElementById('products-grid');
        let products = window.allProducts || [];

        // Determine selected filter: prefer active quick filter, else dropdown
        let activeQuick = document.querySelector('.quick-filter.active');
        let selectedCategory = (filterValue 
            || (activeQuick ? activeQuick.dataset.filter : null)
            || (categoryFilter ? categoryFilter.value : 'all')).toLowerCase();
        let selectedSort = sortFilter ? sortFilter.value : 'default';

        // Filter products
        let visibleProducts = [];
        products.forEach(product => {
            const category = (product.dataset.category || '').toLowerCase();
            const tags = (product.dataset.tags || '').toLowerCase().split(' ');
            let show = false;
            if (selectedCategory === 'all') show = true;
            else if (category === selectedCategory) show = true;
            else if (selectedCategory === 'new' && tags.includes('new')) show = true;
            else if (selectedCategory === 'bestseller' && tags.includes('bestseller')) show = true;
            else if (selectedCategory === 'sale' && tags.includes('sale')) show = true;
            else if (selectedCategory === 'deals' && tags.includes('deals')) show = true; // Added
            if (show) {
                visibleProducts.push(product);
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

        // Clear grid and append only visible products
        productsGrid.innerHTML = '';
        visibleProducts.forEach(product => {
            product.classList.remove('hidden');
            productsGrid.appendChild(product);
        });

        // Animate product count and show/hide no results
        if (productCount) {
            productCount.classList.remove('pulse');
            void productCount.offsetWidth;
            productCount.textContent = visibleProducts.length;
            productCount.classList.add('pulse');
        }
        if (noResults) {
            if (visibleProducts.length === 0) {
                noResults.classList.add('visible');
                productsGrid.style.display = 'none';
            } else {
                noResults.classList.remove('visible');
                productsGrid.style.display = 'grid';
            }
        }
    }

    // Event listeners for filters
    document.addEventListener('DOMContentLoaded', function() {
        fetch('/api/products')
            .then(res => res.json())
            .then(renderProducts);

        // Quick filter click
        document.querySelectorAll('.quick-filter').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.quick-filter').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                // Sync dropdown
                const categoryFilter = document.getElementById('category-filter');
                if (categoryFilter) categoryFilter.value = this.dataset.filter;
                filterAndSortProducts(this.dataset.filter);
            });
        });

        // Dropdown change
        document.getElementById('category-filter').addEventListener('change', function() {
            // Sync quick filters
            document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
            document.querySelector(`.quick-filter[data-filter="${this.value}"]`)?.classList.add('active');
            filterAndSortProducts(this.value);
        });

        // Sort change
        document.getElementById('sort-filter').addEventListener('change', function() {
            filterAndSortProducts();
        });

        // Reset filters button
        const resetButton = document.getElementById('reset-filters');
        if (resetButton) {
            resetButton.addEventListener('click', function() {
                document.getElementById('category-filter').value = 'all';
                document.getElementById('sort-filter').value = 'default';
                document.querySelectorAll('.quick-filter').forEach(f => f.classList.remove('active'));
                document.querySelector('.quick-filter[data-filter="all"]')?.classList.add('active');
                filterAndSortProducts('all');
            });
        }
    });
  // Product Gallery Thumbnail Switcher
      document.addEventListener('DOMContentLoaded', function() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');
        if (thumbnails.length && mainImage) {
          thumbnails.forEach(thumb => {
            thumb.addEventListener('click', function() {
              thumbnails.forEach(t => t.classList.remove('active'));
              this.classList.add('active');
              mainImage.style.opacity = '0';
              setTimeout(() => {
                mainImage.src = this.dataset.image;
                mainImage.alt = this.querySelector('img').alt;
                mainImage.style.opacity = '1';
              }, 100);
            });
          });
        }
        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        tabBtns.forEach(btn => {
          btn.addEventListener('click', function() {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab).classList.add('active');
          });
        });
      });

      // Featured Products Fetch & Render
      document.addEventListener('DOMContentLoaded', function() {
          fetch('/api/products')
              .then(res => res.json())
              .then(function(products) {
                  const grid = document.getElementById('featured-products-grid');
                  if (!grid) return;
                  grid.innerHTML = '';
                  if (Array.isArray(products)) {
                      // Only show products with 'featured' in tags
                      const featured = products.filter(p => (p.tags || '').split(' ').includes('featured'));
                      if (featured.length === 0) {
                          grid.innerHTML = '<p>No featured products found.</p>';
                          return;
                      }
                      featured.forEach(product => {
    const card = document.createElement('div');
    card.className = 'product-card fade-element';
    card.dataset.category = product.category;
    card.dataset.price = product.price;
    card.dataset.tags = product.tags || '';
    // FIX: Use only filename if already in /products/
    let detailsLink = product.detailsLink;
    if (window.location.pathname.includes('/products/')) {
        detailsLink = product.detailsLink.replace(/^products\//, '');
    }
    card.dataset.detailsLink = detailsLink || '';
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
                    <div class="action-btn add-to-cart" data-name="${product.title}" data-price="${product.price}" data-image="${product.image}" title="Add to Cart"><i class="fas fa-shopping-bag"></i></div>
                </div>
            </div>
        </div>
        <div class="product-info">
         <!--   <div class="product-category">${product.category ? product.category.charAt(0).toUpperCase() + product.category.slice(1) : ''}</div> -->
            <h3>${product.title}</h3>
            <div class="price">${product.original ? `<span class="original">PKR ${product.original}</span> ` : ''}PKR ${product.price}</div>
            <a href="${detailsLink}" class="btn outline-btn">View Details</a>
            <a href="${product.whatsappLink}" class="whatsapp-order" target="_blank"><i class="fab fa-whatsapp"></i> Order Now</a>
        </div>
    `;
    grid.appendChild(card);
    setTimeout(() => card.classList.add('fade-in'), 10);

    // WhatsApp order button
    card.querySelector('.whatsapp-order').addEventListener('click', function(e) {
        e.preventDefault();
        window.open(this.href, '_blank');
    });

    // Add to cart button
    card.querySelector('.add-to-cart').addEventListener('click', function(e) {
        e.preventDefault();
        if (typeof handleAddToCart === 'function') {
            this.closest = () => card;
            handleAddToCart.call(this, e);
        } else {
            alert('Added to cart! (Implement cart logic)');
        }
    });

    // Quick View button (modal support)
    card.querySelector('.quick-view-trigger').addEventListener('click', function(e) {
    e.preventDefault();
    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;
    document.getElementById('modal-image').src = card.querySelector('img').src;
    document.getElementById('modal-image').alt = card.querySelector('h3').textContent;
    document.getElementById('modal-category').textContent = card.dataset.category || '';
    document.getElementById('modal-title').textContent = card.querySelector('h3').textContent;
    document.getElementById('modal-price').innerHTML = card.querySelector('.price').innerHTML;
    document.getElementById('modal-view-details').href = card.dataset.detailsLink || '#';
    document.getElementById('modal-whatsapp').href = card.dataset.whatsappLink || '#';

    // Description
    document.getElementById('modal-description').textContent = card.dataset.description || '';

    // Details
    const detailsSection = document.getElementById('modal-details-section');
    const detailsList = document.getElementById('modal-details');
    if (card.dataset.details) {
        detailsSection.style.display = '';
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
                  }
              });
      });
   
    // Remove localStorage logic and fetch delivery charge from API
    document.addEventListener('DOMContentLoaded', function() {
        const productTitle = document.querySelector('.product-title')?.textContent?.trim();
        if (!productTitle) return;

        fetch('/api/products')
            .then(res => res.json())
            .then(products => {
                const product = products.find(p => p.title === productTitle);
                if (product && product.deliveryCharge) {
                    const deliveryElem = document.getElementById('delivery-charge-value');
                    if (deliveryElem) deliveryElem.textContent = product.deliveryCharge;
                }
            });
    });
   

  // Add modal close logic for Quick View Modal
  document.addEventListener('DOMContentLoaded', function() {
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
  });
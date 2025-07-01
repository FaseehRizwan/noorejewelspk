const express = require('express');
const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'noore')));

let productsCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

app.get('/api/products', (req, res) => {
    const now = Date.now();
    if (productsCache && (now - cacheTimestamp < CACHE_DURATION)) {
        return res.json(productsCache);
    }

    const productsDir = path.join(__dirname, 'noore', 'products');
    fs.readdir(productsDir, (err, files) => {
        if (err) {
            console.error('Failed to read products directory:', err);
            return res.status(500).json({ error: 'Failed to read products directory' });
        }

        const productFiles = files.filter(f => f.endsWith('.html'));
        const products = [];

        productFiles.forEach(file => {
            const filePath = path.join(productsDir, file);
            const html = fs.readFileSync(filePath, 'utf8');
            const $ = cheerio.load(html);

            // Extract info
            const title = $('.product-title').first().text().trim() || $('title').text().replace('– Nooré Jewels', '').trim();
            const image = $('.main-image img').attr('src') || $('img').first().attr('src');
            const category = $('.product-category').first().text().trim();
            const priceText = $('.product-price').first().text();
const priceMatches = priceText.match(/PKR\s*([\d,]+)/gi);
let price = '';
if (priceMatches && priceMatches.length > 0) {
    // Get the last PKR price (current price)
    price = priceMatches[priceMatches.length - 1].replace(/PKR|\s|,/gi, '');
} else {
    // fallback: remove non-numeric chars
    price = priceText.replace(/[^\d.]/g, '');
}
            const original = $('.product-price .original').first().text().replace(/[^0-9]/g, '');
            // Extract tags as a string from the product-meta
            const tagsText = $('.product-meta li').filter(function() {
                return $(this).text().toLowerCase().includes('tags:');
            }).text().toLowerCase();
            const tags = tagsText.replace('tags:', '').trim(); // e.g. "new bestseller featured"
            const description = $('#description').text().trim() || $('.product-tabs #description').text().trim();
            // Try to extract details as array or string
            let details = [];
            $('#details li').each((i, el) => {
                details.push($(el).text().trim());
            });
            if (!details.length) {
                details = $('.product-tabs #details li').map((i, el) => $(el).text().trim()).get();
            }
            // Fallback to text if no list
            if (!details.length) {
                details = $('#details').text().trim() || $('.product-tabs #details').text().trim();
            }
            // Extract shipping text
            const shipping = $('#shipping').text().trim() || $('.product-tabs #shipping').text().trim();

            // Extract delivery charge from the #shipping tab (look for PKR <number>)
            let deliveryCharge = null;
            const shippingTab = $('#shipping');
            if (shippingTab.length) {
                const chargeAttr = shippingTab.attr('data-delivery-charge');
                if (chargeAttr) {
                    deliveryCharge = parseInt(chargeAttr, 10);
                } else {
                    // Fallback: try to extract from text
                    const match = shipping.match(/PKR\s*([\d,]+)/i);
                    if (match) {
                        deliveryCharge = parseInt(match[1].replace(/,/g, ''), 10);
                    }
                }
            }

            // Only add if title and image exist
            if (title && image) {
                products.push({
                    title,
                    price,
                    original,
                    image,
                    category,
                    tags,
                    detailsLink: `products/${file}`,
                    whatsappLink: `https://wa.me/923238971628?text=Hi%20I'm%20interested%20in%20${encodeURIComponent(title)}`,
                    description,
                    details: Array.isArray(details) ? JSON.stringify(details) : details,
                    shipping,
                    deliveryCharge // <-- add this line
                });
            } else {
                console.warn(`Skipping ${file} due to missing title or image.`);
            }
        });

        if (products.length === 0) {
            console.warn('No products extracted! Check your HTML structure and selectors.');
        }

        productsCache = products;
        cacheTimestamp = Date.now();
        res.json(products);
    });
});



app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
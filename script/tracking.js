import { getConfirmedOrders } from "./confirmOrders.js";
import { fetchProducts } from '../data/products.js';
import { Cart } from './cart.js';

async function renderTrackingPage() {
    const orderTrackingDiv = document.querySelector('.order-tracking');
    
    // Show loading state
    orderTrackingDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Loading tracking information...</p>';
    
    try {
        // Fetch products data
        await fetchProducts();
        
        // Update cart quantity in header
        const cartQuantityElement = document.querySelector('.cart-quantity');
        if (cartQuantityElement) {
            let totalCartItems = 0;
            Cart.forEach((item) => {
                totalCartItems += item.quantity;
            });
            cartQuantityElement.innerText = totalCartItems;
        }

        // Get order ID and product ID from sessionStorage
        const orderId = sessionStorage.getItem('trackingOrderId');
        const productId = sessionStorage.getItem('trackingProductId');
        
        if (!orderId) {
            orderTrackingDiv.innerHTML = '<p style="text-align: center; padding: 20px;">No order selected for tracking.</p>';
            return;
        }

        const orders = getConfirmedOrders();
        const order = orders.find((o) => o.orderId === orderId);

        if (!order) {
            orderTrackingDiv.innerHTML = '<p style="text-align: center; padding: 20px;">Order not found.</p>';
            return;
        }

        // Get the specific product being tracked
        let productToTrack = order.items[0]; // Default to first product
        
        if (productId) {
            const foundProduct = order.items.find((item) => item.id === productId);
            if (foundProduct) {
                productToTrack = foundProduct;
            }
        }

        // Calculate progress based on delivery date
        let progressPercent = 50; // Default to "Shipped"
        let currentStatus = 'Shipped';

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const deliveryDateStr = order.estimatedDeliveryDate;
        const deliveryDate = parseDeliveryDate(deliveryDateStr);
        
        if (today < deliveryDate) {
            progressPercent = 50;
            currentStatus = 'Shipped';
        } else if (today.getTime() === deliveryDate.getTime()) {
            progressPercent = 75;
            currentStatus = 'Out for Delivery';
        } else {
            progressPercent = 100;
            currentStatus = 'Delivered';
        }

        // Render the tracking page
        const trackingHtml = `
            <a class="back-to-orders-link link-primary" href="orders.html">
                View all orders
            </a>

            <div class="delivery-date">
                Arriving on ${order.estimatedDeliveryDate}
            </div>

            <div class="product-info">
                ${productToTrack.name}
            </div>

            <div class="product-info">
                Quantity: ${productToTrack.quantity}
            </div>

            <img class="product-image" src="${productToTrack.image}">

            <div class="progress-labels-container">
                <div class="progress-label">
                    Preparing
                </div>
                <div class="progress-label ${currentStatus === 'Shipped' || currentStatus === 'Out for Delivery' || currentStatus === 'Delivered' ? 'current-status' : ''}">
                    ${currentStatus === 'Out for Delivery' ? 'Out for Delivery' : 'Shipped'}
                </div>
                <div class="progress-label ${currentStatus === 'Delivered' ? 'current-status' : ''}">
                    Delivered
                </div>
            </div>

            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        `;

        orderTrackingDiv.innerHTML = trackingHtml;
    } catch (error) {
        console.error('Error rendering tracking page:', error);
        orderTrackingDiv.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Error loading tracking information. Please try again.</p>';
    }
}

function parseDeliveryDate(dateString) {
    // Parse dates like "Monday, June 13" to actual Date object
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Extract month and day from the string
    const parts = dateString.split(', ');
    if (parts.length === 2) {
        const monthDay = parts[1].split(' ');
        const month = monthDay[0];
        const day = monthDay[1];
        
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3,
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        
        const monthIndex = months[month];
        if (monthIndex !== undefined) {
            const date = new Date(currentYear, monthIndex, parseInt(day));
            date.setHours(0, 0, 0, 0);
            return date;
        }
    }
    
    return new Date();
}

// Initialize page
(async () => {
    await renderTrackingPage();
})();

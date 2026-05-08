import { getConfirmedOrders } from "./confirmOrders.js";
import { formatMoney } from './utils/money.js';
import { products } from '../data/products.js';
import { fetchProducts } from '../data/products.js';
import { Cart, addToCart } from './cart.js';

async function renderOrdersPage() {
    const ordersGrid = document.querySelector('.orders-grid');
    
    // Show loading state
    ordersGrid.innerHTML = '<p style="text-align: center; padding: 20px;">Loading orders...</p>';
    
    try {
        // Fetch products data
        await fetchProducts();
        
        const orders = getConfirmedOrders();
        
        // Update cart quantity in header
        const cartQuantityElement = document.querySelector('.cart-quantity');
        if (cartQuantityElement) {
            let totalCartItems = 0;
            Cart.forEach((item) => {
                totalCartItems += item.quantity;
            });
            cartQuantityElement.innerText = totalCartItems;
        }
        
        if (orders.length === 0) {
            ordersGrid.innerHTML = '<p style="text-align: center; padding: 20px;">No orders yet.</p>';
            return;
        }

        let ordersHtml = '';
        
        orders.forEach((order) => {
            let itemsHtml = '';
            
            order.items.forEach((item) => {
                itemsHtml += `
                    <div class="product-image-container">
                        <img src="${item.image}">
                    </div>

                    <div class="product-details">
                        <div class="product-name">
                            ${item.name}
                        </div>
                        <div class="product-delivery-date">
                            Arriving on: ${order.estimatedDeliveryDate}
                        </div>
                        <div class="product-quantity">
                            Quantity: ${item.quantity}
                        </div>
                        <button class="buy-again-button button-primary">
                            <img class="buy-again-icon" src="images/icons/buy-again.png">
                            <span class="buy-again-message">Buy it again</span>
                        </button>
                    </div>

                    <div class="product-actions">
                        <a href="tracking.html">
                            <button class="track-package-button button-secondary">
                                Track package
                            </button>
                        </a>
                    </div>
                `;
            });
            
            const totalWithTax = (order.totalAmount + order.shippingCost) + order.tax;
            
            ordersHtml += `
                <div class="order-container">
                    <div class="order-header">
                        <div class="order-header-left-section">
                            <div class="order-date">
                                <div class="order-header-label">Order Placed:</div>
                                <div>${order.orderDate}</div>
                            </div>
                            <div class="order-total">
                                <div class="order-header-label">Total:</div>
                                <div>${formatMoney(totalWithTax * 100)}</div>
                            </div>
                        </div>

                        <div class="order-header-right-section">
                            <div class="order-header-label">Order ID:</div>
                            <div>${order.orderId}</div>
                        </div>
                    </div>

                    <div class="order-details-grid">
                        ${itemsHtml}
                    </div>
                </div>
            `;
        });
        
        // Render all orders at once
        ordersGrid.innerHTML = ordersHtml;

        // Add click handlers for track package buttons
        document.querySelectorAll('.track-package-button').forEach((button, index) => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                // Get the order ID from the order container
                const orderContainer = button.closest('.order-container');
                const orderIdElement = orderContainer.querySelector('.order-header-right-section div:last-child');
                const orderId = orderIdElement.innerText;
                
                // Get the product ID from the product details
                // The button is in .product-actions, so get the previous sibling .product-details
                const productActions = button.closest('.product-actions');
                const productDetails = productActions.previousElementSibling;
                const productName = productDetails.querySelector('.product-name').innerText;
                
                // Find the product in the products array to get its ID
                const product = products.find((p) => p.name === productName);
                const productId = product ? product.id : '';
                
                // Store order ID and product ID in sessionStorage
                sessionStorage.setItem('trackingOrderId', orderId);
                sessionStorage.setItem('trackingProductId', productId);
                
                // Navigate to tracking page
                window.location.href = 'tracking.html';
            });
        });

        // Add click handlers for "Buy it again" buttons
        document.querySelectorAll('.buy-again-button').forEach((button) => {
            button.addEventListener('click', () => {
                // Get the product name from the order container
                const productDetails = button.closest('.product-details');
                const productName = productDetails.querySelector('.product-name').innerText;
                
                // Find the product in the products array
                const product = products.find((p) => p.name === productName);
                
                if (product) {
                    addToCart(product.id, 1);
                    
                    // Show confirmation message
                    const confirmationMsg = document.createElement('div');
                    confirmationMsg.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #4CAF50; color: white; padding: 15px 20px; border-radius: 4px; z-index: 1000;';
                    confirmationMsg.innerText = 'Added to cart!';
                    document.body.appendChild(confirmationMsg);
                    
                    setTimeout(() => {
                        confirmationMsg.remove();
                        // Update cart quantity in header
                        let totalCartItems = 0;
                        Cart.forEach((item) => {
                            totalCartItems += item.quantity;
                        });
                        const cartQuantity = document.querySelector('.cart-quantity');
                        if (cartQuantity) {
                            cartQuantity.innerText = totalCartItems;
                        }
                    }, 2000);
                }
            });
        });
    } catch (error) {
        console.error('Error rendering orders:', error);
        ordersGrid.innerHTML = '<p style="text-align: center; padding: 20px; color: red;">Error loading orders. Please try again.</p>';
    }
}

// Initialize page
(async () => {
    await renderOrdersPage();
})();
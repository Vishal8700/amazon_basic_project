import { Cart as cartItems } from './cart.js';
import { products } from '../data/products.js';
import { formatMoney } from './utils/money.js';
import { fetchProducts } from '../data/products.js';
import { confirmedOrders, saveConfirmedOrdersToStorage } from "./confirmOrders.js";
async function renderCheckoutPage() {
  
let paymentAmount = 0;
let shippingCostPerProduct = {};

function getCartItemSLength(){
    return cartItems.length;
}

function calculatePaymentAmount() {
    cartItems.forEach((cartItem) => {
        const product = products.find((product) => product.id === cartItem.id);
        paymentAmount += (product.priceCents * cartItem.quantity) / 100;
        // Initialize shipping cost for each product as free
        if (!shippingCostPerProduct[cartItem.id]) {
            shippingCostPerProduct[cartItem.id] = 0;
        }
    });
}

function placeOrder(){
    // Create an order object with necessary details
    const orderId = generateOrderId();
    const orderDate = new Date();
    const order = {
        orderId: orderId,
        items: cartItems.map((item) => {
            const product = products.find((p) => p.id === item.id);
            return {
                id: item.id,
                quantity: item.quantity,
                name: product.name,
                image: product.image,
                price: product.priceCents
            };
        }),
        orderDate: orderDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        totalAmount: paymentAmount,
        shippingCost: getTotalShippingCost(),
        tax: (paymentAmount + getTotalShippingCost()) * 0.1,
        estimatedDeliveryDate: getEstimatedDeliveryDate(checkoutDate, 'free')
    };
    saveConfirmedOrdersToStorage(order);
    cartItems.splice(0, cartItems.length); // Clear cart
    localStorage.setItem('cart', JSON.stringify(cartItems));
    alert('Thank you for your order!');
    window.location.href = 'orders.html'; // Redirect to orders page
    
}

function generateOrderId() {
    return 'order-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function getTotalShippingCost() {
    let total = 0;
    Object.values(shippingCostPerProduct).forEach((cost) => {
        total += cost;
    });
    return total;
}

calculatePaymentAmount();
const checkoutDate = new Date();

function getEstimatedDeliveryDate(checkoutDate, shippingOption){
    const day = checkoutDate.getDate();
    const month = checkoutDate.getMonth();
    const days= ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if(shippingOption === 'free'){
        const estimatedDeliveryDate = `${days[(day + 7)%7]}, ${monthNames[month]} ${day + 7}`;
        return estimatedDeliveryDate;
    }
    else if  (shippingOption === 'fast'){
        const estimatedDeliveryDate = `${days[(day + 2)%7]}, ${monthNames[month]} ${day + 2}`;
        return estimatedDeliveryDate;
    } else if (shippingOption === 'faster'){
        const estimatedDeliveryDate = `${days[(day + 1)%7]}, ${monthNames[month]} ${day + 1}`;
        return estimatedDeliveryDate;
    }
}




let addedProduct = ``
let totalShippingCost = getTotalShippingCost();
let orderSummaryHtml = ` <div class="payment-summary">
          <div class="payment-summary-title">
            Order Summary
          </div>

          <div class="payment-summary-row">
            <div>Items (${getCartItemSLength()}):</div>
            <div class="payment-summary-money">${formatMoney(paymentAmount * 100)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div class="payment-summary-money">${formatMoney(totalShippingCost * 100)}</div>
          </div>

          <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">${formatMoney((paymentAmount + totalShippingCost) * 100)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div class="payment-summary-money">${formatMoney((paymentAmount + totalShippingCost) * 0.1 * 100)}</div>
          </div>

          <div class="payment-summary-row total-row">
            <div>Order total:</div>
            <div class="payment-summary-money">${formatMoney((paymentAmount + totalShippingCost + ((paymentAmount + totalShippingCost) * 0.1)) * 100)}</div>
          </div>

          <button class="place-order-button button-primary">
            Place your order
          </button>
        </div> `;


cartItems.forEach((cartItem) => {
    const product = products.find((product) => product.id === cartItem.id);
    addedProduct += `<div class="cart-item-container">
            <div class="delivery-date">
              Delivery date:${getEstimatedDeliveryDate(checkoutDate, 'free')}
            </div>

            <div class="cart-item-details-grid">
              <img class="product-image"
                src="${product.image}">

              <div class="cart-item-details">
                <div class="product-name">
                  ${product.name}
                </div>
                <div class="product-price">
                  ${formatMoney(product.priceCents)}
                </div>
                <div class="product-quantity">
                  <span>
                    Quantity: <span class="quantity-label">${cartItem.quantity}</span>
                  </span>
         
                  <span class="delete-quantity-link link-primary">
                    Delete
                  </span>
                </div>
              </div>

              <div class="delivery-options">
                <div class="delivery-options-title">
                  Choose a delivery option:
                </div>
                <div class="delivery-option">
                  <input type="radio" checked
                    class="delivery-option-input"
                    name="delivery-option-${product.id}"
                    data-shipping-option="free">
                  <div>
                    <div class="delivery-option-date">
                        ${getEstimatedDeliveryDate(checkoutDate, 'free')}
                    </div>
                    <div class="delivery-option-price">
                      FREE Shipping
                    </div>
                  </div>
                </div>
                <div class="delivery-option">
                  <input type="radio"
                    class="delivery-option-input"
                    name="delivery-option-${product.id}"
                    data-shipping-option="fast">
                  <div>
                    <div class="delivery-option-date">
                      ${getEstimatedDeliveryDate(checkoutDate, 'fast')}
                    </div>
                    <div class="delivery-option-price">
                      $4.99 - Shipping
                    </div>
                  </div>
                </div>
                <div class="delivery-option">
                  <input type="radio"
                    class="delivery-option-input"
                    name="delivery-option-${product.id}"
                    data-shipping-option="faster">
                  <div>
                    <div class="delivery-option-date">
                      ${getEstimatedDeliveryDate(checkoutDate, 'faster')}
                    </div>
                    <div class="delivery-option-price">
                      $9.99 - Shipping
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
});

document.querySelector('.order-summary').innerHTML = addedProduct;
document.querySelector('.checkout-header-middle-section').innerHTML = `Checkout (<a class="return-to-home-link"
href="amazon.html">${cartItems.length} items</a>)`;

document.querySelectorAll('.delete-quantity-link').forEach((deleteButton, index) => {
    deleteButton.addEventListener('click', () => {
        cartItems.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cartItems));
        // Remove the cart item from the DOM

        deleteButton.closest('.cart-item-container').remove();

        // Update the payment summary
        updatePaymentSummary();

        document.querySelector('.checkout-header-middle-section').innerHTML = `
        Checkout (<a class="return-to-home-link"href="amazon.html">${getCartItemSLength()} items</a>)`;

    });
});

document.querySelector('.payment-summary').innerHTML = orderSummaryHtml;

document.querySelector('.place-order-button').addEventListener('click', () => {
    placeOrder(); 
});

function updatePaymentSummary() {
    const totalShippingCost = getTotalShippingCost();
    const subtotal = paymentAmount + totalShippingCost;
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const newOrderSummaryHtml = ` <div class="payment-summary">
          <div class="payment-summary-title">
            Order Summary
          </div>

          <div class="payment-summary-row">
            <div>Items (${cartItems.length}):</div>
            <div class="payment-summary-money">${formatMoney(paymentAmount * 100)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Shipping &amp; handling:</div>
            <div class="payment-summary-money">${formatMoney(totalShippingCost * 100)}</div>
          </div>

          <div class="payment-summary-row subtotal-row">
            <div>Total before tax:</div>
            <div class="payment-summary-money">${formatMoney(subtotal * 100)}</div>
          </div>

          <div class="payment-summary-row">
            <div>Estimated tax (10%):</div>
            <div class="payment-summary-money">${formatMoney(tax * 100)}</div>
          </div>

          <div class="payment-summary-row total-row">
            <div>Order total:</div>
            <div class="payment-summary-money">${formatMoney(total * 100)}</div>
          </div>

          <button class="place-order-button button-primary">
            Place your order
          </button>
        </div> `;
    
    document.querySelector('.payment-summary').innerHTML = newOrderSummaryHtml;
    document.querySelector('.place-order-button').addEventListener('click', () => {
        placeOrder(); 
    });
}


document.querySelectorAll('.delivery-option-input').forEach((radioButton) => {
    radioButton.addEventListener('change', () => {
        const shippingOption = radioButton.dataset.shippingOption;
        const cartItemContainer = radioButton.closest('.cart-item-container');
        const deliveryDateElement = cartItemContainer.querySelector('.delivery-date');
        const productId = radioButton.name.replace('delivery-option-', '');
        
        const estimatedDeliveryDate = getEstimatedDeliveryDate(checkoutDate, shippingOption);
        deliveryDateElement.innerText = `Delivery date: ${estimatedDeliveryDate}`;

        // Update shipping cost for this specific product
        if (shippingOption === 'free') {
            shippingCostPerProduct[productId] = 0;
        } else if (shippingOption === 'fast') {
            shippingCostPerProduct[productId] = 4.99;
        } else if (shippingOption === 'faster') {
            shippingCostPerProduct[productId] = 9.99;
        }

        // Re-render the payment summary with updated totals and taxes
        updatePaymentSummary();

    });
});
}

// Initialize the checkout page
await fetchProducts();
await renderCheckoutPage();



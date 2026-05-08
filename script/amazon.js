import { products,fetchProducts } from '../data/products.js';
import { formatMoney } from './utils/money.js';
import { Cart, addToCart} from './cart.js';

function renderProducts() {
  let productHtml = '';
  products.forEach((product) => {
      productHtml += `
      <div class="product-container">
            <div class="product-image-container">
              <img class="product-image"
                src="${product.image}">
            </div>

            <div class="product-name limit-text-to-2-lines">
              ${product.name}
            </div>

            <div class="product-rating-container">
              <img class="product-rating-stars"
                src="images/ratings/rating-${product.rating.stars*10}.png">
              <div class="product-rating-count link-primary">
              ${product.rating.count}
              </div>
            </div>

            <div class="product-price">
              ${formatMoney(product.priceCents)}
            </div>

            <div class="product-quantity-container">
              <select>
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
              </select>
            </div>

            <div class="product-spacer"></div>

            <div class="added-to-cart-icon" style="display: none;">
             
            </div>

            <button class="add-to-cart-button button-primary js-add-to-cart-button" data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>`;
   
  });

  document.querySelector('.products-grid').innerHTML = productHtml;
  document.querySelector('.cart-quantity').innerText = `${Cart.length}`;

  document.querySelectorAll('.js-add-to-cart-button').forEach((button, index) => {
      button.addEventListener('click', () => {

          const productId = button.dataset.productId;
          const selectedQuantity = Number(button.parentElement.querySelector('.product-quantity-container select').value);

          addToCart(productId, selectedQuantity);  // add to cart

          updateCartQuantity(button); // update cart quantity in header
      });
  });
}

function updateCartQuantity(button){
  let totalItemsInCart = 0;
        Cart.forEach((cartItem)=>{
            totalItemsInCart+=cartItem.quantity;
        });

        document.querySelector('.cart-quantity').innerText = totalItemsInCart;

        // show added to cart confirmation
        const addedToCartElement = button.parentElement.querySelector('.added-to-cart-icon');
        addedToCartElement.style.display = 'block';
        addedToCartElement.innerHTML = `<img src="images/icons/checkmark.png">
            Added`;
        
        // Hide after 2 seconds
        setTimeout(() => {
            addedToCartElement.style.display = 'none';
        }, 2000);
}


fetchProducts().then(() => {
  renderProducts();
});
 

// promises 
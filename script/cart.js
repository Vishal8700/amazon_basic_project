let Cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCartToStorage() {
  localStorage.setItem('cart', JSON.stringify(Cart));
}

function addToCart(productId, quantity){
  let matchingCartItem;

        Cart.forEach((cartItem)=>{
            if(cartItem.id === productId){
                matchingCartItem = cartItem;
            }
        })

        if(matchingCartItem){
            matchingCartItem.quantity+=quantity;
        } else {
            Cart.push({
                id: productId,
                quantity: quantity
            });
        }
        
        saveCartToStorage();

}


export { Cart , addToCart};
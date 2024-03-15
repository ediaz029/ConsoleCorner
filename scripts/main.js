let cart = document.querySelector('.cart');
let closeCart = document.querySelector('.close');
let body = document.querySelector('body');

cart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});


closeCart.addEventListener('click', () => {
    body.classList.toggle('showCart');
});


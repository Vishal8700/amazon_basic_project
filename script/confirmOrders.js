

let confirmedOrders = JSON.parse(localStorage.getItem('confirmedOrders')) || [];

function saveConfirmedOrdersToStorage(newOrder) {
    confirmedOrders.push(newOrder);
    localStorage.setItem('confirmedOrders', JSON.stringify(confirmedOrders));
}

function getConfirmedOrders() {
    return JSON.parse(localStorage.getItem('confirmedOrders')) || [];
}

export { confirmedOrders, saveConfirmedOrdersToStorage, getConfirmedOrders }  ;

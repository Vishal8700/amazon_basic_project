const xhr = new XMLHttpRequest();
xhr.addEventListener('load', function() {
    if (xhr.status === 200) {
        console.log('Data fetched successfully:', xhr.response);
          } 
    else {
        console.error('Error fetching data:', xhr.status);
    }
});

xhr.open('GET', 'https://supersimplebackend.dev/products');
xhr.send();
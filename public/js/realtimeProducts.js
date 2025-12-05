const socket = io();

const productListContainer = document.getElementById('productsList');
const addProductForm = document.getElementById('addProductForm');

// Actualizar
function renderProducts(products) {
    productListContainer.innerHTML = '';
    products.forEach(p => {
        const div = document.createElement('div');
        div.className = 'product';
        div.dataset.id = p.id;
        div.innerHTML = `
            <strong>${p.title}</strong>
            <div>${p.description}</div>
            <div>Price: $${p.price} | Stock: ${p.stock}</div>
            <div class="actions"><button class="deleteBtn" data-id="${p.id}">Eliminar</button></div>
        `;
        productListContainer.appendChild(div);
    });
}

// lista actualizada
socket.on('updateProducts', (products) => {
    renderProducts(products);
});

// Error
socket.on('error', (err) => {
    console.error('Socket error', err);
    alert(err.message || 'Ocurrió un error del socket');
});

// Enviar nuevo
addProductForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const product = {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        code: document.getElementById('code').value,
        price: Number(document.getElementById('price').value),
        stock: Number(document.getElementById('stock').value),
        category: document.getElementById('category').value,
        thumbnails: (document.getElementById('thumbnails').value || '').split(',').map(t => t.trim()).filter(Boolean)
    };

    socket.emit('addProduct', product);
    // limpiar
    addProductForm.reset();
});

// eliminar producto
productListContainer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('deleteBtn')) {
        const pid = e.target.dataset.id;
        socket.emit('deleteProduct', pid);
    }
});

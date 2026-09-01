// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDduouixF2IW568mND20cfxmnBNxQfRkrg",
    authDomain: "foodhub-app-6632c.firebaseapp.com",
    databaseURL: "https://foodhub-app-6632c-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "foodhub-app-6632c",
    storageBucket: "foodhub-app-6632c.appspot.com",
    messagingSenderId: "1025149369233",
    appId: "1:1025149369233:web:245f846d959274ee487830"
};

firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let shops = [];
let foods = [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let selectedPaymentMethod = 'cod';
let currentFilter = null;

document.addEventListener('DOMContentLoaded', () => {
    loadShopsFromFirebase();
    loadFoodsFromFirebase();
    renderOrders();
    updateCartCount();
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        if (searchTerm) { filterShops(searchTerm); filterFoods(searchTerm); }
        else { renderShops(); renderFoods(); }
    });
});

function loadShopsFromFirebase() {
    database.ref('shops').on('value', (snapshot) => {
        const data = snapshot.val();
        shops = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
        renderShops();
    });
}

function loadFoodsFromFirebase() {
    database.ref('foods').on('value', (snapshot) => {
        const data = snapshot.val();
        foods = data ? Object.keys(data).map(key => ({...data[key], id: key})) : [];
        renderFoods();
    });
}

function switchTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('shopsTab').classList.add('hidden');
    document.getElementById('foodsTab').classList.add('hidden');
    document.getElementById('ordersTab').classList.add('hidden');
    
    if (tab === 'shops') {
        document.getElementById('shopsTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[0].classList.add('active');
        document.querySelectorAll('.nav-item')[0].classList.add('active');
    } else if (tab === 'foods') {
        document.getElementById('foodsTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[1].classList.add('active');
        document.querySelectorAll('.nav-item')[1].classList.add('active');
        renderFoods();
    } else if (tab === 'orders') {
        document.getElementById('ordersTab').classList.remove('hidden');
        document.querySelectorAll('.tab')[2].classList.add('active');
        document.querySelectorAll('.nav-item')[2].classList.add('active');
        renderOrders();
    }
}

// Check if shop is open
function isShopOpen(shop) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const openTime = shop.openTime || '09:00';
    const closeTime = shop.closeTime || '22:00';
    const [openHours, openMinutes] = openTime.split(':').map(Number);
    const [closeHours, closeMinutes] = closeTime.split(':').map(Number);
    const openMinutesTotal = openHours * 60 + openMinutes;
    const closeMinutesTotal = closeHours * 60 + closeMinutes;
    return currentTime >= openMinutesTotal && currentTime <= closeMinutesTotal;
}

function getShopStatus(shop) {
    if (isShopOpen(shop)) return { status: 'open', text: ' Open', color: '#4CAF50' };
    else return { status: 'closed', text: `🔴 Closed (Opens at ${shop.openTime || '09:00'})`, color: '#f44336' };
}

function renderShops() {
    const shopsList = document.getElementById('shopsList');
    if (!shopsList) return;
    if (shops.length === 0) { shopsList.innerHTML = '<div class="loading"> Shops තවම නැහැ</div>'; return; }
    const sortedShops = [...shops].sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
    shopsList.innerHTML = sortedShops.map(shop => {
        const shopStatus = getShopStatus(shop);
        return `
            <div class="shop-card" onclick="viewShop('${shop.id}')">
                <img src="${shop.image}" class="shop-image" alt="${shop.name}" onerror="this.src='https://via.placeholder.com/500?text=No+Image'">
                <div class="shop-info">
                    <div class="shop-name">${shop.name} ${shop.isFeatured ? '⭐' : ''}</div>
                    <div class="shop-details" style="color: ${shopStatus.color}; font-weight: 600;">
                        <span>${shopStatus.text}</span>
                        <span>⏱️ ${shop.deliveryTime || '30-40 min'}</span>
                    </div>
                    <div class="shop-details"><span>🚚 Delivery: Rs. ${shop.deliveryFee || 150} සිට</span></div>
                    <div class="shop-tags">${(shop.tags || []).map(tag => `<span class="tag" onclick="event.stopPropagation(); filterByTag('${tag}')">${tag}</span>`).join('')}</div>
                </div>
            </div>
        `;
    }).join('');
}

function filterByTag(tag) {
    currentFilter = tag;
    switchTab('foods');
    const filterDiv = document.getElementById('activeFilter');
    const filterText = document.getElementById('filterText');
    if (filterDiv && filterText) {
        filterDiv.style.display = 'flex';
        filterText.textContent = `🏷️ ${tag} වර්ගයේ Foods`;
    }
    renderFoods();
}

function clearFilter() {
    currentFilter = null;
    const filterDiv = document.getElementById('activeFilter');
    if (filterDiv) filterDiv.style.display = 'none';
    renderFoods();
}

function renderFoods() {
    const foodsList = document.getElementById('foodsList');
    if (!foodsList) return;
    let displayFoods = foods;
    if (currentFilter) {
        displayFoods = foods.filter(food => {
            const shop = shops.find(s => s.id === food.shopId);
            const categoryMatch = food.category && food.category.toLowerCase() === currentFilter.toLowerCase();
            const shopTagMatch = shop && shop.tags && shop.tags.some(t => t.toLowerCase() === currentFilter.toLowerCase());
            return categoryMatch || shopTagMatch;
        });
    }
    if (displayFoods.length === 0) { foodsList.innerHTML = '<div class="loading"> Foods තවම නැහැ</div>'; return; }
    foodsList.innerHTML = displayFoods.map(food => {
        const shop = shops.find(s => s.id === food.shopId);
        return `
            <div class="food-card">
                <img src="${food.image}" class="food-image" alt="${food.name}" onerror="this.src='https://via.placeholder.com/500?text=No+Image'">
                <div class="food-info">
                    <div class="food-name">${food.name}</div>
                    <div style="font-size: 11px; color: #666; margin-bottom: 5px;">${shop ? shop.name : ''}</div>
                    <div class="food-price">Rs. ${food.price}</div>
                    <button class="btn btn-primary" onclick="addToCart('${food.id}')">🛒 Add to Cart</button>
                </div>
            </div>
        `;
    }).join('');
}

function viewShop(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    if (!isShopOpen(shop)) {
        const closeTime = shop.closeTime || '22:00';
        if (!confirm(`⚠️ ${shop.name} is currently CLOSED.\nOpens at ${shop.openTime || '09:00'}, Closes at ${closeTime}.\n\nDo you still want to view?`)) return;
    }
    const shopFoods = foods.filter(f => f.shopId === shopId);
    document.getElementById('shopsList').innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 15px; margin-bottom: 20px;">
            <img src="${shop.image}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 10px; margin-bottom: 15px;" onerror="this.src='https://via.placeholder.com/500'">
            <h2>${shop.name}</h2>
            <p style="color: #666; margin-bottom: 15px;">⭐ ${shop.rating || '4.0'} | ⏰ ${shop.openTime || '09:00'} - ${shop.closeTime || '22:00'} |  Rs. ${shop.deliveryFee || 150} සිට</p>
            <div style="display: flex; gap: 10px; margin-bottom: 20px;">
                <button class="btn btn-whatsapp" onclick="orderWhatsApp('${shop.id}')">💬 WhatsApp</button>
                <button class="btn btn-call" onclick="orderCall()">📞 Call</button>
            </div>
            <h3 style="margin-bottom: 15px;">Menu</h3>
            <div class="food-grid">
                ${shopFoods.length > 0 ? shopFoods.map(food => `
                    <div class="food-card">
                        <img src="${food.image}" class="food-image" onerror="this.src='https://via.placeholder.com/500'">
                        <div class="food-info">
                            <div class="food-name">${food.name}</div>
                            <div class="food-price">Rs. ${food.price}</div>
                            <button class="btn btn-primary" onclick="addToCart('${food.id}')"> Add</button>
                        </div>
                    </div>
                `).join('') : '<div class="loading" style="grid-column: 1/-1;">මේ shop එකේ foods තවම නැහැ</div>'}
            </div>
            <button onclick="renderShops()" class="back-btn">⬅️ Back to Shops</button>
        </div>
    `;
    window.scrollTo(0, 0);
}

function addToCart(foodId) {
    const food = foods.find(f => f.id === foodId);
    if (!food) return;
    const shop = shops.find(s => s.id === food.shopId);
    if (shop && !isShopOpen(shop)) {
        alert(`⚠️ ${shop.name} is currently CLOSED.\nOpening Hours: ${shop.openTime || '09:00'} - ${shop.closeTime || '22:00'}\n\nPlease order when they are open.`);
        return;
    }
    const existingItem = cart.find(item => item.id === foodId);
    if (existingItem) existingItem.quantity++;
    else cart.push({ id: food.id, name: food.name, price: food.price, image: food.image, shopId: food.shopId, quantity: 1 });
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    showToast(`✅ ${food.name} cart එකට එකතු වුණා!`);
}

function showToast(message) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) existingToast.remove();
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function orderWhatsApp(shopId) {
    const shop = shops.find(s => s.id === shopId);
    if (!shop) return;
    const cartItems = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const message = `*Order from FoodHub*\n\n*Shop:* ${shop.name}\n*Items:*\n${cartItems}\n\n*Total:* Rs. ${total}`;
    window.open(`https://wa.me/94766488689?text=${encodeURIComponent(message)}`, '_blank');
}

function orderCall() { window.location.href = 'tel:+94766488689'; }

function openCheckout() {
    if (cart.length === 0) { showToast('❌ Cart එක හිස්!'); return; }
    document.getElementById('checkoutModal').style.display = 'block';
    document.getElementById('deliveryZone').value = "150";
    updateCheckoutTotal();
}

function closeCheckout() { document.getElementById('checkoutModal').style.display = 'none'; }

function selectPayment(method) {
    selectedPaymentMethod = method;
    document.getElementById('btn-cod').className = method === 'cod' ? 'pay-btn active' : 'pay-btn';
    document.getElementById('btn-online').className = method === 'online' ? 'pay-btn active' : 'pay-btn';
    document.getElementById('onlinePaymentDetails').style.display = method === 'online' ? 'block' : 'none';
}

function updateCheckoutTotal() {
    const foodTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = parseInt(document.getElementById('deliveryZone').value) || 0;
    const grandTotal = foodTotal + deliveryFee;
    const itemsHtml = cart.map(item => `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${item.name} x${item.quantity}</span><span>Rs. ${item.price * item.quantity}</span></div>`).join('');
    const deliveryHtml = `<div style="display:flex; justify-content:space-between; margin-top:10px; border-top:1px dashed #ccc; padding-top:5px; color:#FF9800;"><span>🚚 Delivery Fee</span><span>Rs. ${deliveryFee}</span></div>`;
    document.getElementById('checkoutItems').innerHTML = itemsHtml + deliveryHtml;
    document.getElementById('checkoutTotal').textContent = `Rs. ${grandTotal}`;
}

function confirmOrder() {
    const address = document.getElementById('deliveryAddress').value.trim();
    if (!address) { showToast('❌ ලිපිනය ඇතුළත් කරන්න!'); return; }
    if (selectedPaymentMethod === 'online' && !document.getElementById('transactionId').value.trim()) { showToast('❌ Transaction ID එක දෙන්න!'); return; }
    const foodTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = parseInt(document.getElementById('deliveryZone').value) || 0;
    const grandTotal = foodTotal + deliveryFee;
    const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join('%0A');
    let paymentInfo = selectedPaymentMethod === 'cod' ? '*Payment:* 💵 Cash on Delivery' : `*Payment:*  Online%0A*Ref:* ${document.getElementById('transactionId').value.trim()}`;
    const order = { items: cart.map(i => i.name).join(', '), foodTotal: foodTotal, deliveryFee: deliveryFee, total: grandTotal, paymentMethod: selectedPaymentMethod, address: address, date: new Date().toISOString(), status: 'Pending' };
    database.ref('orders').push(order).then(() => {
        orders.push({...order, id: Date.now()});
        localStorage.setItem('orders', JSON.stringify(orders));
        const message = `*🆕 New Order - FoodHub*%0A%0A*Items:*%0A${itemsList}%0A%0A*Food Total:* Rs. ${foodTotal}%0A* Delivery Fee:* Rs. ${deliveryFee}%0A*💰 Grand Total:* Rs. ${grandTotal}%0A%0A${paymentInfo}%0A%0A*📍 Address:*%0A${address}`;
        cart = [];
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
        closeCheckout();
        document.getElementById('deliveryAddress').value = '';
        document.getElementById('transactionId').value = '';
        window.open(`https://wa.me/94766488689?text=${message}`, '_blank');
        showToast('✅ Order Confirmed! WhatsApp එකට යවන ලදී.');
        renderOrders();
    }).catch(error => showToast('❌ Error: ' + error.message));
}

function renderOrders() {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;
    let html = '';
    if (cart.length > 0) {
        const foodTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        html += `<div style="background: #FFF0F0; padding: 20px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #FF6B6B;"><h3 style="margin-bottom: 10px;">🛒 Your Cart (${cart.reduce((t,i)=>t+i.quantity,0)} items)</h3>${cart.map(item => `<div style="display:flex; justify-content:space-between; margin-bottom:5px; font-size:14px;"><span>${item.name} x${item.quantity}</span><span>Rs. ${item.price * item.quantity}</span></div>`).join('')}<div style="font-weight:bold; font-size:18px; margin: 15px 0; border-top: 1px dashed #ccc; padding-top: 10px; display:flex; justify-content:space-between;"><span>Food Total:</span><span style="color:#FF6B6B;">Rs. ${foodTotal}</span></div><p style="font-size: 12px; color: #666; margin-bottom: 15px;">* Delivery fee එක checkout එකේදී එකතු වේ.</p><button class="btn btn-primary" onclick="openCheckout()" style="background: #FF6B6B; color: white; width: 100%; padding: 15px; border: none; border-radius: 8px; font-size: 16px; font-weight: bold;">Proceed to Checkout 🛒</button></div>`;
    }
    if (orders.length === 0 && cart.length === 0) html += '<div class="loading">📦 Orders තවම නැහැ</div>';
    else if (orders.length > 0) {
        html += '<h3 style="margin-bottom: 10px;"> Past Orders</h3>';
        html += orders.slice().reverse().map(order => `
            <div style="background: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-weight: bold; margin-bottom: 10px;">Order #${order.id ? order.id.toString().slice(-6) : 'New'}</div>
                <div style="color: #666; font-size: 14px;">
                    <div>Items: ${order.items}</div>
                    <div>Food: Rs. ${order.foodTotal || order.total} | 🚚 Delivery: Rs. ${order.deliveryFee || 0}</div>
                    <div style="font-weight:bold; color:#FF6B6B;">Total: Rs. ${order.total}</div>
                    <div>Payment: ${order.paymentMethod === 'cod' ? '💵 COD' : '🏦 Online'}</div>
                    <div>Status: ${order.status || 'Pending'}</div>
                    <div>Date: ${new Date(order.date).toLocaleString()}</div>
                </div>
            </div>
        `).join('');
    }
    ordersList.innerHTML = html;
}

function filterShops(term) {
    const filtered = shops.filter(shop => shop.name.toLowerCase().includes(term) || (shop.tags && shop.tags.some(t => t.toLowerCase().includes(term))));
    document.getElementById('shopsList').innerHTML = filtered.map(shop => `
        <div class="shop-card" onclick="viewShop('${shop.id}')">
            <img src="${shop.image}" class="shop-image" onerror="this.src='https://via.placeholder.com/500'">
            <div class="shop-info">
                <div class="shop-name">${shop.name}</div>
                <div class="shop-tags">${(shop.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        </div>
    `).join('');
}

function filterFoods(term) {
    const filtered = foods.filter(food => food.name.toLowerCase().includes(term));
    document.getElementById('foodsList').innerHTML = filtered.map(food => `
        <div class="food-card">
            <img src="${food.image}" class="food-image" onerror="this.src='https://via.placeholder.com/500'">
            <div class="food-info">
                <div class="food-name">${food.name}</div>
                <div class="food-price">Rs. ${food.price}</div>
                <button class="btn btn-primary" onclick="addToCart('${food.id}')"> Add</button>
            </div>
        </div>
    `).join('');
}

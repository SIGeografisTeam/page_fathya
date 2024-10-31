import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/api.js';  // Sesuaikan path sesuai dengan lokasi file Anda
import {onClick} from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.0.4/element.js';


onClick('buttonsimpaninfouser',saveUserInfo);

document.addEventListener('DOMContentLoaded', function() {
    checkCookies();
    fetch('./data/menu.json')
        .then(response => response.json())
        .then(data => {
            renderMenu(data);
        })
        .catch(error => console.error('Error loading menu:', error));
});

function checkCookies() {
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    if (!userName || !userWhatsapp || !userAddress) {
        document.getElementById('userModal').style.display = 'flex';
    } else {
        document.getElementById('userModal').style.display = 'none';
    }
}

function saveUserInfo() {
    const name = document.getElementById('name').value;
    const whatsapp = document.getElementById('whatsapp').value;
    const address = document.getElementById('address').value;

    if (name && whatsapp && address) {
        setCookie("name", name, 365);
        setCookie("whatsapp", whatsapp, 365);
        setCookie("address", address, 365);
        document.getElementById('userModal').style.display = 'none';
    } else {
        alert("Silakan masukkan semua informasi.");
    }
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function renderMenu(menuItems) {
    const menuGrid = document.getElementById('menuGrid');
    menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="./menu/${item.image}" alt="${item.name}" class="menu-image">
            <div class="menu-footer">
                <h3>${item.name}</h3>
                <p class="price">Rp ${item.price.toLocaleString()}</p>
                <button id="add-to-cart-${item.id}" class="add-to-cart" onclick="showQuantityControls(${item.id})">Tambah Ke Pesanan</button>
                <div id="quantity-controls-${item.id}" class="quantity-controls hidden">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, -1, ${item.id})">-</button>
                    <input type="number" id="qty${item.id}" name="qty${item.id}" value="0" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, 1, ${item.id})">+</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
}


// Fungsi untuk menampilkan kontrol kuantitas dan menyembunyikan tombol "Tambah Ke Pesanan"
function showQuantityControls(itemId) {
    // Sembunyikan tombol "Tambah Ke Pesanan"
    document.getElementById(`add-to-cart-${itemId}`).classList.add("hidden");
    
    // Tampilkan kontrol kuantitas dan set jumlah awal ke 1
    const quantityControls = document.getElementById(`quantity-controls-${itemId}`);
    // quantityControls.style.visibility = "visible";
    quantityControls.style.display = "flex";
    document.getElementById(`qty${itemId}`).value = 1;

    calculateTotal(); // Update total dengan jumlah awal 1
}

window.showQuantityControls = showQuantityControls; 

// Fungsi untuk mengubah jumlah kuantitas dan menampilkan atau menyembunyikan kontrol kuantitas
window.changeQuantity = function(id, price, delta, itemId) {
    const qtyInput = document.getElementById(id);
    let currentValue = parseInt(qtyInput.value) || 0;
    const newQuantity = currentValue + delta;

    // Update jumlah jika lebih dari 0, atau sembunyikan kontrol jika 0
    if (newQuantity > 0) {
        qtyInput.value = newQuantity;
    } else {
        qtyInput.value = 0;
        // document.getElementById(`quantity-controls-${itemId}`).style.visibility = "hidden";
        document.getElementById(`quantity-controls-${itemId}`).style.display = "none";
        document.getElementById(`add-to-cart-${itemId}`).classList.remove("hidden"); // Tampilkan kembali tombol "Tambah Ke Pesanan"
    }

    calculateTotal(); // Update total setiap kali kuantitas berubah
};

function calculateTotal() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let total = 0;
    let totalItems = 0; // Tambahkan variabel totalItems untuk menghitung jumlah barang
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
  
    inputs.forEach(input => {
        const quantity = parseInt(input.value);
        const price = parseInt(input.getAttribute('data-price'));
        const name = input.getAttribute('data-name');
        
        if (quantity > 0) {
            total += quantity * price;
            totalItems += quantity; // Hitung total barang

            const menuItem = document.createElement('div');
            menuItem.classList.add('order-item');
            
            const menuName = document.createElement('div');
            menuName.classList.add('order-menu');
            menuName.innerText = name;
      
            const menuQuantity = document.createElement('div');
            menuQuantity.classList.add('order-quantity');
            menuQuantity.innerText = `x${quantity}`;
      
            const menuPrice = document.createElement('div');
            menuPrice.classList.add('order-price');
            menuPrice.innerText = `Rp ${(quantity * price).toLocaleString()}`;
      
            menuItem.append(menuName, menuQuantity, menuPrice);
            orderList.appendChild(menuItem);
        }
    });
  
    document.getElementById('totalPrice').innerText = total.toLocaleString();
    document.getElementById('totalItems').innerText = totalItems; // Update total barang di total-summary
    document.querySelector('.total-summary .total-price span').innerText = total.toLocaleString(); // Update total harga di total-summary

  
    // Update WhatsApp link
    const whatsappLink = document.getElementById('whatsappLink');
    const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${rek}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    whatsappLink.href = `https://wa.me/628111269691?text=${encodeURIComponent(message)}`;
}


// Panggil updateTotal setiap kali quantity berubah
document.querySelectorAll('.quantity-controls input').forEach(input => {
    input.addEventListener('change', updateTotal);
});


document.getElementById('whatsappLink').addEventListener('click', function(event) {
    event.preventDefault();

    const paymentMethod = document.getElementById('paymentMethod').value; // Ambil metode pembayaran yang dipilih
    const rek = "Pembayaran akan dilakukan dengan transfer ke rekening\nBCA 2820321726\nKiki Santi Noviana";
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");
    
    const inputs = document.querySelectorAll('input[type="number"]');
    let orders = [];
    let total = 0;

    inputs.forEach(input => {
        const quantity = parseInt(input.value);
        const price = parseInt(input.getAttribute('data-price'));
        const name = input.getAttribute('data-name');

        if (quantity > 0) {
            total += quantity * price;
            orders.push({ name, quantity, price: quantity * price });
        }
    });

    let paymentInfo = paymentMethod === "Transfer" ? rek : "Pembayaran akan dilakukan dengan metode COD.";
    
    const message = `Saya ingin memesan:\n${orders.map(order => `${order.name} x${order.quantity} - Rp ${order.price.toLocaleString()}`).join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${paymentInfo}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    const whatsappUrl = `https://wa.me/628111269691?text=${encodeURIComponent(message)}`;

    // Redirect to WhatsApp
    window.open(whatsappUrl, '_blank');

    // POST request to API
    const postData = {
        orders: orders,
        total: total,
        user: {
            name: userName,
            whatsapp: userWhatsapp,
            address: userAddress
        },
        payment: paymentInfo,
        paymentMethod: paymentMethod // Tambahkan paymentMethod ke postData
    };

    postJSON('https://asia-southeast2-awangga.cloudfunctions.net/jualin/data/order/'+getLastPathSegment(), 'login', '', postData, function(response) {
        console.log('API Response:', response);
    });
});




function getLastPathSegment() {
    // Ambil pathname dari URL
    let pathname = window.location.pathname;

    // Hapus leading slash dan trailing slash jika ada
    pathname = pathname.replace(/^\/|\/$/g, '');

    // Pisahkan pathname menjadi bagian-bagian
    let parts = pathname.split('/');

    // Ambil bagian terakhir dari URL
    return parts[parts.length - 1];
}
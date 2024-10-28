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
            <h3>${item.name}</h3>
            <img src="./menu/${item.image}" alt="${item.name}" class="menu-image">
            <div class="menu-footer">
                <p class="price">Rp ${item.price.toLocaleString()}</p>
                <div class="quantity-controls">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, -1)">-</button>
                    <input type="number" id="qty${item.id}" name="qty${item.id}" value="0" min="0" data-price="${item.price}" data-name="${item.name}" onchange="calculateTotal()">
                    <button type="button" class="qty-btn" onclick="changeQuantity('qty${item.id}', ${item.price}, 1)">+</button>
                </div>
            </div>
        `;
        menuGrid.appendChild(menuItem);
    });
}


//function changeQuantity(id, price, delta) {
window.changeQuantity = function(id, price, delta) {
    var qtyInput = document.getElementById(id);
    var currentValue = parseInt(qtyInput.value);
    if (!isNaN(currentValue)) {
        qtyInput.value = Math.max(0, currentValue + delta); // Tidak boleh kurang dari 0
    } else {
        qtyInput.value = 0;
    }
    calculateTotal(); // Perbarui total setiap kali kuantitas berubah
}

function calculateTotal() {
    const inputs = document.querySelectorAll('input[type="number"]');
    let total = 0;
    let orders = [];
    const rek = "Pembayaran akan dilakukan dengan transfer ke rekening\nBCA 7750878347\nNedi Sopian";
    const userName = getCookie("name");
    const userWhatsapp = getCookie("whatsapp");
    const userAddress = getCookie("address");

    inputs.forEach(input => {
        const quantity = parseInt(input.value);
        const price = parseInt(input.getAttribute('data-price'));
        const name = input.getAttribute('data-name');

        if (quantity > 0) {
            total += quantity * price;
            orders.push(`${name} x${quantity} - Rp ${(quantity * price).toLocaleString()}`);
        }
    });

    document.getElementById('totalPrice').innerText = total.toLocaleString();

    // Update the order list
    const orderList = document.getElementById('orderList');
    orderList.innerHTML = '';
    orders.forEach(order => {
        const li = document.createElement('li');
        li.innerText = order;
        orderList.appendChild(li);
    });

    // Update WhatsApp link
    const whatsappLink = document.getElementById('whatsappLink');
    const message = `Saya ingin memesan:\n${orders.join('\n')}\n\nTotal: Rp ${total.toLocaleString()}\n\n${rek}\n\nNama: ${userName}\nNomor WhatsApp: ${userWhatsapp}\nAlamat: ${userAddress}`;
    whatsappLink.href = `https://wa.me/628111269691?text=${encodeURIComponent(message)}`;
}


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
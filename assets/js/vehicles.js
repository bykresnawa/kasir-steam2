// Inisialisasi data kendaraan default
let vehicleTypes = {
    car: [
        { model: 'Small', description: 'City Car / Hatchback', price: 40000, image: 'images/small-car.jpg' },
        { model: 'Medium', description: 'Sedan / SUV', price: 50000, image: 'images/medium-car.jpg' },
        { model: 'Large', description: 'Van / Large SUV', price: 60000, image: 'images/large-car.jpg' }
    ],
    motorcycle: [
        { model: 'Small', description: 'Matic / Bebek', price: 15000, image: 'images/matic-motorcycle.jpg' },
        { model: 'Large', description: 'Sport / Big Bike', price: 20000, image: 'images/sport-motorcyle.jpg' }
    ]
};

// Fungsi untuk menampilkan kendaraan
function updateVehicleDisplay() {
    const vehicleType = document.getElementById('vehicleType').value;
    const vehicleDisplay = document.getElementById('vehicleDisplay');
    
    if (!vehicleType) {
        vehicleDisplay.innerHTML = '';
        return;
    }

    let html = '<div class="vehicle-grid">';
    vehicleTypes[vehicleType].forEach(vehicle => {
        html += `
            <div class="vehicle-card" onclick="selectVehicle('${vehicleType}', '${JSON.stringify(vehicle).replace(/"/g, '&quot;')}')">
                <img src="${vehicle.image}" alt="${vehicle.model}" onerror="this.src='assets/images/default-vehicle.jpg'">
                <div class="vehicle-info">
                    <h3>${vehicle.model}</h3>
                    <p>${vehicle.description}</p>
                    <p class="price">Rp ${vehicle.price.toLocaleString()}</p>
                </div>
            </div>
        `;
    });
    html += '</div>';
    vehicleDisplay.innerHTML = html;
}

// Fungsi untuk memilih kendaraan
function selectVehicle(type, vehicleData) {
    const vehicle = JSON.parse(vehicleData);
    document.getElementById('vehicleSubType').value = vehicleData;
    
    // Hapus seleksi sebelumnya
    document.querySelectorAll('.vehicle-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Tambah class selected ke card yang dipilih
    event.currentTarget.classList.add('selected');
} 
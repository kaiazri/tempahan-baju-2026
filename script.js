const PRICE_PER_SHIRT = 30.00;

// Fungsi utama untuk mengira jumlah harga
function calculateTotal() {
    const kuantitiPj = parseInt(document.getElementById('kuantiti_pj').value) || 0;
    const kuantitiSukan = parseInt(document.getElementById('kuantiti_sukan').value) || 0;
    
    const totalQuantity = kuantitiPj + kuantitiSukan;
    const totalPrice = totalQuantity * PRICE_PER_SHIRT;

    document.getElementById('total_quantity').textContent = totalQuantity;
    document.getElementById('total_price').textContent = totalPrice.toFixed(2);
    document.getElementById('final_total_price').value = totalPrice.toFixed(2);
}

// Fungsi untuk mengawal paparan medan saiz berdasarkan kuantiti
function toggleSize(type) {
    const kuantiti = document.getElementById(`kuantiti_${type}`).value;
    const sizeSection = document.getElementById(`size_${type}_section`);
    const sizeField = document.getElementById(`saiz_${type}`);

    if (parseInt(kuantiti) > 0) {
        sizeSection.style.display = 'block';
        sizeField.required = true;
    } else {
        sizeSection.style.display = 'none';
        sizeField.required = false;
        sizeField.value = ""; // Tetapkan semula saiz 
    }
    calculateTotal();
}

// Fungsi untuk mengawal paparan bahagian pembayaran resit
function togglePaymentSection() {
    const mode = document.querySelector('input[name="mode_pembayaran"]:checked').value;
    const transferSection = document.getElementById('online_transfer_section');
    const resitInput = document.getElementById('resit_pembayaran');

    if (mode === 'Online Transfer') {
        transferSection.style.display = 'block';
        // Muat naik resit 'required' untuk Online Transfer (tetapi perlu dikendalikan oleh Apps Script)
        // Set required sebagai true di sisi klien untuk mengingatkan pengguna
        resitInput.required = true; 
    } else {
        transferSection.style.display = 'none';
        resitInput.required = false;
        resitInput.value = ""; // Kosongkan input file jika tidak digunakan
    }
}

// Event Listeners yang menjalankan logik apabila borang dimuatkan
document.addEventListener('DOMContentLoaded', () => {
    // 1. Logik Kuantiti/Saiz
    document.getElementById('kuantiti_pj').addEventListener('change', () => toggleSize('pj'));
    document.getElementById('kuantiti_sukan').addEventListener('change', () => toggleSize('sukan'));
    
    // Panggilan awal untuk memastikan keadaan awal borang betul
    toggleSize('pj');
    toggleSize('sukan');
    
    // 2. Logik Pembayaran
    document.querySelectorAll('input[name="mode_pembayaran"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentSection);
    });
    
    // Panggilan awal untuk memastikan bahagian resit tersembunyi
    // Nota: Jika tiada radio button yang dipilih, fungsi ini mungkin akan menghasilkan ralat.
    // Jika tiada radio button dipilih secara default, pastikan ia dikendalikan di CSS/HTML
    // atau gunakan try/catch.
});
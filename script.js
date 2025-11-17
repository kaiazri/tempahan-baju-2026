const PRICE_PER_SHIRT = 30.00;
// *** Sila GANTIKAN URL INI DENGAN WEB APP URL ANDA DARI APPS SCRIPT ***
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw8HFEA5omMDvW-bAqVxHc-o2ULXLLlDAW-nOcWWtqLQ_tXrgh0Rz35hVXuXlGwu3hM6w/exec'; 

// Fungsi untuk mengira jumlah harga
function calculateTotal() {
    const kuantitiPj = parseInt(document.getElementById('kuantiti_pj').value) || 0;
    const kuantitiSukan = parseInt(document.getElementById('kuantiti_sukan').value) || 0;
    
    const totalQuantity = kuantitiPj + kuantitiSukan;
    const totalPrice = totalQuantity * PRICE_PER_SHIRT;

    document.getElementById('total_quantity').textContent = totalQuantity + ' helai';
    document.getElementById('total_price').textContent = totalPrice.toFixed(2);
    document.getElementById('final_total_price').value = totalPrice.toFixed(2);
}

// Fungsi untuk mengawal paparan medan saiz
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
        sizeField.value = ""; 
    }
    calculateTotal();
}

// Fungsi untuk mengawal paparan bahagian pembayaran resit
function togglePaymentSection() {
    const mode = document.querySelector('input[name="mode_pembayaran"]:checked')?.value;
    const transferSection = document.getElementById('online_transfer_section');
    const resitInput = document.getElementById('resit_pembayaran');

    if (mode === 'Online Transfer') {
        transferSection.style.display = 'block';
        // Semak jika fail sudah ada sebelum menetapkan 'required'
        resitInput.required = !resitInput.dataset.fileData; 
    } else {
        transferSection.style.display = 'none';
        resitInput.required = false;
        resitInput.value = "";
        removeFile(); 
    }
}

// Mengendalikan fail yang diupload (menyimpan Base64)
function handleFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
        showMessage("Saiz fail terlalu besar. Sila pilih fail kurang dari 5MB.", "error");
        input.value = "";
        return;
    }

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
        showMessage("Jenis fail tidak disokong. Sila pilih PNG, JPG atau PDF.", "error");
        input.value = "";
        return;
    }

    const uploadArea = document.getElementById('upload-area');
    const filePreview = document.getElementById('file-preview');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');

    uploadArea.style.display = 'none';
    filePreview.classList.remove('hidden');
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    document.getElementById('resit_pembayaran').required = false; // Berjaya upload, tidak lagi required

    const reader = new FileReader();
    reader.onload = function(e) {
        // Simpan data base64 ke dalam dataset input
        input.dataset.fileData = e.target.result;
        input.dataset.fileName = file.name;
        input.dataset.fileType = file.type;
    };
    reader.readAsDataURL(file);
}

// Membuang fail yang diupload
function removeFile() {
    const input = document.getElementById('resit_pembayaran');
    const uploadArea = document.getElementById('upload-area');
    const filePreview = document.getElementById('file-preview');

    input.value = "";
    input.dataset.fileData = "";
    input.dataset.fileName = "";
    input.dataset.fileType = "";
    
    uploadArea.style.display = 'block';
    filePreview.classList.add('hidden');
    
    // Jika Online Transfer dipilih, jadikan required semula
    const mode = document.querySelector('input[name="mode_pembayaran"]:checked')?.value;
    if (mode === 'Online Transfer') {
        input.required = true;
    }
}

// Fungsi utiliti untuk format saiz fail
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Menghantar borang menggunakan Fetch API ke Google Apps Script
async function handleSubmit(e) {
    e.preventDefault();

    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitIcon = document.getElementById('submitIcon');
    
    submitBtn.disabled = true;
    submitText.textContent = 'Menghantar...';
    submitIcon.innerHTML = '<div class="loading"></div>';

    const formData = new FormData(e.target);
    const orderData = {};
    formData.forEach((value, key) => orderData[key] = value);
    
    // Kumpul data file yang disimpan
    const resitInput = document.getElementById('resit_pembayaran');
    orderData.resit_file_data = resitInput.dataset.fileData || '';
    orderData.resit_file_name = resitInput.dataset.fileName || '';
    orderData.resit_file_type = resitInput.dataset.fileType || '';

    const kuantitiPj = parseInt(orderData.kuantiti_pj) || 0;
    const kuantitiSukan = parseInt(orderData.kuantiti_sukan) || 0;
    const totalQuantity = kuantitiPj + kuantitiSukan;

    if (totalQuantity === 0) {
        showMessage("Sila pilih sekurang-kurangnya satu baju untuk ditempah.", "error");
        resetSubmitButton();
        return;
    }
    
    orderData.jumlah_keseluruhan = totalQuantity * PRICE_PER_SHIRT;

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Penting untuk Apps Script
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            // Tukar objek orderData kepada string URL-encoded untuk Apps Script
            body: new URLSearchParams(orderData).toString() 
        });

        // Kerana 'no-cors', kita hanya menganggap hantaran berjaya.
        showMessage("Tempahan berjaya dihantar! Terima kasih.", "success");
        document.getElementById('orderForm').reset();
        removeFile(); 
        toggleSize('pj');
        toggleSize('sukan');
        calculateTotal();

    } catch (error) {
        showMessage(`Ralat menghantar tempahan. Sila cuba lagi.`, "error");
    }

    resetSubmitButton();
}

function resetSubmitButton() {
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitIcon = document.getElementById('submitIcon');
    
    submitBtn.disabled = false;
    submitText.textContent = 'Hantar Tempahan';
    submitIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>';
}

function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 p-4 rounded-lg text-white z-50 max-w-sm ${
        type === 'success' ? 'bg-green-500' : 'bg-red-500'
    } fade-in`; // Tambah fade-in
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 4000);
}

function startNewOrder() {
    // Dipanggil oleh butang 'Tambah Tempahan Baru'
    document.getElementById('orderForm').reset();
    removeFile(); 
    toggleSize('pj');
    toggleSize('sukan');
    calculateTotal();
    
    const transferSection = document.getElementById('online_transfer_section');
    transferSection.style.display = 'none';

    document.querySelector('header').scrollIntoView({ behavior: 'smooth' });
    showMessage("Borang baru telah disediakan untuk tempahan seterusnya!", "success");
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Tetapkan fungsi handleSubmit pada borang
    const form = document.getElementById('orderForm');
    if (form) {
        form.addEventListener('submit', handleSubmit);
    }
    
    // Logik Kuantiti/Saiz
    document.getElementById('kuantiti_pj').addEventListener('change', () => toggleSize('pj'));
    document.getElementById('kuantiti_sukan').addEventListener('change', () => toggleSize('sukan'));
    
    // Logik Pembayaran
    document.querySelectorAll('input[name="mode_pembayaran"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentSection);
    });
    
    // Panggilan awal untuk tetapan borang
    toggleSize('pj');
    toggleSize('sukan');
    calculateTotal();
});

// Anda boleh mengabaikan fungsi SDK di bawah kecuali anda merancang untuk menggunakannya
// (Saya kekalkan kerana ia wujud dalam kod asal anda, tetapi Apps Script lebih diutamakan)
function renderOrdersList(orders) { /* ... */ }
// function onConfigChange(config) { /* ... */ }
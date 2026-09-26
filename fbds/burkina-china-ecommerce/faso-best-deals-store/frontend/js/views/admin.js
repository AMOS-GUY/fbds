import { api } from '../api.js';
import { showToast } from '../components.js';

export function render() {
  const app = document.getElementById('app');
  let mode = 'single';
  
  const renderForm = () => {
    app.innerHTML = `
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
        <div class="flex gap-4 mb-6 border-b pb-3">
          <button id="single" class="px-4 py-2 rounded ${mode==='single'?'bg-primary-100 text-primary-700':'text-gray-500'}">Single Upload</button>
          <button id="csv" class="px-4 py-2 rounded ${mode==='csv'?'bg-primary-100 text-primary-700':'text-gray-500'}">CSV Import</button>
        </div>
        <form id="upload-form" class="space-y-4">
          ${mode === 'single' ? `
            <input name="name" placeholder="Product Name" class="w-full p-3 border rounded-lg" required>
            <textarea name="description" placeholder="Description" class="w-full p-3 border rounded-lg h-24" required></textarea>
            <div class="grid grid-cols-2 gap-4">
              <input name="price" type="number" placeholder="Price (XOF)" class="p-3 border rounded-lg" required>
              <input name="stock" type="number" placeholder="Stock" class="p-3 border rounded-lg" required>
            </div>
            <input name="category" placeholder="Category" class="w-full p-3 border rounded-lg">
            <input name="supplier" placeholder="Supplier/Brand" class="w-full p-3 border rounded-lg">
            <div class="border-2 border-dashed p-6 text-center rounded-lg cursor-pointer hover:bg-gray-50" id="drop-zone">
              📷 Click to add images (max 5)
              <input type="file" multiple accept="image/*" name="images" class="hidden" id="img-input">
              <p id="img-count" class="text-sm text-green-600 mt-2 hidden"></p>
            </div>
          ` : `
            <div class="border-2 border-dashed p-8 text-center rounded-lg cursor-pointer hover:bg-gray-50">
              📄 Drop CSV or click to browse
              <input type="file" accept=".csv" name="csvFile" class="hidden" id="csv-input">
              <p class="text-xs text-gray-400 mt-2">Required: name,description,price,stock,category</p>
            </div>
          `}
          <button type="submit" class="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Upload</button>
        </form>
      </div>
    `;

    document.getElementById('single').onclick = () => { mode = 'single'; renderForm(); };
    document.getElementById('csv').onclick = () => { mode = 'csv'; renderForm(); };
    
    if (mode === 'single') {
      const drop = document.getElementById('drop-zone');
      const input = document.getElementById('img-input');
      drop.onclick = () => input.click();
      input.onchange = (e) => {
        const count = e.target.files.length;
        document.getElementById('img-count').textContent = `${count} image(s) selected`;
        document.getElementById('img-count').classList.remove('hidden');
      };
    } else {
      document.querySelector('.border-dashed').onclick = () => document.getElementById('csv-input').click();
    }

    document.getElementById('upload-form').onsubmit = async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      try {
        await (mode === 'single' ? api.uploadProduct(fd) : api.uploadCsv(fd));
        showToast('Upload successful!');
        e.target.reset();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };
  };

  renderForm();
}
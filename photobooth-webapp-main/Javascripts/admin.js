import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

let currentFilter = 'all';
let photos = [];

async function loadPhotos() {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading photos:', error);
    return;
  }

  photos = data;
  displayPhotos();
}

function displayPhotos() {
  const photoGrid = document.getElementById('photoGrid');
  let filteredPhotos = photos;

  if (currentFilter === 'printed') {
    filteredPhotos = photos.filter(p => p.printed);
  } else if (currentFilter === 'unprinted') {
    filteredPhotos = photos.filter(p => !p.printed);
  }

  if (filteredPhotos.length === 0) {
    photoGrid.innerHTML = `
      <div class="empty-state">
        <h2>No photos found</h2>
        <p>Photos will appear here once uploaded from the photobooth.</p>
      </div>
    `;
    return;
  }

  photoGrid.innerHTML = filteredPhotos.map(photo => `
    <div class="photo-card" data-id="${photo.id}">
      <img src="${photo.image_data}" alt="Photo">
      <div class="photo-info">
        <span class="photo-date">${new Date(photo.created_at).toLocaleString()}</span>
        <span class="status-badge ${photo.printed ? 'printed' : 'unprinted'}">
          ${photo.printed ? 'Printed' : 'Not Printed'}
        </span>
      </div>
      <div class="photo-actions">
        <button class="action-btn print-btn" onclick="printPhoto('${photo.id}')" ${photo.printed ? 'disabled' : ''}>
          ${photo.printed ? 'Already Printed' : 'Print'}
        </button>
        <button class="action-btn delete-btn" onclick="deletePhoto('${photo.id}')">Delete</button>
      </div>
    </div>
  `).join('');
}

window.printPhoto = async function(photoId) {
  const photo = photos.find(p => p.id === photoId);
  if (!photo) return;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <html>
      <head>
        <title>Print Photo</title>
        <style>
          body { margin: 0; padding: 0; }
          img { width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <img src="${photo.image_data}" class="print-image" onload="window.print(); window.close();">
      </body>
    </html>
  `);
  printWindow.document.close();

  const { error } = await supabase
    .from('photos')
    .update({ printed: true })
    .eq('id', photoId);

  if (error) {
    console.error('Error updating print status:', error);
    return;
  }

  await loadPhotos();
};

window.deletePhoto = async function(photoId) {
  if (!confirm('Are you sure you want to delete this photo?')) return;

  const { error } = await supabase
    .from('photos')
    .delete()
    .eq('id', photoId);

  if (error) {
    console.error('Error deleting photo:', error);
    return;
  }

  await loadPhotos();
};

document.getElementById('filterAll').addEventListener('click', () => {
  currentFilter = 'all';
  updateFilterButtons();
  displayPhotos();
});

document.getElementById('filterUnprinted').addEventListener('click', () => {
  currentFilter = 'unprinted';
  updateFilterButtons();
  displayPhotos();
});

document.getElementById('filterPrinted').addEventListener('click', () => {
  currentFilter = 'printed';
  updateFilterButtons();
  displayPhotos();
});

function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  if (currentFilter === 'all') {
    document.getElementById('filterAll').classList.add('active');
  } else if (currentFilter === 'unprinted') {
    document.getElementById('filterUnprinted').classList.add('active');
  } else if (currentFilter === 'printed') {
    document.getElementById('filterPrinted').classList.add('active');
  }
}

document.querySelector('.logo').addEventListener('click', () => {
  window.location.href = 'index.html';
});

loadPhotos();

setInterval(loadPhotos, 5000);

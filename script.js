/* ==========================================
   COUPLE MOMENTS — script.js
   Full app logic: Timeline, Date Ideas, Countdown
   ========================================== */

'use strict';

// ==========================================
// APP STATE & STORAGE HELPERS
// ==========================================

const STORAGE_KEYS = {
  memories:     'cm_memories',
  favorites:    'cm_favorites',
  countdowns:   'cm_countdowns',
  letters:      'cm_letters',
  darkMode:     'cm_dark',
  customIdeas:  'cm_custom_ideas',
  checkedIdeas:  'cm_checked_ideas',
  removedIdeas:  'cm_removed_ideas',
};

const load = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

let memories   = load(STORAGE_KEYS.memories);
let favorites  = load(STORAGE_KEYS.favorites);
let countdowns = load(STORAGE_KEYS.countdowns);
let letters    = load(STORAGE_KEYS.letters);
let customIdeas  = load(STORAGE_KEYS.customIdeas);
let checkedIdeas  = load(STORAGE_KEYS.checkedIdeas).map(id => typeof id === 'string' && !isNaN(id) ? Number(id) : id);
let removedIdeas  = load(STORAGE_KEYS.removedIdeas).map(id => typeof id === 'string' && !isNaN(id) ? Number(id) : id);

let selectedEmoji    = '💚';
let deleteTarget     = null; // { type, id }
let countdownTimers  = {};   // intervalId per countdown id

// ==========================================
// DATE IDEAS DATA
// ==========================================

const DATE_IDEAS = [
  // Indoor
  { id: 1, title: 'Movie Marathon Night',       cat: 'indoor',      emoji: '🎬', desc: 'Pick a film series or director and binge together with homemade popcorn and cozy blankets.' },
  { id: 2, title: 'Cook a New Recipe Together', cat: 'indoor',      emoji: '🍳', desc: 'Choose a cuisine neither of you has tried. Mess up the kitchen and make memories.' },
  { id: 3, title: 'Game Night In',              cat: 'indoor',      emoji: '🎲', desc: 'Board games, card games, or video games — friendly competition makes everything more fun.' },
  { id: 4, title: 'Paint & Sip at Home',        cat: 'indoor',      emoji: '🎨', desc: 'Set up canvases, pour your drinks, and paint each other\'s portraits. Laughing guaranteed.' },
  { id: 5, title: 'Indoor Picnic',              cat: 'indoor',      emoji: '🧺', desc: 'Lay a blanket on the living room floor, pack a little basket, and pretend you\'re in the park.' },
  { id: 6, title: 'Spa Night for Two',          cat: 'indoor',      emoji: '🛁', desc: 'Face masks, foot soaks, and relaxing music. Take turns pampering each other.' },
  { id: 7, title: 'Stargazing with an App',     cat: 'indoor',      emoji: '🔭', desc: 'Use a star map app and lie on your back on the balcony or roof to learn constellations.' },
  { id: 8, title: 'Create a Scrapbook',         cat: 'indoor',      emoji: '📷', desc: 'Print your favorite photos together and build a memory book of your relationship so far.' },

  // Outdoor
  { id: 9,  title: 'Sunrise Hike',              cat: 'outdoor',     emoji: '🌄', desc: 'Wake up before dawn, climb to a viewpoint, and watch the world light up together.' },
  { id: 10, title: 'Picnic in the Park',        cat: 'outdoor',     emoji: '🌳', desc: 'Pack sandwiches, fruits, and a good book. Find a shady spot and spend the afternoon together.' },
  { id: 11, title: 'Botanical Garden Walk',     cat: 'outdoor',     emoji: '🌸', desc: 'Explore a nearby garden, take photos of flowers, and identify plants you\'ve never noticed before.' },
  { id: 12, title: 'Beach Sunset Trip',         cat: 'outdoor',     emoji: '🌅', desc: 'Drive to the nearest shore, walk barefoot in the sand, and catch golden hour together.' },
  { id: 13, title: 'Farmers Market Morning',    cat: 'outdoor',     emoji: '🥦', desc: 'Go early, sample local produce, grab fresh flowers, and cook something special with what you find.' },
  { id: 14, title: 'Outdoor Movie Night',       cat: 'outdoor',     emoji: '🎥', desc: 'Find a drive-in or outdoor screening. Bring layers and snacks for the perfect night out.' },

  // Low Budget
  { id: 15, title: 'Free Museum Day',           cat: 'budget',      emoji: '🏛️', desc: 'Many museums have free days. Pick one neither of you has visited and spend hours exploring.' },
  { id: 16, title: '100-Peso Date Challenge',   cat: 'budget',      emoji: '💰', desc: 'Set a budget limit and challenge each other to plan the most creative date possible.' },
  { id: 17, title: 'Library Date',              cat: 'budget',      emoji: '📚', desc: 'Spend an afternoon choosing books for each other, reading quietly side by side. Free and lovely.' },
  { id: 18, title: 'Street Food Tour',          cat: 'budget',      emoji: '🍢', desc: 'Walk your neighborhood and try every street food stall you find. Vote on your favorites.' },
  { id: 19, title: 'DIY Spa at Home',           cat: 'budget',      emoji: '🌿', desc: 'Make natural face masks from kitchen ingredients, light candles, and relax completely — for free.' },
  { id: 20, title: 'Volunteer Together',        cat: 'budget',      emoji: '💚', desc: 'Help at a local shelter or community garden. Giving together brings you closer.' },

  // Adventurous
  { id: 21, title: 'Night Kayaking',            cat: 'adventurous', emoji: '🚣', desc: 'Paddle under the stars on a calm lake or bay. Many tour companies offer guided night trips.' },
  { id: 22, title: 'Try Rock Climbing',         cat: 'adventurous', emoji: '🧗', desc: 'Book a session at an indoor climbing wall or find an outdoor beginner route. Trust each other.' },
  { id: 23, title: 'Overnight Camping Trip',    cat: 'adventurous', emoji: '⛺', desc: 'Pack a tent, sleep under the stars, make a fire, and wake up somewhere beautiful together.' },
  { id: 24, title: 'Scuba or Snorkel Lesson',  cat: 'adventurous', emoji: '🤿', desc: 'Discover the underwater world together. A shared first time you\'ll never forget.' },
  { id: 25, title: 'Off-Road Cycling Trail',   cat: 'adventurous', emoji: '🚴', desc: 'Rent mountain bikes and tackle a trail. Muddy, sweaty, and absolutely worth it.' },
  { id: 26, title: 'Paragliding for Two',       cat: 'adventurous', emoji: '🪂', desc: 'Book a tandem paragliding session. The views from above will take your breath away.' },
];

// ==========================================
// NAVIGATION
// ==========================================

const sections = {
  home:      document.getElementById('section-home'),
  timeline:  document.getElementById('section-timeline'),
  dateideas: document.getElementById('section-dateideas'),
  countdown: document.getElementById('section-countdown'),
  letters:   document.getElementById('section-letters'),
};

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = link.dataset.section;
    switchSection(target);
    closeMenu();
  });
});

function switchSection(name) {
  // Update nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.section === name);
  });
  // Show/hide sections
  Object.entries(sections).forEach(([key, el]) => {
    if (key === name) {
      el.classList.remove('hidden');
      el.classList.add('active');
      el.style.animation = 'none';
      el.offsetHeight;
      el.style.animation = '';
    } else {
      el.classList.add('hidden');
      el.classList.remove('active');
    }
  });
  // Refresh home data whenever we navigate to it
  if (name === 'home') renderHome();
}

// Hamburger menu
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

function closeMenu() {
  navLinks.classList.remove('open');
}

// ==========================================
// DARK MODE
// ==========================================

const darkToggle = document.getElementById('darkToggle');
const isDark = localStorage.getItem(STORAGE_KEYS.darkMode) === 'true';
if (isDark) enableDark();

darkToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const nowDark = document.body.classList.contains('dark');
  localStorage.setItem(STORAGE_KEYS.darkMode, nowDark);
  darkToggle.innerHTML = nowDark
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
});

function enableDark() {
  document.body.classList.add('dark');
  darkToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

// ==========================================
// TOAST NOTIFICATION
// ==========================================

let toastTimer;
function showToast(msg, duration = 2800) {
  const toast = document.getElementById('toast');
  document.getElementById('toastMsg').textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

// ==========================================
// CONFIRM MODAL
// ==========================================

const modalOverlay = document.getElementById('modalOverlay');
const modalConfirm = document.getElementById('modalConfirm');
const modalCancel  = document.getElementById('modalCancel');

function openModal(message, onConfirm) {
  document.getElementById('modalBody').textContent = message;
  modalOverlay.classList.remove('hidden');
  modalConfirm.onclick = () => {
    onConfirm();
    closeModal();
  };
}
function closeModal() {
  modalOverlay.classList.add('hidden');
}
modalCancel.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});

// ==========================================
// SECTION 1: MEMORY TIMELINE
// ==========================================

const memoryForm      = document.getElementById('memoryForm');
const memDateInput    = document.getElementById('memDate');
const memTitleInput   = document.getElementById('memTitle');
const memDescInput    = document.getElementById('memDesc');
const memImageInput   = document.getElementById('memImage');
const memEditIdInput  = document.getElementById('memEditId');
const memSubmitBtn    = document.getElementById('memSubmitBtn');
const memCancelBtn    = document.getElementById('memCancelBtn');
const uploadArea      = document.getElementById('uploadArea');
const uploadPlaceholder = document.getElementById('uploadPlaceholder');
const imagePreview    = document.getElementById('imagePreview');
const timelineEl      = document.getElementById('timeline');
const timelineEmpty   = document.getElementById('timelineEmpty');

let currentImageData = null; // base64 string

// Upload area click
uploadArea.addEventListener('click', () => memImageInput.click());

// File input change
memImageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    showToast('Please upload an image file.');
    return;
  }
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentImageData = ev.target.result;
    imagePreview.src = currentImageData;
    imagePreview.classList.remove('hidden');
    uploadPlaceholder.style.display = 'none';
  };
  reader.readAsDataURL(file);
});

// Form submit
memoryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateMemoryForm()) return;

  const editId = memEditIdInput.value;
  const memory = {
    id:    editId || Date.now().toString(),
    date:  memDateInput.value,
    title: memTitleInput.value.trim(),
    desc:  memDescInput.value.trim(),
    image: currentImageData,
    createdAt: editId ? (memories.find(m => m.id === editId)?.createdAt || Date.now()) : Date.now(),
  };

  if (editId) {
    const idx = memories.findIndex(m => m.id === editId);
    if (idx !== -1) memories[idx] = memory;
    showToast('Memory updated! 💚');
  } else {
    memories.push(memory);
    showToast('Memory saved! 🌿');
  }

  save(STORAGE_KEYS.memories, memories);
  resetMemoryForm();
  renderTimeline();
});

// Cancel edit
memCancelBtn.addEventListener('click', () => {
  resetMemoryForm();
});

function validateMemoryForm() {
  let valid = true;
  const errDate  = document.getElementById('err-date');
  const errTitle = document.getElementById('err-title');

  errDate.textContent  = '';
  errTitle.textContent = '';

  if (!memDateInput.value) {
    errDate.textContent = 'Please pick a date.';
    valid = false;
  }
  if (!memTitleInput.value.trim()) {
    errTitle.textContent = 'Please enter a title.';
    valid = false;
  }
  return valid;
}

function resetMemoryForm() {
  memoryForm.reset();
  memEditIdInput.value = '';
  currentImageData = null;
  imagePreview.classList.add('hidden');
  imagePreview.src = '';
  uploadPlaceholder.style.display = 'flex';
  memSubmitBtn.innerHTML = '<i class="fas fa-heart"></i> Save Memory';
  memCancelBtn.style.display = 'none';
  document.getElementById('err-date').textContent  = '';
  document.getElementById('err-title').textContent = '';
}

function renderTimeline() {
  const sorted = [...memories].sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sorted.length === 0) {
    timelineEmpty.classList.remove('hidden');
    timelineEl.innerHTML = '';
    return;
  }
  timelineEmpty.classList.add('hidden');

  timelineEl.innerHTML = sorted.map((mem, i) => `
    <div class="timeline-item" style="animation-delay:${i * 0.07}s">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-card-top">
          <div class="timeline-meta">
            <div class="timeline-date">${formatDate(mem.date)}</div>
            <div class="timeline-title">${escapeHTML(mem.title)}</div>
          </div>
          <div class="timeline-actions">
            <button class="btn-icon btn-icon-edit" title="Edit" onclick="editMemory('${mem.id}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-icon btn-icon-del" title="Delete" onclick="confirmDeleteMemory('${mem.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        ${mem.desc ? `<p class="timeline-desc">${escapeHTML(mem.desc)}</p>` : ''}
        ${mem.image ? `<img class="timeline-img" src="${mem.image}" alt="${escapeHTML(mem.title)}" loading="lazy" />` : ''}
      </div>
    </div>
  `).join('');
}

function editMemory(id) {
  const mem = memories.find(m => m.id === id);
  if (!mem) return;

  memDateInput.value  = mem.date;
  memTitleInput.value = mem.title;
  memDescInput.value  = mem.desc || '';
  memEditIdInput.value = mem.id;
  currentImageData = mem.image || null;

  if (mem.image) {
    imagePreview.src = mem.image;
    imagePreview.classList.remove('hidden');
    uploadPlaceholder.style.display = 'none';
  } else {
    imagePreview.classList.add('hidden');
    uploadPlaceholder.style.display = 'flex';
  }

  memSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Update Memory';
  memCancelBtn.style.display = 'inline-flex';

  // Scroll to form
  document.querySelector('.form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function confirmDeleteMemory(id) {
  const mem = memories.find(m => m.id === id);
  if (!mem) return;
  openModal(`Delete "${mem.title}"? This cannot be undone.`, () => {
    memories = memories.filter(m => m.id !== id);
    save(STORAGE_KEYS.memories, memories);
    renderTimeline();
    showToast('Memory deleted.');
  });
}

// ==========================================
// SECTION 2: DATE IDEAS
// ==========================================

// ==========================================
// SECTION 2: DATE IDEAS — TABS
// ==========================================

// Tab switching — use style.display to bypass CSS specificity conflicts
function switchDiTab(tabName) {
  document.querySelectorAll('.di-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.ditab === tabName);
  });
  ['checklist', 'add'].forEach(name => {
    const panel = document.getElementById('ditab-' + name);
    if (panel) panel.style.display = (name === tabName) ? 'block' : 'none';
  });
  if (tabName === 'checklist') renderChecklist();
  if (tabName === 'add') renderCustomIdeas();
}

document.querySelectorAll('.di-tab').forEach(tab => {
  tab.addEventListener('click', () => switchDiTab(tab.dataset.ditab));
});

// Initialize: checklist is default active
['add'].forEach(name => {
  const panel = document.getElementById('ditab-' + name);
  if (panel) panel.style.display = 'none';
});

// getAllIdeas used by checklist + add tabs
function getAllIdeas() {
  return [...DATE_IDEAS.filter(i => !removedIdeas.includes(i.id)), ...customIdeas];
}

// ── CHECKLIST TAB ──
let checklistFilter = 'all';

document.querySelectorAll('.clf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.clf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    checklistFilter = btn.dataset.clf;
    renderChecklist();
  });
});

function renderChecklist() {
  const all   = getAllIdeas();
  const total = all.length;
  const done  = checkedIdeas.length;

  // Progress
  document.getElementById('checklistProgressLabel').textContent = `${done} / ${total} done`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('checklistProgressFill').style.width = pct + '%';

  const listEl  = document.getElementById('checklistList');
  const emptyEl = document.getElementById('checklistEmpty');

  // Filter
  let filtered = all;
  if (checklistFilter === 'done')   filtered = all.filter(i => checkedIdeas.includes(i.id));
  if (checklistFilter === 'undone') filtered = all.filter(i => !checkedIdeas.includes(i.id));

  // Remove old items (keep the empty placeholder)
  listEl.querySelectorAll('.cl-item').forEach(el => el.remove());

  if (!filtered.length) {
    emptyEl.classList.remove('hidden');
    return;
  }
  emptyEl.classList.add('hidden');

  // Group by category
  const cats = [...new Set(filtered.map(i => i.cat))];
  cats.forEach(cat => {
    const group = filtered.filter(i => i.cat === cat);

    const groupHeader = document.createElement('div');
    groupHeader.className = 'cl-group-label cl-item';
    groupHeader.textContent = getCatLabel(cat);
    listEl.appendChild(groupHeader);

    group.forEach(idea => {
      const isDone = checkedIdeas.includes(idea.id);
      const row = document.createElement('div');
      row.className = 'cl-item cl-row' + (isDone ? ' cl-done' : '');
      row.dataset.id = idea.id;
      row.innerHTML = `
        <label class="cl-label">
          <span class="cl-box"></span>
          <span class="cl-emoji">${idea.emoji}</span>
          <span class="cl-text">
            <span class="cl-title">${escapeHTML(idea.title)}</span>
            ${idea.desc ? `<span class="cl-desc">${escapeHTML(idea.desc)}</span>` : ''}
          </span>
        </label>
        <button class="cl-remove-btn" title="Remove">
          <i class="fas fa-trash"></i>
        </button>
      `;

      // Use addEventListener so closures capture the exact idea.id without any type issues
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'cl-check';
      checkbox.checked = isDone;
      checkbox.addEventListener('change', () => toggleCheck(idea.id, checkbox.checked));
      row.querySelector('.cl-label').prepend(checkbox);

      row.querySelector('.cl-remove-btn').addEventListener('click', () => removeFromChecklist(idea.id));

      listEl.appendChild(row);
    });
  });
}

function toggleCheck(ideaId, isChecked) {
  if (isChecked) {
    if (!checkedIdeas.includes(ideaId)) checkedIdeas.push(ideaId);
  } else {
    checkedIdeas = checkedIdeas.filter(id => id !== ideaId);
  }
  save(STORAGE_KEYS.checkedIdeas, checkedIdeas);
  // Update progress & done styling without full re-render
  const row = document.querySelector(`.cl-row[data-id="${CSS.escape(String(ideaId))}"]`);
  if (row) row.classList.toggle('cl-done', isChecked);
  const total = getAllIdeas().length;
  const done  = checkedIdeas.length;
  document.getElementById('checklistProgressLabel').textContent = `${done} / ${total} done`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('checklistProgressFill').style.width = pct + '%';
}

function removeFromChecklist(ideaId) {
  // Normalize type — numeric IDs come in as numbers, custom as strings
  const id = typeof ideaId === 'string' && !isNaN(ideaId) ? Number(ideaId) : ideaId;

  // Remove from checkedIdeas
  checkedIdeas = checkedIdeas.filter(cid => cid !== id && String(cid) !== String(id));
  save(STORAGE_KEYS.checkedIdeas, checkedIdeas);

  // If it's a custom idea, remove it entirely
  const isCustom = customIdeas.some(i => String(i.id) === String(id));
  if (isCustom) {
    customIdeas = customIdeas.filter(i => String(i.id) !== String(id));
    save(STORAGE_KEYS.customIdeas, customIdeas);
    updateHomeIdeaTotal();
  } else {
    // For built-in ideas, track as "removed" so they stay hidden
    if (!removedIdeas.some(rid => String(rid) === String(id))) removedIdeas.push(id);
    save(STORAGE_KEYS.removedIdeas, removedIdeas);
  }

  // Remove the row from DOM instantly
  const row = document.querySelector(`.cl-row[data-id="${CSS.escape(String(id))}"]`);
  if (row) row.remove();

  // Also remove empty group headers
  document.querySelectorAll('.cl-group-label').forEach(header => {
    let next = header.nextElementSibling;
    if (!next || next.classList.contains('cl-group-label') || !next.classList.contains('cl-row')) {
      header.remove();
    }
  });

  // Update progress
  const total = getAllIdeas().length;
  const done  = checkedIdeas.length;
  document.getElementById('checklistProgressLabel').textContent = `${done} / ${total} done`;
  const pct = total ? Math.round((done / total) * 100) : 0;
  document.getElementById('checklistProgressFill').style.width = pct + '%';

  showToast('Removed from list.');
}

// ── ADD IDEA TAB ──
const addIdeaForm       = document.getElementById('addIdeaForm');
const ideaAddTitleInput = document.getElementById('ideaAddTitle');
const ideaAddEmojiInput = document.getElementById('ideaAddEmoji');
const ideaAddDescInput  = document.getElementById('ideaAddDesc');
const ideaAddSubmitBtn  = document.getElementById('ideaAddSubmitBtn');
const ideaAddCancelBtn  = document.getElementById('ideaAddCancelBtn');
const ideaAddEditIdInput = document.getElementById('ideaAddEditId');

let selectedIdeaCat = 'custom';

document.querySelectorAll('.icp-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.icp-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedIdeaCat = btn.dataset.icat;
  });
});

addIdeaForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const errTitle = document.getElementById('err-ideaTitle');
  errTitle.textContent = '';

  const title = ideaAddTitleInput.value.trim();
  if (!title) { errTitle.textContent = 'Please enter a title.'; return; }

  const editId = ideaAddEditIdInput.value;
  const idea = {
    id:    editId || ('ci_' + Date.now()),
    title,
    emoji: ideaAddEmojiInput.value.trim() || '⭐',
    desc:  ideaAddDescInput.value.trim(),
    cat:   selectedIdeaCat,
  };

  if (editId) {
    const idx = customIdeas.findIndex(i => i.id === editId);
    if (idx !== -1) customIdeas[idx] = idea;
    showToast('Idea updated! ✏️');
  } else {
    customIdeas.push(idea);
    showToast('Custom idea added! 🌟');
  }

  save(STORAGE_KEYS.customIdeas, customIdeas);
  resetAddIdeaForm();
  renderCustomIdeas();
  updateHomeIdeaTotal();
});

ideaAddCancelBtn.addEventListener('click', resetAddIdeaForm);

function resetAddIdeaForm() {
  addIdeaForm.reset();
  ideaAddEditIdInput.value = '';
  selectedIdeaCat = 'custom';
  document.querySelectorAll('.icp-btn').forEach(b => b.classList.remove('active'));
  document.querySelector('.icp-btn[data-icat="custom"]').classList.add('active');
  ideaAddSubmitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Idea';
  ideaAddCancelBtn.style.display = 'none';
  document.getElementById('err-ideaTitle').textContent = '';
}

function renderCustomIdeas() {
  const listEl  = document.getElementById('customIdeasList');
  const emptyEl = document.getElementById('emptyCustomIdeas');
  const countEl = document.getElementById('customIdeaCount');
  countEl.textContent = customIdeas.length;

  if (!customIdeas.length) {
    emptyEl.style.display = 'block';
    listEl.querySelectorAll('.fav-item').forEach(el => el.remove());
    return;
  }
  emptyEl.style.display = 'none';
  listEl.querySelectorAll('.fav-item').forEach(el => el.remove());

  customIdeas.forEach(idea => {
    const item = document.createElement('div');
    item.className = 'fav-item';
    item.dataset.id = idea.id;
    item.innerHTML = `
      <span class="fav-emoji">${idea.emoji}</span>
      <div class="fav-content">
        <div class="fav-title">${escapeHTML(idea.title)}</div>
        <div class="fav-cat">${getCatLabel(idea.cat)}</div>
      </div>
      <div style="display:flex;gap:0.35rem;flex-shrink:0">
        <button class="btn-icon btn-icon-edit" title="Edit" onclick="editCustomIdea(${JSON.stringify(idea.id)})">
          <i class="fas fa-pen"></i>
        </button>
        <button class="btn-icon btn-icon-del" title="Delete" onclick="deleteCustomIdea(${JSON.stringify(idea.id)})">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `;
    listEl.appendChild(item);
  });
}

function editCustomIdea(id) {
  const idea = customIdeas.find(i => i.id === id);
  if (!idea) return;
  ideaAddTitleInput.value = idea.title;
  ideaAddEmojiInput.value = idea.emoji;
  ideaAddDescInput.value  = idea.desc || '';
  ideaAddEditIdInput.value = idea.id;
  selectedIdeaCat = idea.cat;
  document.querySelectorAll('.icp-btn').forEach(b => b.classList.remove('active'));
  const catBtn = document.querySelector(`.icp-btn[data-icat="${idea.cat}"]`);
  if (catBtn) catBtn.classList.add('active');
  ideaAddSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Update Idea';
  ideaAddCancelBtn.style.display = 'inline-flex';
  document.querySelector('#ditab-add .form-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function deleteCustomIdea(id) {
  const idea = customIdeas.find(i => i.id === id);
  if (!idea) return;
  openModal(`Delete "${idea.title}"? This cannot be undone.`, () => {
    customIdeas = customIdeas.filter(i => i.id !== id);
    save(STORAGE_KEYS.customIdeas, customIdeas);
    // Also remove from checked and favorites
    checkedIdeas = checkedIdeas.filter(cid => cid !== id);
    save(STORAGE_KEYS.checkedIdeas, checkedIdeas);
    favorites = favorites.filter(f => f.id !== id);
    save(STORAGE_KEYS.favorites, favorites);
    renderCustomIdeas();
    updateHomeIdeaTotal();
    showToast('Custom idea deleted.');
  });
}

function updateHomeIdeaTotal() {
  const el = document.getElementById('homeIdeaTotal');
  if (el) el.textContent = getAllIdeas().length;
}

// ==========================================
// SECTION 3: COUNTDOWN
// ==========================================

const countdownForm  = document.getElementById('countdownForm');
const cdNameInput    = document.getElementById('cdName');
const cdDateInput    = document.getElementById('cdDate');
const countdownsGrid = document.getElementById('countdownsGrid');
const countdownEmpty = document.getElementById('countdownEmpty');

// Emoji picker
document.querySelectorAll('.emoji-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedEmoji = btn.dataset.emoji;
  });
});

countdownForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateCountdownForm()) return;

  const event = {
    id:        Date.now().toString(),
    name:      cdNameInput.value.trim(),
    targetDate: cdDateInput.value,
    emoji:     selectedEmoji,
  };

  countdowns.push(event);
  save(STORAGE_KEYS.countdowns, countdowns);
  countdownForm.reset();
  // Reset emoji
  document.querySelectorAll('.emoji-opt').forEach(b => b.classList.remove('active'));
  document.querySelector('.emoji-opt[data-emoji="💚"]').classList.add('active');
  selectedEmoji = '💚';
  showToast('Countdown added! ⏱️');
  renderCountdowns();
});

function validateCountdownForm() {
  let valid = true;
  const errName = document.getElementById('err-cdName');
  const errDate = document.getElementById('err-cdDate');
  errName.textContent = '';
  errDate.textContent = '';

  if (!cdNameInput.value.trim()) {
    errName.textContent = 'Please enter an event name.';
    valid = false;
  }
  if (!cdDateInput.value) {
    errDate.textContent = 'Please pick a target date.';
    valid = false;
  }
  return valid;
}

function renderCountdowns() {
  // Clear existing timers
  Object.values(countdownTimers).forEach(clearInterval);
  countdownTimers = {};

  if (!countdowns.length) {
    countdownEmpty.classList.remove('hidden');
    // Remove all countdown cards
    document.querySelectorAll('.countdown-card').forEach(el => el.remove());
    return;
  }
  countdownEmpty.classList.add('hidden');

  // Remove old cards
  document.querySelectorAll('.countdown-card').forEach(el => el.remove());

  countdowns.forEach((event, i) => {
    const card = document.createElement('div');
    card.className = 'countdown-card';
    card.dataset.id = event.id;
    card.style.animationDelay = `${i * 0.1}s`;

    const targetDate = new Date(event.targetDate);
    const isPast = targetDate <= new Date();

    card.innerHTML = `
      <div class="countdown-top">
        <div class="countdown-info">
          <span class="countdown-icon">${event.emoji}</span>
          <div>
            <div class="countdown-name">${escapeHTML(event.name)}</div>
            <div class="countdown-target-date">${formatDateTime(event.targetDate)}</div>
          </div>
        </div>
        <button class="btn-icon btn-icon-del" title="Delete" onclick="confirmDeleteCountdown('${event.id}')">
          <i class="fas fa-trash"></i>
        </button>
      </div>
      ${isPast
        ? `<div class="countdown-past">🎉 This moment has arrived! Celebrate! 🎉</div>`
        : `<div class="countdown-timer" id="timer-${event.id}">
            <div class="time-unit">
              <div class="time-value" id="days-${event.id}">00</div>
              <div class="time-label">Days</div>
            </div>
            <div class="time-unit">
              <div class="time-value" id="hours-${event.id}">00</div>
              <div class="time-label">Hours</div>
            </div>
            <div class="time-unit">
              <div class="time-value" id="mins-${event.id}">00</div>
              <div class="time-label">Minutes</div>
            </div>
            <div class="time-unit">
              <div class="time-value" id="secs-${event.id}">00</div>
              <div class="time-label">Seconds</div>
            </div>
          </div>`
      }
    `;

    countdownsGrid.appendChild(card);

    if (!isPast) startTimer(event.id, event.targetDate);
  });
}

function startTimer(id, targetDate) {
  const target = new Date(targetDate).getTime();

  function tick() {
    const now  = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      clearInterval(countdownTimers[id]);
      const timerEl = document.getElementById(`timer-${id}`);
      if (timerEl) {
        timerEl.outerHTML = `<div class="countdown-past">🎉 This moment has arrived! Celebrate! 🎉</div>`;
      }
      return;
    }

    const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs  = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUnit(`days-${id}`,  pad(days));
    setTimeUnit(`hours-${id}`, pad(hours));
    setTimeUnit(`mins-${id}`,  pad(mins));
    setTimeUnit(`secs-${id}`,  pad(secs), true); // tick animation on seconds
  }

  tick();
  countdownTimers[id] = setInterval(tick, 1000);
}

function setTimeUnit(elId, value, animate = false) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (el.textContent !== value) {
    el.textContent = value;
    if (animate) {
      el.classList.remove('tick');
      el.offsetHeight; // reflow
      el.classList.add('tick');
      setTimeout(() => el.classList.remove('tick'), 150);
    }
  }
}

function confirmDeleteCountdown(id) {
  const event = countdowns.find(c => c.id === id);
  if (!event) return;
  openModal(`Delete "${event.name}" countdown?`, () => {
    clearInterval(countdownTimers[id]);
    delete countdownTimers[id];
    countdowns = countdowns.filter(c => c.id !== id);
    save(STORAGE_KEYS.countdowns, countdowns);
    renderCountdowns();
    showToast('Countdown deleted.');
  });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-PH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCatLabel(cat) {
  const labels = {
    indoor:      '🏠 Indoor',
    outdoor:     '🌳 Outdoor',
    budget:      '💰 Low Budget',
    adventurous: '🏔️ Adventurous',
    custom:      '⭐ Custom',
  };
  return labels[cat] || capitalize(cat);
}

// ==========================================
// SECTION 0: HOME PAGE
// ==========================================

function renderHome() {
  renderHomeTimeline();
  renderHomeCountdown();
  renderHomeIdeas();
  renderHomeSpotlight();
  renderHomeLetters();
}

let carouselIndex = 0;
let carouselTimer = null;
const CAROUSEL_INTERVAL = 3500;

function renderHomeCarousel() {
  const wrap     = document.getElementById('homeCarouselWrap');
  const carousel = document.getElementById('homeCarousel');
  const dotsEl   = document.getElementById('hcDots');
  const emptyEl  = document.getElementById('hcEmpty');
  if (!wrap) return;

  const sorted = [...memories].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Clear old slides and timer
  clearCarouselTimer();
  carousel.querySelectorAll('.hc-slide').forEach(el => el.remove());
  dotsEl.innerHTML = '';

  if (!sorted.length) {
    if (emptyEl) emptyEl.style.display = 'flex';
    return;
  }
  if (emptyEl) emptyEl.style.display = 'none';

  // Clamp index
  carouselIndex = Math.min(carouselIndex, sorted.length - 1);

  // Build slides
  sorted.forEach((m, i) => {
    const slide = document.createElement('div');
    slide.className = 'hc-slide' + (i === carouselIndex ? ' active' : '');
    slide.innerHTML = m.image
      ? `<div class="hc-img-wrap"><img class="hc-img" src="${m.image}" alt="${escapeHTML(m.title)}" /></div>
         <div class="hc-overlay"></div>`
      : `<div class="hc-no-img"><span class="hc-placeholder-emoji">${m.emoji || '💚'}</span></div>
         <div class="hc-overlay"></div>`;
    slide.innerHTML += `
      <div class="hc-info">
        <div class="hc-date">${formatDate(m.date)}</div>
        <div class="hc-title">${escapeHTML(m.title)}</div>
        ${m.desc ? `<div class="hc-desc">${escapeHTML(m.desc)}</div>` : ''}
      </div>`;
    carousel.appendChild(slide);
  });

  // Dots
  dotsEl.innerHTML = sorted.map((_, i) =>
    `<span class="hc-dot${i === carouselIndex ? ' active' : ''}" data-i="${i}"></span>`
  ).join('');
  dotsEl.querySelectorAll('.hc-dot').forEach(dot => {
    dot.addEventListener('click', () => { goToSlide(Number(dot.dataset.i)); resetCarouselTimer(); });
  });

  startCarouselTimer(sorted.length);
}

function updateCarouselDisplay() {
  const slides = document.querySelectorAll('.hc-slide');
  const dots   = document.querySelectorAll('.hc-dot');
  const total  = slides.length;
  if (!total) return;
  slides.forEach((s, i) => s.classList.toggle('active', i === carouselIndex));
  dots.forEach((d, i) => d.classList.toggle('active', i === carouselIndex));
}

function goToSlide(i) {
  const total = document.querySelectorAll('.hc-slide').length;
  if (!total) return;
  carouselIndex = (i + total) % total;
  updateCarouselDisplay();
}

function startCarouselTimer(total) {
  if (total <= 1) return;
  carouselTimer = setInterval(() => {
    carouselIndex = (carouselIndex + 1) % total;
    updateCarouselDisplay();
  }, CAROUSEL_INTERVAL);
}

function clearCarouselTimer() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
}

function resetCarouselTimer() {
  const total = document.querySelectorAll('.hc-slide').length;
  clearCarouselTimer();
  startCarouselTimer(total);
}

document.getElementById('hcPrev').addEventListener('click', () => { goToSlide(carouselIndex - 1); resetCarouselTimer(); });
document.getElementById('hcNext').addEventListener('click', () => { goToSlide(carouselIndex + 1); resetCarouselTimer(); });

// Swipe support
(function() {
  const el = document.getElementById('homeCarousel');
  let startX = 0;
  el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  el.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) { goToSlide(carouselIndex + (dx < 0 ? 1 : -1)); resetCarouselTimer(); }
  });
})();

// Pause on hover
document.getElementById('homeCarousel').addEventListener('mouseenter', clearCarouselTimer);
document.getElementById('homeCarousel').addEventListener('mouseleave', () => resetCarouselTimer());

// Keep old name so renderHome() call still works
function renderHomeTimeline() { renderHomeCarousel(); }

function renderHomeCountdown() {
  const el = document.getElementById('homeCountdownPreview');
  if (!countdowns.length) {
    el.innerHTML = '<div class="hfc-empty">No countdowns yet — add one! ⏳</div>';
    return;
  }
  const now = Date.now();
  const sorted = [...countdowns].sort((a, b) => {
    const diffA = new Date(a.targetDate) - now;
    const diffB = new Date(b.targetDate) - now;
    // Future events first (smallest positive diff), then past
    const aFuture = diffA > 0;
    const bFuture = diffB > 0;
    if (aFuture && !bFuture) return -1;
    if (!aFuture && bFuture) return 1;
    return Math.abs(diffA) - Math.abs(diffB);
  });
  const preview = sorted.slice(0, 3);

  el.innerHTML = `<div class="home-cd-preview">
    ${preview.map(cd => {
      const diff = new Date(cd.targetDate) - now;
      const isPast = diff <= 0;
      const days = isPast ? null : Math.floor(diff / (1000 * 60 * 60 * 24));
      return `
        <div class="home-cd-item">
          <span class="home-cd-icon">${cd.emoji}</span>
          <span class="home-cd-name">${escapeHTML(cd.name)}</span>
          ${isPast
            ? `<span class="home-cd-past">🎉 Arrived!</span>`
            : `<span class="home-cd-days">${days}d left</span>`
          }
        </div>`;
    }).join('')}
  </div>`;
}

function renderHomeIdeas() {
  const el = document.getElementById('homeDateIdeasPreview');
  if (!el) return;

  const allIdeas = [...DATE_IDEAS, ...customIdeas];
  const rows = [];

  // Newest custom idea added
  if (customIdeas.length) {
    const newest = customIdeas[customIdeas.length - 1];
    rows.push({ badge: '🌟 Newly Added', idea: newest });
  }

  // Latest idea checked off
  if (checkedIdeas.length) {
    const lastId = checkedIdeas[checkedIdeas.length - 1];
    const idea = allIdeas.find(i => String(i.id) === String(lastId));
    if (idea) rows.push({ badge: '✅ Last Checked', idea });
  }

  if (!rows.length) {
    el.innerHTML = '<div class="hfc-empty">No activity yet — add or check off ideas! 💚</div>';
    return;
  }

  el.innerHTML = rows.map(({ badge, idea }) => `
    <div class="home-idea-activity-row">
      <div class="hiab">${badge}</div>
      <div class="hia-chip">${idea.emoji} ${escapeHTML(idea.title)}</div>
    </div>
  `).join('');
}

function renderHomeSpotlight() { /* replaced by carousel */ }

function renderHomeLetters() {
  const el = document.getElementById('homeLettersPreview');
  if (!letters.length) {
    el.innerHTML = '<div class="hfc-empty">No letters yet — write your first! 💌</div>';
    return;
  }
  const recent = [...letters].sort((a, b) => b.createdAt - a.createdAt).slice(0, 3);
  el.innerHTML = `<div class="home-letters-list">
    ${recent.map(l => {
      const isLocked = l.locked && l.password;
      const isSched  = l.unlockDate && new Date(l.unlockDate) > new Date();
      return `<div class="home-letter-item">
        <span class="home-letter-mood">${l.mood}</span>
        <div class="home-letter-info">
          <div class="home-letter-title">${escapeHTML(l.title)}</div>
          <div class="home-letter-date">${formatDate(l.date)}</div>
        </div>
        ${isLocked || isSched ? `<span class="home-letter-lock"><i class="fas fa-${isSched ? 'calendar-alt' : 'lock'}"></i></span>` : ''}
      </div>`;
    }).join('')}
    ${letters.length > 3 ? `<span class="home-more-pill">+${letters.length - 3} more letter${letters.length - 3 > 1 ? 's' : ''} →</span>` : ''}
  </div>`;
}

// ==========================================
// SECTION 4: LOVE LETTERS
// ==========================================

// — State —
let currentLetterMood  = '💚';
let currentLFilterMode = 'all';
let openingLetterId    = null;  // id of letter being read
let schedTimerInterval = null;

// — Elements —
const letterForm        = document.getElementById('letterForm');
const ltTitleInput      = document.getElementById('ltTitle');
const ltFromInput       = document.getElementById('ltFrom');
const ltMessageInput    = document.getElementById('ltMessage');
const ltCharCount       = document.getElementById('ltCharCount');
const ltEditIdInput     = document.getElementById('ltEditId');
const ltSubmitBtn       = document.getElementById('ltSubmitBtn');
const ltCancelBtn       = document.getElementById('ltCancelBtn');
const ltLockToggle      = document.getElementById('ltLockToggle');
const ltScheduleToggle  = document.getElementById('ltScheduleToggle');
const lockFields        = document.getElementById('lockFields');
const scheduleFields    = document.getElementById('scheduleFields');
const ltPasswordInput   = document.getElementById('ltPassword');
const ltUnlockDateInput = document.getElementById('ltUnlockDate');
const lettersGrid       = document.getElementById('lettersGrid');
const lettersEmpty      = document.getElementById('lettersEmpty');

// — Char counter —
ltMessageInput.addEventListener('input', () => {
  ltCharCount.textContent = ltMessageInput.value.length;
});

// — Mood picker —
document.querySelectorAll('.mood-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.mood-opt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLetterMood = btn.dataset.mood;
  });
});

// — Lock toggle —
ltLockToggle.addEventListener('change', () => {
  lockFields.classList.toggle('hidden', !ltLockToggle.checked);
});

// — Schedule toggle —
ltScheduleToggle.addEventListener('change', () => {
  scheduleFields.classList.toggle('hidden', !ltScheduleToggle.checked);
});

// — Password eye toggle (compose form) —
document.getElementById('pwEye1').addEventListener('click', () => {
  const inp = ltPasswordInput;
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// — Password eye toggle (reader gate) —
document.getElementById('pwEye2').addEventListener('click', () => {
  const inp = document.getElementById('gatePassword');
  inp.type = inp.type === 'password' ? 'text' : 'password';
});

// — Letter filter buttons —
document.querySelectorAll('.lf-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.lf-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentLFilterMode = btn.dataset.lfilter;
    renderLetters();
  });
});

// — Form submit —
letterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!validateLetterForm()) return;

  const editId = ltEditIdInput.value;
  const isLocked = ltLockToggle.checked;
  const hasSchedule = ltScheduleToggle.checked && ltUnlockDateInput.value;

  const letter = {
    id:         editId || Date.now().toString(),
    title:      ltTitleInput.value.trim(),
    from:       ltFromInput.value.trim(),
    message:    ltMessageInput.value.trim(),
    mood:       currentLetterMood,
    date:       new Date().toISOString().split('T')[0],
    createdAt:  editId ? (letters.find(l => l.id === editId)?.createdAt || Date.now()) : Date.now(),
    locked:     isLocked,
    password:   isLocked && ltPasswordInput.value ? simpleHash(ltPasswordInput.value) : null,
    unlockDate: hasSchedule ? ltUnlockDateInput.value : null,
  };

  if (editId) {
    const idx = letters.findIndex(l => l.id === editId);
    if (idx !== -1) letters[idx] = letter;
    showToast('Letter updated! 💚');
  } else {
    letters.push(letter);
    showToast('Letter sent from the heart! 💌');
  }

  save(STORAGE_KEYS.letters, letters);
  resetLetterForm();
  renderLetters();
});

// — Cancel edit —
ltCancelBtn.addEventListener('click', resetLetterForm);

function validateLetterForm() {
  let valid = true;
  document.getElementById('err-ltTitle').textContent   = '';
  document.getElementById('err-ltMessage').textContent = '';
  document.getElementById('err-ltPw').textContent      = '';

  if (!ltTitleInput.value.trim()) {
    document.getElementById('err-ltTitle').textContent = 'Please give your letter a title.';
    valid = false;
  }
  if (!ltMessageInput.value.trim()) {
    document.getElementById('err-ltMessage').textContent = 'Please write your letter.';
    valid = false;
  }
  if (ltLockToggle.checked && !ltPasswordInput.value) {
    document.getElementById('err-ltPw').textContent = 'Please set a password.';
    valid = false;
  }
  return valid;
}

function resetLetterForm() {
  letterForm.reset();
  ltEditIdInput.value = '';
  ltCharCount.textContent = '0';
  currentLetterMood = '💚';
  document.querySelectorAll('.mood-opt').forEach(b => b.classList.remove('active'));
  document.querySelector('.mood-opt[data-mood="💚"]').classList.add('active');
  lockFields.classList.add('hidden');
  scheduleFields.classList.add('hidden');
  ltSubmitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Letter';
  ltCancelBtn.style.display = 'none';
  ['err-ltTitle','err-ltMessage','err-ltPw'].forEach(id => {
    document.getElementById(id).textContent = '';
  });
}

// — Simple hash (NOT secure, just obfuscation) —
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString(36);
}

// — Render all letters —
function renderLetters() {
  // Remove existing cards
  document.querySelectorAll('.letter-card').forEach(el => el.remove());

  const now = new Date();
  const filtered = letters.filter(l => {
    if (currentLFilterMode === 'locked')     return l.locked && l.password;
    if (currentLFilterMode === 'scheduled')  return l.unlockDate && new Date(l.unlockDate) > now;
    if (currentLFilterMode === 'unlocked')   return !l.locked && (!l.unlockDate || new Date(l.unlockDate) <= now);
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);

  if (!letters.length) {
    lettersEmpty.classList.remove('hidden');
    return;
  }
  lettersEmpty.classList.add('hidden');

  if (!filtered.length) {
    const notice = document.createElement('p');
    notice.id = 'lettersFilterNotice';
    notice.style.cssText = 'text-align:center;color:var(--smoke);font-style:italic;padding:2rem 0;grid-column:1/-1;';
    notice.textContent = 'No letters match this filter.';
    lettersGrid.appendChild(notice);
    return;
  }

  document.getElementById('lettersFilterNotice')?.remove();

  filtered.forEach((letter, i) => {
    const isLocked    = letter.locked && letter.password;
    const isScheduled = letter.unlockDate && new Date(letter.unlockDate) > now;
    const preview     = letter.message.slice(0, 120) + (letter.message.length > 120 ? '…' : '');

    const card = document.createElement('div');
    card.className = 'letter-card';
    card.dataset.id = letter.id;
    card.style.animationDelay = `${i * 0.06}s`;

    card.innerHTML = `
      <div class="letter-card-strip"></div>
      <div class="letter-card-body">
        <div class="letter-card-top">
          <div class="letter-card-mood">${letter.mood}</div>
          <div class="letter-card-meta">
            <div class="letter-card-title">${escapeHTML(letter.title)}</div>
            <div class="letter-card-info">
              ${letter.from ? `<span>From ${escapeHTML(letter.from)}</span><span class="sep">·</span>` : ''}
              <span>${formatDate(letter.date)}</span>
            </div>
          </div>
          <div class="letter-card-actions">
            <button class="btn-icon btn-icon-edit" title="Edit" onclick="editLetter('${letter.id}')">
              <i class="fas fa-pen"></i>
            </button>
            <button class="btn-icon btn-icon-del" title="Delete" onclick="confirmDeleteLetter('${letter.id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>

        ${!isLocked && !isScheduled
          ? `<p class="letter-card-preview">${escapeHTML(preview)}</p>`
          : `<p class="letter-card-preview" style="filter:blur(4px);user-select:none;">${escapeHTML(preview)}</p>`
        }

        <div class="letter-status-row">
          ${isScheduled
            ? `<span class="letter-badge badge-scheduled"><i class="fas fa-calendar-alt"></i> Opens ${formatDate(letter.unlockDate.split('T')[0])}</span>`
            : isLocked
              ? `<span class="letter-badge badge-locked"><i class="fas fa-lock"></i> Password Protected</span>`
              : `<span class="letter-badge badge-open"><i class="fas fa-envelope-open"></i> Open</span>`
          }
        </div>

        <button class="btn btn-primary open-letter-btn" onclick="openLetter('${letter.id}')">
          <i class="fas fa-envelope-open-text"></i>
          ${isScheduled ? 'View Countdown' : isLocked ? 'Unlock & Read' : 'Open Letter'}
        </button>
      </div>
    `;

    lettersGrid.appendChild(card);
  });
}

// — Edit letter —
function editLetter(id) {
  const letter = letters.find(l => l.id === id);
  if (!letter) return;

  ltTitleInput.value   = letter.title;
  ltFromInput.value    = letter.from || '';
  ltMessageInput.value = letter.message;
  ltCharCount.textContent = letter.message.length;
  ltEditIdInput.value  = letter.id;
  currentLetterMood    = letter.mood;

  document.querySelectorAll('.mood-opt').forEach(b => {
    b.classList.toggle('active', b.dataset.mood === letter.mood);
  });

  ltLockToggle.checked = !!letter.locked;
  lockFields.classList.toggle('hidden', !letter.locked);

  ltScheduleToggle.checked = !!letter.unlockDate;
  scheduleFields.classList.toggle('hidden', !letter.unlockDate);
  if (letter.unlockDate) ltUnlockDateInput.value = letter.unlockDate;

  ltSubmitBtn.innerHTML = '<i class="fas fa-save"></i> Update Letter';
  ltCancelBtn.style.display = 'inline-flex';

  document.querySelector('.letter-compose-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// — Delete letter —
function confirmDeleteLetter(id) {
  const letter = letters.find(l => l.id === id);
  if (!letter) return;
  openModal(`Delete "${letter.title}"? This cannot be undone.`, () => {
    letters = letters.filter(l => l.id !== id);
    save(STORAGE_KEYS.letters, letters);
    renderLetters();
    showToast('Letter deleted.');
  });
}

// ==========================================
// LETTER READER MODAL
// ==========================================

const letterReaderOverlay = document.getElementById('letterReaderOverlay');
const envelopeWrap        = document.getElementById('envelopeWrap');
const envelopeAnim        = document.getElementById('envelopeAnim');
const envOpenBtn          = document.getElementById('envOpenBtn');
const letterContent       = document.getElementById('letterContent');
const pwGate              = document.getElementById('pwGate');
const schedGate           = document.getElementById('schedGate');
const gatePasswordInput   = document.getElementById('gatePassword');
const gateUnlockBtn       = document.getElementById('gateUnlockBtn');

function openLetter(id) {
  openingLetterId = id;
  const letter = letters.find(l => l.id === id);
  if (!letter) return;

  const now = new Date();
  const isScheduled = letter.unlockDate && new Date(letter.unlockDate) > now;
  const isLocked    = letter.locked && letter.password;

  // Reset all panels
  envelopeWrap.classList.remove('hidden');
  letterContent.classList.add('hidden');
  pwGate.classList.add('hidden');
  schedGate.classList.add('hidden');
  envelopeAnim.classList.remove('open');
  gatePasswordInput.value = '';
  document.getElementById('err-gate').textContent = '';
  clearInterval(schedTimerInterval);

  letterReaderOverlay.classList.remove('hidden');

  // Determine what to show after envelope opens
  envOpenBtn.onclick = () => {
    envelopeAnim.classList.add('open');
    setTimeout(() => {
      envelopeWrap.classList.add('hidden');

      if (isScheduled) {
        showSchedGate(letter);
      } else if (isLocked) {
        pwGate.classList.remove('hidden');
      } else {
        showLetterContent(letter);
      }
    }, 550);
  };
}

function showLetterContent(letter) {
  document.getElementById('readerMood').textContent  = letter.mood;
  document.getElementById('readerTitle').textContent = letter.title;
  document.getElementById('readerFrom').textContent  = letter.from ? `From ${letter.from}` : '';
  document.getElementById('readerDate').textContent  = formatDate(letter.date);

  const bodyEl = document.getElementById('readerBody');
  bodyEl.textContent = '';
  letterContent.classList.remove('hidden');

  // Typing effect
  typeText(bodyEl, letter.message);

  // Edit button
  document.getElementById('readerEditBtn').onclick = () => {
    closeLetter();
    editLetter(letter.id);
  };
}

function typeText(el, text, speed = 18) {
  el.textContent = '';
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  el.appendChild(cursor);

  let i = 0;
  const interval = setInterval(() => {
    if (i < text.length) {
      // Insert character before cursor
      el.insertBefore(document.createTextNode(text[i]), cursor);
      i++;
    } else {
      clearInterval(interval);
      // Remove cursor after a delay
      setTimeout(() => cursor.remove(), 1800);
    }
  }, speed);
}

function showSchedGate(letter) {
  schedGate.classList.remove('hidden');
  const target = new Date(letter.unlockDate);
  document.getElementById('schedGateSub').textContent =
    `This letter will open on ${formatDateTime(letter.unlockDate)}.`;

  function tickSched() {
    const diff = target - Date.now();
    if (diff <= 0) {
      clearInterval(schedTimerInterval);
      schedGate.classList.add('hidden');
      showLetterContent(letter);
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    document.getElementById('schedCountdownDisplay').innerHTML = `
      <div class="sched-unit"><span class="sched-val">${pad(d)}</span><span class="sched-lbl">Days</span></div>
      <div class="sched-unit"><span class="sched-val">${pad(h)}</span><span class="sched-lbl">Hours</span></div>
      <div class="sched-unit"><span class="sched-val">${pad(m)}</span><span class="sched-lbl">Mins</span></div>
      <div class="sched-unit"><span class="sched-val">${pad(s)}</span><span class="sched-lbl">Secs</span></div>
    `;
  }
  tickSched();
  schedTimerInterval = setInterval(tickSched, 1000);
}

// — Password unlock —
gateUnlockBtn.addEventListener('click', () => {
  const letter = letters.find(l => l.id === openingLetterId);
  if (!letter) return;
  const entered = gatePasswordInput.value;
  const errEl   = document.getElementById('err-gate');

  if (!entered) { errEl.textContent = 'Please enter the password.'; return; }

  if (simpleHash(entered) === letter.password) {
    errEl.textContent = '';
    pwGate.classList.add('hidden');
    showLetterContent(letter);
  } else {
    errEl.textContent = 'Incorrect password. Try again.';
    gatePasswordInput.value = '';
    gatePasswordInput.classList.add('shake');
    setTimeout(() => gatePasswordInput.classList.remove('shake'), 500);
  }
});

gatePasswordInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') gateUnlockBtn.click();
});

// — Close reader —
function closeLetter() {
  letterReaderOverlay.classList.add('hidden');
  clearInterval(schedTimerInterval);
  openingLetterId = null;
}

document.getElementById('letterReaderClose').addEventListener('click', closeLetter);
document.getElementById('readerCloseBtn2').addEventListener('click', closeLetter);
letterReaderOverlay.addEventListener('click', (e) => {
  if (e.target === letterReaderOverlay) closeLetter();
});

// ==========================================
// INIT
// ==========================================

function init() {
  renderHome();
  renderTimeline();
  renderCountdowns();
  renderLetters();
  renderChecklist();
  renderCustomIdeas();
}

init();
/* Shop data: category tiles (home) and listing pages (category.html).
   All content comes from assets/data/listings.json. To move to a Google Sheet later,
   replace loadData() with a CSV fetch that returns the same { categories, items } shape. */
(function () {
  var DATA_URL = 'assets/data/listings.json';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Images are stored as <base>-600.webp, <base>-1000.webp and <base>.jpg
  function picture(base, alt, sizes, eager) {
    return '<picture>' +
      '<source type="image/webp" srcset="' + esc(base) + '-600.webp 600w, ' + esc(base) + '-1000.webp 1000w" sizes="' + sizes + '">' +
      '<img src="' + esc(base) + '.jpg" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">' +
      '</picture>';
  }

  var euro = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  function priceHtml(item) {
    if (item.price == null || item.price === '') return '';
    return '<p class="piece-price">' + esc(euro.format(item.price)) +
      (item.price_note ? '<small>' + esc(item.price_note) + '</small>' : '') + '</p>';
  }

  function visible(items, catId) {
    return items.filter(function (i) { return i.category === catId && i.status !== 'hidden'; });
  }

  function loadData() {
    return fetch(DATA_URL, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    });
  }

  /* ---------- Home: fill category tile counts ---------- */
  function renderHome(data) {
    document.querySelectorAll('[data-category-count]').forEach(function (el) {
      var id = el.getAttribute('data-category-count');
      var n = visible(data.items, id).filter(function (i) { return i.status !== 'sold'; }).length;
      el.textContent = n > 1 ? n + ' pieces' : n === 1 ? 'Available now' : 'Coming soon';
    });
  }

  /* ---------- Category page ---------- */
  var state = { items: [], profile: '' };

  function renderCategory(data) {
    var params = new URLSearchParams(location.search);
    var catId = params.get('c') || data.categories[0].id;
    var cat = data.categories.filter(function (c) { return c.id === catId; })[0] || data.categories[0];
    state.profile = data.vinted_profile;

    document.title = cat.name + ' — Gulab';
    document.getElementById('catName').textContent = cat.name;
    document.getElementById('catCrumb').textContent = cat.name;
    document.getElementById('catBlurb').textContent = cat.blurb;

    document.getElementById('catTabs').innerHTML = data.categories.map(function (c) {
      return '<a href="category.html?c=' + encodeURIComponent(c.id) + '"' +
        (c.id === cat.id ? ' aria-current="page"' : '') + '>' + esc(c.name) + '</a>';
    }).join('');

    var items = visible(data.items, cat.id).sort(function (a, b) {
      return (a.status === 'sold') - (b.status === 'sold');
    });
    state.items = items;
    var grid = document.getElementById('listing');

    if (!items.length) {
      grid.outerHTML =
        '<div class="empty-state">' +
          '<h2>On its way from India</h2>' +
          '<p>New ' + esc(cat.name.toLowerCase()) + ' are being picked right now. Follow along on Instagram to see them first.</p>' +
          '<a class="btn-outline" href="https://www.instagram.com/lijkesnijer" target="_blank" rel="noopener">Follow on Instagram</a>' +
        '</div>';
      return;
    }

    grid.innerHTML = items.map(function (item, idx) {
      var sold = item.status === 'sold';
      var photos = item.images.length > 1 ? '<span class="piece-photos">' + item.images.length + ' photos</span>' : '';
      return '<article class="piece-card' + (sold ? ' is-sold' : '') + '">' +
        '<div class="piece-image">' +
          picture(item.images[0], (item.image_alts || [])[0] || item.title, '(max-width: 640px) 100vw, 400px', idx < 3) +
          photos + (sold ? '<span class="badge-sold">Sold</span>' : '') +
        '</div>' +
        '<div class="piece-info">' +
          '<span class="piece-label">' + esc(cat.name) + '</span>' +
          '<h3 class="piece-name">' + esc(item.title) + '</h3>' +
          priceHtml(item) +
          '<p class="piece-desc">' + esc(item.description) + '</p>' +
          '<button type="button" class="text-link" data-open="' + idx + '" aria-haspopup="dialog">' +
            'View details <svg width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true"><path d="M1 4h9M6 1l4 3-4 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open]');
      if (btn) openItem(Number(btn.getAttribute('data-open')));
    });

    // Deep link: category.html?c=lunchboxes&item=neelam-tiffin-2-tier
    var deep = params.get('item');
    if (deep) {
      var i = items.map(function (x) { return x.id; }).indexOf(deep);
      if (i > -1) openItem(i);
    }
  }

  /* ---------- Item dialog with gallery ---------- */
  var dialog, current = { item: null, photo: 0 };

  function showPhoto(n) {
    var item = current.item;
    var count = item.images.length;
    current.photo = (n + count) % count;
    var alt = (item.image_alts || [])[current.photo] || item.title;
    dialog.querySelector('.gallery-main').innerHTML = picture(item.images[current.photo], alt, '(max-width: 760px) 100vw, 600px', true);
    dialog.querySelectorAll('.gallery-thumbs button').forEach(function (b, i) {
      b.setAttribute('aria-current', i === current.photo ? 'true' : 'false');
    });
  }

  function openItem(idx) {
    var item = state.items[idx];
    current.item = item;
    var many = item.images.length > 1;
    var link = item.vinted || state.profile;
    var sold = item.status === 'sold';

    dialog.innerHTML =
      '<button type="button" class="dialog-close" aria-label="Close">&times;</button>' +
      '<div class="item-dialog-inner">' +
        '<div class="gallery">' +
          '<div class="gallery-main"></div>' +
          (many ?
            '<button type="button" class="gallery-nav gallery-prev" aria-label="Previous photo">&#8249;</button>' +
            '<button type="button" class="gallery-nav gallery-next" aria-label="Next photo">&#8250;</button>' +
            '<div class="gallery-thumbs">' + item.images.map(function (b, i) {
              return '<button type="button" aria-label="Photo ' + (i + 1) + '" data-photo="' + i + '">' +
                '<img src="' + esc(b) + '-600.webp" alt="" loading="lazy"></button>';
            }).join('') + '</div>'
          : '') +
        '</div>' +
        '<div class="item-details">' +
          '<h2 id="itemTitle">' + esc(item.title) + '</h2>' +
          priceHtml(item) +
          '<p>' + esc(item.description) + '</p>' +
          (sold
            ? '<p class="item-help">This piece has found a home. Follow on Instagram to see new arrivals first.</p>'
            : '<a class="btn-primary" href="' + esc(link) + '" target="_blank" rel="noopener">' +
                (item.vinted ? 'Buy on Vinted' : 'Shop on Vinted') +
                ' <svg width="14" height="10" viewBox="0 0 14 10" fill="none" aria-hidden="true"><path d="M1 5h12M8 1l5 4-5 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
              '<p class="item-help">Questions, or want it reserved? Message Roos on Vinted or <a href="https://www.instagram.com/lijkesnijer" target="_blank" rel="noopener" style="text-decoration:underline">Instagram</a>.</p>') +
        '</div>' +
      '</div>';
    dialog.setAttribute('aria-labelledby', 'itemTitle');
    showPhoto(0);
    document.body.style.overflow = 'hidden';
    dialog.showModal();
    dialog.querySelector('.dialog-close').focus();

    var url = new URL(location.href);
    url.searchParams.set('item', item.id);
    history.replaceState(null, '', url);
  }

  function setupDialog() {
    dialog = document.getElementById('itemDialog');
    if (!dialog) return;
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.closest('.dialog-close')) { dialog.close(); return; }
      if (e.target.closest('.gallery-prev')) showPhoto(current.photo - 1);
      if (e.target.closest('.gallery-next')) showPhoto(current.photo + 1);
      var t = e.target.closest('[data-photo]');
      if (t) showPhoto(Number(t.getAttribute('data-photo')));
    });
    dialog.addEventListener('keydown', function (e) {
      if (!current.item || current.item.images.length < 2) return;
      if (e.key === 'ArrowLeft') showPhoto(current.photo - 1);
      if (e.key === 'ArrowRight') showPhoto(current.photo + 1);
    });
    // Swipe on touch screens
    var startX = null;
    dialog.addEventListener('touchstart', function (e) {
      if (e.target.closest('.gallery-main')) startX = e.touches[0].clientX;
    }, { passive: true });
    dialog.addEventListener('touchend', function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) showPhoto(current.photo + (dx < 0 ? 1 : -1));
      startX = null;
    });
    dialog.addEventListener('close', function () {
      document.body.style.overflow = '';
      var url = new URL(location.href);
      url.searchParams.delete('item');
      history.replaceState(null, '', url);
    });
  }

  /* ---------- Boot ---------- */
  var isCategoryPage = !!document.getElementById('listing');
  setupDialog();
  loadData().then(function (data) {
    if (isCategoryPage) renderCategory(data); else renderHome(data);
  }).catch(function () {
    if (isCategoryPage) {
      document.getElementById('listing').outerHTML =
        '<p class="load-error">Couldn’t load the pieces right now. You can browse everything on <a href="https://www.vinted.nl/member/27795555-roos123456" style="text-decoration:underline">Vinted</a>.</p>';
    } else {
      document.querySelectorAll('[data-category-count]').forEach(function (el) { el.textContent = ''; });
    }
  });
})();

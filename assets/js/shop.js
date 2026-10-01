/* Gulāb shop: renders home tiles + "New in", category listings and the product view.
   All content comes from assets/data/listings.json (single source of truth). */
(function () {
  'use strict';

  var DATA_URL = 'assets/data/listings.json';
  var ARROW_S = '<svg width="11" height="8" viewBox="0 0 11 8" fill="none" aria-hidden="true"><path d="M1 4h9M6 1l4 3-4 3" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pic(base, alt, sizes, eager) {
    return '<picture>' +
      '<source type="image/webp" srcset="' + esc(base) + '-600.webp 600w, ' + esc(base) + '-1000.webp 1000w" sizes="' + sizes + '">' +
      '<img src="' + esc(base) + '.jpg" alt="' + esc(alt) + '"' + (eager ? '' : ' loading="lazy"') + ' decoding="async">' +
      '</picture>';
  }

  var euroFmt = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
  function price(item) { return item.price == null || item.price === '' ? '' : euroFmt.format(item.price); }

  function byId(list, id) { for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i]; return null; }
  function visible(data, catId) {
    return data.items.filter(function (i) { return i.status !== 'hidden' && (!catId || i.category === catId); });
  }
  function forSale(data, catId) {
    return visible(data, catId).filter(function (i) { return i.status !== 'sold'; });
  }
  function itemUrl(item) { return 'category.html?c=' + encodeURIComponent(item.category) + '&item=' + encodeURIComponent(item.id); }
  function craftOf(data, key) { return (data.crafts || {})[key] || null; }

  /* ---------- Shared: product card ---------- */
  function card(data, item, opts) {
    opts = opts || {};
    var cat = byId(data.categories, item.category) || { name: '' };
    var craft = craftOf(data, item.craft);
    var origin = item.origin || cat.name;
    var technique = item.technique || (craft ? craft.name : '');
    var sold = item.status === 'sold';
    var many = item.images.length > 1;
    return '<a class="card' + (sold ? ' is-sold' : '') + '" href="' + itemUrl(item) + '" data-item="' + esc(item.id) + '">' +
      '<div class="well well--4x5">' +
        pic(item.images[0], (item.image_alts || [])[0] || item.title, '(max-width: 560px) 100vw, (max-width: 1100px) 33vw, 25vw') +
        (many && !opts.noChip ? '<span class="chip chip--bl">' + item.images.length + ' photos</span>' : '') +
        (sold ? '<span class="badge-sold">Sold</span>' : '') +
      '</div>' +
      '<div class="card-body">' +
        '<span class="mono">' + esc(origin) + '</span>' +
        '<div class="card-row"><span class="card-title">' + esc(item.title) + '</span>' +
          (price(item) ? '<span class="card-price">' + price(item) + '</span>' : '') + '</div>' +
        (technique && !opts.noTech ? '<span class="card-tech">' + esc(technique) + '</span>' : '') +
      '</div>' +
    '</a>';
  }

  function countLabel(n) { return n > 1 ? n + ' pieces' : n === 1 ? 'Available now' : 'Coming soon'; }

  function applyContact(data) {
    var wa = data.contact && data.contact.whatsapp;
    if (!wa) return;
    document.querySelectorAll('[data-whatsapp]').forEach(function (a) { a.href = wa; a.hidden = false; });
  }

  /* ---------- Home ---------- */
  function renderHome(data) {
    var tiles = document.getElementById('categoryTiles');
    tiles.innerHTML = data.categories.map(function (c, i) {
      var n = forSale(data, c.id).length;
      return '<a class="tile" href="category.html?c=' + encodeURIComponent(c.id) + '">' +
        '<div class="well well--4x5">' + pic(c.cover, c.cover_alt || c.name, '(max-width: 760px) 100vw, 33vw') + '</div>' +
        '<div class="tile-row">' +
          '<span class="tile-num">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<span class="tile-name">' + esc(c.name) + '</span>' +
          '<span class="mono">' + countLabel(n) + '</span>' +
        '</div>' +
        '<span class="tile-blurb">' + esc(c.blurb) + '</span>' +
      '</a>';
    }).join('');

    var featured = forSale(data).filter(function (i) { return i.featured; }).slice(0, 4);
    if (featured.length < 4) {
      featured = featured.concat(forSale(data).filter(function (i) { return featured.indexOf(i) < 0; })).slice(0, 4);
    }
    var newIn = document.getElementById('newIn');
    if (featured.length) {
      newIn.innerHTML = featured.map(function (i) { return card(data, i, { noChip: true }); }).join('');
      var firstWithItems = data.categories.filter(function (c) { return forSale(data, c.id).length; })[0];
      if (firstWithItems) document.getElementById('viewAll').href = 'category.html?c=' + firstWithItems.id;
    } else {
      document.getElementById('newInSection').hidden = true;
    }
  }

  /* ---------- Category page ---------- */
  var app, DATA, gallery = { item: null, i: 0 };

  function setNavCurrent(catId) {
    document.querySelectorAll('.nav-links a').forEach(function (a) {
      if (a.getAttribute('href') === 'category.html?c=' + catId) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  function renderCategory(cat) {
    var data = DATA;
    var items = visible(data, cat.id).sort(function (a, b) { return (a.status === 'sold') - (b.status === 'sold'); });
    document.title = cat.name + ' — Gulāb';
    setNavCurrent(cat.id);

    var tabs = data.categories.map(function (c) {
      var k = forSale(data, c.id).length;
      return '<a class="tab" href="category.html?c=' + encodeURIComponent(c.id) + '"' + (c.id === cat.id ? ' aria-current="page"' : '') + '>' +
        esc(c.name) + '<span class="tab-count">' + (k ? k : 'soon') + '</span></a>';
    }).join('');

    var body;
    if (items.length) {
      body = '<section class="container cat-list" aria-label="' + esc(cat.name) + '">' +
        '<div class="toolbar"><span class="count">' + (items.length === 1 ? '1 piece' : items.length + ' pieces') + '</span>' +
        '<span>Shipping costs shown at checkout on Vinted</span></div>' +
        '<div class="grid-cards grid-cards--wide">' + items.map(function (i) { return card(data, i); }).join('') + '</div>' +
      '</section>';
    } else {
      var craft = craftOf(data, cat.craft);
      body = '<section class="container empty"><div class="empty-box">' +
        '<div class="blockprint-field" aria-hidden="true"></div>' +
        '<div class="empty-text">' +
          (craft ? '<span class="eyebrow eyebrow--gold">' + esc(craft.name) + ' · ' + esc(craft.region) + '</span>' : '') +
          '<h2>On its way from India</h2>' +
          '<p>New ' + esc(cat.name.toLowerCase()) + ' are being picked right now. Follow along on Instagram to see them first.</p>' +
          '<a class="btn btn--cream" href="' + esc(data.contact.instagram) + '" target="_blank" rel="noopener">Follow on Instagram ↗</a>' +
        '</div></div></section>';
    }

    app.innerHTML =
      '<section class="container cat-head">' +
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(cat.name) + '</span></nav>' +
        '<div class="cat-title"><h1>' + esc(cat.name) + '</h1><p class="lead">' + esc(cat.blurb) + '</p></div>' +
        '<nav class="tabs" aria-label="Categories">' + tabs + '</nav>' +
      '</section>' + body;
  }

  /* ---------- Product view ---------- */
  function renderProduct(item) {
    var data = DATA;
    var cat = byId(data.categories, item.category) || data.categories[0];
    var craft = craftOf(data, item.craft) || craftOf(data, cat.craft);
    var many = item.images.length > 1;
    var sold = item.status === 'sold';
    var link = item.vinted || data.contact.vinted;
    document.title = item.title + ' — Gulāb';
    setNavCurrent(cat.id);
    gallery = { item: item, i: 0 };

    var prov = [['Maker', item.maker], ['Origin', item.origin], ['Technique', item.technique]].filter(function (r) { return r[1]; });
    var acc = [['Materials', item.materials], ['Size', item.size], ['Care', item.care], ['Shipping & returns', data.shipping_note]].filter(function (r) { return r[1]; });
    var stock = sold ? 'Sold' : item.stock_note;

    var wa = data.contact.whatsapp;
    var ask = wa
      ? '<a class="btn btn--secondary btn--block" href="' + esc(wa) + '" target="_blank" rel="noopener">Ask Roos or reserve on WhatsApp</a>'
      : '<a class="btn btn--secondary btn--block" href="' + esc(data.contact.instagram) + '" target="_blank" rel="noopener">Ask Roos or reserve on Instagram</a>';

    var related = visible(data, item.category).filter(function (x) { return x.id !== item.id && x.status !== 'sold'; });
    var relatedTitle = 'More ' + cat.name.toLowerCase();
    if (!related.length) { related = forSale(data).filter(function (x) { return x.id !== item.id; }); relatedTitle = 'You may also like'; }
    related = related.slice(0, 4);

    app.innerHTML =
      '<section class="container product">' +
        '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">/</span>' +
          '<a href="category.html?c=' + encodeURIComponent(cat.id) + '">' + esc(cat.name) + '</a><span aria-hidden="true">/</span>' +
          '<span aria-current="page">' + esc(item.title) + '</span></nav>' +
        '<div class="product-grid">' +
          '<div class="gallery" aria-roledescription="carousel" aria-label="Photos of ' + esc(item.title) + '">' +
            '<div class="well well--4x5 gallery-main" id="galleryMain"></div>' +
            (many ? '<div class="thumbs" role="group" aria-label="Choose photo">' + item.images.map(function (b, i) {
              return '<button type="button" class="thumb" data-photo="' + i + '" aria-label="Photo ' + (i + 1) + '"><img src="' + esc(b) + '-600.webp" alt="" loading="lazy"></button>';
            }).join('') + '</div>' : '') +
          '</div>' +
          '<div class="details">' +
            '<div class="details-head">' +
              '<span class="eyebrow eyebrow--saffron">' + esc(cat.name) + '</span>' +
              '<h1>' + esc(item.title) + '</h1>' +
              (price(item) ? '<div class="price-line"><span class="price-main">' + price(item) + '</span>' + (item.unit ? '<span class="price-unit">' + esc(item.unit) + '</span>' : '') + '</div>' : '') +
              (stock ? '<span class="stock' + (sold ? ' stock--sold' : '') + '">' + esc(stock) + '</span>' : '') +
            '</div>' +
            '<p class="desc">' + esc(item.description) + '</p>' +
            (prov.length ? '<div><div class="band-light" aria-hidden="true"></div><dl class="prov">' + prov.map(function (r) {
              return '<dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd>';
            }).join('') + '</dl></div>' : '') +
            '<div class="ctas">' +
              (sold ? '' : '<a class="btn btn--primary btn--block" href="' + esc(link) + '" target="_blank" rel="noopener">' + (item.vinted ? 'Buy on Vinted' : 'Shop on Vinted') + ' ↗</a>') +
              ask +
              '<span class="cta-note">Payment and buyer protection through Vinted · Ships across the EU</span>' +
            '</div>' +
            (acc.length ? '<div class="accordion">' + acc.map(function (r, i) {
              var id = 'acc-' + i;
              return '<div class="acc-item"><button type="button" class="acc-btn" aria-expanded="' + (i === 0) + '" aria-controls="' + id + '">' + esc(r[0]) +
                '<span class="acc-sign" aria-hidden="true">' + (i === 0 ? '−' : '+') + '</span></button>' +
                '<p class="acc-panel" id="' + id + '"' + (i === 0 ? '' : ' hidden') + '>' + esc(r[1]) + '</p></div>';
            }).join('') + '</div>' : '') +
          '</div>' +
        '</div>' +
      '</section>' +
      (craft ? '<section class="dark">' +
        '<div class="band-dark" aria-hidden="true"></div>' +
        '<div class="container craft-band-grid"><div><span class="eyebrow eyebrow--gold">About the craft · ' + esc(craft.region) + '</span>' +
        '<h2>' + esc(craft.name) + '</h2></div><p>' + esc(craft.text) + '</p></div>' +
        '<div class="band-dark" aria-hidden="true"></div></section>' : '') +
      (related.length ? '<section class="container related"><h2>' + esc(relatedTitle) + '</h2><div class="grid-cards">' +
        related.map(function (x) { return card(data, x, { noTech: true, noChip: true }); }).join('') + '</div></section>' : '');

    showPhoto(0);
  }

  function showPhoto(n) {
    var item = gallery.item;
    if (!item) return;
    var count = item.images.length;
    gallery.i = ((n % count) + count) % count;
    var alt = (item.image_alts || [])[gallery.i] || item.title;
    var main = document.getElementById('galleryMain');
    main.innerHTML = pic(item.images[gallery.i], alt, '(max-width: 860px) 100vw, 50vw', true) +
      (count > 1 ?
        '<button type="button" class="gallery-btn gallery-prev" aria-label="Previous photo">‹</button>' +
        '<button type="button" class="gallery-btn gallery-next" aria-label="Next photo">›</button>' +
        '<span class="chip chip--br" aria-live="polite">' + (gallery.i + 1) + ' / ' + count + '</span>' : '');
    document.querySelectorAll('.thumb').forEach(function (t, i) {
      t.setAttribute('aria-current', i === gallery.i ? 'true' : 'false');
    });
  }

  /* ---------- Router (category.html) ---------- */
  function route(scroll) {
    var p = new URLSearchParams(location.search);
    var cat = byId(DATA.categories, p.get('c')) || DATA.categories[0];
    var item = p.get('item') && byId(DATA.items, p.get('item'));
    gallery = { item: null, i: 0 };
    if (item && item.status !== 'hidden') renderProduct(item); else renderCategory(cat);
    if (scroll) window.scrollTo(0, 0);
  }

  function bindCategoryPage() {
    // In-page navigation for cards, tabs and breadcrumbs (Back button keeps working)
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest('a[href^="category.html"]');
      if (a && !a.target) {
        e.preventDefault();
        if (a.getAttribute('href') !== location.pathname.split('/').pop() + location.search) {
          history.pushState(null, '', a.getAttribute('href'));
        }
        route(true);
        return;
      }
      if (e.target.closest('.gallery-prev')) showPhoto(gallery.i - 1);
      else if (e.target.closest('.gallery-next')) showPhoto(gallery.i + 1);
      var t = e.target.closest('.thumb');
      if (t) showPhoto(Number(t.getAttribute('data-photo')));
      var acc = e.target.closest('.acc-btn');
      if (acc) {
        var open = acc.getAttribute('aria-expanded') === 'true';
        document.querySelectorAll('.acc-btn').forEach(function (b) {
          b.setAttribute('aria-expanded', 'false');
          b.querySelector('.acc-sign').textContent = '+';
          document.getElementById(b.getAttribute('aria-controls')).hidden = true;
        });
        if (!open) {
          acc.setAttribute('aria-expanded', 'true');
          acc.querySelector('.acc-sign').textContent = '−';
          document.getElementById(acc.getAttribute('aria-controls')).hidden = false;
        }
      }
    });
    window.addEventListener('popstate', function () { route(true); });
    document.addEventListener('keydown', function (e) {
      if (!gallery.item || gallery.item.images.length < 2) return;
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === 'ArrowLeft') showPhoto(gallery.i - 1);
      if (e.key === 'ArrowRight') showPhoto(gallery.i + 1);
    });
    var startX = null;
    document.addEventListener('touchstart', function (e) {
      startX = e.target.closest('#galleryMain') ? e.touches[0].clientX : null;
    }, { passive: true });
    document.addEventListener('touchend', function (e) {
      if (startX == null) return;
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) showPhoto(gallery.i + (dx < 0 ? 1 : -1));
      startX = null;
    });
  }

  /* ---------- Boot ---------- */
  app = document.getElementById('app');
  var isCategoryPage = !!app;

  fetch(DATA_URL, { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(function (data) {
      DATA = data;
      applyContact(data);
      if (isCategoryPage) {
        app.classList.remove('container', 'cat-head');
        route(false);
        bindCategoryPage();
      } else {
        renderHome(data);
      }
    })
    .catch(function () {
      if (isCategoryPage) {
        app.innerHTML = '<p class="container load-error">Couldn’t load the pieces right now. You can browse everything on <a href="https://www.vinted.nl/member/27795555-roos123456">Vinted</a>.</p>';
      } else {
        var s = document.getElementById('newInSection');
        if (s) s.hidden = true;
      }
    });
})();

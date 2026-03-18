/* ========================================
   Affective Information Media Lab — Main JS
   ======================================== */

(function () {
  'use strict';

  // --- Dark Mode ---
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const html = document.documentElement;

  function getPreferredTheme() {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';

    // Swap logos
    const logoSrc = theme === 'dark' ? 'assets/img/logo_dark.png' : 'assets/img/logo_light.png';
    // Handle relative paths for /en/ page
    const prefix = document.documentElement.lang === 'en' ? '../' : '';
    const navLogo = document.getElementById('nav-logo');
    const heroLogo = document.getElementById('hero-logo');
    const footerLogo = document.getElementById('footer-logo');
    if (navLogo) navLogo.src = prefix + logoSrc;
    if (heroLogo) heroLogo.src = prefix + logoSrc;
    if (footerLogo) footerLogo.src = prefix + logoSrc;
  }

  applyTheme(getPreferredTheme());

  themeToggle.addEventListener('click', function () {
    const current = html.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });

  // --- Hamburger Menu ---
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', function () {
    navLinks.classList.toggle('open');
  });

  // Close menu on link click
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
    });
  });

  // --- Scroll Spy ---
  const nav = document.getElementById('site-nav');
  const sections = document.querySelectorAll('.section, .hero');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  function onScroll() {
    // Nav shadow
    if (window.scrollY > 10) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Active section
    let current = '';
    sections.forEach(function (section) {
      var top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navAnchors.forEach(function (a) {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + current) {
        a.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Intersection Observer (Fade-in) ---
  var fadeEls = document.querySelectorAll('.fade-in');
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    fadeEls.forEach(function (el) { observer.observe(el); });
  } else {
    fadeEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // --- Load Publications ---
  var pubContainer = document.getElementById('publications-container');
  if (pubContainer) {
    var isEn = document.documentElement.lang === 'en';
    var pubPath = isEn ? '../data/publications.json' : 'data/publications.json';

    fetch(pubPath)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.length) {
          pubContainer.innerHTML = '<div class="empty-state">' +
            (isEn ? 'No publications yet.' : 'まだ業績がありません。') + '</div>';
          return;
        }

        // Group by year
        var byYear = {};
        data.forEach(function (pub) {
          var y = pub.year || 'Other';
          if (!byYear[y]) byYear[y] = [];
          byYear[y].push(pub);
        });

        var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
        var html = '';

        years.forEach(function (year) {
          html += '<div class="pub-year-group">';
          html += '<div class="pub-year">' + year + '</div>';
          html += '<ul class="pub-list">';
          byYear[year].forEach(function (pub) {
            html += '<li class="pub-item">';
            html += '<div class="pub-title">' + escapeHtml(pub.title) + '</div>';
            html += '<div class="pub-authors">' + escapeHtml(pub.authors) + '</div>';
            html += '<div class="pub-venue">' + escapeHtml(pub.venue) + '</div>';
            if (pub.doi) {
              html += '<div class="pub-doi"><a href="https://doi.org/' + encodeURI(pub.doi) + '" target="_blank" rel="noopener">DOI: ' + escapeHtml(pub.doi) + '</a></div>';
            }
            html += '</li>';
          });
          html += '</ul></div>';
        });

        pubContainer.innerHTML = html;
      })
      .catch(function () {
        pubContainer.innerHTML = '<div class="empty-state">' +
          (isEn ? 'Could not load publications.' : '業績データの読み込みに失敗しました。') + '</div>';
      });
  }

  // --- Load News ---
  var newsContainer = document.getElementById('news-container');
  if (newsContainer) {
    var isEnNews = document.documentElement.lang === 'en';
    var newsPath = isEnNews ? '../data/news.json' : 'data/news.json';

    fetch(newsPath)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (!data.length) {
          newsContainer.innerHTML = '<div class="empty-state">' +
            (isEnNews ? 'No news yet.' : 'まだニュースがありません。') + '</div>';
          return;
        }

        var html = '<div class="news-timeline">';
        data.forEach(function (item) {
          var tagClass = item.tag || 'news';
          var tagLabel = isEnNews ? (item.tag_label_en || item.tag_label || item.tag || '') : (item.tag_label || item.tag || '');
          var title = isEnNews ? (item.title_en || item.title) : item.title;
          var body = isEnNews ? (item.body_en || item.body) : item.body;
          html += '<div class="news-item">';
          html += '<div class="news-date">' + escapeHtml(item.date) + '</div>';
          html += '<div class="news-content">';
          html += '<h3>' + escapeHtml(title);
          if (tagLabel) {
            html += ' <span class="news-tag ' + escapeHtml(tagClass) + '">' + escapeHtml(tagLabel) + '</span>';
          }
          html += '</h3>';
          if (body) {
            html += '<p>' + escapeHtml(body) + '</p>';
          }
          html += '</div></div>';
        });
        html += '</div>';

        newsContainer.innerHTML = html;
      })
      .catch(function () {
        newsContainer.innerHTML = '<div class="empty-state">' +
          (isEnNews ? 'Could not load news.' : 'ニュースの読み込みに失敗しました。') + '</div>';
      });
  }

  // --- Utility ---
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
})();

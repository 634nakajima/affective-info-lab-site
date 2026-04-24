/* ========================================
   Affective Information Media Lab — Main JS (Amber Redesign)
   ======================================== */

(function () {
  'use strict';

  // --- Hamburger Menu ---
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });
  }

  // --- Scroll Spy ---
  var nav = document.getElementById('site-nav');
  var sections = document.querySelectorAll('.section, .hero');
  var navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function onScroll() {
    if (window.scrollY > 10) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');

    var current = 'hero';
    sections.forEach(function (section) {
      if (window.scrollY >= section.offsetTop - 90) {
        current = section.id;
      }
    });
    navAnchors.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Fade-up (IntersectionObserver with stagger) ---
  if ('IntersectionObserver' in window) {
    var fadeObs = new IntersectionObserver(function (entries) {
      var idx = 0;
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          (function (el, delay) {
            setTimeout(function () { el.classList.add('visible'); }, delay);
          })(entry.target, idx * 80);
          idx++;
          fadeObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.fade-up').forEach(function (el) {
      fadeObs.observe(el);
    });
  } else {
    document.querySelectorAll('.fade-up').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // --- Typewriter (Hero) ---
  var typewriterEl = document.getElementById('typewriter');
  var cursorEl = document.getElementById('typewriter-cursor');
  if (typewriterEl) {
    var text = 'Practice-based Research';
    var charIdx = 0;
    setTimeout(function () {
      var iv = setInterval(function () {
        charIdx++;
        typewriterEl.textContent = text.slice(0, charIdx);
        if (charIdx >= text.length) clearInterval(iv);
      }, 42);
    }, 700);
  }

  // --- Terminal Animation (Hero right column) ---
  var wordEl = document.getElementById('term-word');
  var blockEl = document.getElementById('term-block');
  var clockEl = document.getElementById('term-clock');
  var sensorEls = document.querySelectorAll('.sensor-tag');

  if (wordEl && clockEl) {
    var words = ['MULTIMODAL', 'CROSSMODAL', 'ENACTIVE', 'HAPSONIC·ART', 'DIGITAL·KIN.', 'SOUND+TOUCH', 'AFFECT+SENSE'];
    var frame = 0;

    function updateClock() {
      var d = new Date();
      clockEl.textContent =
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0') + ':' +
        String(d.getSeconds()).padStart(2, '0');
    }
    updateClock();
    setInterval(updateClock, 1000);

    setInterval(function () {
      frame++;
      var wordIdx = Math.floor(frame / 22) % words.length;
      var charCount = Math.min(frame % 22, words[wordIdx].length);
      var w = words[wordIdx];
      wordEl.textContent = w.slice(0, charCount);
      if (blockEl) {
        blockEl.classList.toggle('hidden', charCount >= w.length);
      }
      var activeIdx = Math.floor(frame / 14) % sensorEls.length;
      sensorEls.forEach(function (el, i) {
        el.classList.toggle('active', i === activeIdx);
      });
    }, 110);
  }

  // --- Toggle Projects ---
  var toggleBtn = document.getElementById('toggle-projects-btn');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var target = document.getElementById(toggleBtn.dataset.target);
      if (!target) return;
      var collapsed = target.classList.toggle('collapsed');
      toggleBtn.textContent = collapsed
        ? (toggleBtn.dataset.labelShow || 'すべて表示 ▼')
        : (toggleBtn.dataset.labelHide || '閉じる ▲');
    });
  }

  // --- Helper: observe newly added fade-up elements ---
  function observeFadeUp(container) {
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        var idx = 0;
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            (function (el, delay) {
              setTimeout(function () { el.classList.add('visible'); }, delay);
            })(entry.target, idx * 80);
            idx++;
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });
      container.querySelectorAll('.fade-up').forEach(function (el) { obs.observe(el); });
    } else {
      container.querySelectorAll('.fade-up').forEach(function (el) { el.classList.add('visible'); });
    }
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

        var byYear = {};
        data.forEach(function (pub) {
          var y = pub.year || 'Other';
          if (!byYear[y]) byYear[y] = [];
          byYear[y].push(pub);
        });

        var years = Object.keys(byYear).sort(function (a, b) { return b - a; });
        var html = '';

        years.forEach(function (year) {
          html += '<div class="pub-year-group fade-up">';
          html += '<div class="pub-year">' + year + '</div>';
          html += '<ul class="pub-list">';
          byYear[year].forEach(function (pub) {
            html += '<li class="pub-item">';
            html += '<div class="pub-title">' + escapeHtml(pub.title) + '</div>';
            html += '<div class="pub-authors">' + escapeHtml(pub.authors);
            html += ' <span class="pub-venue">— ' + escapeHtml(pub.venue) + '</span></div>';
            if (pub.doi) {
              html += '<div><a href="https://doi.org/' + encodeURI(pub.doi) +
                '" target="_blank" rel="noopener" style="font-size:0.78rem;color:var(--fg2)">DOI: ' +
                escapeHtml(pub.doi) + '</a></div>';
            }
            html += '</li>';
          });
          html += '</ul></div>';
        });

        pubContainer.innerHTML = html;
        observeFadeUp(pubContainer);
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
          var tagLabel = isEnNews
            ? (item.tag_label_en || item.tag_label || item.tag || '')
            : (item.tag_label || item.tag || '');
          var title = isEnNews ? (item.title_en || item.title) : item.title;
          var body  = isEnNews ? (item.body_en  || item.body)  : item.body;
          html += '<div class="news-item fade-up">';
          html += '<div class="news-date">' + escapeHtml(item.date) + '</div>';
          html += '<div class="news-content">';
          html += '<h3>' + escapeHtml(title);
          if (tagLabel) {
            html += ' <span class="news-tag">' + escapeHtml(tagLabel) + '</span>';
          }
          html += '</h3>';
          if (body) html += '<p>' + escapeHtml(body) + '</p>';
          html += '</div></div>';
        });
        html += '</div>';
        newsContainer.innerHTML = html;
        observeFadeUp(newsContainer);
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

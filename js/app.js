/* 구몬학습 태블릿 프로토타입 — 전시 체험용
   - 1133×744 고정 캔버스를 화면에 맞춰 통째로 확대·축소 (레이아웃이 깨지지 않음)
   - 화면 디자인은 Figma에서 2배 해상도로 내보낸 이미지, 움직이는 부분만 코드 */
(() => {
  'use strict';

  const W = 1133, H = 744;
  const IDLE_MS = 150 * 1000;          // 아무도 만지지 않으면 처음 화면으로
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const stage = $('#stage');

  /* ---------- 1. 스케일링 ---------- */
  let scale = 1;
  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight;
    scale = Math.min(vw / W, vh / H);
    const x = Math.round((vw - W * scale) / 2), y = Math.round((vh - H * scale) / 2);
    stage.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    $('#rotate').hidden = !(vh > vw * 1.05 && Math.min(vw, vh) < 1100);
    resizeInk();
    layoutHome();
  }
  window.addEventListener('resize', fit);
  window.addEventListener('orientationchange', () => setTimeout(fit, 250));
  // 핀치·더블탭 확대, 길게 누르기 메뉴 방지
  ['gesturestart', 'gesturechange', 'gestureend'].forEach(t => document.addEventListener(t, e => e.preventDefault(), { passive: false }));
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault(), { passive: false });
  document.addEventListener('touchmove', e => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

  /* ---------- 2. 정적 화면 정의 (좌표는 Figma 1x 기준) ---------- */
  const LNB = { main: 104, schedule: 164, books: 224, my: 284 };
  const lnb = cur => Object.entries(LNB).filter(([k]) => k !== cur)
    .map(([k, y]) => ({ x: 16, y, w: 191, h: 52, r: 12, go: k }));
  const profileCard = { x: 20, y: 666, w: 176, h: 56, r: 12, go: 'my' };

  const abs = p => new URL(p, location.href).href;
  const HOVER = {"main": {"hover": [1, 1, 1, 0, 1, 0, 1, 0], "pressed": [1, 1, 1, 0, 1, 0, 1, 0]}, "schedule": {"hover": [1, 1, 1, 0, 1, 1, 1, 1], "pressed": [1, 1, 1, 0, 1, 1, 1, 1]}, "schedule_w1": {"hover": [1, 1, 1, 0, 1, 1, 1], "pressed": [1, 1, 1, 0, 1, 1, 1]}, "schedule_w3": {"hover": [1, 1, 1, 0, 1, 1, 1], "pressed": [1, 1, 1, 0, 1, 1, 1]}, "books": {"hover": [1, 1, 1, 0, 1], "pressed": [1, 1, 1, 0, 1]}, "my": {"hover": [1, 1, 1, 0, 0, 0, 0, 1], "pressed": [1, 1, 1, 0, 0, 0, 0, 1]}, "profile": {"hover": [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1], "pressed": [1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1]}};

  const SCREENS = {
    app:      { img: 'img/app.jpg', hot: [{ x: 899, y: 322, w: 76, h: 104, r: 18, go: 'splash', nofb: true }] },
    splash:   { img: 'img/splash.png', bar: true, next: 'main', charVideo: true },
    loading:  { img: 'img/loading.png', bar: true, next: 'video', charVideo: true },
    main:     { img: 'img/main.png', hot: [...lnb('main'), profileCard,
                { x: 797, y: 644, w: 272, h: 52, r: 12, go: 'loading' },
                { x: 668, y: 322, w: 74, h: 30, r: 8, go: 'schedule' },
                { x: 289, y: 359, w: 216, h: 52, r: 12, go: 'books' },
                { x: 517, y: 359, w: 216, h: 52, r: 12, go: 'books' }] },
    schedule: { img: 'img/schedule.png', hot: [...lnb('schedule'), profileCard,
                { x: 905, y: 50, w: 28, h: 28, r: 14, go: 'schedule_w1' },
                { x: 1002, y: 50, w: 28, h: 28, r: 14, go: 'schedule_w3' },
                { x: 1044, y: 44, w: 49, h: 40, r: 10 },
                { x: 648, y: 502, w: 51, h: 32, r: 8, go: 'loading' }] },
    schedule_w1: { img: 'img/schedule_w1.png', hot: [...lnb('schedule'), profileCard,
                { x: 1002, y: 50, w: 28, h: 28, r: 14, go: 'schedule' },
                { x: 1044, y: 44, w: 49, h: 40, r: 10, go: 'schedule' },
                { x: 648, y: 502, w: 51, h: 32, r: 8, go: 'loading' }] },
    schedule_w3: { img: 'img/schedule_w3.png', hot: [...lnb('schedule'), profileCard,
                { x: 905, y: 50, w: 28, h: 28, r: 14, go: 'schedule' },
                { x: 1044, y: 44, w: 49, h: 40, r: 10, go: 'schedule' },
                { x: 648, y: 502, w: 51, h: 32, r: 8, go: 'loading' }] },
    books:    { img: 'img/books.png', hot: [...lnb('books'), profileCard,
                { x: 829, y: 650, w: 239, h: 48, r: 12, go: 'loading' }] },
    my:       { img: 'img/my.png', hot: [...lnb('my'),
                { x: 646, y: 128, w: 92, h: 32, r: 8, go: 'profile' },
                { x: 280, y: 556, w: 380, h: 44, r: 10, modal: 'soon' },   // 학부모 리포트
                { x: 280, y: 611, w: 380, h: 44, r: 10, modal: 'soon' },   // 학습 기기 관리
                { x: 690, y: 611, w: 380, h: 44, r: 10, modal: 'soon' },   // 고객센터
                { x: 284, y: 670, w: 68, h: 36, r: 8, toast: '프로토타입에서는 로그아웃할 수 없어요' }],
                toggle: { x: 1021, y: 565 } },
    profile:  { img: 'img/profile.png', hot: [...lnb('my').map(h => ({ ...h, modal: 'leave', go: undefined, then: h.go })),
                { x: 264, y: 38, w: 40, h: 40, r: 12, modal: 'leave' },
                { x: 889, y: 656, w: 70, h: 44, r: 12, modal: 'leave' },
                { x: 969, y: 656, w: 96, h: 44, r: 12, save: true, dark: true }],
                options: true },
  };

  const screensEl = $('#screens');
  const built = {};
  function buildScreen(name) {
    const def = SCREENS[name];
    const sec = document.createElement('section');
    sec.className = 'screen'; sec.dataset.screen = name; sec.hidden = true;
    const bg = new Image(); bg.className = 'bg'; bg.src = def.img; bg.alt = ''; bg.draggable = false; bg.decoding = 'async';
    sec.appendChild(bg);
    if (def.charVideo) {
      sec.insertAdjacentHTML('beforeend', '<video class="char-video" src="media/loading.mp4" poster="media/loading.jpg" muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture></video>');
    }
    if (def.bar) { const b = document.createElement('div'); b.className = 'bar'; b.innerHTML = '<i></i>'; sec.appendChild(b); }
    (def.hot || []).forEach(h => {
      const b = document.createElement('button');
      b.className = 'hit' + (h.dark ? ' dark' : '') + (h.nofb ? ' nofb' : '');
      Object.assign(b.style, { left: h.x + 'px', top: h.y + 'px', width: h.w + 'px', height: h.h + 'px', borderRadius: (h.r ?? 10) + 'px' });
      b.addEventListener('click', () => {
        if (h.save) {
          if (document.activeElement) document.activeElement.blur();
          if (!sec._validate()) { toast('빨간색으로 표시된 칸을 확인해 주세요'); return; }
          sec._save(); toast('내 정보를 저장했어요'); go('my'); return;
        }
        if (h.toast) toast(h.toast);
        if (h.modal) { pendingNav = h.then || null; openModal(h.modal); return; }
        if (h.go) go(h.go);
      });
      sec.appendChild(b);
    });
    if (def.toggle) {
      const t = document.createElement('button');
      t.className = 'toggle'; t.setAttribute('aria-label', '학습 알림 받기');
      Object.assign(t.style, { left: def.toggle.x + 'px', top: def.toggle.y + 'px' });
      t.addEventListener('click', () => {
        const off = t.classList.toggle('off');
        toast(off ? '학습 알림을 껐어요' : '학습 알림을 켰어요');
      });
      sec.appendChild(t);
    }
    if (def.options) buildCharOptions(sec);
    const hv = HOVER[name];
    if (hv) $$(':scope > .hit', sec).forEach((b, i) => {
      if (!hv.hover[i]) return;
      b.classList.add('hv');
      b.style.setProperty('--hov', `url(${abs(`img/h/${name}_hover.jpg`)})`);
      b.style.setProperty('--prs', `url(${abs(`img/h/${name}_pressed.jpg`)})`);
      b.style.backgroundSize = '1133px 744px';
      b.style.backgroundPosition = `${-parseFloat(b.style.left)}px ${-parseFloat(b.style.top)}px`;
    });
    screensEl.appendChild(sec);
    built[name] = sec;
    return sec;
  }

  // 내 정보 수정: 캐릭터를 고르면 큰 프로필 이미지가 바뀌고, 입력칸은 상태별(기본·포커스·오류) 디자인
  const PROFILE_FIELDS = [
    { k: 'name', x: 608, y: 167, w: 221, v: '박명지', check: v => v.trim() ? '' : '이름을 입력해 주세요' },
    { k: 'grade', x: 845, y: 167, w: 221, v: '초등 2학년', select: ['초등 1학년', '초등 2학년', '초등 3학년', '초등 4학년', '초등 5학년', '초등 6학년'] },
    { k: 'birth', x: 608, y: 247, w: 221, v: '2019.03.14', mode: 'numeric', check: v => /^\d{4}\.\d{2}\.\d{2}$/.test(v.trim()) ? '' : '생년월일을 2019.03.14처럼 입력해 주세요' },
    { k: 'guardian', x: 608, y: 366, w: 221, v: '김지은', check: v => v.trim() ? '' : '보호자 이름을 입력해 주세요' },
    { k: 'phone', x: 845, y: 366, w: 221, v: '010-2345-6789', mode: 'tel', check: v => v.replace(/\D/g, '').length >= 10 ? '' : '연락처를 끝까지 입력해 주세요' },
    { k: 'email', x: 608, y: 446, w: 457, v: 'myungji.mom@example.com', mode: 'email', check: v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim()) ? '' : '이메일 주소를 확인해 주세요' },
    { k: 'addr', x: 608, y: 526, w: 257, v: '서울시 서대문구 거북골로 34', check: v => v.trim() ? '' : '배송지를 입력해 주세요' },
    { k: 'addr2', x: 881, y: 526, w: 184, v: '101동 1203호' },
  ];
  let profileState = null;
  function buildCharOptions(sec) {
    const av = document.createElement('img');
    av.className = 'pf-avatar'; av.alt = '프로필 캐릭터'; av.draggable = false;
    sec.appendChild(av);
    const cols = [288, 375, 461], rows = [308, 380];
    const opts = [];
    let k = 0;
    rows.forEach(y => cols.forEach(x => {
      const lv = ++k;
      const im = document.createElement('img');
      im.className = 'pf-opt'; im.alt = ''; im.draggable = false;
      Object.assign(im.style, { left: x + 'px', top: y + 'px' });
      sec.appendChild(im);
      const b = document.createElement('button');
      b.className = 'hit'; b.setAttribute('aria-label', `프로필 캐릭터 Lv.${lv}`);
      Object.assign(b.style, { left: x + 'px', top: y + 'px', width: '79px', height: '64px', borderRadius: '14px' });
      b.addEventListener('click', () => setChar(lv));
      sec.appendChild(b);
      opts.push(im);
    }));
    function setChar(lv) {
      sec.dataset.lv = lv;
      av.src = `img/prof/av${lv}.png`;
      opts.forEach((im, i) => { im.src = `img/prof/opt${i + 1}_${i + 1 === lv ? 'on' : 'off'}.png`; });
    }
    // 입력칸
    const inputs = PROFILE_FIELDS.map(f => {
      const wrap = document.createElement('label');
      wrap.className = 'pf-field';
      Object.assign(wrap.style, { left: f.x + 'px', top: (f.y + 22) + 'px', width: f.w + 'px' });
      let el;
      if (f.select) {
        el = document.createElement('select');
        el.innerHTML = f.select.map(o => `<option>${o}</option>`).join('');
        wrap.classList.add('is-select');
      } else {
        el = document.createElement('input');
        el.type = f.mode === 'email' ? 'email' : (f.mode === 'tel' ? 'tel' : 'text');
        if (f.mode === 'numeric') el.inputMode = 'numeric';
        el.autocomplete = 'off'; el.spellcheck = false; el.setAttribute('autocapitalize', 'off');
      }
      el.className = 'pf-input'; el.setAttribute('aria-label', f.k);
      const msg = document.createElement('span'); msg.className = 'pf-msg';
      wrap.append(el, msg);
      sec.appendChild(wrap);
      const validate = () => {
        const m = f.check ? f.check(el.value) : '';
        wrap.classList.toggle('error', !!m); msg.textContent = m; return !m;
      };
      el.addEventListener('focus', () => wrap.classList.add('focus'));
      el.addEventListener('blur', () => { wrap.classList.remove('focus'); validate(); setTimeout(() => { window.scrollTo(0, 0); }, 50); });
      el.addEventListener('input', () => { if (wrap.classList.contains('error')) validate(); bump(); });
      el.addEventListener('keydown', e => { if (e.key === 'Enter') el.blur(); });
      return { f, el, wrap, validate };
    });
    sec._validate = () => inputs.map(i => i.validate()).every(Boolean);
    sec._reset = () => {
      const st = profileState || { lv: 6, values: {} };
      setChar(st.lv);
      inputs.forEach(i => { i.el.value = st.values[i.f.k] ?? i.f.v; i.wrap.classList.remove('error', 'focus'); i.wrap.querySelector('.pf-msg').textContent = ''; });
    };
    sec._save = () => { profileState = { lv: +sec.dataset.lv, values: Object.fromEntries(inputs.map(i => [i.f.k, i.el.value])) }; };
    sec._reset();
  }

  /* ---------- 3. 화면 전환 ---------- */
  let current = null, barTimer = null;
  const play = v => { if (!v) return; try { v.muted = true; v.currentTime = 0; const p = v.play(); if (p && p.catch) p.catch(() => {}); } catch (e) {} };
  const pauseAll = root => $$('video', root).forEach(v => { try { v.pause(); } catch (e) {} });
  /* ---------- iPad 홈 화면 (화면 크기에 맞춰 배치) ---------- */
  const HOME_ROWS = [[['kumon', '구몬학습']]];
  const homeEl = $('#home'), hsGrid = $('#hsGrid'), hsDock = $('#hsDock');
  HOME_ROWS.forEach((row, r) => row.forEach(([id, label], c) => {
    const b = document.createElement('button');
    b.className = 'hs-app'; b.dataset.r = r; b.dataset.c = c;
    b.innerHTML = `<img src="img/home/${id}.png" alt="" draggable="false"><span>${label}</span>`;
    b.addEventListener('click', () => { if (id === 'kumon') go('splash'); });
    hsGrid.appendChild(b);
  }));
  hsDock.innerHTML = ['messages', 'safari', 'music', 'calendar'].map(n => `<img src="img/home/${n}.png" alt="" draggable="false">`).join('');
  function layoutHome() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const k = Math.max(0.7, Math.min(1.8, Math.min(vw / W, vh / H)));
    homeEl.style.setProperty('--k', k);
    // 구몬학습 아이콘 1개: 가로 가운데, Figma와 같은 높이 비율
    const top = Math.max(84 * k, vh * (84 / H));
    $$('.hs-app', hsGrid).forEach(b => { b.style.left = (vw / 2) + 'px'; b.style.top = top + 'px'; });
    $('.hs-dock', homeEl).style.bottom = `max(${28 * k}px, env(safe-area-inset-bottom))`;
    $('.hs-dots', homeEl).style.bottom = (153 * k + 4) + 'px';
  }
  function tickHomeClock() {
    const d = new Date(), h = d.getHours(), m = d.getMinutes();
    const ap = h < 12 ? '오전' : '오후', h12 = h % 12 || 12;
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    $('#hsTime').textContent = `${ap} ${h12}시 ${m}분  ${d.getMonth() + 1}월 ${d.getDate()}일 ${days[d.getDay()]}요일`;
  }
  tickHomeClock(); setInterval(tickHomeClock, 15000);

  function go(name) {
    closeModal();
    pauseAll(document);
    if (barTimer) { clearTimeout(barTimer); barTimer = null; }
    const leaving = current;
    if (leaving === 'video' && name !== 'video') stopClass();
    $$('.screen').forEach(s => { s.hidden = true; });
    if (name === 'video') {
      $('#scr-video').hidden = false;
      if (leaving !== 'video') startClass();
    } else {
      const sec = built[name] || buildScreen(name);
      sec.hidden = false;
      const def = SCREENS[name];
      if (name === 'profile' && sec._reset && current !== 'profile') sec._reset();
      play($('.char-video', sec));
      if (def.bar) {
        const bar = $('.bar', sec);
        bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run');
        barTimer = setTimeout(() => go(def.next), 2000);
      }
    }
    current = name;
    homeEl.hidden = name !== 'app';
  }

  /* ---------- 4. 모달 · 토스트 ---------- */
  let pendingNav = null;
  function openModal(id) {
    $('#dim').hidden = false;
    $$('.modal').forEach(m => m.hidden = m.id !== 'modal-' + id);
  }
  function closeModal() {
    $('#dim').hidden = true;
    $$('.modal').forEach(m => m.hidden = true);
  }
  $('#dim').addEventListener('click', closeModal);
  $$('.modal .hit').forEach(b => b.addEventListener('click', () => {
    const act = b.dataset.act;
    if (act === 'close') { closeModal(); pendingNav = null; }
    else if (act === 'leaveClass') go('main');
    else if (act === 'discard') { const to = pendingNav || 'my'; pendingNav = null; go(to); }
    else if (act === 'notify') { closeModal(); toast('준비되면 알림으로 알려드릴게요'); }
  }));

  let toastTimer = null;
  function toast(msg) {
    if (!msg) return;
    const t = $('#toast');
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
  }

  /* ---------- 5. 누름 피드백 (터치 즉시 반응) ---------- */
  stage.addEventListener('pointerdown', e => {
    const b = e.target.closest('.hit');
    if (b) b.classList.add('pressed');
    bump();
  });
  // 화상 수업·모달 버튼: Figma hover/pressed 상태 이미지를 버튼 영역에만 보여 줌
  const HV = new Map();
  function regHv(el, fn) { HV.set(el, fn); el.classList.add('hv'); }
  function applyHv(el) {
    const fn = HV.get(el); if (!fn) return;
    const o = fn(); if (!o) return;
    el.style.setProperty('--hov', `url(${abs(o.hov)})`);
    el.style.setProperty('--prs', `url(${abs(o.prs || o.hov)})`);
    el.style.backgroundSize = `${o.w}px ${o.h}px`;
    el.style.backgroundPosition = `${o.x - el.offsetLeft}px ${o.y - el.offsetTop}px`;
  }
  stage.addEventListener('pointerover', e => { const b = e.target.closest('.hv'); if (b) applyHv(b); });
  stage.addEventListener('pointerdown', e => { const b = e.target.closest('.hv'); if (b) applyHv(b); }, true);
  const unpress = () => $$('.hit.pressed', stage).forEach(b => b.classList.remove('pressed'));
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => stage.addEventListener(t, unpress));

  /* ---------- 6. 화상 수업 ---------- */
  const S = { fold: false, ai: 'off', tool: 'pen', tab: 'video', mic: true, cam: true, hand: false, color: '#59CC03' };
  const pdoc = $('#pdoc'), pvid = $('#pvid');
  const TOOLS = ['cursor', 'pen', 'marker', 'eraser', 'shape', 'line', 'text', 'memo', 'color'];

  // 툴 터치 영역
  TOOLS.forEach((t, i) => {
    const b = document.createElement('button');
    b.className = 'hit'; b.style.top = (218 + 42 * i) + 'px'; b.dataset.tool = t;
    b.setAttribute('aria-label', t);
    b.addEventListener('click', () => selectTool(t));
    $('#toolHits').appendChild(b);
  });
  // 색상 팔레트
  const COLORS = ['#59CC03', '#171717', '#EF4444', '#3B82F6', '#F97316', '#A855F7'];
  COLORS.forEach(c => {
    const b = document.createElement('button');
    b.style.background = c; b.dataset.c = c; b.setAttribute('aria-label', '색상 ' + c);
    b.addEventListener('click', () => { S.color = c; renderPalette(); $('#palette').hidden = true; selectTool('pen'); });
    $('#palette').appendChild(b);
  });
  function renderPalette() { $$('#palette button').forEach(b => b.classList.toggle('on', b.dataset.c === S.color)); }

  function selectTool(t) {
    if (t === 'color') {
      const p = $('#palette');
      renderPalette(); p.hidden = !p.hidden;
      S.tool = 'color'; renderDoc();
      return;
    }
    $('#palette').hidden = true;
    S.tool = t; renderDoc();
  }

  function renderDoc() {
    pdoc.classList.toggle('fold', S.fold);
    $('#pdocImg').src = `img/p/pdoc_${S.fold ? 'on' : 'off'}_${S.ai === 'off' ? 'off' : 'on'}.png`;
    $('#toolsImg').src = `img/p/tool_${S.tool}.png`;
    const sw = $('#toolSwatch'); sw.style.background = S.color; sw.classList.toggle('sel', S.tool === 'color');
    $('#ink').classList.toggle('cursor', S.tool === 'cursor' || S.tool === 'color');
    if (S.fold) $('#palette').hidden = true;
  }

  function renderVideo() {
    pvid.classList.toggle('fold', S.fold);
    pvid.classList.remove('t-video', 't-chat', 't-note');
    pvid.classList.add('t-' + S.tab);
    $('#pvImg').src = `img/p/${S.fold ? 'pvf' : 'pv'}_${S.tab}.png`;
    const tile = $('#tile');
    tile.hidden = S.fold || S.tab !== 'video';
    const live = camLive() && S.cam;
    $('#myCam').hidden = tile.hidden || !live;
    tile.style.visibility = live ? 'hidden' : '';
    $('#myMic').classList.toggle('off', !S.mic);
    tile.src = `img/p/tile_${S.cam ? 'on' : 'off'}_${S.mic ? 'on' : 'off'}.png`;
    $('#tabHits').hidden = S.fold;
    $('#noteHits').hidden = S.fold || S.tab !== 'note';
    const chip = $('#chip');
    chip.hidden = !(S.hand && !S.fold);
    pvid.classList.toggle('hand', S.hand);
    chip.style.top = ({ video: 354, chat: 563, note: 605 })[S.tab] + 'px';
    // 하단 버튼 위치
    const ctl = $$('#controls .ctl');
    let pos;
    if (!S.fold) pos = [[896, 659], [948, 659], [1000, 659], [1052, 659]];
    else {
      const base = 24 + ({ video: 101, chat: 119, note: 131 })[S.tab], x0 = 995;
      pos = [[x0 + 9, base], [x0 + 61, base], [x0 + 9, base + 52], [x0 + 61, base + 52]];
    }
    ctl.forEach((b, i) => { b.style.left = pos[i][0] + 'px'; b.style.top = pos[i][1] + 'px'; });
    paintControls();
  }

  // 버튼 이미지 (normal / hover / pressed / selected)
  const pressedCtl = new Set();
  const hoverCtl = new Set();
  function ctlImg(kind, pressed) {
    const st = pressed ? 'pressed' : (hoverCtl.has(kind) ? 'hover' : 'normal');
    if (kind === 'exit') return `img/p/bred_${st}.png`;
    if (kind === 'hand') return `img/p/bp_${S.hand ? 'selected' : st}_hand.png`;
    const tp = kind === 'mic' ? (S.mic ? 'mic' : 'mic_off') : (S.cam ? 'cam' : 'cam_off');
    return `img/p/bp_${st}_${tp}.png`;
  }
  function paintControls() {
    $$('#controls .ctl').forEach(b => { $('img', b).src = ctlImg(b.dataset.ctl, pressedCtl.has(b.dataset.ctl)); });
  }
  $$('#controls .ctl').forEach(b => {
    const k = b.dataset.ctl;
    b.addEventListener('pointerdown', () => { pressedCtl.add(k); paintControls(); });
    b.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') { hoverCtl.add(k); paintControls(); } });
    b.addEventListener('pointerleave', () => { if (hoverCtl.delete(k)) paintControls(); });
    const up = () => { if (pressedCtl.delete(k)) paintControls(); };
    b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
    b.addEventListener('click', () => {
      if (k === 'mic') { S.mic = !S.mic; toast(S.mic ? '마이크를 켰어요' : '마이크를 껐어요'); }
      if (k === 'cam') { S.cam = !S.cam; toast(S.cam ? '카메라를 켰어요' : '카메라를 껐어요'); }
      if (k === 'hand') { S.hand = !S.hand; if (S.hand) toast('선생님께 손을 들었어요'); if (S.tab === 'chat') scrollChat(); }
      if (k === 'exit') { openModal('exit'); }
      renderVideo();
    });
  });

  $('#btnFold').addEventListener('click', () => { S.fold = !S.fold; renderDoc(); renderVideo(); });
  $$('#tabHits .tab').forEach(b => b.addEventListener('click', () => {
    S.tab = b.dataset.tab; renderVideo();
    if (S.tab === 'chat') scrollChat();
  }));

  // 교재 탭: 등록된 교재 5개
  [140, 208, 276, 344, 412].forEach((y, i) => {
    const b = document.createElement('button');
    b.className = 'hit'; b.style.top = y + 'px'; b.style.height = '58px';
    b.addEventListener('click', () => { if (i) toast('지금은 완전국어 CII로 수업 중이에요'); });
    $('#noteHits').appendChild(b);
  });

  /* AI 캐릭터 */
  const AI_ANSWERS = [
    '분모가 다르면 먼저 분모를 같게 만들어 봐! 1/2은 2/4와 같아.',
    '“경사”는 축하할 만한 기쁜 일이라는 뜻이야. 생일도 경사지!',
    '잘하고 있어! 한 장만 더 풀면 육몬이가 더 자랄 거야.',
    '“충동적”은 갑자기 하고 싶어지는 마음이야. 천천히 생각해 보자!',
  ];
  let aiIdx = 0, aiTimer = null;
  let aiLeave = null;
  function setAI(state) {
    S.ai = state; clearTimeout(aiTimer);
    const box = $('#ai'), bub = $('#aiBubble');
    clearTimeout(aiLeave);
    if (state === 'off') {
      if (!box.hidden) { box.classList.add('leaving'); aiLeave = setTimeout(() => { box.hidden = true; box.classList.remove('leaving'); }, 320); }
    } else { box.classList.remove('leaving'); box.hidden = false; }
    box.classList.toggle('listen', state === 'listen');
    const vOn = $('#aiOn'), vL = $('#aiListen');
    if (state === 'off') { vOn.pause(); vL.pause(); }
    if (state === 'on') {
      vL.pause(); play(vOn);
      bub.innerHTML = '<small>AI 육몬이</small>안녕! 궁금한 게 있으면 나를 톡 눌러서 물어봐!';
    } else if (state === 'listen') {
      vOn.pause(); play(vL);
      bub.innerHTML = '<small>AI 육몬이</small>듣고 있어요<span class="dots"><i></i><i></i><i></i></span>';
      aiTimer = setTimeout(() => {
        S.ai = 'on'; box.classList.remove('listen'); vL.pause(); play(vOn);
        bub.innerHTML = '<small>AI 육몬이</small>' + AI_ANSWERS[aiIdx++ % AI_ANSWERS.length];
      }, 2600);
    }
    renderDoc();
  }
  $('#btnAI').addEventListener('click', () => setAI(S.ai === 'off' ? 'on' : 'off'));
  $('#ai').addEventListener('click', () => { if (S.ai !== 'listen') setAI('listen'); });

  /* 타이머 (진입 시 00:00부터) */
  let tStart = 0, tInt = null;
  function tick() {
    const s = Math.floor((Date.now() - tStart) / 1000);
    $('#timer').textContent = String(Math.floor(s / 60) % 100).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }

  /* 내 화면: 기기 전면 카메라 (허용 안 하거나 카메라가 없으면 기존 이미지) */
  let camStream = null, camAsked = false;
  const camLive = () => !!(camStream && camStream.active);
  async function startCam() {
    if (camLive()) { $('#myCamVideo').play().catch(() => {}); renderVideo(); return; }
    if (camAsked || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    camAsked = true;
    try {
      camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 360 } }, audio: false });
      const v = $('#myCamVideo'); v.srcObject = camStream; v.muted = true;
      await v.play().catch(() => {});
      camStream.getVideoTracks().forEach(t => t.addEventListener('ended', () => { camStream = null; camAsked = false; renderVideo(); }));
    } catch (e) { camStream = null; setTimeout(() => { camAsked = false; }, 30000); }
    renderVideo();
  }

  function startClass() {
    startCam();
    tStart = Date.now(); tick();
    $$('.tv video').forEach(play);
    if (S.ai !== 'off') setAI('on');
    clearInterval(tInt); tInt = setInterval(tick, 1000);
    renderDoc(); renderVideo();
  }
  function stopClass() {
    try { $('#myCamVideo').pause(); } catch (e) {}
    clearInterval(tInt); tInt = null;
    $('#chatInput').blur();
  }
  function resetClass() {
    Object.assign(S, { fold: false, tool: 'pen', tab: 'video', mic: true, cam: true, hand: false, color: '#59CC03' });
    setAI('off');
    $('#palette').hidden = true;
    clearInk();
    resetChat();
    renderDoc(); renderVideo();
  }

  /* ---------- 7. 채팅 ---------- */
  const CAL = '<svg viewBox="0 0 24 24" fill="none" stroke="#4C4C4C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
  const INIT_CHAT = [
    { who: 't', msgs: ['명지야, 3번 문제는 어디까지 풀었어?'], time: '10:24' },
    { who: 'me', msgs: ['분모가 다르면 어떻게 더해야 하는지 모르겠어요🥹'], time: '10:24' },
    { who: 't', msgs: ['먼저 분모를 같게 만들어야 해.', '1/2을 2/4로 바꿔볼까?'], time: '10:25' },
    { who: 'me', msgs: ['와! 정답은 3/4이에요!'], time: '10:27' },
  ];
  const REPLIES = [
    '좋아요! 같이 확인해 볼까요? 😊',
    '아주 잘했어요 👏 다음 문제도 같은 방법으로 풀어 봐요.',
    '좋은 질문이에요! 선생님이 판서로 보여 줄게요.',
    '맞아요! 명지가 오늘 정말 집중을 잘하네요.',
  ];
  let replyIdx = 0, replyTimer = null;
  const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const now = () => { const d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); };

  function chatHTML(m, pop) {
    if (m.who === 'me') {
      return m.msgs.map(t => `<div class="c-row me${pop ? ' pop' : ''}"><span class="c-time">${m.time}</span><div class="c-bub">${esc(t)}</div></div>`).join('');
    }
    const rows = m.msgs.map((t, i) => `<div class="c-row"><div class="c-bub">${t === '…' ? '<span class="typing"><i></i><i></i><i></i></span>' : esc(t)}</div>${i === m.msgs.length - 1 ? `<span class="c-time">${m.time}</span>` : ''}</div>`).join('');
    return `<div class="c-grp${pop ? ' pop' : ''}"><div class="c-name">김구몬 선생님</div><div class="c-stack">${rows}</div></div>`;
  }
  function resetChat() {
    clearTimeout(replyTimer);
    $('#chatList').innerHTML = `<div class="c-date">${CAL}<span>2026년 11월 5일 목요일</span></div>` + INIT_CHAT.map(m => chatHTML(m)).join('');
    $('#chatInput').value = ''; $('#chatSend').disabled = true;
  }
  function scrollChat() { const l = $('#chatList'); requestAnimationFrame(() => { l.scrollTop = l.scrollHeight; }); }
  function append(m) { $('#chatList').insertAdjacentHTML('beforeend', chatHTML(m, true)); scrollChat(); }

  const input = $('#chatInput');
  input.addEventListener('input', () => { $('#chatSend').disabled = !input.value.trim(); bump(); });
  $('#chatForm').addEventListener('submit', e => {
    e.preventDefault();
    if (e.isComposing) return;
    const v = input.value.trim();
    if (!v) return;
    append({ who: 'me', msgs: [v], time: now() });
    input.value = ''; $('#chatSend').disabled = true;
    clearTimeout(replyTimer);
    replyTimer = setTimeout(() => {
      append({ who: 't', msgs: ['…'], time: '' });
      const typing = $('#chatList').lastElementChild;
      replyTimer = setTimeout(() => {
        typing.remove();
        append({ who: 't', msgs: [REPLIES[replyIdx++ % REPLIES.length]], time: now() });
      }, 1400);
    }, 600);
  });
  // 키보드를 내렸을 때 화면이 밀린 채로 남지 않도록
  input.addEventListener('blur', () => setTimeout(() => { window.scrollTo(0, 0); fit(); }, 50));

  /* ---------- 8. 판서 ---------- */
  const ink = $('#ink'), ctx = ink.getContext('2d');
  const PAGES = [null, ['img/book/9a.jpg', 'img/book/9b.jpg', '9a', '9b'], ['img/book/82a.jpg', 'img/book/82b.jpg', '82a', '82b']];
  const book = PAGES.map(() => ({ ops: [], redo: [], els: [] }));
  let page = 0, ops = book[0].ops, redo = book[0].redo, cur = null, dpr = 1;
  function setPage(n) {
    if (n < 0 || n >= PAGES.length) return;
    book[page].ops = ops; book[page].redo = redo;
    $$('#objs > *').forEach(el => el.remove());
    page = n; ops = book[n].ops; redo = book[n].redo; cur = null;
    ops.forEach(o => { if (o.el) $('#objs').appendChild(o.el); });
    const pg = PAGES[n];
    $('#pages').hidden = !pg;
    if (pg) { $('#pageL').src = pg[0]; $('#pageR').src = pg[1]; }
    $('#pgA').textContent = pg ? pg[2] : '6a'; $('#pgB').textContent = pg ? pg[3] : '6b';
    $('#pgN').textContent = `${n + 1} / ${PAGES.length}`;
    $('#pgPrev').disabled = n === 0; $('#pgNext').disabled = n === PAGES.length - 1;
    redraw();
  }
  $('#pgPrev').addEventListener('click', () => setPage(page - 1));
  $('#pgNext').addEventListener('click', () => setPage(page + 1));
  function resizeInk() {
    const want = Math.min(3, Math.max(1, (window.devicePixelRatio || 1) * scale));
    if (Math.abs(want - dpr) < 0.01 && ink.width === Math.round(W * dpr)) return;
    dpr = want;
    ink.width = Math.round(W * dpr); ink.height = Math.round(H * dpr);
    redraw();
  }
  function pt(e) {
    const r = ink.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }
  function strokeStyle(op) {
    ctx.globalCompositeOperation = op.t === 'eraser' ? 'destination-out' : 'source-over';
    ctx.globalAlpha = op.t === 'marker' ? 0.35 : 1;
    ctx.strokeStyle = op.c; ctx.lineWidth = op.w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }
  function drawOp(op) {
    if (op.t === 'text' || op.t === 'memo') return;
    ctx.save(); strokeStyle(op);
    const p = op.p;
    ctx.beginPath();
    if (op.t === 'shape') {
      const [a, b] = [p[0], p[p.length - 1]];
      const x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), w = Math.abs(a.x - b.x), h = Math.abs(a.y - b.y);
      if (ctx.roundRect) ctx.roundRect(x, y, w, h, 6); else ctx.rect(x, y, w, h);
    } else if (op.t === 'line') {
      ctx.moveTo(p[0].x, p[0].y); ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    } else {
      ctx.moveTo(p[0].x, p[0].y);
      if (p.length === 1) ctx.lineTo(p[0].x + 0.01, p[0].y);
      for (let i = 1; i < p.length - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
        ctx.quadraticCurveTo(p[i].x, p[i].y, mx, my);
      }
      if (p.length > 1) ctx.lineTo(p[p.length - 1].x, p[p.length - 1].y);
    }
    ctx.stroke(); ctx.restore();
  }
  function redraw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ops.forEach(drawOp);
    if (cur) drawOp(cur);
  }
  function clearInk() { book.forEach(b => { b.ops = []; b.redo = []; }); page = 0; ops = book[0].ops; redo = book[0].redo; cur = null; $('#objs').innerHTML = ''; setPage(0); }

  const WIDTH = { pen: 3, marker: 18, eraser: 26, shape: 3, line: 3 };
  ink.addEventListener('pointerdown', e => {
    if (current !== 'video') return;
    $('#palette').hidden = true;
    const t = S.tool, p = pt(e);
    if (t === 'text') { addText(p); return; }
    if (t === 'memo') { addMemo(p); return; }
    if (!WIDTH[t]) return;
    ink.setPointerCapture(e.pointerId);
    cur = { t, c: t === 'marker' ? '#FACC15' : S.color, w: WIDTH[t], p: [p], id: e.pointerId };
    redraw();
  });
  ink.addEventListener('pointermove', e => {
    if (!cur || e.pointerId !== cur.id) return;
    const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    evs.forEach(ev => cur.p.push(pt(ev)));
    redraw();
  });
  const endStroke = e => {
    if (!cur || e.pointerId !== cur.id) return;
    ops.push(cur); redo.length = 0; cur = null; redraw();
  };
  ink.addEventListener('pointerup', endStroke);
  ink.addEventListener('pointercancel', endStroke);

  function addText(p) {
    const el = document.createElement('div');
    el.className = 'ink-text'; el.contentEditable = 'true'; el.spellcheck = false;
    el.style.left = (p.x - 4) + 'px'; el.style.top = (p.y - 14) + 'px'; el.style.color = S.color;
    $('#objs').appendChild(el);
    const op = { t: 'text', el }; ops.push(op); redo.length = 0;
    el.addEventListener('blur', () => { if (!el.textContent.trim()) { el.remove(); const i = ops.indexOf(op); if (i >= 0) ops.splice(i, 1); } });
    setTimeout(() => el.focus(), 0);
  }
  function addMemo(p) {
    const el = document.createElement('div');
    el.className = 'memo'; el.contentEditable = 'true'; el.spellcheck = false;
    el.style.left = Math.min(p.x, 860 - 136) + 'px'; el.style.top = Math.min(p.y, 744 - 130) + 'px';
    $('#objs').appendChild(el);
    ops.push({ t: 'memo', el }); redo.length = 0;
    setTimeout(() => el.focus(), 0);
  }

  function undoOp() {
    const op = ops.pop(); if (!op) return;
    if (op.el) op.el.remove();
    redo.push(op); redraw();
  }
  function redoOp() {
    const op = redo.pop(); if (!op) return;
    if (op.el) $('#objs').appendChild(op.el);
    ops.push(op); redraw();
  }
  $('#btnUndo').addEventListener('click', undoOp);
  $('#btnRedo').addEventListener('click', redoOp);

  /* ---------- 9. 자동 초기화 (전시용) ---------- */
  let idleTimer = null;
  function bump() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(resetAll, IDLE_MS);
  }
  function resetAll() {
    if (document.activeElement) document.activeElement.blur();
    resetClass();
    const my = built.my && $('.toggle', built.my); if (my) my.classList.remove('off');
    go('app');
  }
  ['keydown', 'touchstart', 'wheel'].forEach(t => document.addEventListener(t, bump, { passive: true }));

  const pdocHv = mode => () => ({ hov: `img/h/pdoc_${S.fold ? 'on' : 'off'}_${S.ai === 'off' ? 'off' : 'on'}_hover.png`, prs: `img/h/pdoc_${S.fold ? 'on' : 'off'}_${S.ai === 'off' ? 'off' : 'on'}_pressed.png`, x: 14, y: 14, w: S.fold ? 74 : 116, h: 716 });
  ['#btnFold', '#btnAI', '#btnUndo', '#btnRedo'].forEach(s => regHv($(s), pdocHv()));
  $$('#toolHits .hit').forEach(b => regHv(b, () => ({ hov: `img/h/tg_${S.tool}_hover.png`, x: 24, y: 209, w: 54, h: 390 })));
  $$('#tabHits .tab').forEach(b => regHv(b, () => ({ hov: `img/h/pv_${S.tab}_hover.png`, prs: `img/h/pv_${S.tab}_pressed.png`, x: 873, y: 14, w: 246, h: 716 })));
  [['exit', 344, 168], ['leave', 344, 192], ['soon', 400, 332]].forEach(([id, w, h]) => {
    $$(`#modal-${id} .hit`).forEach(b => regHv(b, () => ({ hov: `img/h/modal_${id}_hover.png`, prs: `img/h/modal_${id}_pressed.png`, x: -10, y: -10, w, h })));
  });

  /* ---------- 10. 시작 ---------- */
  // 모든 이미지를 미리 받아 두어 전환 시 깜빡임 방지
  const PRE = [
    ...Object.values(SCREENS).map(s => s.img), 'img/board.png', 'img/book/9a.jpg', 'img/book/9b.jpg', 'img/book/82a.jpg', 'img/book/82b.jpg',
    ...['pdoc_off_off', 'pdoc_off_on', 'pdoc_on_off', 'pdoc_on_on', 'pv_video', 'pv_chat', 'pv_note', 'pvf_video', 'pvf_chat', 'pvf_note',
      'tile_on_on', 'tile_on_off', 'tile_off_on', 'tile_off_off', 'chip_hand', 'modal_exit', 'modal_leave', 'modal_soon', 'ai_on', 'ai_listen',
      'bred_normal', 'bred_hover', 'bp_selected_hand',
      ...TOOLS.map(t => 'tool_' + t),
      ...['mic', 'mic_off', 'cam', 'cam_off', 'hand'].flatMap(t => ['normal', 'hover'].map(s => `bp_${s}_${t}`))].map(n => `img/p/${n}.png`),
  ];
  const os_h = ["books_hover.jpg", "books_pressed.jpg", "main_hover.jpg", "main_pressed.jpg", "modal_exit_hover.png", "modal_exit_pressed.png", "modal_leave_hover.png", "modal_leave_pressed.png", "modal_soon_hover.png", "modal_soon_pressed.png", "my_hover.jpg", "my_pressed.jpg", "pdoc_off_off_hover.png", "pdoc_off_off_pressed.png", "pdoc_off_on_hover.png", "pdoc_off_on_pressed.png", "pdoc_on_off_hover.png", "pdoc_on_off_pressed.png", "pdoc_on_on_hover.png", "pdoc_on_on_pressed.png", "profile_hover.jpg", "profile_pressed.jpg", "pv_chat_hover.png", "pv_chat_pressed.png", "pv_note_hover.png", "pv_note_pressed.png", "pv_video_hover.png", "pv_video_pressed.png", "schedule_hover.jpg", "schedule_pressed.jpg", "schedule_w1_hover.jpg", "schedule_w1_pressed.jpg", "schedule_w3_hover.jpg", "schedule_w3_pressed.jpg", "tg_color_hover.png", "tg_cursor_hover.png", "tg_eraser_hover.png", "tg_line_hover.png", "tg_marker_hover.png", "tg_memo_hover.png", "tg_pen_hover.png", "tg_shape_hover.png", "tg_text_hover.png"];
  os_h.forEach(f => PRE.push('img/h/' + f));
  PRE.forEach(src => { const i = new Image(); i.decoding = 'async'; i.src = src; });
  Object.keys(SCREENS).forEach(buildScreen);

  resetChat();
  setPage(0);
  fit();
  const start = (location.hash || '').replace('#', '');
  go(SCREENS[start] || start === 'video' ? start : 'app');
  bump();

  // 오프라인 대비 (GitHub Pages 등 https에서만)
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !/claude|anthropic/.test(location.host)) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();

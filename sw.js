// 전시장 와이파이가 끊겨도 계속 동작하도록 전체 파일을 캐시
const CACHE = 'kumon-v3';
const FILES = ["./", "index.html", "css/app.css", "js/app.js", "fonts/PretendardVariable.woff2", "manifest.webmanifest", "icon-180.png", "icon-512.png", "img/app.jpg", "img/board.png", "img/books.png", "img/loading.png", "img/main.png", "img/my.png", "img/profile.png", "img/schedule.png", "img/schedule_w1.png", "img/schedule_w3.png", "img/splash.png", "img/p/ai_listen.png", "img/p/ai_on.png", "img/p/bp_hover_cam.png", "img/p/bp_hover_cam_off.png", "img/p/bp_hover_hand.png", "img/p/bp_hover_mic.png", "img/p/bp_hover_mic_off.png", "img/p/bp_normal_cam.png", "img/p/bp_normal_cam_off.png", "img/p/bp_normal_hand.png", "img/p/bp_normal_mic.png", "img/p/bp_normal_mic_off.png", "img/p/bp_pressed_cam.png", "img/p/bp_pressed_cam_off.png", "img/p/bp_pressed_hand.png", "img/p/bp_pressed_mic.png", "img/p/bp_pressed_mic_off.png", "img/p/bp_selected_hand.png", "img/p/bred_hover.png", "img/p/bred_normal.png", "img/p/bred_pressed.png", "img/p/chip_hand.png", "img/p/modal_exit.png", "img/p/modal_leave.png", "img/p/modal_soon.png", "img/p/pdoc_off_off.png", "img/p/pdoc_off_on.png", "img/p/pdoc_on_off.png", "img/p/pdoc_on_on.png", "img/p/pv_chat.png", "img/p/pv_note.png", "img/p/pv_video.png", "img/p/pvf_chat.png", "img/p/pvf_note.png", "img/p/pvf_video.png", "img/p/tile_off_off.png", "img/p/tile_off_on.png", "img/p/tile_on_off.png", "img/p/tile_on_on.png", "img/p/tool_color.png", "img/p/tool_cursor.png", "img/p/tool_eraser.png", "img/p/tool_line.png", "img/p/tool_marker.png", "img/p/tool_memo.png", "img/p/tool_pen.png", "img/p/tool_shape.png", "img/p/tool_text.png", "img/book/82a.jpg", "img/book/82b.jpg", "img/book/9a.jpg", "img/book/9b.jpg", "media/ai_listen.jpg", "media/ai_listen.mp4", "media/ai_on.jpg", "media/ai_on.mp4", "media/loading.jpg", "media/loading.mp4", "media/teacher.jpg", "media/teacher.mp4"];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request)));
});

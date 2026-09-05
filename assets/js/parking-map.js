/* Iconic Shizuoka 2026 — 会場周辺の駐車場マップ（stage / marche 共用）
   ピンの色は会場からの距離を表す: 緑=徒歩3分以内 / 橙=徒歩5分以内 / 赤=徒歩8分以上 */
(function () {
  var el = document.getElementById('parking-map');
  if (!el || typeof L === 'undefined') return;

  var VENUE = [34.9749, 138.3817];
  var map = L.map(el).setView([34.9749, 138.382], 16);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  var venueIcon = L.divIcon({
    html: '<div style="background:#D6559C;color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:bold;border:3px solid #fff;box-shadow:0 2px 10px rgba(120,60,100,.45);">★</div>',
    className: '', iconSize: [36, 36], iconAnchor: [18, 18]
  });
  L.marker(VENUE, { icon: venueIcon }).addTo(map)
    .bindPopup('<strong style="color:#B23F7E;">★ 会場</strong><br>呉服町通り（Iconic Shizuoka 2026）');

  var spots = [
    { n: 1,  name: 'GSパーク 静岡追手町',           lat: 34.9754019, lng: 138.3818719, dist: '約58m・徒歩1分',  cap: '—',    price: '30分300円',      color: '#2E7D32' },
    { n: 2,  name: '呉服町タワーパーキング',           lat: 34.9758675, lng: 138.3804375, dist: '約157m・徒歩2分', cap: '445台', price: '30分250円',      color: '#2E7D32' },
    { n: 3,  name: '三井のリパーク 静岡呉服町1丁目',  lat: 34.9755258, lng: 138.3801142, dist: '約160m・徒歩2分', cap: '35台',  price: '最大 昼1,900円', color: '#2E7D32' },
    { n: 4,  name: 'APパーク1（追手町）',            lat: 34.9746191, lng: 138.384085,  dist: '約219m・徒歩3分', cap: '—',    price: '15分100円',      color: '#C87A22' },
    { n: 5,  name: '稲森パーキング追手町',             lat: 34.9744968, lng: 138.3842267, dist: '約234m・徒歩3分', cap: '27台',  price: '15分100円',      color: '#C87A22' },
    { n: 6,  name: '名鉄協商パーキング 静岡呉服町',   lat: 34.9754707, lng: 138.37918,   dist: '約238m・徒歩3分', cap: '4台',   price: '40分200円',      color: '#C87A22' },
    { n: 7,  name: '静岡呉服町スクエア駐車場',         lat: 34.9761685, lng: 138.3792246, dist: '約266m・徒歩4分', cap: '172台', price: '60分400円',      color: '#C87A22' },
    { n: 8,  name: 'スペース 静岡常磐町第1',           lat: 34.9725504, lng: 138.3823941, dist: '約268m・徒歩4分', cap: '—',    price: '30分200円',      color: '#C87A22' },
    { n: 9,  name: 'NPD松坂屋前パーキング',            lat: 34.9736059, lng: 138.3888396, dist: '約665m・徒歩8分', cap: '—',    price: '30分300円',      color: '#C0392B' },
    { n: 10, name: 'パークワン静岡駐車場',              lat: 34.9745338, lng: 138.3890138, dist: '約667m・徒歩8分', cap: '—',    price: '20分150円',      color: '#C0392B' }
  ];

  spots.forEach(function (p) {
    var icon = L.divIcon({
      html: '<div style="background:' + p.color + ';color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.28);">' + p.n + '</div>',
      className: '', iconSize: [28, 28], iconAnchor: [14, 14]
    });
    L.marker([p.lat, p.lng], { icon: icon }).addTo(map)
      .bindPopup(
        '<strong>' + p.n + '. ' + p.name + '</strong><br>会場から: ' + p.dist +
        '<br>台数: ' + p.cap + '<br>料金: ' + p.price +
        '<br><a href="https://maps.google.com/maps?q=' + p.lat + ',' + p.lng +
        '" target="_blank" rel="noopener" style="color:#B23F7E;font-size:12px;">Googleマップで開く</a>'
      );
  });
})();

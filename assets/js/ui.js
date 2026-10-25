// 動き・部品（ui-motion-parts）。__ICON_名前__ は pick.py が Lucide のSVGに置き換える
// 部品ごとに「// @part 名前」で区切ってある。pick.py で使う部品だけ書き出す
//
// ふつうのサイト：読み込むだけで、ページにある部品が動く
// アプリ（あとから画面を書き換える）：
//   ui.init(要素)     … あとから出した部品を動かす（同じ部品を2回動かすことはない）
//   ui.destroy(要素)  … 消す前に、その中の部品のタイマーなどを片付ける
//   ui.watch()        … 画面の変化を見張って、上の2つを自動でやる（<script src="ui.js" data-watch> でも同じ）
(function () {
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var ui = window.ui = window.ui || {};
  var me = document.currentScript;
  // 画面に出る文言。英語などのサイトは、ui.js より前に window.UI_TEXT = { close: 'Close', … } を書けば差し替わる
  var T = Object.assign({
    close: '閉じる', menuOpen: 'メニューを開く', menuClose: 'メニューを閉じる',
    slide: '{n}枚目へ', zoom: '写真を拡大表示', prev: '前の写真', next: '次の写真',
    mqStop: '流れを止める', copied: 'コピーしました', copyNg: 'コピーできませんでした',
    acList: '候補', acHits: '{n}件の候補があります', acNone: '候補はありません'
  }, window.UI_TEXT || {});
  var tx = function (k, n) { return T[k].replace('{n}', n); };
  // 1つの部品でエラーが出ても、ほかの部品は動かす
  var part = function (fn) { try { fn(); } catch (e) { console.error(e); } };

  // ---- 部品を動かす仕組み ----
  var inits = [], offs = [];
  // 部品ごとに「範囲（root）の中を探して動かす」関数を登録する
  var add = function (fn) { inits.push(fn); };
  // 同じ要素を2回動かさないための目印
  var once = function (el, k) { var s = el.__ui || (el.__ui = {}); if (s[k]) return false; s[k] = 1; return true; };
  // root の中と、root 自身から探す
  var finds = function (sel, root) { var a = $$(sel, root); if (root.matches && root.matches(sel)) a.unshift(root); return a; };
  // 要素が消えるときの後片付けを登録する
  var keep = function (el, off) { offs.push({ el: el, off: off }); };
  ui.init = function (root) { root = root || document; inits.forEach(function (f) { part(function () { f(root); }); }); };
  ui.destroy = function (root) {
    offs = offs.filter(function (o) {
      var hit = root ? root === o.el || (root.contains && root.contains(o.el)) : !o.el.isConnected;
      if (hit) part(o.off);
      return !hit;
    });
  };
  var mo = null;
  ui.watch = function () {
    if (mo || !window.MutationObserver) return;
    var added = [], sweep = false, tick = null;
    mo = new MutationObserver(function (ms) {
      ms.forEach(function (m) {
        [].forEach.call(m.addedNodes, function (n) { if (n.nodeType === 1) added.push(n); });
        if (m.removedNodes.length) sweep = true;
      });
      if (tick) return;
      // まとめて1回だけ処理する。動かしただけの要素は消えた扱いにしない
      tick = setTimeout(function () {
        tick = null;
        var a = added; added = [];
        a.forEach(function (n) { if (n.isConnected) ui.init(n); });
        if (sweep) { sweep = false; ui.destroy(); }
      }, 0);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  };

  // @part lb
  // ---- モーダル：写真を押すと大きく見られる（中の写真が増減しても追いかける） ----
  add(function (root) {
    finds('[data-lb]', root).forEach(function (g) {
      if (!once(g, 'lb')) return;
      var dlg = document.createElement('dialog'); dlg.className = 'lb'; dlg.setAttribute('aria-label', T.zoom);
      dlg.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>' +
        '<button type="button" class="lb-x"><svg class="ic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>' +
        '<button type="button" class="lb-p"><svg class="ic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m15 18-6-6 6-6"/></svg></button>' +
        '<button type="button" class="lb-n"><svg class="ic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="m9 18 6-6-6-6"/></svg></button>';
      dlg.querySelector('.lb-x').setAttribute('aria-label', T.close);
      dlg.querySelector('.lb-p').setAttribute('aria-label', T.prev);
      dlg.querySelector('.lb-n').setAttribute('aria-label', T.next);
      document.body.appendChild(dlg);
      var img = dlg.querySelector('img'), cap = dlg.querySelector('figcaption'), links = [], i = 0;
      var show = function (k) { i = (k + links.length) % links.length; var a = links[i], im = a.querySelector('img'); img.src = a.href; img.alt = im ? im.alt : ''; cap.textContent = (i + 1) + ' / ' + links.length; };
      g.addEventListener('click', function (e) {
        var a = e.target.closest('a'); if (!a || !g.contains(a) || !dlg.showModal) return;
        e.preventDefault(); links = $$('a', g); show(links.indexOf(a)); dlg.showModal();
      });
      dlg.querySelector('.lb-x').onclick = function () { dlg.close(); };
      dlg.querySelector('.lb-p').onclick = function () { show(i - 1); };
      dlg.querySelector('.lb-n').onclick = function () { show(i + 1); };
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') show(i + 1); if (e.key === 'ArrowLeft') show(i - 1); });
      keep(g, function () { dlg.remove(); });
    });
  });

  // @part mq
  // ---- 流れるロゴ帯：横に流れ続ける。触れる・フォーカス・停止ボタンで止まる ----
  add(function (root) {
    finds('.mq', root).forEach(function (mq) {
      var tr = mq.querySelector('.mq-track'); if (!tr || R || !once(mq, 'mq')) return;
      // .mq-view が無ければ作る（React などでは HTML に .mq-view を書いておく）
      var view = mq.querySelector('.mq-view');
      if (!view) { view = document.createElement('div'); view.className = 'mq-view'; tr.parentNode.insertBefore(view, tr); view.appendChild(tr); }
      mq.classList.add('on');
      // 画面幅より短いと途切れるので、1周分が画面幅を超えるまで複製してから、それを2つ並べる
      var orig = [].slice.call(tr.children), clone = function (li) {
        var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true');
        $$('a, button, input, [tabindex]', c).forEach(function (f) { f.setAttribute('tabindex', '-1'); });
        tr.appendChild(c);
      };
      var reps = Math.max(1, Math.ceil(Math.max(view.clientWidth, screen.width) / Math.max(1, tr.scrollWidth)));
      for (var k = 1; k < reps * 2; k++) orig.forEach(clone);
      var dur = function () { mq.style.setProperty('--mq-dur', Math.max(12, tr.scrollWidth / 2 / (+mq.dataset.speed || 40)) + 's'); };
      dur(); addEventListener('load', dur);
      var tg = document.createElement('button'); tg.type = 'button'; tg.className = 'mq-tg';
      tg.setAttribute('aria-label', T.mqStop); tg.setAttribute('aria-pressed', 'false');
      tg.innerHTML = '<svg class="ic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><rect x="14" y="3" width="5" height="18" rx="1"/><rect x="5" y="3" width="5" height="18" rx="1"/></svg>' + '<svg class="ic" xmlns="http://www.w3.org/2000/svg" width="24" height="24" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ><path d="M5 5a2 2 0 0 1 3.008-1.728l11.997 6.998a2 2 0 0 1 .003 3.458l-12 7A2 2 0 0 1 5 19z"/></svg>';
      tg.onclick = function () { tg.setAttribute('aria-pressed', mq.classList.toggle('stop') ? 'true' : 'false'); };
      mq.appendChild(tg);
      keep(mq, function () { removeEventListener('load', dur); });
    });
  });

  // @end
  var start = function () {
    ui.init(document);
    if (me && me.hasAttribute('data-watch')) ui.watch();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();

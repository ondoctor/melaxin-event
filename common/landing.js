// event.melaxin.kr 랜딩 공통 동작 — 모든 랜딩 폴더가 ../common/landing.js 로 씀.
// 랜딩마다 다른 값은 그 폴더 index.html의 <body> 칸으로 정해요:
//   data-ends="2026-12-01"           이 날(한국 시간 0시)부터 가격·시술 칸을 숨기고 '이벤트 끝' 안내를 보임
//   data-msg-kakao="리프팅 이벤트 보고 왔어요"   상담 버튼(class js-chat, data-ch=채널)을 누를 때 보내질 첫 문구 — 채널마다 data-msg-<채널>
//     kakao·wechat = 링크로 미리 채우기가 안 돼서 '복사 + 안내' / line-jp·line-tw·whatsapp = 채팅 입력칸에 바로 들어감(아래 CHANNELS)
// 끝난 뒤 다른 랜딩이 진행 중이면(common/current.js) '이달 이벤트 보기' 버튼이 켜져요(class js-next)

// 메타 픽셀 — 회사 픽셀 ID를 받으면 아래 따옴표 안에 넣어요(모든 랜딩에 같이 적용). 비어 있으면 픽셀을 불러오지 않아요.
var PIXEL_ID = "";
// 개인정보 처리방침 주소(https://…) — 넣으면 모든 랜딩 맨 아래에 링크가 생겨요. 비어 있으면 안 보여요.
var PRIVACY_URL = "";

// 카톡 첫 문구 끝에 붙는 출처 코드 — 광고 주소 꼬리표(utm_source·utm_content)로 만들어요.
//   예: ?utm_source=ig&utm_content=a_guide  →  '리프팅 이벤트 보고 왔어요 (IG-A)'
//   utm_source는 아래 표의 두 글자로(표에 없으면 앞 세 글자), utm_content는 '_' 앞부분(최대 3글자). 꼬리표가 없으면 문구 그대로
var SOURCE_CODES = {
  ig: "IG", instagram: "IG", insta_profile: "IP",
  fb: "FB", facebook: "FB", meta: "MT", msg: "MS", an: "AN",
  th: "TH", threads: "TH", tiktok: "TT", youtube: "YT",
  kakao: "KC", kakao_ch: "KC", naver: "NV"
};

// 상담 채널 — 주소는 운영 리소스 '닥터멜락신_상담채널.md'(버튼 href에도 같은 주소 = 스크립트가 안 돌아도 열림)
//   prefill: 이 주소 뒤에 첫 문구를 붙이면 입력칸에 채워짐(LINE 공식 문서 'LINE URL scheme' oaMessage, WhatsApp click to chat)
//   appOnly: 휴대폰 LINE 앱에서만 됨(PC는 미리 채우기 없이 버튼 주소로 — lin.ee는 PC에서 QR을 보여 줌)
//   copied/nocopy: 미리 채우기가 안 되는 채널의 복사 안내({t} = 첫 문구, 표에 없는 채널은 카톡 안내를 씀)
var CHANNELS = {
  "kakao":    { copied: "‘{t}’ 복사됨 — 채팅창에 붙여 넣어 주세요", nocopy: "채팅창에 ‘{t}’라고 보내 주세요" },
  "line-jp":  { prefill: "https://line.me/R/oaMessage/%40010claqq/?", appOnly: true },
  "line-tw":  { prefill: "https://line.me/R/oaMessage/%40909lnxrc/?", appOnly: true },
  "wechat":   { copied: "已复制「{t}」— 请粘贴到聊天窗口发送", nocopy: "请在聊天窗口发送「{t}」" },
  "whatsapp": { prefill: "https://wa.me/821021903760?text=" }
};

(function () {
  var body = document.body;
  var ENDED = false;
  var PHONE = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
  var params = new URLSearchParams(location.search);
  var LANDING = (location.pathname.match(/([^\/]+)\/[^\/]*$/) || [])[1] || "";

  function clean(v, n) { return (v || "").replace(/[^A-Za-z0-9]/g, "").slice(0, n).toUpperCase(); }
  function sourceTag() {
    var src = (params.get("utm_source") || "").toLowerCase();
    var code = SOURCE_CODES[src] || clean(src, 3);   // 표에 없으면 세 글자 — 표의 두 글자 코드와 안 겹침
    if (!code) return "";
    var ad = clean((params.get("utm_content") || "").split(/[_-]/)[0], 3);
    return " (" + code + (ad ? "-" + ad : "") + ")";
  }
  var TAG = sourceTag();

  // 개인정보 처리방침 링크 자리
  var legal = document.querySelector(".legal");
  if (legal && /^https:\/\//.test(PRIVACY_URL)) {
    var p = document.createElement("p"), a = document.createElement("a");
    a.href = PRIVACY_URL; a.target = "_blank"; a.rel = "noopener"; a.textContent = "개인정보 처리방침";
    p.className = "privacy"; p.appendChild(a); legal.appendChild(p);
  }

  // 이벤트 끝 날짜가 지났으면 끝 안내로
  if (body.dataset.ends && Date.now() >= Date.parse(body.dataset.ends + "T00:00:00+09:00")) {
    body.classList.add("ended");
    ENDED = true;                        // 끝난 이벤트 문구는 넣지 않고 채팅만 엶
    // 다른 랜딩이 진행 중이면(common/current.js) '이달 이벤트 보기' 버튼을 켜고 광고 꼬리표를 붙여 연결
    if (window.CURRENT_LANDING && CURRENT_LANDING !== LANDING + "/") {
      body.classList.add("has-next");
      document.querySelectorAll(".js-next").forEach(function (a) {
        a.href = "../" + CURRENT_LANDING + location.search;
      });
    }
  }

  if (PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,'script','https://connect.facebook.net/en_US/fbevents.js');
    // 자동 수집 끔(버튼 글자·페이지 정보를 메타가 알아서 가져가지 않게). 고급 매칭(전화번호 등)은 init에 아무것도 안 넘겨서 꺼져 있음 — 운영 점검 11-10
    fbq('set', 'autoConfig', false, PIXEL_ID);
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }
  // 버튼 이벤트에 랜딩 이름·광고 꼬리표를 같이 실음. 병원 사이트는 메타가 이 값들을 지울 수 있음 → 그래도 이벤트 수는 남음
  function track(name, label) {
    if (!window.fbq) return;
    var data = { content_name: label, content_category: LANDING };
    ["utm_source", "utm_campaign", "utm_content"].forEach(function (k) {
      if (params.get(k)) data[k] = params.get(k).slice(0, 60);
    });
    fbq('track', name, data);
  }

  var toast = document.querySelector('.toast');
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast.t);
    showToast.t = setTimeout(function () { toast.classList.remove('show'); }, 2600);
  }
  function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return fallbackCopy(text); });
      }
    } catch (e) {}
    return Promise.resolve(fallbackCopy(text));
  }
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    return ok;
  }

  document.querySelectorAll('.js-chat').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      var ch = a.dataset.ch, conf = CHANNELS[ch] || CHANNELS.kakao;
      track('Contact', ch);
      var msg = ENDED ? "" : (body.getAttribute('data-msg-' + ch) || "");
      if (!msg || (conf.appOnly && !PHONE)) return;   // 첫 문구가 없거나 PC의 LINE이면 그냥 버튼 주소로
      msg += TAG;
      ev.preventDefault();
      if (conf.prefill) { location.href = conf.prefill + encodeURIComponent(msg); return; }
      var href = a.href;
      copyText(msg).then(function (ok) {
        showToast((ok ? conf.copied : conf.nocopy).split('{t}').join(msg));
        setTimeout(function () { location.href = href; }, 1100);
      });
    });
  });
  document.querySelectorAll('.js-map').forEach(function (a) {
    a.addEventListener('click', function () { track('FindLocation', a.dataset.map); });
  });
})();

// event.melaxin.kr 랜딩 공통 동작 — 모든 랜딩 폴더가 ../common/landing.js 로 씀.
// 랜딩마다 다른 값은 그 폴더 index.html의 <body> 칸으로 정해요:
//   data-ends="2026-12-01"           이 날(한국 시간 0시)부터 가격·시술 칸을 숨기고 '이벤트 끝' 안내를 보임
//   data-kakao-text="리프팅 이벤트 보고 왔어요"   카톡 버튼을 누르면 복사되는 첫 문구
// 끝난 뒤 다른 랜딩이 진행 중이면(common/current.js) '이달 이벤트 보기' 버튼이 켜져요(class js-next)

// 메타 픽셀 — 회사 픽셀 ID를 받으면 아래 따옴표 안에 넣어요(모든 랜딩에 같이 적용). 비어 있으면 픽셀을 불러오지 않아요.
var PIXEL_ID = "";

(function () {
  var body = document.body;
  var KAKAO_TEXT = body.dataset.kakaoText || "";

  // 이벤트 끝 날짜가 지났으면 끝 안내로
  if (body.dataset.ends && Date.now() >= Date.parse(body.dataset.ends + "T00:00:00+09:00")) {
    body.classList.add("ended");
    KAKAO_TEXT = "";                     // 끝난 이벤트 문구는 복사하지 않음
    // 다른 랜딩이 진행 중이면(common/current.js) '이달 이벤트 보기' 버튼을 켜고 광고 꼬리표를 붙여 연결
    var here = (location.pathname.match(/([^\/]+\/)[^\/]*$/) || [])[1];
    if (window.CURRENT_LANDING && CURRENT_LANDING !== here) {
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
    fbq('init', PIXEL_ID);
    fbq('track', 'PageView');
  }
  function track(name, label) {
    if (window.fbq) fbq('track', name, { content_name: label });
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

  document.querySelectorAll('.js-kakao').forEach(function (a) {
    a.addEventListener('click', function (ev) {
      track('Contact', 'kakao');
      if (!KAKAO_TEXT) return;           // 첫 문구가 없으면 그냥 채팅으로
      ev.preventDefault();
      var href = a.href;
      copyText(KAKAO_TEXT).then(function (ok) {
        showToast(ok ? '‘' + KAKAO_TEXT + '’ 복사됨 — 채팅창에 붙여 넣어 주세요'
                     : '채팅창에 ‘' + KAKAO_TEXT + '’라고 보내 주세요');
        setTimeout(function () { location.href = href; }, 1100);
      });
    });
  });
  document.querySelectorAll('.js-phone').forEach(function (a) {
    a.addEventListener('click', function () { track('Contact', 'phone'); });
  });
  document.querySelectorAll('.js-map').forEach(function (a) {
    a.addEventListener('click', function () { track('FindLocation', a.dataset.map); });
  });
})();

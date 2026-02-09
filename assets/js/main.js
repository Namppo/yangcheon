window.App = (() => {
    const heroImages = [
        "assets/img/hero-1.jpg",
        "assets/img/hero-2.jpg",
        "assets/img/hero-3.jpg"
    ];

    let idx = 0;
    let timerId = null;

    // Google Apps Script Web App (provided)
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwlpuFFytwvD7878eKTk21Nfwg7I3bNlo2DUbzHZBE_Yt7iqP3CGtM2ZUoZbVL4cFQpdg/exec";

    // If your Apps Script validates a secret, set the same value here.
    // If you removed SECRET check from Apps Script, you can keep this empty and remove it from payload.
    const WEB_APP_SECRET = "CHANGE_ME_TO_A_RANDOM_STRING";

    const GALLERY_PAGE_SIZE = 4;

    const SCHEDULE_SHOW_COUNT = 3;
    const GITHUB_OWNER = "Namppo";
    const GITHUB_REPO = "yangcheon";
    const SCHEDULE_LABEL = "schedule";

    function setHero(i){
        idx = (i + heroImages.length) % heroImages.length;

        const slide = document.querySelector(".hero__slide");
        if (!slide) return;

        slide.style.backgroundImage = `url('${heroImages[idx]}')`;
    }

    function restartAuto(){
        if (timerId) window.clearInterval(timerId);
        timerId = window.setInterval(() => setHero(idx + 1), 5000);
    }

    function bindHeroNav(){
        const prev = document.querySelector(".hero__nav--prev");
        const next = document.querySelector(".hero__nav--next");

        prev?.addEventListener("click", () => {
            setHero(idx - 1);
            restartAuto();
        });

        next?.addEventListener("click", () => {
            setHero(idx + 1);
            restartAuto();
        });
    }

    function bindActiveMenu(){
        const links = Array.from(document.querySelectorAll(".menubar a"));
        const targets = links
            .map(a => document.querySelector(a.getAttribute("href")))
            .filter(Boolean);

        if (!targets.length) return;

        const io = new IntersectionObserver((entries) => {
            const visible = entries
                .filter(e => e.isIntersecting)
                .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;

            const id = `#${visible.target.id}`;
            links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === id));
        }, { threshold: [0.25, 0.4, 0.6] });

        targets.forEach(t => io.observe(t));
    }

    async function renderScheduleBoard(){
        const listEl = document.getElementById("scheduleList");
        const allBtn = document.getElementById("scheduleAllBtn");
        const writeBtn = document.getElementById("scheduleWriteBtn");
        if (!listEl) return;

        const issuesUrl =
            `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues` +
            `?q=is%3Aissue+is%3Aopen+label%3A${encodeURIComponent(SCHEDULE_LABEL)}+sort%3Acreated-desc`;

        const newIssueUrl =
            `https://github.com/${GITHUB_OWNER}/${GITHUB_REPO}/issues/new` +
            `?labels=${encodeURIComponent(SCHEDULE_LABEL)}` +
            `&title=${encodeURIComponent("YYYY-MM-DD (hh:mm) VS 상대팀 (대회명)")}`;

        if (allBtn) allBtn.href = issuesUrl;
        if (writeBtn) writeBtn.href = newIssueUrl;

        try {
            const apiUrl =
                `https://api.github.com/repos/${encodeURIComponent(GITHUB_OWNER)}/${encodeURIComponent(GITHUB_REPO)}/issues` +
                `?state=open&labels=${encodeURIComponent(SCHEDULE_LABEL)}` +
                `&per_page=${SCHEDULE_SHOW_COUNT}&sort=created&direction=desc`;

            const resp = await fetch(apiUrl, {
                cache: "no-store",
                headers: { "Accept": "application/vnd.github+json" }
            });

            if (!resp.ok) throw new Error("GitHub API failed");

            const issues = await resp.json().catch(() => []);
            listEl.innerHTML = "";

            if (!Array.isArray(issues) || issues.length === 0) {
                const li = document.createElement("li");
                li.className = "muted";
                li.textContent = "등록된 일정이 없습니다. (schedule 라벨로 이슈를 작성해 주세요)";
                listEl.appendChild(li);
                return;
            }

            for (const it of issues) {
                const li = document.createElement("li");
                const a = document.createElement("a");
                a.href = it.html_url;
                a.target = "_blank";
                a.rel = "noreferrer";
                a.textContent = it.title || "제목 없음";
                li.appendChild(a);
                listEl.appendChild(li);
            }
        } catch (e) {
            listEl.innerHTML = "";
            const li = document.createElement("li");
            li.className = "muted";
            li.textContent = "일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.";
            listEl.appendChild(li);
        }
    }

    async function renderGallery(){
        const grid = document.getElementById("galleryGrid");
        const moreWrap = document.getElementById("galleryMoreWrap");
        const moreBtn = document.getElementById("galleryMoreBtn");
        if (!grid) return;

        function createThumb(it){
            const a = document.createElement("a");
            a.className = "thumb";
            a.href = it.href || it.src;
            a.target = "_blank";
            a.rel = "noreferrer";

            const img = document.createElement("img");
            img.src = it.src;
            img.alt = it.alt || "갤러리 사진";
            img.loading = "lazy";

            a.appendChild(img);
            return a;
        }

        try {
            const resp = await fetch("gallery.json", { cache: "no-store" });
            if (!resp.ok) return;

            const data = await resp.json().catch(() => null);
            const items = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];

            let shownCount = 0;

            function renderNext(){
                const next = items.slice(shownCount, shownCount + GALLERY_PAGE_SIZE);
                for (const it of next) {
                    if (!it || !it.src) continue;
                    grid.appendChild(createThumb(it));
                }
                shownCount += next.length;

                const hasMore = shownCount < items.length;
                if (moreWrap) moreWrap.hidden = !hasMore;
                if (moreBtn) moreBtn.disabled = !hasMore;
            }

            // 초기 렌더: 최신 4개
            grid.innerHTML = "";
            shownCount = 0;
            renderNext();

            // 더보기 핸들러(중복 바인딩 방지)
            if (moreBtn) {
                moreBtn.onclick = () => renderNext();
            }
        } catch (e) {
            // 실패 시 그냥 기존 UI(빈 상태) 유지
        }
    }

    function fakeSubmit(e){
        e.preventDefault();
        const result = document.getElementById("formResult");
        if (!result) return false;
        result.hidden = false;
        result.textContent = "입력하신 내용이 확인되었습니다. (정적 페이지라 실제 전송은 되지 않습니다)";
        return false;
    }

    async function sendInquiry(e){
        e.preventDefault();

        const name = document.getElementById("inqName")?.value?.trim();
        const contact = document.getElementById("inqContact")?.value?.trim();
        const message = document.getElementById("inqMessage")?.value?.trim();
        const result = document.getElementById("formResult");

        if (!name || !contact || !message) {
            if (result) {
                result.hidden = false;
                result.style.color = "#d92d20";
                result.textContent = "모든 항목을 입력해 주세요.";
            }
            return false;
        }

        try {
            if (result) {
                result.hidden = false;
                result.style.color = "#344054";
                result.textContent = "전송 중입니다...";
            }

            const payload = {
                // If Apps Script checks secret, keep this.
                // If not, remove this field.
                secret: WEB_APP_SECRET,
                name,
                contact,
                message
            };

            // Apps Script web app: using text/plain is often more reliable than application/json
            const resp = await fetch(WEB_APP_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify(payload)
            });

            const data = await resp.json().catch(() => ({}));

            if (!resp.ok || !data.ok) {
                throw new Error(data.error || "Failed");
            }

            if (result) {
                result.style.color = "#0ea44a";
                result.textContent = "전송 완료! 확인 후 연락드릴게요.";
            }
        } catch (err) {
            if (result) {
                result.style.color = "#d92d20";
                result.textContent = "전송 실패. 잠시 후 다시 시도해 주세요.";
            }
        }

        return false;
    }

    function init(){
        setHero(0);
        bindHeroNav();
        bindActiveMenu();
        renderScheduleBoard();
        renderGallery();
        restartAuto();
    }

    document.addEventListener("DOMContentLoaded", init);

    return { fakeSubmit, sendInquiry };
})();
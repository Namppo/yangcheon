window.App = (() => {
    const heroImages = [
        "assets/img/hero-1.jpg",
        "assets/img/hero-2.jpg",
        "assets/img/hero-3.jpg"
    ];

    let idx = 0;
    let timerId = null;

    // Google Apps Script Web App (provided)
    const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwWMN8dVOCW5oum73oxLvDnLsSpA5-xhvB13wYi-HMQCoJOAyrBr7zMImbixaTEqc7oeQ/exec";

    // If your Apps Script validates a secret, set the same value here.
    // If you removed SECRET check from Apps Script, you can keep this empty and remove it from payload.
    const WEB_APP_SECRET = "CHANGE_ME_TO_A_RANDOM_STRING";

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
        restartAuto();
    }

    document.addEventListener("DOMContentLoaded", init);

    return { fakeSubmit, sendInquiry };
})();
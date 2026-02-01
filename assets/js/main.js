window.App = (() => {
    const heroImages = [
        "assets/img/hero-1.jpg",
        "assets/img/hero-2.jpg",
        "assets/img/hero-3.jpg"
    ];

    let idx = 0;
    let timerId = null;

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

    function init(){
        setHero(0);        // 처음은 hero-1
        bindHeroNav();
        bindActiveMenu();
        restartAuto();     // 5초마다 hero-2, hero-3, hero-1...
    }

    document.addEventListener("DOMContentLoaded", init);

    return { fakeSubmit };
})();
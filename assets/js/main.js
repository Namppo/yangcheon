window.App = (() => {
    const heroImages = [
        { left: "assets/img/hero-1.jpg", mid: "assets/img/hero-2.jpg", right: "assets/img/hero-3.jpg" },
        { left: "assets/img/hero-2.jpg", mid: "assets/img/hero-3.jpg", right: "assets/img/hero-1.jpg" },
        { left: "assets/img/hero-3.jpg", mid: "assets/img/hero-1.jpg", right: "assets/img/hero-2.jpg" }
    ];

    let idx = 0;

    function setHero(i){
        idx = (i + heroImages.length) % heroImages.length;
        const set = heroImages[idx];

        const left = document.querySelector(".hero__panel--left");
        const mid = document.querySelector(".hero__panel--mid");
        const right = document.querySelector(".hero__panel--right");

        if (!left || !mid || !right) return;

        left.style.backgroundImage = `url('${set.left}')`;
        mid.style.backgroundImage = `url('${set.mid}')`;
        right.style.backgroundImage = `url('${set.right}')`;
    }

    function bindHeroNav(){
        const prev = document.querySelector(".hero__nav--prev");
        const next = document.querySelector(".hero__nav--next");
        prev?.addEventListener("click", () => setHero(idx - 1));
        next?.addEventListener("click", () => setHero(idx + 1));
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
        setHero(0);
        bindHeroNav();
        bindActiveMenu();
    }

    document.addEventListener("DOMContentLoaded", init);

    return { fakeSubmit };
})();
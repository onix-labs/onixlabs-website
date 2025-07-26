(function() {
    window.addEventListener("scroll", function () {
        const navbar = document.getElementById("navbar");
        navbar.classList[window.scrollY > 50 ? "add" : "remove"]("scrolled");
    });
})();
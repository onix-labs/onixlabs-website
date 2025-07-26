(function () {
    const STORAGE_KEY = "theme-preference";

    const applyTheme = function (isDark) {
        document.documentElement.setAttribute("data-bs-theme", isDark ? "dark" : "light");
        const themeToggle = document.getElementById("themeToggle");
        if (themeToggle) {
            themeToggle.checked = isDark;
        }
    };

    const getStoredPreference = function () {
        const value = sessionStorage.getItem(STORAGE_KEY);
        if (value === "dark") return true;
        if (value === "light") return false;
        return null;
    };

    const attachThemeToggleHandler = function () {
        const themeToggle = document.getElementById("themeToggle");
        if (!themeToggle || themeToggle.dataset.handlerAttached === "true") return;

        const storedPref = getStoredPreference();
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        const initialDark = storedPref !== null ? storedPref : prefersDark;
        applyTheme(initialDark);

        // Attach handler
        themeToggle.addEventListener("change", function () {
            const userPrefersDark = themeToggle.checked;
            sessionStorage.setItem(STORAGE_KEY, userPrefersDark ? "dark" : "light");
            applyTheme(userPrefersDark);
        });

        themeToggle.dataset.handlerAttached = "true"; // prevent duplicate handlers

        // OS-level listener (only once)
        if (!window.__themeMediaQueryListenerAttached) {
            const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
            mediaQuery.addEventListener("change", (e) => {
                if (getStoredPreference() === null) {
                    applyTheme(e.matches);
                }
            });
            window.__themeMediaQueryListenerAttached = true;
        }
    };

    // Mutation observer that NEVER disconnects
    const observer = new MutationObserver(function () {
        attachThemeToggleHandler();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // In case the element already exists on first load
    attachThemeToggleHandler();
})();

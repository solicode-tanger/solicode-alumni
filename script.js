document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // 2. Smart Header Logic (Hide on scroll down, show on scroll up)
    let lastScrollY = window.scrollY;
    const nav = document.querySelector('nav');

    if (nav) {
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;

            // Header disappears only when scrolling down
            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                nav.classList.add('nav-hidden');
            } else {
                nav.classList.remove('nav-hidden');
            }

            lastScrollY = currentScrollY;
        });
    }
});

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

    // 3. Load Alumni Data from Google Sheets CSV
    loadAlumniData();
});

async function loadAlumniData() {
    const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR9h7i8TJrfK7WZwpz82XlZRQZbXctfOgjjabmEZ59JJ_qx1IEfA-nxYIT71MhnnZnvRMzN_mGsxfIc/pub?gid=393875575&single=true&output=csv";
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();
        
        const lines = csvText.split('\n').filter(l => l.trim() !== '');
        if (lines.length <= 1) return; // Only headers or empty

        const rows = lines.slice(1);
        
        let inscritsCount = 0;
        let mentorsCount = 0;
        let enPosteCount = 0;
        let freelanceCount = 0;
        let rechercheCount = 0;
        let etudeCount = 0;
        let autreCount = 0;
        let laureatsList = [];

        rows.forEach(row => {
            // Split by comma but ignore commas inside quotes
            const cells = row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
            if(cells.length >= 4) {
                inscritsCount++;
                const nom = cells[0].replace(/^"|"$/g, '').trim();
                const prenom = cells[1].replace(/^"|"$/g, '').trim();
                const portfolio = cells[2].replace(/^"|"$/g, '').trim();
                const mentor = cells[3].replace(/^"|"$/g, '').trim();
                
                let isMentor = false;
                if (mentor.toLowerCase().includes('oui')) {
                    mentorsCount++;
                    isMentor = true;
                }

                const situation = (cells[4] || '').replace(/^"|"$/g, '').trim();
                if (situation.toLowerCase().includes('en poste')) {
                    enPosteCount++;
                } else if (situation.toLowerCase().includes('freelance')) {
                    freelanceCount++;
                } else if (situation.toLowerCase().includes('recherche')) {
                    rechercheCount++;
                } else if (situation.toLowerCase().includes('études')) {
                    etudeCount++;
                } else if (situation !== '') {
                    autreCount++;
                }

                laureatsList.push({nom, prenom, portfolio, isMentor, situation});
            }
        });

        // Update stats on index
        const elInscrits = document.getElementById('stat-inscrits');
        const elMentors = document.getElementById('stat-mentors');
        const elEnPoste = document.getElementById('stat-en-poste');
        const elFreelance = document.getElementById('stat-freelance');
        const elRecherche = document.getElementById('stat-recherche');
        const elEtude = document.getElementById('stat-etude');
        
        // Counter animation could be added here, but simple textContent for now
        if (elInscrits) animateCounter(elInscrits, inscritsCount);
        if (elMentors) animateCounter(elMentors, mentorsCount);
        if (elEnPoste) animateCounter(elEnPoste, enPosteCount);
        if (elFreelance) animateCounter(elFreelance, freelanceCount);
        if (elRecherche) animateCounter(elRecherche, rechercheCount);
        if (elEtude) animateCounter(elEtude, etudeCount);

        // Render table if on laureats page
        const tableContainer = document.getElementById('laureats-grid');
        if (tableContainer) {
            tableContainer.innerHTML = '';
            laureatsList.forEach(l => {
                const card = document.createElement('div');
                card.className = 'laureat-card feature-card'; // Reuse some styling
                
                let portfolioHtml = l.portfolio 
                    ? `<a href="${l.portfolio}" target="_blank" class="btn-ghost" style="padding: 8px 16px; font-size: .8rem; margin-top: 16px;"><i data-lucide="external-link" style="width: 14px; height: 14px;"></i> Portfolio</a>`
                    : `<span style="color: var(--muted); font-size: .8rem; margin-top: 16px; display: inline-block;">Pas de portfolio</span>`;

                let mentorBadge = l.isMentor 
                    ? `<div style="position: absolute; top: 24px; right: 24px; color: var(--yellow); display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-family: 'Space Mono', monospace; background: rgba(245, 194, 40, 0.1); padding: 6px 12px; border-radius: 20px; border: 1px solid rgba(245, 194, 40, 0.3);" title="Mentor Solicode"><i data-lucide="award" style="width: 14px; height: 14px;"></i> Mentor</div>` 
                    : '';

                let statusIcon = 'user';
                let statusColor = 'var(--blue-lt)';
                if (l.situation && l.situation.toLowerCase().includes('en poste')) { statusIcon = 'briefcase'; statusColor = '#6ED8A0'; }
                else if (l.situation && l.situation.toLowerCase().includes('freelance')) { statusIcon = 'rocket'; statusColor = 'var(--yellow)'; }
                else if (l.situation && l.situation.toLowerCase().includes('recherche')) { statusIcon = 'search'; statusColor = '#FF5F57'; }
                else if (l.situation && l.situation.toLowerCase().includes('études')) { statusIcon = 'graduation-cap'; statusColor = '#a855f7'; }

                let statusBadge = l.situation 
                    ? `<div style="font-size: .8rem; color: var(--muted); margin-top: 12px; display: flex; align-items: center; gap: 8px;"><i data-lucide="${statusIcon}" style="width: 16px; height: 16px; color: ${statusColor}"></i> ${l.situation}</div>`
                    : '';

                card.innerHTML = `
                    ${mentorBadge}
                    <div class="feature-icon" style="border-color: ${statusColor}40; color: ${statusColor}"><i data-lucide="${statusIcon}"></i></div>
                    <h3 style="padding-right: ${l.isMentor ? '80px' : '0'}; margin-bottom: 4px;">${l.prenom} ${l.nom}</h3>
                    ${statusBadge}
                    ${portfolioHtml}
                `;
                tableContainer.appendChild(card);
            });
            // Re-initialize lucide icons for new elements
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }
        
    } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
    }
}

function animateCounter(element, target) {
    let current = 0;
    const duration = 1500; // ms
    const stepTime = Math.abs(Math.floor(duration / target));
    
    const timer = setInterval(() => {
        current += 1;
        element.textContent = current;
        if (current >= target) {
            clearInterval(timer);
            element.textContent = target; // Ensure exact final value
        }
    }, stepTime);
}

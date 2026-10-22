const list = document.getElementById('project-list');

// Only allow same-origin links (blocks javascript:, data:, and external URLs)
function safeUrl(u) {
    try {
        const url = new URL(u, location.origin);
        return url.origin === location.origin ? url.pathname + url.search : null;
    } catch {
        return null;
    }
}

function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function el(tag, { text, className, attrs } = {}) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    if (attrs) Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
}

function option(value, label) {
    const o = el('option', { text: label });
    o.value = value;
    return o;
}

function buildCard(project) {
    const platforms = project.platforms || {};

    const card = el('div', { className: 'project-card' });
    card.append(
        el('h3', { text: project.name }),
        el('p', { className: 'project-desc', text: project.description })
    );

    const meta = el('div', { className: 'project-meta' });
    (project.badges || []).forEach(b => meta.append(el('span', { className: 'badge', text: b })));
    card.append(meta);

    const row = el('div', { className: 'download-row' });

    const platformSel = el('select', { className: 'platform-select' });
    platformSel.append(option('', '-- Platform --'));
    Object.keys(platforms).forEach(p => platformSel.append(option(p, capitalize(p))));

    const versionSel = el('select', { className: 'version-select' });
    versionSel.disabled = true;
    versionSel.append(option('', '-- Version --'));

    const btn = el('a', {
        className: 'download-btn disabled',
        text: 'Download',
        attrs: { href: '#', target: '_blank', rel: 'noopener noreferrer' }
    });
    btn.addEventListener('click', e => {
        if (btn.classList.contains('disabled')) e.preventDefault();
    });

    function resetButton() {
        btn.setAttribute('href', '#');
        btn.classList.add('disabled');
    }

    platformSel.addEventListener('change', () => {
        versionSel.replaceChildren(option('', '-- Version --'));
        versionSel.disabled = true;
        resetButton();

        const versions = platforms[platformSel.value];
        if (!versions) return;

        Object.entries(versions).forEach(([label, path]) => {
            const safe = safeUrl(path);
            if (safe) versionSel.append(option(safe, label));
        });
        versionSel.disabled = false;
    });

    versionSel.addEventListener('change', () => {
        const safe = versionSel.value && safeUrl(versionSel.value);
        if (safe) {
            btn.setAttribute('href', safe);
            btn.classList.remove('disabled');
        } else {
            resetButton();
        }
    });

    row.append(platformSel, versionSel, btn);
    card.append(row);
    return card;
}

fetch('/projects.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(projects => {
        const frag = document.createDocumentFragment();
        projects.forEach(p => frag.append(buildCard(p)));
        list.append(frag);
    })
    .catch(err => console.error('Could not load projects.json:', err));


const list = document.getElementById('project-list');

// Only allow same-origin links
function safeUrl(u) {
    try {
        const url = new URL(u, location.origin);

        if (url.origin !== location.origin) return null;

        return url.pathname + url.search + url.hash;
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

    if (attrs) {
        Object.entries(attrs).forEach(([k, v]) => {
            node.setAttribute(k, v);
        });
    }

    return node;
}

function option(value, label) {
    const o = el('option', { text: label });
    o.value = value;
    return o;
}

function buildCard(project) {
    const platforms = project.platforms || {};

    // Bootstrap column
    const column = el('div', {
        className: 'col mb-5'
    });

    // Card
    const card = el('div', {
        className: 'card h-100'
    });

    // Project image (optional)
    if (project.image) {
        const image = el('img', {
            className: 'card-img-top',
            attrs: {
                src: safeUrl(project.image) || '',
                alt: project.name
            }
        });

        card.append(image);
    }

    // Project details
    const body = el('div', {
        className: 'card-body p-4'
    });

    const content = el('div', {
        className: 'text-center'
    });

    content.append(
        el('h5', {
            className: 'fw-bolder',
            text: project.name
        }),
        el('p', {
            className: 'mb-0',
            text: project.description || ''
        })
    );

    // Badges
    if (project.badges && project.badges.length) {
        const badges = el('div', {
            className: 'mt-3'
        });

        project.badges.forEach(badge => {
            badges.append(
                el('span', {
                    className: 'badge bg-dark text-white me-1',
                    text: badge
                })
            );
        });

        content.append(badges);
    }

    body.append(content);
    card.append(body);

    // Project actions
    const footer = el('div', {
        className: 'card-footer p-4 pt-0 border-top-0 bg-transparent'
    });

    const row = el('div', {
        className: 'd-flex flex-column gap-2'
    });

    // Platform selector
    const platformSel = el('select', {
        className: 'form-select platform-select'
    });

    platformSel.append(option('', '-- Platform --'));

    Object.keys(platforms).forEach(platform => {
        platformSel.append(
            option(platform, capitalize(platform))
        );
    });

    // Version selector
    const versionSel = el('select', {
        className: 'form-select version-select'
    });

    versionSel.disabled = true;
    versionSel.append(option('', '-- Version --'));

    // Action button
    const btn = el('a', {
        className: 'btn btn-outline-dark mt-2 disabled',
        text: 'Select a platform',
        attrs: {
            href: '#',
            target: '_blank',
            rel: 'noopener noreferrer'
        }
    });

    btn.addEventListener('click', e => {
        if (btn.classList.contains('disabled')) {
            e.preventDefault();
        }
    });

    function resetButton(label = 'Select a version') {
        btn.setAttribute('href', '#');
        btn.textContent = label;
        btn.classList.add('disabled');
        btn.removeAttribute('download');
    }

    // Platform selection
    platformSel.addEventListener('change', () => {
        versionSel.replaceChildren(
            option('', '-- Version --')
        );

        versionSel.disabled = true;
        resetButton();

        const platform = platforms[platformSel.value];

        if (!platform) {
            resetButton('Select a platform');
            return;
        }

        // Configure button label for this platform
        const actionLabel = platform.action || 'Download';

        btn.textContent = actionLabel;

        Object.entries(platform.versions || {}).forEach(([label, data]) => {
            const path = typeof data === 'string' ? data : data.url;
            const safe = safeUrl(path);

            if (safe) {
                versionSel.append(option(safe, label));
            }
        });

        versionSel.disabled = false;

        if (!versionSel.options.length || versionSel.options.length === 1) {
            resetButton('No versions available');
        }
    });

    // Version selection
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
    footer.append(row);
    card.append(footer);
    column.append(card);

    return column;
}

// Load projects
fetch('/projects.json')
    .then(res => {
        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return res.json();
    })
    .then(projects => {
        const frag = document.createDocumentFragment();

        projects.forEach(project => {
            frag.append(buildCard(project));
        });

        list.replaceChildren(frag);
    })
    .catch(err => {
        console.error('Could not load projects.json:', err);

        list.append(
            el('p', {
                className: 'text-danger text-center',
                text: 'Could not load projects.'
            })
        );
    });

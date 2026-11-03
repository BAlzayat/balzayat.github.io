const defsCache = new Map();
const activePopups = new WeakMap();

async function getDef(link, parentP) {
    const existing = activePopups.get(link);
    if (existing) {
        existing.div.remove();
        activePopups.delete(link);
        link.classList.remove('open');
        return;
    }

    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'def_popup';
    loadingDiv.innerText = 'Loading...';
    parentP.after(loadingDiv);

    activePopups.set(link, { div: loadingDiv });
    link.classList.add('open');

    try {
        let content;
        const key = link.href;

        if (defsCache.has(key)) {
            content = defsCache.get(key);
        } else {
            const url = key.replace("/defs/def/", "/defs/min/");
            const response = await fetch(url);

            if (!response.ok) throw new Error(`Fetch Error: ${response.status}`);

            content = await response.text();
            defsCache.set(key, content);
        }

        const currentActive = activePopups.get(link);
        if (currentActive && currentActive.div === loadingDiv) {
            loadingDiv.innerHTML = content;
        }
    } catch (err) {
        console.error("Def Error:", err);
    }
}

document.addEventListener('click', (event) => {
    const link = event.target.closest('a.definition');

    if (link) {
        event.preventDefault();
        const parentP = link.closest('p');
        if (parentP) {
            getDef(link, parentP);
        }
    }
});

document.getElementById('searchButton').addEventListener('click', () => {
    const jsonInput = document.getElementById('jsonInput').value;
    const keysInput = document.getElementById('keyInput').value;
    const result = document.getElementById('result');

    try {
        const jsonData = JSON.parse(jsonInput);
        const keys = keysInput.split(',').map(key => key.trim());
        const results = keys.map(key => {
            const keyPaths = findAllKeyPaths(jsonData, key);
            return keyPaths.length > 0 ? `${key} - ${keyPaths.join('\n')}` : `${key} - Not found`;
        });

        result.textContent = results.join('\n\n');
    } catch (e) {
        result.textContent = 'Invalid JSON data';
    }
});

document.getElementById('getAllKeysButton').addEventListener('click', () => {
    const jsonInput = document.getElementById('jsonInput').value;
    const result = document.getElementById('result');

    try {
        const jsonData = JSON.parse(jsonInput);
        const allKeys = getAllKeys(jsonData);
        const formattedKeys = allKeys.map(path => path.join('.')).join('\n');
        result.textContent = formattedKeys;
    } catch (e) {
        result.textContent = 'Invalid JSON data';
    }
});

function findAllKeyPaths(obj, key, path = [], allPaths = []) {
    if (typeof obj !== 'object' || obj === null) {
        return allPaths;
    }

    for (const k in obj) {
        if (k === key) {
            allPaths.push(path.concat(k).join('.'));
        }
        if (obj.hasOwnProperty(k)) {
            const newPath = path.concat(k);
            if (Array.isArray(obj[k])) {
                obj[k].forEach(item => findAllKeyPaths(item, key, newPath, allPaths));
            } else if (typeof obj[k] === 'object') {
                findAllKeyPaths(obj[k], key, newPath, allPaths);
            }
        }
    }

    return allPaths;
}

function getAllKeys(obj, path = [], allPaths = []) {
    if (typeof obj !== 'object' || obj === null) {
        return allPaths;
    }

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newPath = path.concat(key);
            allPaths.push(newPath);

            if (Array.isArray(obj[key])) {
                obj[key].forEach(item => getAllKeys(item, newPath, allPaths));
            } else if (typeof obj[key] === 'object') {
                getAllKeys(obj[key], newPath, allPaths);
            }
        }
    }

    return allPaths;
}

document.addEventListener('DOMContentLoaded', () => {
    const modeSelector = document.getElementById('modeSelector');
    const systemDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial mode based on system preference or saved mode
    const savedMode = localStorage.getItem('theme') || (systemDarkMode ? 'dark' : 'light');
    setMode(savedMode);

    // Handle mode change via the dropdown
    modeSelector.addEventListener('change', (event) => {
        const selectedMode = event.target.value;
        setMode(selectedMode);
    });

    // Listen for system preference changes
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
            if (modeSelector.value === 'system') {
                setMode(event.matches ? 'dark' : 'light');
            }
        });
    }
});

function setMode(mode) {
    if (mode === 'system') {
        document.body.classList.remove('dark-mode', 'light-mode');
        localStorage.removeItem('theme');
    } else if (mode === 'dark') {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
    } else {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    }
}
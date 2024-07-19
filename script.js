document.getElementById('searchButton').addEventListener('click', () => {
    const jsonInput = document.getElementById('jsonInput').value;
    const keysInput = document.getElementById('keyInput').value;
    const result = document.getElementById('result');

    try {
        const jsonData = JSON.parse(jsonInput);
        const keys = keysInput.split(',').map(key => key.trim());
        const results = keys.map(key => {
            const keyPath = findKeyPath(jsonData, key);
            return keyPath.length > 0 ? `${key} - ${keyPath.join('.')}` : `${key} - Not found`;
        });

        result.textContent = results.join('\n');
    } catch (e) {
        result.textContent = 'Invalid JSON data';
    }
});

function findKeyPath(obj, key, path = []) {
    if (typeof obj !== 'object' || obj === null) {
        return [];
    }

    for (const k in obj) {
        if (k === key) {
            return path.concat(k);
        }
        const result = findKeyPath(obj[k], key, path.concat(k));
        if (result.length > 0) {
            return result;
        }
    }

    return [];
}

document.getElementById('darkModeToggle').addEventListener('change', (event) => {
    document.body.classList.toggle('dark-mode', event.target.checked);
});
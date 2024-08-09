document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const inputJsonTextarea = document.querySelector('#jsonInput');
    const jsonKeysDisplay = document.querySelector('#jsonKeysDisplay');
    const jqKeysDisplay = document.querySelector('#jqKeysDisplay');
    const jsonTreeContainer = document.querySelector('#jsonTreeContainer');
    const keyFilterInput = document.querySelector('#keyFilter');
    const jqKeyFilterInput = document.querySelector('#jqKeyFilter');
    const themeSelect = document.querySelector('#themeSelect');

    const inputCommaText = document.querySelector('#inputCommaText');
    const outputCommaText = document.querySelector('#outputCommaText');
    const toCommaButton = document.querySelector('#toCommaButton');
    const fromCommaButton = document.querySelector('#fromCommaButton');

    let uniqueKeyPaths = new Set();

    // Handle tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            document.querySelector('.tab-button.active').classList.remove('active');
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.querySelectorAll('.tab-content').forEach(tabContent => {
                tabContent.style.display = 'none';
            });
            document.querySelector(`#${tabId}Tab`).style.display = 'block';
        });
    });

    document.querySelector('.tab-button.active').click();

    // Handle comma separation
    const convertToCommaSeparated = () => {
        const inputText = inputCommaText.value;
        const outputText = inputText.split('\n').map(line => line.trim()).filter(line => line).join(', ');
        outputCommaText.value = outputText;
    };

    const convertFromCommaSeparated = () => {
        const inputText = outputCommaText.value;
        const outputText = inputText.split(',').map(item => item.trim()).join('\n');
        inputCommaText.value = outputText;
    };

    toCommaButton.addEventListener('click', convertToCommaSeparated);
    fromCommaButton.addEventListener('click', convertFromCommaSeparated);

    // Render JSON keys
    const renderJsonKeys = (keys) => {
        jsonKeysDisplay.innerHTML = keys.length ? keys.map(key => `<div>${key}</div>`).join('') : 'No keys to display.';
    };

    // Render jq-style JSON keys
    const renderJqKeys = (keys) => {
        jqKeysDisplay.innerHTML = keys.length ? keys.map(key => `<div>${key}</div>`).join('') : 'No jq keys to display.';
    };

    // Render JSON tree
    const renderJsonTree = (data, container) => {
        container.innerHTML = '';

        const createTree = (obj) => {
            const ul = document.createElement('ul');
            for (let key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const li = document.createElement('li');
                    li.textContent = key;

                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        li.appendChild(createTree(obj[key]));
                    } else if (obj[key] !== undefined && obj[key] !== null) {
                        const valueSpan = document.createElement('span');
                        valueSpan.textContent = `: ${obj[key]}`;
                        li.appendChild(valueSpan);
                    }

                    ul.appendChild(li);
                }
            }
            return ul;
        };

        container.appendChild(createTree(data));
    };

    // Extract JSON keys
    const extractJsonKeys = (obj, prefix = '') => {
        for (let key in obj) {
            if (Object.hasOwnProperty.call(obj, key)) {
                const fullKey = prefix ? `${prefix}.${key}` : key;

                if (isNaN(key)) {
                    uniqueKeyPaths.add(fullKey);

                    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                        extractJsonKeys(obj[key], fullKey);
                    }
                }
            }
        }
    };

    // Filter keys
    const filterKeys = (filter, keys) => keys.filter(key => key.includes(filter));

    // Handle JSON input with multiple objects support
    inputJsonTextarea.addEventListener('input', () => {
        try {
            const inputText = inputJsonTextarea.value.trim();

            // Allow multiple JSON objects separated by newlines or custom separator (---)
            const jsonObjects = inputText.split(/\n|---/).map(jsonStr => jsonStr.trim()).filter(jsonStr => jsonStr);

            uniqueKeyPaths.clear();
            jsonTreeContainer.innerHTML = '';

            jsonObjects.forEach(jsonStr => {
                const jsonData = JSON.parse(jsonStr);
                extractJsonKeys(jsonData);
                renderJsonTree(jsonData, jsonTreeContainer);
            });

            const allKeys = Array.from(uniqueKeyPaths);
            renderJsonKeys(allKeys);
            renderJqKeys(allKeys.map(key => `.${key}`));

        } catch (error) {
            jsonKeysDisplay.textContent = 'Invalid JSON.';
            jqKeysDisplay.textContent = 'Invalid JSON.';
            jsonTreeContainer.innerHTML = '';
        }
    });

    // Filter displayed keys
    keyFilterInput.addEventListener('input', () => {
        const filteredKeys = filterKeys(keyFilterInput.value, Array.from(uniqueKeyPaths));
        renderJsonKeys(filteredKeys);
    });

    jqKeyFilterInput.addEventListener('input', () => {
        const filteredKeys = filterKeys(jqKeyFilterInput.value, Array.from(uniqueKeyPaths).map(key => `.${key}`));
        renderJqKeys(filteredKeys);
    });

    // Handle theme switching
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        document.body.classList.toggle('dark-mode', selectedTheme === 'dark');
    });

    // Apply system theme initially
    const applySystemTheme = () => {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.body.classList.toggle('dark-mode', isDarkMode);
        themeSelect.value = 'system';
    };

    applySystemTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
});
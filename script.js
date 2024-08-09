document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const inputJsonTextarea = document.querySelector('#jsonInput');
    const jsonKeysDisplay = document.querySelector('#jsonKeysDisplay');
    const jqKeysDisplay = document.querySelector('#jqKeysDisplay');
    const jsonTreeContainer = document.querySelector('#jsonTreeContainer');
    const keyFilterInput = document.querySelector('#keyFilter');
    const jqKeyFilterInput = document.querySelector('#jqKeyFilter');
    const themeSelect = document.querySelector('#themeSelect');

    // Elements for Comma Separator
    const inputCommaText = document.querySelector('#inputCommaText');
    const outputCommaText = document.querySelector('#outputCommaText');
    const toCommaButton = document.querySelector('#toCommaButton');
    const fromCommaButton = document.querySelector('#fromCommaButton');

    let jsonData = {};
    let uniqueKeyPaths = new Set();

    // Function to handle switching tabs
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

    // Default active tab
    document.querySelector('.tab-button.active').click();

    // Function to handle comma separation
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

    // Attach event listeners for comma separator buttons
    toCommaButton.addEventListener('click', convertToCommaSeparated);
    fromCommaButton.addEventListener('click', convertFromCommaSeparated);

    // Function to render JSON keys
    const renderJsonKeys = (keys) => {
        jsonKeysDisplay.innerHTML = '';
        if (keys.length === 0) {
            jsonKeysDisplay.textContent = 'No keys to display.';
        } else {
            keys.forEach(key => {
                const listItem = document.createElement('div');
                listItem.textContent = key;
                jsonKeysDisplay.appendChild(listItem);
            });
        }
    };

    // Function to render jq-style JSON keys
    const renderJqKeys = (keys) => {
        jqKeysDisplay.innerHTML = '';
        if (keys.length === 0) {
            jqKeysDisplay.textContent = 'No jq keys to display.';
        } else {
            keys.forEach(key => {
                const listItem = document.createElement('div');
                listItem.textContent = key;
                jqKeysDisplay.appendChild(listItem);
            });
        }
    };

    // Function to render JSON tree with only keys that have standalone values
    const renderJsonTree = (data, container) => {
        container.innerHTML = '';

        const createTree = (obj) => {
            const ul = document.createElement('ul');

            for (let key in obj) {
                if (Object.hasOwnProperty.call(obj, key)) {
                    const li = document.createElement('li');
                    li.textContent = key;

                    // Check if the value is an object and not null, while filtering out arrays
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

    // Function to extract keys from JSON and skip array indices
    const extractJsonKeys = (obj, prefix = '') => {
        Object.keys(obj).forEach(key => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            // Skip keys that are array indices
            if (isNaN(key)) {
                uniqueKeyPaths.add(fullKey);

                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    extractJsonKeys(obj[key], fullKey);
                }
            }
        });
    };

    // Function to filter keys
    const filterKeys = (filter, keys) => {
        return keys.filter(key => key.includes(filter));
    };

    // Event listener for JSON input
    inputJsonTextarea.addEventListener('input', () => {
        try {
            jsonData = JSON.parse(inputJsonTextarea.value);
            uniqueKeyPaths.clear();
            extractJsonKeys(jsonData);

            const allKeys = Array.from(uniqueKeyPaths);
            renderJsonKeys(allKeys);
            renderJqKeys(allKeys.map(key => `.${key}`));
            renderJsonTree(jsonData, jsonTreeContainer);

        } catch (error) {
            jsonKeysDisplay.textContent = 'Invalid JSON.';
            jqKeysDisplay.textContent = 'Invalid JSON.';
            jsonTreeContainer.innerHTML = '';
        }
    });

    // Event listener for key filter
    keyFilterInput.addEventListener('input', () => {
        const filteredKeys = filterKeys(keyFilterInput.value, Array.from(uniqueKeyPaths));
        renderJsonKeys(filteredKeys);
    });

    // Event listener for jq key filter
    jqKeyFilterInput.addEventListener('input', () => {
        const filteredKeys = filterKeys(jqKeyFilterInput.value, Array.from(uniqueKeyPaths).map(key => `.${key}`));
        renderJqKeys(filteredKeys);
    });

    // Event listener for theme selection
    themeSelect.addEventListener('change', () => {
        const selectedTheme = themeSelect.value;
        if (selectedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    });

    // Apply system theme initially
    const applySystemTheme = () => {
        const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
            themeSelect.value = 'system';
        } else {
            document.body.classList.remove('dark-mode');
            themeSelect.value = 'system';
        }
    };

    applySystemTheme();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applySystemTheme);
});
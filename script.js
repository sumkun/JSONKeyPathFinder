document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-button');
    const inputJsonTextarea = document.querySelector('#jsonInput');
    const jsonKeysDisplay = document.querySelector('#jsonKeysDisplay');
    const jsonTreeContainer = document.querySelector('#jsonTreeContainer');
    const keyFilterInput = document.querySelector('#keyFilter');
    const themeSelect = document.querySelector('#themeSelect');

    let jsonData = {};
    let uniqueKeyPaths = new Set();

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

    // Function to render JSON tree
    const renderJsonTree = (data, container) => {
        container.innerHTML = '';
        if (Object.keys(data).length === 0) {
            container.textContent = 'No data to display.';
        } else {
            const createTree = (obj) => {
                const ul = document.createElement('ul');
                for (const [key, value] of Object.entries(obj)) {
                    const li = document.createElement('li');
                    li.textContent = key;
                    if (typeof value === 'object' && value !== null) {
                        li.appendChild(createTree(value));
                    } else {
                        li.textContent = `${key}: ${value}`;
                    }
                    ul.appendChild(li);
                }
                return ul;
            };
            container.appendChild(createTree(data));
        }
    };

    // Function to parse JSON and update displays
    const parseAndDisplayJson = () => {
        try {
            jsonData = JSON.parse(inputJsonTextarea.value);
            uniqueKeyPaths.clear();

            // Extract unique keys from JSON
            const extractKeys = (obj, path = '') => {
                if (obj && typeof obj === 'object') {
                    for (const [key, value] of Object.entries(obj)) {
                        // Skip non-string keys and array indices
                        if (typeof key !== 'string' || Array.isArray(obj)) continue;

                        const newPath = path ? `${path}.${key}` : key;
                        uniqueKeyPaths.add(newPath);
                        if (typeof value === 'object' && value !== null) {
                            extractKeys(value, newPath);
                        }
                    }
                }
            };
            extractKeys(jsonData);

            // Render JSON keys and tree
            renderJsonKeys([...uniqueKeyPaths]);
            renderJsonTree(jsonData, jsonTreeContainer);
        } catch (error) {
            console.error('Invalid JSON:', error);
            renderJsonKeys([]);
            renderJsonTree({}, jsonTreeContainer);
            jsonKeysDisplay.textContent = 'Invalid JSON. Please correct the JSON format.';
        }
    };

    // Function to handle tab switch
    const handleTabSwitch = (activeTab) => {
        tabButtons.forEach(button => {
            const targetId = button.getAttribute('data-tab') + 'Tab';
            const targetTab = document.querySelector(`#${targetId}`);
            if (button === activeTab) {
                button.classList.add('active');
                targetTab.style.display = 'block';
            } else {
                button.classList.remove('active');
                targetTab.style.display = 'none';
            }
        });
    };

    // Event listener for tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleTabSwitch(button);
            parseAndDisplayJson(); // Reparse JSON when switching tabs
        });
    });

    // Event listener for key filter input
    keyFilterInput.addEventListener('input', () => {
        const query = keyFilterInput.value.toLowerCase();
        jsonKeysDisplay.querySelectorAll('div').forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(query) ? '' : 'none';
        });
    });

    // Function to apply the selected theme
    const applyTheme = (theme) => {
        if (theme === 'system') {
            const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.toggle('dark-mode', isDarkMode);
        } else if (theme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    };

    // Event listener for theme select
    themeSelect.addEventListener('change', (event) => {
        applyTheme(event.target.value);
    });

    // Set initial theme based on system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeSelect.value = 'system';
        applyTheme('system');
    } else {
        applyTheme('system');
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (themeSelect.value === 'system') {
            applyTheme('system');
        }
    });

    // Initial setup
    handleTabSwitch(tabButtons[0]); // Set default tab
    parseAndDisplayJson(); // Initial parse
});
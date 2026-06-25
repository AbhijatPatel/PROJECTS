/* AuraCalc Pro - Scientific Logic Engine */

document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Management ---
    const body = document.body;
    const themeBtn = document.getElementById('theme-btn');
    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    let currentTheme = localStorage.getItem('auracalc-theme') || 'dark';

    const applyTheme = (theme) => {
        body.setAttribute('data-theme', theme);
        localStorage.setItem('auracalc-theme', theme);
        currentTheme = theme;
        if (theme === 'light') {
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }
    };
    applyTheme(currentTheme);

    themeBtn.addEventListener('click', () => {
        applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
    });

    // --- State Management ---
    const displayCurrent = document.getElementById('display-current');
    const displayHistory = document.getElementById('display-history');
    const buttonsContainer = document.getElementById('calculator-buttons');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history-btn');

    let currentExpression = '0'; // Raw string sent to math.js
    let previousExpression = ''; // Shown in top row
    let shouldResetScreen = false;
    let historyArray = JSON.parse(localStorage.getItem('auracalc-history')) || [];

    // --- Formatters ---
    // Converts internal math string into a beautiful readable string for the display
    const formatForDisplay = (expr) => {
        if (!expr) return '';
        return expr
            .replace(/\*/g, '×')
            .replace(/\//g, '÷')
            .replace(/-/g, '−')
            .replace(/sqrt\(/g, '√(')
            .replace(/pi/g, 'π');
    };

    // Limits display text length by scrolling or truncating securely
    const updateScreen = () => {
        if (currentExpression === '') currentExpression = '0';
        displayCurrent.textContent = formatForDisplay(currentExpression);
        displayHistory.textContent = formatForDisplay(previousExpression);
        
        // Auto scroll to right
        displayCurrent.scrollLeft = displayCurrent.scrollWidth;
    };

    // --- Logic Core ---
    const inputToken = (token) => {
        if (shouldResetScreen && !['+', '-', '*', '/', '^', '%'].includes(token)) {
            currentExpression = '';
        } else if (shouldResetScreen) {
            // If pressing operator right after equal, continue from answer
            if (currentExpression === 'Error' || currentExpression.includes('Error')) {
                currentExpression = '0';
            }
        }
        
        shouldResetScreen = false;

        // Clear initial zero
        if (currentExpression === '0' && token !== '.' && !['+', '-', '*', '/', '^', '%'].includes(token)) {
            currentExpression = token;
        } else {
            currentExpression += token;
        }
        updateScreen();
    };

    const deleteToken = () => {
        if (shouldResetScreen) {
            shouldResetScreen = false;
        }
        if (currentExpression === 'Error' || currentExpression.includes('Error')) {
            clearAll();
            return;
        }

        // Logic to delete complex tokens like "sin(" together
        const complexTokens = ['sin(', 'cos(', 'tan(', 'sqrt('];
        let deletedComplex = false;
        
        for (let tok of complexTokens) {
            if (currentExpression.endsWith(tok)) {
                currentExpression = currentExpression.slice(0, -tok.length);
                deletedComplex = true;
                break;
            }
        }

        if (!deletedComplex) {
            currentExpression = currentExpression.slice(0, -1);
        }

        if (currentExpression === '') {
            currentExpression = '0';
        }
        updateScreen();
    };

    const clearAll = () => {
        currentExpression = '0';
        previousExpression = '';
        shouldResetScreen = false;
        updateScreen();
    };

    // Calculate using Math.js
    const calculateResult = () => {
        if (currentExpression === 'Error' || currentExpression === '0') return;

        try {
            // Close unclosed parentheses automatically before evaluating
            let openP = (currentExpression.match(/\(/g) || []).length;
            let closeP = (currentExpression.match(/\)/g) || []).length;
            let evalString = currentExpression;
            while (openP > closeP) {
                evalString += ')';
                closeP++;
            }

            // High Precision Evaluation using Math.js!
            // math.js solves floating point issues (e.g. math.evaluate('0.1 + 0.2') properly handles precision if configured, 
            // but standard evaluate is also extremely robust). We'll use math.format to enforce precision.
            let result = math.evaluate(evalString);
            
            // Format to avoid extreme precision floats
            result = math.format(result, { precision: 12 });
            
            // Save to history
            const historyItem = {
                exp: formatForDisplay(evalString) + ' =',
                res: result.toString()
            };
            addToHistory(historyItem);

            previousExpression = evalString + '=';
            currentExpression = result.toString();
            shouldResetScreen = true;
            updateScreen();

        } catch (error) {
            // Detailed Error Catching
            console.error(error);
            if (error.message.includes('Unexpected type')) {
                currentExpression = 'Syntax Error';
            } else {
                currentExpression = 'Error';
            }
            shouldResetScreen = true;
            updateScreen();
        }
    };

    // --- History DOM Manipulation ---
    const renderHistory = () => {
        historyList.innerHTML = '';
        if (historyArray.length === 0) {
            historyList.innerHTML = '<div class="history-empty">No calculations yet</div>';
            return;
        }

        historyArray.slice().reverse().forEach((item) => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                <div class="history-exp">${item.exp}</div>
                <div class="history-res">${item.res}</div>
            `;
            // Click history to load it
            div.addEventListener('click', () => {
                currentExpression = item.res;
                previousExpression = '';
                shouldResetScreen = false;
                updateScreen();
            });
            historyList.appendChild(div);
        });
    };

    const addToHistory = (item) => {
        historyArray.push(item);
        if (historyArray.length > 20) historyArray.shift(); // Max 20 items
        localStorage.setItem('auracalc-history', JSON.stringify(historyArray));
        renderHistory();
    };

    clearHistoryBtn.addEventListener('click', () => {
        historyArray = [];
        localStorage.removeItem('auracalc-history');
        renderHistory();
    });

    // --- Advanced Event Delegation ---
    // Instead of looping through all buttons, we attach one listener to the parent
    buttonsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn || btn.disabled) return; // Ignore clicks in gaps or on disabled buttons

        const val = btn.getAttribute('data-val');
        const action = btn.getAttribute('data-action');

        if (val) {
            inputToken(val);
        } else if (action) {
            if (action === 'clear') clearAll();
            if (action === 'delete') deleteToken();
            if (action === 'calculate') calculateResult();
        }
    });

    // --- Keyboard Event Binding ---
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        
        // Prevent default actions for standard calculator keys to prevent weird scrolling
        if (/^[0-9.+\-*/%()^!]$/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
            e.preventDefault();
        }

        if (/^[0-9.()^!%]$/.test(key)) {
            inputToken(key);
        } else if (key === '+' || key === '-' || key === '*' || key === '/') {
            inputToken(key);
        } else if (key.toLowerCase() === 's') {
            inputToken('sin(');
        } else if (key.toLowerCase() === 'c') {
            inputToken('cos(');
        } else if (key.toLowerCase() === 't') {
            inputToken('tan(');
        } else if (key.toLowerCase() === 'p') {
            inputToken('pi');
        } else if (key === 'Enter' || key === '=') {
            calculateResult();
        } else if (key === 'Backspace') {
            deleteToken();
        } else if (key === 'Escape') {
            clearAll();
        }
    });

    // Init App
    updateScreen();
    renderHistory();
});
'use strict';

/* =========================================================
   Basic Calculator - CodeAlpha Task 2
   No eval(). Expressions are evaluated by a small parser
   that follows normal arithmetic precedence (* and / first).
   ========================================================= */

/* ---------- Constants ---------- */
const MAX_LENGTH = 40; // maximum characters in one expression

const OPERATORS = ['+', '-', '*', '/'];

// Symbols shown on screen (\u2212 = minus, \u00D7 = times, \u00F7 = divide)
const DISPLAY_SYMBOLS = {
  '+': '+',
  '-': '\u2212',
  '*': '\u00D7',
  '/': '\u00F7'
};

const ERROR_MESSAGES = {
  DIV_ZERO: 'Cannot divide by zero',
  TOO_LARGE: 'Result too large',
  INVALID: 'Invalid input'
};

/* ---------- DOM elements ---------- */
const historyEl = document.getElementById('history');
const currentEl = document.getElementById('current');
const keypad = document.getElementById('keypad');

/* ---------- State ---------- */
let expression = '';        // e.g. "2+3*4" (uses * and / internally)
let history = '';           // e.g. "2 + 3 × 4 ="
let justEvaluated = false;  // true right after pressing "="
let hasError = false;
let errorMessage = '';

/* =========================================================
   Helper functions
   ========================================================= */

function isOperator(char) {
  return OPERATORS.includes(char);
}

// Returns the number currently being typed (digits and dot at the end)
function getCurrentNumber() {
  const match = expression.match(/[\d.]*$/);
  return match ? match[0] : '';
}

// Turns "7-2*-3" into "7 − 2 × −3" for the screen
function formatDisplay(expr) {
  let output = '';
  for (let i = 0; i < expr.length; i++) {
    const char = expr[i];
    if (isOperator(char)) {
      const symbol = DISPLAY_SYMBOLS[char];
      const previous = expr[i - 1];
      const isBinary = previous !== undefined && !isOperator(previous);
      output += isBinary ? ' ' + symbol + ' ' : symbol;
    } else {
      output += char;
    }
  }
  return output;
}

function resetAll() {
  expression = '';
  history = '';
  justEvaluated = false;
  hasError = false;
  errorMessage = '';
}

/* =========================================================
   Expression evaluator (replacement for eval)
   ========================================================= */

// Step 1: split the text into numbers and operators
function tokenize(expr) {
  const tokens = [];
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    if (/[\d.]/.test(char)) {
      let numberText = '';
      while (i < expr.length && /[\d.]/.test(expr[i])) {
        numberText += expr[i];
        i++;
      }
      const dotCount = (numberText.match(/\./g) || []).length;
      if (dotCount > 1 || numberText === '.') {
        throw new Error('INVALID');
      }
      tokens.push({ type: 'number', value: parseFloat(numberText) });
    } else if (isOperator(char)) {
      tokens.push({ type: 'operator', value: char });
      i++;
    } else {
      throw new Error('INVALID');
    }
  }

  return tokens;
}

// Step 2: calculate using precedence rules
//   expression = term (('+' | '-') term)*
//   term       = factor (('*' | '/') factor)*
//   factor     = number | '-' factor | '+' factor
function evaluateExpression(expr) {
  const tokens = tokenize(expr);
  let position = 0;

  function peek() {
    return tokens[position];
  }

  function next() {
    return tokens[position++];
  }

  function isOp(token, ...ops) {
    return token !== undefined && token.type === 'operator' && ops.includes(token.value);
  }

  function parseExpression() {
    let value = parseTerm();
    while (isOp(peek(), '+', '-')) {
      const op = next().value;
      const right = parseTerm();
      value = op === '+' ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    while (isOp(peek(), '*', '/')) {
      const op = next().value;
      const right = parseFactor();
      if (op === '/') {
        if (right === 0) {
          throw new Error('DIV_ZERO');
        }
        value = value / right;
      } else {
        value = value * right;
      }
    }
    return value;
  }

  function parseFactor() {
    const token = next();
    if (token === undefined) {
      throw new Error('INVALID');
    }
    if (isOp(token, '-')) {
      return -parseFactor();
    }
    if (isOp(token, '+')) {
      return parseFactor();
    }
    if (token.type === 'number') {
      return token.value;
    }
    throw new Error('INVALID');
  }

  const result = parseExpression();

  if (position < tokens.length) {
    throw new Error('INVALID');
  }
  return result;
}

// Rounds floating point noise (0.1 + 0.2 -> 0.3) and avoids "1e-7" style text
function formatResult(number) {
  if (!Number.isFinite(number)) {
    throw new Error('INVALID');
  }

  const rounded = parseFloat(number.toPrecision(12));

  if (Math.abs(rounded) >= 1e15) {
    throw new Error('TOO_LARGE');
  }

  let text = rounded.toString();

  if (text.includes('e')) {
    text = rounded.toFixed(12).replace(/\.?0+$/, '');
  }
  if (text === '-0') {
    text = '0';
  }
  return text;
}

/* =========================================================
   Input handlers
   ========================================================= */

function inputDigit(digit) {
  if (hasError) {
    resetAll();
  }
  if (justEvaluated) {
    resetAll(); // typing a digit after a result starts a new calculation
  }
  if (expression.length >= MAX_LENGTH) {
    return;
  }

  const currentNumber = getCurrentNumber();

  if (currentNumber === '0') {
    if (digit === '0') {
      return; // prevent 000
    }
    expression = expression.slice(0, -1) + digit; // 07 -> 7
  } else {
    expression += digit;
  }
}

function inputDecimal() {
  if (hasError) {
    resetAll();
  }
  if (justEvaluated) {
    resetAll();
  }
  if (expression.length >= MAX_LENGTH) {
    return;
  }

  const currentNumber = getCurrentNumber();

  if (currentNumber.includes('.')) {
    return; // only one decimal point per number
  }
  expression += currentNumber === '' ? '0.' : '.';
}

function inputOperator(op) {
  if (hasError) {
    resetAll();
    return;
  }
  if (justEvaluated) {
    // keep using the result as the start of the next calculation
    justEvaluated = false;
    history = '';
  }

  // Empty expression: only a minus sign is allowed (negative number)
  if (expression === '') {
    if (op === '-') {
      expression = '-';
    }
    return;
  }
  if (expression === '-') {
    return;
  }

  const last = expression.slice(-1);

  if (isOperator(last)) {
    // Allow a negative number after * or /  (example: 5*-3)
    if (op === '-' && (last === '*' || last === '/')) {
      if (expression.length < MAX_LENGTH) {
        expression += op;
      }
      return;
    }
    // Otherwise replace the old operator(s) with the new one
    expression = expression.replace(/[+\-*/]+$/, '');
  }

  if (expression.length < MAX_LENGTH) {
    expression += op;
  }
}

function backspace() {
  if (hasError) {
    resetAll();
    return;
  }
  if (justEvaluated) {
    justEvaluated = false;
    history = '';
  }
  expression = expression.slice(0, -1);
}

function calculate() {
  if (hasError || justEvaluated || expression === '') {
    return;
  }

  // Ignore operators left at the end, e.g. "5+" becomes "5"
  const cleaned = expression.replace(/[+\-*/]+$/, '');
  if (cleaned === '') {
    return;
  }

  try {
    const value = evaluateExpression(cleaned);
    const formatted = formatResult(value);
    history = formatDisplay(cleaned) + ' =';
    expression = formatted;
    justEvaluated = true;
  } catch (error) {
    const code = ERROR_MESSAGES[error.message] ? error.message : 'INVALID';
    history = formatDisplay(cleaned) + ' =';
    errorMessage = ERROR_MESSAGES[code];
    hasError = true;
    justEvaluated = false;
  }
}

/* =========================================================
   Screen update
   ========================================================= */

function render() {
  historyEl.textContent = history;

  if (hasError) {
    currentEl.textContent = errorMessage;
  } else if (expression === '') {
    currentEl.textContent = '0';
  } else {
    currentEl.textContent = formatDisplay(expression);
  }

  currentEl.classList.toggle('error', hasError);

  // Shrink the font when the text gets long
  const length = currentEl.textContent.length;
  currentEl.classList.remove('size-md', 'size-sm');
  if (length > 20) {
    currentEl.classList.add('size-sm');
  } else if (length > 12) {
    currentEl.classList.add('size-md');
  }
}

/* =========================================================
   Central action handler (used by buttons AND keyboard)
   ========================================================= */

function handleAction(action, value) {
  switch (action) {
    case 'digit':
      inputDigit(value);
      break;
    case 'decimal':
      inputDecimal();
      break;
    case 'operator':
      inputOperator(value);
      break;
    case 'equals':
      calculate();
      break;
    case 'backspace':
      backspace();
      break;
    case 'clear':
      resetAll();
      break;
    default:
      break;
  }
  render();
}

/* =========================================================
   Mouse / touch support
   ========================================================= */

keypad.addEventListener('click', function (event) {
  const button = event.target.closest('button');
  if (!button) {
    return;
  }
  handleAction(button.dataset.action, button.dataset.value);
});

/* =========================================================
   Keyboard support
   ========================================================= */

// Map each keyboard key to its on-screen button
const keyMap = new Map();
document.querySelectorAll('[data-key]').forEach(function (button) {
  keyMap.set(button.dataset.key, button);
});

function flashButton(button) {
  button.classList.add('pressed');
  setTimeout(function () {
    button.classList.remove('pressed');
  }, 120);
}

document.addEventListener('keydown', function (event) {
  // Let browser shortcuts such as Ctrl+R or Ctrl+C work normally
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return;
  }

  let key = event.key;
  if (key === ',') key = '.';           // comma works as decimal point
  if (key === 'x' || key === 'X') key = '*';
  if (key === '=') key = 'Enter';

  const button = keyMap.get(key);
  if (!button) {
    return;
  }

  event.preventDefault(); // stops "/" quick-find and double-click on focused buttons
  handleAction(button.dataset.action, button.dataset.value);
  flashButton(button);
});

/* ---------- First draw ---------- */
render();
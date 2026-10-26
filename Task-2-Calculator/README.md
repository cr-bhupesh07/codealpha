# Basic Calculator (CodeAlpha Task 2)

A modern, responsive calculator built with only **HTML, CSS and vanilla JavaScript**.
It does not use `eval()` or any external library.

## Features

- Dark theme with smooth hover effects and button press animations
- Responsive layout for desktop, tablet and mobile
- Buttons for digits 0-9, decimal point, + - × ÷, equals (=), clear (C) and backspace (⌫)
- Normal arithmetic precedence: `2 + 3 × 4 = 14`
- Decimal numbers with float-error cleanup: `0.1 + 0.2 = 0.3`
- Negative numbers: `5 × -3 = -15`
- Safe handling of division by zero, invalid input and very large results
- Full keyboard support
- Accessible markup: semantic HTML, button labels, live display, visible focus outline
- Respects the "reduce motion" setting of the device

## Folder Structure

```
Task-2-Calculator/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Setup

1. Download or copy the `Task-2-Calculator` folder.
2. Make sure `index.html`, `style.css` and `script.js` are in the same folder.
3. Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

No installation, Node.js or build tools needed.

## Keyboard Shortcuts

| Key             | Action                                  |
| --------------- | --------------------------------------- |
| `0` - `9`       | Enter digits                            |
| `.` or `,`      | Decimal point                           |
| `+` `-` `*` `/` | Operators (`x` also works for multiply) |
| `Enter` or `=`  | Calculate result                        |
| `Backspace`     | Delete last character                   |
| `Escape`        | Clear everything                        |

## How It Works

1. The calculator stores what you type as a text expression such as `2+3*4`.
2. When you press `=`, a **tokenizer** splits the text into numbers and operators.
3. A small **recursive-descent parser** calculates the result. It handles `*` and `/` before `+` and `-`, so the answer follows the normal maths rules.
4. The result is rounded to remove floating-point noise and shown on the display.

## Test Checklist

| Input                       | Expected result             |
| --------------------------- | --------------------------- |
| `2 + 3 × 4 =`               | `14`                        |
| `10 ÷ 4 =`                  | `2.5`                       |
| `0.1 + 0.2 =`               | `0.3`                       |
| `7 − 2 × −3 =`              | `13`                        |
| `5 ÷ 0 =`                   | Cannot divide by zero       |
| `5 + =`                     | `5`                         |
| `100 ÷ 3 =`                 | `33.3333333333`             |
| `9999999999 × 9999999999 =` | Result too large            |
| Typing `007`                | `7`                         |
| Typing `1.2.3`              | `1.23` (second dot ignored) |

## What I Learned

- Building a UI with semantic HTML and CSS Grid
- Handling mouse, touch and keyboard events with JavaScript
- Writing a safe expression parser instead of using `eval()`
- Managing application state and updating the DOM
- Making a layout responsive and accessible

## Credits

Created as part of the CodeAlpha Web Development Internship, Task 2.

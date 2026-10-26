# Personal Portfolio Website (CodeAlpha Task 3)

A modern, responsive developer portfolio for **Bhupesh Kumar**, built with only
**HTML5, CSS3 and vanilla JavaScript**. No frameworks, libraries or build tools.

## Features

- Dark, premium design with violet and teal accent colors
- Sticky navigation bar: About, Skills, Projects, Resume, Contact
- Responsive mobile menu (closes on link click, outside click and the Escape key)
- Smooth scrolling and an active-link highlight that follows the section on screen
- Hero section with an animated background and a decorative code card
- About section, skills section, project cards, education and experience timeline
- Resume download button
- Working GitHub and LinkedIn links
- Scroll-reveal animations, hover effects and a mouse-following glow on project cards
- Back-to-top button
- Accessibility: skip link, semantic HTML, labelled buttons and links, visible focus
  outline, keyboard-friendly menu, and support for "reduce motion"
- Works without JavaScript for reading all the content

## Folder Structure

```
Task-3-Portfolio/
├── index.html
├── style.css
├── script.js
├── README.md
└── resume.pdf      (you add this file yourself)
```

## Setup (VS Code + Live Server)

1. Open the `Task-3-Portfolio` folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension (by Ritwick Dey) from the Extensions panel (Ctrl + Shift + X).
3. Right-click `index.html` and choose **Open with Live Server**
   (or click **Go Live** in the bottom-right status bar).
4. The portfolio opens in your browser, usually at `http://127.0.0.1:5500`.

You can also double-click `index.html` to open it without Live Server.

## Adding Your Resume

1. Export your resume as a PDF.
2. Rename it exactly **`resume.pdf`**.
3. Put it inside the `Task-3-Portfolio` folder, next to `index.html`.
4. Refresh the page and click **Download Resume**.

If the file is missing, the site shows a friendly message instead of failing silently.
To use a different file name, change `resume.pdf` in the two `Download Resume` links
in `index.html`.

## Replacing the Project Link Placeholders

Each project card has a link marked with a yellow "placeholder" badge.

1. Open `index.html` and find the project card.
2. Replace `href="#"` with your real URL (GitHub repository or live demo).
3. Delete the word `link-placeholder` from that link's `class`.
4. Optionally add `target="_blank" rel="noopener noreferrer"` to open it in a new tab.

## Adding Your Email Later

An email address is not included. To add one, copy a contact card in the Contact
section of `index.html` and use `href="mailto:your-email@example.com"`.

## Customizing

- **Colors:** edit the variables at the top of `style.css` (`--accent`, `--accent-2`, `--bg`).
- **Text:** edit the content directly in `index.html`.
- **Project, internship and volunteer details:** add dates and descriptions inside each
  card or timeline item in `index.html`.

## Testing Checklist

- All five navigation links scroll to the correct section
- The mobile menu opens, closes with the X button, a link click, outside click and Escape
- GitHub and LinkedIn links open the correct profiles in a new tab
- Placeholder project links show a message instead of jumping to the top
- Resume button downloads the PDF (or shows the "not found" message if it is missing)
- Layout looks good at phone, tablet and desktop widths
- Keyboard: press Tab to move through links and buttons with a visible outline

## Technologies

HTML5, CSS3 (Grid, Flexbox, custom properties, animations), vanilla JavaScript
(IntersectionObserver, DOM events).

## Credits

Created as part of the CodeAlpha Web Development Internship, Task 3.

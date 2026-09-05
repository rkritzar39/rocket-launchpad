# Rocket Launchpad

Rocket Launchpad is an unofficial personal college dashboard designed for
University of Toledo students.

The project provides one customizable place for university links, frequently
used applications, tasks, class information, and personal organization tools.

## Project status

Rocket Launchpad is currently a static GitHub Pages prototype.

The current version uses:

- HTML
- CSS
- JavaScript
- Browser `localStorage`
- GitHub Pages

Firebase Authentication and Cloud Firestore synchronization are planned for a
later development phase.

## Current features

- Responsive desktop and mobile interface
- Home dashboard
- Application portal
- Default university resource shortcuts
- Custom application links
- Application editing and deletion
- Favorites
- Recently opened applications
- Application categories
- Application search
- Grid and list layouts
- Personal task management
- Task priorities and due dates
- Task filtering
- Sample class interface
- Light and dark modes
- Local browser persistence
- JSON backup export
- JSON backup import
- Dashboard reset
- Accessible navigation and focus states

## Repository structure

```text
rocket-launchpad/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── data.js
│   ├── links.js
│   ├── storage.js
│   └── tasks.js
├── index.html
└── README.md

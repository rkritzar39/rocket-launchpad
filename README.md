# Rocket Launchpad

Rocket Launchpad is an unofficial personal college dashboard designed for University of Toledo students.

## Batch 2 of 6

This release adds a complete editable Classes and Schedule system while keeping the project compatible with static GitHub Pages.

### Features

- Add, edit, and delete classes
- Course code, title, instructor, location, and meeting days
- Start and end times
- Online-class marker
- Custom class colors
- Blackboard and syllabus links
- Office-hours notes
- Weekly schedule
- Today's classes on Home
- Next-class indicator
- Class statistics
- Local browser persistence
- Classes included in export, import, and reset
- Existing applications, favorites, recents, tasks, themes, and layouts remain supported

## Files changed in Batch 2

```text
index.html
css/styles.css
js/data.js
js/storage.js
js/app.js
README.md
```

## New file

```text
js/classes.js
```

The existing `js/links.js` and `js/tasks.js` files from Batch 1 are unchanged.

## Required script order

```html
<script src="js/data.js"></script>
<script src="js/storage.js"></script>
<script src="js/links.js"></script>
<script src="js/tasks.js"></script>
<script src="js/classes.js"></script>
<script src="js/app.js"></script>
```

## Data storage

This version stores applications, tasks, classes, and settings in the current browser using `localStorage`. It does not yet synchronize across devices. Firebase will be added in Batch 6 after the interface is complete and tested.

## Disclaimer

Rocket Launchpad is an unofficial personal student project. It is not created, operated, sponsored, or endorsed by The University of Toledo. It does not replace myUT, Blackboard, Rocket Email, or another official university service.

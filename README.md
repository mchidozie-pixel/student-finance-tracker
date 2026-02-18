# Student Finance Tracker

A web application to help students track expenses, monitor spending trends, and validate financial input using regular expressions.

## Live Demo

[GitHub Pages Link](https://YOUR_GITHUB_USERNAME.github.io/student-finance-tracker/)

## Features

- Add, edit, and delete transactions
- Dashboard summary with total balance and spending overview
- 7-day spending trend
- Category breakdown of expenses
- Regex-based form validation
- Custom regex search
- Persistent storage with localStorage
- Currency support (USD, EUR, GBP)
- Accessible and keyboard-friendly interface

## Project Structure

- `index.html` — Main HTML file
- `style.css` — CSS styling
- `app.js` — JavaScript logic
- `seed.json` — Sample transaction data
- `README.md` — Project documentation

## About `seed.json`

`seed.json` contains sample transaction records in JSON format. It is used to populate the app initially so reviewers or users can see how it works without adding data manually. The app can load from `seed.json` but stores live data in the browser using `localStorage`. This ensures data persists between sessions.

## How to Run

1. Open `index.html` in a web browser.
2. The app loads sample transactions from `seed.json`.
3. Add, edit, or delete transactions using the interface.
4. Use regex search for filtering categories or descriptions.
5. Refresh the page to verify data is stored in localStorage.

## Accessibility

- Skip-to-content link included
- Proper labels and focus indicators
- Keyboard navigation supported
- ARIA live region for alerts

## Academic Integrity

Completed individually.

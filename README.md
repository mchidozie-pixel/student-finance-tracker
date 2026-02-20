# Student Finance Tracker

The Student Finance Tracker is a web application I built to help students manage and monitor daily spending. The app allows users to record transactions, analyze spending trends, and ensure correct input using regex validation.

## Live App
https://mchidozie-pixel.github.io/student-finance-tracker/

## Demo Video
https://drive.google.com/file/d/1LCNQpZZ51sX4fTm8BbY2eFhp7_1CJyCc/view?usp=drive_link

## Repository
https://github.com/mchidozie-pixel/student-finance-tracker

## Theme
This project focuses on student financial awareness and expense tracking, helping students understand spending habits and stay within budgets.

## Features
- Add, edit, and delete transactions
- Dashboard showing total spending and insights
- 7-day spending trend visualization
- Category breakdown of expenses
- Regex-based form validation
- Regex search with safe compilation
- Import and export transactions in JSON format
- Persistent storage using localStorage
- Currency support (USD, EUR, GBP)
- Mobile-responsive and keyboard-accessible interface

## Regex Catalog
- Description: Prevents leading/trailing spaces (Valid: Lunch, Invalid: " Lunch")
- Amount: Numeric with max 2 decimals (Valid: 10.99, Invalid: 01)
- Date: YYYY-MM-DD format (Valid: 2026-02-17, Invalid: 17-02-2026)
- Category: Letters and spaces only (Valid: Fast Food, Invalid: Food123)
- Duplicate words: Detects repeated words (Valid: coffee coffee, Invalid: coffee tea)

## Keyboard Map
- Tab → Navigate inputs
- Enter → Submit transaction
- Esc → Reset form or close modal
- Arrow keys → Navigate dropdown elements

## Accessibility Notes
- Semantic HTML structure
- ARIA live updates for dashboard statistics
- Visible focus indicators for keyboard navigation
- Accessible color contrast

## Running Tests
Opening tests.html in a browser runs validation checks that display PASS or FAIL results for each regex rule.

## About seed.json
The seed.json file contains sample transaction data used for testing and demonstrating import/export functionality. It includes id, description, amount, category, date, and timestamps.

## Project Structure
- index.html – Main application layout
- style.css – Styling and responsive design
- app.js – Application logic and state management
- seed.json – Sample transaction records
- tests.html – Regex validation test page
- README.md – Project documentation

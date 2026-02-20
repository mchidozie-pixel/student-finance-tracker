# Student Finance Tracker

A web application designed to help students track expenses, monitor spending trends, and validate financial input using regular expressions.

## Live Demo

[Watch here](https://drive.google.com/file/d/1LCNQpZZ51sX4fTm8BbY2eFhp7_1CJyCc/view?usp=drive_link) 

## Repository

[View on GitHub](https://github.com/mchidozie-pixel/student-finance-tracker/tree/main)

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
- Mobile-responsive design

## Project Structure

- `index.html` – Main HTML file with all sections (Dashboard, Records, Add Transaction, Search, Settings, About)  
- `style.css` – Contains all styling, including layout, color themes, responsive design, and component styles  
- `app.js` – Handles application logic: form validation, storage, dashboard updates, table and card rendering, sorting, search, and settings  
- `seed.json` – Optional JSON file with sample transactions to pre-fill your app for testing/demo purposes  
- `README.md` – This file explaining the project

## About `seed.json`

`seed.json` contains pre-filled sample transaction records in JSON format. It allows anyone reviewing your app to see it in action immediately. It shows the structure of your data, including:

- `id` – Unique transaction identifier  
- `description` – What the expense is  
- `amount` – Transaction amount  
- `category` – Category of expense  
- `date` – Date of the transaction  
- `createdAt` / `updatedAt` – Timestamps for record management  

> Note: `seed.json` is **not the same as `localStorage`**. Your app can load from `seed.json` initially, but live data will be stored in the browser.

### Example JSON Record

```json
{
  "id": "txn_1",
  "description": "Lunch at cafeteria",
  "amount": 12.50,
  "category": "Food",
  "date": "2025-09-25",
  "createdAt": "2025-09-25T10:00:00",
  "updatedAt": "2025-09-25T10:00:00"
}

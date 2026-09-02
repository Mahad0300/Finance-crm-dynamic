# Finance CRM - Dynamic Custom MVC Portal

Modern Financial CRM & Weekly Statement Management Portal built on a Custom PHP MVC Architecture with MariaDB / MySQL.

## 🚀 Key Features
- **Dynamic Dashboard & Analytics:** Real-time metrics for Submissions, Approvals, Receiving, Received, and Outstanding balances.
- **Client Portfolio & Filter Engine:** Status management (`Charged`, `Submit`, `Kick Back`), payment plan tracking, and live search.
- **Weekly Cycles (Monday to Sunday):** 7-day accounting cycle with Tuesday collection audits and Friday settlement deadlines.
- **Sequential Carry-Forward Balance:** Automatic rollover of unpaid weekly balances with clickable direct links under table headers.
- **Dual-Stream Ledger (Approval vs Residual):** Initial approval payments and recurring monthly residuals calculation based on individual agreement dates.
- **Secure Authentication & RBAC:** Session-based authentication with bcrypt hashing and role permissions.

## 🛠️ Tech Stack
- **Backend:** PHP 8.x (Custom MVC Architecture, Clean Router, PDO Database Layer)
- **Frontend:** Vanilla JavaScript (ES6+), Modern Semantic HTML5, Vanilla CSS Design System
- **Database:** MariaDB / MySQL (`database/database.sql` included)
- **Web Server:** Apache / XAMPP (`.htaccess` URL rewriting)

## 📦 Setup & Installation
1. Clone the repository into your web server directory (`xampp/htdocs/finance-portal`).
2. Import `database/database.sql` into your MySQL / MariaDB server (`finance_crm`).
3. Copy `.env.example` to `.env` and adjust database credentials if needed.
4. Access `http://localhost/finance-portal` in your browser.

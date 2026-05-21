# 🍱 Tiffin Trial MERN

A modern full-stack MERN application for online tiffin subscription and food ordering services. The platform enables users to browse meal plans, place orders, manage subscriptions, and experience seamless food delivery management.

---

# 🚀 Features

## 👤 User Features

* User Authentication & Authorization
* Browse Tiffin Plans
* Add to Cart Functionality
* Online Order Placement
* Subscription Management
* Responsive UI for Mobile & Desktop
* Secure Login & Registration
* Real-Time Order Tracking

## 🛠️ Admin Features

* Admin Dashboard
* Manage Users
* Manage Orders
* Add/Edit/Delete Meal Plans
* Track Deliveries
* Manage Inventory

---

# 🧰 Tech Stack

## Frontend

* React.js
* Vite
* HTML5
* CSS3
* JavaScript (ES6)
* Axios

## Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT Authentication

## Tools & Platforms

* Git & GitHub
* VS Code
* Postman
* MongoDB Compass

---

# 📂 Project Structure

```bash
Tiffin_Trial_Mern/
│
├── frontend/          # React Frontend
├── backend/           # Node.js Backend
├── .gitignore
├── README.md
└── package.json
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone Repository

```bash
git clone https://github.com/rajdeep-sonu/Tiffin_Trial_Mern.git
cd Tiffin_Trial_Mern
```

---

## 2️⃣ Setup Backend

```bash
cd backend
npm install
```

### Create `.env` file inside backend folder

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/tiffinDB
JWT_SECRET=your_secret_key
```

### Start Backend Server

```bash
npm start
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 3️⃣ Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:5173
```

---

# 🗄️ Database Setup

Install and start MongoDB locally.

Download MongoDB:

[https://www.mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)

Then start MongoDB service before running backend.

---

# 📸 Screenshots

Add project screenshots here.

```bash
/screenshots/home.png
/screenshots/dashboard.png
/screenshots/orders.png
```

---

# 🌐 API Endpoints

## Authentication

* `POST /api/auth/register`
* `POST /api/auth/login`

## Orders

* `GET /api/orders`
* `POST /api/orders`

## Meals

* `GET /api/meals`
* `POST /api/meals`

---

# 🔒 Authentication

The application uses:

* JWT (JSON Web Token)
* Protected Routes
* Role-Based Access Control

---

# 📈 Future Improvements

* Online Payment Integration
* Live Delivery Tracking
* AI-Based Meal Recommendation
* Push Notifications
* Email Verification
* Cloud Deployment

---

# 🚀 Deployment

## Frontend Deployment (Vercel)

```bash
npm run build
```

Deploy using:

* Vercel
* Netlify

## Backend Deployment

Deploy backend using:

* Render
* Railway
* Cyclic

---

# 🧪 Testing

```bash
npm test
```

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

---

# 📄 License

This project is licensed under the MIT License.

---

# 👨‍💻 Author

## Rajdeep Raj

* GitHub: [https://github.com/rajdeep-sonu](https://github.com/rajdeep-sonu)
* LinkedIn: [https://www.linkedin.com/](https://www.linkedin.com/)

---

# ⭐ Support

If you found this project helpful, please give it a ⭐ on GitHub.

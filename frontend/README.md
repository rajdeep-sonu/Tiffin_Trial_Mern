# TiffinTrial Frontend - React + Vite + Tailwind CSS

A modern, production-ready React frontend for the TiffinTrial application. Students can browse providers, apply for trials, submit reviews, and manage subscriptions.

## 🎯 Features

### Student Side
- **Browse Providers**: View all available meal providers with filters (city, vegetarian-only)
- **Provider Details**: View weekly menus and apply for trials
- **Trial Management**: Track active trials, submit reviews upon completion
- **Subscriptions**: Create subscriptions after completing trials with various plan options
- **Dashboard**: Intuitive navigation hub for all student activities

### Authentication
- Email/password based registration and login
- Role-based access control (student/provider)
- JWT stored in httpOnly cookies (sent automatically with credentials)
- Persistent login with localStorage fallback
- Protected routes with role validation

## 🚀 Quick Start

### Installation
```bash
cd frontend
npm install
```

### Development Server
```bash
npm run dev
```
Access at: **http://localhost:3000**

### Production Build
```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── client.js                 # Axios instance with proper cookie setup
│   ├── components/
│   │   └── ProtectedRoute.jsx        # Role-based route protection
│   ├── context/
│   │   └── AuthContext.jsx           # Global auth state management
│   ├── pages/
│   │   ├── Login.jsx                 # Login form
│   │   ├── Register.jsx              # Registration form
│   │   └── student/
│   │       ├── StudentDashboard.jsx  # Main student dashboard
│   │       ├── Providers.jsx         # Browse providers list
│   │       ├── ProviderDetails.jsx   # Provider menu and trial application
│   │       ├── TrialStatus.jsx       # Active trials and reviews
│   │       └── Subscribe.jsx         # Subscription management
│   ├── services/
│   │   └── studentService.js         # API service layer for student endpoints
│   ├── App.jsx                       # Main router configuration
│   ├── main.jsx                      # React entry point
│   └── index.css                     # Tailwind directives
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔐 Authentication Flow

### Login/Register
1. User fills form (email, password, name, role)
2. Frontend sends `POST /auth/register` or `POST /auth/login`
3. Backend returns JWT in httpOnly cookie & user data
4. Frontend stores user in AuthContext & localStorage
5. User is redirected to role-based dashboard

### Protected Routes
- All route under `/student/*` require `role: "student"`
- All routes under `/provider/*` require `role: "provider"`
- Unauthenticated users are redirected to `/login`

### Cookies & Credentials
- ✅ Axios configured with `withCredentials: true`
- ✅ JWT automatically sent with every API request
- ✅ No manual token management needed
- ✅ Works like Postman's cookie handling

## 📚 Key Technologies

- **React 18** - UI library
- **React Router DOM v6** - Client-side routing
- **Axios** - HTTP client with cookie support
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Next-generation build tool
- **Context API** - State management

## 🔗 API Integration

### Base Configuration
- **Base URL**: `http://localhost:5000/api`
- **withCredentials**: `true` (sends cookies automatically)
- **Headers**: `Content-Type: application/json`

### Endpoints Used

#### Authentication
```
POST /auth/register   - Register new user
POST /auth/login      - Login user
POST /auth/logout     - Logout user
```

#### Student APIs
```
GET  /providers                - Get all providers (filters: city, vegOnly)
GET  /provider/:id/menu        - Get provider's weekly menu
POST /trial/apply              - Apply for a trial (required: providerId, optional: couponCode)
POST /review                   - Submit a review (required: providerId, rating, comment)
POST /subscribe                - Create subscription (required: providerId, plan, price)
```

## 📝 Page Descriptions

### Login Page
- Form with email and password
- Validation and error handling
- "No account? Register here" link
- Auto-redirect to role-based dashboard after login
- Shows demo credentials for testing

### Register Page
- Form fields: Name, Email, Password, Confirm Password
- Role selector: Student or Provider
- Password confirmation validation
- Auto-redirect to dashboard after registration
- Link to login page

### Student Dashboard
- Welcome greeting with user name
- Quick navigation cards to main features
- "How TiffinTrial Works" guide
- Direct access to browse providers, view trials, manage subscriptions

### Providers Page
- Grid layout of provider cards
- Real-time filters: city search, vegetarian-only checkbox
- Click provider to view details and menu
- Error handling and loading states

### Provider Details Page
- Full provider information (name, owner, city, phone, address)
- Weekly menu by days (clickable for full details)
- Trial application form with optional coupon code
- Success/error messaging
- Auto-redirect to trials page after successful application

### Trial Status Page
- List of all active trials
- Status badges (active, completed)
- Date ranges for each trial
- "Submit Review" button for completed trials
- Review modal with rating (1-5) and comment textarea

### Subscribe Page
- Browse available providers
- Plan selection grid (7, 30, 60, 90 days)
- Real-time price display
- View current active subscriptions
- Requirement notice: "Must complete trial first"

## 🔑 Demo Credentials

**Student Account:**
- Email: `student@mail.com`
- Password: `123456`

**Provider Account:**
- Email: `provider@mail.com`
- Password: `123456`

## 🛠️ Environment Setup

### Prerequisites
- Node.js v14+
- npm or yarn
- Backend running on port 5000

### Install Dependencies
```bash
npm install
```

### Ensure Backend is Running
```bash
cd ../backend
npm run dev
# Backend will run on http://localhost:5000
```

### Start Frontend
```bash
npm run dev
# Frontend will run on http://localhost:3000
```

## 📊 State Management

### AuthContext Provides
- `user` - Current logged-in user object
- `isAuthenticated` - Boolean for login status
- `loading` - Loading indicator
- `error` - Error message
- `login(email, password)` - Login function
- `register(name, email, password, role)` - Register function
- `logout()` - Logout function

### Usage
```jsx
import { useAuth } from '../context/AuthContext';

function Component() {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  return (
    <div>
      {isAuthenticated && <p>Logged in as {user.name}</p>}
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

## 🎨 Styling

### Tailwind CSS Classes
- Responsive design (mobile-first)
- Custom colors and spacing
- Utility-based approach
- Full dark mode support ready

### Key Components
- Cards with shadows
- Form inputs with focus states
- Modal overlays
- Loading spinners
- Success/error banners

## 🚀 Working Features

✅ User Registration & Login
✅ Role-based Dashboard Access
✅ Browse Providers with Filters
✅ View Provider Menus
✅ Apply for Trials
✅ Submit Reviews
✅ Create Subscriptions
✅ Responsive Mobile UI
✅ Cookie-based Authentication
✅ Error Handling & User Feedback

## 🔧 Common Task Examples

### Adding a New Student Page

1. Create `src/pages/student/NewPage.jsx`:
```jsx
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/client';

const NewPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiClient.get('/endpoint');
      // Handle response
    } catch (err) {
      setError(err.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return <div>{/* JSX */}</div>;
};

export default NewPage;
```

2. Add route in `App.jsx`:
```jsx
<Route
  path="/student/newpage"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <NewPage />
    </ProtectedRoute>
  }
/>
```

### Calling Backend APIs

```jsx
// Using client directly
import apiClient from '../api/client';

const response = await apiClient.get('/providers');
const providers = response.data.data;

// POST request
await apiClient.post('/trial/apply', {
  providerId: 'xyz',
  couponCode: 'SAVE10'
});
```

## 🐛 Troubleshooting

### Issue: "Cannot find cookies in requests"
**Solution**: Axios is configured with `withCredentials: true` in `src/api/client.js`

### Issue: "404 on API calls"
**Solution**: Ensure backend is running on port 5000 and routes are correctly defined

### Issue: "Redirect to login keeps happening"
**Solution**: Check user.role matches your route's allowedRoles array

### Issue: "CORS errors"
**Solution**: Backend must have CORS enabled for `http://localhost:3000` with credentials

## 📈 Performance Tips

- Routes are lazy-loadable for code splitting
- Images are optimized by Vite
- CSS is tree-shaken for production
- Use React.memo for preventing re-renders
- Implement pagination for large lists

## 🚢 Deployment

### Build for Production
```bash
npm run build
# Creates optimized build in dist/
```

### Deploy to Vercel/Netlify
1. Build locally: `npm run build`
2. Deploy the `dist/` folder
3. Set backend API URL to production backend

### Environment Variables
Create `.env.local`:
```
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 📞 Support

For issues or questions:
1. Check [troubleshooting](#troubleshooting) section
2. Review backend logs
3. Check browser console for errors
4. Verify backend and frontend are both running

## 📄 License

MIT

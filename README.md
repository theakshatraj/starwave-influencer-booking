# StarWave

Connect brands and influencers with a simple, fast web app. Creators build profiles and clients manage events, bookings, and saved influencers.

## 🚀 Live Demo

**Deployed Application:** https://starwave-48dr.onrender.com

**Demo Video:** https://www.youtube.com/watch?v=raAGs1JHG-0&t=279s

## 📋 Setup Steps

### Prerequisites
- Node.js >= 18
- MySQL 8+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/starwave.git
cd starwave
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file at the project root with:
```env
PORT=3000
# MySQL connection string
CLOUD_DB=mysql://USER:PASSWORD@HOST:PORT/DATABASE

# Admin login (used by /login-process)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong-password

# Cloudinary (used for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gmail App Password for Nodemailer
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_gmail_app_password
```

4. Create the MySQL database and tables referenced by the app:
   - `users` (email, pwd, utype, status)
   - `iprofile` (influencer profile, includes `picpath`)
   - `cprofile` (client profile)
   - `events` (client events)
   - `savedinfluencers` (client ↔ influencer favorites)

5. Start the server:
```bash
npm start
```

6. Open the app: `http://localhost:3000/`

## 🛠️ Tech Stack Used

### Frontend
- HTML, CSS, JavaScript
- jQuery
- Bootstrap 5
- Font Awesome

### Backend
- Node.js
- Express.js (`server.js`)
- RESTful API architecture

### Database
- MySQL (`mysql2`)

### Additional Technologies
- **File Uploads:** `express-fileupload` + Cloudinary
- **Email Service:** Nodemailer (Gmail App Password)
- **Utilities:** `dotenv`, `cors`

## ✨ Key Features

### Frontend Features
- Responsive design with Bootstrap 5
- Interactive UI for profile management
- Real-time booking system
- Event management dashboard
- Influencer search and filtering

### Backend Features
- RESTful API endpoints for CRUD operations
- User authentication and authorization
- Admin and user role management
- Profile image upload to cloud storage
- Email notifications via Nodemailer

### Database Operations
- Complete CRUD operations for users, profiles, events
- Relational data management (client-influencer connections)
- Saved influencers functionality

## 📝 Assumptions & Bonus Features Implemented

### Core Assumptions
- Admin login uses environment credentials; regular users authenticate against the `users` table (`server.js:104`)
- For demo purposes, passwords are stored in plaintext; `bcryptjs` is available and recommended for production hashing
- Profile image uploads are handled via Cloudinary (`server.js:185–204`, `server.js:470–478`)
- Dynamic profile updates only modify provided fields (`server.js:326–387`)

### Bonus Features ⭐
- **Full-stack Integration:** Complete frontend + backend + database implementation
- **Cloud Deployment:** Application deployed and accessible via live URL
- **Advanced Search:** Influencer finder with filtering by category, location, and name (`server.js:837–864`)
- **Dashboard Metrics:** Client dashboard with analytics and metrics (`server.js:790–829`)
- **Saved Favorites:** Complete CRUD for saved influencers feature (`server.js:900–999`)
- **Cloud Storage:** Cloudinary integration for image management
- **Email Integration:** Automated email notifications using Nodemailer

## 🎯 API Endpoints

### Authentication
- `POST /login-process` - User/Admin login
- `POST /signup-process` - User registration

### Profile Management
- `GET /iprofile/:email` - Get influencer profile
- `POST /iprofile` - Create/Update influencer profile
- `GET /cprofile/:email` - Get client profile
- `POST /cprofile` - Create/Update client profile

### Events & Bookings
- `GET /events` - Fetch all events
- `POST /events` - Create new event
- `PUT /events/:id` - Update event
- `DELETE /events/:id` - Delete event

### Search & Discovery
- `GET /influencer-finder` - Search influencers with filters

### Favorites
- `POST /savedinfluencers` - Save influencer
- `GET /savedinfluencers/:clientEmail` - Get saved influencers
- `DELETE /savedinfluencers/:id` - Remove saved influencer

## 📊 Database Schema

### Tables
1. **users** - User authentication and type management
2. **iprofile** - Influencer profile data
3. **cprofile** - Client profile data
4. **events** - Event listings and management
5. **savedinfluencers** - Client-influencer connections

## 🔒 Security Notes

- Environment variables used for sensitive credentials
- CORS enabled for controlled access
- Role-based access control (Admin/Client/Influencer)
- **Note:** For production deployment, implement password hashing with bcryptjs

## 📧 Contact

For questions or issues, please contact: live.akshatraj@gmail.com

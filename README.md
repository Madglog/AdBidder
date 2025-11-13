# AdBidder - Outdoor Advertising Aggregator Platform

A full-stack web application for connecting advertisers with outdoor advertising space owners through an intelligent bidding system.

## Tech Stack

### Frontend
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable UI components
- **NextAuth.js** - Authentication with JWT

### Backend
- **Node.js** - Runtime environment
- **Express** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **PostgreSQL** - Relational database
- **Prisma** - Modern ORM

### Third-Party Integrations
- **Stripe** - Payment processing
- **Mapbox/Google Maps** - Interactive maps
- **AWS S3/Cloudinary** - File storage
- **Nodemailer** - Email services

## Features

### Multi-Role System
- **Space Owners** - List and manage advertising spaces
- **Advertisers** - Search and bid on advertising spaces
- **Admins** - Platform management and moderation
- **Guests** - Browse available spaces

### Core Functionality
- **Authentication** - Secure login/register with email verification
- **Space Management** - Create, edit, and manage ad spaces
- **Bidding System** - Real-time bidding with notifications
- **Campaign Builder** - Multi-location campaign management
- **Payment Processing** - Stripe integration with escrow
- **Messaging** - In-app communication between users
- **Analytics** - Dashboard with insights and metrics
- **Map Interface** - Interactive location-based search
- **Reviews & Ratings** - User feedback system

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AdBidder
   ```

2. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your configuration:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/adbidder"
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"

   # Email configuration
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASSWORD="your-app-password"
   EMAIL_FROM="noreply@adbidder.com"

   # Stripe
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."

   # Maps (choose one)
   NEXT_PUBLIC_MAPBOX_TOKEN="pk...."

   # App URLs
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:4000"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run prisma:generate

   # Push schema to database
   npm run prisma:push

   # (Optional) Open Prisma Studio
   npm run prisma:studio
   ```

5. **Run the development servers**

   In one terminal (Next.js frontend):
   ```bash
   npm run dev
   ```

   In another terminal (Express backend):
   ```bash
   npm run server
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:4000
   - API Health Check: http://localhost:4000/health

## Project Structure

```
AdBidder/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages (owner, advertiser, admin)
│   └── spaces/            # Space browsing pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── forms/            # Form components
│   ├── maps/             # Map components
│   └── dashboards/       # Dashboard components
├── lib/                   # Utility libraries
│   ├── auth/             # Authentication logic
│   ├── prisma/           # Prisma client
│   ├── stripe/           # Stripe integration
│   ├── email/            # Email services
│   └── upload/           # File upload logic
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── middleware/       # Express middleware
│   └── utils/            # Server utilities
├── prisma/                # Prisma schema and migrations
├── types/                 # TypeScript type definitions
└── public/                # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/login` - Login (via NextAuth)

### Spaces
- `GET /api/spaces` - Get all spaces (with filters)
- `GET /api/spaces/:id` - Get single space
- `POST /api/spaces` - Create space (Owner)
- `PUT /api/spaces/:id` - Update space
- `DELETE /api/spaces/:id` - Delete space

### Bids
- `GET /api/bids` - Get user's bids
- `POST /api/bids` - Create bid
- `POST /api/bids/:id/accept` - Accept bid
- `POST /api/bids/:id/reject` - Reject bid
- `POST /api/bids/:id/counter` - Counter bid

### Campaigns
- `GET /api/campaigns` - Get user's campaigns
- `GET /api/campaigns/:id` - Get single campaign
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign

### Users
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update profile
- `GET /api/users/stats` - Get dashboard stats

### Messages & Notifications
- `GET /api/messages` - Get messages
- `POST /api/messages` - Send message
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Database Schema

Key models:
- **User** - User accounts with roles
- **AdSpace** - Advertising spaces
- **Bid** - Bidding records
- **Campaign** - Advertising campaigns
- **CampaignSpace** - Campaign-space relationships
- **Transaction** - Payment transactions
- **Message** - User messages
- **Notification** - System notifications
- **Review** - Space reviews
- **Favorite** - User favorites

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection
- Secure file upload validation
- HTTPS enforcement (production)

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
npm start
```

### Database Commands
```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes
npm run prisma:push

# Open Prisma Studio
npm run prisma:studio
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@adbidder.com or open an issue in the repository.

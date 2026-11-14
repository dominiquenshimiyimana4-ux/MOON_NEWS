# Moon News Backend

A Node.js + Express backend API for the Moon News application. This backend provides REST endpoints for authentication, article management, comments, bookmarks, and newsletter subscriptions.

## Features

- **Authentication**: JWT-based login and registration
- **Article Management**: Create, read, update, and delete news articles with multi-language support (Kinyarwanda & English)
- **Comments**: Threaded comments on articles
- **Bookmarks**: Save articles for later reading
- **Newsletter**: Subscribe to and manage newsletter subscriptions
- **Role-Based Access**: Admin, Editor, Journalist, and Reader roles
- **Pagination**: Efficient article listing with pagination
- **Search & Filter**: Search articles by keywords, filter by category, status, tags, etc.

## Prerequisites

- Node.js 16+
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Set a working MongoDB connection string and private account passwords:
```env
# Server
PORT=5000
NODE_ENV=development

# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/moon-news

# Or use the complete connection string from MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<db_user>:<URL-encoded-db-password>@<cluster-host>/moon-news?retryWrites=true&w=majority

# JWT
JWT_SECRET=<a-long-random-secret>

# Frontend
FRONTEND_URL=http://localhost:3000

# Provisioned account credentials (use unique passwords of at least 8 characters)
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<admin password>
AUTHOR_EMAIL=<author email>
AUTHOR_PASSWORD=<author password>
ADVERTISER_EMAIL=<advertiser email>
ADVERTISER_PASSWORD=<advertiser password>
```

## Setup

### Start MongoDB

**Local MongoDB:**
```bash
mongod
```

**MongoDB Atlas (Cloud):**
- Create a cluster at https://www.mongodb.com/cloud/atlas
- Get your connection string and add it to `.env` as `MONGODB_URI`

### Provision login accounts

Create or update the admin, author, and advertiser accounts without deleting
existing users or other database data:
```bash
npm run provision:auth
```

The passwords are bcrypt-hashed before being saved. Reader accounts are created
through the public `/register` page and are always assigned the `reader` role.
Do not run the sample seed command against a database containing data you want
to keep; it clears existing users, articles, and comments before inserting
sample records.

To update only the administrator account, run:
```bash
npm run admin:credentials
```

## Development

Run the backend from this directory after MongoDB is available:
```bash
npm run dev
```

In `moon/.env.local`, point the frontend to the backend:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Set `FRONTEND_URL` to the exact origin used by the frontend (for example,
`http://localhost:3200` if it runs on port 3200).

Restart the frontend after changing `NEXT_PUBLIC_API_URL`; Next.js embeds
`NEXT_PUBLIC_*` values into the browser bundle. For a deployed frontend, use
the public backend URL instead of `localhost`.

### Build TypeScript
```bash
npm run build
```

Server runs on `http://localhost:5000` by default.

### Run Production Server
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- **POST** `/api/auth/login` - Login user
  - Body: `{ email, password }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/register` - Register new user
  - Body: `{ name, email, password }`
  - Returns: `{ token, user }`

- **POST** `/api/auth/logout` - Logout (requires token)
  - Returns: `{ message }`

### Articles

- **GET** `/api/news` - List articles with pagination and filters
  - Query: `page`, `pageSize`, `category`, `status`, `search`, `sort`, `featured`, `breaking`
  - Returns: `{ items, total, page, pageSize, totalPages }`

- **GET** `/api/news/:slug` - Get article by slug
  - Returns: Article object

- **POST** `/api/news` - Create article (requires auth)
  - Body: `{ title, excerpt, content, category, image, tags, status }`
  - Returns: Article object

- **PATCH** `/api/news/:id` - Update article (requires auth)
  - Body: Partial article object
  - Returns: Updated article

- **DELETE** `/api/news/:id` - Delete article (admin only)
  - Returns: `{ message }`

### Comments

- **GET** `/api/comments?articleId=:id` - List comments for article
  - Returns: Array of comments

- **POST** `/api/comments` - Create comment (requires auth)
  - Body: `{ articleId, content, parentId? }`
  - Returns: Comment object

- **PATCH** `/api/comments/:id` - Update comment (requires auth)
  - Body: `{ content }`
  - Returns: Updated comment

- **DELETE** `/api/comments/:id` - Delete comment (requires auth)
  - Returns: `{ message }`

- **POST** `/api/comments/:id/like` - Like a comment
  - Returns: Updated comment

### Bookmarks

- **GET** `/api/users/bookmarks` - Get user's bookmarks (requires auth)
  - Returns: Array of bookmarks

- **POST** `/api/users/bookmarks` - Add bookmark (requires auth)
  - Body: `{ articleId }`
  - Returns: Bookmark object

- **DELETE** `/api/users/bookmarks/:articleId` - Remove bookmark (requires auth)
  - Returns: `{ message }`

### Newsletter

- **POST** `/api/users/newsletter` - Subscribe to newsletter
  - Body: `{ email }`
  - Returns: Subscriber object

- **POST** `/api/users/newsletter/unsubscribe` - Unsubscribe from newsletter
  - Body: `{ email }`
  - Returns: `{ message }`

### User Profile

- **GET** `/api/users/profile` - Get current user profile (requires auth)
  - Returns: User object

- **PATCH** `/api/users/profile` - Update user profile (requires auth)
  - Body: `{ name, avatar, bio }`
  - Returns: Updated user object

## Database Schema

### Users
```
{
  name: String,
  email: String (unique),
  password: String (hashed),
  avatar: String,
  role: Enum ['admin', 'editor', 'journalist', 'reader'],
  bio: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Articles
```
{
  slug: String (unique),
  title: { rw: String, en: String },
  subtitle: { rw: String, en: String },
  excerpt: { rw: String, en: String },
  content: { rw: String, en: String },
  category: String,
  authorId: ObjectId (ref: User),
  image: String,
  imageCaption: String,
  publishedAt: Date,
  updatedAt: Date,
  readingTime: Number,
  views: Number,
  shares: Number,
  commentsCount: Number,
  tags: [String],
  status: Enum ['published', 'draft', 'scheduled', 'pending', 'rejected'],
  featured: Boolean,
  breaking: Boolean,
  source: String,
  seo: {
    title: String,
    description: String,
    canonical: String,
    ogImage: String
  }
}
```

### Comments
```
{
  articleId: ObjectId (ref: Article),
  authorName: String,
  authorAvatar: String,
  content: String,
  createdAt: Date,
  likes: Number,
  parentId: ObjectId (ref: Comment, optional)
}
```

### Bookmarks
```
{
  userId: ObjectId (ref: User),
  articleId: ObjectId (ref: Article),
  createdAt: Date
}
```

### NewsletterSubscribers
```
{
  email: String (unique),
  createdAt: Date,
  verified: Boolean
}
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| NODE_ENV | development | Environment |
| MONGODB_URI | mongodb://localhost:27017/moon-news | MongoDB connection string |
| JWT_SECRET | required | JWT signing secret (change in production!) |
| FRONTEND_URL | http://localhost:3000 | Frontend URL for CORS |

## Error Handling

All errors are returned in this format:
```json
{
  "error": "Error message"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., email already exists)
- `500` - Internal Server Error

## Security Notes

- Passwords are hashed using bcryptjs
- JWT tokens are used for authentication (expires in 7 days)
- CORS is enabled for the frontend URL
- Helmet middleware is used for security headers
- All input validation should be enhanced before production

## Future Enhancements

- [ ] Email notifications for comments
- [ ] Advanced search with Elasticsearch
- [ ] Image upload and CDN integration
- [ ] Real-time notifications
- [ ] Rate limiting
- [ ] Request logging and monitoring
- [ ] Payment integration for premium content
- [ ] Social media sharing

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

MIT - See LICENSE file for details

## Support

For issues or questions, contact the team at support@moonnews.rw

# Instachatico UI

A modern, minimalistic UI for managing Instagram comment moderation with AI-powered classification.

## Features

- **Media Management**: Browse and manage Instagram posts with pagination
- **Comment Classification**: View AI-classified comments across 7 categories:
  - Positive Feedback
  - Critical Feedback
  - Urgent Issue / Complaint
  - Question / Inquiry
  - Partnership Proposal
  - Toxic / Abusive
  - Spam / Irrelevant
- **Comment Moderation**: Hide, unhide, and delete comments
- **Classification Editing**: Manually adjust comment classifications
- **Auto-Response Monitoring**: Track AI-generated responses with confidence and quality scores
- **Responsive Design**: Navy and soft blue color scheme with clean, modern aesthetics

## Tech Stack

- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** for type safety
- **Vite** for fast development and optimized builds
- **Vue Router** for navigation
- **Pinia** for state management
- **Axios** for API communication
- **date-fns** for date formatting

## Project Structure

```
src/
├── components/
│   ├── comments/         # Comment-related components
│   │   ├── AnswerCard.vue
│   │   ├── ClassificationForm.vue
│   │   ├── CommentCard.vue
│   │   ├── CommentFilters.vue
│   │   └── CommentsSection.vue
│   ├── layout/           # Layout components
│   │   └── AppHeader.vue
│   ├── media/            # Media-related components
│   │   ├── MediaCard.vue
│   │   └── MediaDetailCard.vue
│   └── ui/               # Reusable UI components
│       ├── BaseBadge.vue
│       ├── BaseButton.vue
│       ├── BaseCard.vue
│       ├── BaseModal.vue
│       ├── BasePagination.vue
│       └── LoadingSpinner.vue
├── router/               # Vue Router configuration
├── services/             # API services
├── stores/               # Pinia stores
├── types/                # TypeScript type definitions
├── views/                # Page components
│   ├── Login.vue
│   ├── MediaDetail.vue
│   └── MediaList.vue
├── App.vue
├── main.ts
└── style.css
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd instachatico-ui
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BEARER_TOKEN=your-bearer-token-here
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## API Configuration

The application expects a JSON API with Bearer token authentication. Update the `.env` file with your API base URL and token.

### API Endpoints Used

- `GET /media` - List media posts
- `GET /media/:id` - Get single media post
- `PATCH /media/:id` - Update media settings
- `GET /media/:id/comments` - List comments for a media post
- `DELETE /comments/:id` - Delete a comment
- `PATCH /comments/:id` - Update comment (hide/unhide)
- `PATCH /comments/:id/classification` - Update comment classification
- `GET /comments/:id/answers` - Get answers for a comment
- `DELETE /answers/:id` - Delete an answer
- `PATCH /answers/:id` - Update an answer

## Design System

### Color Palette

- **Navy**: `#0f172a` to `#64748b` (primary dark tones)
- **Soft Blue**: `#3b82f6` to `#eff6ff` (accent colors)
- **Semantic Colors**:
  - Success: `#10b981`
  - Warning: `#f59e0b`
  - Error: `#ef4444`
  - Info: `#3b82f6`

### Typography

- Font Family: System fonts (Apple, SF, Segoe UI, Roboto)
- Base Size: 16px
- Headings: 600 weight, navy colors
- Body: 400 weight, navy-600

### Spacing

- XS: 0.25rem (4px)
- SM: 0.5rem (8px)
- MD: 1rem (16px)
- LG: 1.5rem (24px)
- XL: 2rem (32px)
- 2XL: 3rem (48px)

## Authentication

The application uses Bearer token authentication. On first load:

1. User is redirected to the login page
2. Enter your API bearer token
3. Token is stored in localStorage
4. All API requests include the token in the Authorization header

To logout, click the "Logout" button in the header.

## Key Features

### Media List

- Grid view of Instagram posts
- Thumbnail preview, caption, likes, and comment count
- Status badges (Comments Enabled, Processing Enabled)
- Click to view details
- Pagination support (10 posts per page, max 30)

### Media Detail

- Full post details with image
- Edit post context (AI description)
- Toggle comment and processing settings
- View on Instagram link
- Comments section with filtering

### Comments Section

- Filter by processing status (Pending, Processing, Completed, Failed)
- Comment classification with confidence score
- Hide/unhide and delete actions
- Manual classification editing
- View AI-generated answers with quality metrics
- Pagination (30 comments per page, max 100)

### Comment Classification

- Visual badges for each classification type
- Confidence bar chart
- Processing status indicator
- Reasoning display
- Manual override capability

### Answer Monitoring

- Confidence and quality score bars
- Sent/pending status
- Reply status and error tracking
- Highlighted with soft blue background

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Development Notes

### Code Style

- Use Composition API with `<script setup>`
- TypeScript strict mode enabled
- Component-scoped styles
- CSS custom properties for theming

### State Management

- Pinia stores for media, comments, and auth
- Reactive state with computed properties
- Async actions for API calls

### Routing

- Vue Router with navigation guards
- Protected routes require authentication
- Route-based code splitting

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure TypeScript compiles without errors
4. Test all features
5. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on the repository.

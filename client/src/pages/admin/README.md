# Admin Panel

This directory contains the admin panel components and pages for the Encriptofy application.

## Features

- **Dashboard**: Overview of system statistics and quick actions
- **User Management**:
  - View all users with pagination and search
  - Create new user accounts
  - Edit existing user details
  - Toggle user active status
  - Change user roles (user/admin)
  - Delete users

## Pages

### Dashboard (`/admin`)
- Displays key metrics and quick access to common actions
- Shows recent activity (placeholder for now)

### Users List (`/admin/users`)
- Table view of all users with sorting and filtering
- Pagination for large user lists
- Quick actions for each user (edit, delete, toggle status)

### Create User (`/admin/users/new`)
- Form to create a new user account
- Input validation and error handling
- Role assignment (user/admin)

### Edit User (`/admin/users/:userId/edit`)
- Edit user details
- Change password (admin only)
- Toggle active status
- Update user role

## Components

### AdminLayout
- Provides consistent layout for all admin pages
- Responsive sidebar navigation
- Mobile-friendly design with collapsible menu
- User profile and logout functionality

### User Management Components
- `UsersPage`: Main users list view
- `UserCreatePage`: Form for creating new users
- `UserEditPage`: Form for editing existing users

## API Integration

All admin functionality uses the following API endpoints:

- `GET /api/v1/users` - Get all users (with pagination)
- `POST /api/v1/users` - Create a new user
- `GET /api/v1/users/:id` - Get user by ID
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `PATCH /api/v1/users/:id/status` - Toggle user active status
- `PATCH /api/v1/users/:id/role` - Update user role

## Authentication

All admin routes are protected and require:
1. User to be authenticated
2. User to have the 'admin' role

Unauthenticated users are redirected to the login page.
Non-admin users are redirected to the home page.

## Styling

- Uses Tailwind CSS for styling
- Responsive design works on all screen sizes
- Consistent color scheme and UI components

## Environment Variables

Make sure these environment variables are set:

```
REACT_APP_API_URL=http://localhost:5000
```

## Development

### Prerequisites
- Node.js 14+
- npm or yarn

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

3. The admin panel will be available at `http://localhost:3000/admin`

## Testing

To run tests:

```bash
npm test
# or
yarn test
```

## Deployment

Build the application for production:

```bash
npm run build
# or
yarn build
```

The built files will be in the `dist` directory.

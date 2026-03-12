# DocFlow - Quick Start Guide

Welcome to DocFlow! Get up and running in 60 seconds.

## 🚀 Start the App

```bash
# Install dependencies (if not already done)
pnpm install

# Start development server
pnpm dev

# Open in browser
# http://localhost:3000
```

## 🔐 Login with Demo Account

Visit the login page and use these credentials:
- **Email**: `demo@example.com`
- **Password**: `password`

Or create a new account using the registration page.

## 📋 What You Can Do

### For Regular Users:
1. **Dashboard** - View stats, recent documents, and activity feed
2. **Upload Documents** - Drag & drop files or click to select
3. **Browse Documents** - Search, filter, and download files
4. **Organize Folders** - Create and manage document folders
5. **View Activity** - See what others are uploading and doing

### For Admins (use any login):
Everything above, PLUS:
1. **Manage Users** - Create, edit, or remove users
2. **View Audit Logs** - See all system activity
3. **Configure Settings** - Adjust storage limits and security options

## 🎯 Try These Features

### 1. Upload a Document
- Go to **Documents** → **Upload New**
- Drag and drop files or click **Select Files**
- Choose a folder and classification
- Watch the progress bar

### 2. Search Documents
- Go to **Documents** page
- Use the search bar to find files
- Filter by file type
- Click to open documents

### 3. Create Folders
- Go to **Folders** page
- Type a folder name and click **Create**
- See documents organized by folder
- Delete or rename as needed

### 4. Admin Panel (if logged in as admin)
- Go to **Admin** → **Users** to manage people
- Go to **Admin** → **Audit Logs** to see activity
- Go to **Admin** → **Settings** to configure the system
- Export logs to CSV

## 📱 Mobile Experience

The app works great on mobile:
- Tap the menu icon (☰) to show/hide sidebar
- Touch-friendly buttons and interfaces
- Responsive design for all screen sizes

## 🎨 Design Highlights

- **Dark Enterprise Theme** - Easy on the eyes
- **Purple Accents** - Modern, professional look
- **Smooth Animations** - Polished interactions
- **High Contrast** - Excellent readability

## 📊 Dashboard Breakdown

| Card | Shows |
|------|-------|
| Total Documents | 1,248 documents in system |
| Uploaded Today | 23 files uploaded today |
| Pending Approvals | 5 files awaiting approval |
| Storage Used | 640 GB of 1000 GB |

## 🔍 Search Tips

- Search by **document name**: Type the filename
- Search by **uploader name**: Type person's name
- Filter by **type**: Select PDF, DOCX, XLSX, etc.
- Multiple filters work together

## 📁 Folder Organization

Pre-populated folders:
- **General** - 89 documents
- **Finance** - 42 documents
- **HR** - 28 documents
- **Projects** - 156 documents
- **Marketing** - 67 documents

Create your own custom folders!

## 👥 User Roles

| Role | Can Do |
|------|--------|
| **Admin** | Everything + manage users & settings |
| **Manager** | Upload, download, share documents |
| **Staff** | Upload and view documents |
| **Viewer** | View documents only |

## 🐛 Troubleshooting

**Can't log in?**
- Use demo@example.com / password
- Or create a new account

**Files not uploading?**
- Check file size (max 100MB)
- Check file format (PDF, DOC, DOCX, XLSX, JPG, PNG)
- Try a smaller file

**Can't find documents?**
- Use the search bar
- Clear filters and try again
- Check which folder you're looking in

## 📝 Demo Data

The app comes pre-loaded with:
- 5 sample users
- 5 sample folders
- 1,248 mock documents
- 5 recent activities
- Complete audit logs

Replace with your real data later!

## 🛠 What's Next?

1. **Customize** - Modify colors, fonts, and content
2. **Connect Backend** - Replace mock data with real API
3. **Add Features** - Document viewer, approval workflows, etc.
4. **Deploy** - Push to Vercel with one click

## 📚 Learn More

- [Full README](./README.md) - Complete documentation
- [Next.js Docs](https://nextjs.org/docs) - Framework guide
- [shadcn/ui](https://ui.shadcn.com) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling guide

## 💡 Pro Tips

✨ Click **Forgot Password** to see the reset flow
✨ Try creating multiple user roles to see different UIs
✨ Use **Audit Logs** to track all system activity
✨ Export audit logs to CSV for compliance
✨ Dashboard loads fast - check it out!

## 🎓 Code Structure

```
app/                    # Pages and routing
├── (auth)/             # Login, register, forgot password
├── (app)/              # Main app features
│   ├── dashboard/      # Main dashboard
│   ├── documents/      # Document management
│   ├── folders/        # Folder management
│   └── admin/          # Admin panel
components/             # Reusable components
├── layouts/            # App structure
├── features/           # Feature-specific components
└── ui/                 # shadcn/ui components
```

## 🎉 You're All Set!

Click around, explore the features, and enjoy using DocFlow! 

Questions? Check the README or explore the code - it's well-documented and easy to modify.

Happy documenting! 🚀

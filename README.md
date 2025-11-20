# Personal Portfolio Website Template

A modern, responsive personal portfolio website built with React, TypeScript, and Vite. This template features a clean design with smooth animations and an intuitive navigation system.

## 🚀 Features

- **Modern Tech Stack**: Built with React 19, TypeScript, and Vite for optimal performance
- **Responsive Design**: Fully responsive layout that works on all device sizes
- **Multiple Pages**: 
  - Home: Hero section with call-to-action buttons and feature cards
  - About: Personal story, skills showcase, and services offered
  - Projects: Portfolio showcase with project cards and links
  - Contact: Contact form and social media links
- **Smooth Navigation**: React Router with active link highlighting
- **Clean UI**: Modern dark theme with gradient accents
- **Type Safe**: Full TypeScript support with proper type definitions
- **Easy to Customize**: Well-organized component structure

## 📸 Screenshots

### Home Page
![Home Page](https://github.com/user-attachments/assets/696b2d51-0b56-4569-81aa-eada52cd3db0)

### About Page
![About Page](https://github.com/user-attachments/assets/8a8c1e1f-b7c9-45d9-9f7c-99d21abcca35)

### Projects Page
![Projects Page](https://github.com/user-attachments/assets/af8db746-67f5-473d-bad4-2c30d210e52a)

### Contact Page
![Contact Page](https://github.com/user-attachments/assets/f1353aa2-f4a4-47e7-ac16-3df67f6bcd01)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/GrassHeadd/grasshead-fe.git
cd grasshead-fe
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 📦 Build for Production

Build the project for production:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## 🎨 Customization

### Personal Information

Edit the content in the following files to customize with your own information:

- **Home Page**: `src/pages/Home.tsx`
- **About Page**: `src/pages/About.tsx` - Update skills, services, and personal story
- **Projects Page**: `src/pages/Projects.tsx` - Add your own projects
- **Contact Page**: `src/pages/Contact.tsx` - Update contact information and social links

### Styling

All styles are organized in component-specific CSS files:
- Global styles: `src/index.css`
- App layout: `src/App.css`
- Component styles: `src/components/*.css`
- Page styles: `src/pages/*.css`

### Colors

The main color scheme uses:
- Primary: `#646cff` (blue)
- Background: `#242424` (dark gray)
- Secondary background: `#1a1a1a` (darker gray)

You can easily change these in the respective CSS files.

## 📁 Project Structure

```
src/
├── components/          # Reusable components
│   ├── Navigation.tsx   # Navigation bar
│   └── Navigation.css
├── pages/              # Page components
│   ├── Home.tsx        # Home page
│   ├── Home.css
│   ├── About.tsx       # About page
│   ├── About.css
│   ├── Projects.tsx    # Projects page
│   ├── Projects.css
│   ├── Contact.tsx     # Contact page
│   └── Contact.css
├── types/              # TypeScript type definitions
│   └── index.ts
├── App.tsx             # Main app component with routing
├── App.css             # App-level styles
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## �� Technologies Used

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **CSS3** - Styling with modern features

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your Profile](https://linkedin.com/in/yourprofile)

---

Made with ❤️ using React & TypeScript

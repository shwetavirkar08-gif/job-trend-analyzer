# Job Trend Analyzer

A comprehensive job trend analyzer that matches employees to jobs based on skills, with resume parsing, skill analysis, and market insights.

## 🌟 Features

- **Resume Builder & Upload**: Create and upload resumes for analysis
- **Job Matching**: Match your skills with available job opportunities
- **Skills Analysis**: Analyze and visualize your skill set
- **Skill Suggestions**: Get personalized skill improvement recommendations
- **Job Trends**: View current market trends and job demand
- **Market Insights**: Comprehensive market analysis and insights

## 🚀 Live Demo

Your application will be available at:
- **Frontend**: https://job-trend-analyzer-web.onrender.com
- **Backend API**: https://job-trend-analyzer-api.onrender.com

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Chart.js
- **Backend**: Node.js, Express.js
- **File Processing**: PDF parsing, Natural language processing
- **Deployment**: Render.com (Free hosting)

## 📦 Installation

### Prerequisites
- Node.js (>=16.0.0)
- npm (>=8.0.0)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd job-trend-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Start development servers**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 🌐 Deployment

### Automatic Deployment with Render.com

This project is configured for automatic deployment on Render.com. Follow these steps:

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial deployment setup"
   git push origin main
   ```

2. **Connect to Render.com**
   - Go to [render.com](https://render.com)
   - Sign up/Login with your GitHub account
   - Click "New +" and select "Blueprint"
   - Connect your GitHub repository
   - Render will automatically detect the `render.yaml` configuration

3. **Automatic Deployment**
   - Render will automatically deploy both services
   - Your app will be available at the URLs provided above
   - Any future pushes to main will trigger automatic redeployment

### Manual Deployment

If you prefer manual deployment:

1. **Backend Service**
   - Create a new Web Service on Render
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm run server`
   - Set environment variable: `NODE_ENV=production`

2. **Frontend Service**
   - Create a new Static Site on Render
   - Connect your GitHub repository
   - Set build command: `cd client && npm install && npm run build`
   - Set publish directory: `client/build`

## 🔧 Environment Variables

Create a `.env` file in the root directory for local development:

```env
NODE_ENV=development
PORT=5000
```

For production, these are automatically set by Render.com.

## 📁 Project Structure

```
job-trend-analyzer/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context
│   │   └── App.js         # Main app component
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── uploads/          # File upload directory
│   └── index.js          # Server entry point
├── render.yaml           # Render deployment config
├── package.json          # Root package.json
└── README.md
```

## 🔌 API Endpoints

- `GET /api/health` - Health check
- `POST /api/resume/upload` - Upload resume
- `GET /api/jobs` - Get job listings
- `POST /api/skills/analyze` - Analyze skills
- `GET /api/analysis/trends` - Get job trends
- `POST /api/chatbot/message` - Chatbot interaction

## 🎯 Features in Detail

### Resume Builder
- Interactive form-based resume creation
- PDF export functionality
- Template-based design

### Job Matching
- Skill-based job recommendations
- Match percentage calculation
- Job details and requirements

### Skills Analysis
- Visual skill assessment
- Gap analysis
- Improvement suggestions

### Market Insights
- Real-time job market data
- Trend visualization
- Industry analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues:
1. Check the deployment logs on Render.com
2. Verify all environment variables are set
3. Ensure all dependencies are properly installed

## 🔄 Updates

The application automatically redeploys when you push changes to the main branch. No manual intervention required!

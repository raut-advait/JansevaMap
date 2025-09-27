# JansevaMap - Citizen Complaint Management System

JansevaMap is a comprehensive citizen complaint management system that empowers citizens to report civic issues, track their resolution progress, and interact with an AI-powered chatbot for support. Built with modern web technologies and designed for scalability and user-friendliness.

## 🌟 Features

### 🗺️ Interactive Map Interface
- **Location-based Reporting**: Click on map to pinpoint exact issue location
- **Real-time Updates**: Live complaint markers with status indicators
- **Area Filtering**: Filter complaints by geographical areas
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 📱 Multi-page Application
- **Home Page**: Overview dashboard with statistics and recent complaints
- **Map Page**: Interactive map for reporting and viewing complaints
- **Chat Page**: AI-powered support chatbot

### 🤖 AI Chatbot Support
- **Perplexity API Integration**: Uses advanced AI for intelligent, up-to-date responses
- **Intent Recognition**: Understands user queries and provides relevant responses
- **Real-time Information**: Access to current policies, laws, and civic service updates
- **Contextual Help**: Provides step-by-step guidance for complaint filing
- **Offline Fallback**: Works even when external services are unavailable

### 📊 Analytics & Reporting
- **Real-time Statistics**: Live dashboard with complaint metrics
- **Area Performance**: Track resolution rates by geographical areas
- **Resolution Tracking**: Monitor average resolution times
- **User Engagement**: Track active users and system usage

## 🏗️ Architecture

### Frontend
- **HTML5/CSS3/JavaScript**: Modern, responsive web interface
- **Leaflet.js**: Interactive mapping functionality
- **Progressive Enhancement**: Works without JavaScript for basic functionality
- **Mobile-first Design**: Optimized for mobile devices

### Backend Services
- **Flask Chatbot**: Python-based AI service with Perplexity API integration
- **Perplexity AI**: Advanced language model for intelligent responses
- **Supabase Integration**: PostgreSQL database with real-time capabilities
- **RESTful APIs**: Clean, documented API endpoints
- **Authentication**: Secure user management and access control

### Database
- **PostgreSQL**: Robust, scalable database with PostGIS for spatial data
- **Real-time Subscriptions**: Live updates for complaint status changes
- **Row Level Security**: Fine-grained access control
- **Spatial Indexing**: Optimized for location-based queries

## 📁 Project Structure

```
project-root/
├── frontend/
│   ├── index.html          # Home page with dashboard
│   ├── map.html            # Interactive map interface
│   ├── chat.html           # AI chatbot interface
│   ├── css/
│   │   └── styles.css      # Main stylesheet
│   └── js/
│       ├── app.js          # Main application logic
│       └── chat.js         # Chatbot integration
├── chatbot/
│   ├── app.py              # Flask chatbot service
│   └── requirements.txt    # Python dependencies
├── supabase/
│   ├── schema.sql          # Database schema
│   └── notes.txt           # Setup and integration notes
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+ (for Supabase CLI)
- Modern web browser
- Supabase account

### 1. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Link to your remote project
supabase link --project-ref YOUR_PROJECT_REF

# Run database migrations
supabase db push
```

### 2. Environment Setup
```bash
# Create environment file
cp .env.example .env

# Edit .env with your Supabase credentials
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Chatbot Service
```bash
# Navigate to chatbot directory
cd chatbot

# Install dependencies
pip install -r requirements.txt

# Start the service
python app.py
```

### 4. Test Perplexity API Integration
```bash
# Run the test script
python test_perplexity.py

# Or test manually via API
curl -X POST http://localhost:5000/test-perplexity \
  -H "Content-Type: application/json" \
  -d '{"message": "What are the latest civic service policies?"}'
```

### 5. Serve Frontend
```bash
# Serve frontend files (use any HTTP server)
# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve frontend

# Option 3: Live Server (VS Code extension)
# Right-click on index.html and select "Open with Live Server"
```

### 6. Access Application
- Open browser to `http://localhost:8000`
- Chatbot service runs on `http://localhost:5000`
- Test Perplexity integration at `http://localhost:5000/test-perplexity`

## 🔧 Configuration

### Frontend Configuration
Edit `frontend/js/app.js` to configure:
- Default map center coordinates
- API endpoints
- Notification settings
- Map tile providers

### Chatbot Configuration
Edit `chatbot/app.py` to configure:
- Response templates
- Intent patterns
- Database connections
- Logging levels
- Perplexity API settings

### Database Configuration
Edit `supabase/schema.sql` to configure:
- User roles and permissions
- Complaint types and priorities
- Area definitions
- System settings

## 📱 Usage Guide

### For Citizens

#### Reporting a Complaint
1. Navigate to the Map page
2. Click "Report Issue" button
3. Select issue type from dropdown
4. Describe the problem in detail
5. Click on map to select exact location
6. Enter contact information
7. Submit complaint

#### Tracking Progress
1. Visit the Home page
2. Check "Recent Complaints" section
3. Look for your complaint by ID or description
4. Monitor status updates (Pending → Processing → Resolved)

#### Getting Help
1. Go to Chat page
2. Type your question or use quick action buttons
3. Get instant AI-powered responses with real-time information
4. Ask about current policies, laws, or recent developments
5. Contact support if needed

### For Administrators

#### Managing Complaints
1. Access admin dashboard (requires authentication)
2. View all complaints with filtering options
3. Update complaint status and add notes
4. Assign complaints to staff members
5. Monitor resolution timelines

#### Analytics Dashboard
1. View real-time statistics
2. Analyze area performance metrics
3. Track resolution rates and times
4. Monitor user engagement

## 🔒 Security Features

### Data Protection
- **Encryption**: All sensitive data encrypted at rest and in transit
- **Authentication**: Secure user authentication with Supabase Auth
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Comprehensive input sanitization and validation

### Privacy
- **Data Minimization**: Only collect necessary information
- **User Consent**: Clear privacy policy and consent mechanisms
- **Data Retention**: Configurable data retention policies
- **GDPR Compliance**: Built-in privacy controls

### API Security
- **Rate Limiting**: Prevent abuse and DoS attacks
- **CORS Configuration**: Proper cross-origin resource sharing
- **SQL Injection Protection**: Parameterized queries and input validation
- **XSS Protection**: Content Security Policy and input sanitization

## 🚀 Deployment

### Production Deployment

#### Frontend (Static Hosting)
```bash
# Build optimized version
npm run build

# Deploy to static hosting
# Options: Netlify, Vercel, GitHub Pages, AWS S3
```

#### Chatbot Service (Container)
```bash
# Build Docker image
docker build -t jansevamap-chatbot ./chatbot

# Run container
docker run -p 5000:5000 jansevamap-chatbot
```

#### Database (Supabase)
- Use Supabase managed hosting
- Configure production environment variables
- Set up monitoring and alerts
- Enable automated backups

### Environment Variables
```env
# Production Environment
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
FLASK_ENV=production
DEBUG=false
```

## 📊 Monitoring & Analytics

### Key Metrics
- **Complaint Volume**: Total complaints by type and area
- **Resolution Rate**: Percentage of resolved complaints
- **Average Resolution Time**: Time from submission to resolution
- **User Engagement**: Active users and session duration
- **System Performance**: Response times and error rates

### Monitoring Tools
- **Supabase Dashboard**: Database metrics and performance
- **Application Logs**: Error tracking and debugging
- **User Analytics**: Behavior tracking and optimization
- **Performance Monitoring**: Response time and availability

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit changes: `git commit -m 'Add new feature'`
5. Push to branch: `git push origin feature/new-feature`
6. Submit pull request

### Code Standards
- **JavaScript**: ESLint configuration
- **Python**: PEP 8 compliance
- **CSS**: BEM methodology
- **HTML**: Semantic markup and accessibility

### Testing
- **Unit Tests**: Test individual components
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Load and stress testing

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenStreetMap**: For providing free map tiles
- **Leaflet.js**: For the mapping library
- **Supabase**: For the backend-as-a-service platform
- **Flask**: For the Python web framework
- **Community Contributors**: For feedback and contributions

## 📞 Support

### Documentation
- [User Guide](docs/user-guide.md)
- [API Documentation](docs/api.md)
- [Deployment Guide](docs/deployment.md)
- [Troubleshooting](docs/troubleshooting.md)

### Contact
- **Email**: support@jansevamap.gov.in
- **Phone**: 1800-123-4567
- **Website**: https://jansevamap.gov.in
- **GitHub Issues**: [Report bugs and feature requests](https://github.com/jansevamap/issues)

### Community
- **Discord**: [Join our community](https://discord.gg/jansevamap)
- **Twitter**: [@JansevaMap](https://twitter.com/jansevamap)
- **LinkedIn**: [JansevaMap](https://linkedin.com/company/jansevamap)

---

**JansevaMap** - Empowering citizens through technology for better civic services.

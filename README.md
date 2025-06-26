# 🏥 NJ Health - Patient Record Management System

A comprehensive, offline-first patient record management web application built with Next.js and Tailwind CSS. This application allows healthcare providers to manage patient records, track medical visits, and analyze health trends using only browser storage.

## ✨ Features

### 📋 Patient Management
- **Full CRUD Operations**: Create, read, update, and delete patient records
- **Patient Information**: Name, age, gender, contact details
- **Visit Tracking**: Record symptoms, diagnoses, treatments, and healing duration
- **Severity Classification**: Mild, moderate, and severe case categorization

### 📊 Analytics & Insights
- **Data Visualization**: Interactive charts using Chart.js
- **Common Symptoms Analysis**: Track most frequent symptoms
- **Diagnosis Trends**: Monitor common diagnoses
- **Visit Frequency**: Analyze patient visit patterns over time
- **Severity Distribution**: Visualize case severity breakdowns

### 🧠 Pattern Detection
- **AI-like Logic**: JavaScript-based pattern recognition
- **Symptom Repetition Alerts**: Detect repeated symptoms within timeframes
- **Frequent Visit Detection**: Identify unusual visit patterns
- **Severe Case Monitoring**: Track multiple severe cases
- **Health Trend Analysis**: Determine if patients are improving, worsening, or stable

### 💾 Data Management
- **Offline-First**: All data stored locally in browser (localStorage)
- **Data Export**: Download patient data as JSON
- **Data Import**: Restore data from JSON files
- **No Backend Required**: 100% frontend application

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS 4
- **Charts**: Chart.js with react-chartjs-2
- **Storage**: Browser localStorage
- **Language**: TypeScript
- **Deployment**: Vercel/Netlify ready

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd njheatlthcalc
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Usage

### Dashboard
- View overview statistics
- See recent patients and visits
- Quick access to main features

### Patient Records
- Add new patients with complete information
- Edit existing patient details
- View detailed patient history
- Add multiple visits per patient
- Track symptoms, diagnoses, and treatments

### Analytics
- Interactive charts and graphs
- Export data for backup
- Import data from previous exports
- View pattern detection alerts

## 🔧 Configuration

### Pattern Detection Settings
The application includes configurable thresholds for pattern detection:

```typescript
const DEFAULT_CONFIG = {
  symptomRepeatThreshold: 3,    // Alert after 3 repeated symptoms
  symptomRepeatDays: 30,        // Within 30 days
  frequentVisitThreshold: 5,    // Alert after 5 visits
  frequentVisitDays: 30,        // Within 30 days
  severeCaseThreshold: 2,       // Alert after 2 severe cases
  severeCaseDays: 7             // Within 7 days
};
```

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Dashboard
│   ├── patients/
│   │   └── page.tsx          # Patient management
│   ├── analytics/
│   │   └── page.tsx          # Analytics dashboard
│   └── layout.tsx            # Main layout
├── components/
│   ├── PatientForm.tsx       # Patient form component
│   └── PatientTable.tsx      # Patient table component
└── utils/
    ├── types.ts              # TypeScript interfaces
    ├── localStorageUtils.ts  # Data storage utilities
    └── patternDetection.ts   # Pattern detection logic
```

## 🔒 Data Privacy

- **Local Storage**: All data is stored in your browser's localStorage
- **No Cloud Storage**: No data is sent to external servers
- **Offline Capable**: Works completely offline
- **Data Export**: Full control over your data with export/import functionality

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Deploy the `out` directory to Netlify

### Static Hosting
1. Build the project: `npm run build`
2. Upload the `out` directory to any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support or questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- [ ] PWA capabilities for mobile use
- [ ] Advanced filtering and search
- [ ] Custom pattern detection rules
- [ ] Data backup to cloud storage (optional)
- [ ] Multi-language support
- [ ] Advanced reporting features

---

**Built with ❤️ for healthcare providers who need a simple, reliable patient management solution.**

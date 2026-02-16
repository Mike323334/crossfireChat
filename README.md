# CrossfireChat 🖤

An interactive chat application that allows you to converse with characters from Sylvia Day's bestselling Crossfire series using artificial intelligence.

![Crossfire Chat](https://img.shields.io/badge/Version-1.0.0-blue)
![React](https://img.shields.io/badge/Frontend-React_18.2.0-61DAFB)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688)
![Groq](https://img.shields.io/badge/AI-Groq_Llama_3.3-F37413)

## 📚 About the Project

**CrossfireChat** brings the beloved characters from Sylvia Day's Crossfire series to life through AI-powered conversations. Chat with **Eva Tramell** and **Gideon Cross** as if they were right there with you.

This application uses:
- **Retrieval Augmented Generation (RAG)** to provide contextually relevant responses based on the Crossfire book series
- **Advanced language detection** to automatically switch between Spanish and English
- **Machine learning** for improved language understanding over time

### The Crossfire Series

The Crossfire series consists of five books:
1. **Bared to You** (Desnuda ante ti)
2. **Reflected in You** (Refleja en ti)
3. **Entwined with You** (Entrelazado contigo)
4. **Captivated by You** (Cautivado por ti)
5. **One with You** (Uno contigo)

---

## ✨ Features

- 🤖 **AI-Powered Conversations**: Chat with Eva or Gideon using state-of-the-art LLM technology
- 🌎 **Bilingual Support**: Automatic language detection between Spanish and English
- 📖 **Character Authenticity**: Responses based on the Crossfire book series
- 🎨 **Beautiful UI**: Modern dark theme with red accents inspired by the series
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 💬 **Real-time Chat**: Instant responses from your favorite characters

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Modern Python web framework |
| **Groq API** | LLM inference (Llama-3.3-70b-versatile) |
| **FastText** | Language detection model |
| **pdfplumber** | PDF text extraction |
| **langdetect** | Fallback language detection |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Vite** | Build tool |
| **Tailwind CSS** | Styling |
| **CSS Modules** | Component-specific styles |

---

## 🚀 Getting Started

### Prerequisites

- **Backend**: Python 3.11+, pip
- **Frontend**: Node.js 18+, npm
- **API Key**: Groq API key (required for AI features)

### Installation

#### 1. Clone the Repository

```
bash
git clone https://github.com/yourusername/crossfireChat.git
cd crossfireChat
```

#### 2. Backend Setup

```
bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export GROQ_API_KEY="your_groq_api_key_here"

# Run the backend
python -m uvicorn backend.app:app --reload
```

The backend will be available at `http://localhost:5000`

#### 3. Frontend Setup

```
bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## 📡 API Documentation

### Base URL

- **Production**: `https://crossfirechat.onrender.com`
- **Development**: `http://localhost:5000`

### Endpoints

#### Chat with Character

```
http
POST /chat/{character}
```

**Parameters:**
- `character` (path): Character name - either "Eva" or "Gideon"

**Request Body:**
```
json
{
  "message": "Your message here"
}
```

**Response:**
```
json
{
  "response": "Character's response here"
}
```

**Example:**

```
bash
curl -X POST "http://localhost:5000/chat/Eva" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola Eva, cómo estás?"}'
```

---

## 🧠 Language Detection

The application includes an intelligent language detection system that:

1. **Static Overrides**: Common words in Spanish and English
2. **Phrase Detection**: Recognizes slang and expressions (e.g., "hola", "hey", "q tal")
3. **Accent Heuristic**: Detects Spanish accents (áéíóúñü)
4. **Dynamic Learning**: Learns new words and phrases over time
5. **Fallback**: Uses langdetect library when other methods fail

The system automatically responds in the same language you use to message.

---

## 📁 Project Structure

```
crossfireChat/
├── backend/
│   ├── app.py              # FastAPI application setup
│   ├── routes.py           # API routes
│   ├── groq_client.py      # Groq API integration & language detection
│   ├── search.py           # RAG search (placeholder)
│   ├── utils.py            # PDF processing utilities
│   ├── config.py           # Configuration
│   ├── preprocess_books.py # Book preprocessing script
│   ├── requirements.txt    # Python dependencies
│   ├── dockerfile          # Docker configuration
│   ├── books/              # Crossfire PDF books
│   │   ├── Crossfire1.pdf
│   │   ├── Crossfire2.pdf
│   │   ├── Crossfire3.pdf
│   │   ├── Crossfire4.pdf
│   │   └── Crossfire5.pdf
│   └── fasttext/           # FastText language model
│       └── lid.176.ftz
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component
│   │   ├── pages/
│   │   │   ├── HomePage.jsx     # Home page with character selection
│   │   │   └── ChatPage.jsx     # Chat interface
│   │   ├── components/
│   │   │   ├── CharacterSelector.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── MessageBubble.jsx
│   │   ├── api/
│   │   │   └── chatApi.js       # API client
│   │   ├── i18n/
│   │   │   └── es.json           # Spanish translations
│   │   └── styles/               # CSS files
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── docker-compose.yml
└── README.md
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GROQ_API_KEY` | Groq API key (required) | - |
| `MODEL_NAME` | LLM model name | `llama-3.3-70b-versatile` |
| `PORT` | Server port | `5000` |

### Configuration File (backend/config.py)

```
python
BOOK_PATHS = {
    "eva": ["backend/books/Crossfire1.pdf", ...],
    "gideon": ["backend/books/Crossfire1.pdf", ...],
}

CHUNK_SIZE = 1200      # characters per chunk
TOP_K_CHUNKS = 5       # chunks sent to LLM per message
```

---

## 🐳 Docker Deployment

### Build and Run with Docker

```
bash
# Build the Docker image
docker build -t crossfirechat-backend -f backend/dockerfile .

# Run the container
docker run -p 5000:5000 -e GROQ_API_KEY=your_api_key crossfirechat-backend
```

### Docker Compose

```
bash
docker-compose up --build
```

---

## 🌐 Deployment

### Production Deployment (Render)

The application is deployed on Render:

- **Backend**: `https://crossfirechat.onrender.com`
- **Frontend**: `https://crossfirechat-1.onrender.com`

#### Backend Environment Variables on Render
```
GROQ_API_KEY = your_groq_api_key
MODEL_NAME = llama-3.3-70b-versatile
PORT = 10000
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is for educational and personal use. The Crossfire series and its characters are copyrighted © Sylvia Day. This application is not affiliated with or endorsed by Sylvia Day.

---

## 🙏 Acknowledgments

- **Sylvia Day** for creating the amazing Crossfire series
- **Groq** for providing the LLM API
- **FastAPI** team for the amazing web framework
- **React** and **Vite** teams for the modern frontend tooling

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/crossfireChat/issues) page
2. Create a new issue with detailed information
3. Feel free to contribute with fixes!

---

*Made with ❤️ for Crossfire fans*

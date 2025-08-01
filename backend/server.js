const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const axios = require('axios'); 

const app = express();
const port = 8000;

// Use CORS middleware
app.use(cors());

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(bodyParser.json());
app.use(session({ secret: 'adminSecret', resave: false, saveUninitialized: true }));

// Connect to  MongoDB atlas
mongoose.connect('mongodb+srv://maheshsuthardm:G4gSsjwWnEoNyXTT@cluster0.jraxgkp.mongodb.net/packmytrip?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Gemini AI Configuration
const GEMINI_API_KEY = "AIzaSyBcHsU0asH-v1fl56NntERBb9T-vO1voyw";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// Function to format AI response (Convert Markdown to HTML)
function formatResponse(text) {
    return text
    .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") 
    .replace(/\*(.*?)\*/g, "<i>$1</i>") 
    .replace(/\n\* (.*?)\n/g, "<ul><li>$1</li></ul>") 
    .replace(/(\n\s*){2,}/g, "<br><br>") 
    .replace(/\nUser:/g, "<br><br><b>User:</b>")
    .replace(/\nBot:/g, "<br><br><b>Bot:</b>") 
    .replace(/\n/g, "<br>") 
    .replace(/<\/ul><br><ul>/g, "") 
    .replace(/<ul><li>(.*?)<\/li><\/ul>/g, "<ul><li>$1</li></ul>")
    .replace(/<ul><li>(.*?)<\/li><\/ul><br>/g, "<ul><li>$1</li></ul>"); 
}

// Function to detect Hinglish (Basic Approach)
function isHinglish(text) {
    const hindiWords = ["batao", "jaipur", "mujhe", "kaha", "kaise", "acha", "kyu", "kya", "hai", "kaun", "hindi"];
    return hindiWords.some(word => text.toLowerCase().includes(word));
}

// Chatbot Route - Fix Markdown Formatting
app.post('/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;

        // Detect Hinglish
        const languageInstruction = isHinglish(userMessage)
            ? "Respond in **Hinglish (Roman Hindi)**."
            : "Respond in the **same language** as the user’s query.";

        const response = await axios.post(GEMINI_URL, {
            contents: [{
                parts: [{
                    text: `# PackMyTrip Chatbot - Smart Travel Assistant
                    
                   ## Instructions:
                    - Answer only about **Indian travel & tour packages** and **PackMyTrip website** queries.
                    - If the user asks about **PackMyTrip website features**, provide:
                      - **How to book a trip**, **Check booking status**, **Customer support details**.
                    - If the user asks for **destination details**, provide:
                      - **Best Time to Visit**, **Top Attractions**, **Food Specialties**, **Weather**, **Transport Options**, **Budget Estimate**.
                    - If the user provides a **budget**, generate a full **itinerary**:
                      - **Trip Duration**, **Places to Visit**, **Hotels**, **Food Cost**, **Transport**, **Total Budget**.
                      - If the user asks about a **specific place or its history**, provide:
                      - **Historical significance**, **Famous landmarks**, **Cultural importance**, **Legends or stories related to that place**.
                      - **${languageInstruction}**
                    - Format responses using **bold** for key details and **lists** for easy reading.
                      - Leave a **blank line** between different sections for readability.
                      - If multiple questions are asked, ensure each response is **separated by a blank line**.

                    ## User Query:
                    ${userMessage}`
                }]
            }]
        });

        let botReply = response.data.candidates[0].content.parts[0].text;
        botReply = formatResponse(botReply); // Convert Markdown to HTML

        res.json({ reply: botReply });

    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({ error: "Something went wrong." });
    }
});

// MongoDB Schema for Booking Form
const BookingSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    address: String,
    guests: Number,
    arrival: Date,
    leaving: Date,
    package_name: String,
    total_price: Number,
    status: { type: String, default: 'Pending' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Booking = mongoose.model('Booking', BookingSchema);

// Predefined Admin Credentials
const ADMIN_CREDENTIALS = { email: 'admin@packmytrip.com', password: 'admin123' };

// Admin Login Route
app.post('/admin/login', (req, res) => {
    const { email, password } = req.body;
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        req.session.admin = true;
        return res.json({ success: true, message: 'Login successful' });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});

// Admin Logout Route
app.post('/admin/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
});

// Middleware to check admin authentication
const requireAdmin = (req, res, next) => {
    if (!req.session.admin) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    next();
};

// Get all pending bookings for admin dashboard
app.get('/admin/bookings', requireAdmin, async (req, res) => {
    const bookings = await Booking.find({ status: 'Pending' });
    res.json(bookings);
});

// Confirm a booking
app.post('/admin/confirm/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findByIdAndUpdate(id, { status: 'Confirmed' }, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        //  BookingHistory collection me bhi update karo
        await BookingHistory.findOneAndUpdate({ email: booking.email, package_name: booking.package_name }, { status: 'Confirmed' });

        res.json({ success: true, message: 'Booking confirmed', booking });
    } catch (error) {
        console.error('Error confirming booking:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Reject a booking
app.post('/admin/reject/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findByIdAndUpdate(id, { status: 'Rejected' }, { new: true });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        //  BookingHistory collection me bhi update karo
        await BookingHistory.findOneAndUpdate({ email: booking.email, package_name: booking.package_name }, { status: 'Rejected' });

        res.json({ success: true, message: 'Booking rejected', booking });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        res.status(500).json({ success: false, message: 'Server error', error });
    }
});

// Fix: Fetch confirmed and pending bookings for history
app.get('/bookings', async (req, res) => {
    const userId = req.query.userId; // Get userId from request
    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const bookings = await BookingHistory.find({ userId: userId }); // Filter by userId
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

// MongoDB Schema for Booking History
const BookingHistorySchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    name: String,
    email: String,
    phone: String,
    address: String,
    guests: Number,
    arrival: Date,
    leaving: Date,
    package_name: String,
    total_price: Number,
    status: { type: String, default: 'Pending' },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const BookingHistory = mongoose.model('BookingHistory', BookingHistorySchema);

// User Schema for Authentication
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
});

const User = mongoose.model('User', userSchema);

// Route to handle form data submission (Booking)
app.post('/book', async (req, res) => {
    const { userId, name, email, phone, address, guests, arrival, leaving, package_name, total_price } = req.body;

    const newBooking = new Booking({
        name,
        email,
        phone,
        address,
        guests,
        arrival,
        leaving,
        package_name,
        total_price
    });

    const newBookingHistory = new BookingHistory({
        userId,
        name,
        email,
        phone,
        address,
        guests,
        arrival,
        leaving,
        package_name,
        total_price
    });

    try {
        await newBooking.save();
        await newBookingHistory.save();
        res.status(200).send({ status: 'success', message: 'Booking successful' });
    } catch (err) {
        res.status(500).send({ status: 'error', message: 'Error booking', error: err });
    }
});

// User Registration Route
app.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = new User({ name, email, password });
        await newUser.save();
        console.log('User registered successfully:', newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// User Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, password });
        if (user) {
            console.log('Login successful:', user);
            res.status(200).json({ message: 'Login successful', userId: user._id, email: user.email });
        } else {
            console.log('Invalid credentials');
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

// Route to get booking history for a specific user
app.get('/bookings', async (req, res) => {
    const userId = req.query.userId;
    try {
        const bookings = await BookingHistory.find({ userId });
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bookings', error });
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server started on http://localhost:${port}`);
});

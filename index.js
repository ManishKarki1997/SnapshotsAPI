const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const PORT = process.env.PORT || 3000

dotenv.config();

const app = express();
app.use(bodyParser());
app.use(cors());

// Import Routes
const UserRoutes = require('./Routes/User')
const SnapRoutes = require('./Routes/Snap')
const CommentRoutes = require("./Routes/Comment")
const MainRoutes = require('./Routes/app')



app.use('/api', MainRoutes);
app.use('/api/user', UserRoutes);
app.use('/api/snap', SnapRoutes);
app.use('/api/comment', CommentRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Snapshots API');
})

app.listen(PORT, () => {
    console.log('Server started at', PORT)
})

mongoose.connect(process.env.DB_URL, (err) => {
    if (err) {
        console.log('Something went wrong', err)
    }
    console.log('Mongodb connected successfully')
})
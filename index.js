const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');


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


mongoose.connect(process.env.DB_URL, (err) => {
    if (err) {
        console.log('Something went wrong', err)
    }
    console.log('Mongodb connected successfully')
})


app.listen(process.env.PORT, () => {
    console.log('Server started at', process.env.PORT)
})
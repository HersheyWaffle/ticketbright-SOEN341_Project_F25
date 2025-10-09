//src/index.js
//Basic Server for Sprint 2 

const express=require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors()); //API and frontend can work together 
app.use(express.json());
app.use(morgan('dev')); //request logs in the terminal 

app.get('/health',(req,res)=>{ //http://localhost:3000/health
    res.json({
        ok: true,
        service: 'ticketbright-backend',
        time: new Date().toISOString(),
    });
});

//Start of the server 
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('Server is running');
});

module.exports = app //for future tests
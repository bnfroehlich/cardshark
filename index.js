const path = require('path');
const express = require('express');

const app = express();
const PORT = 3000;

// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, 'client/build')));

// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    console.log(__dirname);
    //res.sendFile(path.resolve(__dirname, 'client/build', 'index.html'));
    res.send('hello world');
});

app.get('/', (req, res) => {
    //res.sendFile(__dirname + '/index.html');
    res.send('hello world');
});

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on port "+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);
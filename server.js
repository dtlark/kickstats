const express = require ('express');
const path = require ('path');

const app = express();
app.use('/static', express.static('KICKSTATS_files'))

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/main.html'));
    
});

app.listen(3000);
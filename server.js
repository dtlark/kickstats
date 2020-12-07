const express = require ('express');
const path = require ('path');
const select = require('./query');

const app = express();
app.use('/static', express.static('KICKSTATS_files'))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
    
});


app.get('/query', (req, res) => {
    select.queryData(`select * from(select average_donation from pledge order by average_donation desc) where rownum < 8`).then(result=>{
        res.json(result);
    });
});

app.get('/totalLines', (req, res) => {
    select.queryData(`select count(*) from kickstarter_project`).then(result =>{
        res.send(result[0][0] + '');
    });
});





app.listen(3000);
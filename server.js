const express = require ('express');
const session = require ('express-session');
const path = require ('path');
const select = require('./query');

const bodyParser = require('body-parser');
const app = express();


//-----------------------------------------------------------

const users = [
    {id: 1, username: 'dtlark', password: 'databasepw'},
    {id: 2, username: 'barry', password: 'barryspw'}
]

app.use(bodyParser.urlencoded({
    extended: true
}))

app.use(session({
    name: 'sid',
    resave: false,
    saveUninitialized: false,
    secret: 'secretpassphrase',
    cookie: {
        maxAge: 100*60*60*2,
        sameSite: true
        //secure: true,
    }
}))

const redirectLogin = (req, res, next) => {
    if (!req.session.userId) {
        res.redirect('/')
    } else {
        next()
    }
}

const redirectMain = (req, res, next) => {
    if (req.session.userId) {
        res.redirect('/main')
    } else {
        next()
    }
}

app.get('/', redirectMain, (req, res) => {
    const {userId} = req.session
    res.sendFile(path.join(__dirname, '/login.html'));

});

app.get('/main', redirectLogin, (req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
})


app.post('/', redirectMain, (req, res) => {

    const {username, password} = req.body

    if (username && password) {
    const user = users.find(user => user.username === username && user.password === password)
    if (user) {
        req.session.userId = user.id
        return res.redirect('/main')
    }
    }
    res.redirect('/')
})

app.post('/logout', redirectLogin, (req, res) => {

    req.session.destroy(err => {
if (err) {
    return res.redirect('/main')
}
res.clearCookie('sid')
res.redirect('/')

    })
})


//----------------------------------------------------

app.use('/static', express.static('KICKSTATS_files'))
app.use(express.json());

/*
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
});
*/

app.post('/query', (req, res) => {
    console.log(req.body);
    let sql = "";
    switch(req.body.interests){
        case 'averageAmount':
            sql = `SELECT ROUND(AVG(avgDonate), 2) AS AVG_BACKER_MONTH
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years, avgDonate
                FROM(SELECT launch_date, pledge.average_donation AS avgDonate
                    FROM pledge, hosts,
                        (SELECT id AS CID
                            FROM category
                            WHERE main_category = '${req.body.categories}')
                    WHERE pledge.id = CID
                    AND num_of_backers > 0
                    AND hosts.id = CID
                    AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                    AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')))
            GROUP BY years, months
            ORDER BY years, months`
            break;
        case 'averageRaised':
            sql = `SELECT ROUND(AVG(pledge_amount), 2) AS monthAvg
                FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years, pledge_amount
                    FROM(SELECT launch_date, pledge_amount
                            FROM hosts, pledge, kickstarter_project,
                                 (SELECT id AS CID
                                    FROM category
                                    WHERE main_category = '${req.body.categories}')
                            WHERE hosts.id = CID
                            AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')
                            AND pledge.id = CID
                            AND kickstarter_project.id = CID
                            AND kickstarter_project.state = 'successful'))
                GROUP BY years, months
                ORDER BY years, months`
            break;
        case 'numFailed':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years
                    FROM(SELECT CID, launch_date
                            FROM hosts,
                                 kickstarter_project,
                                 (SELECT id AS CID
                                    FROM category
                                    WHERE main_category = '${req.body.categories}')
                            WHERE hosts.id = CID
                            AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')
                            AND kickstarter_project.id = CID
                            AND kickstarter_project.state != 'successful'
                    AND kickstarter_project.state != 'live'))
            GROUP BY years, months
            ORDER BY years, months`
            break;
        case 'numInvestors':
            sql = `SELECT SUM(num_of_backers) AS backers 
            FROM(SELECT EXTRACT(MONTH FROM launch_date) as months, EXTRACT(YEAR FROM launch_date) AS years, num_of_backers
                FROM(SELECT CID, launch_date, num_of_backers
                    FROM hosts,
                         pledge,
                         (SELECT id AS CID
                            FROM category
                            WHERE main_category = '${req.body.categories}')
                    WHERE hosts.id = CID
                    AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                    AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')
                    AND pledge.id = CID))
            GROUP BY years, months
            ORDER BY years, months`
            break;
        case 'num200':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years
                FROM(SELECT launch_date, pledge_amount, (goal * 2) AS SuperFund
                    FROM pledge, hosts, kickstarter_project,
                        (SELECT id AS CID
                            FROM category
                            WHERE main_category = '${req.body.categories}')
                    WHERE pledge.id = CID
                    AND hosts.id = CID
                    AND kickstarter_project.id = CID
                    AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                    AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm'))
                WHERE pledge_amount >= SuperFund)
            GROUP BY years, months
            OrDER BY years, months`
            break;
        case 'numStarted':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years
                    FROM(SELECT CID, launch_date
                            FROM hosts,
                                (SELECT id AS CID
                                    FROM category
                                    WHERE main_category = '${req.body.categories}')
                            WHERE hosts.id = CID)
                            WHERE launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm'))
            GROUP BY years, months
            ORDER BY years, months`
            break;
        case 'numSuccess':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years
                    FROM(SELECT CID, launch_date
                            FROM hosts,
                                 kickstarter_project,
                                 (SELECT id AS CID
                                    FROM category
                                    WHERE main_category = '${req.body.categories}')
                            WHERE hosts.id = CID
                            AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')
                            AND kickstarter_project.id = CID
                            AND kickstarter_project.state = 'successful'))
            GROUP BY years, months
            ORDER BY years, months`
            break;
        case 'successRate':
            sql = `SELECT ROUND(((successes / total) * 100), 2) AS SuccessRate
            FROM(SELECT COUNT(*) AS successes, months, years
                FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, EXTRACT(YEAR FROM launch_date) AS years
                        FROM(SELECT CID, launch_date
                                FROM hosts,
                                     kickstarter_project,
                                     (SELECT id AS CID
                                        FROM category
                                        WHERE main_category = '${req.body.categories}')
                                WHERE hosts.id = CID
                                AND launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                                AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm')
                                AND kickstarter_project.id = CID
                                AND kickstarter_project.state = 'successful'))
                GROUP BY years, months),
                (SELECT COUNT(*) AS total, tmonths, tyears
                    FROM(SELECT EXTRACT(MONTH FROM launch_date) AS tmonths, EXTRACT(YEAR FROM launch_date) AS tyears
                            FROM(SELECT CID, launch_date
                                    FROM hosts,
                                        (SELECT id AS CID
                                            FROM category
                                            WHERE main_category = '${req.body.categories}')
                                    WHERE hosts.id = CID)
                            WHERE launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm'))
                    GROUP BY tyears, tmonths)
            WHERE tmonths = months
            AND tyears = years
            ORDER BY years, months`
            break;

    }

    select.queryData(sql).then(result=>{
        res.json(result);
    });
});

app.get('/totalLines', (req, res) => {
    select.queryData(`select count(*) from kickstarter_project`).then(result =>{
        res.send(result[0][0] + '');
    });
});

app.listen(3000);
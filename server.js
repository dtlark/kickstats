const express = require ('express');
const path = require ('path');
const select = require('./query');

const app = express();
app.use('/static', express.static('KICKSTATS_files'))
app.use(express.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/main.html'));
    
});


app.post('/query', (req, res) => {
    console.log(req.body);
    let sql = "";
    switch(req.body.interests){
        case 'averageAmount':
            sql = `SELECT ROUND(AVG(avgDonate), 2) AS AVG_BACKER_MONTH
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, avgDonate
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
            GROUP BY months
            ORDER BY months`
            break;
        case 'averageRaised':
            sql = `SELECT ROUND(AVG(pledge_amount), 2) AS monthAvg
                FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months, pledge_amount
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
                GROUP BY months
                ORDER BY months`
            break;
        case 'numFailed':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months
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
            GROUP BY months
            ORDER BY months`
            break;
        case 'numInvestors':
            sql = `SELECT SUM(num_of_backers) AS backers 
            FROM(SELECT EXTRACT(MONTH FROM launch_date) as months, num_of_backers
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
            GROUP BY months
            ORDER BY months`
            break;
        case 'num200':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months
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
            GROUP BY months
            OrDER BY months`
            break;
        case 'numStarted':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months
                    FROM(SELECT CID, launch_date
                            FROM hosts,
                                (SELECT id AS CID
                                    FROM category
                                    WHERE main_category = '${req.body.categories}')
                            WHERE hosts.id = CID)
                            WHERE launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm'))
            GROUP BY months
            ORDER BY months`
            break;
        case 'numSuccess':
            sql = `SELECT COUNT(*)
            FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months
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
            GROUP BY months
            ORDER BY months`
            break;
        case 'successRate':
            sql = `SELECT ROUND(((successes / total) * 100), 2) AS SuccessRate
            FROM(SELECT COUNT(*) AS successes, months
                FROM(SELECT EXTRACT(MONTH FROM launch_date) AS months
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
                GROUP BY months),
                (SELECT COUNT(*) AS total, tmonths
                    FROM(SELECT EXTRACT(MONTH FROM launch_date) AS tmonths
                            FROM(SELECT CID, launch_date
                                    FROM hosts,
                                        (SELECT id AS CID
                                            FROM category
                                            WHERE main_category = '${req.body.categories}')
                                    WHERE hosts.id = CID)
                            WHERE launch_date >= to_date('${req.body.dateStart}', 'yyyy-mm')
                            AND launch_date <= to_date('${req.body.dateEnd}', 'yyyy-mm'))
                    GROUP BY tmonths)
            WHERE tmonths = months
            ORDER BY months`
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
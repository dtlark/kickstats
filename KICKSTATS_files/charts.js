
window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(70, 185, 116)',
	blue: 'rgb(70, 185, 116)',
	purple: 'rgb(153, 102, 255)',
	grey: 'rgb(201, 203, 207)'
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

let y = document.getElementById("comp1");


function query() {
    fetch("/totalLines").then(result => result.json()).then(data => alert(data));
}

function executeSQL() {

    var interests = document.getElementById("int");
    var categories = document.getElementById("cat");
    var dateStart = document.getElementById("start");
    var dateEnd = document.getElementById("end");

    console.log(dateStart.value);
    lineChartData.labels = [];
    fetch("/query", {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({interests:interests.value, categories:categories.value, dateStart:dateStart.value, dateEnd:dateEnd.value}) // body data type must match "Content-Type" header
    }).then(result => result.json()).then(data => {
        //lineChartData.datasets[0].data.push(data);
        lineChartData.datasets[0].data = [];
        for (let i = 0; i < data.length; i++) {
            lineChartData.datasets[0].data.push(data[i][0]);
        }
        createLables(Number.parseInt(dateStart.value.split('-')[0]), Number.parseInt(dateStart.value.split('-')[1]),
            Number.parseInt(dateEnd.value.split('-')[0]), Number.parseInt(dateEnd.value.split('-')[1]));
        drawGraph();
    });

}

function createLables(startDateYear, startDateMonth, endDateYear, endDateMonth) {
    const numMonths = (((endDateYear - startDateYear) * 12) - startDateMonth) + endDateMonth;
    lineChartData.labels = [];
    for (let i = 0; i < numMonths; i++) {
        lineChartData.labels.push(MONTHS[(i + startDateMonth - 1) % 12]);
    }
}

var lineChartData = {
    labels: [],

    datasets: [{
        label: 'Interest',
        borderColor: window.chartColors.green,
        backgroundColor: window.chartColors.green,
        fill: true,
        data: [],
        yAxisID: 'y-axis-1',
    }]
};

window.onload = () => {
    executeSQL();
};

function drawGraph() {
    const ctx = document.getElementById('canvas').getContext('2d');
    window.myLine = Chart.Line(ctx, {
        data: lineChartData,
        options: {
            responsive: true,
            hoverMode: 'index',
            stacked: false,
            title: {
                display: true,
                text: 'Kickstarter Data'
            },
            scales: {
                yAxes: [{
                    type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                    display: true,
                    position: 'left',
                    id: 'y-axis-1',
                }],
            }
        }
    });
}

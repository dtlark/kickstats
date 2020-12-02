var y = document.getElementById("comp2");

var lineChartData = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    
    datasets: [{
        label: 'My First dataset',
        borderColor: window.chartColors.yellow,
        backgroundColor: window.chartColors.yellow,
        fill: false,
        data: [],
        yAxisID: 'y-axis-1',
    }]
};

window.onload = () => {
    fetch("/query").then(result=>result.json()).then(data =>{
        //lineChartData.datasets[0].data.push(data);
        for(let i = 0; i < data.length; i++){
            lineChartData.datasets[0].data.push(data[i][0]);
        }
        
        drawGraph();
    });
};

function drawGraph(){
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


/*
document.getElementById('randomizeData').addEventListener('click', function() {
    lineChartData.datasets.forEach(function(dataset) {
        dataset.data = dataset.data.map(function() {
            return randomScalingFactor();
        });
    });

    window.myLine.update();
});
*/
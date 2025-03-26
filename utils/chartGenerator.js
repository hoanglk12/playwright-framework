const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const fs = require('fs').promises;
const path = require('path');

class ChartGenerator {
    constructor() {
        this.chartJSNodeCanvas = new ChartJSNodeCanvas({
            width: 800,
            height: 400,
            backgroundColour: 'white'
        });
    }

    async generateDimensionsChart(iconsDimensions) {
        const configuration = {
            type: 'bar',
            data: {
                labels: iconsDimensions.map((_, index) => `Icon ${index + 1}`),
                datasets: [
                    {
                        label: 'Width (px)',
                        data: iconsDimensions.map(d => d.width),
                        backgroundColor: 'rgba(54, 162, 235, 0.5)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1
                    },
                    {
                        label: 'Height (px)',
                        data: iconsDimensions.map(d => d.height),
                        backgroundColor: 'rgba(255, 99, 132, 0.5)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Social Icons Dimensions'
                    },
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Pixels'
                        }
                    }
                }
            }
        };

        const buffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
        return buffer;
    }

    async generateAspectRatioChart(iconsDimensions) {
        const aspectRatios = iconsDimensions.map(d => +(d.width / d.height).toFixed(2));
        
        const configuration = {
            type: 'line',
            data: {
                labels: iconsDimensions.map((_, index) => `Icon ${index + 1}`),
                datasets: [{
                    label: 'Aspect Ratio',
                    data: aspectRatios,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    tension: 0.1,
                    fill: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Social Icons Aspect Ratios'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Width/Height Ratio'
                        }
                    }
                }
            }
        };

        const buffer = await this.chartJSNodeCanvas.renderToBuffer(configuration);
        return buffer;
    }
}

module.exports = new ChartGenerator();
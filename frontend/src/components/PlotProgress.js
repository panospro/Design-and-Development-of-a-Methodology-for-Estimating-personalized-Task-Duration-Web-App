import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { mean, std } from 'mathjs';
import { ChartWrapper } from './Wrapper.js';
import './PlotProgress.css'; 

const ChartComponent = ({ title, data, markerColor, info }) => (
    <div style={{ display: 'flex' }}>
        <ChartWrapper title={title} info={info}>
            <Plot 
                data={data} 
                config={{ displayModeBar: false }}
                layout={{
                    autosize: true,
                    margin: { l: 50, r: 30, b: 80, t: 30, pad: 4 },
                    xaxis: { tickangle: -45 },
                    marker: { color: markerColor },
                }}
                style={{ width: "100%", height: "100%" }} 
            />
        </ChartWrapper>
    </div>
);

const generatePlotData = (items, key) => {
    items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const dates = items.map(item => new Date(item.createdAt));
    const progress = items.map(item => item.burnedPoints);
    const expectedPoints = items.map(item => item.expectedPoints);
    const avgProg = mean(progress);
    const stdProg = std(progress);
    const maxProg = Math.max(...progress);
    const minProg = Math.min(...progress);
    const maxIdx = progress.indexOf(maxProg);
    const minIdx = progress.indexOf(minProg);

    const linearRegression = (x, y) => {
        const n = x.length;
        const xMean = mean(x);
        const yMean = mean(y);
        const SSxy = x.reduce((sum, xi, i) => sum + xi * y[i], 0) - n * xMean * yMean;
        const SSxx = x.reduce((sum, xi) => sum + xi ** 2, 0) - n * xMean ** 2;
        const slope = SSxy / SSxx;
        const intercept = yMean - slope * xMean;
        return { slope, intercept, r2: (SSxy ** 2) / (SSxx * x.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0)) };
    };

    const { slope, intercept, r2 } = linearRegression(dates.map(date => date.getTime()), progress);

    return {
        key,
        plotData: [
            {
                x: dates,
                y: progress,
                type: 'scatter',
                mode: 'lines+markers',
                name: 'Burned Points',
            },
            {
                x: dates,
                y: expectedPoints,
                type: 'scatter',
                mode: 'lines+markers',
                line: { dash: 'dash' },
                name: 'Expected Points',
            },
            {
                x: dates,
                y: Array(dates.length).fill(avgProg),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'red', dash: 'dash' },
                name: `Average (${avgProg.toFixed(2)})`,
            },
            {
                x: dates,
                y: dates.map(date => slope * date.getTime() + intercept),
                type: 'scatter',
                mode: 'lines',
                line: { color: 'green' },
                name: `Trendline (R²=${r2.toFixed(2)})`,
            },
        ],
        layout: {
            title: `${key.split('_').join(', ')}`,
            xaxis: { title: 'Date' },
            yaxis: { title: 'Burned Points' },
            shapes: [
                {
                    type: 'rect',
                    xref: 'x',
                    yref: 'y',
                    x0: dates[0],
                    x1: dates[dates.length - 1],
                    y0: avgProg - stdProg,
                    y1: avgProg + stdProg,
                    fillcolor: 'rgba(255, 0, 0, 0.2)',
                    line: { width: 0 },
                },
            ],
            annotations: [
                {
                    x: dates[maxIdx],
                    y: maxProg,
                    text: `Max: ${maxProg}`,
                    showarrow: true,
                    arrowhead: 2,
                },
                {
                    x: dates[minIdx],
                    y: minProg,
                    text: `Min: ${minProg}`,
                    showarrow: true,
                    arrowhead: 2,
                },
            ],
        },
    };
};

export const PlotProgress = ({ data, subplotsPerFigure = 1 }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    const groupedData = {};

    data.forEach(item => {
        item.categories.forEach(category => {
            item.focus_areas.forEach(focusArea => {
                const key = `${category}_${focusArea}`;
                if (!groupedData[key]) {
                    groupedData[key] = [];
                }
                groupedData[key].push(item);
            });
        });
    });

    const plotData = Object.entries(groupedData)
        .filter(([, items]) => items.length > 2)
        .sort(([keyA, itemsA], [keyB, itemsB]) => itemsB.length - itemsA.length);  // Sort by length descending

    const totalPages = Math.ceil(plotData.length / itemsPerPage);

    const handleFirstPage = () => {
        setCurrentPage(1);
    };
    
    const handleLastPage = () => {
        setCurrentPage(totalPages);
    };
    
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };
    
    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };    

    const displayData = plotData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div>
            <div className="graphs-container">
                {displayData.map(([key, items]) => {
                    const { plotData, layout } = generatePlotData(items, key);
                    return <ChartComponent key={key} title={layout.title} data={plotData} markerColor="blue" info={layout.title} />;
                })}
            </div>
            <div className="pagination-controls">
                <button onClick={handleFirstPage} disabled={currentPage === 1}>First</button>
                <button onClick={handlePrevPage} disabled={currentPage === 1}>Previous</button>
                <span>Page {currentPage} of {totalPages}</span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
                <button onClick={handleLastPage} disabled={currentPage === totalPages}>Last</button>
            </div>
        </div>
    );
};

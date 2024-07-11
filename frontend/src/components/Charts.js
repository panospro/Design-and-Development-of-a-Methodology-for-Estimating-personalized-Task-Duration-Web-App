import Plot from 'react-plotly.js';
import { ChartWrapper } from './Wrapper.js';

export const ChartComponent = ({ title, data, markerColor, info }) => {
    return (
        <div style={{ display: 'flex' }}>
            <ChartWrapper title={title} info={info}>
                <Plot
                    data={[
                        {
                            x: data.labels,
                            y: data.counts,
                            type: 'bar',
                            marker: { color: markerColor },
                        },
                    ]}
                    config={{ displayModeBar: false }}
                    layout={{
                        autosize: true,
                        margin: { l: 50, r: 30, b: 80, t: 30, pad: 4 },
                        xaxis: { tickangle: -45 },
                    }}
                    style={{ width: "100%", height: "100%" }}
                />
            </ChartWrapper>
        </div>
    );
};

export const HeatmapComponent = ({ title, data, info }) => {
    return (
        <div style={{ position: 'relative', display: 'flex' }}>
            <ChartWrapper title={title} info={info}>
                <Plot
                    data={[
                        {
                            x: data.labels,
                            y: data.categories,
                            z: data.values,
                            type: 'heatmap',
                            colorscale: '#0000FF',
                        },
                    ]}
                    config={{ displayModeBar: false }}
                    layout={{
                        autosize: true,
                        margin: { l: 80, r: 30, b: 100, t: 30, pad: 4 },
                        xaxis: { tickangle: -45 },
                        yaxis: { tickangle: -45 },
                    }}
                    style={{ width: "100%", height: "100%" }}
                />
            </ChartWrapper>
        </div>
    );
};

export const ExpectedBurnedGraph = ({ title, data, info }) => {
    const { labels, donePoints, expectedPoints } = data;

    const colors = {
        expected: 'rgba(55, 128, 191, 0.7)',
        done: 'rgba(50, 171, 96, 0.7)',
    };
    
    const layoutConfig = {
        autosize: true,
        margin: { l: 80, r: 30, b: 100, t: 30, pad: 4 },
        xaxis: { tickangle: -45 },
        legend: { orientation: 'h', x: 0.5, y: 1 }, // Move legend to a horizontal position below the chart
    };

    return (
        <div style={{ position: 'relative', display: 'flex' }}>
            <ChartWrapper title={title} info={info}>
                <Plot
                    data={[
                        {
                            x: labels,
                            y: expectedPoints,
                            name: 'Average Expected Points',
                            type: 'bar',
                            marker: { color: colors.expected },
                        },
                        {
                            x: labels,
                            y: donePoints,
                            name: 'Average Done Points',
                            type: 'bar',
                            marker: { color: colors.done },
                        },
                    ]}
                    config={{ displayModeBar: false }}
                    layout={layoutConfig}
                    style={{ width: "100%", height: "100%" }}
                />
            </ChartWrapper>
        </div>
    );
};

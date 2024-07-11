import React, { useEffect, useState } from 'react';
import { ChartComponent, ExpectedBurnedGraph, HeatmapComponent } from './Charts.js'

const categorizeBurnedPoints = x => x <= 0.5 ? 1 : x <= 2 ? 2 : 3

const categories = [
    "Bug Fixes",
    "Testing & Code Review",
    "Optimization",
    "Feature",
    "Code Refactoring",
    "Dependencies",
    "Documentation & General"
];

const focusAreas = [
    "Frontend",
    "Backend",
    "DevOps & Cloud",
    "Database",
    "Security",
    "AI",
    "Embedded"
];

const prepareDoneExpectedPointsData = (data) => {
    const calculateAverage = (pointsArray) => {
        const sum = pointsArray.reduce((a, b) => a + b, 0);
        return pointsArray.length ? sum / pointsArray.length : 0;
    };

    const donePoints = [];
    const expectedPoints = [];
    const labels = [];

    categories.forEach(category => {
        focusAreas.forEach(focusArea => {
            const key = `${category}-${focusArea}`;
            const donePointsArray = data[key]?.donePoints || [];
            const expectedPointsArray = data[key]?.expectedPoints || [];
            if (donePointsArray.length || expectedPointsArray.length) {
                labels.push(key);
                donePoints.push(calculateAverage(donePointsArray));
                expectedPoints.push(calculateAverage(expectedPointsArray));
            }
        });
    });

    return {
        labels,
        donePoints,
        expectedPoints,
    };
};

const prepareHeatmapData = (data, calcType = 'average') => {
    const calculateValues = (pointsArray) => {
        if (calcType === 'average') {
            const sumPoints = pointsArray.reduce((a, b) => a + b, 0);
            return pointsArray.length ? (sumPoints / pointsArray.length).toFixed(2) : 0;
        } else if (calcType === 'mostCommonClass') {
            const counts = pointsArray.reduce((acc, point) => {
                if (point > 0) {
                    acc[point] = (acc[point] || 0) + 1;
                }
                return acc;
            }, {});
            return Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b, 0);
        }
        return 0;
    };

    const values = categories.map(category =>
        focusAreas.map(focusArea => {
            const key = `${category}-${focusArea}`;
            const pointsArray = data[key]?.categoryPoints || [];
            return calculateValues(pointsArray);
        })
    );

    return {
        categories,
        labels: focusAreas,
        values,
    };
};

const sortData = (data) => {
    const labels = Object.keys(data);
    const counts = Object.values(data);

    const combined = labels.map((label, index) => ({
        label,
        count: counts[index],
    }));

    combined.sort((a, b) => b.count - a.count);

    return {
        labels: combined.map(item => item.label),
        counts: combined.map(item => item.count),
    };
};

export const TaskCategorization = ({ data }) => {
    const [categoryChartData, setCategoryChartData] = useState({});
    const [focusAreaChartData, setFocusAreaChartData] = useState({});
    const [heatmapData, setHeatmapData] = useState({});
    const [graphData, setGraphData] = useState({});

    useEffect(() => {
        const categories = [];
        const focusAreas = [];
        const categoryFocusPairs = [];

        for (const item of data) {
            // Ensure item has categories and focus_areas
            const itemCategories = item?.categories ? String(item.categories).trim().split(',') : [];
            const itemFocusAreas = item?.focus_areas ? String(item.focus_areas).trim().split(',') : [];
            const categoryPoints = categorizeBurnedPoints(item?.burnedPoints) ?? 0;
            const donePoints = item?.burnedPoints ?? 0;
            const expectedPoints = item?.expectedPoints ?? 0;

            for (const category of itemCategories) {
                if (category) {
                    categories.push(category.trim());
                }
                for (const focusArea of itemFocusAreas) {
                    if (focusArea) {
                        focusAreas.push(focusArea.trim());
                        if (category) {
                            categoryFocusPairs.push({
                                category: category.trim(),
                                focusArea: focusArea.trim(),
                                categoryPoints,
                                donePoints,
                                expectedPoints
                            });
                        }
                    }
                }
            }
        }

        const categoryCounts = categories.reduce((acc, category) => {
            acc[category] = (acc[category] || 0) + 1;
            return acc;
        }, {});
    
        const focusAreaCounts = focusAreas.reduce((acc, focusArea) => {
            acc[focusArea] = (acc[focusArea] || 0) + 1;
            return acc;
        }, {});
    
        const categoryFocusPoints = categoryFocusPairs.reduce((acc, pair) => {
            const key = `${pair.category}-${pair.focusArea}`;
            if (!acc[key]) {
                acc[key] = { categoryPoints: [], donePoints: [], expectedPoints: [] };
            }
            acc[key].categoryPoints.push(pair.categoryPoints);
            acc[key].donePoints.push(pair.donePoints);
            acc[key].expectedPoints.push(pair.expectedPoints);
            return acc;
        }, {});    

        const sortedCategoryData = sortData(categoryCounts);
        const sortedFocusAreaData = sortData(focusAreaCounts);
        const heatmapData = prepareHeatmapData(categoryFocusPoints, 'average');
        const graphData = prepareDoneExpectedPointsData(categoryFocusPoints);
    
        setCategoryChartData(sortedCategoryData);
        setFocusAreaChartData(sortedFocusAreaData);
        setHeatmapData(heatmapData);
        setGraphData(graphData)
    }, [data]);

    return (
        <div className="graphs-container">
            <div><ChartComponent title="Task Categories" data={categoryChartData} markerColor="skyblue" info="Distribution of task categories."/></div>
            <div><ChartComponent title="Task Focus Areas" data={focusAreaChartData} markerColor="lightgreen" info="Distribution of task focus areas."/></div>
            <div><ExpectedBurnedGraph title="Category Points" data={graphData} info="Comparison of average burned and expected points per category."/></div>
            <div><HeatmapComponent title="Category Heatmap" data={heatmapData} info="Relationship between categories, focus areas, and task completion speed (1: fast, 2: medium, 3: slow, 0: no tasks)."/></div>
        </div>
    );
};

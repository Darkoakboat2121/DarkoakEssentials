import { world, system } from "@minecraft/server"

// Math.E
// Math.LN10
// Math.LN2
// Math.LOG10E
// Math.LOG2E
// Math.PI
// Math.SQRT1_2
// Math.SQRT2
// Math.abs()
// Math.acos()
// Math.acosh()

// Math.asin()
// Math.asinh()
// Math.atan()
// Math.atan2()
// Math.atanh()
// Math.cbrt()
// Math.ceil()
// Math.clz32()
// Math.cos()
// Math.cosh()
// Math.exp()
// Math.expm1()
// Math.floor()

// Math.fround()
// Math.hypot()
// Math.imul()
// Math.log()
// Math.log10()
// Math.max()
// Math.min()
// Math.pow()
// Math.random()
// Math.round()
// Math.sign()
// Math.sin()
// Math.sinh()

// Math.sqrt()
// Math.tan()
// Math.tanh()
// Math.trunc()

function kMeans(data, k, maxIterations = 100) {
    // Validate inputs
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("Data must be a non-empty array.");
    }
    if (!Number.isInteger(k) || k <= 0 || k > data.length) {
        throw new Error("k must be a positive integer less than or equal to data length.");
    }
    if (!data.every(point => Array.isArray(point) && point.every(num => typeof num === "number"))) {
        throw new Error("Each data point must be an array of numbers.");
    }

    // Helper: Calculate Euclidean distance between two points
    const distance = (a, b) => Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));

    // Helper: Calculate mean of points
    const mean = points => points[0].map((_, i) =>
        points.reduce((sum, p) => sum + p[i], 0) / points.length
    );

    // Step 1: Initialize centroids randomly
    let centroids = data
        .slice()
        .sort(() => Math.random() - 0.5)
        .slice(0, k);

    let assignments = new Array(data.length);
    let iterations = 0;

    while (iterations < maxIterations) {
        let moved = false;

        // Step 2: Assign points to nearest centroid
        for (let i = 0; i < data.length; i++) {
            let minDist = Infinity;
            let clusterIndex = 0;
            for (let j = 0; j < k; j++) {
                let dist = distance(data[i], centroids[j]);
                if (dist < minDist) {
                    minDist = dist;
                    clusterIndex = j;
                }
            }
            if (assignments[i] !== clusterIndex) {
                moved = true;
                assignments[i] = clusterIndex;
            }
        }

        // Step 3: Recalculate centroids
        let newCentroids = Array.from({ length: k }, () => []);
        for (let i = 0; i < data.length; i++) {
            newCentroids[assignments[i]].push(data[i]);
        }

        for (let j = 0; j < k; j++) {
            if (newCentroids[j].length > 0) {
                centroids[j] = mean(newCentroids[j]);
            }
        }

        // Stop if no points moved
        if (!moved) break;
        iterations++;
    }

    return { centroids, assignments };
}

// Example usage:
try {
    const dataset = [
        [1.0, 2.0], [1.5, 1.8], [5.0, 8.0],
        [8.0, 8.0], [1.0, 0.6], [9.0, 11.0]
    ];
    const k = 2;
    const result = kMeans(dataset, k);

    console.log("Centroids:", result.centroids);
    console.log("Assignments:", result.assignments);
} catch (err) {
    console.error("Error:", err.message);
}
import React from "react"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { Line } from "react-chartjs-2"
import { faker } from "@faker-js/faker"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export const options = {
    responsive: true,
    plugins: {
        title: {
            display: false,
            text: "Chart.js Line Chart",
        },
        legend: {
            display: false, // Set display to false to hide the legend
        },
    },
}

const labels = ["January", "February", "March", "April", "May", "June", "July"]

export const data = {
    labels,
    datasets: [
        {
            label: "Dataset 1",
            data: labels.map(() => faker.number.int({ min: 0, max: 1000 })),
            borderColor: "rgb(255, 99, 132)",
            backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
    ],
}

export function Chart() {
    return (
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            <Line options={{ ...options, maintainAspectRatio: false }} data={data} />
        </div>
    )
}

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
import { ProjectTVL, TVLData } from "../hooks/useTVLData"

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

type ChartProps = {
    projectData: [string, ProjectTVL]
}

export function Chart({ projectData }: ChartProps) {
    const labels = projectData[1].dataPoints.map((d) => {
        const date = new Date(d.timestamp * 1000)
        return `${date.getMonth() + 1}/${date.getDate()}/${date
            .getFullYear()
            .toString()
            .slice(-2)} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}` // format date as MM/DD/YY HH:MM:SS
    })
    const data = {
        labels,
        datasets: [
            {
                label: projectData[0],
                data: projectData[1].dataPoints.map((d) => d.tvl),
                borderColor: "rgb(255, 99, 132)",
                backgroundColor: "rgba(255, 99, 132, 0.5)",
            },
        ],
    }

    return (
        <div style={{ width: "100%", height: "100%", overflow: "auto" }}>
            <Line options={{ ...options, maintainAspectRatio: false }} data={data} />
        </div>
    )
}

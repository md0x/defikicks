import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { useState } from "react"
import { Chart } from "../components/Chart"
import useTVLData from "../hooks/useTVLData"

const dummyData = [
    {
        project: "Project 1",
        lastTVL: "20000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A",
    },
    {
        project: "Project 2",
        lastTVL: "30000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68B",
    },
    {
        project: "Project 1",
        lastTVL: "20000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A",
    },
    {
        project: "Project 2",
        lastTVL: "30000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68B",
    },
    {
        project: "Project 1",
        lastTVL: "20000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A",
    },
    {
        project: "Project 2",
        lastTVL: "30000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68B",
    },
    {
        project: "Project 1",
        lastTVL: "20000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68A",
    },
    {
        project: "Project 2",
        lastTVL: "30000",
        adapterLink: "https://ipfs.io/ipfs/QmPChd2hVbrJ6bfo3WBcTW4iZnpHm8TEzWkLHmLpXhF68B",
    },
]

function Home() {
    const { account, library } = useWeb3React()

    const { data } = useTVLData()

    // console.log("tvlData", JSON.stringify(data, null, 2))

    const isConnected = typeof account === "string" && !!library

    const [selectedRow, setSelectedRow] = useState(0)

    const handleRowClick = (index) => {
        setSelectedRow(index)
        // Perform actions or navigation based on the selected row
        console.log("Clicked row:", index)
    }

    if (!data) return <>Loading</>
    return (
        <>
            <div className="content-container">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Project</th>
                                <th>Last TVL</th>
                                <th>Adapter</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(data).map(([key, value], index) => (
                                <tr
                                    key={index}
                                    className={selectedRow === index ? "selected" : ""}
                                    onClick={() => handleRowClick(index)}
                                >
                                    <td>{key}</td>
                                    <td>{value.dataPoints[value.dataPoints.length - 1].tvl}</td>
                                    <td>
                                        <a
                                            href={`https://w3s.link/ipfs/${value.ipfsHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            📝
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {Object.entries(data)[selectedRow] && (
                    <div className="chart-container">
                        <Chart projectData={Object.entries(data)[selectedRow]} />
                        <div className="overlay-image">
                            <Image
                                src="/android-chrome-512x512.png"
                                alt="Superposed Image"
                                width={100}
                                height={100}
                            />
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .main-container {
                    height: 100%;
                }

                .home-container {
                    background-image: url("/large.jpg");
                    background-size: cover;
                    background-position: center;
                    min-height: 100vh; /* Ensure the background covers the entire viewport */
                    display: flex;
                    flex-direction: column;
                    justify-content: top;
                    align-items: center;
                }

                nav {
                    display: flex;
                    justify-content: space-between;
                }

                main {
                    text-align: center;
                }

                .content-container {
                    display: flex;
                    width: 100%;
                    height: 100%; // Adjust according to your needs
                }

                .table-container {
                    flex: 0 0 250px; // Do not grow, do not shrink, start at 150px
                    height: 100%;
                    overflow-y: auto; // Enable scrolling if content overflows
                }

                .chart-container {
                    flex: 1; // Grow to occupy remaining space
                    height: 100%;
                    position: relative; /* New style */
                    overflow-y: auto; // Enable scrolling if content overflows
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                    table-layout: fixed;
                }

                th,
                td {
                    text-align: center;
                    padding: 8px;
                }

                tr {
                    cursor: pointer;
                }

                tr:hover {
                    background-color: rgba(239, 207, 227, 0.3);
                }

                .selected {
                    background-color: pink;
                }
                .overlay-image {
                    position: absolute;
                    top: 40%; // Adjust as necessary
                    left: 46%; // Adjust as necessary
                    filter: grayscale(100%) opacity(30%);
                    position: absolute;
                }
            `}</style>
        </>
    )
}

export default Home

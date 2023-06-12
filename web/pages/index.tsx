import { useWeb3React } from "@web3-react/core"
import Image from "next/image"
import { MessageCircle, Bell, Plus } from "@web3uikit/icons"
import ETHBalance from "../components/ETHBalance"
import TokenBalance from "../components/TokenBalance"
import useEagerConnect from "../hooks/useEagerConnect"
import { Button, CryptoCards, Grid, Tab, TabList, Avatar, Tag, Table } from "@web3uikit/core"
import { MoreVert } from "@web3uikit/icons"
import React, { useState } from "react"
import useTVLData from "../hooks/useTVLData"
import { Chart } from "../components/Chart"
// import styled from "styled-components"
// import { styled } from "@web3uikit/styles"
// import backgroundImage from "../assets/large.jpg"

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

    const [selectedRow, setSelectedRow] = useState(null)

    const handleRowClick = (index) => {
        setSelectedRow(index)
        // Perform actions or navigation based on the selected row
        console.log("Clicked row:", index)
    }

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
                            {dummyData.map((row, index) => (
                                <tr
                                    key={index}
                                    className={selectedRow === index ? "selected" : ""}
                                    onClick={() => handleRowClick(index)}
                                >
                                    <td>{row.project}</td>
                                    <td>{row.lastTVL}</td>
                                    <td>
                                        <a
                                            href={row.adapterLink}
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
                <div className="chart-container">
                    <Chart />
                </div>
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
                    background-color: rgba(255, 255, 255, 0.5);
                }

                .selected {
                    background-color: rgba(255, 255, 255, 0.1);
                }
            `}</style>
        </>
    )
}

export default Home

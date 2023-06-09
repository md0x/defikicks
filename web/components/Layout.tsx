import Header from "./Header"
import React from "react";

export default function Layout({ children }) {
    return (
        <div className="home-container">
            <Header />
            <div className="card">
                <div className="content">
                    {children}
                </div>
            </div>
            {/* <Footer /> */}

            <style jsx>{`
                .home-container {
                    background-image: url("/large.jpg");
                    background-size: cover;
                    background-position: center;
                    min-height: 100vh; /* Ensure the background covers the entire viewport */
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                }

                .card {
                    background-color: rgba(255, 255, 255, 0.5); /* White with 80% opacity */
                    border-radius: 25px;
                    width: 70%;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    // margin-top: 1em;
                    margin-bottom: 2em; /* added margin at the bottom */
                    max-height: calc(100vh - 4em); /* subtracted margin from top and bottom from the maximum height */
                    overflow-y: auto;
                }

                .content {
                    padding: 1em;
                    overflow-y: auto;
                    width: 100%;
                }
            `}</style>
        </div>
    )
}

import Header from "./Header"
import React from "react"

export default function Layout({ children }) {
    return (
        <div className="home-container">
            <Header />
            <div className="card">
                <div className="content">{children}</div>
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
                    background-color: rgba(255, 255, 255, 0.5);
                    border-radius: 25px;
                    width: 70%;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 2em;
                    height: 55vh; // Set this to the desired fixed height
                    overflow: hidden; // Ensures that the card itself does not become scrollable
                }

                .content {
                    padding: 1em;
                    width: 100%;
                    height: 100%;
                    max-height: calc(
                        55vh - 2em
                    ); // Adjust this value according to the padding or any other elements in the card
                    overflow-y: hidden; // This will create a scroll bar in the content if the content overflows
                }
            `}</style>
        </div>
    )
}

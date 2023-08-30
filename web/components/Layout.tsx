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
                    min-height: 100vh; /* Ensure the background covers the entire viewport */
                    display: flex;
                    flex-direction: column;
                    justify-content: flex-start;
                    align-items: center;
                    padding: 3em;
                    background: rgb(209, 88, 163);
                    background: -moz-radial-gradient(
                        circle,
                        rgba(209, 88, 163, 0.11668417366946782) 4%,
                        rgba(252, 70, 121, 0.4500175070028011) 100%
                    );
                    background: -webkit-radial-gradient(
                        circle,
                        rgba(209, 88, 163, 0.11668417366946782) 4%,
                        rgba(252, 70, 121, 0.4500175070028011) 100%
                    );
                    background: radial-gradient(
                        circle,
                        rgba(209, 88, 163, 0.11668417366946782) 4%,
                        rgba(252, 70, 121, 0.4500175070028011) 100%
                    );
                    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#d158a3",endColorstr="#fc4679",GradientType=1);
                }

                @media only screen and (max-width: 600px) {
                    .home-container {
                        padding: 1em;
                    }
                }

                .card {
                    background-color: rgba(255, 255, 255, 0.5);
                    border-radius: 25px;
                    width: 70%;
                    display: flex;
                    flex-direction: column;
                    margin-bottom: 2em;
                    height: 52vh; // Set this to the desired fixed height
                    overflow: hidden; // Ensures that the card itself does not become scrollable
                }

                .content {
                    padding: 1em;
                    width: 100%;
                    height: 100%;
                    max-height: calc(
                        55vh - 2em
                    ); // Adjust this value according to the padding or any other elements in the card
                    overflow-y: auto; // This will create a scroll bar in the content if the content overflows
                }
            `}</style>
        </div>
    )
}

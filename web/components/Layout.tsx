// import Navbar from './navbar';
// import Footer from './footer';
import Header from "./Header"

export default function Layout({ children }) {
    
    return (
        <div className="home-container">
            <Header />
            <main>{children}</main>
            {/* <Footer /> */}
        </div>
    )
}

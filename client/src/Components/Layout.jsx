import React from 'react'
import {Outlet, useLocation} from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import AIChatbot from "./AIChatbot";

const Layout = () => {
    const location = useLocation();

    return (
        <>
            <Header/>
            <Outlet/>

            {location.pathname !== '/chat' && <Footer/>}

            {/* AI Chatbot */}
            <AIChatbot/>
        </>
    )
}

export default Layout
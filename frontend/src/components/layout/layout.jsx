import React from "react";
import Header from './header/Header';  
import Sidebar from './sidebar/Sidebar';
import Footer from './footer/Footer';
import './layout.css';

const Layout = ({children}) =>{
    return(
        <div className = "layout">
            <Header />
            <div className="main-container">
                <Sidebar />
                <main className="main-content">
                    {children} {/*Conteudo dimanico*/}
                </main>
            </div>
            <Footer />
        </div>
    );
};

export default Layout;
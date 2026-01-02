import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import IntakeHub from './pages/IntakeHub';
import FraudMonitor from './pages/FraudMonitor';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Cases": Cases,
    "IntakeHub": IntakeHub,
    "FraudMonitor": FraudMonitor,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
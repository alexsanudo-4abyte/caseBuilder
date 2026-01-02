import Dashboard from './pages/Dashboard';
import Cases from './pages/Cases';
import IntakeHub from './pages/IntakeHub';
import FraudMonitor from './pages/FraudMonitor';
import Predictions from './pages/Predictions';
import MedicalIntel from './pages/MedicalIntel';
import Financials from './pages/Financials';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Communications from './pages/Communications';
import Settings from './pages/Settings';
import CaseDetail from './pages/CaseDetail';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Cases": Cases,
    "IntakeHub": IntakeHub,
    "FraudMonitor": FraudMonitor,
    "Predictions": Predictions,
    "MedicalIntel": MedicalIntel,
    "Financials": Financials,
    "Campaigns": Campaigns,
    "Analytics": Analytics,
    "Communications": Communications,
    "Settings": Settings,
    "CaseDetail": CaseDetail,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
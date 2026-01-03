import Analytics from './pages/Analytics';
import Campaigns from './pages/Campaigns';
import CaseDetail from './pages/CaseDetail';
import Cases from './pages/Cases';
import Communications from './pages/Communications';
import Dashboard from './pages/Dashboard';
import Financials from './pages/Financials';
import FraudMonitor from './pages/FraudMonitor';
import IntakeHub from './pages/IntakeHub';
import MedicalIntel from './pages/MedicalIntel';
import Predictions from './pages/Predictions';
import Settings from './pages/Settings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Analytics": Analytics,
    "Campaigns": Campaigns,
    "CaseDetail": CaseDetail,
    "Cases": Cases,
    "Communications": Communications,
    "Dashboard": Dashboard,
    "Financials": Financials,
    "FraudMonitor": FraudMonitor,
    "IntakeHub": IntakeHub,
    "MedicalIntel": MedicalIntel,
    "Predictions": Predictions,
    "Settings": Settings,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};
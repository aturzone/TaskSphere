
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import Layout from './components/Layout.tsx';
import Index from './pages/Index.tsx';
import Tasks from './pages/Tasks.tsx';
import Projects from './pages/Projects.tsx';
import Notes from './pages/Notes.tsx';
import CalendarPage from './pages/CalendarPage.tsx';
import AppSettings from './pages/AppSettings.tsx';
import NotFound from './pages/NotFound.tsx';
import GraphViewPage from './pages/GraphViewPage.tsx';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />}>
        <Route index element={<Index />} />
        <Route path="tasks" element={<Layout currentPageName="Tasks"><Tasks /></Layout>} />
        <Route path="projects" element={<Layout currentPageName="Projects"><Projects /></Layout>} />
        <Route path="notes" element={<Layout currentPageName="Notes"><Notes /></Layout>} />
        <Route path="calendar" element={<Layout currentPageName="CalendarPage"><CalendarPage /></Layout>} />
        <Route path="settings" element={<Layout currentPageName="AppSettings"><AppSettings /></Layout>} />
        <Route path="graph" element={<Layout currentPageName="GraphViewPage"><GraphViewPage /></Layout>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

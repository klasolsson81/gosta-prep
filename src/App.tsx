import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useProfile } from './hooks/useProfile';
import AppShell from './components/Layout/AppShell';
import Onboarding from './components/Onboarding/Onboarding';
import CompanyList from './components/Companies/CompanyList';
import CompanyDetail from './components/Companies/CompanyDetail';
import FavoritesList from './components/Favorites/FavoritesList';
import QRCarousel from './components/QRCodes/QRCarousel';
import Timeline from './components/Schedule/Timeline';
import ProfileSettings from './components/Profile/ProfileSettings';

export default function App() {
  const { profile } = useProfile();

  if (!profile.onboardingComplete) {
    return <Onboarding />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<CompanyList />} />
          <Route path="foretag/:id" element={<CompanyDetail />} />
          <Route path="favoriter" element={<FavoritesList />} />
          <Route path="qr" element={<QRCarousel />} />
          <Route path="schema" element={<Timeline />} />
          <Route path="profil" element={<ProfileSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CalendarView } from "./screens/Calendar/CalendarView";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { SharedSanctuary } from "./screens/SharedSanctuary/SharedSanctuary";
import { CapsuleView } from "./screens/CapsuleView/CapsuleView";
import { CreateCapsule } from "./screens/CreateCapsule/CreateCapsule";
import { Frame } from "./screens/Frame/Frame";
import { LandingPage } from "./screens/LandingPage/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Timeline } from "./screens/Timeline/Timeline";
import { Profile } from "./screens/Profile/Profile";
import { AddMemberPage } from "./screens/TeamDetails/AddMemberPage";
import { MemberDetails } from "./screens/TeamDetails/MemberDetails";
import { TeamDetails } from "./screens/TeamDetails/TeamDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Frame />} />
        <Route path="/team" element={<TeamDetails />} />
        <Route path="/team/add" element={<AddMemberPage />} />
        <Route path="/team/members" element={<Navigate to="/team" replace />} />
        <Route path="/members/:id" element={<MemberDetails />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/timeline"
          element={
            <ProtectedRoute>
              <Timeline />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/calendarview"
          element={
            <ProtectedRoute>
              <CalendarView />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shared"
          element={
            <ProtectedRoute>
              <SharedSanctuary />
            </ProtectedRoute>
          }
        />

        <Route
          path="/createcapsule"
          element={
            <ProtectedRoute>
              <CreateCapsule />
            </ProtectedRoute>
          }
        />

        <Route
          path="/capsule/:id"
          element={
            <ProtectedRoute>
              <CapsuleView />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

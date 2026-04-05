import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { CalendarView } from "./screens/Calendar/CalendarView";
import { Dashboard } from "./screens/Dashboard/Dashboard";
import { SharedSanctuary } from "./screens/SharedSanctuary/SharedSanctuary";
import { CapsuleView } from "./screens/CapsuleView/CapsuleView";
import { CreateCapsule } from "./screens/CreateCapsule/CreateCapsule";
import { Frame } from "./screens/Frame/Frame";
import ProtectedRoute from "./components/ProtectedRoute";
import { Timeline } from "./screens/Timeline/Timeline";
import { Profile } from "./screens/Profile/Profile";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Frame />} />
        <Route path="/login" element={<Frame />} />

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
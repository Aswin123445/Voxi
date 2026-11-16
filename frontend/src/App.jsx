import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import CreateInterview from "./pages/CreateInterview";
import InterviewPreparation from "./pages/InterviewPreparation";
import InterviewRoom from "./pages/InterviewRoom";
import InterviewResults from "./pages/InterviewResults";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/interviews/new" replace />} />

          <Route path="/interviews/new" element={<CreateInterview />} />

          <Route
            path="/interviews/:interviewId/prepare"
            element={<InterviewPreparation />}
          />
        </Route>
        <Route
          path="/interviews/:interviewId/room"
          element={<InterviewRoom />}
        />
        <Route
          path="/interviews/:interviewId/results"
          element={<InterviewResults />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


import { EventsPage } from "./components/EventsPage";
import "./app.css";


function AppContent() {

  return (
    <div className="app-container">
      <main>
        <EventsPage />
      </main>
      </div>
  );
}

export default function App() {
  return (
      // <ThemeProvider theme={theme}>
      <AppContent />
      // </ThemeProvider>
  );
}

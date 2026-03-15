import EventTable from "./components/eventTable";
import events from "@/testing_data/events.json";

export default function Home() {
  return (
    <main className="page-container">
      <h1>Events</h1>
      <div style={{ marginTop: "1.5rem" }}>
        <EventTable events={events} />
      </div>
    </main>
  );
}

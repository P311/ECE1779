import SourceTable from "../components/sourceTable";
import sources from "@/testing_data/sources.json";

export default function SourcePage() {
  return (
    <main className="page-container">
      <h1>Sources</h1>
      <div style={{ marginTop: "1.5rem" }}>
        <SourceTable sources={sources} />
      </div>
    </main>
  );
}

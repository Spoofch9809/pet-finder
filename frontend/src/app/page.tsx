// Server component
import MapView from "./MapView";
import Feed from "./(shell)/Feed";

export default function Home() {
  return (
    <section className="p-0">
      <MapView />
      <Feed />
    </section>
  );
}

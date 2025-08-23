import Organism from "@organism";

const Dashboard = ({ children }) => {
  return (
    <div>
      <Organism.Header />
      <div>{children}</div>
      <Organism.Footer />
    </div>
  );
}

export default Dashboard;
import Organism from "@organism";

const Landing = ({ children }) => {
  return (
    <div>
      <Organism.Header />
      <div>{children}</div>
      <Organism.Footer />
    </div>
  );
}

export default Landing;
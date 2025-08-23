import Organism from "@organism";

const Profile = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Organism.Header />
      <div className="flex-1">{children}</div>
      <Organism.Footer />
    </div>
  );
}

export default Profile;
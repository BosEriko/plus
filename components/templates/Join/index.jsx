const Join = ({ background, children }) => {
  return (
    <div className="relative bg-cover bg-center h-screen w-screen flex items-center justify-center" style={{ backgroundImage: `url("${background}")` }}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default Join;

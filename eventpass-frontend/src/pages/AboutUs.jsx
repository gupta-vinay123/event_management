import React from 'react';
import { Home, Ticket, LayoutGrid, LifeBuoy, Info, Phone, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AboutUs = () => {
  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const handleLogout = () => {
    if (window.confirm("Do you want to Logout?")) {
      logout();           
      navigate('/login'); 
    }
  };

  return (
    <div className="flex min-h-screen bg-[#050505] text-white text-left font-sans">
      <aside className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 fixed h-full z-20 backdrop-blur-xl">
        <div className="text-2xl font-black mb-12 tracking-tighter">
          EVENT<span className="text-lime-400">PASS</span>
        </div>
        <nav className="flex-grow space-y-2">
          <NavItem icon={<Home size={20}/>} label="Home" path="/home" />
          <NavItem icon={<LayoutGrid size={20}/>} label="Event View" path="/events" />
          <NavItem icon={<LifeBuoy size={20}/>} label="Supports" path="/support" />
          <NavItem icon={<Info size={20}/>} label="About Us" path="/aboutus" active />
          <NavItem icon={<Phone size={20}/>} label="Contact Us" path="/contactus" />
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-4 text-gray-500 hover:text-red-500 transition-all mt-auto border-t border-white/5 pt-6 cursor-pointer w-full text-left font-bold"
        >
          <LogOut size={20} /> Logout
        </button>
      </aside>

      <main className="ml-64 flex-grow relative flex flex-col min-h-screen">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-lime-500/5 rounded-full blur-[120px] -z-10"></div>

        <div className="p-10 flex-grow">
          <header className="mb-12">
            <h1 className="text-5xl font-black italic uppercase">
              About <span className="text-lime-400">Us</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2">Discover the story behind EVENTPASS digital ticketing.</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/5 p-10 rounded-[2.5rem] border border-white/10 backdrop-blur-md">
            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-lime-400 mb-4 uppercase tracking-tight">Our Mission</h2>
                <p className="text-gray-400 leading-relaxed text-lg">
                  EVENTPASS is your premier destination for discovering and booking the most exciting events . We aim to revolutionize the event management industry by providing a seamless, secure, and digital ticketing experience.
                </p>
              </section>
            
            </div>

            <div className="bg-lime-500/10 rounded-[2rem] p-8 flex items-center justify-center border border-lime-500/20 relative overflow-hidden group">
              <div className="absolute -right-10 -bottom-10 text-lime-400/5 group-hover:scale-110 transition-transform">
                <Ticket size={250} />
              </div>
              <div className="text-center relative z-10">
                <Ticket size={80} className="text-lime-400 mx-auto mb-6" />
                <h3 className="text-4xl font-black tracking-tighter">100% DIGITAL</h3>
                <p className="text-gray-400 mt-2 font-mono uppercase tracking-widest">Paperless Ticketing Solution</p>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, path, active = false }) => (
  <Link to={path} className="block">
    <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${
      active
        ? 'bg-gradient-to-r from-lime-500/20 to-transparent text-lime-400 border-l-4 border-lime-500'
        : 'text-gray-500 hover:bg-white/5 hover:text-white'
    }`}>
      {icon} <span className="font-bold">{label}</span>
    </div>
  </Link>
);

const Footer = () => (
  <footer className="p-10 border-t border-white/5 bg-black/30 backdrop-blur-md mt-20">
    <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto gap-6">
      <div className="text-xl font-black tracking-tighter text-left">
        EVENT<span className="text-lime-400">PASS</span>
      </div>
      <p className="text-gray-500 text-sm font-medium">
        © 2026 EVENTPASS Digital Ticketing Solutions. All Rights Reserved.
      </p>
    </div>
  </footer>
);

export default AboutUs;

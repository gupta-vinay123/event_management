import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, LayoutGrid, LifeBuoy, Info, Phone, LogOut,
  Calendar, Plus, Minus, Ticket, ArrowLeft, Clock, MapPin, X, Lock
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import UserFooter from '../components/User/UserFooter';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';



const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ event, ticketCount, bookingData, onSuccess, onClose }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [cardError, setCardError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return; 

        setIsProcessing(true);
        setCardError('');

        try {
           
            const { error, paymentIntent } = await stripe.confirmCardPayment(
                bookingData.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: bookingData.userName || 'EventPass Customer',
                        },
                    },
                }
            );

            if (error) {
                
                setCardError(error.message);
                setIsProcessing(false);
                return;
            }

            if (paymentIntent.status === 'succeeded') {
                onSuccess();
            }

        } catch (err) {
            setCardError('Payment failed. Please try again.');
            setIsProcessing(false);
        }
    };

   
    const cardElementOptions = {
        style: {
            base: {
                color: '#ffffff',
                fontFamily: 'monospace',
                fontSize: '16px',
                '::placeholder': { color: '#4b5563' },
                iconColor: '#84cc16',
            },
            invalid: {
                color: '#ef4444',
                iconColor: '#ef4444',
            },
        },
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Order summary */}
            <div className="bg-lime-500/5 border border-lime-500/20 p-4 rounded-2xl">
                <p className="text-[10px] uppercase text-lime-500 font-black mb-1">Total Payable</p>
                <p className="text-3xl font-black italic">
                    ₹{(event.price * ticketCount).toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs mt-1">{ticketCount} ticket(s) · {event.title}</p>
            </div>

            {/* Stripe CardElement — renders secure card input */}
            <div>
                <label className="text-[10px] uppercase text-gray-500 font-bold block mb-2 px-1">
                    Card Details
                </label>
                <div className="bg-black border border-white/10 p-4 rounded-2xl focus-within:border-lime-500 transition-colors">
                    <CardElement options={cardElementOptions} />
                </div>
                <p className="text-gray-600 text-[10px] mt-2 flex items-center gap-1 px-1">
                    <Lock size={10} /> Secured by Stripe — your card details never touch our servers
                </p>
            </div>

            {/* Error display */}
            {cardError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-2xl">
                    {cardError}
                </div>
            )}

            <button
                type="submit"
                disabled={!stripe || isProcessing}
                className="w-full bg-lime-500 text-black py-5 rounded-2xl font-black uppercase italic hover:bg-white transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isProcessing ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing...
                    </div>
                ) : `Pay ₹${(event.price * ticketCount).toLocaleString()}`}
            </button>

            {/* Test card hint — remove in production */}
            <p className="text-center text-gray-600 text-[10px]">
                Test card: 4242 4242 4242 4242 · Any future date · Any CVC
            </p>
        </form>
    );
};


const EventDetailsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [event, setEvent] = useState(null);
    const [ticketCount, setTicketCount] = useState(1);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [bookingData, setBookingData] = useState(null); // { clientSecret, bookingId }
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await API.get(`/events/${id}`);
                setEvent(res.data);
            } catch (err) {
                console.error('Error fetching event:', err);
            }
        };
        fetchEvent();
    }, [id]);

    const handleLogout = () => {
        if (window.confirm('Do you want to logout?')) {
            logout();
            navigate('/login');
        }
    };

   
    const handleBuyNow = async () => {
        setIsCreatingOrder(true);
        try {
            const { data } = await API.post('/payments/create-intent', {
                eventId:    event._id,
                numTickets: ticketCount,
            });
           
            setBookingData({ ...data, userName: user?.name });
            setIsCheckoutOpen(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Could not initiate payment. Please try again.');
        } finally {
            setIsCreatingOrder(false);
        }
    };

    const handlePaymentSuccess = () => {
        setIsCheckoutOpen(false);
        alert('🎉 Payment successful! Your tickets are confirmed.');
        navigate('/home');
    };

    if (!event) return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-lime-400 font-bold uppercase italic text-4xl animate-pulse">
            Loading...
        </div>
    );

    // ✅ Cloudinary URL is already complete — use directly
    const finalImageUrl = event.image || '';

    const eventDate = new Date(event.date);
    const formattedDate = eventDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedTime = eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="flex min-h-screen bg-[#050505] text-white font-sans text-left">

            {/* Sidebar */}
            <aside className="w-64 bg-black/50 border-r border-white/5 flex flex-col p-6 fixed h-full z-20 backdrop-blur-xl">
                <div className="text-2xl font-black mb-12 tracking-tighter">EVENT<span className="text-lime-400">PASS</span></div>
                <nav className="flex-grow space-y-2 text-left">
                    <NavItem icon={<Home size={20}/>} label="Home" path="/home" />
                    <NavItem icon={<LayoutGrid size={20}/>} label="Event View" path="/events" active />
                    <NavItem icon={<LifeBuoy size={20}/>} label="Supports" path="/support" />
                    <NavItem icon={<Info size={20}/>} label="About Us" path="/aboutus" />
                    <NavItem icon={<Phone size={20}/>} label="Contact Us" path="/contactus" />
                </nav>
                <button onClick={handleLogout} className="flex items-center gap-3 p-4 text-gray-500 hover:text-red-500 transition-all mt-auto border-t border-white/5 pt-6 cursor-pointer w-full text-left">
                    <LogOut size={20} /> <span className="font-bold">Logout</span>
                </button>
            </aside>

            <div className="ml-64 flex-grow flex flex-col">
                <main className="p-10 flex-grow relative text-left">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-lime-400 mb-8 font-bold uppercase tracking-widest text-xs transition-colors">
                        <ArrowLeft size={18} /> Back to Events
                    </button>

                    <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12 bg-[#0a0a0a] border border-white/5 rounded-[3.5rem] p-10 shadow-2xl">

                        {/* Image */}
                        <div className="lg:w-1/2 h-[550px] rounded-[3rem] overflow-hidden border border-white/10 shadow-lg">
                            <img src={finalImageUrl} alt={event.title} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="lg:w-1/2 flex flex-col justify-between py-4 text-left">
                            <div>
                                <h1 className="text-5xl font-black italic uppercase text-white mb-6 tracking-tighter leading-tight">{event.title}</h1>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                                        <Calendar className="text-lime-500" size={20} />
                                        <p className="text-sm font-bold uppercase italic">{formattedDate}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/5">
                                        <Clock className="text-lime-500" size={20} />
                                        <p className="text-sm font-bold uppercase italic">{formattedTime}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-[1.5rem] border border-white/5 sm:col-span-2">
                                        <MapPin className="text-lime-500" size={20} />
                                        <p className="text-sm font-bold uppercase italic tracking-wide">{event.location || 'Location not specified'}</p>
                                    </div>
                                </div>
                                <div className="mb-8">
                                    <h3 className="text-[10px] uppercase text-lime-500 font-black mb-2 tracking-[0.2em]">About Event</h3>
                                    <p className="text-gray-400 text-lg italic leading-relaxed border-l-2 border-lime-500/20 pl-6">
                                        {event.description || 'No description available.'}
                                    </p>
                                </div>
                            </div>

                            {/* Ticket selector + Buy Now */}
                            <div className="bg-[#111] p-8 rounded-[3rem] border border-white/10 shadow-xl">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Select Quantity</span>
                                    <div className="flex items-center gap-4 bg-black p-2 rounded-full border border-white/10">
                                        <button onClick={() => ticketCount > 1 && setTicketCount(ticketCount - 1)} className="w-10 h-10 rounded-full hover:bg-lime-500 hover:text-black transition-all flex items-center justify-center">
                                            <Minus size={18} />
                                        </button>
                                        <span className="text-xl font-bold text-lime-400 w-6 text-center">{ticketCount}</span>
                                        <button onClick={() => ticketCount < (event.availableTickets || 10) && setTicketCount(ticketCount + 1)} className="w-10 h-10 rounded-full hover:bg-lime-500 hover:text-black transition-all flex items-center justify-center">
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-gray-600 text-xs mb-6 text-center font-mono">
                                    {event.availableTickets} tickets remaining
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                    <div className="flex flex-col text-left">
                                        <span className="text-gray-500 text-[10px] uppercase font-black">Total Price</span>
                                        <span className="text-4xl font-black text-white italic tracking-tighter">
                                            ₹{(event.price * ticketCount).toLocaleString()}
                                        </span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={handleBuyNow}
                                        disabled={isCreatingOrder || event.availableTickets === 0}
                                        className="bg-lime-500 text-black px-10 py-5 rounded-[2rem] font-black uppercase italic hover:bg-white transition-all shadow-xl shadow-lime-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isCreatingOrder ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                                Loading...
                                            </div>
                                        ) : event.availableTickets === 0 ? 'Sold Out' : (
                                            <><Ticket size={20} /> Buy Now</>
                                        )}
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                <UserFooter />
            </div>

            {/*  Stripe Checkout Modal */}
            <AnimatePresence>
                {isCheckoutOpen && bookingData && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/80">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0f0f0f] border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-black italic uppercase tracking-tighter">Secure Checkout</h2>
                                    <button onClick={() => setIsCheckoutOpen(false)} className="text-gray-500 hover:text-white">
                                        <X />
                                    </button>
                                </div>

                                {/* Elements provider wraps the form — required for Stripe hooks */}
                                <Elements stripe={stripePromise}>
                                    <CheckoutForm
                                        event={event}
                                        ticketCount={ticketCount}
                                        bookingData={bookingData}
                                        onSuccess={handlePaymentSuccess}
                                        onClose={() => setIsCheckoutOpen(false)}
                                    />
                                </Elements>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const NavItem = ({ icon, label, path, active = false }) => (
    <Link to={path}>
        <div className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all ${active ? 'bg-gradient-to-r from-lime-500/20 to-transparent text-lime-400 border-l-4 border-lime-500' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}>
            {icon} <span className="font-bold">{label}</span>
        </div>
    </Link>
);

export default EventDetailsView;

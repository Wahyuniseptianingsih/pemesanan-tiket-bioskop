
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';





let globalBookedSeats = {};
let globalAllBookings = [];


function AdminPage({ user, token }) {
    const [movies, setMovies] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [bookings, setBookings] = useState([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [showMovieForm, setShowMovieForm] = useState(false);
    const [showScheduleForm, setShowScheduleForm] = useState(false);
    const [isEditingMovie, setIsEditingMovie] = useState(false);
    const [currentMovie, setCurrentMovie] = useState({ id: null, title: '', duration: '', description: '', image_url: '' });
    const [scheduleMovieId, setScheduleMovieId] = useState('');
    const [scheduleShowTime, setScheduleShowTime] = useState('');
    const [schedulePrice, setSchedulePrice] = useState('');
    const [scheduleTheater, setScheduleTheater] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const [moviesRes, schedulesRes, bookingsRes] = await Promise.all([
                axios.get('http://localhost:3001/api/movies'),
                axios.get('http://localhost:3001/api/schedules'),
                axios.get('http://localhost:3001/api/admin/bookings') 
            ]);
            setMovies(moviesRes.data);
            setSchedules(schedulesRes.data);
            setBookings(bookingsRes.data);
        } catch (err) {
            setError('Gagal mengambil data dari server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerifyBooking = async (id) => {
        try {
            await axios.put(`http://localhost:3001/api/admin/verify-booking/${id}`);
            setMessage('Pembayaran berhasil diverifikasi! Tiket user sudah aktif.');
            fetchData(); 
        } catch (err) {
            setError('Gagal memverifikasi pembayaran.');
        }
    };

    const handleMovieFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(''); setError('');
        const payload = { title: currentMovie.title, duration: parseInt(currentMovie.duration), description: currentMovie.description, image_url: currentMovie.image_url };
        const config = { headers: { 'Authorization': `Bearer ${token}` } };
        try {
            if (isEditingMovie) {
                await axios.put(`http://localhost:3001/api/movies/${currentMovie.id}`, payload, config);
                setMessage('Film berhasil diperbarui!');
            } else {
                await axios.post('http://localhost:3001/api/movies', payload, config);
                setMessage('Film baru berhasil ditambahkan!');
            }
            resetAndCloseMovieForm(); fetchData();
        } catch (err) { setError(err.response?.data?.message || 'Gagal simpan film.'); }
        finally { setLoading(false); }
    };

    const handleScheduleFormSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); setMessage(''); setError('');
        const payload = { movie_id: parseInt(scheduleMovieId), show_time: new Date(scheduleShowTime).toISOString(), price: parseInt(schedulePrice), theater_name: scheduleTheater };
        try {
            await axios.post('http://localhost:3001/api/schedules', payload, { headers: { 'Authorization': `Bearer ${token}` } });
            setMessage('Jadwal baru berhasil ditambahkan!');
            resetAndCloseScheduleForm(); fetchData();
        } catch (err) { setError('Gagal menambahkan jadwal.'); }
        finally { setLoading(false); }
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm('Hapus jadwal ini?')) {
            try { await axios.delete(`http://localhost:3001/api/schedules/${id}`, { headers: { 'Authorization': `Bearer ${token}` } }); fetchData(); }
            catch (err) { setError('Gagal hapus.'); }
        }
    };

    const resetAndCloseMovieForm = () => { setShowMovieForm(false); setIsEditingMovie(false); setCurrentMovie({ id: null, title: '', duration: '', description: '', image_url: '' }); };
    const resetAndCloseScheduleForm = () => { setShowScheduleForm(false); setScheduleMovieId(''); setScheduleShowTime(''); setSchedulePrice(''); setScheduleTheater(''); };
    const openEditMovieForm = (m) => { setIsEditingMovie(true); setCurrentMovie(m); setShowMovieForm(true); };
    const openAddMovieForm = () => { setIsEditingMovie(false); setCurrentMovie({ id: null, title: '', duration: '', description: '', image_url: '' }); setShowMovieForm(true); };

    return (
        <div className="admin-page">
            <div className="admin-container">
                <h1 style={{color: 'var(--pink-main)'}}>Panel Admin</h1>
                <p>Halo, {user.email}.</p>
                
                <div className="admin-actions">
                    <button onClick={openAddMovieForm} className="nav-button">+ Film</button>
                    <button onClick={() => setShowScheduleForm(true)} className="nav-button">+ Jadwal</button>
                </div>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}

                {/* ======================================================= */}
                {/* FORM EDIT / TAMBAH FILM                                 */}
                {/* ======================================================= */}
                {showMovieForm && (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', border: '2px solid #ff758c', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#ff758c', marginTop: 0 }}>{isEditingMovie ? 'Edit Film' : 'Tambah Film Baru'}</h3>
                        <form onSubmit={handleMovieFormSubmit}>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Judul Film:</label>
                                <input 
                                    type="text" 
                                    value={currentMovie.title} 
                                    onChange={(e) => setCurrentMovie({...currentMovie, title: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Durasi (menit):</label>
                                <input 
                                    type="number" 
                                    value={currentMovie.duration} 
                                    onChange={(e) => setCurrentMovie({...currentMovie, duration: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>URL Gambar Poster:</label>
                                <input 
                                    type="text" 
                                    value={currentMovie.image_url} 
                                    onChange={(e) => setCurrentMovie({...currentMovie, image_url: e.target.value})} 
                                    required 
                                />
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Deskripsi / Sinopsis:</label>
                                <textarea 
                                    value={currentMovie.description} 
                                    onChange={(e) => setCurrentMovie({...currentMovie, description: e.target.value})} 
                                    rows="3" 
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" className="nav-button login-button">
                                    {isEditingMovie ? 'Simpan Perubahan' : 'Tambah Film'}
                                </button>
                                <button type="button" onClick={resetAndCloseMovieForm} className="nav-button">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                )}
                                  
                {showScheduleForm && (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '10px', marginTop: '20px', border: '2px solid #ff758c', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ color: '#ff758c', marginTop: 0 }}>Tambah Jadwal Baru</h3>
                        <form onSubmit={handleScheduleFormSubmit}>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Pilih Film:</label>
                                <select value={scheduleMovieId} onChange={(e) => setScheduleMovieId(e.target.value)} required>
                                    <option value="">-- Pilih Film --</option>
                                    {movies.map(m => (
                                        <option key={m.id} value={m.id}>{m.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Waktu Tayang:</label>
                                <input type="datetime-local" value={scheduleShowTime} onChange={(e) => setScheduleShowTime(e.target.value)} required />
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Harga Tiket (Rp):</label>
                                <input type="number" value={schedulePrice} onChange={(e) => setSchedulePrice(e.target.value)} placeholder="50000" required />
                            </div>
                            <div className="input-group" style={{ marginBottom: '10px' }}>
                                <label>Nama Studio / Teater:</label>
                                <input type="text" value={scheduleTheater} onChange={(e) => setScheduleTheater(e.target.value)} placeholder="Studio 1" required />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                                <button type="submit" className="nav-button login-button">Simpan Jadwal</button>
                                <button type="button" onClick={resetAndCloseScheduleForm} className="nav-button">Batal</button>
                            </div>
                        </form>
                    </div>
                )}

              
                <div className="data-list" style={{marginTop: '30px'}}>
                    <h2>Verifikasi Pembayaran User</h2>
                    <div style={{overflowX: 'auto'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '10px'}}>
                            <thead>
                                <tr style={{background: '#ff758c', color: 'white', textAlign: 'left'}}>
                                    <th style={{padding: '10px'}}>Film</th>
                                    <th style={{padding: '10px'}}>Kursi</th>
                                    <th style={{padding: '10px'}}>Bukti Transfer</th> 
                                    <th style={{padding: '10px'}}>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.filter(b => b.status === 'Pending').map(b => (
                                    <tr key={b.id} style={{borderBottom: '1px solid #eee'}}>
                                        <td style={{padding: '10px'}}>{b.movie_title}</td>
                                        <td style={{padding: '10px'}}>{b.seats}</td>
                                        <td style={{padding: '10px'}}>
                                            {/* TOMBOL LIHAT FOTO */}
                                            {b.proof_image_url ? (
                                                <a 
                                                    href={b.proof_image_url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    style={{color: '#ff758c', fontWeight: 'bold', textDecoration: 'underline'}}
                                                >
                                                    Lihat Foto
                                                </a>
                                            ) : (
                                                <span style={{color: '#999', fontSize: '0.8rem'}}>No Image</span>
                                            )}
                                        </td>
                                        <td style={{padding: '10px'}}>
                                            <button 
                                                onClick={() => handleVerifyBooking(b.id)}
                                                style={{background: '#28a745', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}
                                            >
                                                Konfirmasi
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {bookings.filter(b => b.status === 'Pending').length === 0 && <p style={{textAlign: 'center', padding: '10px'}}>Tidak ada pembayaran tertunda.</p>}
                    </div>
                </div>

                <hr style={{margin: '40px 0'}} />

                <div className="admin-data-grid">
                    <div className="data-list">
                        <h2>Daftar Film</h2>
                        {movies.map(m => (<div key={m.id} className="data-item"><span>{m.title}</span><button onClick={() => openEditMovieForm(m)}>Edit</button></div>))}
                    </div>
                    <div className="data-list">
                        <h2>Daftar Jadwal</h2>
                        {schedules.map(s => (
                            <div key={s.id} className="data-item">
                                <span>{movies.find(m => m.id === s.movie_id)?.title} - {s.theater_name}</span>
                                <button onClick={() => handleDeleteSchedule(s.id)} className="delete-btn">Hapus</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Navbar({ user, onLogout }) {
    return (
        <header className="app-header"><Link to="/" className="header-title-link"><h1 className="header-title">Bioskop Keren</h1></Link><div className="header-user-section">{user ? (<>{user.role === 'admin' && (<Link to="/admin" className="nav-button">Halaman Admin</Link>)}{user.role === 'customer' && (<Link to="/my-tickets" className="nav-button">Tiket Saya</Link>)}<span className="user-name">Halo, {user.name || user.email}!</span><button onClick={onLogout} className="nav-button logout-button">Logout</button></>) : (<Link to="/login" className="nav-button login-button">Login</Link>)}</div></header>
    );
}



function AuthPage({ onLoginSuccess }) {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        if (isLoginMode) {
            try {
                const response = await axios.post('http://localhost:3001/api/login', { email, password });
                onLoginSuccess(response.data);
                navigate('/');
            } catch (err) {
                setError(err.response?.data?.message || 'Terjadi kesalahan.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await axios.post('http://localhost:3001/api/register', { name, email, password });
                setMessage(response.data.message);
                setName(''); setEmail(''); setPassword('');
                setIsLoginMode(true); 
            } catch (err) {
                setError(err.response?.data?.message || 'Gagal melakukan registrasi.');
            } finally {
                setLoading(false);
            }
        }
    };
    return (
        <div className="auth-page"><div className="auth-container"><h2>{isLoginMode ? 'Login' : 'Buat Akun Baru'}</h2><form onSubmit={handleSubmit}>{!isLoginMode && (<div className="input-group"><label htmlFor="name">Nama Lengkap</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required /></div>)}<div className="input-group"><label htmlFor="email">Email</label><input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></div><div className="input-group"><label htmlFor="password">Password</label><input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>{error && <p className="error-message">{error}</p>}{message && <p className="success-message">{message}</p>}<button type="submit" className="auth-button" disabled={loading}>{loading ? 'Memproses...' : (isLoginMode ? 'Login' : 'Register')}</button></form><p className="switch-mode"><span onClick={() => { setIsLoginMode(!isLoginMode); setError(''); setMessage(''); }}>{isLoginMode ? 'Belum punya akun? Buat akun' : 'Sudah punya akun? Login'}</span></p></div></div>
    );
}

function MovieList() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/movies');
                setMovies(response.data);
            } catch (err) {
                setError('Gagal mengambil data. Pastikan server backend berjalan.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovies();
    }, []);

    if (loading) return <div className="app-container"><h1>Memuat film...</h1></div>;
    if (error) return <div className="app-container"><h1>Error: {error}</h1></div>;

    return (
        <main className="main-content-movies">
            <h2 className="main-title">Pilihan Film Untukmu</h2>
            <div className="movie-grid">
                {movies.map(movie => (<MovieCard key={movie.id} movie={movie} />))}
            </div>
        </main>
    );
}

function MovieCard({ movie }) {
    return (
        <Link to={`/movie/${movie.id}`} className="movie-card-link">
            <div className="movie-card">
                <img 
                    src={movie.image_url} 
                    alt={movie.title} 
                    className="movie-poster-image" 
                    onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/400x600/eee/ccc?text=Not+Found'; }}
                />
                <div className="movie-card-info">
                    <h3 className="movie-card-title">{movie.title}</h3>
                </div>
            </div>
        </Link>
    );
}

function MovieDetail({ user }) {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSchedule, setSelectedSchedule] = useState(null);

    useEffect(() => {
        const fetchMovieDetail = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/api/movies/${id}`);
                setMovie(response.data);
            } catch (err) {
                setError('Gagal mengambil detail film.');
            } finally {
                setLoading(false);
            }
        };
        fetchMovieDetail();
    }, [id]);

    if (loading) return <div className="app-container"><h1>Memuat detail...</h1></div>;
    if (error) return <div className="app-container"><h1>Error: {error}</h1></div>;
    if (!movie) return <div className="app-container"><h1>Film tidak ditemukan.</h1></div>;

    const PesanTiketButton = () => {
        if (!user) { return <Link to="/login" className="buy-ticket-button">Login untuk Pesan Tiket</Link>; }
        if (user.role === 'customer') {
            if (selectedSchedule) { return <Link to={`/booking/${movie.id}/${selectedSchedule.id}`} className="buy-ticket-button">Pesan Tiket</Link>; }
            return <button className="buy-ticket-button" disabled>Pilih Jadwal Terlebih Dahulu</button>;
        }
        return null; 
    };

    return (
        <div className="detail-page-background">
            <div className="movie-detail-container">
                <div className="detail-poster-placeholder" style={{ backgroundImage: `url(${movie.image_url || `https://placehold.co/400x600/222/fff?text=${movie.title.replace(' ', `\n`)}`})` }}></div>
                <div className="detail-info">
                    <h1>{movie.title}</h1>
                    <div className="detail-meta"><span>Durasi: {movie.duration} menit</span></div>
                    <h2>Sinopsis</h2>
                    <p className="synopsis-text">{movie.description || 'Sinopsis belum tersedia.'}</p>
                    {(!user || user.role === 'customer') && (
                        <>
                            <div className="schedule-section">
                                <h3>Pilih Jadwal Hari Ini:</h3>
                                <div className="schedule-options">
                                    {movie.schedules && movie.schedules.length > 0 ? movie.schedules.map(schedule => (
                                        <button 
                                            key={schedule.id} 
                                            className={`schedule-button ${selectedSchedule?.id === schedule.id ? 'selected' : ''}`} 
                                            onClick={() => setSelectedSchedule(schedule)}
                                        >
                                            <span className="time">{new Date(schedule.show_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span className="studio-label">{schedule.theater_name || 'Studio 1'}</span>
                                        </button>
                                    )) : <p>Jadwal belum tersedia.</p>}
                                </div>
                            </div>
                            <PesanTiketButton />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}





function SeatSelectionPage({ user }) {
    const { movieId, scheduleId } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:3001/api/movies/${movieId}`).then(res => {
            setMovie(res.data);
            setSchedule(res.data.schedules.find(s => s.id === parseInt(scheduleId)));
        });
    }, [movieId, scheduleId]);

    const handleSeatClick = (seatId) => {
        setSelectedSeats(prev => 
            prev.includes(seatId) ? prev.filter(s => s !== seatId) : [...prev, seatId]
        );
    };

    const renderSeats = () => {
        const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
        const cols = 8;
        const seatMap = [];

        rows.forEach(row => {
            for (let col = 1; col <= cols; col++) {
                const seatId = `${row}${col}`;
                const isSelected = selectedSeats.includes(seatId);
                const isBooked = globalBookedSeats[scheduleId]?.includes(seatId);
                
                const seatClass = `seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`;
                
                seatMap.push(
                    <div 
                        key={seatId} 
                        className={seatClass} 
                        onClick={() => !isBooked && handleSeatClick(seatId)}
                    >
                        {seatId}
                    </div>
                );
            }
        });
        return seatMap;
    }; 

    const handleConfirm = () => {
        const booking = { 
            userId: user?.id,
            movieTitle: movie?.title, 
            schedule,
            seats: selectedSeats, 
            totalPrice: selectedSeats.length * (schedule?.price || 50000), 
            bookingId: `BK-${Date.now()}`, 
            userName: user?.name || 'Customer' 
        };
        navigate('/payment', { state: { booking } });
    };

    if (!movie || !schedule) return <div className="app-container"><h1>Memuat...</h1></div>;

    return (
        <div className="booking-page">
            <h1 style={{textAlign:'center', color: 'var(--pink-main)'}}>Pilih Kursi</h1>
            <div className="screen">LAYAR BIOSKOP</div>
            
            <div className="seat-map-container">
                {renderSeats()}
            </div>

            <div className="booking-summary" style={{marginTop: '30px', background: 'white', padding: '20px', borderRadius: '15px'}}>
                <div style={{display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '20px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <div className="seat" style={{width:'20px', height:'20px', cursor:'default', backgroundColor: '#f0f0f0', border: '1px solid #ccc'}}></div> Tersedia
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
                        <div className="seat selected" style={{width:'20px', height:'20px', cursor:'default', backgroundColor: '#ff758c'}}></div> Pilihan Anda
                    </div>
                </div>
                <h3>Kursi: {selectedSeats.join(', ') || '-'}</h3>
                <h3>Total: Rp {(selectedSeats.length * (schedule?.price || 50000)).toLocaleString('id-ID')}</h3>
                <button 
                    className="buy-ticket-button" 
                    disabled={selectedSeats.length === 0} 
                    onClick={handleConfirm}
                >
                    Konfirmasi Pembayaran
                </button>
            </div>
        </div>
    );
} 

function PaymentPage() {
    const navigate = useNavigate(), location = useLocation();
    const { booking } = location.state || {};
    const [paymentStatus, setPaymentStatus] = useState('');
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [proofImage, setProofImage] = useState(null); // State baru untuk bukti gambar
    const paymentMethods = ['GoPay', 'OVO', 'Dana', 'Bank Transfer'];

    if (!booking) return <div className="app-container"><h1>Data pemesanan tidak ditemukan.</h1></div>;

    const handlePayNow = async () => {
        if (!selectedMethod || !proofImage) return alert('Silakan lengkapi data dan unggah bukti transfer.');

        setPaymentStatus('Mengirim bukti...');
        
        const imageUrl = URL.createObjectURL(proofImage); 

        try {
            
            await axios.post('http://localhost:3001/api/bookings', {
                userId: booking.userId,
                movieTitle: booking.movieTitle,
                seats: Array.isArray(booking.seats) ? booking.seats.join(', ') : booking.seats,
                totalPrice: booking.totalPrice,
                status: 'Pending', 
                proof_image_url: imageUrl 
            });

            alert("Bukti pembayaran terkirim!");
            navigate('/my-tickets'); 
        } catch (err) {
            alert('Gagal mengirim data. Pastikan server backend berjalan.');
        } finally {
            setPaymentStatus('');
        }
    };
    return (
        <div className="payment-page">
            <div className="payment-summary-box">
                <h1 style={{color: '#ff758c'}}>Konfirmasi Pembayaran</h1>
                <div className="payment-details">
                    <p><strong>Film:</strong> {booking.movieTitle}</p>
                    <p><strong>Kursi:</strong> {booking.seats.join(', ')}</p>
                    <hr />
                    <p className="total-price"><strong>Total Bayar:</strong> Rp {booking.totalPrice.toLocaleString('id-ID')}</p>
                </div>
                
                <div className="payment-methods">
                    <p>Pilih Metode Pembayaran:</p>
                    <div className="method-options">
                        {paymentMethods.map(m => (
                            <button key={m} className={`method-option ${selectedMethod === m ? 'selected' : ''}`} onClick={() => setSelectedMethod(m)}>{m}</button>
                        ))}
                    </div>
                </div>

                {selectedMethod && (
                    <div className="upload-section" style={{marginTop: '20px', textAlign: 'left', padding: '15px', background: '#fff', borderRadius: '8px', border: '1px dashed #ff758c'}}>
                        <p style={{fontSize: '0.85rem', margin: '0 0 5px 0'}}>Silakan transfer ke <strong>{selectedMethod}</strong>:</p>
                        <p style={{fontWeight: 'bold', color: '#ff758c', margin: '0 0 10px 0'}}>0812-XXXX-XXXX</p>
                        <label style={{display: 'block', fontSize: '0.8rem'}}>Upload Bukti Transfer:</label>
                        <input type="file" accept="image/*" onChange={(e) => setProofImage(e.target.files[0])} style={{fontSize: '0.8rem', marginTop: '5px'}} />
                    </div>
                )}

                <button className="pay-now-button" onClick={handlePayNow} disabled={!selectedMethod || !!paymentStatus || !proofImage}>
                    {paymentStatus || 'Konfirmasi Pembayaran'}
                </button>
            </div>
        </div>
    );
}


function ETicketPage() {
    const location = useLocation();
    const data = location.state?.booking || {
        id: "TICKET-001",
        movie_title: "Bioskop Ayu",
        seats: "A1, A2",
        total_price: 50000,
        movie_image: "https://placehold.co/400x250/ff758c/ffffff?text=text=E-Ticket"
    };

    return (
        <div style={{ padding: '50px', display: 'flex', justifyContent: 'center', background: '#fff0f5', minHeight: '100vh' }}>
            <div style={{ background: 'white', padding: '30px', borderRadius: '20px', width: '350px', textAlign: 'center', boxShadow: '0 10px 20px rgba(0,0,0,0.1)' }}>
                <h2 style={{ color: '#ff758c' }}>E-TICKET</h2>
                <img 
                    src={data.movie_image} 
                    alt="Poster" 
                    style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }} 
                />
                <h3 style={{ margin: '10px 0' }}>{data.movie_title}</h3>
                <p>Kursi: <strong>{data.seats}</strong></p>
                <div style={{ marginTop: '20px', padding: '15px', border: '2px solid #ff758c', borderRadius: '10px' }}>
                    <p style={{ fontSize: '12px', margin: '0 0 10px 0' }}>SCAN ME</p>
                    <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${data.id}`} 
                        alt="QR Code" 
                        style={{ width: '150px', height: '150px' }} 
                    />
                </div>
            </div>
        </div>
    );
}

function MyTicketsPage({ user }) {
    const [userBookings, setUserBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        axios.get(`http://localhost:3001/api/my-tickets/${user.id}`)
            .then(res => {
                setUserBookings(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Gagal ambil tiket:", err);
                setLoading(false);
            });
    }, [user, navigate]);

    if (loading) return <div className="app-container"><h1>Memuat tiket...</h1></div>;

    return (
        <div className="my-tickets-page">
            <h1 style={{textAlign: 'center', color: '#ff758c'}}>Riwayat Tiket Saya</h1>
            {userBookings.length > 0 ? (
                <div className="tickets-list">
                    {userBookings.map(b => (
                        <div key={b.id} className="ticket-history-card" style={{
                            borderLeft: b.status === 'Verified' ? '5px solid #2ecc71' : '5px solid #f1c40f'
                        }}>
                            <h3>{b.movie_title}</h3>
                            <p><strong>Kursi:</strong> {b.seats}</p>
                            <p><strong>Status:</strong> 
                                <span style={{
                                    color: b.status === 'Verified' ? '#2ecc71' : '#f39c12',
                                    fontWeight: 'bold',
                                    marginLeft: '5px'
                                }}>
                                    {b.status === 'Verified' ? 'LUNAS (Siap Digunakan)' : 'MENUNGGU VERIFIKASI'}
                                </span>
                            </p>
                            {b.status === 'Verified' && (
                                <Link to="/ticket" state={{ booking: b }} className="nav-button" style={{display:'inline-block', marginTop:'10px', fontSize:'0.8rem'}}>
                                    Lihat E-Tiket
                                </Link>
                            )}
                        </div>
                    ))}
                </div>
            ) : <p style={{textAlign: 'center'}}>Belum ada riwayat pemesanan tiket.</p>}
        </div>
    );
}

const heroPosters = [
  { image: "/avatar3.jpg" },
  { image: "/spiderman_beyond.jpg" },
  { image: "/fnaf.jpg" }
];
function App() {
    const [currentHero, setCurrentHero] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentHero((prev) => (prev + 1) % heroPosters.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const [authData, setAuthData] = useState(() => { 
        try { 
            const saved = localStorage.getItem('authData'); 
            return saved ? JSON.parse(saved) : null; 
        } catch (error) { return null; } 
    });

    useEffect(() => { 
        if (authData) { 
            localStorage.setItem('authData', JSON.stringify(authData)); 
        } else { 
            localStorage.removeItem('authData'); 
        } 
    }, [authData]);

    const handleLoginSuccess = (data) => { setAuthData(data); };
    const handleLogout = () => { setAuthData(null); };

    return (
        <div style={{
            backgroundImage: `url(${heroPosters[currentHero]?.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
            transition: 'background-image 1s ease-in-out',
            minHeight: '100vh',
            width: '100%'
        }}>
            <style>{styles}</style>
            <Router>
                <Navbar user={authData?.user} onLogout={handleLogout} />

                <div className="hero-slider" style={{ height: '400px', marginTop: '100px' }}></div>

                {/* HANYA SATU CONTAINER UTAMA BIAR GAK KOSONG */}
                <div className="main-container" style={{ 
                    background: 'rgba(255, 240, 245, 0.9)', 
                    padding: '2rem',
                    margin: '0 5% 50px 5%',
                    borderRadius: '20px',
                    minHeight: '60vh'
                }}>
                    <Routes>
                        <Route path="/" element={<MovieList />} />
                        <Route path="/movie/:id" element={<MovieDetail user={authData?.user} />} />
                        <Route path="/login" element={<AuthPage onLoginSuccess={handleLoginSuccess} />} />
                        <Route path="/booking/:movieId/:scheduleId" element={<SeatSelectionPage user={authData?.user} />} />
                        <Route path="/payment" element={<PaymentPage />} />
                        <Route path="/my-tickets" element={<MyTicketsPage user={authData?.user} />} />
                        <Route path="/ticket" element={<ETicketPage />} /> {/* Pintu halaman tiket */}
                        <Route path="/admin" element={authData?.user?.role === 'admin' ? <AdminPage user={authData.user} token={authData.token} /> : <h1>Akses Ditolak</h1>} />
                    </Routes>
                </div>
            </Router>
        </div>
    );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
  :root { --bg-color: #FFF0F5; --text-color: #2c3e50; --pink-grad: linear-gradient(90deg, #ff758c 0%, #ff7eb3 100%); --pink-main: #ff758c; --card-bg: #ffffff; --shadow-color: rgba(0, 0, 0, 0.1); }
  body { margin: 0; font-family: 'Poppins', sans-serif; background-color: var(--bg-color); color: var(--text-color); }
  .main-container { padding-top: 70px; }
  .app-header { background-color: rgba(255, 240, 245, 0.8); backdrop-filter: blur(10px); padding: 10px 5%; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; align-items: center; position: fixed; top: 0; left: 0; right: 0; z-index: 1000; }
  .header-title-link { text-decoration: none; }
  .header-title { font-size: 1.8rem; margin: 0; font-weight: 700; background: var(--pink-grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .header-user-section { display: flex; align-items: center; gap: 1rem; }
  .user-name { font-weight: 600; color: var(--text-color); }
  .nav-button { background: transparent; border: 2px solid var(--pink-main); color: var(--pink-main); padding: 8px 20px; border-radius: 50px; text-decoration: none; cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.3s ease; }
  .nav-button:hover { background: var(--pink-main); color: white; box-shadow: 0 0 15px var(--pink-main); }
  .nav-button.login-button, .nav-button.logout-button { background: var(--pink-main); color: white; }
  .main-content-movies { padding: 2rem 5%; }
  .main-title { font-size: 2.5rem; font-weight: 700; text-align: center; margin-bottom: 2rem; color: var(--text-color); }
  .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 2rem; }
  .movie-card-link { text-decoration: none; }
  .movie-card { background-color: var(--card-bg); border-radius: 12px; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease; cursor: pointer; box-shadow: 0 8px 25px var(--shadow-color); display: flex; flex-direction: column; }
  .movie-card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px var(--shadow-color); }
  .movie-poster-image { width: 100%; height: 300px; object-fit: cover; background-color: #eee; }
  .movie-card-info { padding: 1rem; flex-grow: 1; }
  .movie-card-title { color: var(--text-color); font-size: 1.1rem; font-weight: 600; margin: 0; }
  .auth-page, .admin-page, .detail-page-background, .booking-page, .payment-page, .ticket-page, .my-tickets-page { padding: 2rem 5%; }
  .auth-container { background-color: #fff; padding: 2rem 3rem; border-radius: 12px; width: 100%; max-width: 400px; text-align: center; margin: 2rem auto; box-shadow: 0 8px 25px var(--shadow-color); }
  .input-group label { display: block; margin-bottom: 5px; color: #555; }
  .input-group input, .input-group select, .input-group textarea { width: 100%; padding: 12px; border-radius: 5px; border: 1px solid #ddd; background-color: #f9f9f9; color: #333; box-sizing: border-box; font-family: inherit; font-size: 1rem; }
  .auth-button { background: var(--pink-grad); color: white; border: none; padding: 15px; font-size: 1.2rem; border-radius: 5px; cursor: pointer; width: 100%; }
  .movie-detail-container { display: flex; flex-direction: column; padding: 2rem; max-width: 1000px; margin: 2rem auto; gap: 2.5rem; background-color: #fff; border-radius: 12px; box-shadow: 0 8px 25px var(--shadow-color); }
  .detail-poster-placeholder { width: 100%; max-width: 300px; height: 450px; background-size: cover; background-position: center; border-radius: 8px; flex-shrink: 0; margin: 0 auto; background-color: #eee; }
  @media (min-width: 768px) { .movie-detail-container { flex-direction: row; align-items: flex-start; } .detail-poster-placeholder { margin: 0; } }
  .detail-info h1 { margin-top: 0; font-size: 2.8rem; color: #333; }
  .schedule-options { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: 1rem; }
  .schedule-button { background-color: #f0f0f0; border: 2px solid #ddd; color: var(--text-color); padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-weight: 600; display: flex; flex-direction: column; align-items: center; min-width: 100px; }
  .schedule-button.selected { border-color: var(--pink-main); background-color: var(--pink-main); color: white; }
  .studio-label { font-size: 0.7rem; font-weight: bold; margin-top: 5px; }
  .buy-ticket-button { background: var(--pink-grad); color: white; border: none; padding: 15px 30px; font-size: 1.2rem; border-radius: 5px; cursor: pointer; margin-top: 2rem; width: 100%; text-decoration: none; display: block; text-align: center;}
  .buy-ticket-button:disabled { background: #ccc; cursor: not-allowed; }
  .booking-page { text-align: center; max-width: 800px; margin: auto; }
  .screen { background-color: #ddd; color: #555; padding: 10px; margin: 2rem auto; width: 80%; border-radius: 5px; }
  .seat-map-container { display: grid; grid-template-columns: repeat(8, 1fr); gap: 10px; margin-top: 2rem; }
  
  /* BAGIAN KURSI YANG SUDAH DIPERBAIKI */
  .seat { background-color: #f0f0f0 !important; height: 40px; border-radius: 5px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px; border: 1px solid #ccc; color: #2c3e50 !important; }
  .seat.selected { background-color: var(--pink-main) !important; color: white !important; border-color: var(--pink-main) !important; }
  .seat.booked { background-color: #ccc !important; color: #888 !important; cursor: not-allowed !important; }

  .payment-summary-box { background-color: #fff; padding: 2rem; border-radius: 12px; width: 100%; max-width: 450px; text-align: center; box-shadow: 0 8px 25px var(--shadow-color); }
  .method-options { display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-top: 1rem; }
  .method-option { background-color: #f0f0f0; padding: 10px 20px; border-radius: 5px; border: 2px solid #ddd; cursor: pointer; }
  .method-option.selected { border-color: var(--pink-main); background-color: var(--pink-main); color: white; }
  .ticket-container { background: white; color: black; border-radius: 15px; width: 100%; max-width: 400px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); margin: auto; }
  .ticket-header { background: var(--pink-grad); color: white; padding: 1.5rem; border-top-left-radius: 15px; border-top-right-radius: 15px; }
  .admin-container { background-color: #fff; padding: 2rem; border-radius: 12px; margin: auto; }
  .admin-data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
  .data-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #eee; }
  .success-message { color: #2ecc71; }
  .error-message { color: #e74c3c; }
`;

export default App;
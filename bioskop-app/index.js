import express from "express";
import mysql from "mysql";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "bioskop_keren",
  port: 3308   
});

db.connect((err) => {
  if (err) {
    console.error("DB ERROR:", err);
    return;
  }
  console.log("Database MySQL Terhubung!");
});


app.post("/api/register", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')";
  db.query(sql, [name, email, password], (err) => {
    if (err) return res.status(500).json({ message: "Gagal register" });
    res.json({ message: "Berhasil daftar!" });
  });
});

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, result) => {
    if (err) return res.status(500).json({ message: "Error server" });
    if (result.length > 0) {
      res.json({ user: result[0], accessToken: "token-ayu-ok" });
    } else {
      res.status(401).json({ message: "Email atau Password salah!" });
    }
  });
});

app.get("/api/movies", (req, res) => {
  db.query("SELECT * FROM movies", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.get("/api/movies/:id", (req, res) => {
  const movieId = req.params.id;
  db.query("SELECT * FROM movies WHERE id = ?", [movieId], (err, movie) => {
    if (err) return res.status(500).send(err);
    db.query("SELECT * FROM schedules WHERE movie_id = ?", [movieId], (err, schedules) => {
      res.json({ ...movie[0], schedules });
    });
  });
});

app.post("/api/movies", (req, res) => {
  const { title, duration, description, image_url } = req.body;
  const sql = "INSERT INTO movies (title, duration, description, image_url) VALUES (?, ?, ?, ?)";
  db.query(sql, [title, duration, description, image_url], (err) => {
    if (err) return res.status(500).json({ message: "Gagal tambah film" });
    res.json({ message: "Film berhasil ditambah!" });
  });
});

app.put("/api/movies/:id", (req, res) => {
  const { title, duration, description, image_url } = req.body;
  const sql = "UPDATE movies SET title=?, duration=?, description=?, image_url=? WHERE id=?";
  db.query(sql, [title, duration, description, image_url, req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Gagal update" });
    res.json({ message: "Film berhasil diupdate!" });
  });
});

app.get("/api/schedules", (req, res) => {
  db.query("SELECT * FROM schedules", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.post("/api/schedules", (req, res) => {
  const { movie_id, show_time, price, theater_name } = req.body;
  const sql = "INSERT INTO schedules (movie_id, show_time, price, theater_name) VALUES (?, ?, ?, ?)";
  db.query(sql, [movie_id, show_time, price, theater_name], (err) => {
    if (err) return res.status(500).json({ message: "Gagal tambah jadwal" });
    res.json({ message: "Jadwal berhasil ditambah!" });
  });
});

app.delete("/api/schedules/:id", (req, res) => {
  db.query("DELETE FROM schedules WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ message: "Gagal hapus" });
    res.json({ message: "Jadwal dihapus!" });
  });
});

app.post("/api/bookings", (req, res) => {
  const { userId, movieTitle, seats, totalPrice, proof_image_url } = req.body;
  const sql = "INSERT INTO bookings (user_id, movie_title, seats, total_price, status, proof_image_url) VALUES (?, ?, ?, ?, 'Pending', ?)";
  
  db.query(sql, [userId, movieTitle, seats, totalPrice, proof_image_url], (err) => {
    if (err) {
      console.error("GAGAL BOOKING:", err);
      return res.status(500).json({ message: "Gagal booking" });
    }
    res.json({ message: "Pemesanan berhasil, tunggu verifikasi!" });
  });
});

app.get("/api/admin/bookings", (req, res) => {
  db.query("SELECT * FROM bookings ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.put("/api/admin/verify-booking/:id", (req, res) => {
  db.query("UPDATE bookings SET status = 'Verified' WHERE id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ message: "Verified!" });
  });
});

app.get("/api/my-tickets/:userId", (req, res) => {
  db.query("SELECT * FROM bookings WHERE user_id = ? ORDER BY id DESC", [req.params.userId], (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3001, () => {
  console.log("🚀 Server berjalan di http://localhost:3001");
});
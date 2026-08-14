import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
import availabilityRoutes from './routes/availability';
app.use('/api', availabilityRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;

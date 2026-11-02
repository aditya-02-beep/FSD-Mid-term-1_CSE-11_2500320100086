const express = require('express');
const app = express();
const books = [];

app.use(express.json());

function findBook(id) {
  return books.find(book => String(book.id) === id);
}

function validBook(book) {
  return (typeof book.id === 'string' || Number.isInteger(book.id)) && String(book.id).trim() &&
    ['title', 'author', 'category'].every(key => typeof book[key] === 'string' && book[key].trim()) &&
    Number.isInteger(book.quantity) && book.quantity >= 0 &&
    Number.isInteger(book.available) && book.available >= 0 &&
    book.available <= book.quantity;
}

app.post('/api/books', (req, res) => {
  const book = { ...req.body };
  if (book.available === undefined) book.available = book.quantity;
  if (!validBook(book)) return res.status(400).json({ error: 'Invalid or missing book details.' });
  if (findBook(String(book.id))) return res.status(409).json({ error: 'Book ID already exists.' });
  books.push(book);
  res.status(201).json(book);
});

app.get('/api/books', (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  res.json(books.filter(book =>
    ['title', 'author', 'category'].some(key => book[key].toLowerCase().includes(q))
  ));
});

app.get('/api/books/:id', (req, res) => {
  const book = findBook(req.params.id);
  book ? res.json(book) : res.status(404).json({ error: 'Book not found.' });
});

app.put('/api/books/:id', (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  const updated = { ...book, ...req.body, id: book.id };
  if (!validBook(updated)) return res.status(400).json({ error: 'Invalid book details.' });
  Object.assign(book, updated);
  res.json(book);
});

app.delete('/api/books/:id', (req, res) => {
  const index = books.findIndex(book => String(book.id) === req.params.id);
  if (index < 0) return res.status(404).json({ error: 'Book not found.' });
  res.json(books.splice(index, 1)[0]);
});

app.post('/api/books/:id/issue', (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  if (book.available === 0) return res.status(400).json({ error: 'No copies available.' });
  book.available--;
  res.json(book);
});

app.post('/api/books/:id/return', (req, res) => {
  const book = findBook(req.params.id);
  if (!book) return res.status(404).json({ error: 'Book not found.' });
  if (book.available === book.quantity) return res.status(400).json({ error: 'All copies are already available.' });
  book.available++;
  res.json(book);
});

app.use((err, req, res, next) => res.status(400).json({ error: 'Invalid JSON.' }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Library API running at http://localhost:${port}`));

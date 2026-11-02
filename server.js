
const express = require('express');
const app = express();

const books = [];

app.use(express.json());

function findBook(id) {
    return books.find(book => String(book.id) === String(id));
}

function validBook(book) {
    return (
        (typeof book.id === 'string' || Number.isInteger(book.id)) &&
        String(book.id).trim() &&
        ['title', 'author', 'category'].every(
            key => typeof book[key] === 'string' && book[key].trim()
        ) &&
        Number.isInteger(book.quantity) &&
        book.quantity >= 0 &&
        Number.isInteger(book.available) &&
        book.available >= 0 &&
        book.available <= book.quantity
    );
}

app.post('/api/books', (req, res) => {
    const book = { ...req.body };

    if (book.available === undefined) {
        book.available = book.quantity;
    }

    if (!validBook(book)) {
        return res.status(400).json({ error: 'Invalid book details.' });
    }

    if (findBook(book.id)) {
        return res.status(409).json({ error: 'Book ID already exists.' });
    }

    books.push(book);
    res.status(201).json(book);
});

app.get('/api/books', (req, res) => {
    const q = (req.query.q || '').toLowerCase();

    const result = books.filter(book =>
        ['title', 'author', 'category'].some(key =>
            book[key].toLowerCase().includes(q)
        )
    );

    res.status(200).json(result);
});

app.get('/api/books/:id', (req, res) => {
    const book = findBook(req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    res.status(200).json(book);
});

app.put('/api/books/:id', (req, res) => {
    const book = findBook(req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    const updated = { ...book, ...req.body, id: book.id };

    if (!validBook(updated)) {
        return res.status(400).json({ error: 'Invalid book details.' });
    }

    Object.assign(book, updated);
    res.status(200).json(book);
});

app.delete('/api/books/:id', (req, res) => {
    const index = books.findIndex(
        book => String(book.id) === req.params.id
    );

    if (index === -1) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    const deleted = books.splice(index, 1);
    res.status(200).json(deleted[0]);
});

app.post('/api/books/:id/issue', (req, res) => {
    const book = findBook(req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    if (book.available === 0) {
        return res.status(400).json({ error: 'No copies available.' });
    }

    book.available--;
    res.status(200).json(book);
});

app.post('/api/books/:id/return', (req, res) => {
    const book = findBook(req.params.id);

    if (!book) {
        return res.status(404).json({ error: 'Book not found.' });
    }

    if (book.available >= book.quantity) {
        return res.status(400).json({
            error: 'All copies are already available.'
        });
    }

    book.available++;
    res.status(200).json(book);
});

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400) {
        return res.status(400).json({ error: 'Invalid JSON.' });
    }

    next(err);
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Library API running at http://localhost:${port}`);
});

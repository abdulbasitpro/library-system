require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const connectDB = require('./config/db');

const books = [
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '978-0132350884',
    category: 'Technology',
    quantity: 5,
    publishedYear: 2008,
    coverImageURL: 'https://m.media-amazon.com/images/I/41xShlnTZTL._SX376_BO1,204,203,200_.jpg',
    description: 'A handbook of agile software craftsmanship that teaches you how to write better code.',
  },
  {
    title: 'Sapiens: A Brief History of Humankind',
    author: 'Yuval Noah Harari',
    isbn: '978-0062316097',
    category: 'History',
    quantity: 8,
    publishedYear: 2011,
    coverImageURL: 'https://m.media-amazon.com/images/I/713jIoMO3UL.jpg',
    description: 'Explores the history of humankind from the Stone Age to the twenty-first century.',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    isbn: '978-0135957059',
    category: 'Technology',
    quantity: 3,
    publishedYear: 1999,
    coverImageURL: 'https://m.media-amazon.com/images/I/41as+49FOKL._SX395_BO1,204,203,200_.jpg',
    description: 'One of the most significant books in software development, covering technical and professional topics.',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    isbn: '978-0735211292',
    category: 'Self-Help',
    quantity: 12,
    publishedYear: 2018,
    coverImageURL: 'https://m.media-amazon.com/images/I/51-nXsSRfZL._SX328_BO1,204,203,200_.jpg',
    description: 'An easy and proven way to build good habits and break bad ones.',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    isbn: '978-0743273565',
    category: 'Literature',
    quantity: 6,
    publishedYear: 1925,
    coverImageURL: 'https://m.media-amazon.com/images/I/71FTb9X6wjL.jpg',
    description: 'A classic novel set in the Roaring Twenties that explores themes of wealth and social status.',
  },
  {
    title: 'Deep Learning',
    author: 'Ian Goodfellow',
    isbn: '978-0262035613',
    category: 'Technology',
    quantity: 4,
    publishedYear: 2016,
    coverImageURL: 'https://m.media-amazon.com/images/I/6166m-eY9IL.jpg',
    description: 'A comprehensive guide to deep learning, covering mathematical foundations and modern techniques.',
  },
  {
    title: 'The Alchemist',
    author: 'Paulo Coelho',
    isbn: '978-0062315007',
    category: 'Fiction',
    quantity: 10,
    publishedYear: 1988,
    coverImageURL: 'https://m.media-amazon.com/images/I/51Z0nLAfLmL.jpg',
    description: 'A mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of worldly treasure.',
  },
  {
    title: 'Brief Answers to the Big Questions',
    author: 'Stephen Hawking',
    isbn: '978-1473695986',
    category: 'Science',
    quantity: 7,
    publishedYear: 2018,
    coverImageURL: 'https://m.media-amazon.com/images/I/91NAr8W84tL.jpg',
    description: "Hawking's final book, addressing the greatest mysteries of the universe.",
  },
  {
    title: 'Meditations',
    author: 'Marcus Aurelius',
    isbn: '978-0140449334',
    category: 'Philosophy',
    quantity: 9,
    publishedYear: 180,
    coverImageURL: 'https://m.media-amazon.com/images/I/51A9Uu6U6YL.jpg',
    description: 'The private reflections of the Roman Emperor on Stoic philosophy.',
  },
  {
    title: 'Thinking, Fast and Slow',
    author: 'Daniel Kahneman',
    isbn: '978-0374275631',
    category: 'Science',
    quantity: 5,
    publishedYear: 2011,
    coverImageURL: 'https://m.media-amazon.com/images/I/41shf0+UeLL._SX332_BO1,204,203,200_.jpg',
    description: 'Explores the two systems that drive the way we think—fast, intuitive, and slow, logical.',
  },
  {
    title: 'Zero to One',
    author: 'Peter Thiel',
    isbn: '978-0804139298',
    category: 'Business',
    quantity: 6,
    publishedYear: 2014,
    coverImageURL: 'https://m.media-amazon.com/images/I/71mU3As6S0L.jpg',
    description: 'Notes on startups, or how to build the future.',
  },
  {
    title: 'Dune',
    author: 'Frank Herbert',
    isbn: '978-0441172719',
    category: 'Fiction',
    quantity: 4,
    publishedYear: 1965,
    coverImageURL: 'https://m.media-amazon.com/images/I/817-Vri9m1L.jpg',
    description: 'A science fiction masterpiece set on the desert planet Arrakis.',
  },
  {
    title: '1984',
    author: 'George Orwell',
    isbn: '978-0451524935',
    category: 'Fiction',
    quantity: 15,
    publishedYear: 1949,
    coverImageURL: 'https://m.media-amazon.com/images/I/71kxa1-0mfL.jpg',
    description: 'A dystopian novel depicting life under a totalitarian regime.',
  },
  {
    title: 'The Lean Startup',
    author: 'Eric Ries',
    isbn: '978-0307887894',
    category: 'Business',
    quantity: 8,
    publishedYear: 2011,
    coverImageURL: 'https://m.media-amazon.com/images/I/81-QB7nDh4L.jpg',
    description: 'A new approach being adopted across the globe, changing the way companies are built.',
  },
  {
    title: 'Educated',
    author: 'Tara Westover',
    isbn: '978-0399590504',
    category: 'Biography',
    quantity: 5,
    publishedYear: 2018,
    coverImageURL: 'https://m.media-amazon.com/images/I/81WojUxbbFL.jpg',
    description: 'A memoir about a woman born to survivalists in the mountains of Idaho.',
  },
  {
    title: 'The Selfish Gene',
    author: 'Richard Dawkins',
    isbn: '978-0198788607',
    category: 'Science',
    quantity: 4,
    publishedYear: 1976,
    coverImageURL: 'https://m.media-amazon.com/images/I/815m297-ZXL.jpg',
    description: 'A classic work on evolutionary biology, introducing the gene-centered view of evolution.',
  },
  {
    title: 'Crime and Punishment',
    author: 'Fyodor Dostoevsky',
    isbn: '978-0140449136',
    category: 'Literature',
    quantity: 3,
    publishedYear: 1866,
    coverImageURL: 'https://m.media-amazon.com/images/I/71O2XI6tdDL.jpg',
    description: 'A psychological thriller exploring the mental anguish of a murderer.',
  },
  {
    title: 'Start with Why',
    author: 'Simon Sinek',
    isbn: '978-1591846444',
    category: 'Business',
    quantity: 6,
    publishedYear: 2009,
    coverImageURL: 'https://m.media-amazon.com/images/I/71QUwvzpBFL.jpg',
    description: 'Shows how leaders who inspire everyone around them all think, act, and communicate the same way.',
  },
  {
    title: "The Subtle Art of Not Giving a F*ck",
    author: 'Mark Manson',
    isbn: '978-0062457714',
    category: 'Self-Help',
    quantity: 11,
    publishedYear: 2016,
    coverImageURL: 'https://m.media-amazon.com/images/I/71QKQ9mwV7L.jpg',
    description: 'A counterintuitive approach to living a good life.',
  },
  {
    title: 'Steve Jobs',
    author: 'Walter Isaacson',
    isbn: '978-1451648539',
    category: 'Biography',
    quantity: 4,
    publishedYear: 2011,
    coverImageURL: 'https://m.media-amazon.com/images/I/81VStS3XYZL.jpg',
    description: 'The exclusive biography of the Apple co-founder based on more than forty interviews.',
  },
  {
    title: 'The Republic',
    author: 'Plato',
    isbn: '978-0140449143',
    category: 'Philosophy',
    quantity: 5,
    publishedYear: null, // Ancient text — no year stored
    coverImageURL: 'https://m.media-amazon.com/images/I/71uM-k6yIEL.jpg',
    description: 'A Socratic dialogue concerning justice and the order of the just city-state.',
  },
  {
    title: 'Matilda',
    author: 'Roald Dahl',
    isbn: '978-0142410370',
    category: 'Children',
    quantity: 10,
    publishedYear: 1988,
    coverImageURL: 'https://m.media-amazon.com/images/I/81pInzS9fEL.jpg',
    description: 'The story of an extraordinary girl with a magical mind.',
  },
  {
    title: 'Guns, Germs, and Steel',
    author: 'Jared Diamond',
    isbn: '978-0393317558',
    category: 'History',
    quantity: 3,
    publishedYear: 1997,
    coverImageURL: 'https://m.media-amazon.com/images/I/81S88T9E6vL.jpg',
    description: 'Explains why Eurasian civilizations have survived and conquered others.',
  },
  {
    title: "You Don't Know JS",
    author: 'Kyle Simpson',
    isbn: '978-1491904244',
    category: 'Technology',
    quantity: 14,
    publishedYear: 2014,
    coverImageURL: 'https://m.media-amazon.com/images/I/71mKzh62mFL.jpg',
    description: 'A series of books diving deep into the core mechanisms of the JavaScript language.',
  },
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0060935467',
    category: 'Literature',
    quantity: 8,
    publishedYear: 1960,
    coverImageURL: 'https://m.media-amazon.com/images/I/81gepf1eMqL.jpg',
    description: 'A powerful coming-of-age story set in the American South.',
  },
  {
    title: 'Python Crash Course',
    author: 'Eric Matthes',
    isbn: '978-1593279288',
    category: 'Technology',
    quantity: 9,
    publishedYear: 2015,
    coverImageURL: 'https://m.media-amazon.com/images/I/81VM66W6O6L.jpg',
    description: 'A fast-paced, thorough introduction to Python that will have you writing programs in no time.',
  },
  {
    title: 'The Diary of a Young Girl',
    author: 'Anne Frank',
    isbn: '978-0553296983',
    category: 'Biography',
    quantity: 12,
    publishedYear: 1947,
    coverImageURL: 'https://m.media-amazon.com/images/I/91p-s6IscUL.jpg',
    description: 'The diary kept by Anne Frank while she was in hiding for two years during the Nazi occupation.',
  },
  {
    title: "Man's Search for Meaning",
    author: 'Viktor Frankl',
    isbn: '978-0807014295',
    category: 'Philosophy',
    quantity: 6,
    publishedYear: 1946,
    coverImageURL: 'https://m.media-amazon.com/images/I/61NlMh6S9iL.jpg',
    description: 'A memoir by a psychiatrist and Holocaust survivor detailing his pursuit of meaning.',
  },
  {
    title: 'Brave New World',
    author: 'Aldous Huxley',
    isbn: '978-0060850524',
    category: 'Fiction',
    quantity: 7,
    publishedYear: 1932,
    coverImageURL: 'https://m.media-amazon.com/images/I/81zE42rjSXL.jpg',
    description: 'A dystopian novel set in a futuristic World State, inhabited by genetically modified citizens.',
  },
  {
    title: 'The Hobbit',
    author: 'J.R.R. Tolkien',
    isbn: '978-0547928227',
    category: 'Fiction',
    quantity: 10,
    publishedYear: 1937,
    coverImageURL: 'https://m.media-amazon.com/images/I/91b0C2YNSrL.jpg',
    description: 'Bilbo Baggins, a hobbit, is whisked away into a quest to reclaim a lost kingdom.',
  },
];

const seed = async () => {
  await connectDB();
  console.log('\n🌱  Seeding books...\n');

  let inserted = 0;
  let skipped = 0;

  for (const bookData of books) {
    const existing = await Book.findOne({ isbn: bookData.isbn });
    if (existing) {
      console.log(`  ⏭  Skipped  (already exists): "${bookData.title}"`);
      skipped++;
      continue;
    }

    // availableCopies will be auto-set by the pre-save hook
    await Book.create(bookData);
    console.log(`  ✅  Inserted: "${bookData.title}"`);
    inserted++;
  }

  console.log(`\n✅  Done! Inserted: ${inserted}  |  Skipped: ${skipped}\n`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});

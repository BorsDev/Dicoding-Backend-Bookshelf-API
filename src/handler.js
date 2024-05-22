const { nanoid } = require("nanoid");
const books = require("./books");

const addBook = async (req, h) => {
  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  //request data
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;

  // name is required
  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal menambahkan buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  // if readPage > pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  // new book data
  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished: pageCount === readPage ? true : false,
    reading,
    insertedAt,
    updatedAt,
  };

  try {
    books.push(newBook);

    const response = h.response({
      status: "success",
      message: "Buku berhasil ditambahkan",
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  } catch (error) {
    const response = h.response({
      status: "fail",
      message: "Internal server error",
    });
    console.error(error);
    response.code(500);
    return response;
  }
};

const getAllBooks = async (req, h) => {
  // query params
  const { name, reading, finished } = req.query;

  const queryFilter = (book) => {
    let matches = true;

    if (name) {
      matches = matches && book.name.toLowerCase().includes(name.toLowerCase());
    }

    if (reading !== undefined) {
      const readingBool = reading === "1";
      matches = matches && book.reading === readingBool;
    }

    if (finished !== undefined) {
      const finishedBool = finished === "1";
      matches = matches && book.finished === finishedBool;
    }

    return matches;
  };

  const remapping = (book) => {
    return { id: book.id, name: book.name, publisher: book.publisher };
  };

  const data = books.filter(queryFilter).map(remapping);
  const response = h.response({
    status: "success",
    data: {
      books: data ? data : [],
    },
  });
  response.code(200);
  return response;
};

const getBookById = async (req, h) => {
  const { id } = req.params;
  const book = books.filter((n) => n.id === id)[0];

  if (!book) {
    const response = h.response({
      status: "fail",
      message: "Buku tidak ditemukan",
    });
    response.code(404);
    return response;
  }

  const response = h.response({
    status: "success",
    data: { book: book },
  });
  response.code(200);
  return response;
};

const editBookById = async (req, h) => {
  const { id } = req.params;
  //request data
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = req.payload;

  const updatedAt = new Date().toISOString();

  // name is required
  if (!name) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Mohon isi nama buku",
    });
    response.code(400);
    return response;
  }

  // if readPage > pageCount
  if (readPage > pageCount) {
    const response = h.response({
      status: "fail",
      message:
        "Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount",
    });
    response.code(400);
    return response;
  }

  // validate book existance
  const bookIndex = books.findIndex((note) => note.id === id);

  // if book not exist
  if (bookIndex == -1) {
    const response = h.response({
      status: "fail",
      message: "Gagal memperbarui buku. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }

  // uppdate book info
  const updatedBook = {
    ...books[bookIndex],
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
    finished: pageCount === readPage ? true : false,
  };
  books[bookIndex] = updatedBook;

  const response = h.response({
    status: "success",
    message: "Buku berhasil diperbarui",
  });
  response.code(200);
  return response;
};

const deleteBookById = async (req, h) => {
  const { id } = req.params;
  const bookIndex = books.findIndex((book) => book.id === id);
  // if book not exist
  if (bookIndex == -1) {
    const response = h.response({
      status: "fail",
      message: "Buku gagal dihapus. Id tidak ditemukan",
    });
    response.code(404);
    return response;
  }
  books.splice(bookIndex, 1);

  const response = h.response({
    status: "success",
    message: "Buku berhasil dihapus",
  });
  response.code(200);
  return response;
};

module.exports = {
  addBook,
  getAllBooks,
  getBookById,
  editBookById,
  deleteBookById,
};

const books = [];
const RENDER_EVENT = 'render-book';
const SAVED_EVENT = 'saved-book';

const STORAGE_KEY = 'BOOKSHELF_APPS';

const submitForm = document.getElementById('inputBook');
const element = document.querySelector('#bookSubmit span');

document.addEventListener('DOMContentLoaded', function () {
  submitForm.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  if (isStorageExist) {
    loadDataFromStorage();
  }
});

const isComplete = document.getElementById('inputBookIsComplete');
isComplete.addEventListener('click', function () {
  if (isComplete.checked) {
    element.innerText = 'Selesai di baca';
  } else {
    element.innerText = 'Belum selesai dibaca';
  }
});

function addBook() {
  const title = document.getElementById('inputBookTitle').value;
  const author = document.getElementById('inputBookAuthor').value;
  const year = parseInt(document.getElementById('inputBookYear').value);

  const generatedId = generateId();
  const bookObject = generateBookObject(generatedId, title, author, year, isComplete.checked);
  books.push(bookObject);

  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();

  submitForm.reset();
  element.innerText = 'Belum selesai dibaca';
}

function generateId() {
  return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
}

document.addEventListener(RENDER_EVENT, function () {
  const incompleteBookshelfList = document.getElementById('incompleteBookshelfList');
  incompleteBookshelfList.innerHTML = '';

  const completeBookshelfList = document.getElementById('completeBookshelfList');
  completeBookshelfList.innerHTML = '';

  for (const bookObject of books) {
    const bookElement = makeBook(bookObject);

    if (bookObject.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
});

const modal = document.getElementById('alert-modal');
const modalClose = document.getElementsByClassName('close')[0];

modalClose.addEventListener('click', function () {
  modal.style.display = 'none';
});

function makeBook(bookObject) {
  const bookTitle = document.createElement('h3');
  bookTitle.innerText = bookObject.title;

  const bookAuthor = document.createElement('p');
  bookAuthor.innerText = bookObject.author;

  const bookYear = document.createElement('p');
  bookYear.innerText = bookObject.year;

  const action = document.createElement('div');
  action.classList.add('action');

  const green = document.createElement('button');
  green.classList.add('green');

  const red = document.createElement('button');
  red.classList.add('red');
  red.innerText = 'Hapus buku';

  red.addEventListener('click', function () {
    modal.style.display = 'block';

    const removeYes = document.querySelector('.modal .modal-content .action #yes');
    removeYes.addEventListener('click', function () {
      modal.style.display = 'none';
      removeBook(bookObject.id);
    });

    const removeNo = document.querySelector('.modal .modal-content .action #no');
    removeNo.addEventListener('click', function () {
      modal.style.display = 'none';
    });
  });

  const bookItem = document.createElement('article');
  bookItem.classList.add('book_item');
  bookItem.append(bookTitle, bookAuthor, bookYear, action);

  bookItem.setAttribute('id', `book-${bookObject.id}`);

  if (bookObject.isComplete) {
    green.innerText = 'Belum selesai di Baca';
    green.addEventListener('click', function () {
      undoBookToComplete(bookObject.id);
    });

    action.append(green, red);
  } else {
    green.innerText = 'Selesai dibaca';
    green.addEventListener('click', function () {
      addBookToComplete(bookObject.id);
    });

    action.append(green, red);
  }

  return bookItem;
}

function findBook(bookId) {
  for (const bookItem of books) {
    if (bookId === bookItem.id) {
      return bookItem;
    }
  }

  return null;
}

function findBookIndex(bookId) {
  console.log(bookId);
  for (const i in books) {
    if (bookId === books[i].id) {
      return i;
    }
  }

  return null;
}

function addBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

document.getElementById('searchBook').addEventListener('submit', function (event) {
  event.preventDefault();
  const searchBooK = document.getElementById('searchBookTitle').value.toLowerCase();
  const bookItem = document.querySelectorAll('.book_item');
  for (const books of bookItem) {
    const title = books.firstElementChild.innerText.toLowerCase();
    if (title.includes(searchBooK)) {
      books.style.display = 'block';
    } else {
      books.style.display = 'none';
    }
  }
});

function undoBookToComplete(bookId) {
  const bookTarget = findBook(bookId);

  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function removeBook(bookId) {
  const bookTarget = findBookIndex(bookId);

  if (bookTarget === -1) return;

  books.splice(bookTarget, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
}

function isStorageExist() {
  if (typeof Storage === undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return;
  }

  return true;
}

document.addEventListener(SAVED_EVENT, function () {
  console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function saveData() {
  if (isStorageExist) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
}

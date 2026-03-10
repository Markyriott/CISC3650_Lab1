// Add an object containing all of the books. Indexed.
// Create Maps for sorting?  (title, author, genre, reading status, rating, )

// currently reading
// to read
// read

const Status = Object.freeze({
    R : "Read",
    CR : "Currently reading",
    TR : "To read"
})

const books = {
    1 : {
        "title" : "The Left Hand Of Darkness",
        "author" : "Ursula K. Le Guin",
        "genre" : "Science Fiction",
        "status" : Status.CR,
        "rating" : 0,
        "liked" : false,
        "image" : "https://m.media-amazon.com/images/I/91AMkAkM6eL._AC_UF1000,1000_QL80_.jpg"
    },
    2 : {
        "title" : "The Dispossessed",
        "author" : "Ursula K. Le Guin",
        "genre" : "Science Fiction",
        "status" : Status.TR,
        "rating" : 0,
        "liked" : false,
        "image" : "https://m.media-amazon.com/images/I/91v+uOTqnzL._AC_UF1000,1000_QL80_.jpg"
    },
    3 : {
        "title" : "One Hundred Years Of Solitude",
        "author" : "Gabriel Garcia Marquez",
        "genre" : "Magical Realism",
        "status" : Status.R,
        "rating" : 5,
        "liked" : true,
        "image" : "https://m.media-amazon.com/images/I/81dy4cfPGuL._AC_UF1000,1000_QL80_.jpg"
    },
    4 : {
        "title" : "A Psalm For The Wild-Built",
        "author" : "Becca Chambers",
        "genre" : "Science Fiction",
        "status" : Status.R,
        "rating" : 3,
        "liked" : true,
        "image" : "https://m.media-amazon.com/images/I/91IHbrVsM4L._UF1000,1000_QL80_.jpg"
    }
}

var booksIndex = 5;

const tooltipTriggerList = document.querySelectorAll("[data-bs-toggle='tooltip']");
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));

const addBook = () => {
    const title = document.getElementById("bookTitle").value;
    const author = document.getElementById("bookAuthor").value;
    const genre = document.getElementById("bookGenre").value;
    const status = document.getElementById("bookStatus").value;

    
    const modalEl = document.getElementById("addModal");
    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    bsModal.hide();
    document.getElementById("addForm").reset();

    console.log("adding book", { title, author, genre, status });

    books[++booksIndex] = {"title" : title, "author" : author, "genre" : [genre], "status" : status, "rating" : 0, "liked" : false, "image" : ""};
    
    fetchBookCover(title, author).then(coverUrl =>{
        books[booksIndex].image = coverUrl;
        // Update the card image if it exists
        const card = document.querySelector(`.book-card[id="${booksIndex}"]`);
        if (card) {
            const img = card.querySelector("img");
            if (img && coverUrl) img.src = coverUrl;
        }
    });

    const card = createBookCard(booksIndex);
    const container = document.querySelector(".row.row-col");
    container.appendChild(card);
}

const removeBook = (id) => {
    delete books[id];
    const bookCard = document.getElementById(id);
    bookCard.remove();
    const modalEl = document.getElementById("removeModal");
    const bsModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    bsModal.hide();
}

const updateReadingStatus = (bookId, newStatus) => {
    books[bookId].status = newStatus;
    const card = document.getElementById(bookId);
    const ratingDiv = card.querySelector(`#rating-options-${bookId}`);
    if (newStatus === "Read") {
        confetti();
        ratingDiv.className = "d-flex mt-1";
    } else {
        ratingDiv.className = "d-flex mt-2 d-none";
    }
}

const updateRating = (bookId, newRating) => {
    books[bookId].rating = parseInt(newRating);
}

const updateLiked = (bookId, isLiked) => {
    books[bookId].liked = isLiked;
}

const searchFilterBooks = (searchTerm) => {
    const cards = document.querySelectorAll(".book-card");
    cards.forEach(card => {
        const title = card.querySelector(".card-title").textContent.toLowerCase();
        const author = card.querySelector(".card-text").textContent.toLowerCase();
        if (title.includes(searchTerm.toLowerCase()) || author.includes(searchTerm.toLowerCase())) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

const sortBooks = (option) => {
    const container = document.querySelector('.row.row-col');
    const cards = Array.from(container.querySelectorAll('.book-card'));
    cards.sort((a, b) => {
        const idA = a.id;
        const idB = b.id;
        const bookA = books[idA];
        const bookB = books[idB];
        if (option === 'title') {
            return bookA.title.localeCompare(bookB.title);
        } else if (option === 'author') {
            return bookA.author.localeCompare(bookB.author);
        }
    });
    cards.forEach(card => container.appendChild(card));
}

const filterByAttribute = (filterType, filterValue) => {
    const cards = document.querySelectorAll(".book-card");
    cards.forEach(card => {
        const bookId = card.id;
        const book = books[bookId];
        let shouldDisplay = false;
        if (filterType === "all") {
            shouldDisplay = true;
        } else if (filterType === "status") {
            shouldDisplay = book.status === filterValue;
        } else if (filterType === "genre") {
            shouldDisplay = book.genre.includes(filterValue);
        }
        card.style.display = shouldDisplay ? "" : "none";
    });
}

const fetchBookCover = async (title, author) => {
    const query = `${title} ${author}`;
    const apiKey = 'AIzaSyD_Zy0d3Jm8SvXh-HHTyLfxNNOm3o5EPMA';
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.items && data.items.length > 0){
            const imageUrl = data.items[0].volumeInfo.imageLinks?.thumbnail;
            return imageUrl || "https://media.cheggcdn.com/media/8f8/8f8d8ae8-36b5-447e-947c-076618279a3d/php1KnYTm";
        }
    } catch (error) {
        console.error('Error fetching cover', error);
        return "https://media.cheggcdn.com/media/8f8/8f8d8ae8-36b5-447e-947c-076618279a3d/php1KnYTm";
    }
}

const createBookCard = (bookId) =>{
    const book = books[bookId];

    const cardDiv = document.createElement("div");
    cardDiv.className = "card book-card mx-auto mx-lg-1";
    cardDiv.id = `${bookId}`;

    const cardBody = document.createElement("div");
    cardBody.className = "card-body d-flex";

    const img = document.createElement("img");
    img.src = book.image;
    img.width = 90;
    img.height = 130;
    img.className = "book-cover me-2";
    img.alt = book.title;

    const textDiv = document.createElement("div");
    textDiv.className = "text-truncate";

    const titleH5 = document.createElement("h5");
    titleH5.className = "card-title mb-1 text-truncate";
    titleH5.textContent = book.title;

    const authorP = document.createElement("p");
    authorP.className = "card-text mb-1 text-muted";
    authorP.textContent = book.author;

    const statusLabel = document.createElement("label");
    statusLabel.setAttribute("for", `statusSelect-${bookId}`);
    statusLabel.textContent = "Status:";
    statusLabel.className = "me-1";

    const statusSelect = document.createElement("select");
    statusSelect.id = `statusSelect-${bookId}`;
    statusSelect.className = "mt-3 me-1 form-select-sm";

    const options = ["To read", "Currently reading", "Read"];
    options.forEach(opt => {
        const optionEl = document.createElement("option");
        optionEl.value = opt;
        optionEl.textContent = opt;
        if (opt === book.status) optionEl.selected = true;
        statusSelect.appendChild(optionEl);
    });

    const trashButton = document.createElement("button");
    trashButton.className = "ms-2 btn d-inline-flex";
    trashButton.type = "button";
    trashButton.setAttribute("data-bs-toggle", "modal");
    trashButton.setAttribute("data-bs-target", "#removeModal");
    trashButton.setAttribute("data-bs-bookId", bookId);

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", "1em");
    svg.setAttribute("fill", "currentColor");
    svg.classList.add("bi", "bi-trash3-fill", "fs-4", "btn-outline-danger");
    svg.setAttribute("viewBox", "0 0 16 16");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5m-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5M4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06m6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528M8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5");
    svg.appendChild(path);

    trashButton.appendChild(svg);

    const ratingDiv = document.createElement("div");
    ratingDiv.className = book.status == "Read" ? "d-flex mt-1" : "d-flex mt-2 d-none";
    ratingDiv.id = `rating-options-${bookId}`;

    const ratingLabel = document.createElement("label");
    ratingLabel.className = "me-1";
    ratingLabel.setAttribute("for", `rating-${bookId}`);
    ratingLabel.textContent = "Rating:";

    const ratingSelect = document.createElement("select");
    ratingSelect.id = `rating-${bookId}`;
    ratingSelect.className = "form-select-sm w-30 me-1";

    for (let i = 1; i <= 5; i++) {
        const opt = document.createElement("option");
        opt.value = i;
        opt.textContent = i;
        if (i === book.rating) opt.selected = true;
        ratingSelect.appendChild(opt);
    }

    ratingSelect.addEventListener('change', (e) => {
        updateRating(bookId, e.target.value);
    });

    const starDiv = document.createElement("div");
    starDiv.className = "me-2";

    const starSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    starSvg.setAttribute("xmlns", "http://www.w3.org/2000/starSvg");
    starSvg.setAttribute("width", "16");
    starSvg.setAttribute("height", "16");
    starSvg.setAttribute("fill", "gold");
    starSvg.classList.add("bi", "bi-star-fill");
    starSvg.setAttribute("viewBox", "0 0 16 16");

    const starPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    starPath.setAttribute("d", "M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z")
    starSvg.appendChild(starPath);

    starDiv.appendChild(starSvg);

    const likeLabel = document.createElement("label");
    likeLabel.className = "me-1";
    likeLabel.setAttribute("for", `liked-${bookId}`);
    likeLabel.textContent = "Like:";

    const likeInput = document.createElement("input");
    likeInput.className = "ms-0 form-check-input";
    likeInput.type = "checkbox";
    likeInput.id = `liked-${bookId}`;
    likeInput.checked = book.liked;

    likeInput.addEventListener("change", (e) => {
        updateLiked(bookId, e.target.checked);
    });

    ratingDiv.appendChild(ratingLabel);
    ratingDiv.appendChild(ratingSelect);
    ratingDiv.appendChild(starDiv);
    ratingDiv.appendChild(likeLabel);
    ratingDiv.appendChild(likeInput);

    textDiv.appendChild(titleH5);
    textDiv.appendChild(authorP);
    textDiv.appendChild(statusLabel);
    textDiv.appendChild(statusSelect);

    statusSelect.addEventListener("change", (e) => {
        updateReadingStatus(bookId, e.target.value);
    });

    textDiv.appendChild(trashButton);
    textDiv.appendChild(ratingDiv);

    cardBody.appendChild(img);
    cardBody.appendChild(textDiv);

    cardDiv.appendChild(cardBody);

    return cardDiv;
}

const seedBooks = () => {
    const container = document.querySelector(".row.row-col");
    Object.keys(books).forEach(id => {
        const card = createBookCard(id);
        container.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    seedBooks();
    const addForm = document.getElementById("addForm");
    if (addForm) {
        addForm.addEventListener("submit", function (e) {
            e.preventDefault();
            addBook();
        });
    }

    const removeModal = document.getElementById("removeModal");
    if (removeModal){
        removeModal.addEventListener("show.bs.modal", event => {
            const button = event.relatedTarget;
            const id = button.getAttribute("data-bs-bookId");
            const modalTitle = removeModal.querySelector(".modal-title");
            modalTitle.textContent = `Remove ${books[id].title}?`;
            const deleteButton = document.getElementById("removeModalButton");
            deleteButton.onclick = () => removeBook(id);
        })
    }

    const searchInput = document.querySelector("input[type='search']");
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchFilterBooks(e.target.value);
        });
    }

    document.querySelectorAll(".dropdown-item[data-sort]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const sortBy = e.target.getAttribute("data-sort");
            sortBooks(sortBy);
        });
    });

    document.querySelectorAll(".dropdown-item[data-filter]").forEach(item => {
        item.addEventListener("click", (e) => {
            e.preventDefault();
            const filterType = e.target.getAttribute("data-filter");
            const filterValue = e.target.getAttribute("data-filter-value");
            if (filterType === "all") {
                filterByAttribute("all");
            } else {
                filterByAttribute(filterType, filterValue);
            }
        });
    });
});


let currentPage = 1;
let totalPages = parseInt(localStorage.getItem("totalPages")) || 1;

// Funkcja do pobierania zakresu dla aktualnej strony
function getPageRange(page) {
  const startNumber = localStorage.getItem(`startNumber-page-${page}`) || 1;
  const endNumber = localStorage.getItem(`endNumber-page-${page}`) || 10;
  return {
    startNumber: parseInt(startNumber),
    endNumber: parseInt(endNumber),
  };
}

// Funkcja do pobierania nazwy dla aktualnej strony
function getPageName(page) {
  return localStorage.getItem(`pageName-page-${page}`) || `Strona ${page}`;
}

// Funkcja do zapisywania nazwy dla aktualnej strony
function savePageName(page, name) {
  localStorage.setItem(`pageName-page-${page}`, name);
}

// Funkcja do zapisywania zakresu dla aktualnej strony
function savePageRange(page, startNumber, endNumber) {
  localStorage.setItem(`startNumber-page-${page}`, startNumber);
  localStorage.setItem(`endNumber-page-${page}`, endNumber);
}

// Funkcja generująca divy na podstawie zakresu
function generateCheckboxes(startNumber, endNumber) {
  const container = document.getElementById("checkboxContainer");
  container.innerHTML = ""; // Czyszczenie kontenera

  for (let i = startNumber; i <= endNumber; i++) {
    const div = document.createElement("div");
    div.classList.add("checkbox-item");
    div.textContent = i; // Numer divu

    const currentState = localStorage.getItem(
      `checkbox-${i}-page-${currentPage}`
    );
    // Ustawiamy odpowiedni kolor na podstawie zapisanego stanu
    div.style.backgroundColor = currentState || "red";

    div.addEventListener("click", () => {
      // Zmieniamy kolor na kolejny w cyklu (czerwony -> pomarańczowy -> zielony)
      let currentColor = div.style.backgroundColor;
      if (currentColor === "red") {
        div.style.backgroundColor = "orange";
      } else if (currentColor === "orange") {
        div.style.backgroundColor = "green";
      } else {
        div.style.backgroundColor = "red";
      }

      // Zapisujemy nowy stan koloru
      localStorage.setItem(
        `checkbox-${i}-page-${currentPage}`,
        div.style.backgroundColor
      );

      // Aktualizacja licznika
      updateCounter();
    });

    container.appendChild(div);
  }

  // Aktualizacja licznika po wygenerowaniu checkboxów
  updateCounter();
  generatePageNavigation();
}

// Funkcja do czyszczenia zaznaczeń (ustawiamy na czerwono)
function clearCheckboxes() {
  const divs = document.querySelectorAll("#checkboxContainer .checkbox-item");
  divs.forEach((div) => {
    div.style.backgroundColor = "red"; // Resetowanie koloru
    localStorage.setItem(
      `checkbox-${div.textContent}-page-${currentPage}`,
      "red" // Resetowanie stanu w localStorage
    );
  });
  updateCounter(); // Aktualizacja licznika po wyczyszczeniu zaznaczeń
}

// Funkcja do aktualizowania licznika zaznaczonych divów
function updateCounter() {
  const divs = document.querySelectorAll("#checkboxContainer .checkbox-item");
  const checkedCount = Array.from(divs).filter(
    (div) => div.style.backgroundColor === "green"
  ).length;
  const totalCount = divs.length;

  // Obliczenie procentu zaznaczonych divów
  const percentChecked =
    totalCount > 0 ? ((checkedCount / totalCount) * 100).toFixed(2) : 0;

  // Aktualizacja treści w liczniku
  const counterDiv = document.getElementById("counter");
  counterDiv.textContent = `Zaznaczone: ${checkedCount} na ${totalCount} (${percentChecked}%)`;
}

// Funkcja do generowania nawigacji stron
function generatePageNavigation() {
  const navigation = document.getElementById("navigation");
  navigation.innerHTML = ""; // Czyścimy nawigację

  for (let i = 1; i <= totalPages; i++) {
    const pageButton = document.createElement("button");
    const pageName = getPageName(i); // Pobieramy nazwę strony
    pageButton.textContent = pageName; // Ustawiamy nazwę strony jako etykietę przycisku
    if (i === currentPage) {
      pageButton.classList.add("active"); // Oznaczamy aktywną stronę
    }
    pageButton.addEventListener("click", () => {
      currentPage = i;
      loadPage(currentPage); // Załaduj stronę przy zmianie
    });
    navigation.appendChild(pageButton);
  }
}

// Funkcja do ładowania strony z odpowiednim zakresem
function loadPage(page) {
  const { startNumber, endNumber } = getPageRange(page);
  document.getElementById("startNumber").value = startNumber;
  document.getElementById("endNumber").value = endNumber;
  document.getElementById("pageTitle").textContent = getPageName(page); // Ustawienie tytułu strony
  generateCheckboxes(startNumber, endNumber);
}

// Funkcja inicjalizująca
function init() {
  const startNumberInput = document.getElementById("startNumber");
  const endNumberInput = document.getElementById("endNumber");
  const clearBtn = document.getElementById("clearCheckboxes");
  const pageNameInput = document.getElementById("pageName");
  const addPageBtn = document.getElementById("addPage");
  const deletePageBtn = document.getElementById("deletePage");

  // Inicjalizacja totalPages i currentPage
  totalPages = parseInt(localStorage.getItem("totalPages")) || 1;
  currentPage = parseInt(localStorage.getItem("currentPage")) || 1;

  // Wczytaj stronę
  loadPage(currentPage);

  // Zainicjalizuj pole na nazwę strony
  pageNameInput.value = getPageName(currentPage);

  // Obsługa zmiany zakresu numerowania
  startNumberInput.addEventListener("input", () => {
    const startNumber = parseInt(startNumberInput.value);
    const endNumber = parseInt(endNumberInput.value);
    savePageRange(currentPage, startNumber, endNumber);
    generateCheckboxes(startNumber, endNumber);
  });

  endNumberInput.addEventListener("input", () => {
    const startNumber = parseInt(startNumberInput.value);
    const endNumber = parseInt(endNumberInput.value);
    savePageRange(currentPage, startNumber, endNumber);
    generateCheckboxes(startNumber, endNumber);
  });

  // Obsługa przycisku czyszczącego checkboxy
  clearBtn.addEventListener("click", clearCheckboxes);

  // Obsługa dodawania nowej strony
  addPageBtn.addEventListener("click", () => {
    totalPages++;
    localStorage.setItem("totalPages", totalPages);
    currentPage = totalPages;
    savePageName(currentPage, `Strona ${currentPage}`); // Ustaw domyślną nazwę
    loadPage(currentPage);
  });

  // Obsługa usuwania aktualnej strony
  deletePageBtn.addEventListener("click", () => {
    if (totalPages > 1) {
      const { startNumber, endNumber } = getPageRange(currentPage);
      for (let i = startNumber; i <= endNumber; i++) {
        localStorage.removeItem(`checkbox-${i}-page-${currentPage}`);
      }

      totalPages--;
      localStorage.setItem("totalPages", totalPages);
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }
      loadPage(currentPage);
    }
  });

  // Obsługa zmiany nazwy strony
  pageNameInput.addEventListener("input", () => {
    const newName = pageNameInput.value;
    savePageName(currentPage, newName); // Zapisz nową nazwę w localStorage
    document.getElementById("pageTitle").textContent = newName; // Zaktualizuj tytuł
    generatePageNavigation(); // Zaktualizuj nawigację
  });
}

// Inicjalizacja strony
window.onload = function () {
  if (window.location.search) {
    loadStateFromURL();
  } else {
    init(); // Standardowa inicjalizacja
  }
};

document
  .getElementById("generateLink")
  .addEventListener("click", generateShareableLink);

// Funkcja do generowania URL z obecnym stanem aplikacji
function generateShareableLink() {
  let totalPages = parseInt(localStorage.getItem("totalPages")) || 1;
  let pageNames = [];
  let checkboxesState = [];

  for (let i = 1; i <= totalPages; i++) {
    let pageName = getPageName(i);
    pageNames.push(pageName);

    let { startNumber, endNumber } = getPageRange(i);
    let checkboxes = [];
    for (let j = startNumber; j <= endNumber; j++) {
      let checkboxState =
        localStorage.getItem(`checkbox-${j}-page-${i}`) || "red";
      let stateCode =
        checkboxState === "red" ? "0" : checkboxState === "orange" ? "1" : "2";
      checkboxes.push(stateCode);
    }
    checkboxesState.push(checkboxes.join(""));
  }

  let url = `${
    window.location.origin
  }?pages=${totalPages}&names=${pageNames.join(
    ","
  )}&checkboxes=${checkboxesState.join(",")}`;
  prompt("Skopiuj link do schowka:", url);
}

// Funkcja do odczytywania stanu z URL i przywracania stanu aplikacji
function loadStateFromURL() {
  const params = new URLSearchParams(window.location.search);
  const totalPages = parseInt(params.get("pages")) || 1;
  const pageNames = params.get("names") ? params.get("names").split(",") : [];
  const checkboxesState = params.get("checkboxes")
    ? params.get("checkboxes").split(",")
    : [];

  localStorage.setItem("totalPages", totalPages);

  for (let i = 1; i <= totalPages; i++) {
    let pageName = pageNames[i - 1] || `Strona ${i}`;
    savePageName(i, pageName);

    let checkboxStates = checkboxesState[i - 1] || "";
    let startNumber = 1; // Domyślny startNumber dla każdej strony
    let endNumber = checkboxStates.length; // Zakładamy, że liczba checkboxów zależy od długości stanu

    savePageRange(i, startNumber, endNumber); // Zapisujemy zakres checkboxów dla tej strony

    for (let j = startNumber; j <= endNumber; j++) {
      let stateCode = checkboxStates[j - startNumber] || "0";
      let checkboxState =
        stateCode === "0" ? "red" : stateCode === "1" ? "orange" : "green";
      localStorage.setItem(`checkbox-${j}-page-${i}`, checkboxState);
    }
  }

  loadPage(1); // Przeładuj pierwszą stronę po przywróceniu stanu
}

// Funkcja do zapisywania zakresu dla aktualnej strony
function savePageRange(page, startNumber, endNumber) {
  localStorage.setItem(`startNumber-page-${page}`, startNumber);
  localStorage.setItem(`endNumber-page-${page}`, endNumber);
}

// Funkcja do ładowania strony z odpowiednim zakresem
function loadPage(page) {
  const { startNumber, endNumber } = getPageRange(page);
  document.getElementById("startNumber").value = startNumber;
  document.getElementById("endNumber").value = endNumber;
  document.getElementById("pageTitle").textContent = getPageName(page); // Ustawienie tytułu strony
  generateCheckboxes(startNumber, endNumber);
}

// Dodajemy obsługę przycisku do generowania linku
document
  .getElementById("generateLink")
  .addEventListener("click", generateShareableLink);

// Sprawdź, czy URL zawiera parametry stanu i przywróć stan
window.onload = function () {
  if (window.location.search) {
    loadStateFromURL();
  } else {
    init(); // Standardowa inicjalizacja
  }
};

// Funkcja do ładowania strony z odpowiednim zakresem
function loadPage(page) {
  const { startNumber, endNumber } = getPageRange(page);
  document.getElementById("startNumber").value = startNumber;
  document.getElementById("endNumber").value = endNumber;
  document.getElementById("pageTitle").textContent = getPageName(page); // Ustawienie tytułu strony
  generateCheckboxes(startNumber, endNumber);
}

// Tablica symboli do Base62
const base62Chars =
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

// Funkcja do konwersji trójkowego ciągu na Base62
function encodeBase62(num) {
  let encoded = "";
  while (num > 0) {
    encoded = base62Chars[num % 62] + encoded;
    num = Math.floor(num / 62);
  }
  return encoded || "0";
}

// Funkcja do konwersji Base62 na liczbę
function decodeBase62(str) {
  let decoded = 0;
  for (let i = 0; i < str.length; i++) {
    decoded = decoded * 62 + base62Chars.indexOf(str[i]);
  }
  return decoded;
}
// Inicjalizacja strony
window.onload = function () {
  if (window.location.search) {
    localStorage.clear(); // Czyścimy localStorage, jeśli mamy parametry w URL
    loadStateFromURL(); // Ładujemy stan z URL
  } else {
    init(); // Standardowa inicjalizacja
  }
};

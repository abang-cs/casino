const correctHash = "6e891d3a8b780d8907175d82497b60409b1898198868c528eaef1fce84487890"; // hash dari "1234mysalt"
const salt = "x100";
const maxAttempts = 3;
const blockRedirectURL = "https://google.com/404"; // Ganti ke halaman jebakan kamu

function appendDigit(digit) {
  const display = document.getElementById("pinDisplay");
  if (display.value.length < 6) {
    display.value += digit;
  }
}

function clearPin() {
  document.getElementById("pinDisplay").value = "";
}

async function hashString(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function submitPin() {
  const pin = document.getElementById("pinDisplay").value;
  const pinHash = await hashString(pin + salt);
  const attempts = parseInt(localStorage.getItem("failedAttempts") || "0");

  if (attempts >= maxAttempts) {
    // Sudah diblokir
    window.location.href = blockRedirectURL;
    return;
  }

  if (pinHash === correctHash) {
    sessionStorage.setItem("authenticated", "true");
    localStorage.removeItem("failedAttempts"); // reset jika berhasil
    window.location.href = "index.html";
  } else {
    const newAttempts = attempts + 1;
    localStorage.setItem("failedAttempts", newAttempts);

    if (newAttempts >= maxAttempts) {
      alert("Terlalu banyak percobaan bosku! Kamu diblokir.");
      window.location.href = blockRedirectURL;
    } else {
      alert(`PIN salah! Percobaan ke ${newAttempts} dari ${maxAttempts}`);
      clearPin();
      shuffleNumpad();
    }
  }
}

function shuffle(array) {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function shuffleNumpad() {
  const digits = ["1","2","3","4","5","6","7","8","9","0"];
  shuffle(digits);
  const numpad = document.querySelector(".numpad");
  numpad.innerHTML = "";

  digits.forEach(d => {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = d;
    btn.onclick = () => appendDigit(d);
    numpad.appendChild(btn);
  });

  const clearBtn = document.createElement("button");
  clearBtn.className = "btn";
  clearBtn.textContent = "C";
  clearBtn.onclick = clearPin;

  const okBtn = document.createElement("button");
  okBtn.className = "btn";
  okBtn.textContent = "OK";
  okBtn.onclick = submitPin;

  numpad.appendChild(clearBtn);
  numpad.appendChild(okBtn);
}

window.onload = function () {
  const attempts = parseInt(localStorage.getItem("failedAttempts") || "0");
  if (attempts >= maxAttempts) {
    // Langsung blokir jika buka ulang halaman setelah gagal 3x
    window.location.href = blockRedirectURL;
    return;
  }
  shuffleNumpad();
};

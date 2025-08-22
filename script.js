const correctHash = "6e891d3a8b780d8907175d82497b60409b1898198868c528eaef1fce84487890"; // hash dari "1234x100"
const salt = "x100";
const maxAttempts = 3;
const blockRedirectURL = "https://google.com/404"; // halaman jebakan

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
  const attempts = parseInt(localStorage.getItem("failedAttempts") || "0");

  if (attempts >= maxAttempts) {
    window.location.href = blockRedirectURL;
    return;
  }

  const pinHash = await hashString(pin + salt);

  if (pinHash === correctHash) {
    const now = Date.now();
    sessionStorage.setItem("authenticated", "true");
    sessionStorage.setItem("sessionStart", now.toString());
    localStorage.removeItem("failedAttempts");
    window.location.href = "index.html";
  } else {
    const newAttempts = attempts + 1;
    localStorage.setItem("failedAttempts", newAttempts);
    alert(`PIN salah! Percobaan ke ${newAttempts} dari ${maxAttempts}`);
    if (newAttempts >= maxAttempts) {
      window.location.href = blockRedirectURL;
    }
    clearPin();
    shuffleNumpad();
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
  const digits = shuffle(["1","2","3","4","5","6","7","8","9","0"]);
  const numpad = document.getElementById("numpad");
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
  numpad.appendChild(clearBtn);

  const okBtn = document.createElement("button");
  okBtn.className = "btn";
  okBtn.textContent = "OK";
  okBtn.onclick = submitPin;
  numpad.appendChild(okBtn);
}

window.onload = function () {
  const attempts = parseInt(localStorage.getItem("failedAttempts") || "0");
  if (attempts >= maxAttempts) {
    window.location.href = blockRedirectURL;
    return;
  }
  shuffleNumpad();
};

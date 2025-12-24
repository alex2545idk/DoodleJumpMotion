const API_URL = window.ENV.USER_SERVICE_URL;

function logout() {
  localStorage.removeItem("jwt");
  localStorage.removeItem("user");
  window.location.href = "login.html";
}

async function loadUserData() {
  const token = localStorage.getItem("jwt");
  const container = document.getElementById("user-info");
  if (!container) return;

  if (!token) {
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Nie udało się pobrać danych użytkownika");

    const user = await res.json();

    container.innerHTML = `
      <p><strong>Login:</strong> ${user.username}</p>
      <p><strong>User ID:</strong> ${user.user_id}</p>
      <p><strong>Poziom:</strong> ${user.level}</p>
      <p><strong>Doświadczenie:</strong> ${user.experience}</p>
      <p><strong>Punkty:</strong> ${user.cup_count}</p>
      <p><strong>Najwyższe punkty:</strong> ${user.highest_cups}</p>
      <p><strong>Obecna arena:</strong> ${user.current_arenaid}</p>
    `;
  } catch (err) {
    console.error(err);
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", loadUserData);

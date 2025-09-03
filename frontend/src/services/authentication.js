// docs: https://vitejs.dev/guide/env-and-mode.html
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function login(email, password) {
  const payload = { email, password };

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };

  const response = await fetch(`${BACKEND_URL}/tokens`, requestOptions);

  if (response.status === 201) {
    const data = await response.json();
    // return both token and user now
    return { token: data.token, user: data.user };
  } else {
    throw new Error(
      `Received status ${response.status} when logging in. Expected 201`
    );
  }
}


// export async function signup(email, password) {
//   const payload = {
//     email: email,
//     password: password,
//   };

//   const requestOptions = {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(payload),
//   };

export async function signup(userData) {
  const response = await fetch(`${BACKEND_URL}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (response.status === 201) {
    return;
  } else {
    const errorData = await response.json();  // 👈 THIS is key
    throw new Error(errorData.message || `Received status ${response.status}`);
  }
}

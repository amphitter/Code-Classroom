export const saveToken = (
  token: string
) => {

  localStorage.setItem(
    "token",
    token
  );

  document.cookie =
    `token=${token}; path=/`;

};

export const saveRole = (
  role: string
) => {

  localStorage.setItem(
    "role",
    role
  );

  document.cookie =
    `role=${role}; path=/`;

};

export const saveUser = (
  user: any
) => {

  localStorage.setItem(
    "user",
    JSON.stringify(user)
  );

};

export const logout = () => {

  localStorage.clear();

  document.cookie =
    "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  document.cookie =
    "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

  window.location.href =
    "/";

};
import client from './client';

// GET /get-users            -> list (not used, but leaving here if needed)
export const listUsers = async () => {
  const { data } = await client.get('/get-users');
  return data;
};

// GET /get-users/:id        -> one user by id
export const getUserById = async (id) => {
  const { data } = await client.get(`/get-users/${id}`);
  return data; // expect { user } or user object; adjust mapper below accordingly
};

// PATCH /update/:id         -> update one user (auth required)
export const patchUser = async (id, payload) => {
  const { data } = await client.patch(`/update/${id}`, payload);
  return data; // expect { user } or user object
};

// DELETE /delete/:id        -> delete one user (auth required)
export const deleteUser = async (id) => {
  const { data } = await client.delete(`/delete/${id}`);
  return data;
};

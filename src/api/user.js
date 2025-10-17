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
  const isFormData = payload instanceof FormData;
  const url = `auth/update/${id}`;

  if (isFormData) {
    for (let pair of payload.entries()) {
      console.log(`   ${pair[0]} →`, pair[1]);
    }
  } else {
    console.log("🔹 JSON Payload:", JSON.stringify(payload, null, 2));
  }

  const headers = isFormData
    ? { "Content-Type": "multipart/form-data" }
    : undefined;

  try {
    const response = await client.patch(url, payload, { headers });

    return response.data;
  } catch (error) {
    throw error;
  }
};



// DELETE /delete/:id        -> delete one user (auth required)
export const deleteUser = async (id) => {
  const { data } = await client.delete(`/delete/${id}`);
  return data;
};

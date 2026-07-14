import { api } from "./api";

export const loginStudent =
async (
  rollNo:string,
  password:string
)=>{

  const response =
    await api.post(
      "/auth/student/login",
      {
        rollNo,
        password,
      }
    );

  return response.data;

};

export const loginAdmin =
async (
  rollNo:string,
  password:string
)=>{

  const response =
    await api.post(
      "/admin/login",
      {
        rollNo,
        password,
      }
    );

  return response.data;

};
import api from "./axios";

export const getHomeCovers = () => api.get("/home-covers");

export const updateHomeCovers = (data) =>
  api.post("/home-covers", data, { headers: { "Content-Type": "multipart/form-data" } });

export const deleteHomeCover = (gioiTinh) => api.delete(`/home-covers/${gioiTinh}`);

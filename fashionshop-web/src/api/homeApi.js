import api from "./axios";

/** Ảnh bìa hai ô bộ sưu tập, do quản trị viên đặt trong trang admin */
export const getHomeCovers = () => api.get("/home-covers");

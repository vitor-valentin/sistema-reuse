import { Router } from "express";

const router = Router();

router.post("/logout", (req, res) => {
  res.clearCookie("reuseToken", {
    httpOnly: true,
    sameSite: "lax",
  });

  return res.status(200).json({ message: "Logout realizado com sucesso" });
});

export default router;

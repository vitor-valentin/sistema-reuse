import { Router } from "express";

import { adminAuth } from "../middlewares/auth.middleware.js";
import { validateUserData } from "../validators/admin.usuario.validator.js";
import { validateCategoryData } from "../validators/admin.categoria.validator.js";
import { validateSolicitationData } from "../validators/admin.pedidos.validator.js";

import adminController from "../controllers/admin.controller.js";

const router = Router();

router.get("/dashboard", adminAuth, adminController.getDashboardPage);
router.get("/dashboard/getDashboardCards", adminAuth, adminController.getDashboardCardsInfo);
router.get("/dashboard/getRegistrationInfo", adminAuth, adminController.getDashboardRegistersInfo);
router.get("/dashboard/getDashboardCharts", adminAuth, adminController.getDashboardCharts);

router.get("/usuarios", adminAuth, adminController.getUsuariosPage);
router.get("/usuarios/get/:id", adminAuth, adminController.getUser);
router.get("/usuarios/list", adminAuth, adminController.getUsers);

router.get("/categorias", adminAuth, adminController.getCategoriesPage);
router.get("/categorias/get/:id", adminAuth, adminController.getCategory);
router.get("/categorias/list", adminAuth, adminController.getCategories);

router.get("/pedidos", adminAuth, adminController.getSolicitationPage);
router.get("/pedidos/list", adminAuth, adminController.getSolicitations);
router.get("/pedidos/get/:id", adminAuth, adminController.getSolicitation);
router.get("/pedidos/documents/:type/:idEmpresa", adminAuth, adminController.getDocument);

router.get("/permissions", adminAuth, adminController.getPermissions);
router.get("/api/getInfo", adminAuth, adminController.getUserInfo);

router.post("/usuarios/createUser",
    adminAuth,
    validateUserData,
    adminController.createUser
);
router.post("/categorias/createCategory",
    adminAuth,
    validateCategoryData,
    adminController.createCategory
);

router.put("/usuarios/update/:id",
    adminAuth,
    validateUserData,
    adminController.editUser
);
router.put("/categorias/update/:id",
    adminAuth,
    validateCategoryData,
    adminController.editCategory
);
router.put("/pedidos/update",
    adminAuth,
    validateSolicitationData,
    adminController.updateSolicitation
);

router.delete("/usuarios/delete", adminAuth, adminController.deleteUser);
router.delete("/categorias/delete", adminAuth, adminController.deleteCategory);

export default router;
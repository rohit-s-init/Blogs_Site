import multer from "multer";

const mtr = multer.memoryStorage();
const storage = multer({storage: mtr});

export function loadFiles(req, res, next) {
    storage.any()(req, res, next);
}

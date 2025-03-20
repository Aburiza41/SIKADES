import * as Yup from "yup";

const userSchema = Yup.object().shape({
    id: Yup.number().nullable(),
    name: Yup.string().required("Nama wajib diisi"),
    email: Yup.string().email("Email tidak valid").required("Email wajib diisi"),
    email_verified_at: Yup.date().nullable(),
    // password: Yup.string().min(8, "Password minimal 8 karakter").required("Password wajib diisi"),
    role: Yup.mixed()
        .oneOf(["admin", "regency", "district", "village"], "Role tidak valid")
        .default("village"),
    remember_token: Yup.string().nullable(),
    created_at: Yup.date().nullable(),
    updated_at: Yup.date().nullable(),
});

export default class UserModel {
    constructor(data) {
        this.id = data.id || null;
        this.name = data.name || "";
        this.email = data.email || "";
        this.email_verified_at = data.email_verified_at || null;
        // this.password = data.password || "";
        this.role = data.role || "village";
        this.remember_token = data.remember_token || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    static validate(data) {
        return userSchema.validate(data, { abortEarly: false });
    }
}

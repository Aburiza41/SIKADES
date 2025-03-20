import * as Yup from "yup";

const subscriberSchema = Yup.object().shape({
    id: Yup.number().nullable(),
    title: Yup.string().required("Title is required"),
    description: Yup.string().nullable(),
    price: Yup.number()
        .typeError("Price must be a number")
        .positive("Price must be greater than 0")
        .required("Price is required"),
    image: Yup.string().nullable(),
    slug: Yup.string().required("Slug is required"),
    is_active: Yup.boolean().default(true),
});

export default class SubscriberModel {
    constructor(data) {
        this.id = data.id || null;
        this.title = data.title || "";
        this.description = data.description || "";
        this.price = data.price || 0.0;
        this.image = data.image || null;
        this.slug = data.slug || "";
        this.is_active = data.is_active !== undefined ? data.is_active : true;
    }

    static validate(data) {
        return subscriberSchema.validate(data, { abortEarly: false });
    }
}

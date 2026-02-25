export const cdn = (
    publicId: string,
    preset: "ecom_thumb" | "ecom_detail" | "ecom_zoom" | "auto" = "auto",
    width?: number
) => {
    if (!publicId) return "/placeholder.png";

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dsxjmpbdj";
    const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

    if (preset === "auto") {
        // If auto/default, just return the optimized auto format
        return `${baseUrl}/f_auto,q_auto${width ? `,w_${width}` : ""}/${publicId}`;
    }

    // If specific named transformation preset (Cloudinary named transformation)
    // Or manual URL construction based on the requested logic:

    // Note: The user requested presets like "ecom_thumb", "ecom_detail".
    // If these are configured in Cloudinary Dashboard as "Named Transformations", we use t_{preset}.
    // If we are just simulating them with URL parameters:

    /*
     * Preset Definitions (Simulated if not in Cloudinary Dashboard):
     * ecom_thumb: w_300,q_auto,f_auto
     * ecom_detail: w_800,q_auto,f_auto
     * ecom_zoom: w_1200,q_auto,f_auto
     */

    let transformations = "";

    switch (preset) {
        case "ecom_thumb":
            transformations = "w_300,q_auto,f_auto";
            break;
        case "ecom_detail":
            transformations = "w_800,q_auto,f_auto";
            break;
        case "ecom_zoom":
            transformations = "w_1200,q_auto,f_auto";
            break;
    }

    // Override width if provided manually
    if (width) {
        transformations += `,w_${width}`;
    }

    return `${baseUrl}/${transformations}/${publicId}`;
};

const envServerUrl = process.env.NEXT_PUBLIC_SERVER_URL;
export const server = (envServerUrl && envServerUrl.startsWith("http"))
    ? envServerUrl
    : "http://localhost:5000/api/v1";

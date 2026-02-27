import { StorageClient } from "@supabase/storage-js";

export async function saveFile(buffer,name,mimeType) {
    const STORAGE_URL = process.env.STORAGE_URL;
    const SERVICE_KEY = process.env.SERVICE_KEY;

    console.log(buffer)
    console.log(name)
    console.log(mimeType)

    const storageClient = new StorageClient(STORAGE_URL, {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
    })
    const resp = await storageClient.from('hivemind_posts').upload(
        Date.now()+name,
        buffer,
        { contentType: mimeType }
    )
    return resp;

}
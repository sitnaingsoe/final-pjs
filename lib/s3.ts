import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

// ၁။ Client ကို ချိတ်ဆက်ခြင်း
export const s3Client = new S3Client({
    endpoint: process.env.DO_SPACES_ENDPOINT!,
    region: 'sgp1',
    credentials: {
        accessKeyId: process.env.DO_SPACES_KEY!,
        secretAccessKey: process.env.DO_SPACES_SECRET!
    }
});

/**
 * ၂။ သင့်ရဲ့ ယခင် Folder တည်ဆောက်ပုံနဲ့ ကိုက်ညီအောင် ပြင်ဆင်ထားသော Upload Helper
 */
export async function uploadFileToSpaces(file: File, p0: string): Promise<string | null> {
    if (!file || file.size === 0) return null;

    try {
        const bucket = process.env.DO_SPACES_BUCKET!;

        // Next.js File object ကို Node.js Buffer အဖြစ်သို့ ပြောင်းခြင်း
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ယခင် project မှ folder လမ်းကြောင်းအတိုင်း အတိအကျ ထားရှိခြင်း
        const basePath = "foodie-pos/msquarefdc-batch3/sit-naing-soe";
        const ext = file.name.split('.').pop();
        const uniqueFilename = `${basePath}/${Date.now()}_${crypto.randomBytes(8).toString('hex')}.${ext}`;

        const command = new PutObjectCommand({
            Bucket: bucket,
            Key: uniqueFilename,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read', // အများပြည်သူ ကြည့်ရှုခွင့်ပေးရန်
        });

        await s3Client.send(command);

        // ယခင်က အသုံးပြုခဲ့သော သီးသန့် CDN URL ပုံစံအတိုင်း ပြန်လည်ထုတ်ပေးခြင်း
        return `https://${bucket}.sgp1.cdn.digitaloceanspaces.com/${uniqueFilename}`;
    } catch (error) {
        console.error("Error uploading to Spaces:", error);
        return null;
    }
}
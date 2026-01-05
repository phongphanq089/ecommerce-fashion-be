// modules/auth/auth.handler.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '@/utils/auth';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

// Type definition for Better-Auth response
interface BetterAuthResponse {
  code?: string;
  message?: string;
  [key: string]: any; // Allow other properties
}

// Hàm xử lý chung cho tất cả request Auth
export const betterAuthHandler = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const protocol = request.protocol || 'http';
    const url = new URL(request.url, `${protocol}://${request.headers.host}`);

    const headers = new Headers();
    Object.entries(request.headers).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else if (value) {
        headers.append(key, value.toString());
      }
    });

    const req = new Request(url.toString(), {
      method: request.method,
      headers,
      ...(request.body ? { body: JSON.stringify(request.body) } : {}),
    });

    // console.log(
    //   'BODY GỬI SANG BETTER-AUTH:',
    //   JSON.stringify(request.body, null, 2)
    // );

    const response = await auth.handler(req);

    reply.status(response.status);

    response.headers.forEach((value, key) => reply.header(key, value));

    // console.log('BODY NHAN LAI:', JSON.stringify(response.body, null, 2));

    // 4. Lấy dữ liệu JSON từ Better-Auth
    // Better-Auth luôn trả về JSON, nhưng ta cần parse nó ra để xử lý
    const data = (await response.json()) as BetterAuthResponse;

    // 5. XỬ LÝ FORMAT RESPONSE (Override ở đây)

    // --> TRƯỜNG HỢP LỖI (Status >= 400)
    if (!response.ok) {
      // Better-Auth trả về: { code: "...", message: "..." }
      // Bạn muốn map sang format của bạn
      return sendResponseError(
        response.status,
        reply,
        data?.message || 'Authentication Error', // Lấy message của Better-Auth
        data // Truyền cả cục data gốc vào result để FE biết mã lỗi (code)
      );
    }

    // --> TRƯỜNG HỢP THÀNH CÔNG (Status 200/201)
    return sendResponseSuccess(
      response.status,
      reply,
      'Authentication Successful', // Hoặc tùy biến message dựa trên URL
      data
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Auth Error';
    request.log.error('Authentication Error:', error as any);
    return reply.status(500).send({ error: errorMessage });
  }
};

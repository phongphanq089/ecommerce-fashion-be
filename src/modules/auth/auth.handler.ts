// modules/auth/auth.handler.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from '@/utils/auth';
import { sendResponseError, sendResponseSuccess } from '@/utils/sendResponse';

interface BetterAuthResponse {
  code?: string;
  message?: string;
  [key: string]: any;
}

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

    const response = await auth.handler(req);

    // -------------------------------------------------------------
    // 1. XỬ LÝ COOKIE (Fix lỗi mất cookie State/Session)
    // -------------------------------------------------------------
    if (typeof response.headers.getSetCookie === 'function') {
      const cookies = response.headers.getSetCookie();
      if (cookies.length > 0) reply.header('set-cookie', cookies);
    } else {
      const cookieHeader = response.headers.get('set-cookie');
      if (cookieHeader) reply.header('set-cookie', cookieHeader);
    }

    // 2. Copy các headers khác (Trừ set-cookie đã xử lý)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() !== 'set-cookie') {
        reply.header(key, value);
      }
    });

    reply.status(response.status);

    // -------------------------------------------------------------
    // 3. XỬ LÝ BODY (FIX LỖI CRASH Ở ĐÂY)
    // -------------------------------------------------------------

    // Lấy Content-Type để xem nó là JSON hay là thứ khác
    const contentType = response.headers.get('content-type') || '';

    // Lấy nội dung dưới dạng Text trước (An toàn nhất)
    const textBody = await response.text();

    // ==> TRƯỜNG HỢP A: Là JSON (API login thường, error, user info...)
    if (
      contentType.includes('application/json') &&
      textBody.trim().length > 0
    ) {
      try {
        const data = JSON.parse(textBody) as BetterAuthResponse;

        // Nếu có lỗi từ Better-Auth (VD: sai pass, email trùng...)
        if (!response.ok) {
          return sendResponseError(
            response.status,
            reply,
            data?.message || 'Authentication Error',
            data
          );
        }

        // Thành công JSON
        return sendResponseSuccess(
          response.status,
          reply,
          'Authentication Successful',
          data
        );
      } catch (e) {
        // Phòng hờ parse lỗi
        return reply.send(textBody);
      }
    }

    // ==> TRƯỜNG HỢP B: Là Redirect (302) hoặc Text thường (Social Login)
    // Google Login xong sẽ rơi vào đây. Body rỗng, status 302.
    // Ta trả nguyên về để trình duyệt tự chuyển hướng.
    return reply.send(textBody);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Internal Auth Error';
    request.log.error('Authentication Error:', error as any);

    // Chỉ gửi lỗi nếu response chưa được gửi đi
    if (!reply.sent) {
      return reply.status(500).send({ error: errorMessage });
    }
  }
};

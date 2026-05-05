import express from 'express';
import { GoogleGenAI } from '@google/genai';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' }); // Lấy API Key từ file .env.local

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Mở rộng giới hạn để nhận file luật dài

// Khởi tạo AI bằng Key an toàn trên server
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Câu lệnh mớm cho AI (Lấy từ AGENTS.md của bạn và dặn dò thêm về bảng biểu)
const SYSTEM_PROMPT = `
Bạn là chuyên gia chuẩn hóa văn bản quy phạm pháp luật Việt Nam sang định dạng Markdown.
TUYỆT ĐỐI TUÂN THỦ CÁC QUY TẮC SAU:

1. Không tóm tắt, không diễn giải, không bỏ sót bất kỳ từ nào.
2. Giữ nguyên ĐÚNG định dạng đánh số Khoản, Điểm của luật Việt Nam:
   - Khoản: giữ nguyên 1., 2., 3.
   - Điểm: giữ nguyên a), b), c), d), đ), e), g), h), i), k), l), m), n), o), p), q), r), s), t), u), v), x), y). KHÔNG được tự ý chuyển thành a, b, c, d, e, f.
3. Phân cấp cấu trúc (Heading) linh hoạt theo đúng hệ thống:
   - Phần / Chương: Dùng thẻ ## [TÊN PHẦN/CHƯƠNG IN HOA]. Thêm một đường kẻ ngang (---) ngay phía trên.
   - Mục (nếu có): Dùng thẻ ###. (Lưu ý: Mục thường đánh số Arab 1, 2, 3... nhưng nếu văn bản có Tiểu mục thì Mục có thể đánh số La Mã I, II, III...).
   - Tiểu mục (nếu có): Dùng thẻ ####. (Thường đánh số Arab hoặc I.1, I.2...).
   - Điều: Phải dùng thẻ Heading thấp hơn cấp ngay trên nó để đảm bảo cấu trúc Markdown hợp lý (Dùng ### Điều nếu nằm ngay dưới Chương; dùng #### Điều nếu dưới Mục; hoặc ##### Điều nếu dưới Tiểu mục).
4. Với Điều "Giải thích từ ngữ", hãy in đậm (**) thuật ngữ được định nghĩa lần đầu.
5. Bảo toàn bảng biểu bằng cú pháp bảng của Markdown.
`;

app.post('/api/convert', async (req, res) => {
  try {
    const { rawText } = req.body;

    // Gọi Gemini xử lý
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Dùng bản pro để xử lý text dài cho chuẩn xác
      contents: `${SYSTEM_PROMPT}\n\nNỘI DUNG CẦN CHUYỂN ĐỔI:\n${rawText}`,
    });

    res.json({ markdown: response.text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Lỗi khi nhờ AI xử lý' });
  }
});

app.listen(3001, () => console.log('Trạm trung chuyển Backend đang chạy ở cổng 3001'));

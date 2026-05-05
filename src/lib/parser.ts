import * as mammoth from 'mammoth';

export async function parseDocxToMarkdown(arrayBuffer: ArrayBuffer): Promise<string> {
  // 1. Dùng mammoth rút sạch chữ và chữ trong bảng ra thành dạng text thô (không thèm tự format nữa)
  const result = await mammoth.extractRawText({ arrayBuffer });
  const rawText = result.value;

  if (!rawText.trim()) {
    throw new Error("File Word rỗng hoặc không đọc được nội dung.");
  }

  // 2. Bưng đống text thô này gửi lên cho Backend (Trạm trung chuyển) nhờ Gemini làm phép
  const response = await fetch('http://localhost:3001/api/convert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ rawText }),
  });

  if (!response.ok) {
    throw new Error("Có lỗi xảy ra trong quá trình nhờ AI chuyển đổi.");
  }

  const data = await response.json();

  // 3. Nhận thành phẩm Markdown vuông vức từ AI trả về
  return data.markdown;
}

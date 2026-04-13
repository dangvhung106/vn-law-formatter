---
name: vn-law-formatter
description: >
  Chuyển đổi văn bản pháp luật Việt Nam (Luật, Nghị định, Thông tư, Quyết định, Nghị quyết)
  từ file .docx hoặc nội dung text sang định dạng Markdown có cấu trúc chuẩn.
  Sử dụng skill này bất cứ khi nào người dùng:
  - Upload file .docx là văn bản pháp luật Việt Nam và yêu cầu chuyển đổi sang Markdown
  - Yêu cầu "format", "chuyển đổi", "convert" văn bản pháp luật sang .md
  - Nói "chuyển sang markdown", "tạo file markdown", "format văn bản luật"
  - Upload văn bản có tiêu đề bắt đầu bằng "LUẬT", "NGHỊ ĐỊNH", "THÔNG TƯ", "QUYẾT ĐỊNH", "NGHỊ QUYẾT"
  - Yêu cầu chuẩn hóa, restructure văn bản quy phạm pháp luật Việt Nam
  Skill này KHÔNG dùng cho việc tra cứu, phân tích nội dung pháp luật — chỉ dùng cho chuyển đổi định dạng.
---

# Vietnamese Legal Document Formatter

Chuyển đổi văn bản quy phạm pháp luật Việt Nam sang Markdown có cấu trúc chuẩn, bảo toàn toàn bộ nội dung gốc.

## Quy trình thực hiện

### Bước 1: Đọc file nguồn

```python
from docx import Document
doc = Document('<filepath>')
# Đọc tất cả paragraphs kèm style
for i, p in enumerate(doc.paragraphs):
    print(f'{i:04d} | {p.style.name:30s} | {p.text}')
# Kiểm tra tables
for i, t in enumerate(doc.tables):
    for r, row in enumerate(t.rows):
        for c, cell in enumerate(row.cells):
            print(f'Table {i} [{r},{c}]: {cell.text[:200]}')
```

### Bước 2: Xác định loại văn bản

Tự động nhận diện từ header/tiêu đề:

| Từ khóa trong tiêu đề | Loại văn bản | Ghi chú |
|---|---|---|
| LUẬT | Luật | H2 = Chương/Phần, H3 = Điều |
| NGHỊ QUYẾT | Nghị quyết | H2 = Chương, H3 = Điều |
| NGHỊ ĐỊNH | Nghị định | H2 = Chương, H3 = Điều, Mục dùng bold hoặc H4 |
| THÔNG TƯ | Thông tư | H2 = Chương/Mục, H3 = Điều |
| QUYẾT ĐỊNH | Quyết định | H2 = Chương/Phần, H3 = Điều |

### Bước 3: Xây dựng Markdown

#### 3.1 — Tiêu đề H1 và Metadata Block

```markdown
# [TÊN ĐẦY ĐỦ CỦA VĂN BẢN — viết hoa]

> **Loại văn bản:** [Luật / Nghị định / Thông tư / Quyết định / Nghị quyết]
> **Số hiệu:** [số/năm/ký hiệu]
> **Ngày ban hành:** [dd/mm/yyyy]
> **Ngày hiệu lực:** [dd/mm/yyyy]
> **Cơ quan ban hành:** [tên cơ quan]
> **Phạm vi điều chỉnh:** [trích từ Điều 1 hoặc phần mở đầu]
```

Thông tin metadata lấy từ:
- Bảng header (Table 0) chứa số hiệu, ngày ban hành
- Điều 1 (Phạm vi điều chỉnh) hoặc câu mở đầu
- Điều khoản thi hành (ngày hiệu lực)
- Bảng footer (Table cuối) chứa chức danh ký

#### 3.2 — Phần căn cứ pháp lý (Preamble)

Giữ nguyên các dòng "Căn cứ...", mỗi dòng một paragraph, không heading.

#### 3.3 — Heading Hierarchy

```
## Chương I. TÊN CHƯƠNG          ← H2, có --- horizontal rule phía trên
### Mục 1. TÊN MỤC               ← H3 (cho Nghị định/Thông tư có Mục)
### Điều X. Tên điều              ← H3
1. Nội dung khoản                 ← Khoản: số thường 1., 2., 3.
a) Nội dung điểm                  ← Điểm: a), b), c)
```

**Quy tắc cụ thể:**
- `---` horizontal rule trước mỗi `## Chương` (trừ Chương đầu tiên nếu nó ngay sau preamble)
- Chương: `## Chương [số La Mã]. [TÊN CHƯƠNG IN HOA]`
- Điều: `### Điều [số]. [Tên điều]`
- Khoản: giữ nguyên `1.`, `2.`, `3.`
- Điểm: giữ nguyên `a)`, `b)`, `c)`, `d)`, `đ)`, `e)`, `g)`
- Tiểu điểm (nếu có): giữ nguyên format gốc (ví dụ: `c1)`, `c2)`)

#### 3.4 — In đậm thuật ngữ định nghĩa

Trong **Điều "Giải thích từ ngữ"** (thường là Điều 3), in đậm thuật ngữ được định nghĩa lần đầu:

```markdown
1. **Trung tâm tài chính quốc tế** là khu vực có ranh giới...
2. **Thành viên Trung tâm tài chính quốc tế** (sau đây gọi là Thành viên) là...
```

#### 3.5 — Bảng biểu

Bảo toàn bảng biểu bằng Markdown table syntax:

```markdown
| Cột 1 | Cột 2 | Cột 3 |
|---|---|---|
| Dữ liệu | Dữ liệu | Dữ liệu |
```

Nếu bảng là công thức tính toán, dùng table format phù hợp.

#### 3.6 — Phụ lục

Đặt ở cuối file, dùng H2:

```markdown
## Phụ lục [X]: [Tên phụ lục]

*(Kèm theo [loại văn bản] số [số hiệu] ngày [ngày] của [cơ quan])*
```

Nếu Phụ lục có danh mục dạng bảng, render bằng Markdown table.
Nếu Phụ lục chứa biểu mẫu, giữ nguyên nội dung dạng text + heading phụ.

#### 3.7 — Khối ký tên

```markdown
|  | [CHỨC DANH] |
|---|---|
|  | **[Họ tên]** |
```

### Bước 4: Xử lý văn bản sửa đổi, bổ sung

Khi văn bản là công cụ sửa đổi (sửa đổi, bổ sung, thay thế), áp dụng thêm:

Với mỗi điều khoản sửa đổi:

1. Tạo H3 cho Điều sửa đổi như bình thường
2. Ngay dưới, thêm blockquote xác định đối tượng:

```markdown
> 🔧 **Sửa đổi / bổ sung:** [số hiệu văn bản gốc] — [Điều/Khoản/Điểm bị sửa đổi]
```

3. Render nội dung thay thế trong fenced block:

````markdown
```amended
[nội dung mới chính xác như trong văn bản]
```
````

4. Nếu bổ sung mới:
```markdown
> ➕ **Bổ sung mới**
```

5. Nếu thay thế toàn bộ:
```markdown
> 🔄 **Thay thế toàn bộ**
```

6. Nếu bãi bỏ:
```markdown
> ❌ **Bãi bỏ:** [xác định chính xác nội dung bị bãi bỏ]
```

Nếu văn bản vừa sửa đổi VÀ chứa quy định gốc, áp dụng cả hai bộ quy tắc cho từng phần tương ứng.

## Nguyên tắc bắt buộc

1. **Bảo toàn 100% nội dung** — không tóm tắt, không diễn giải, không bỏ sót bất kỳ từ nào
2. **Bảo toàn dấu tiếng Việt** chính xác
3. **Chỉ output Markdown** — không giải thích, không lời mở đầu
4. **Bảo toàn cấu trúc bảng** bằng Markdown table syntax
5. **Output file .md** vào `/mnt/user-data/outputs/` và dùng `present_files` để trả cho người dùng

## Lưu ý kỹ thuật

- File .docx lớn (>200 paragraphs): dùng Python script để đọc và generate, chia thành nhiều bước nếu cần
- Kiểm tra tables trong file docx — thường chứa header (cơ quan ban hành, số hiệu), formula, hoặc footer (chữ ký)
- Một số file dùng style "Normal" cho tất cả paragraphs — phải nhận diện Chương/Điều/Khoản qua nội dung text
- Sau khi tạo file, kiểm tra nhanh cấu trúc bằng `grep -n "^## \|^### " output.md` để verify heading hierarchy

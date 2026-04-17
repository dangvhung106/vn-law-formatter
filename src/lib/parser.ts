import * as mammoth from 'mammoth';

export async function parseDocxToMarkdown(arrayBuffer: ArrayBuffer): Promise<string> {
  // Use mammoth to extract HTML from the docx file
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const html = result.value;
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  
  let markdown = '';
  
  // Metadata extraction state
  let docType = '';
  let docName = '';
  let docNumber = '';
  let docDate = '';
  let docIssuer = '';
  let scope = '';
  
  // Parsing state
  let isFirstChapter = true;
  let inDefinitions = false;
  let inAmendment = false;
  
  // 1. Extract Metadata from first table (usually header)
  const tables = doc.querySelectorAll('table');
  if (tables.length > 0) {
    const firstTable = tables[0];
    const text = firstTable.textContent || '';
    
    // Extract Number
    const numberMatch = text.match(/Số:\s*([^\s,]+)/);
    if (numberMatch) docNumber = numberMatch[1];
    
    // Extract Date
    const dateMatch = text.match(/ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})\s+năm\s+(\d{4})/i);
    if (dateMatch) docDate = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
    
    // Extract Issuer (usually first cell)
    const firstCell = firstTable.querySelector('td');
    if (firstCell) {
      const lines = (firstCell.textContent || '').split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length > 0) docIssuer = lines[0].toUpperCase();
    }
  }

  // Helper to convert HTML table to MD
  const convertTableToMd = (table: HTMLTableElement) => {
    let md = '\n';
    const rows = Array.from(table.querySelectorAll('tr'));
    rows.forEach((row, rowIndex) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      md += '| ' + cells.map(c => (c.textContent || '').trim().replace(/\|/g, '\\|')).join(' | ') + ' |\n';
      
      if (rowIndex === 0) {
        md += '|' + cells.map(() => '---').join('|') + '|\n';
      }
    });
    return md + '\n';
  };

  const elements = Array.from(doc.body.children);
  
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    
    if (el.tagName === 'TABLE') {
      // Skip the first table if it looks like the header metadata table
      if (i === 0 || (i < 3 && (el.textContent || '').includes('CỘNG HÒA XÃ HỘI'))) {
        continue;
      }
      // Skip the last table if it looks like the signature footer
      if (i > elements.length - 3 && (el.textContent || '').includes('Nơi nhận')) {
        markdown += '\n|  | CHỨC DANH |\n|---|---|\n|  | **[Họ tên]** |\n\n';
        continue;
      }
      
      markdown += convertTableToMd(el as HTMLTableElement);
      continue;
    }
    
    let text = (el.textContent || '').trim();
    if (!text) continue;

    // Detect Doc Type and Name from early paragraphs
    if (!docType && i < 10) {
      const upperText = text.toUpperCase();
      if (/^(LUẬT|NGHỊ ĐỊNH|THÔNG TƯ|QUYẾT ĐỊNH|NGHỊ QUYẾT)/.test(upperText)) {
        docType = upperText.split(' ')[0];
        if (upperText.startsWith('NGHỊ')) docType = upperText.split(' ').slice(0, 2).join(' ');
        if (upperText.startsWith('THÔNG')) docType = upperText.split(' ').slice(0, 2).join(' ');
        if (upperText.startsWith('QUYẾT')) docType = upperText.split(' ').slice(0, 2).join(' ');
        
        docName = upperText;
        continue; // Skip adding title to body, we'll add it in metadata block
      }
    }

    // Extract Scope (Phạm vi điều chỉnh)
    if (text.toLowerCase().startsWith('điều 1. phạm vi điều chỉnh')) {
      scope = text.replace(/^Điều 1\.\s*Phạm vi điều chỉnh\.?\s*/i, '');
    }

    // Handle Headings
    if (/^Phụ lục\s+(\d+|[IVXLCDM]+)\b/i.test(text)) {
      markdown += `## ${text}\n\n`;
      continue;
    }

    if (/^Chương\s+[IVXLCDM]+/i.test(text)) {
      if (!isFirstChapter) markdown += '\n---\n\n';
      isFirstChapter = false;
      markdown += `## ${text.toUpperCase()}\n\n`;
      continue;
    }
    
    if (/^Mục\s+\d+/i.test(text)) {
      markdown += `### ${text}\n\n`;
      continue;
    }
    
    if (/^Điều\s+\d+/i.test(text)) {
      if (inAmendment) {
        markdown += '```\n\n';
        inAmendment = false;
      }
      markdown += `### ${text}\n\n`;
      inDefinitions = text.toLowerCase().includes('giải thích từ ngữ');
      continue;
    }

    // Khoản: natural number followed by dot and space (1. 2. 10. etc.)
    if (/^\d+\.\s/.test(text)) {
      let content = text;
      if (inDefinitions) {
        const match = text.match(/^(\d+\.\s+)(.*?)(là\s+.*)$/);
        if (match) content = `${match[1]}**${match[2].trim()}** ${match[3]}`;
      }
      markdown += `#### ${content}\n\n`;
      continue;
    }

    // Single Vietnamese letter heading (a, b, c, d, đ, e, g, h, i, k, l, m, n, o, p, q, r, s, t, u, v, x, y)
    if (/^[abcdđeghiklmnopqrstuvxy]\)\s/i.test(text)) {
      markdown += `##### ${text}\n\n`;
      continue;
    }

    // Handle Amendments
    if (/sửa đổi,\s*bổ sung/i.test(text) && text.toLowerCase().includes('điều')) {
      markdown += `> 🔧 **Sửa đổi / bổ sung:** ${text}\n\n`;
      inAmendment = true;
      markdown += '```amended\n';
      continue;
    }

    // Handle Preamble (Căn cứ)
    if (text.toLowerCase().startsWith('căn cứ')) {
      markdown += `${text}\n\n`;
      continue;
    }

    // Normal paragraph
    if (inAmendment) {
      markdown += `${text}\n\n`;
    } else {
      markdown += `${text}\n\n`;
    }
  }
  
  if (inAmendment) {
    markdown += '```\n\n';
  }

  // Construct final Markdown
  const metadataBlock = `# ${docName || 'VĂN BẢN PHÁP LUẬT'}

> **Loại văn bản:** ${docType || 'Chưa xác định'}
> **Số hiệu:** ${docNumber || '[Số hiệu]'}
> **Ngày ban hành:** ${docDate || '[Ngày ban hành]'}
> **Cơ quan ban hành:** ${docIssuer || '[Cơ quan ban hành]'}
> **Phạm vi điều chỉnh:** ${scope || '[Phạm vi điều chỉnh]'}

`;

  return metadataBlock + markdown.trim();
}

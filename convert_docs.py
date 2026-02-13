import os
import zipfile
import xml.etree.ElementTree as ET
import glob

def extract_text_from_docx(docx_path):
    """
    Extracts text from a .docx file without external dependencies
    by parsing the XML structure directly.
    """
    try:
        with zipfile.ZipFile(docx_path) as docx:
            xml_content = docx.read('word/document.xml')
            tree = ET.fromstring(xml_content)
            
            # XML namespace for Word documents
            namespace = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            text_parts = []
            
            # Find all paragraphs
            for p in tree.findall('.//w:p', namespace):
                paragraph_text = []
                # Find all text runs within the paragraph
                for t in p.findall('.//w:t', namespace):
                    if t.text:
                        paragraph_text.append(t.text)
                
                if paragraph_text:
                    text_parts.append(''.join(paragraph_text))
            
            return '\n\n'.join(text_parts)
            
    except Exception as e:
        return f"Error reading {docx_path}: {str(e)}"

def convert_docs_to_md(source_dir, dest_dir):
    if not os.path.exists(dest_dir):
        os.makedirs(dest_dir)
        
    docx_files = glob.glob(os.path.join(source_dir, "*.docx"))
    
    if not docx_files:
        print(f"No .docx files found in {source_dir}")
        return

    print(f"Found {len(docx_files)} .docx files.")

    for docx_file in docx_files:
        base_name = os.path.basename(docx_file)
        file_name_no_ext = os.path.splitext(base_name)[0]
        md_file_path = os.path.join(dest_dir, f"{file_name_no_ext}.md")
        
        print(f"Converting {base_name}...")
        
        text_content = extract_text_from_docx(docx_file)
        
        # Simple Markdown formatting (just text for now, maybe add headers if we could detect them)
        # But raw text is better than nothing.
        
        with open(md_file_path, "w", encoding="utf-8") as f:
            f.write(f"# {file_name_no_ext}\n\n")
            f.write(text_content)
            
        print(f"Saved to {md_file_path}")

if __name__ == "__main__":
    source = r"e:\planmaker\documents"
    destination = r"e:\planmaker\documents\markdown"
    convert_docs_to_md(source, destination)

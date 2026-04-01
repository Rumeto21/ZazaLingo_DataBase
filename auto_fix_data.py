import os
import re

def fix_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # The corruption pattern: it often leaves a valid object/array followed by junk
        # OR it duplicates the whole thing but with missing semicolons in between.
        
        # Strategy: Find the first occurrence of }; or ]; followed by a newline at the end of the file
        # or followed by duplicated keys.
        
        # For simplicity and safety in this specific repo:
        # Most files follow: export const key = { ... }; or [ ... ];
        
        # Let's try to find the first valid closing for the main export.
        match = re.search(r'^(export const \w+.*?[=\s]+)([\{\[](?s:.*?)[\}\]])\s*;?\s*(\n|$)', content)
        if match:
            # We found the first complete export.
            fixed_content = match.group(1) + match.group(2) + ";\n"
            if len(fixed_content) < len(content):
                print(f"Fixing {filepath} (Shortened from {len(content)} to {len(fixed_content)})")
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(fixed_content)
                return True
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
    return False

root_dir = r"c:\Users\pc\Documents\ZazaLingo\ZazaLingo\data"
count = 0
for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".ts"):
            if fix_file(os.path.join(root, file)):
                count += 1

print(f"Finished. Fixed {count} files.")

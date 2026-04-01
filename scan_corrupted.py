import os

def check_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            # Check for }; follow by non-whitespace or duplicated content
            if '};' in content:
                parts = content.split('};')
                if len(parts) > 2:
                    return True
                if len(parts) == 2 and parts[1].strip():
                    return True
            if '];' in content:
                parts = content.split('];')
                if len(parts) > 2:
                    return True
                if len(parts) == 2 and parts[1].strip():
                    return True
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
    return False

root_dir = r"c:\Users\pc\Documents\ZazaLingo\ZazaLingo\data"
corrupted_files = []

for root, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".ts"):
            full_path = os.path.join(root, file)
            if check_file(full_path):
                corrupted_files.append(full_path)

for f in corrupted_files:
    print(f)

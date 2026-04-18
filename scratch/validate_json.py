import json
import sys

try:
    with open(r'C:\Users\pc\Documents\ZazaLingo\Data_Base\data\theme\themeConfig.json', 'r', encoding='utf-8') as f:
        json.load(f)
    print("themeConfig.json is VALID")
except Exception as e:
    print(f"themeConfig.json is INVALID: {e}")

try:
    # Check spacing.ts (extracting JSON part)
    with open(r'C:\Users\pc\Documents\ZazaLingo\Data_Base\data\theme\tokens\spacing.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        import re
        match = re.search(r'=\s*(\{[\s\S]*\});', content)
        if match:
            json_str = match.group(1)
            try:
                json.loads(json_str)
                print("spacing.ts JSON is VALID")
            except Exception as e:
                print(f"spacing.ts JSON is INVALID: {e}")
                # Check for trailing commas
                import re
                if re.search(r',\s*\}', json_str) or re.search(r',\s*\]', json_str):
                    print("Found TRAILING COMMA in spacing.ts")
except Exception as e:
    print(f"spacing.ts check failed: {e}")

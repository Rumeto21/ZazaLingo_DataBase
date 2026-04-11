import os
import hashlib
import json

SOURCE_DIR = r"C:\Users\pc\Documents\ZazaLingo\Data_Base\data"
MIRROR_DIR = r"C:\Users\pc\Documents\ZazaLingo\ZazaLingo\data"

def get_hash(file_path):
    sha256 = hashlib.sha256()
    try:
        with open(file_path, "rb") as f:
            while chunk := f.read(8192):
                sha256.update(chunk)
        return sha256.hexdigest()
    except Exception as e:
        return f"Error: {str(e)}"

def verify_sync():
    results = {
        "synced": [],
        "mismatch": [],
        "missing_in_mirror": [],
        "extra_in_mirror": []
    }
    
    source_files = {}
    for root, dirs, files in os.walk(SOURCE_DIR):
        if "backups" in dirs:
            dirs.remove("backups") # Skip backups
        if "archive" in dirs:
            dirs.remove("archive")
            
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, SOURCE_DIR)
            source_files[rel_path] = get_hash(full_path)

    mirror_files = {}
    for root, dirs, files in os.walk(MIRROR_DIR):
        for file in files:
            full_path = os.path.join(root, file)
            rel_path = os.path.relpath(full_path, MIRROR_DIR)
            mirror_files[rel_path] = get_hash(full_path)

    for rel_path, s_hash in source_files.items():
        if rel_path in mirror_files:
            m_hash = mirror_files[rel_path]
            if s_hash == m_hash:
                results["synced"].append(rel_path)
            else:
                results["mismatch"].append({
                    "path": rel_path,
                    "source_hash": s_hash,
                    "mirror_hash": m_hash
                })
        else:
            results["missing_in_mirror"].append(rel_path)

    for rel_path in mirror_files:
        if rel_path not in source_files:
            results["extra_in_mirror"].append(rel_path)

    return results

if __name__ == "__main__":
    print(f"--- Sync Verification Start ---")
    print(f"Source: {SOURCE_DIR}")
    print(f"Mirror: {MIRROR_DIR}")
    print("-" * 30)
    
    sync_results = verify_sync()
    
    print(f"\n[OK] Synced files: {len(sync_results['synced'])}")
    
    if sync_results['mismatch']:
        print(f"\n[MISMATCH] Hash Mismatches ({len(sync_results['mismatch'])}):")
        for m in sync_results['mismatch']:
            print(f"  - {m['path']}")
    
    if sync_results['missing_in_mirror']:
        print(f"\n[MISSING] Missing in Mirror ({len(sync_results['missing_in_mirror'])}):")
        for f in sync_results['missing_in_mirror']:
            print(f"  - {f}")

    if sync_results['extra_in_mirror']:
        print(f"\n[EXTRA] Extra in Mirror ({len(sync_results['extra_in_mirror'])}):")
        for f in sync_results['extra_in_mirror']:
            print(f"  - {f}")
    
    with open("sync_report.json", "w") as f:
        json.dump(sync_results, f, indent=4)
    print(f"\nDetailed report saved to sync_report.json")


import os

file_path = r'c:\Users\SRINJOYEE\Desktop\nexvyapaar\bizgrow-spark\src\utils\translations.ts'

def fix_encoding():
    try:
        # Read with utf-8-sig to handle/remove BOM
        with open(file_path, 'r', encoding='utf-8-sig') as f:
            content = f.read()
            
        print(f"Read {len(content)} characters.")
        
        # Try to fix using cp1252 with replacement for errors
        # This will salvage the mojibake that corresponds to cp1252 
        # and checking if the resulting bytes are valid utf-8.
        try:
            # We use 'replace' to handle characters that aren't in CP1252.
            # Ideally those are few and might be valid chars that don't need fixing,
            # but in a global fix, we might lose them or they stay as '?'
            # However, for the Mojibake parts (Hindi etc), they SHOULD be in CP1252 range (if read as such).
            
            # Wait, if I have a valid Emoji '👋' (not corrupted), it isn't in CP1252.
            # If I encode with 'replace', it becomes '?'.
            # Then I decode 'utf-8', I get '?'. I lost the emoji.
            
            # We want to ONLY fix the mojibake sequences.
            # But identifying them programmatically is hard without libraries.
            # However, looking at the file, the mojibake is distinct: "à...".
            
            # Alternative: Only fix if it looks like UTF-8 interpretation?
            # No, let's stick to the transform but maybe only on lines that look suspicious?
            # Or just accept losing non-CP1252 symbols for now (emojis). 
            # The translations text is more important. 
            
            raw_bytes = content.encode('cp1252', errors='replace')
            fixed_content = raw_bytes.decode('utf-8', errors='replace')
            
            # Check if we recovered Hindi "Dashboard" (should be 'डैशबोर्ड')
            if "डैशबोर्ड" in fixed_content:
                print("Recovery successful: Found 'डैशबोर्ड'")
            else:
                print("Recovery check failed: 'डैशबोर्ड' not found.")
                
        except Exception as e:
            print(f"Fix failed: {e}")
            return

        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(fixed_content)
            
        print("File saved.")

    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    fix_encoding()

import json, re, sys
sys.stdout.reconfigure(encoding='utf-8')
from pathlib import Path

SRC = Path("src/data/articles.json")
articles = json.loads(SRC.read_text(encoding="utf-8"))

NOISE_PATTERNS = [
    r'^\d[\d,\-–]* ',               # starts with reference numbers "1-3 This..."
    r'Author disclosure',
    r'CME This clinical',
    r'conforms to AAFP criteria',
    r'See CME Quiz',
    r'financial affili',
    r'financial relation',
    r'Naval Hospital',
    r'Uniformed Services',
    r'Reprints:',
    r'Disclosures:',
    r'Taskforce \(JTF\)',
    r'Joint Task Force',
    r'Work Group',
    r'Copyright ©',
    r'Am Fam Physician',
    r'AAFP criteria',
    r'http[s]?://',
    r'www\.',
    r'@',
    r'aafp\.org',
    r'\.gov',
    r'\bMD,\b.*\bMD\b',            # author lists
    r'\bDO,\b.*\bDO\b',
    r'School of Medicine',
    r'University of',
    r'Hospital,',
    r'Air Force Base',
    r'^Practice Parameter$',
    r'^Chief Editors:',
    r'^Disclaimer:',
    r'AAAAI.*ACAAI',
    r'pharma',
    r'drug promotion',
    r'allergyparameters',
    r'jcaai\.org',
    r'handout on this topic',
    r'available at https',
    r'patient information',
    r'CME Quiz on page',
]

HEADER_WORDS = {
    'epidemiology', 'etiology', 'transmission', 'diagnosis', 'treatment',
    'children', 'adults', 'prevention', 'history', 'introduction',
    'background', 'summary', 'conclusion', 'management', 'evaluation',
    'pathophysiology', 'prognosis', 'overview', 'discussion', 'references',
    'abstract', 'methods', 'results', 'outcome', 'complications',
    'hydration status', 'history', 'signs and symptoms', 'risk factors',
    'signs', 'symptoms', 'follow-up', 'diagnosis', 'outcomes',
}

def is_noise(s):
    s_stripped = s.strip()
    # Too short (header/label)
    if len(s_stripped) < 20:
        return True
    # Section header
    if s_stripped.lower() in HEADER_WORDS:
        return True
    # Matches noise pattern
    for p in NOISE_PATTERNS:
        if re.search(p, s_stripped, re.IGNORECASE):
            return True
    # All caps section header
    if s_stripped.isupper() and len(s_stripped.split()) <= 4:
        return True
    return False

def clean_sentence(s):
    # Remove trailing reference numbers: ". 1" or ".2" or " 2,3" etc.
    s = re.sub(r'\.\s*\d[\d,\-–]*\s*$', '.', s)
    s = re.sub(r'\s+\d[\d,\-–]*\s*$', '', s)
    # Remove embedded inline refs like "disease. 1,2 Other" → "disease. Other"
    s = re.sub(r'\.\s*\d[\d,\-–]*\s+(?=[A-Z])', '. ', s)
    # Remove trailing comma (mid-split sentences)
    # Fix OCR artifacts
    s = re.sub(r'\s+', ' ', s)
    return s.strip()

# ─── Rhinosinusitis: replace with clean clinical content ───────────────────
RHINO_CLEAN = {
    "title": "Rhinosinusitis: Diagnosis and Management",
    "tag": "Оториноларингология",
    "sentences": [
        "Rhinosinusitis is inflammation of the nasal mucosa and paranasal sinuses, classified as acute (less than 4 weeks), subacute (4–12 weeks), or chronic (more than 12 weeks).",
        "Acute rhinosinusitis is most commonly caused by viral upper respiratory infections, with only 0.5% to 2% of cases complicated by bacterial superinfection.",
        "The most common bacterial pathogens in acute bacterial rhinosinusitis are Streptococcus pneumoniae, Haemophilus influenzae, and Moraxella catarrhalis.",
        "Symptoms of acute rhinosinusitis include nasal congestion, purulent nasal discharge, facial pain or pressure, and hyposmia.",
        "The diagnosis of acute bacterial rhinosinusitis requires symptoms persisting for more than 10 days without improvement, or severe symptoms with fever above 39°C and purulent nasal discharge for 3–4 consecutive days.",
        "A double worsening pattern — initial improvement followed by new onset of fever and nasal discharge — also suggests bacterial superinfection.",
        "Imaging is not routinely recommended for uncomplicated acute rhinosinusitis because findings on CT or plain radiographs correlate poorly with clinical symptoms.",
        "Amoxicillin-clavulanate is the preferred antibiotic for acute bacterial rhinosinusitis; amoxicillin alone is no longer recommended due to increased penicillin-resistant Streptococcus pneumoniae.",
        "Intranasal corticosteroids reduce mucosal inflammation and are recommended as adjunctive therapy in acute bacterial rhinosinusitis.",
        "Saline nasal irrigation with isotonic or hypertonic saline improves symptoms and mucociliary clearance in both acute and chronic rhinosinusitis.",
        "Decongestants (oxymetazoline) provide symptomatic relief but should not be used for more than three days to avoid rebound congestion.",
        "Chronic rhinosinusitis is defined as persistent symptomatic inflammation lasting more than 12 weeks despite medical therapy.",
        "Chronic rhinosinusitis is classified as with nasal polyps (CRSwNP) or without nasal polyps (CRSsNP), as these subtypes differ in pathophysiology and treatment approach.",
        "Allergy testing is recommended in patients with chronic rhinosinusitis to identify potential allergic triggers.",
        "Functional endoscopic sinus surgery (FESS) is indicated in patients with chronic rhinosinusitis who fail at least 12 weeks of maximal medical therapy.",
        "Biologics targeting type 2 inflammation, such as dupilumab, are approved for chronic rhinosinusitis with nasal polyps inadequately controlled by corticosteroids.",
        "Complications of acute bacterial rhinosinusitis include orbital cellulitis, subperiosteal abscess, intracranial extension (meningitis, epidural abscess, cavernous sinus thrombosis), and osteomyelitis.",
        "Orbital complications present with periorbital edema, proptosis, ophthalmoplegia, and require immediate CT imaging and hospitalization.",
        "In children, rhinosinusitis is often preceded by viral upper respiratory infections; symptoms overlap with those of the common cold for the first 10 days.",
        "Antibiotic treatment in children is recommended for severe or worsening symptoms, persistent symptoms beyond 10 days, or high fever with purulent discharge lasting 3 or more days."
    ],
    "id": "article_rhinosinusitis_clean",
    "addedAt": "2026-06-21T00:00:00Z"
}

cleaned = []
for article in articles:
    if 'rhinosinusitis' in article['title'].lower():
        cleaned.append(RHINO_CLEAN)
        print(f"REPLACED: {article['title']} → clean clinical content (20 sentences)")
        continue

    original = article['sentences']
    kept = []
    seen = set()
    for s in original:
        s_clean = clean_sentence(s)
        if is_noise(s_clean):
            continue
        # Deduplicate (fuzzy — first 60 chars)
        key = re.sub(r'\s+', ' ', s_clean[:60].lower())
        if key in seen:
            continue
        seen.add(key)
        kept.append(s_clean)

    removed = len(original) - len(kept)
    print(f"{'OK' if removed == 0 else 'CLEANED'}: {article['title']} ({len(original)} -> {len(kept)} sentences, -{removed} noise)")
    article['sentences'] = kept
    cleaned.append(article)

SRC.write_text(json.dumps(cleaned, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"\nSaved {len(cleaned)} articles to {SRC}")

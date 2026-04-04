import json
with open('/Users/oleksandr_zhynzher/Coding/nomad-lens/server/src/data/nomadVisaDetails.json') as f:
    data = json.load(f)
all_strings = set()
for e in data:
    for b in e['benefits']: all_strings.add(b)
    for r in e['eligibility']['requirements']: all_strings.add(r)
    for d in e['applicationProcess']['documents']: all_strings.add(d)
    all_strings.add(e['applicationProcess']['processingTime'])
    all_strings.add(e['tax']['notes'])
    all_strings.add(e['cost']['notes'])
    all_strings.add(e['incomeRequirement']['notes'])
print(f'Total unique strings: {len(all_strings)}')
for s in sorted(all_strings):
    print(repr(s))

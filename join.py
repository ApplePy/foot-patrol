#! /usr/bin/python3
import sys, json, os

reports = []

for arg in sys.argv[1:]:
    with open(arg) as file:
        reports.extend(json.loads(file.read()))

print('[', end='')
for item in reports[:-1]:
    print(json.dumps(item) + ',')
print(json.dumps(reports[-1]) + "]")

[os.remove(x) for x in sys.argv[1:]]

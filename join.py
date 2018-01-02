#! /usr/bin/python3
import sys, json, os


def addBasePath(reports, basePath):
    for report in reports:
        # Only get reports from files
        if 'location' not in report:
            continue

        report['location']['path'] = os.path.join(basePath, report['location']['path'])


def ReadReports(filenames: list):
    '''Read in all reports'''
    reports = []

    for arg in filenames:
        with open(arg) as file:
            # Load json
            fileReports = json.loads(file.read())

            # Update locations to contain full path
            if arg == "backend.json":
                addBasePath(fileReports, 'src/backend')
            elif arg == "frontend.json":
                addBasePath(fileReports, 'src/dispatch-website')

            reports.extend(fileReports)
    
    return reports


def WriteReports(filename: str, reports: list):
    '''Write out combined json'''
    with open(filename, mode='w') as output:
        print('[', end='', file=output)
        for item in reports[:-1]:
            print(json.dumps(item) + ',', file=output)
        print(json.dumps(reports[-1]) + "]", file=output)


def ConstructErrorString(report: object):
    '''Construct error string for report entry'''
    line_begin = report['location']['lines']['begin'] if 'lines' in report['location'] else report['location']['positions']['begin']['line']
    line_end = report['location']['lines']['end'] if 'lines' in report['location'] else report['location']['positions']['end']['line']
    message = report['description']
    engine = report['engine_name']

    if line_begin == line_end:
        line_string = "{0}".format(line_begin)
    else:
        line_string = "{0}-{1}".format(line_begin, line_end)
    
    return "{0}: {1} [{2}]".format(line_string, message, engine)


def CollectErrors(reports: list):
    files = {}
    for report in reports:
        # Skip non-file reports
        if 'location' not in report:
            continue

        # Get file from report
        file = report['location']['path']

        # Create issue string
        issue_string = ConstructErrorString(report)

        if file in files:
            files[file].append(issue_string)
        else:
            files[file] = [issue_string]
    return files


def PrintReportStrings(reports_dict: dict):
    for file, string_list in reports_dict.items():
        string_list.sort()  # Sort in order of beginning line

        # Print errors
        print("== {0} ({1} issue{2}) ==".format(file, len(string_list), 's' if len(string_list) > 1 else ''))
        for error in string_list:
            print(error)

        print("")   # Need a new line


def main(argv):
    reports = ReadReports(argv[1:-1])
    WriteReports(argv[-1], reports)
    file_lists = CollectErrors(reports)
    PrintReportStrings(file_lists)

    # Clear out source files
    [os.remove(x) for x in argv[1:-1]]


if __name__ == "__main__":
    main(sys.argv)

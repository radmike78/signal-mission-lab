"""Versioned formative exercise for restoring a hosted training service."""
ID = 'mission-report-v1'
TITLE = 'Mission Command: Restore access to a staff report'
LESSON = {
    'title': TITLE,
    'context': 'A staff workstation can reach other services, but it cannot open a hosted report by name.',
    'equipment': [
        'Tactical Services Infrastructure (TSI) is the documented Army hosting context. The exercise provides simulated evidence and requires no fielded TSI.',
        'An authorized training workstation, a known-good comparison workstation, the supplied name-resolution baseline, and an instructor-provided report service and sample report.',
    ],
    'setup': [
        'In the training environment, confirm the instructor’s expected report hostname and current sample report.',
        'Use the comparison workstation to verify name lookup and open the sample report before starting the fault exercise.',
        'Use the exercise evidence to diagnose the affected client. A lab owner makes any authorized correction.',
    ],
    'objective': 'Check name resolution and service reachability separately. Prove recovery by opening the current report from the affected workstation.',
    'lesson': (
        'A responding port confirms reachability by address. To verify recovery, open the current report by name from the affected workstation.'
    ),
    'scenario': [
        'Affected workstation: The report’s DNS lookup times out. The endpoint port responds by IP address.',
        'Known-good workstation: The report name resolves and the current report opens.',
        'Use the supplied baseline and simulated evidence. No real system changes are required.',
    ],
    'sources': [
        {'title': 'Army CECOM: Modernizing tactical infrastructure', 'url': 'https://www.army.mil/article/288657/modernizing_tactical_infrastructure'},
        {'title': 'Microsoft Learn: Troubleshoot DNS client name resolution issues', 'url': 'https://learn.microsoft.com/en-us/troubleshoot/windows-client/networking/troubleshoot-dns-client-resolution-issues'},
    ],
}
QUESTIONS = [
    (
        'evidence', 'Which read-only check gives you the best next evidence?',
        ['Compare the affected client’s resolver and DNS result with the lab baseline and working peer.',
         'Restart the shared report service for all users.', 'Reset the exercise gateway before collecting evidence.'],
        0, 'Compare name resolution and resolver settings before changing a shared service. The working peer narrows the investigation.',
    ),
    (
        'isolate', 'The client’s resolver differs from the lab baseline. What should happen next?',
        ['Treat a responding endpoint port as proof the problem is resolved.',
         'Ask the authorized lab owner to restore the client’s expected resolver setting.', 'Change the shared report service address.'],
        1, 'The observed mismatch supports a scoped correction through the lab owner. The shared service works for the comparison client.',
    ),
    (
        'verify', 'After the lab owner restores the expected setting, what proves the staff task works?',
        ['The workstation shows physical link.', 'The instructor can reach the endpoint from another workstation.',
         'The affected user opens the report by its usual hostname and confirms it is current and readable.'],
        2, 'Repeat the original staff task from the affected workstation. Confirm both access and the expected report content.',
    ),
]


def public_lesson():
    return {
        **LESSON,
        'questions': [{'id': key, 'prompt': prompt, 'options': options}
                      for key, prompt, options, _, _ in QUESTIONS],
    }


def grade(answers):
    if set(answers) != {item[0] for item in QUESTIONS}:
        raise ValueError('Answer all course questions')
    review = []
    for key, prompt, options, correct, note in QUESTIONS:
        choice = answers[key]
        if type(choice) is not int or not 0 <= choice < len(options):
            raise ValueError('Use supplied course choices')
        review.append({'id': key, 'supported': choice == correct, 'explanation': note})
    return {'score': sum(item['supported'] for item in review), 'total': len(review), 'review': review}
